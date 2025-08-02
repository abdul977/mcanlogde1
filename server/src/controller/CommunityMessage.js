import CommunityMessage from "../models/CommunityMessage.js";
import CommunityMember from "../models/CommunityMember.js";
import ChatCommunity from "../models/ChatCommunity.js";
import ModerationLog from "../models/ModerationLog.js";
import supabaseStorage from "../services/supabaseStorage.js";
import antiSpamService from "../services/antiSpamService.js";
import communitySocketService from "../services/communitySocketService.js";

// Send message to community
export const sendMessageController = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { content, messageType = "text", replyTo = null } = req.body;
    const userId = req.user._id;

    // Validate content - allow empty content for image messages with attachments
    if ((!content || content.trim().length === 0) && messageType === 'text') {
      return res.status(400).json({
        success: false,
        message: "Message content is required for text messages"
      });
    }

    // For image messages, content is optional but we need attachments
    if (messageType === 'image' && (!req.files || !req.files.attachments)) {
      return res.status(400).json({
        success: false,
        message: "Image attachment is required for image messages"
      });
    }

    // Check if user is a member of the community
    const member = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      status: 'active'
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this community"
      });
    }

    // Check if member is muted
    if (member.isMuted()) {
      return res.status(403).json({
        success: false,
        message: "You are muted in this community"
      });
    }

    // Get community for rate limiting
    const community = await ChatCommunity.findById(communityId);
    if (!community || community.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: "Community not found or not approved"
      });
    }

    // Check rate limiting
    if (community.settings.messageRateLimit.enabled) {
      const rateLimitSeconds = community.settings.messageRateLimit.seconds;
      const lastMessage = await CommunityMessage.findOne({
        community: communityId,
        sender: userId,
        isDeleted: false
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        const timeDiff = (Date.now() - lastMessage.createdAt.getTime()) / 1000;
        if (timeDiff < rateLimitSeconds) {
          return res.status(429).json({
            success: false,
            message: `Please wait ${Math.ceil(rateLimitSeconds - timeDiff)} seconds before sending another message`,
            retryAfter: Math.ceil(rateLimitSeconds - timeDiff)
          });
        }
      }
    }

    // Handle file attachments (express-fileupload format)
    let attachments = [];
    if (req.files && req.files.attachments) {
      const fileList = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (const file of fileList) {
        try {
          const result = await supabaseStorage.uploadFromTempFile(
            file,
            'mcan-community-messages',
            'attachments'
          );

          if (result.success) {
            attachments.push({
              filename: file.name,
              url: result.data.secure_url,
              fileType: file.mimetype.startsWith('image/') ? 'image' : 'document',
              fileSize: file.size,
              mimeType: file.mimetype
            });
          }
        } catch (uploadError) {
          console.error("Error uploading attachment:", uploadError);
        }
      }
    }

    // Validate reply message if provided
    if (replyTo) {
      const replyMessage = await CommunityMessage.findOne({
        _id: replyTo,
        community: communityId,
        isDeleted: false
      });

      if (!replyMessage) {
        return res.status(400).json({
          success: false,
          message: "Reply message not found"
        });
      }
    }

    // Create new message
    const newMessage = new CommunityMessage({
      community: communityId,
      sender: userId,
      content: content ? content.trim() : '', // Allow empty content for image messages
      messageType,
      attachments,
      replyTo,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        platform: req.get('X-Platform') || 'web'
      }
    });

    await newMessage.save();

    // Check for spam
    const spamResult = await antiSpamService.detectSpam(newMessage, userId, communityId);
    if (spamResult.isSpam) {
      await antiSpamService.handleSpamDetection(newMessage, spamResult, userId, communityId);

      // Notify moderators about spam
      communitySocketService.emitSpamAlert(
        communityId,
        newMessage._id,
        userId,
        spamResult.spamScore,
        spamResult.reasons
      );
    }

    // Update community last activity and message count
    await ChatCommunity.findByIdAndUpdate(communityId, {
      lastActivity: new Date(),
      $inc: { messageCount: 1 }
    });

    // Update member message count and last seen
    await member.incrementMessageCount();
    await member.updateLastSeen();

    // Populate message for response
    const populatedMessage = await CommunityMessage.findById(newMessage._id)
      .populate('sender', 'name email role')
      .populate('replyTo', 'content sender createdAt');

    // Emit socket event for real-time updates
    communitySocketService.emitNewMessage(communityId, populatedMessage);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message
    });
  }
};

// Get community messages
export const getCommunityMessagesController = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { 
      page = 1, 
      limit = 50, 
      before = null, 
      after = null 
    } = req.query;

    const userId = req.user._id;

    // Check if user is a member of the community
    const member = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      status: 'active'
    });

    if (!member && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this community"
      });
    }

    let query = { 
      community: communityId, 
      isDeleted: false 
    };

    // Handle cursor-based pagination
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    } else if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    const messages = await CommunityMessage.find(query)
      .populate('sender', 'name email role')
      .populate('replyTo', 'content sender createdAt')
      .sort({ createdAt: before ? -1 : 1 })
      .limit(parseInt(limit));

    // If using before cursor, reverse the order to maintain chronological order
    if (before) {
      messages.reverse();
    }

    const total = await CommunityMessage.getCommunityMessageCount(communityId);

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      messages,
      pagination: {
        total,
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message
    });
  }
};

// Delete message (sender/moderator/admin)
export const deleteMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason = "Message deleted" } = req.body;
    const userId = req.user._id;

    // Find the message
    const message = await CommunityMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Message is already deleted"
      });
    }

    // Get community for permission checking
    const community = await ChatCommunity.findById(message.community);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user can delete this message
    if (!message.canDelete(userId, req.user.role, community)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this message"
      });
    }

    // Delete the message
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;
    message.deletionReason = reason;

    await message.save();

    // Log the deletion
    await ModerationLog.logAction({
      community: message.community,
      moderator: userId,
      target: { 
        user: message.sender,
        message: messageId 
      },
      action: "delete_message",
      reason,
      details: {
        messageContent: message.content,
        messageType: message.messageType
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    // Emit socket event for real-time updates
    communitySocketService.emitMessageDeleted(communityId, messageId, userId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message
    });
  }
};

// Pin/Unpin message (moderator/creator/admin)
export const togglePinMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { pin = true } = req.body;
    const userId = req.user._id;

    // Find the message
    const message = await CommunityMessage.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user has permission to pin messages
    const member = await CommunityMember.findOne({
      community: message.community,
      user: userId,
      status: 'active'
    });

    const community = await ChatCommunity.findById(message.community);
    const isCreator = community.isCreator(userId);
    const isModerator = member && member.role === 'moderator' && member.permissions.canPinMessages;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to pin/unpin messages"
      });
    }

    // Update message pin status (this would require adding a pinned field to the schema)
    // For now, we'll log the action
    await ModerationLog.logAction({
      community: message.community,
      moderator: userId,
      target: { message: messageId },
      action: pin ? "pin_message" : "unpin_message",
      reason: pin ? "Message pinned" : "Message unpinned",
      details: {
        messageContent: message.content.substring(0, 100)
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "low"
      }
    });

    res.status(200).json({
      success: true,
      message: pin ? "Message pinned successfully" : "Message unpinned successfully"
    });
  } catch (error) {
    console.error("Error toggling pin message:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling pin message",
      error: error.message
    });
  }
};

export default {
  sendMessageController,
  getCommunityMessagesController,
  deleteMessageController,
  togglePinMessageController
};

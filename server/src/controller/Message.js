import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { socketUtils } from "../config/socket.js";
import supabaseStorage from "../services/supabaseStorage.js";

// Send a new message
export const sendMessageController = async (req, res) => {
  try {
    console.log('📨 Message send request received');
    console.log('📤 Request body:', req.body);
    console.log('📁 Request files:', req.files);
    console.log('📋 Content-Type:', req.headers['content-type']);

    const { recipientId, content, priority = 'normal', messageType = 'text', caption } = req.body;
    const senderId = req.user._id || req.user.id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required"
      });
    }

    // For text messages, content is required
    if (messageType === 'text' && !content) {
      return res.status(400).json({
        success: false,
        message: "Content is required for text messages"
      });
    }

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found"
      });
    }

    // Generate thread ID
    const threadId = Message.generateThreadId(senderId, recipientId);

    // Handle image upload if it's an image message
    let attachments = [];
    let messageContent = content;

    console.log('🖼️ Checking for image upload:', { messageType, hasFiles: !!req.files, hasImage: !!req.files?.image });

    if (messageType === 'image' && req.files?.image) {
      console.log('📁 Image file details:', req.files.image);
      try {
        const result = await supabaseStorage.uploadFromTempFile(
          req.files.image,
          'mcan-messages',
          'images'
        );

        if (result.success) {
          attachments.push({
            filename: req.files.image.name,
            url: result.data.secure_url,
            fileType: req.files.image.mimetype,
            fileSize: req.files.image.size
          });

          // For image messages, use caption as content or default text
          messageContent = caption || 'Image';
        } else {
          throw new Error(result.error);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Error uploading image"
        });
      }
    } else if (messageType === 'image' && !req.files?.image) {
      console.error('❌ Image message requested but no image file received');
      return res.status(400).json({
        success: false,
        message: "No image file received. Please select an image to send."
      });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content: messageContent?.trim() || (messageType === 'image' ? 'Image' : ''),
      threadId,
      priority,
      messageType,
      attachments
    });

    await message.save();

    // Populate sender and recipient info
    await message.populate([
      { path: 'sender', select: 'name email role' },
      { path: 'recipient', select: 'name email role' }
    ]);

    // Emit real-time message to thread participants
    await socketUtils.emitNewMessage(threadId, message, senderId);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
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

// Get conversation between two users
export const getConversationController = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Validate the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const skip = (page - 1) * limit;

    // Get conversation messages
    const messages = await Message.getConversation(
      currentUserId,
      userId,
      { limit: parseInt(limit), skip, sort: { createdAt: 1 } }
    );

    // Mark messages as read for current user
    const threadId = Message.generateThreadId(currentUserId, userId);
    await Message.markAsRead(threadId, currentUserId);

    // Get total count for pagination
    const total = await Message.countDocuments({ threadId });

    res.status(200).json({
      success: true,
      messages,
      otherUser: {
        _id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role
      },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: messages.length,
        totalMessages: total
      }
    });

  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching conversation",
      error: error.message
    });
  }
};

// Get user's conversations list
export const getUserConversationsController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const conversations = await Message.getUserConversations(userId);

    // Process conversations to get the other participant info
    const processedConversations = conversations.map(conv => {
      const lastMessage = conv.lastMessage;
      const isCurrentUserSender = lastMessage.sender.toString() === userId.toString();
      
      // Get the other participant
      const otherParticipant = isCurrentUserSender 
        ? conv.recipientInfo[0] 
        : conv.senderInfo[0];

      return {
        threadId: conv._id,
        otherUser: {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          email: otherParticipant.email,
          role: otherParticipant.role
        },
        lastMessage: {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isFromCurrentUser: isCurrentUserSender,
          messageType: lastMessage.messageType,
          priority: lastMessage.priority
        },
        unreadCount: conv.unreadCount
      };
    });

    res.status(200).json({
      success: true,
      conversations: processedConversations
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching conversations",
      error: error.message
    });
  }
};

// Get unread message count
export const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const unreadCount = await Message.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: error.message
    });
  }
};

// Mark messages as read
export const markMessagesAsReadController = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    const threadId = Message.generateThreadId(currentUserId, userId);
    const result = await Message.markAsRead(threadId, currentUserId);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message
    });
  }
};

// Get admin users for regular users to contact
export const getAdminUsersController = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;

    // Get all admin users excluding current user
    const admins = await User.find({
      role: 'admin',
      _id: { $ne: currentUserId }
    })
      .select('name email role createdAt')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      users: admins
    });

  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin users",
      error: error.message
    });
  }
};

// Get all users for admin messaging (admin only)
export const getAllUsersForMessagingController = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user._id || req.user.id;

    const filter = { _id: { $ne: currentUserId } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('name email role createdAt')
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    // Get unread message counts for each user
    const usersWithUnreadCounts = await Promise.all(
      users.map(async (user) => {
        const threadId = Message.generateThreadId(currentUserId, user._id);
        const unreadCount = await Message.countDocuments({
          threadId,
          recipient: currentUserId,
          isRead: false
        });

        return {
          ...user.toObject(),
          unreadCount
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithUnreadCounts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: users.length,
        totalUsers: total
      }
    });

  } catch (error) {
    console.error("Error fetching users for messaging:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

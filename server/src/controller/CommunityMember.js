import CommunityMember from "../models/CommunityMember.js";
import ChatCommunity from "../models/ChatCommunity.js";
import ModerationLog from "../models/ModerationLog.js";

// Join community
export const joinCommunityController = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user._id;

    // Check if community exists and is approved
    const community = await ChatCommunity.findOne({
      _id: communityId,
      status: "approved"
    });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found or not approved"
      });
    }

    // Check if user is already a member
    const existingMember = await CommunityMember.findOne({
      community: communityId,
      user: userId
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        return res.status(400).json({
          success: false,
          message: "You are already a member of this community"
        });
      } else if (existingMember.status === 'banned') {
        return res.status(403).json({
          success: false,
          message: "You are banned from this community"
        });
      } else if (existingMember.status === 'kicked') {
        // Allow rejoining if kicked (not banned)
        existingMember.status = 'active';
        existingMember.joinedAt = new Date();
        await existingMember.save();
        
        // Update community member count
        await ChatCommunity.findByIdAndUpdate(communityId, {
          $inc: { memberCount: 1 }
        });

        return res.status(200).json({
          success: true,
          message: "Successfully rejoined community",
          member: existingMember
        });
      }
    }

    // Check if community has reached max members
    if (community.memberCount >= community.settings.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Community has reached maximum member limit"
      });
    }

    // Create new member
    const newMember = new CommunityMember({
      community: communityId,
      user: userId,
      role: "member",
      status: community.settings.requireApproval ? "pending" : "active"
    });

    await newMember.save();

    // Update community member count if approved immediately
    if (!community.settings.requireApproval) {
      await ChatCommunity.findByIdAndUpdate(communityId, {
        $inc: { memberCount: 1 },
        lastActivity: new Date()
      });
    }

    // Log the join action
    await ModerationLog.logAction({
      community: communityId,
      moderator: userId,
      action: "update_settings",
      reason: "User joined community",
      details: {
        newValue: {
          userId,
          status: newMember.status,
          requiresApproval: community.settings.requireApproval
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "low"
      }
    });

    res.status(201).json({
      success: true,
      message: community.settings.requireApproval 
        ? "Join request sent, waiting for approval" 
        : "Successfully joined community",
      member: newMember
    });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({
      success: false,
      message: "Error joining community",
      error: error.message
    });
  }
};

// Leave community
export const leaveCommunityController = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user._id;

    // Check if user is a member
    const member = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      status: 'active'
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this community"
      });
    }

    // Check if user is the creator
    if (member.role === 'creator') {
      return res.status(400).json({
        success: false,
        message: "Community creator cannot leave. Transfer ownership or delete the community."
      });
    }

    // Update member status
    member.status = 'left';
    await member.save();

    // Update community member count
    await ChatCommunity.findByIdAndUpdate(communityId, {
      $inc: { memberCount: -1 },
      lastActivity: new Date()
    });

    // Log the leave action
    await ModerationLog.logAction({
      community: communityId,
      moderator: userId,
      action: "update_settings",
      reason: "User left community",
      details: {
        previousValue: { status: 'active' },
        newValue: { status: 'left' }
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
      message: "Successfully left community"
    });
  } catch (error) {
    console.error("Error leaving community:", error);
    res.status(500).json({
      success: false,
      message: "Error leaving community",
      error: error.message
    });
  }
};

// Get community members
export const getCommunityMembersController = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { 
      page = 1, 
      limit = 50, 
      role = null, 
      status = 'active',
      search = null 
    } = req.query;

    // Check if user has permission to view members
    const userId = req.user._id;
    const userMember = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      status: 'active'
    });

    if (!userMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view community members"
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { community: communityId, status };
    if (role) query.role = role;

    let members = await CommunityMember.find(query)
      .populate('user', 'name email role gender stateCode batch')
      .populate('invitedBy', 'name')
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by search if provided
    if (search) {
      members = members.filter(member => 
        member.user.name.toLowerCase().includes(search.toLowerCase()) ||
        member.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await CommunityMember.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Community members retrieved successfully",
      members,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching community members",
      error: error.message
    });
  }
};

// Add moderator (creator/admin only)
export const addModeratorController = async (req, res) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const { permissions = {} } = req.body;
    const moderatorId = req.user._id;

    // Check if community exists
    const community = await ChatCommunity.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check permissions
    const isCreator = community.isCreator(moderatorId);
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only community creator or admin can add moderators"
      });
    }

    // Check if target user is a member
    const targetMember = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId,
      status: 'active'
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this community"
      });
    }

    if (targetMember.role === 'creator') {
      return res.status(400).json({
        success: false,
        message: "Cannot modify creator role"
      });
    }

    // Update member role and permissions
    targetMember.role = 'moderator';
    targetMember.permissions = {
      canKickMembers: permissions.canKickMembers !== false,
      canBanMembers: permissions.canBanMembers !== false,
      canDeleteMessages: permissions.canDeleteMessages !== false,
      canManageRules: permissions.canManageRules !== false,
      canInviteMembers: permissions.canInviteMembers !== false,
      canPinMessages: permissions.canPinMessages !== false
    };

    await targetMember.save();

    // Add to community moderators list
    await community.addModerator(targetUserId, moderatorId, targetMember.permissions);

    // Log the action
    await ModerationLog.logAction({
      community: communityId,
      moderator: moderatorId,
      target: { user: targetUserId },
      action: "add_moderator",
      reason: "User promoted to moderator",
      details: {
        permissions: targetMember.permissions
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    res.status(200).json({
      success: true,
      message: "Moderator added successfully",
      member: targetMember
    });
  } catch (error) {
    console.error("Error adding moderator:", error);
    res.status(500).json({
      success: false,
      message: "Error adding moderator",
      error: error.message
    });
  }
};

// Remove moderator (creator/admin only)
export const removeModeratorController = async (req, res) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const moderatorId = req.user._id;

    // Check if community exists
    const community = await ChatCommunity.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check permissions
    const isCreator = community.isCreator(moderatorId);
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only community creator or admin can remove moderators"
      });
    }

    // Check if target user is a moderator
    const targetMember = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId,
      status: 'active'
    });

    if (!targetMember || targetMember.role !== 'moderator') {
      return res.status(404).json({
        success: false,
        message: "User is not a moderator of this community"
      });
    }

    // Update member role and permissions
    targetMember.role = 'member';
    targetMember.permissions = {
      canKickMembers: false,
      canBanMembers: false,
      canDeleteMessages: false,
      canManageRules: false,
      canInviteMembers: false,
      canPinMessages: false
    };

    await targetMember.save();

    // Remove from community moderators list
    await community.removeModerator(targetUserId);

    // Log the action
    await ModerationLog.logAction({
      community: communityId,
      moderator: moderatorId,
      target: { user: targetUserId },
      action: "remove_moderator",
      reason: "User demoted from moderator",
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    res.status(200).json({
      success: true,
      message: "Moderator removed successfully",
      member: targetMember
    });
  } catch (error) {
    console.error("Error removing moderator:", error);
    res.status(500).json({
      success: false,
      message: "Error removing moderator",
      error: error.message
    });
  }
};

// Kick member (moderator/creator/admin)
export const kickMemberController = async (req, res) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const { reason = "No reason provided" } = req.body;
    const moderatorId = req.user._id;

    // Check if community exists
    const community = await ChatCommunity.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check moderator permissions
    const moderatorMember = await CommunityMember.findOne({
      community: communityId,
      user: moderatorId,
      status: 'active'
    });

    const isCreator = community.isCreator(moderatorId);
    const isModerator = moderatorMember && moderatorMember.role === 'moderator' && moderatorMember.permissions.canKickMembers;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to kick members"
      });
    }

    // Check if target user is a member
    const targetMember = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId,
      status: 'active'
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this community"
      });
    }

    // Cannot kick creator or higher-level moderators
    if (targetMember.role === 'creator') {
      return res.status(400).json({
        success: false,
        message: "Cannot kick community creator"
      });
    }

    if (targetMember.role === 'moderator' && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only creator or admin can kick moderators"
      });
    }

    // Add moderation action and update status
    await targetMember.addModerationAction('kicked', moderatorId, reason);

    // Update community member count
    await ChatCommunity.findByIdAndUpdate(communityId, {
      $inc: { memberCount: -1 },
      lastActivity: new Date()
    });

    // Log the action
    await ModerationLog.logAction({
      community: communityId,
      moderator: moderatorId,
      target: { user: targetUserId },
      action: "kick_member",
      reason,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    res.status(200).json({
      success: true,
      message: "Member kicked successfully"
    });
  } catch (error) {
    console.error("Error kicking member:", error);
    res.status(500).json({
      success: false,
      message: "Error kicking member",
      error: error.message
    });
  }
};

// Ban member (moderator/creator/admin)
export const banMemberController = async (req, res) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const { reason = "No reason provided", duration = null } = req.body;
    const moderatorId = req.user._id;

    // Check if community exists
    const community = await ChatCommunity.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check moderator permissions
    const moderatorMember = await CommunityMember.findOne({
      community: communityId,
      user: moderatorId,
      status: 'active'
    });

    const isCreator = community.isCreator(moderatorId);
    const isModerator = moderatorMember && moderatorMember.role === 'moderator' && moderatorMember.permissions.canBanMembers;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to ban members"
      });
    }

    // Check if target user is a member
    const targetMember = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this community"
      });
    }

    // Cannot ban creator or higher-level moderators
    if (targetMember.role === 'creator') {
      return res.status(400).json({
        success: false,
        message: "Cannot ban community creator"
      });
    }

    if (targetMember.role === 'moderator' && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only creator or admin can ban moderators"
      });
    }

    // Add moderation action and update status
    await targetMember.addModerationAction('banned', moderatorId, reason, duration);

    // Update community member count if was active
    if (targetMember.status === 'active') {
      await ChatCommunity.findByIdAndUpdate(communityId, {
        $inc: { memberCount: -1 },
        lastActivity: new Date()
      });
    }

    // Log the action
    await ModerationLog.logAction({
      community: communityId,
      moderator: moderatorId,
      target: { user: targetUserId },
      action: "ban_member",
      reason,
      details: {
        duration,
        expiresAt: duration ? new Date(Date.now() + (duration * 60 * 1000)) : null
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "high"
      }
    });

    res.status(200).json({
      success: true,
      message: duration ? `Member banned for ${duration} minutes` : "Member banned permanently"
    });
  } catch (error) {
    console.error("Error banning member:", error);
    res.status(500).json({
      success: false,
      message: "Error banning member",
      error: error.message
    });
  }
};

// Unban member (moderator/creator/admin)
export const unbanMemberController = async (req, res) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const { reason = "Ban lifted" } = req.body;
    const moderatorId = req.user._id;

    // Check if community exists
    const community = await ChatCommunity.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check moderator permissions
    const moderatorMember = await CommunityMember.findOne({
      community: communityId,
      user: moderatorId,
      status: 'active'
    });

    const isCreator = community.isCreator(moderatorId);
    const isModerator = moderatorMember && moderatorMember.role === 'moderator' && moderatorMember.permissions.canBanMembers;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to unban members"
      });
    }

    // Check if target user is banned
    const targetMember = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId,
      status: 'banned'
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "User is not banned from this community"
      });
    }

    // Add moderation action and update status
    await targetMember.addModerationAction('unbanned', moderatorId, reason);

    // Log the action
    await ModerationLog.logAction({
      community: communityId,
      moderator: moderatorId,
      target: { user: targetUserId },
      action: "unban_member",
      reason,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    res.status(200).json({
      success: true,
      message: "Member unbanned successfully"
    });
  } catch (error) {
    console.error("Error unbanning member:", error);
    res.status(500).json({
      success: false,
      message: "Error unbanning member",
      error: error.message
    });
  }
};

// Mute member (moderator/creator/admin)
export const muteMemberController = async (req, res) => {
  try {
    const { communityId, userId: targetUserId } = req.params;
    const { reason = "No reason provided", duration = 60 } = req.body; // Default 60 minutes
    const moderatorId = req.user._id;

    // Check if community exists
    const community = await ChatCommunity.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check moderator permissions
    const moderatorMember = await CommunityMember.findOne({
      community: communityId,
      user: moderatorId,
      status: 'active'
    });

    const isCreator = community.isCreator(moderatorId);
    const isModerator = moderatorMember && moderatorMember.role === 'moderator';
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isModerator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to mute members"
      });
    }

    // Check if target user is a member
    const targetMember = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId,
      status: 'active'
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this community"
      });
    }

    // Cannot mute creator or higher-level moderators
    if (targetMember.role === 'creator') {
      return res.status(400).json({
        success: false,
        message: "Cannot mute community creator"
      });
    }

    if (targetMember.role === 'moderator' && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only creator or admin can mute moderators"
      });
    }

    // Set mute until time
    targetMember.settings.muteUntil = new Date(Date.now() + (duration * 60 * 1000));
    await targetMember.save();

    // Add moderation action
    await targetMember.addModerationAction('muted', moderatorId, reason, duration);

    // Log the action
    await ModerationLog.logAction({
      community: communityId,
      moderator: moderatorId,
      target: { user: targetUserId },
      action: "mute_member",
      reason,
      details: {
        duration,
        expiresAt: targetMember.settings.muteUntil
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: req.get('X-Platform') || 'web',
        severity: "medium"
      }
    });

    res.status(200).json({
      success: true,
      message: `Member muted for ${duration} minutes`
    });
  } catch (error) {
    console.error("Error muting member:", error);
    res.status(500).json({
      success: false,
      message: "Error muting member",
      error: error.message
    });
  }
};

export default {
  joinCommunityController,
  leaveCommunityController,
  getCommunityMembersController,
  addModeratorController,
  removeModeratorController,
  kickMemberController,
  banMemberController,
  unbanMemberController,
  muteMemberController
};

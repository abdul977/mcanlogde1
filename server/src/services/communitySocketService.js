import { getIO } from '../config/socket.js';

class CommunitySocketService {
  constructor() {
    this.io = null;
  }

  initialize() {
    this.io = getIO();
  }

  // Emit new message to community members
  emitNewMessage(communityId, message) {
    if (!this.io) return;
    
    this.io.to(`community_${communityId}`).emit('new_community_message', {
      communityId,
      message,
      timestamp: new Date()
    });
  }

  // Emit message deletion to community members
  emitMessageDeleted(communityId, messageId, deletedBy) {
    if (!this.io) return;
    
    this.io.to(`community_${communityId}`).emit('community_message_deleted', {
      communityId,
      messageId,
      deletedBy,
      timestamp: new Date()
    });
  }

  // Emit message pinned/unpinned
  emitMessagePinned(communityId, messageId, pinnedBy, isPinned) {
    if (!this.io) return;
    
    this.io.to(`community_${communityId}`).emit('community_message_pinned', {
      communityId,
      messageId,
      pinnedBy,
      isPinned,
      timestamp: new Date()
    });
  }

  // Emit member joined community
  emitMemberJoined(communityId, member) {
    if (!this.io) return;
    
    this.io.to(`community_${communityId}`).emit('community_member_joined', {
      communityId,
      member,
      timestamp: new Date()
    });
  }

  // Emit member left community
  emitMemberLeft(communityId, userId, reason = 'left') {
    if (!this.io) return;
    
    this.io.to(`community_${communityId}`).emit('community_member_left', {
      communityId,
      userId,
      reason,
      timestamp: new Date()
    });
  }

  // Emit member kicked
  emitMemberKicked(communityId, targetUserId, moderatorId, reason) {
    if (!this.io) return;
    
    // Notify the kicked user specifically
    this.io.to(`user_${targetUserId}`).emit('community_kicked', {
      communityId,
      reason,
      moderatorId,
      timestamp: new Date()
    });

    // Notify other community members
    this.io.to(`community_${communityId}`).emit('community_member_kicked', {
      communityId,
      targetUserId,
      moderatorId,
      reason,
      timestamp: new Date()
    });
  }

  // Emit member banned
  emitMemberBanned(communityId, targetUserId, moderatorId, reason, duration) {
    if (!this.io) return;
    
    // Notify the banned user specifically
    this.io.to(`user_${targetUserId}`).emit('community_banned', {
      communityId,
      reason,
      duration,
      moderatorId,
      timestamp: new Date()
    });

    // Notify other community members
    this.io.to(`community_${communityId}`).emit('community_member_banned', {
      communityId,
      targetUserId,
      moderatorId,
      reason,
      duration,
      timestamp: new Date()
    });
  }

  // Emit member unbanned
  emitMemberUnbanned(communityId, targetUserId, moderatorId, reason) {
    if (!this.io) return;
    
    // Notify the unbanned user specifically
    this.io.to(`user_${targetUserId}`).emit('community_unbanned', {
      communityId,
      reason,
      moderatorId,
      timestamp: new Date()
    });

    // Notify community members
    this.io.to(`community_${communityId}`).emit('community_member_unbanned', {
      communityId,
      targetUserId,
      moderatorId,
      reason,
      timestamp: new Date()
    });
  }

  // Emit member muted
  emitMemberMuted(communityId, targetUserId, moderatorId, reason, duration) {
    if (!this.io) return;
    
    // Notify the muted user specifically
    this.io.to(`user_${targetUserId}`).emit('community_muted', {
      communityId,
      reason,
      duration,
      moderatorId,
      timestamp: new Date()
    });

    // Notify community members
    this.io.to(`community_${communityId}`).emit('community_member_muted', {
      communityId,
      targetUserId,
      moderatorId,
      reason,
      duration,
      timestamp: new Date()
    });
  }

  // Emit moderator added
  emitModeratorAdded(communityId, targetUserId, assignedBy, permissions) {
    if (!this.io) return;
    
    // Notify the new moderator
    this.io.to(`user_${targetUserId}`).emit('community_moderator_added', {
      communityId,
      permissions,
      assignedBy,
      timestamp: new Date()
    });

    // Notify community members
    this.io.to(`community_${communityId}`).emit('community_moderator_promoted', {
      communityId,
      targetUserId,
      assignedBy,
      permissions,
      timestamp: new Date()
    });
  }

  // Emit moderator removed
  emitModeratorRemoved(communityId, targetUserId, removedBy) {
    if (!this.io) return;
    
    // Notify the demoted moderator
    this.io.to(`user_${targetUserId}`).emit('community_moderator_removed', {
      communityId,
      removedBy,
      timestamp: new Date()
    });

    // Notify community members
    this.io.to(`community_${communityId}`).emit('community_moderator_demoted', {
      communityId,
      targetUserId,
      removedBy,
      timestamp: new Date()
    });
  }

  // Emit community settings updated
  emitCommunityUpdated(communityId, updatedBy, changes) {
    if (!this.io) return;
    
    this.io.to(`community_${communityId}`).emit('community_updated', {
      communityId,
      updatedBy,
      changes,
      timestamp: new Date()
    });
  }

  // Emit community rules updated
  emitRulesUpdated(communityId, updatedBy, newRules) {
    if (!this.io) return;
    
    this.io.to(`community_${communityId}`).emit('community_rules_updated', {
      communityId,
      updatedBy,
      newRules,
      timestamp: new Date()
    });
  }

  // Emit spam detection alert to moderators
  emitSpamAlert(communityId, messageId, userId, spamScore, reasons) {
    if (!this.io) return;
    
    // Only send to moderators and creator
    this.io.to(`community_${communityId}_moderators`).emit('spam_detected', {
      communityId,
      messageId,
      userId,
      spamScore,
      reasons,
      timestamp: new Date()
    });
  }

  // Emit community approval status change
  emitCommunityApprovalStatus(communityId, creatorId, status, reviewedBy, reason) {
    if (!this.io) return;
    
    // Notify the community creator
    this.io.to(`user_${creatorId}`).emit('community_approval_status', {
      communityId,
      status,
      reviewedBy,
      reason,
      timestamp: new Date()
    });
  }

  // Join user to their personal notification room
  joinUserRoom(userId, socketId) {
    if (!this.io) return;
    
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(`user_${userId}`);
    }
  }

  // Join moderators to moderator-specific room
  joinModeratorsRoom(communityId, moderatorIds) {
    if (!this.io) return;
    
    moderatorIds.forEach(moderatorId => {
      const moderatorSockets = this.io.sockets.adapter.rooms.get(`user_${moderatorId}`);
      if (moderatorSockets) {
        moderatorSockets.forEach(socketId => {
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.join(`community_${communityId}_moderators`);
          }
        });
      }
    });
  }

  // Get online members count for a community
  getOnlineMembersCount(communityId) {
    if (!this.io) return 0;
    
    const room = this.io.sockets.adapter.rooms.get(`community_${communityId}`);
    return room ? room.size : 0;
  }

  // Get list of online members for a community
  getOnlineMembers(communityId) {
    if (!this.io) return [];
    
    const room = this.io.sockets.adapter.rooms.get(`community_${communityId}`);
    if (!room) return [];
    
    const onlineMembers = [];
    room.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.userId) {
        onlineMembers.push(socket.userId);
      }
    });
    
    return onlineMembers;
  }
}

export default new CommunitySocketService();

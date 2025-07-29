import { Schema, model } from "mongoose";

const moderationLogSchema = new Schema({
  // Community reference
  community: {
    type: Schema.Types.ObjectId,
    ref: "ChatCommunity",
    required: [true, "Community is required"]
  },
  // Moderator who performed the action
  moderator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Moderator is required"]
  },
  // Target of the moderation action
  target: {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "CommunityMessage"
    }
  },
  // Moderation action details
  action: {
    type: String,
    enum: [
      "kick_member",
      "ban_member", 
      "unban_member",
      "mute_member",
      "unmute_member",
      "delete_message",
      "pin_message",
      "unpin_message",
      "add_moderator",
      "remove_moderator",
      "update_rules",
      "update_settings",
      "warn_member"
    ],
    required: [true, "Action is required"]
  },
  // Reason for the action
  reason: {
    type: String,
    trim: true,
    maxlength: [500, "Reason cannot exceed 500 characters"]
  },
  // Additional details about the action
  details: {
    duration: {
      type: Number, // Duration in minutes for temporary actions
      min: 0
    },
    previousValue: Schema.Types.Mixed, // For tracking changes
    newValue: Schema.Types.Mixed, // For tracking changes
    messageContent: String, // For deleted messages
    ruleChanges: [{
      field: String,
      oldValue: String,
      newValue: String
    }]
  },
  // Action metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    }
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
moderationLogSchema.index({ community: 1, createdAt: -1 });
moderationLogSchema.index({ moderator: 1, createdAt: -1 });
moderationLogSchema.index({ "target.user": 1, createdAt: -1 });
moderationLogSchema.index({ action: 1, community: 1 });
moderationLogSchema.index({ "metadata.severity": 1, community: 1 });

// Static method to log moderation action
moderationLogSchema.statics.logAction = function(data) {
  const log = new this(data);
  return log.save();
};

// Static method to get moderation history for community
moderationLogSchema.statics.getCommunityHistory = function(communityId, options = {}) {
  const { 
    limit = 50, 
    skip = 0, 
    action = null,
    moderator = null,
    targetUser = null,
    severity = null,
    startDate = null,
    endDate = null
  } = options;
  
  let query = { community: communityId };
  
  if (action) query.action = action;
  if (moderator) query.moderator = moderator;
  if (targetUser) query["target.user"] = targetUser;
  if (severity) query["metadata.severity"] = severity;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('moderator', 'name email role')
    .populate('target.user', 'name email')
    .populate('target.message', 'content messageType')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get moderation statistics
moderationLogSchema.statics.getCommunityStats = function(communityId, days = 30) {
  const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        community: communityId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        moderators: { $addToSet: "$moderator" }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get moderator activity
moderationLogSchema.statics.getModeratorActivity = function(moderatorId, days = 30) {
  const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        moderator: moderatorId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          community: "$community",
          action: "$action"
        },
        count: { $sum: 1 },
        lastAction: { $max: "$createdAt" }
      }
    },
    {
      $lookup: {
        from: "chat_communities",
        localField: "_id.community",
        foreignField: "_id",
        as: "communityInfo"
      }
    },
    {
      $sort: { lastAction: -1 }
    }
  ]);
};

// Method to format action for display
moderationLogSchema.methods.getActionDescription = function() {
  const actionDescriptions = {
    kick_member: "Kicked member from community",
    ban_member: "Banned member from community",
    unban_member: "Unbanned member",
    mute_member: "Muted member",
    unmute_member: "Unmuted member",
    delete_message: "Deleted message",
    pin_message: "Pinned message",
    unpin_message: "Unpinned message",
    add_moderator: "Added moderator",
    remove_moderator: "Removed moderator",
    update_rules: "Updated community rules",
    update_settings: "Updated community settings",
    warn_member: "Warned member"
  };
  
  return actionDescriptions[this.action] || this.action;
};

// Virtual for action severity color
moderationLogSchema.virtual('severityColor').get(function() {
  const colors = {
    low: '#10B981',      // Green
    medium: '#F59E0B',   // Yellow
    high: '#EF4444',     // Red
    critical: '#7C2D12'  // Dark red
  };
  
  return colors[this.metadata.severity] || colors.medium;
});

const ModerationLog = model("ModerationLog", moderationLogSchema, "moderation_logs");
export default ModerationLog;

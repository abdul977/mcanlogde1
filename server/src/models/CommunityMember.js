import { Schema, model } from "mongoose";

const communityMemberSchema = new Schema({
  // Community and user references
  community: {
    type: Schema.Types.ObjectId,
    ref: "ChatCommunity",
    required: [true, "Community is required"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },
  // Member role within the community
  role: {
    type: String,
    enum: ["member", "moderator", "creator"],
    default: "member"
  },
  // Member status
  status: {
    type: String,
    enum: ["active", "banned", "left", "kicked", "pending"],
    default: "active"
  },
  // Join information
  joinedAt: {
    type: Date,
    default: Date.now
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  // Member permissions (for moderators)
  permissions: {
    canKickMembers: { type: Boolean, default: false },
    canBanMembers: { type: Boolean, default: false },
    canDeleteMessages: { type: Boolean, default: false },
    canManageRules: { type: Boolean, default: false },
    canInviteMembers: { type: Boolean, default: false },
    canPinMessages: { type: Boolean, default: false }
  },
  // Moderation history
  moderationHistory: [{
    action: {
      type: String,
      enum: ["warned", "muted", "kicked", "banned", "unbanned"],
      required: true
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"]
    },
    moderator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    duration: {
      type: Number, // Duration in minutes for temporary actions
      min: 0
    },
    expiresAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Member activity tracking
  lastSeen: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Notification preferences
  notifications: {
    mentions: { type: Boolean, default: true },
    allMessages: { type: Boolean, default: false },
    announcements: { type: Boolean, default: true },
    memberJoins: { type: Boolean, default: false }
  },
  // Member settings
  settings: {
    nickname: {
      type: String,
      trim: true,
      maxlength: [50, "Nickname cannot exceed 50 characters"]
    },
    muteUntil: {
      type: Date
    },
    customRole: {
      type: String,
      trim: true,
      maxlength: [30, "Custom role cannot exceed 30 characters"]
    }
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique user-community pairs
communityMemberSchema.index({ community: 1, user: 1 }, { unique: true });

// Additional indexes for performance
communityMemberSchema.index({ community: 1, status: 1, role: 1 });
communityMemberSchema.index({ user: 1, status: 1 });
communityMemberSchema.index({ community: 1, joinedAt: -1 });
communityMemberSchema.index({ community: 1, lastSeen: -1 });

// Pre-save middleware
communityMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get community members with pagination
communityMemberSchema.statics.getCommunityMembers = function(communityId, options = {}) {
  const { 
    limit = 50, 
    skip = 0, 
    sort = { joinedAt: -1 },
    status = 'active',
    role = null 
  } = options;
  
  let query = { community: communityId, status };
  
  if (role) {
    query.role = role;
  }
  
  return this.find(query)
    .populate('user', 'name email role gender stateCode batch')
    .populate('invitedBy', 'name')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method to get member count for community
communityMemberSchema.statics.getCommunityMemberCount = function(communityId, status = 'active') {
  return this.countDocuments({ community: communityId, status });
};

// Static method to check if user is member of community
communityMemberSchema.statics.isMember = function(communityId, userId) {
  return this.findOne({ 
    community: communityId, 
    user: userId, 
    status: 'active' 
  });
};

// Static method to get user's communities
communityMemberSchema.statics.getUserCommunities = function(userId, status = 'active') {
  return this.find({ user: userId, status })
    .populate('community', '_id name description category avatar banner memberCount lastActivity status creator tags isPrivate createdAt updatedAt')
    .sort({ lastSeen: -1 });
};

// Method to add moderation action
communityMemberSchema.methods.addModerationAction = function(action, moderatorId, reason, duration = null) {
  const moderationEntry = {
    action,
    reason,
    moderator: moderatorId,
    duration,
    createdAt: new Date()
  };
  
  // Set expiration for temporary actions
  if (duration && ['muted', 'banned'].includes(action)) {
    moderationEntry.expiresAt = new Date(Date.now() + (duration * 60 * 1000));
  }
  
  this.moderationHistory.push(moderationEntry);
  
  // Update member status based on action
  switch (action) {
    case 'kicked':
      this.status = 'kicked';
      break;
    case 'banned':
      this.status = 'banned';
      break;
    case 'unbanned':
      this.status = 'active';
      break;
  }
  
  return this.save();
};

// Method to check if member is currently muted
communityMemberSchema.methods.isMuted = function() {
  if (!this.settings.muteUntil) return false;
  return new Date() < this.settings.muteUntil;
};

// Method to check if member is currently banned
communityMemberSchema.methods.isBanned = function() {
  if (this.status !== 'banned') return false;
  
  // Check if ban has expired
  const latestBan = this.moderationHistory
    .filter(h => h.action === 'banned')
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  
  if (latestBan && latestBan.expiresAt && new Date() > latestBan.expiresAt) {
    // Ban has expired, update status
    this.status = 'active';
    this.save();
    return false;
  }
  
  return true;
};

// Method to update last seen
communityMemberSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Method to increment message count
communityMemberSchema.methods.incrementMessageCount = function() {
  this.messageCount += 1;
  return this.save();
};

// Virtual for display name
communityMemberSchema.virtual('displayName').get(function() {
  return this.settings.nickname || this.user.name;
});

const CommunityMember = model("CommunityMember", communityMemberSchema, "community_members");
export default CommunityMember;

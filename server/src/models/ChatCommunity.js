import { Schema, model } from "mongoose";
import slug from "slugify";

const chatCommunitySchema = new Schema({
  name: {
    type: String,
    required: [true, "Community name is required"],
    trim: true,
    maxlength: [100, "Community name cannot exceed 100 characters"],
    minlength: [3, "Community name must be at least 3 characters"]
  },
  description: {
    type: String,
    required: [true, "Community description is required"],
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  category: {
    type: String,
    enum: ["education", "welfare", "spiritual", "social", "charity", "youth", "women", "general", "technology", "health"],
    default: "general",
    required: true
  },
  // Community creator and admin info
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Community creator is required"]
  },
  moderators: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    permissions: {
      canKickMembers: { type: Boolean, default: true },
      canBanMembers: { type: Boolean, default: true },
      canDeleteMessages: { type: Boolean, default: true },
      canManageRules: { type: Boolean, default: true },
      canInviteMembers: { type: Boolean, default: true }
    }
  }],
  // Community settings
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 1000,
      min: 10,
      max: 10000
    },
    messageRateLimit: {
      enabled: { type: Boolean, default: true },
      seconds: { type: Number, default: 5, min: 2, max: 60 }
    },
    allowMediaSharing: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    }
  },
  // Community rules and guidelines
  rules: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Rule title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Rule description cannot exceed 500 characters"]
    },
    order: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Community media
  avatar: {
    type: String, // URL to community avatar image
    default: null
  },
  banner: {
    type: String, // URL to community banner image
    default: null
  },
  // Member statistics
  memberCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Community status and approval workflow
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "suspended", "archived"],
    default: "pending",
    required: true
  },
  approvalInfo: {
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"]
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"]
    }
  },
  // Community activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Tags for discovery
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, "Tag cannot exceed 30 characters"]
  }],
  // SEO and discovery
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  featured: {
    type: Boolean,
    default: false
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

// Pre-save middleware to generate slug and update timestamps
chatCommunitySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slug(this.name, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
chatCommunitySchema.index({ status: 1, category: 1 });
chatCommunitySchema.index({ creator: 1, status: 1 });
chatCommunitySchema.index({ slug: 1 });
chatCommunitySchema.index({ featured: 1, status: 1 });
chatCommunitySchema.index({ tags: 1, status: 1 });
chatCommunitySchema.index({ memberCount: -1, status: 1 });
chatCommunitySchema.index({ lastActivity: -1, status: 1 });

// Text index for search functionality
chatCommunitySchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for checking if community is active
chatCommunitySchema.virtual('isActive').get(function() {
  return this.status === 'approved' && this.memberCount > 0;
});

// Virtual for checking if user is moderator
chatCommunitySchema.methods.isModerator = function(userId) {
  return this.moderators.some(mod => mod.user.toString() === userId.toString());
};

// Virtual for checking if user is creator
chatCommunitySchema.methods.isCreator = function(userId) {
  return this.creator.toString() === userId.toString();
};

// Method to add moderator
chatCommunitySchema.methods.addModerator = function(userId, assignedBy, permissions = {}) {
  const defaultPermissions = {
    canKickMembers: true,
    canBanMembers: true,
    canDeleteMessages: true,
    canManageRules: true,
    canInviteMembers: true
  };
  
  this.moderators.push({
    user: userId,
    assignedBy,
    permissions: { ...defaultPermissions, ...permissions }
  });
  
  return this.save();
};

// Method to remove moderator
chatCommunitySchema.methods.removeModerator = function(userId) {
  this.moderators = this.moderators.filter(mod => mod.user.toString() !== userId.toString());
  return this.save();
};

const ChatCommunity = model("ChatCommunity", chatCommunitySchema, "chat_communities");
export default ChatCommunity;

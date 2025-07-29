import { Schema, model } from "mongoose";

const communityMessageSchema = new Schema({
  // Community reference
  community: {
    type: Schema.Types.ObjectId,
    ref: "ChatCommunity",
    required: [true, "Community is required"]
  },
  // Message sender
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender is required"]
  },
  // Message content
  content: {
    type: String,
    required: [true, "Message content is required"],
    trim: true,
    maxlength: [2000, "Message cannot exceed 2000 characters"]
  },
  // Message type
  messageType: {
    type: String,
    enum: ["text", "image", "file", "system", "announcement"],
    default: "text"
  },
  // Media attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ["image", "document", "video", "audio"],
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  }],
  // Message status and moderation
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  deletionReason: {
    type: String,
    trim: true,
    maxlength: [200, "Deletion reason cannot exceed 200 characters"]
  },
  // Message reactions (for future enhancement)
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    count: {
      type: Number,
      default: 0
    }
  }],
  // Reply functionality
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: "CommunityMessage"
  },
  // Message metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String,
    editHistory: [{
      editedAt: Date,
      previousContent: String,
      reason: String
    }]
  },
  // Spam detection
  spamScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  flaggedAsSpam: {
    type: Boolean,
    default: false
  },
  // Read receipts (for future enhancement)
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Pre-save middleware
communityMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set deletedAt timestamp when message is marked as deleted
  if (this.isModified('isDeleted') && this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  
  next();
});

// Static method to get community messages with pagination
communityMessageSchema.statics.getCommunityMessages = function(communityId, options = {}) {
  const { 
    limit = 50, 
    skip = 0, 
    sort = { createdAt: -1 },
    includeDeleted = false 
  } = options;
  
  let query = { community: communityId };
  
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  return this.find(query)
    .populate('sender', 'name email role')
    .populate('replyTo', 'content sender createdAt')
    .populate('deletedBy', 'name role')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method to get message count for community
communityMessageSchema.statics.getCommunityMessageCount = function(communityId, includeDeleted = false) {
  let query = { community: communityId };
  
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  return this.countDocuments(query);
};

// Static method to delete messages by moderator
communityMessageSchema.statics.moderatorDelete = function(messageId, moderatorId, reason) {
  return this.findByIdAndUpdate(
    messageId,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: moderatorId,
      deletionReason: reason
    },
    { new: true }
  );
};

// Static method to get recent messages for community activity
communityMessageSchema.statics.getRecentActivity = function(communityId, hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  
  return this.find({
    community: communityId,
    isDeleted: false,
    createdAt: { $gte: since }
  })
  .populate('sender', 'name')
  .sort({ createdAt: -1 })
  .limit(10);
};

// Method to check if user can delete this message
communityMessageSchema.methods.canDelete = function(userId, userRole, community) {
  // Message sender can delete their own message
  if (this.sender.toString() === userId.toString()) {
    return true;
  }
  
  // Admins can delete any message
  if (userRole === 'admin') {
    return true;
  }
  
  // Community creator can delete any message in their community
  if (community.creator.toString() === userId.toString()) {
    return true;
  }
  
  // Community moderators with permission can delete messages
  const moderator = community.moderators.find(mod => mod.user.toString() === userId.toString());
  if (moderator && moderator.permissions.canDeleteMessages) {
    return true;
  }
  
  return false;
};

// Indexes for better query performance
communityMessageSchema.index({ community: 1, createdAt: -1 });
communityMessageSchema.index({ sender: 1, createdAt: -1 });
communityMessageSchema.index({ community: 1, isDeleted: 1, createdAt: -1 });
communityMessageSchema.index({ replyTo: 1 });
communityMessageSchema.index({ flaggedAsSpam: 1, community: 1 });

// Text index for message search
communityMessageSchema.index({
  content: 'text'
});

const CommunityMessage = model("CommunityMessage", communityMessageSchema, "community_messages");
export default CommunityMessage;

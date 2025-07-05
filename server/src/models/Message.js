import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender is required"]
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Recipient is required"]
  },
  content: {
    type: String,
    required: [true, "Message content is required"],
    trim: true,
    maxlength: [2000, "Message cannot exceed 2000 characters"]
  },
  messageType: {
    type: String,
    enum: ["text", "system", "booking_update"],
    default: "text"
  },
  // For system messages and booking updates
  relatedBooking: {
    type: Schema.Types.ObjectId,
    ref: "Booking"
  },
  // Message status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Thread management
  threadId: {
    type: String,
    required: true,
    index: true
  },
  // Priority for admin messages
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal"
  },
  // Attachments (for future use)
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  // Message metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },
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
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set readAt timestamp when message is marked as read
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  next();
});

// Static method to generate thread ID
messageSchema.statics.generateThreadId = function(userId1, userId2) {
  // Ensure consistent thread ID regardless of order
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `thread_${sortedIds[0]}_${sortedIds[1]}`;
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2, options = {}) {
  const threadId = this.generateThreadId(userId1, userId2);
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
  
  return this.find({ threadId })
    .populate('sender', 'name email role')
    .populate('recipient', 'name email role')
    .populate('relatedBooking')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(threadId, recipientId) {
  return this.updateMany(
    { 
      threadId, 
      recipient: recipientId, 
      isRead: false 
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Static method to get user's conversations
messageSchema.statics.getUserConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$threadId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', userId] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'senderInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.recipient',
        foreignField: '_id',
        as: 'recipientInfo'
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
};

// Indexes for better query performance
messageSchema.index({ threadId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ relatedBooking: 1 });

const Message = model("Message", messageSchema, "messages");
export default Message;

import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
  // Recipient user
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"]
  },
  // Notification content
  title: {
    type: String,
    required: [true, "Notification title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  message: {
    type: String,
    required: [true, "Notification message is required"],
    trim: true,
    maxlength: [500, "Message cannot exceed 500 characters"]
  },
  // Notification type
  type: {
    type: String,
    enum: [
      "payment_reminder",
      "payment_approved", 
      "payment_rejected",
      "booking_approved",
      "booking_rejected",
      "booking_update",
      "system_announcement",
      "general"
    ],
    required: [true, "Notification type is required"]
  },
  // Priority level
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal"
  },
  // Related entities
  relatedBooking: {
    type: Schema.Types.ObjectId,
    ref: "Booking"
  },
  relatedPayment: {
    type: Schema.Types.ObjectId,
    ref: "PaymentVerification"
  },
  relatedReminder: {
    type: Schema.Types.ObjectId,
    ref: "PaymentReminder"
  },
  // Status tracking
  status: {
    type: String,
    enum: ["unread", "read", "archived"],
    default: "unread"
  },
  // Read tracking
  readAt: {
    type: Date
  },
  // Action data (for clickable notifications)
  actionData: {
    type: {
      type: String,
      enum: ["navigate", "modal", "external_link", "none"],
      default: "none"
    },
    url: {
      type: String,
      trim: true
    },
    params: {
      type: Schema.Types.Mixed
    }
  },
  // Delivery channels
  channels: {
    inApp: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      emailId: {
        type: String
      }
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    }
  },
  // Expiry (for time-sensitive notifications)
  expiresAt: {
    type: Date
  },
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ user: 1, status: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ relatedBooking: 1 });
notificationSchema.index({ relatedPayment: 1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set readAt when status changes to read
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  
  next();
});

// Static methods
notificationSchema.statics.createPaymentReminder = function(userId, bookingId, paymentData) {
  return this.create({
    user: userId,
    title: `Payment Due - Month ${paymentData.monthNumber}`,
    message: `Your accommodation payment of ₦${paymentData.amount?.toLocaleString()} is due on ${paymentData.dueDate.toLocaleDateString()}`,
    type: 'payment_reminder',
    priority: 'high',
    relatedBooking: bookingId,
    actionData: {
      type: 'navigate',
      url: '/user/bookings',
      params: { bookingId, monthNumber: paymentData.monthNumber }
    },
    expiresAt: new Date(paymentData.dueDate.getTime() + (7 * 24 * 60 * 60 * 1000)) // Expire 7 days after due date
  });
};

notificationSchema.statics.createPaymentApproved = function(userId, bookingId, paymentData) {
  return this.create({
    user: userId,
    title: `Payment Approved - Month ${paymentData.monthNumber}`,
    message: `Your payment of ₦${paymentData.amount?.toLocaleString()} has been approved`,
    type: 'payment_approved',
    priority: 'normal',
    relatedBooking: bookingId,
    relatedPayment: paymentData.paymentId,
    actionData: {
      type: 'navigate',
      url: '/user/bookings'
    }
  });
};

notificationSchema.statics.createPaymentRejected = function(userId, bookingId, paymentData) {
  return this.create({
    user: userId,
    title: `Payment Verification Required - Month ${paymentData.monthNumber}`,
    message: `Your payment submission needs additional verification. ${paymentData.reason || 'Please resubmit with correct information.'}`,
    type: 'payment_rejected',
    priority: 'high',
    relatedBooking: bookingId,
    relatedPayment: paymentData.paymentId,
    actionData: {
      type: 'navigate',
      url: '/user/bookings',
      params: { bookingId, monthNumber: paymentData.monthNumber }
    }
  });
};

notificationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({ 
    user: userId, 
    status: 'unread',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.markAsRead = function(notificationIds, userId) {
  return this.updateMany(
    { 
      _id: { $in: notificationIds }, 
      user: userId 
    },
    { 
      status: 'read',
      readAt: new Date()
    }
  );
};

notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { 
      user: userId, 
      status: 'unread' 
    },
    { 
      status: 'read',
      readAt: new Date()
    }
  );
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    user: userId, 
    status: 'unread',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

const Notification = model("Notification", notificationSchema, "notifications");
export default Notification;

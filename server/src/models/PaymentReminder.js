import { Schema, model } from "mongoose";

const paymentReminderSchema = new Schema({
  // Reference to the booking
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: [true, "Booking reference is required"]
  },
  // Reference to the user
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"]
  },
  // Payment details
  monthNumber: {
    type: Number,
    required: [true, "Month number is required"],
    min: 1,
    max: 12
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"]
  },
  amount: {
    type: Number,
    required: [true, "Payment amount is required"],
    min: 0
  },
  // Reminder details
  reminderType: {
    type: String,
    enum: ["upcoming", "due", "overdue", "final_notice"],
    required: [true, "Reminder type is required"]
  },
  reminderDate: {
    type: Date,
    required: [true, "Reminder date is required"]
  },
  // Notification channels
  channels: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: {
        type: Date
      }
    },
    inApp: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      read: {
        type: Boolean,
        default: false
      },
      readAt: {
        type: Date
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
  // Reminder content
  subject: {
    type: String,
    required: [true, "Reminder subject is required"],
    trim: true
  },
  message: {
    type: String,
    required: [true, "Reminder message is required"],
    trim: true
  },
  // Status tracking
  status: {
    type: String,
    enum: ["scheduled", "sent", "failed", "cancelled"],
    default: "scheduled",
    required: true
  },
  // Response tracking
  userResponse: {
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: {
      type: Date
    },
    paymentSubmitted: {
      type: Boolean,
      default: false
    },
    paymentSubmittedAt: {
      type: Date
    }
  },
  // Retry logic
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  nextRetryAt: {
    type: Date
  },
  lastError: {
    type: String,
    trim: true
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
}, {
  timestamps: true
});

// Indexes for better query performance
paymentReminderSchema.index({ booking: 1, monthNumber: 1 });
paymentReminderSchema.index({ user: 1, status: 1 });
paymentReminderSchema.index({ reminderDate: 1, status: 1 });
paymentReminderSchema.index({ dueDate: 1, reminderType: 1 });
paymentReminderSchema.index({ status: 1, nextRetryAt: 1 });

// Virtual for days until due
paymentReminderSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for overdue status
paymentReminderSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Pre-save middleware
paymentReminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static methods
paymentReminderSchema.statics.findDueReminders = function() {
  const now = new Date();
  return this.find({
    reminderDate: { $lte: now },
    status: 'scheduled'
  }).populate('user', 'name email phone')
    .populate('booking', 'accommodation checkInDate');
};

paymentReminderSchema.statics.findOverduePayments = function() {
  const now = new Date();
  return this.find({
    dueDate: { $lt: now },
    'userResponse.paymentSubmitted': false
  }).populate('user', 'name email')
    .populate('booking', 'accommodation');
};

paymentReminderSchema.statics.createUpcomingReminder = function(booking, monthNumber, dueDate, amount) {
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 7); // 7 days before due date
  
  return this.create({
    booking: booking._id,
    user: booking.user,
    monthNumber,
    dueDate,
    amount,
    reminderType: 'upcoming',
    reminderDate,
    subject: `Upcoming Payment Due - Month ${monthNumber}`,
    message: `Your accommodation payment for month ${monthNumber} is due on ${dueDate.toDateString()}. Amount: ₦${amount.toLocaleString()}`
  });
};

paymentReminderSchema.statics.createOverdueReminder = function(booking, monthNumber, dueDate, amount) {
  const reminderDate = new Date(); // Send immediately
  
  return this.create({
    booking: booking._id,
    user: booking.user,
    monthNumber,
    dueDate,
    amount,
    reminderType: 'overdue',
    reminderDate,
    subject: `Overdue Payment - Month ${monthNumber}`,
    message: `Your accommodation payment for month ${monthNumber} was due on ${dueDate.toDateString()}. Please submit payment immediately. Amount: ₦${amount.toLocaleString()}`
  });
};

const PaymentReminder = model("PaymentReminder", paymentReminderSchema, "payment_reminders");
export default PaymentReminder;

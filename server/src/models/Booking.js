import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  // Booking Details
  checkInDate: {
    type: Date,
    required: true,
  },
  duration: {
    months: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    days: {
      type: Number,
      default: 0,
    },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "active", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "partially_paid", "paid"],
    default: "unpaid",
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    transactionId: String,
    paymentMethod: String,
  }],
  // Islamic Housing Agreement
  agreementToRules: {
    type: Boolean,
    required: true,
    default: false,
  },
  additionalRequirements: {
    type: String,
    maxLength: 500,
  },
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  // NYSC Details
  nyscDetails: {
    callUpNumber: {
      type: String,
      required: true,
    },
    stateCode: {
      type: String,
      required: true,
    },
    ppa: {
      name: String,
      address: String,
    },
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
  notes: {
    type: String,
  },
});

// Update timestamp on document update
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total amount before saving
bookingSchema.pre('save', async function(next) {
  if (this.isModified('duration') || this.isNew) {
    try {
      const post = await mongoose.model('Post').findById(this.post);
      if (post) {
        const monthlyPrice = post.price;
        const totalMonths = this.duration.months + (this.duration.days / 30);
        this.totalAmount = Math.ceil(monthlyPrice * totalMonths);
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Add index for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ post: 1, status: 1 });
bookingSchema.index({ checkInDate: 1 });
bookingSchema.index({ 'nyscDetails.stateCode': 1 });

export default mongoose.model("Booking", bookingSchema);

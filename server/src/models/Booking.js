import { Schema, model } from "mongoose";

const bookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"]
  },
  accommodation: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: function() {
      return this.bookingType === 'accommodation';
    }
  },
  bookingType: {
    type: String,
    enum: ["accommodation", "program", "lecture", "quran_class", "event"],
    required: [true, "Booking type is required"]
  },
  // For program bookings
  program: {
    type: Schema.Types.ObjectId,
    refPath: 'programModel'
  },
  programModel: {
    type: String,
    enum: ["QuranClass", "Lecture", "Event"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  rejectedDate: {
    type: Date
  },
  cancelledDate: {
    type: Date
  },
  adminNotes: {
    type: String,
    trim: true
  },
  userNotes: {
    type: String,
    trim: true,
    maxlength: [500, "User notes cannot exceed 500 characters"]
  },
  // For accommodation bookings
  checkInDate: {
    type: Date
  },
  checkOutDate: {
    type: Date
  },
  numberOfGuests: {
    type: Number,
    min: 1,
    max: 6
  },
  // Yearly booking support
  bookingDuration: {
    months: {
      type: Number,
      min: 1,
      max: 12,
      default: 1
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  // Payment tracking
  paymentSchedule: [{
    monthNumber: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "waived"],
      default: "pending"
    },
    paidDate: {
      type: Date
    },
    paymentProof: {
      type: Schema.Types.ObjectId,
      ref: "PaymentVerification"
    }
  }],
  // For program enrollments
  enrollmentDetails: {
    previousExperience: {
      type: String,
      trim: true
    },
    expectations: {
      type: String,
      trim: true
    },
    specialRequirements: {
      type: String,
      trim: true
    }
  },
  // Contact information
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  // Payment information (for future use)
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded", "not_required"],
    default: "not_required"
  },
  totalAmount: {
    type: Number,
    default: 0
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

// Pre-save middleware to update timestamps and payment status
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Set status dates
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'approved':
        if (!this.approvedDate) this.approvedDate = now;
        break;
      case 'rejected':
        if (!this.rejectedDate) this.rejectedDate = now;
        break;
      case 'cancelled':
        if (!this.cancelledDate) this.cancelledDate = now;
        break;
    }
  }

  // Set payment status based on booking type and payment schedule
  if (this.isNew || this.isModified('paymentSchedule') || this.isModified('totalAmount')) {
    if (this.bookingType === 'accommodation') {
      // For accommodation bookings, check if there's a payment schedule or total amount
      if ((this.paymentSchedule && this.paymentSchedule.length > 0) || (this.totalAmount && this.totalAmount > 0)) {
        this.paymentStatus = 'pending';
      } else {
        this.paymentStatus = 'not_required';
      }
    } else {
      // For program bookings, check if there's a total amount
      if (this.totalAmount && this.totalAmount > 0) {
        this.paymentStatus = 'pending';
      } else {
        this.paymentStatus = 'not_required';
      }
    }
  }

  next();
});

// Indexes for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ accommodation: 1, status: 1 });
bookingSchema.index({ program: 1, status: 1 });
bookingSchema.index({ bookingType: 1, status: 1 });
bookingSchema.index({ requestDate: -1 });

// Virtual for booking duration (for accommodations)
bookingSchema.virtual('duration').get(function() {
  if (this.checkInDate && this.checkOutDate) {
    const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for status display
bookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

const Booking = model("Booking", bookingSchema, "bookings");
export default Booking;

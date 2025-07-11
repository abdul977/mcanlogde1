import { Schema, model } from "mongoose";

const paymentVerificationSchema = new Schema({
  // Reference to the booking
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: [true, "Booking reference is required"]
  },
  // Reference to the user who made the payment
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
  amount: {
    type: Number,
    required: [true, "Payment amount is required"],
    min: 0
  },
  currency: {
    type: String,
    default: "NGN",
    enum: ["NGN", "USD"]
  },
  // Payment proof (supports both images and PDFs)
  paymentProof: {
    url: {
      type: String,
      required: [true, "Payment proof is required"]
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true,
      enum: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf"
      ]
    },
    fileType: {
      type: String,
      enum: ["image", "pdf"],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Legacy field for backward compatibility
  paymentScreenshot: {
    url: {
      type: String
    },
    filename: {
      type: String
    },
    size: {
      type: Number
    },
    mimetype: {
      type: String
    }
  },
  // Payment method information
  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "mobile_money", "cash", "card", "other"],
    required: [true, "Payment method is required"]
  },
  transactionReference: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date,
    required: [true, "Payment date is required"]
  },
  // User notes about the payment
  userNotes: {
    type: String,
    trim: true,
    maxlength: [500, "User notes cannot exceed 500 characters"]
  },
  // Verification status
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "requires_clarification"],
    default: "pending",
    required: true
  },
  // Admin verification details
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  verifiedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, "Admin notes cannot exceed 1000 characters"]
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, "Rejection reason cannot exceed 500 characters"]
  },
  // Timestamps
  submittedAt: {
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
paymentVerificationSchema.index({ booking: 1, monthNumber: 1 });
paymentVerificationSchema.index({ user: 1, verificationStatus: 1 });
paymentVerificationSchema.index({ verificationStatus: 1, submittedAt: -1 });
paymentVerificationSchema.index({ verifiedBy: 1, verifiedAt: -1 });

// Virtual for status display
paymentVerificationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    requires_clarification: 'Requires Clarification'
  };
  return statusMap[this.verificationStatus] || this.verificationStatus;
});

// Virtual for payment proof URL (prioritizes new paymentProof field)
paymentVerificationSchema.virtual('proofUrl').get(function() {
  return this.paymentProof?.url || this.paymentScreenshot?.url;
});

// Virtual for file type detection
paymentVerificationSchema.virtual('fileType').get(function() {
  if (this.paymentProof?.fileType) {
    return this.paymentProof.fileType;
  }

  // Fallback for legacy data
  const mimetype = this.paymentProof?.mimetype || this.paymentScreenshot?.mimetype;
  if (mimetype) {
    return mimetype.startsWith('image/') ? 'image' : 'pdf';
  }

  return 'unknown';
});

// Virtual for display filename
paymentVerificationSchema.virtual('displayFilename').get(function() {
  return this.paymentProof?.originalName || this.paymentScreenshot?.filename || 'Unknown file';
});

// Pre-save middleware
paymentVerificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set verification timestamp when status changes to approved/rejected
  if (this.isModified('verificationStatus')) {
    if (['approved', 'rejected'].includes(this.verificationStatus)) {
      if (!this.verifiedAt) {
        this.verifiedAt = new Date();
      }
    }
  }
  
  next();
});

// Static methods
paymentVerificationSchema.statics.findPendingVerifications = function() {
  return this.find({ verificationStatus: 'pending' })
    .populate('user', 'name email')
    .populate('booking', 'accommodation checkInDate')
    .sort({ submittedAt: -1 });
};

paymentVerificationSchema.statics.findByBooking = function(bookingId) {
  return this.find({ booking: bookingId })
    .sort({ monthNumber: 1 });
};

paymentVerificationSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate('booking', 'accommodation checkInDate')
    .sort({ submittedAt: -1 });
};

// Instance method to get file info
paymentVerificationSchema.methods.getFileInfo = function() {
  const proof = this.paymentProof || this.paymentScreenshot;
  if (!proof) return null;

  return {
    url: proof.url,
    filename: proof.originalName || proof.filename,
    size: proof.size,
    mimetype: proof.mimetype,
    fileType: this.fileType,
    uploadedAt: proof.uploadedAt || this.submittedAt
  };
};

// Instance method to check if file is PDF
paymentVerificationSchema.methods.isPDF = function() {
  return this.fileType === 'pdf';
};

// Instance method to check if file is image
paymentVerificationSchema.methods.isImage = function() {
  return this.fileType === 'image';
};

const PaymentVerification = model("PaymentVerification", paymentVerificationSchema, "payment_verifications");
export default PaymentVerification;

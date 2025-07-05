import { Schema, model } from "mongoose";
import slug from "slugify";

const donationSchema = new Schema({
  title: {
    type: String,
    required: [true, "Donation title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  type: {
    type: String,
    enum: ["lodge_sponsorship", "general_donation", "scholarship_fund", "event_sponsorship", "infrastructure", "welfare", "emergency_fund"],
    required: [true, "Donation type is required"]
  },
  category: {
    type: String,
    enum: ["accommodation", "education", "welfare", "spiritual", "infrastructure", "emergency", "general"],
    default: "general",
    required: true
  },
  sponsorshipLevel: {
    type: String,
    enum: ["bronze", "silver", "gold", "platinum", "diamond", "custom"],
    required: function() {
      return this.type === "lodge_sponsorship" || this.type === "event_sponsorship";
    }
  },
  amount: {
    target: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0, "Target amount must be positive"]
    },
    raised: {
      type: Number,
      default: 0,
      min: [0, "Raised amount cannot be negative"]
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "EUR", "GBP"]
    },
    breakdown: [{
      item: {
        type: String,
        required: true,
        trim: true
      },
      cost: {
        type: Number,
        required: true,
        min: 0
      },
      description: {
        type: String,
        trim: true
      }
    }]
  },
  sponsorshipTiers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    benefits: [{
      type: String,
      trim: true
    }],
    maxSponsors: {
      type: Number,
      min: 1
    },
    currentSponsors: {
      type: Number,
      default: 0,
      min: 0
    },
    color: {
      type: String,
      default: "#3B82F6"
    }
  }],
  timeline: {
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"]
    },
    milestones: [{
      date: {
        type: Date,
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      targetAmount: {
        type: Number,
        min: 0
      },
      achieved: {
        type: Boolean,
        default: false
      }
    }]
  },
  beneficiaries: {
    target: {
      type: Number,
      min: 0
    },
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    demographics: {
      corpsMembers: { type: Number, default: 0 },
      families: { type: Number, default: 0 },
      students: { type: Number, default: 0 },
      general: { type: Number, default: 0 }
    }
  },
  sponsors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    tier: {
      type: String,
      trim: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"]
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "card", "mobile_money", "cash", "cheque"],
      required: true
    },
    paymentReference: {
      type: String,
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed", "refunded"],
      default: "pending"
    },
    donationDate: {
      type: Date,
      default: Date.now
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true
    }
  }],
  media: {
    images: [{
      url: {
        type: String,
        required: true
      },
      caption: {
        type: String,
        trim: true
      },
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    videos: [{
      url: {
        type: String,
        required: true
      },
      title: {
        type: String,
        trim: true
      },
      thumbnail: {
        type: String
      }
    }],
    documents: [{
      url: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ["proposal", "budget", "report", "receipt", "certificate"],
        required: true
      }
    }]
  },
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    updates: [{
      date: {
        type: Date,
        default: Date.now
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      amount: {
        type: Number,
        min: 0
      },
      images: [{
        type: String
      }]
    }]
  },
  paymentInfo: {
    bankDetails: {
      accountName: {
        type: String,
        trim: true
      },
      accountNumber: {
        type: String,
        trim: true
      },
      bankName: {
        type: String,
        trim: true
      },
      sortCode: {
        type: String,
        trim: true
      }
    },
    mobilePayment: {
      number: {
        type: String,
        trim: true
      },
      provider: {
        type: String,
        enum: ["mtn", "airtel", "glo", "9mobile"],
        trim: true
      }
    },
    onlinePayment: {
      paystackPublicKey: {
        type: String,
        trim: true
      },
      flutterwavePublicKey: {
        type: String,
        trim: true
      }
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["draft", "active", "completed", "cancelled", "paused"],
    default: "draft",
    required: true
  },
  visibility: {
    type: String,
    enum: ["public", "members", "admin"],
    default: "public"
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
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

// Pre-save middleware to generate slug and update progress
donationSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slug(this.title, { lower: true, strict: true });
  }
  
  // Calculate progress percentage
  if (this.amount.target > 0) {
    this.progress.percentage = Math.min(100, Math.round((this.amount.raised / this.amount.target) * 100));
  }
  
  this.updatedAt = Date.now();
  next();
});

// Validate timeline dates
donationSchema.pre('save', function(next) {
  if (this.timeline.startDate >= this.timeline.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Index for better query performance
donationSchema.index({ status: 1, type: 1 });
donationSchema.index({ category: 1, status: 1 });
donationSchema.index({ featured: 1, status: 1 });
donationSchema.index({ urgent: 1, status: 1 });
donationSchema.index({ tags: 1, status: 1 });
donationSchema.index({ slug: 1 });
donationSchema.index({ 'timeline.endDate': 1 });
donationSchema.index({ 'progress.percentage': 1 });

// Text index for search functionality
donationSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for checking if donation is active
donationSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.timeline.startDate <= now && 
         now <= this.timeline.endDate &&
         this.progress.percentage < 100;
});

// Virtual for remaining amount
donationSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.amount.target - this.amount.raised);
});

// Virtual for days remaining
donationSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.timeline.endDate);
  const diffTime = endDate - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// Virtual for primary image
donationSchema.virtual('primaryImage').get(function() {
  if (!this.media.images || this.media.images.length === 0) return null;
  const primary = this.media.images.find(img => img.isPrimary);
  return primary ? primary.url : this.media.images[0].url;
});

const Donation = model("Donation", donationSchema, "donations");
export default Donation;

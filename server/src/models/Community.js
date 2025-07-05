import { Schema, model } from "mongoose";
import slug from "slugify";

const communitySchema = new Schema({
  title: {
    type: String,
    required: [true, "Community item title is required"],
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
    enum: ["initiative", "testimonial", "story", "achievement", "event", "project", "announcement"],
    required: [true, "Community type is required"]
  },
  category: {
    type: String,
    enum: ["education", "welfare", "spiritual", "social", "charity", "youth", "women", "general"],
    default: "general",
    required: true
  },
  content: {
    fullText: {
      type: String,
      trim: true
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Excerpt cannot exceed 300 characters"]
    },
    highlights: [{
      type: String,
      trim: true
    }],
    achievements: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      date: {
        type: Date
      },
      metrics: {
        value: Number,
        unit: String,
        description: String
      }
    }]
  },
  participants: {
    featured: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      role: {
        type: String,
        trim: true
      },
      bio: {
        type: String,
        trim: true,
        maxlength: [300, "Bio cannot exceed 300 characters"]
      },
      image: {
        type: String
      },
      testimonial: {
        type: String,
        trim: true,
        maxlength: [500, "Testimonial cannot exceed 500 characters"]
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    totalCount: {
      type: Number,
      default: 0,
      min: 0
    },
    demographics: {
      ageGroups: {
        youth: { type: Number, default: 0 },
        adults: { type: Number, default: 0 },
        seniors: { type: Number, default: 0 }
      },
      gender: {
        male: { type: Number, default: 0 },
        female: { type: Number, default: 0 }
      }
    }
  },
  timeline: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
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
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  location: {
    venue: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: "Enugu"
    },
    state: {
      type: String,
      trim: true,
      default: "Enugu State"
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
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
      duration: Number // in seconds
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
        enum: ["pdf", "doc", "presentation", "report"],
        required: true
      }
    }]
  },
  impact: {
    beneficiaries: {
      type: Number,
      default: 0,
      min: 0
    },
    metrics: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }],
    outcomes: [{
      type: String,
      trim: true
    }],
    feedback: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      averageRating: { type: Number, min: 0, max: 5, default: 0 }
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
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived", "ongoing", "completed", "cancelled"],
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

// Pre-save middleware to generate slug
communitySchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slug(this.title, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Validate timeline dates
communitySchema.pre('save', function(next) {
  if (this.timeline.startDate && this.timeline.endDate && this.timeline.startDate >= this.timeline.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Index for better query performance
communitySchema.index({ status: 1, type: 1 });
communitySchema.index({ category: 1, status: 1 });
communitySchema.index({ featured: 1, status: 1 });
communitySchema.index({ tags: 1, status: 1 });
communitySchema.index({ slug: 1 });
communitySchema.index({ 'timeline.startDate': 1 });
communitySchema.index({ priority: 1, status: 1 });

// Text index for search functionality
communitySchema.index({
  title: 'text',
  description: 'text',
  'content.fullText': 'text',
  tags: 'text'
});

// Virtual for checking if item is ongoing
communitySchema.virtual('isOngoing').get(function() {
  if (!this.timeline.startDate || !this.timeline.endDate) return false;
  const now = new Date();
  return this.timeline.startDate <= now && now <= this.timeline.endDate;
});

// Virtual for completion percentage
communitySchema.virtual('completionPercentage').get(function() {
  if (!this.timeline.milestones || this.timeline.milestones.length === 0) return 0;
  const completed = this.timeline.milestones.filter(m => m.completed).length;
  return Math.round((completed / this.timeline.milestones.length) * 100);
});

// Virtual for primary image
communitySchema.virtual('primaryImage').get(function() {
  if (!this.media.images || this.media.images.length === 0) return null;
  const primary = this.media.images.find(img => img.isPrimary);
  return primary ? primary.url : this.media.images[0].url;
});

const Community = model("Community", communitySchema, "community");
export default Community;

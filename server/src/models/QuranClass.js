import { Schema, model } from "mongoose";
import slug from "slugify";

const quranClassSchema = new Schema({
  title: {
    type: String,
    required: [true, "Class title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Class description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  program: {
    type: String,
    enum: ["tajweed", "memorization", "tafseer", "arabic", "general"],
    required: [true, "Program type is required"]
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "all"],
    default: "beginner",
    required: true
  },
  instructor: {
    name: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    qualifications: [{
      type: String,
      trim: true
    }],
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"]
    },
    image: {
      type: String
    }
  },
  schedule: {
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "monthly", "custom"],
      default: "weekly",
      required: true
    },
    daysOfWeek: [{
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    }],
    time: {
      type: String,
      required: [true, "Time is required"]
    },
    duration: {
      type: Number, // in minutes
      default: 60,
      min: 15,
      max: 300
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  venue: {
    name: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    capacity: {
      type: Number,
      min: 1,
      max: 200
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    onlineLink: {
      type: String,
      trim: true
    },
    requirements: [{
      type: String,
      trim: true
    }]
  },
  curriculum: {
    objectives: [{
      type: String,
      required: true,
      trim: true
    }],
    topics: [{
      week: {
        type: Number,
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
      verses: [{
        surah: String,
        ayah: String,
        text: String
      }]
    }],
    materials: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ["book", "pdf", "audio", "video", "link"],
        required: true
      },
      url: {
        type: String
      },
      isRequired: {
        type: Boolean,
        default: false
      }
    }],
    assessments: [{
      type: {
        type: String,
        enum: ["quiz", "recitation", "memorization", "written"],
        required: true
      },
      title: {
        type: String,
        required: true
      },
      week: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        min: 0,
        max: 100
      }
    }]
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    ageGroup: {
      type: String,
      enum: ["children", "youth", "adults", "seniors", "all"],
      default: "all"
    },
    gender: {
      type: String,
      enum: ["male", "female", "mixed"],
      default: "mixed"
    },
    experience: {
      type: String,
      enum: ["none", "basic", "intermediate", "advanced"],
      default: "none"
    }
  },
  fees: {
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: "NGN"
    },
    paymentSchedule: {
      type: String,
      enum: ["free", "one-time", "weekly", "monthly", "per-session"],
      default: "free"
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false
    }
  },
  enrollment: {
    isOpen: {
      type: Boolean,
      default: true
    },
    maxStudents: {
      type: Number,
      min: 1,
      max: 200
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: 0
    },
    registrationDeadline: {
      type: Date
    },
    requirements: [{
      type: String,
      trim: true
    }]
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ["draft", "published", "ongoing", "completed", "cancelled"],
    default: "draft",
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  language: {
    type: String,
    default: "english",
    enum: ["english", "arabic", "hausa", "yoruba", "igbo"]
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
quranClassSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slug(this.title, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Validate online venue requirements
quranClassSchema.pre('save', function(next) {
  if (this.venue.isOnline && !this.venue.onlineLink) {
    return next(new Error('Online link is required for online classes'));
  }
  next();
});

// Validate enrollment capacity
quranClassSchema.pre('save', function(next) {
  if (this.enrollment.maxStudents && this.enrollment.currentStudents > this.enrollment.maxStudents) {
    return next(new Error('Current students cannot exceed maximum capacity'));
  }
  next();
});

// Validate schedule dates
quranClassSchema.pre('save', function(next) {
  if (this.schedule.startDate && this.schedule.endDate && this.schedule.startDate >= this.schedule.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Index for better query performance
quranClassSchema.index({ status: 1, program: 1 });
quranClassSchema.index({ level: 1, status: 1 });
quranClassSchema.index({ 'instructor.name': 1 });
quranClassSchema.index({ slug: 1 });
quranClassSchema.index({ tags: 1 });
quranClassSchema.index({ 'schedule.startDate': 1 });

// Virtual for checking if enrollment is open and available
quranClassSchema.virtual('isEnrollmentAvailable').get(function() {
  if (!this.enrollment.isOpen) return false;
  if (this.enrollment.registrationDeadline && this.enrollment.registrationDeadline < new Date()) return false;
  if (this.enrollment.maxStudents && this.enrollment.currentStudents >= this.enrollment.maxStudents) return false;
  return true;
});

// Virtual for enrollment progress percentage
quranClassSchema.virtual('enrollmentProgress').get(function() {
  if (!this.enrollment.maxStudents) return 0;
  return Math.round((this.enrollment.currentStudents / this.enrollment.maxStudents) * 100);
});

const QuranClass = model("QuranClass", quranClassSchema, "quranclasses");
export default QuranClass;

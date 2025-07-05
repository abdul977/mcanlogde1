import { Schema, model } from "mongoose";
import slug from "slugify";

const lectureSchema = new Schema({
  title: {
    type: String,
    required: [true, "Lecture title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Lecture description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  speaker: {
    name: {
      type: String,
      required: [true, "Speaker name is required"],
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"]
    },
    image: {
      type: String
    }
  },
  type: {
    type: String,
    enum: ["regular", "special", "workshop", "seminar"],
    default: "regular",
    required: true
  },
  schedule: {
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "monthly", "custom"],
      default: "once"
    },
    dayOfWeek: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    },
    time: {
      type: String,
      required: [true, "Time is required"]
    },
    duration: {
      type: Number, // in minutes
      default: 90
    }
  },
  date: {
    type: Date,
    required: function() {
      return this.schedule.frequency === 'once';
    }
  },
  topics: [{
    type: String,
    trim: true,
    maxlength: [100, "Topic cannot exceed 100 characters"]
  }],
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "all"],
    default: "all"
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
      min: 1
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    onlineLink: {
      type: String,
      trim: true
    }
  },
  image: {
    type: String
  },
  materials: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["pdf", "video", "audio", "link"],
      required: true
    }
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ["draft", "published", "cancelled", "completed"],
    default: "draft",
    required: true
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  maxAttendees: {
    type: Number,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: 0
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
lectureSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slug(this.title, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Validate online venue requirements
lectureSchema.pre('save', function(next) {
  if (this.venue.isOnline && !this.venue.onlineLink) {
    return next(new Error('Online link is required for online lectures'));
  }
  next();
});

// Validate attendee count
lectureSchema.pre('save', function(next) {
  if (this.maxAttendees && this.currentAttendees > this.maxAttendees) {
    return next(new Error('Current attendees cannot exceed maximum attendees'));
  }
  next();
});

// Index for better query performance
lectureSchema.index({ status: 1, date: 1 });
lectureSchema.index({ type: 1, status: 1 });
lectureSchema.index({ 'speaker.name': 1 });
lectureSchema.index({ slug: 1 });
lectureSchema.index({ tags: 1 });

// Virtual for checking if lecture is upcoming
lectureSchema.virtual('isUpcoming').get(function() {
  if (this.schedule.frequency === 'once') {
    return this.date && this.date > new Date();
  }
  return this.status === 'published';
});

// Virtual for checking if registration is full
lectureSchema.virtual('isRegistrationFull').get(function() {
  return this.maxAttendees && this.currentAttendees >= this.maxAttendees;
});

const Lecture = model("Lecture", lectureSchema, "lectures");
export default Lecture;

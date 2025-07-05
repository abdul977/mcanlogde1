import { Schema, model } from "mongoose";
import slug from "slugify";

const serviceSchema = new Schema({
  title: {
    type: String,
    required: [true, "Service title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Service description is required"],
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  icon: {
    type: String,
    required: [true, "Service icon is required"],
    default: "FaHandsHelping"
  },
  features: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Feature cannot exceed 100 characters"]
  }],
  image: {
    type: String,
    required: false // Optional service image
  },
  status: {
    type: String,
    enum: ["active", "inactive", "draft"],
    default: "active",
    required: true
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    enum: ["accommodation", "education", "spiritual", "welfare", "career", "social"],
    default: "welfare",
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    }
  },
  eligibility: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  applicationProcess: {
    type: String,
    trim: true,
    maxlength: [1000, "Application process cannot exceed 1000 characters"]
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
serviceSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slug(this.title, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

// Validate features array
serviceSchema.path('features').validate(function(features) {
  return features && features.length > 0 && features.length <= 10;
}, 'Service must have between 1 and 10 features');

// Index for better query performance
serviceSchema.index({ status: 1, displayOrder: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ slug: 1 });

const Service = model("Service", serviceSchema, "services");
export default Service;

import { Schema, model } from "mongoose";

const postSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  accommodationType: {
    type: String,
    required: [true, "Accommodation type is required"],
    enum: ["Single Room", "Shared Apartment", "Family Unit", "Studio"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  images: {
    type: [String],
    required: true,
    validate: [arrayLimit, "You must provide exactly 3 images"],
  },
  slug: {
    type: String,
    unique: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
  // Admin-controlled status management
  adminStatus: {
    type: String,
    enum: ["active", "hidden", "coming_soon", "maintenance", "not_available"],
    default: "active",
    required: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  // Visibility control
  isVisible: {
    type: Boolean,
    default: true,
    required: true
  },
  guest: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  price: {
    type: Number,
    required: true,
    min: 10000, // Minimum price in Naira
    max: 500000, // Maximum price in Naira
  },
  mosqueProximity: {
    type: Number, // Distance to nearest mosque in meters
    required: [true, "Distance to nearest mosque is required"],
    min: 0,
  },
  prayerFacilities: {
    type: Boolean,
    required: true,
    default: false,
  },
  genderRestriction: {
    type: String,
    enum: ["brothers", "sisters", "family", "none"],
    required: [true, "Gender restriction information is required"],
  },
  nearbyFacilities: {
    mosques: [{
      name: String,
      distance: Number, // in meters
    }],
    halalRestaurants: [{
      name: String,
      distance: Number, // in meters
    }],
    islamicCenters: [{
      name: String,
      distance: Number, // in meters
    }],
  },
  nearArea: {
    type: [String],
    required: true,
  },
  facilities: {
    type: [String],
    required: true,
  },
  rules: {
    type: [String],
    default: [
      "No mixing of non-mahrams",
      "Respect prayer times",
      "Maintain Islamic etiquette"
    ],
  },
  additionalNotes: {
    type: String,
  },
  landlordContact: {
    name: String,
    phone: String,
    preferredContactTime: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val) {
  return val.length === 3;
}

postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

postSchema.pre('save', function(next) {
  this.price = Math.round(this.price);
  next();
});

const Post = model("Post", postSchema, "posts");
export default Post;

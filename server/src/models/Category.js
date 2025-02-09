import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // FontAwesome icon identifier
    required: true,
    default: "home", // Default icon
  },
  features: [{
    type: String,
    required: false,
  }],
  targetGender: {
    type: String,
    enum: ["brothers", "sisters", "family", "any"],
    default: "any"
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  requirements: [{
    type: String,
    required: false,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update timestamp on document update
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Category", categorySchema);

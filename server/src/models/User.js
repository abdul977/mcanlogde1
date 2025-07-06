import mongoose from "mongoose";

const userModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // NYSC-specific fields
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  stateCode: {
    type: String,
    uppercase: true,
    trim: true,
  },
  batch: {
    type: String,
    trim: true,
  },
  stream: {
    type: String,
    enum: ["A", "B", "C"],
  },
  callUpNumber: {
    type: String,
    trim: true,
  },
  // Additional profile fields
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  institution: {
    type: String,
    trim: true,
  },
  course: {
    type: String,
    trim: true,
  },
  // Profile completion tracking
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  resetTokenExpiration: Date,
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Method to check if profile is complete
userModel.methods.isProfileComplete = function() {
  const requiredFields = ['name', 'email', 'gender', 'stateCode', 'batch', 'stream', 'callUpNumber'];
  return requiredFields.every(field => this[field] && this[field].toString().trim() !== '');
};

// Pre-save middleware to update profileCompleted status
userModel.pre('save', function(next) {
  this.profileCompleted = this.isProfileComplete();
  next();
});

// Virtual for formatted call-up number
userModel.virtual('formattedCallUpNumber').get(function() {
  if (!this.callUpNumber) return '';
  return this.callUpNumber.toUpperCase();
});

// Virtual for full NYSC details
userModel.virtual('nyscDetails').get(function() {
  return {
    gender: this.gender,
    stateCode: this.stateCode,
    batch: this.batch,
    stream: this.stream,
    callUpNumber: this.callUpNumber,
    isComplete: this.profileCompleted
  };
});

// Ensure virtual fields are serialized
userModel.set('toJSON', { virtuals: true });
userModel.set('toObject', { virtuals: true });

export default mongoose.model("User", userModel);

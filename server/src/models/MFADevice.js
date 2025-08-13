import mongoose from "mongoose";
import crypto from "crypto";

const mfaDeviceSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
    index: true
  },
  // Device information
  deviceName: {
    type: String,
    required: [true, "Device name is required"],
    trim: true,
    maxlength: [50, "Device name cannot exceed 50 characters"]
  },
  deviceType: {
    type: String,
    enum: ["authenticator_app", "sms", "email", "hardware_token"],
    required: [true, "Device type is required"]
  },
  // TOTP specific fields
  secret: {
    type: String,
    required: function() {
      return this.deviceType === 'authenticator_app';
    },
    select: false // Don't include in queries by default
  },
  // Phone number for SMS
  phoneNumber: {
    type: String,
    required: function() {
      return this.deviceType === 'sms';
    },
    validate: {
      validator: function(v) {
        if (this.deviceType !== 'sms') return true;
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  // Email for email-based MFA
  email: {
    type: String,
    required: function() {
      return this.deviceType === 'email';
    },
    validate: {
      validator: function(v) {
        if (this.deviceType !== 'email') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  // Device status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  // Backup codes
  backupCodes: [{
    code: {
      type: String,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    }
  }],
  // Usage statistics
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0
  },
  // Security tracking
  createdFrom: {
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      region: String,
      city: String
    }
  },
  // Verification attempts
  verificationAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: {
      type: Date
    },
    lockedUntil: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
mfaDeviceSchema.index({ user: 1, isActive: 1 });
mfaDeviceSchema.index({ user: 1, isPrimary: 1 });
mfaDeviceSchema.index({ user: 1, deviceType: 1 });
mfaDeviceSchema.index({ isVerified: 1, isActive: 1 });

// Virtual for device status
mfaDeviceSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.isVerified) return 'pending_verification';
  if (this.verificationAttempts.lockedUntil && this.verificationAttempts.lockedUntil > new Date()) {
    return 'locked';
  }
  return 'active';
});

// Virtual for available backup codes
mfaDeviceSchema.virtual('availableBackupCodes').get(function() {
  return this.backupCodes.filter(code => !code.used).length;
});

// Instance methods
mfaDeviceSchema.methods.generateBackupCodes = function(count = 10) {
  this.backupCodes = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.backupCodes.push({ code });
  }
  
  return this.backupCodes.map(bc => bc.code);
};

mfaDeviceSchema.methods.useBackupCode = function(code) {
  const backupCode = this.backupCodes.find(bc => 
    bc.code === code.toUpperCase() && !bc.used
  );
  
  if (!backupCode) {
    return { success: false, message: 'Invalid or already used backup code' };
  }
  
  backupCode.used = true;
  backupCode.usedAt = new Date();
  
  return { success: true, message: 'Backup code used successfully' };
};

mfaDeviceSchema.methods.recordUsage = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

mfaDeviceSchema.methods.recordVerificationAttempt = function(success = false) {
  if (!success) {
    this.verificationAttempts.count += 1;
    this.verificationAttempts.lastAttempt = new Date();
    
    // Lock device after 5 failed attempts for 30 minutes
    if (this.verificationAttempts.count >= 5) {
      this.verificationAttempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  } else {
    // Reset attempts on successful verification
    this.verificationAttempts.count = 0;
    this.verificationAttempts.lockedUntil = undefined;
    this.recordUsage();
  }
  
  return this.save();
};

mfaDeviceSchema.methods.isLocked = function() {
  return this.verificationAttempts.lockedUntil && 
         this.verificationAttempts.lockedUntil > new Date();
};

mfaDeviceSchema.methods.activate = function() {
  this.isActive = true;
  this.isVerified = true;
  return this.save();
};

mfaDeviceSchema.methods.deactivate = function() {
  this.isActive = false;
  this.isPrimary = false;
  return this.save();
};

mfaDeviceSchema.methods.setPrimary = async function() {
  // Remove primary status from other devices
  await this.constructor.updateMany(
    { user: this.user, _id: { $ne: this._id } },
    { isPrimary: false }
  );
  
  this.isPrimary = true;
  return this.save();
};

// Static methods
mfaDeviceSchema.statics.findUserDevices = function(userId, activeOnly = true) {
  const query = { user: userId };
  if (activeOnly) {
    query.isActive = true;
    query.isVerified = true;
  }
  return this.find(query).sort({ isPrimary: -1, createdAt: -1 });
};

mfaDeviceSchema.statics.findPrimaryDevice = function(userId) {
  return this.findOne({
    user: userId,
    isPrimary: true,
    isActive: true,
    isVerified: true
  });
};

mfaDeviceSchema.statics.createDevice = async function(userId, deviceData, createdFrom = {}) {
  const device = new this({
    user: userId,
    ...deviceData,
    createdFrom
  });
  
  // Generate backup codes for authenticator apps
  if (device.deviceType === 'authenticator_app') {
    device.generateBackupCodes();
  }
  
  return await device.save();
};

mfaDeviceSchema.statics.getUserDeviceCount = function(userId, deviceType = null) {
  const query = { 
    user: userId, 
    isActive: true, 
    isVerified: true 
  };
  
  if (deviceType) {
    query.deviceType = deviceType;
  }
  
  return this.countDocuments(query);
};

mfaDeviceSchema.statics.cleanupUnverifiedDevices = async function() {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  const result = await this.deleteMany({
    isVerified: false,
    createdAt: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

// Pre-save middleware
mfaDeviceSchema.pre('save', async function(next) {
  // Ensure only one primary device per user
  if (this.isPrimary && this.isModified('isPrimary')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  
  // If this is the first device for the user, make it primary
  if (this.isNew && this.isVerified) {
    const deviceCount = await this.constructor.countDocuments({
      user: this.user,
      isActive: true,
      isVerified: true
    });
    
    if (deviceCount === 0) {
      this.isPrimary = true;
    }
  }
  
  next();
});

// Pre-remove middleware
mfaDeviceSchema.pre('remove', async function(next) {
  // If removing primary device, set another device as primary
  if (this.isPrimary) {
    const nextDevice = await this.constructor.findOne({
      user: this.user,
      _id: { $ne: this._id },
      isActive: true,
      isVerified: true
    }).sort({ createdAt: -1 });
    
    if (nextDevice) {
      nextDevice.isPrimary = true;
      await nextDevice.save();
    }
  }
  
  next();
});

const MFADevice = mongoose.model("MFADevice", mfaDeviceSchema);

export default MFADevice;

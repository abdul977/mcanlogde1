import mongoose from "mongoose";
import crypto from "crypto";

const refreshTokenSchema = new mongoose.Schema({
  // Token hash (never store plain tokens)
  tokenHash: {
    type: String,
    required: [true, "Token hash is required"],
    unique: true,
    index: true
  },
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
    index: true
  },
  // Token metadata
  jti: {
    type: String, // JWT ID for token tracking
    required: true,
    unique: true,
    index: true
  },
  // Device and session information
  deviceInfo: {
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown"
    },
    browser: {
      type: String,
      trim: true
    },
    os: {
      type: String,
      trim: true
    },
    deviceFingerprint: {
      type: String,
      trim: true
    }
  },
  // Token lifecycle
  issuedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  // Token status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  revokedReason: {
    type: String,
    enum: [
      "user_logout",
      "admin_revoke", 
      "security_breach",
      "token_rotation",
      "account_locked",
      "suspicious_activity",
      "expired",
      "device_change"
    ]
  },
  // Token family for rotation tracking
  tokenFamily: {
    type: String,
    required: true,
    index: true
  },
  // Previous token in the rotation chain
  previousToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RefreshToken"
  },
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsageCount: {
    type: Number,
    default: 1 // Refresh tokens should typically be single-use
  },
  // Security flags
  securityFlags: {
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    multipleDevices: {
      type: Boolean,
      default: false
    },
    locationChange: {
      type: Boolean,
      default: false
    }
  },
  // Geolocation data (optional)
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
refreshTokenSchema.index({ user: 1, isActive: 1 });
refreshTokenSchema.index({ user: 1, tokenFamily: 1 });
refreshTokenSchema.index({ expiresAt: 1, isActive: 1 });
refreshTokenSchema.index({ isRevoked: 1, revokedAt: 1 });
refreshTokenSchema.index({ "deviceInfo.ipAddress": 1, user: 1 });

// Virtual for token age
refreshTokenSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((new Date() - this.issuedAt) / (1000 * 60));
});

// Virtual for time until expiration
refreshTokenSchema.virtual('minutesUntilExpiry').get(function() {
  return Math.floor((this.expiresAt - new Date()) / (1000 * 60));
});

// Virtual for token status summary
refreshTokenSchema.virtual('status').get(function() {
  if (this.isRevoked) return 'revoked';
  if (this.expiresAt < new Date()) return 'expired';
  if (!this.isActive) return 'inactive';
  if (this.usageCount >= this.maxUsageCount) return 'exhausted';
  return 'active';
});

// Instance methods
refreshTokenSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

refreshTokenSchema.methods.isUsable = function() {
  return this.isActive && 
         !this.isRevoked && 
         !this.isExpired() && 
         this.usageCount < this.maxUsageCount;
};

refreshTokenSchema.methods.use = async function() {
  if (!this.isUsable()) {
    throw new Error('Token is not usable');
  }
  
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  
  // If single-use token, deactivate after use
  if (this.maxUsageCount === 1) {
    this.isActive = false;
  }
  
  return await this.save();
};

refreshTokenSchema.methods.revoke = async function(revokedBy, reason = 'user_logout') {
  this.isRevoked = true;
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revokedReason = reason;
  
  return await this.save();
};

refreshTokenSchema.methods.flagSuspicious = async function(reason) {
  this.securityFlags.suspiciousActivity = true;
  
  // Auto-revoke suspicious tokens
  return await this.revoke(null, 'suspicious_activity');
};

// Static methods
refreshTokenSchema.statics.createToken = async function(userId, deviceInfo, options = {}) {
  const {
    expiresInDays = 7,
    tokenFamily = crypto.randomUUID(),
    previousToken = null,
    location = null
  } = options;
  
  // Generate unique token hash
  const tokenHash = crypto.randomBytes(64).toString('hex');
  const jti = crypto.randomUUID();
  
  const refreshToken = new this({
    tokenHash,
    user: userId,
    jti,
    deviceInfo,
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    tokenFamily,
    previousToken,
    location
  });
  
  return await refreshToken.save();
};

refreshTokenSchema.statics.findByTokenHash = function(tokenHash) {
  return this.findOne({ 
    tokenHash, 
    isActive: true, 
    isRevoked: false 
  }).populate('user');
};

refreshTokenSchema.statics.findByJti = function(jti) {
  return this.findOne({ jti }).populate('user');
};

refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, revokedBy, reason = 'admin_revoke') {
  const tokens = await this.find({
    user: userId,
    isActive: true,
    isRevoked: false
  });
  
  const revokePromises = tokens.map(token => token.revoke(revokedBy, reason));
  return await Promise.all(revokePromises);
};

refreshTokenSchema.statics.revokeTokenFamily = async function(tokenFamily, revokedBy, reason = 'security_breach') {
  const tokens = await this.find({
    tokenFamily,
    isActive: true,
    isRevoked: false
  });
  
  const revokePromises = tokens.map(token => token.revoke(revokedBy, reason));
  return await Promise.all(revokePromises);
};

refreshTokenSchema.statics.cleanupExpiredTokens = async function() {
  const expiredTokens = await this.find({
    expiresAt: { $lt: new Date() },
    isActive: true
  });
  
  const cleanupPromises = expiredTokens.map(token => 
    token.revoke(null, 'expired')
  );
  
  const results = await Promise.all(cleanupPromises);
  return results.length;
};

refreshTokenSchema.statics.getUserActiveTokens = function(userId) {
  return this.find({
    user: userId,
    isActive: true,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).sort({ lastUsedAt: -1 });
};

refreshTokenSchema.statics.detectSuspiciousActivity = async function(userId, deviceInfo) {
  const recentTokens = await this.find({
    user: userId,
    isActive: true,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });
  
  const suspiciousFlags = {
    multipleIPs: false,
    multipleDevices: false,
    rapidTokenCreation: false
  };
  
  if (recentTokens.length > 0) {
    const uniqueIPs = new Set(recentTokens.map(t => t.deviceInfo.ipAddress));
    const uniqueDevices = new Set(recentTokens.map(t => t.deviceInfo.deviceFingerprint).filter(Boolean));
    
    suspiciousFlags.multipleIPs = uniqueIPs.size > 3;
    suspiciousFlags.multipleDevices = uniqueDevices.size > 2;
    suspiciousFlags.rapidTokenCreation = recentTokens.length > 10;
  }
  
  return suspiciousFlags;
};

// Pre-save middleware
refreshTokenSchema.pre('save', function(next) {
  // Auto-generate token family if not provided
  if (!this.tokenFamily) {
    this.tokenFamily = crypto.randomUUID();
  }
  
  next();
});

// Pre-remove middleware
refreshTokenSchema.pre('remove', function(next) {
  // Could add audit logging here
  next();
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;

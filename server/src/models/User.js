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
  // Legacy role field (kept for backward compatibility)
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // New RBAC system - multiple roles support
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
  }],
  // Primary role for quick access
  primaryRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
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
  // RBAC organizational associations
  stateId: {
    type: String,
    trim: true,
    uppercase: true
  },
  chapterId: {
    type: String,
    trim: true
  },
  campusId: {
    type: String,
    trim: true
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
  // Profile image/avatar
  profileImage: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty string or valid URL
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Profile image must be a valid URL'
    }
  },
  avatar: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty string or valid URL
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Avatar must be a valid URL'
    }
  },
  // Profile completion tracking
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  // Security and authentication fields
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    select: false // Don't include in queries by default
  },
  mfaBackupCodes: [{
    code: {
      type: String,
      select: false
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  lastLogin: {
    type: Date
  },
  lastLoginIP: {
    type: String
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  accountLockedUntil: {
    type: Date
  },
  passwordHistory: [{
    hash: {
      type: String,
      select: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Session management
  activeSessions: [{
    sessionId: String,
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceType: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Account status
  accountStatus: {
    type: String,
    enum: ["active", "suspended", "deactivated", "pending_verification"],
    default: "active"
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  // Password reset fields
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

// RBAC Methods
userModel.methods.hasRole = function(roleName) {
  if (!this.roles || this.roles.length === 0) return false;
  return this.roles.some(role =>
    (typeof role === 'string' ? role : role.name) === roleName
  );
};

userModel.methods.hasAnyRole = function(roleNames) {
  return roleNames.some(roleName => this.hasRole(roleName));
};

userModel.methods.addRole = async function(roleId) {
  if (!this.roles.includes(roleId)) {
    this.roles.push(roleId);
    if (!this.primaryRole) {
      this.primaryRole = roleId;
    }
    return await this.save();
  }
  return this;
};

userModel.methods.removeRole = async function(roleId) {
  this.roles = this.roles.filter(role => !role.equals(roleId));
  if (this.primaryRole && this.primaryRole.equals(roleId)) {
    this.primaryRole = this.roles.length > 0 ? this.roles[0] : null;
  }
  return await this.save();
};

// Security Methods
userModel.methods.isAccountLocked = function() {
  return this.accountLocked &&
         this.accountLockedUntil &&
         this.accountLockedUntil > new Date();
};

userModel.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.accountLockedUntil && this.accountLockedUntil < new Date()) {
    return await this.updateOne({
      $unset: { accountLockedUntil: 1 },
      $set: { loginAttempts: 1, accountLocked: false }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we have max attempts and no lock, lock account
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = {
      accountLocked: true,
      accountLockedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };
  }

  return await this.updateOne(updates);
};

userModel.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $unset: { loginAttempts: 1, accountLockedUntil: 1 },
    $set: { accountLocked: false }
  });
};

userModel.methods.recordLogin = async function(ipAddress, userAgent) {
  const updates = {
    lastLogin: new Date(),
    lastLoginIP: ipAddress,
    $unset: { loginAttempts: 1, accountLockedUntil: 1 },
    $set: { accountLocked: false }
  };

  return await this.updateOne(updates);
};

userModel.methods.addSession = async function(sessionId, deviceInfo) {
  // Remove old inactive sessions (keep last 5)
  if (this.activeSessions.length >= 5) {
    this.activeSessions = this.activeSessions
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, 4);
  }

  this.activeSessions.push({
    sessionId,
    deviceInfo,
    createdAt: new Date(),
    lastActivity: new Date(),
    isActive: true
  });

  return await this.save();
};

userModel.methods.removeSession = async function(sessionId) {
  this.activeSessions = this.activeSessions.filter(
    session => session.sessionId !== sessionId
  );
  return await this.save();
};

userModel.methods.updateSessionActivity = async function(sessionId) {
  const session = this.activeSessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.lastActivity = new Date();
    return await this.save();
  }
  return this;
};

// Pre-save middleware to update profileCompleted status
userModel.pre('save', function(next) {
  this.profileCompleted = this.isProfileComplete();

  // Auto-set stateId from stateCode if not provided
  if (this.stateCode && !this.stateId) {
    this.stateId = this.stateCode;
  }

  next();
});

// Indexes for performance
userModel.index({ email: 1 }, { unique: true });
userModel.index({ roles: 1 });
userModel.index({ primaryRole: 1 });
userModel.index({ stateId: 1 });
userModel.index({ chapterId: 1 });
userModel.index({ campusId: 1 });
userModel.index({ accountStatus: 1 });
userModel.index({ lastLogin: 1 });
userModel.index({ accountLocked: 1, accountLockedUntil: 1 });
userModel.index({ "activeSessions.sessionId": 1 });
userModel.index({ emailVerified: 1 });

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

// Virtual for display avatar with fallback logic
userModel.virtual('displayAvatar').get(function() {
  // Priority: avatar -> profileImage -> null (will use initials fallback in frontend)
  return this.avatar || this.profileImage || null;
});

// Virtual for user initials
userModel.virtual('initials').get(function() {
  if (!this.name) return '?';

  const names = this.name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
});

// Virtual for effective role (for backward compatibility)
userModel.virtual('effectiveRole').get(function() {
  // Return primary role if available, otherwise fall back to legacy role
  if (this.primaryRole) {
    return this.primaryRole;
  }
  // Map legacy roles to new system
  if (this.role === 'admin') return 'super_admin';
  return 'member';
});

// Virtual for security status
userModel.virtual('securityStatus').get(function() {
  return {
    mfaEnabled: this.mfaEnabled,
    accountLocked: this.isAccountLocked(),
    emailVerified: this.emailVerified,
    activeSessions: this.activeSessions?.filter(s => s.isActive).length || 0,
    lastLogin: this.lastLogin,
    accountStatus: this.accountStatus
  };
});

// Ensure virtual fields are serialized
userModel.set('toJSON', { virtuals: true });
userModel.set('toObject', { virtuals: true });

export default mongoose.model("User", userModel);

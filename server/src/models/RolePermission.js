import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: [true, "Role is required"]
  },
  permission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission",
    required: [true, "Permission is required"]
  },
  // Override permission scope for this specific role-permission mapping
  scopeOverride: {
    type: String,
    enum: ["global", "national", "state", "campus", "personal", "own_records"]
  },
  // Additional conditions specific to this role-permission mapping
  conditions: {
    // State-specific restrictions
    stateRestrictions: [{
      stateCode: String,
      allowed: {
        type: Boolean,
        default: true
      }
    }],
    // Campus-specific restrictions
    campusRestrictions: [{
      campusId: String,
      allowed: {
        type: Boolean,
        default: true
      }
    }],
    // Time-based overrides
    timeOverrides: {
      allowedHours: {
        start: Number,
        end: Number
      },
      allowedDays: [String]
    },
    // Custom conditions for this mapping
    customConditions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  // Whether this permission is granted or denied for this role
  granted: {
    type: Boolean,
    default: true
  },
  // Whether this mapping is active
  isActive: {
    type: Boolean,
    default: true
  },
  // Expiration date for temporary permissions
  expiresAt: {
    type: Date
  },
  // Audit fields
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  grantedAt: {
    type: Date,
    default: Date.now
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  revokedAt: {
    type: Date
  },
  // Reason for granting/revoking
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });
rolePermissionSchema.index({ role: 1, isActive: 1 });
rolePermissionSchema.index({ permission: 1, isActive: 1 });
rolePermissionSchema.index({ expiresAt: 1 });

// Virtual for effective scope
rolePermissionSchema.virtual('effectiveScope').get(function() {
  return this.scopeOverride || this.permission?.scope;
});

// Instance methods
rolePermissionSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

rolePermissionSchema.methods.isValidForContext = function(context = {}) {
  // Check if mapping is active and not expired
  if (!this.isActive || !this.granted || this.isExpired()) {
    return false;
  }

  // Check state restrictions
  if (context.stateCode && this.conditions.stateRestrictions?.length > 0) {
    const stateRestriction = this.conditions.stateRestrictions.find(
      restriction => restriction.stateCode === context.stateCode
    );
    if (stateRestriction && !stateRestriction.allowed) {
      return false;
    }
  }

  // Check campus restrictions
  if (context.campusId && this.conditions.campusRestrictions?.length > 0) {
    const campusRestriction = this.conditions.campusRestrictions.find(
      restriction => restriction.campusId === context.campusId
    );
    if (campusRestriction && !campusRestriction.allowed) {
      return false;
    }
  }

  // Check time overrides
  if (this.conditions.timeOverrides?.allowedHours) {
    const currentHour = new Date().getHours();
    const { start, end } = this.conditions.timeOverrides.allowedHours;
    if (start !== undefined && end !== undefined) {
      if (start <= end) {
        if (currentHour < start || currentHour > end) return false;
      } else {
        if (currentHour < start && currentHour > end) return false;
      }
    }
  }

  return true;
};

rolePermissionSchema.methods.revoke = function(revokedBy, reason) {
  this.granted = false;
  this.isActive = false;
  this.revokedBy = revokedBy;
  this.revokedAt = new Date();
  this.reason = reason;
  return this.save();
};

// Static methods
rolePermissionSchema.statics.findByRole = function(roleId, includeInactive = false) {
  const query = { role: roleId };
  if (!includeInactive) {
    query.isActive = true;
    query.granted = true;
  }
  return this.find(query).populate('permission');
};

rolePermissionSchema.statics.findByPermission = function(permissionId, includeInactive = false) {
  const query = { permission: permissionId };
  if (!includeInactive) {
    query.isActive = true;
    query.granted = true;
  }
  return this.find(query).populate('role');
};

rolePermissionSchema.statics.grantPermission = async function(roleId, permissionId, grantedBy, options = {}) {
  const existingMapping = await this.findOne({ role: roleId, permission: permissionId });
  
  if (existingMapping) {
    // Update existing mapping
    existingMapping.granted = true;
    existingMapping.isActive = true;
    existingMapping.grantedBy = grantedBy;
    existingMapping.grantedAt = new Date();
    existingMapping.revokedBy = undefined;
    existingMapping.revokedAt = undefined;
    
    if (options.scopeOverride) existingMapping.scopeOverride = options.scopeOverride;
    if (options.conditions) existingMapping.conditions = { ...existingMapping.conditions, ...options.conditions };
    if (options.expiresAt) existingMapping.expiresAt = options.expiresAt;
    if (options.reason) existingMapping.reason = options.reason;
    
    return await existingMapping.save();
  } else {
    // Create new mapping
    const newMapping = new this({
      role: roleId,
      permission: permissionId,
      granted: true,
      isActive: true,
      grantedBy,
      grantedAt: new Date(),
      ...options
    });
    
    return await newMapping.save();
  }
};

rolePermissionSchema.statics.revokePermission = async function(roleId, permissionId, revokedBy, reason) {
  const mapping = await this.findOne({ role: roleId, permission: permissionId });
  
  if (!mapping) {
    throw new Error('Role-permission mapping not found');
  }
  
  return await mapping.revoke(revokedBy, reason);
};

rolePermissionSchema.statics.getRolePermissions = async function(roleId, context = {}) {
  const mappings = await this.find({
    role: roleId,
    isActive: true,
    granted: true
  }).populate('permission');
  
  return mappings.filter(mapping => mapping.isValidForContext(context));
};

rolePermissionSchema.statics.cleanupExpiredPermissions = async function() {
  const expiredMappings = await this.find({
    expiresAt: { $lt: new Date() },
    isActive: true
  });
  
  const results = await Promise.all(
    expiredMappings.map(mapping => 
      mapping.revoke(null, 'Automatic expiration')
    )
  );
  
  return results.length;
};

// Pre-save middleware
rolePermissionSchema.pre('save', function(next) {
  // If revoking, set appropriate fields
  if (!this.granted && this.isActive) {
    this.isActive = false;
    if (!this.revokedAt) {
      this.revokedAt = new Date();
    }
  }
  
  next();
});

// Pre-remove middleware
rolePermissionSchema.pre('remove', async function(next) {
  // Log the removal in audit trail if needed
  // This could be extended to create audit log entries
  next();
});

const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);

export default RolePermission;

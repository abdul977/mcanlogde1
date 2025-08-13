import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Permission name is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: [true, "Display name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Permission description is required"],
    trim: true
  },
  // Resource this permission applies to
  resource: {
    type: String,
    required: [true, "Resource is required"],
    enum: [
      "users", "roles", "permissions", "bookings", "payments", 
      "content", "events", "resources", "reports", "audit_logs",
      "settings", "notifications", "communities", "products",
      "categories", "services", "donations", "messages",
      "quran_classes", "lectures", "blogs"
    ]
  },
  // Action this permission allows
  action: {
    type: String,
    required: [true, "Action is required"],
    enum: ["create", "read", "update", "delete", "approve", "export", "manage", "moderate"]
  },
  // Scope constraints for this permission
  scope: {
    type: String,
    enum: ["global", "national", "state", "campus", "personal", "own_records"],
    default: "personal"
  },
  // Additional conditions and constraints
  conditions: {
    // Field-level restrictions
    fieldRestrictions: [{
      field: String,
      access: {
        type: String,
        enum: ["read", "write", "none"],
        default: "read"
      }
    }],
    // Time-based restrictions
    timeRestrictions: {
      allowedHours: {
        start: {
          type: Number,
          min: 0,
          max: 23
        },
        end: {
          type: Number,
          min: 0,
          max: 23
        }
      },
      allowedDays: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      }]
    },
    // IP-based restrictions
    ipRestrictions: {
      allowedIPs: [String],
      blockedIPs: [String]
    },
    // Additional custom conditions
    customConditions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  // Permission category for grouping
  category: {
    type: String,
    enum: [
      "user_management", "content_management", "financial", 
      "administrative", "reporting", "security", "communication"
    ],
    required: true
  },
  // Risk level of this permission
  riskLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  // Whether this permission requires additional approval
  requiresApproval: {
    type: Boolean,
    default: false
  },
  // Whether this permission requires MFA
  requiresMFA: {
    type: Boolean,
    default: false
  },
  // Permission status
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemPermission: {
    type: Boolean,
    default: false // System permissions cannot be deleted
  },
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ category: 1, riskLevel: 1 });
permissionSchema.index({ scope: 1, isActive: 1 });
permissionSchema.index({ name: 1 }, { unique: true });

// Virtual for permission identifier
permissionSchema.virtual('identifier').get(function() {
  return `${this.resource}:${this.action}:${this.scope}`;
});

// Instance methods
permissionSchema.methods.isAllowedForUser = function(user, context = {}) {
  // Check if permission is active
  if (!this.isActive) return false;

  // Check time restrictions
  if (this.conditions.timeRestrictions.allowedHours) {
    const currentHour = new Date().getHours();
    const { start, end } = this.conditions.timeRestrictions.allowedHours;
    if (start !== undefined && end !== undefined) {
      if (start <= end) {
        if (currentHour < start || currentHour > end) return false;
      } else {
        if (currentHour < start && currentHour > end) return false;
      }
    }
  }

  // Check day restrictions
  if (this.conditions.timeRestrictions.allowedDays?.length > 0) {
    const currentDay = new Date().toLocaleLowerCase().slice(0, 3);
    const dayMap = {
      'sun': 'sunday', 'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday',
      'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday'
    };
    if (!this.conditions.timeRestrictions.allowedDays.includes(dayMap[currentDay])) {
      return false;
    }
  }

  // Check IP restrictions
  if (context.ipAddress) {
    if (this.conditions.ipRestrictions.blockedIPs?.includes(context.ipAddress)) {
      return false;
    }
    if (this.conditions.ipRestrictions.allowedIPs?.length > 0) {
      if (!this.conditions.ipRestrictions.allowedIPs.includes(context.ipAddress)) {
        return false;
      }
    }
  }

  return true;
};

permissionSchema.methods.getFieldAccess = function(fieldName) {
  const fieldRestriction = this.conditions.fieldRestrictions?.find(
    restriction => restriction.field === fieldName
  );
  return fieldRestriction?.access || 'read';
};

// Static methods
permissionSchema.statics.findByResource = function(resource) {
  return this.find({ resource, isActive: true }).sort({ action: 1 });
};

permissionSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ riskLevel: 1, name: 1 });
};

permissionSchema.statics.findByRiskLevel = function(riskLevel) {
  return this.find({ riskLevel, isActive: true }).sort({ category: 1, name: 1 });
};

permissionSchema.statics.getPermissionMatrix = async function() {
  const permissions = await this.find({ isActive: true });
  const matrix = {};
  
  permissions.forEach(permission => {
    if (!matrix[permission.resource]) {
      matrix[permission.resource] = {};
    }
    if (!matrix[permission.resource][permission.action]) {
      matrix[permission.resource][permission.action] = [];
    }
    matrix[permission.resource][permission.action].push({
      id: permission._id,
      name: permission.name,
      scope: permission.scope,
      riskLevel: permission.riskLevel,
      requiresMFA: permission.requiresMFA
    });
  });
  
  return matrix;
};

// Pre-save middleware
permissionSchema.pre('save', function(next) {
  // Auto-generate name if not provided
  if (!this.name) {
    this.name = `${this.resource}_${this.action}_${this.scope}`.toLowerCase();
  }
  
  // Auto-generate display name if not provided
  if (!this.displayName) {
    const actionMap = {
      'create': 'Create',
      'read': 'View',
      'update': 'Edit',
      'delete': 'Delete',
      'approve': 'Approve',
      'export': 'Export',
      'manage': 'Manage',
      'moderate': 'Moderate'
    };
    
    const resourceName = this.resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const actionName = actionMap[this.action] || this.action;
    const scopeName = this.scope === 'own_records' ? 'Own' : this.scope.replace(/\b\w/g, l => l.toUpperCase());
    
    this.displayName = `${actionName} ${resourceName} (${scopeName})`;
  }
  
  next();
});

// Pre-remove middleware
permissionSchema.pre('remove', function(next) {
  if (this.isSystemPermission) {
    const error = new Error('Cannot delete system permission');
    error.status = 400;
    return next(error);
  }
  next();
});

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;

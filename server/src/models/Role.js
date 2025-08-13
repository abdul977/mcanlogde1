import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Role name is required"],
    unique: true,
    trim: true,
    enum: [
      "super_admin",
      "national_admin", 
      "state_admin",
      "mclo_admin",
      "finance_treasurer",
      "member",
      "auditor"
    ]
  },
  displayName: {
    type: String,
    required: [true, "Display name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Role description is required"],
    trim: true
  },
  // Hierarchy level (lower number = higher authority)
  hierarchyLevel: {
    type: Number,
    required: [true, "Hierarchy level is required"],
    min: [1, "Hierarchy level must be at least 1"],
    max: [7, "Hierarchy level cannot exceed 7"]
  },
  // Scope of authority
  scope: {
    type: String,
    enum: ["global", "national", "state", "campus", "personal"],
    required: [true, "Role scope is required"]
  },
  // Default permissions for this role
  defaultPermissions: [{
    resource: {
      type: String,
      required: true,
      enum: [
        "users", "roles", "permissions", "bookings", "payments", 
        "content", "events", "resources", "reports", "audit_logs",
        "settings", "notifications", "communities", "products",
        "categories", "services", "donations"
      ]
    },
    actions: [{
      type: String,
      enum: ["create", "read", "update", "delete", "approve", "export", "manage"]
    }],
    conditions: {
      // Conditions for permission (e.g., own_state_only, own_campus_only)
      scope: {
        type: String,
        enum: ["all", "global", "national", "state", "campus", "personal", "own_state", "own_campus", "own_records", "subordinates"]
      },
      // Additional constraints
      constraints: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }
  }],
  // Role capabilities and restrictions
  capabilities: {
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageRoles: {
      type: Boolean,
      default: false
    },
    canViewAuditLogs: {
      type: Boolean,
      default: false
    },
    canExportData: {
      type: Boolean,
      default: false
    },
    canManageSettings: {
      type: Boolean,
      default: false
    },
    requiresMFA: {
      type: Boolean,
      default: false
    },
    maxSessionDuration: {
      type: Number, // in minutes
      default: 480 // 8 hours
    },
    allowedIPRanges: [{
      type: String,
      validate: {
        validator: function(v) {
          // Basic IP/CIDR validation
          return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(v);
        },
        message: 'Invalid IP range format'
      }
    }]
  },
  // Role status and metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemRole: {
    type: Boolean,
    default: false // System roles cannot be deleted
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

// Indexes for performance
roleSchema.index({ name: 1 });
roleSchema.index({ hierarchyLevel: 1 });
roleSchema.index({ scope: 1 });
roleSchema.index({ isActive: 1 });

// Virtual for role authority level
roleSchema.virtual('authorityLevel').get(function() {
  const levels = {
    1: 'Supreme',
    2: 'National',
    3: 'State',
    4: 'Campus',
    5: 'Departmental',
    6: 'Basic',
    7: 'Observer'
  };
  return levels[this.hierarchyLevel] || 'Unknown';
});

// Instance methods
roleSchema.methods.hasPermission = function(resource, action, scope = 'all') {
  return this.defaultPermissions.some(permission => 
    permission.resource === resource && 
    permission.actions.includes(action) &&
    (permission.conditions.scope === 'all' || permission.conditions.scope === scope)
  );
};

roleSchema.methods.canManageRole = function(targetRole) {
  // Can only manage roles with higher hierarchy level (lower authority)
  return this.hierarchyLevel < targetRole.hierarchyLevel;
};

roleSchema.methods.getPermissionsForResource = function(resource) {
  return this.defaultPermissions.filter(permission => permission.resource === resource);
};

// Static methods
roleSchema.statics.getRoleHierarchy = function() {
  return [
    { level: 1, name: 'super_admin', displayName: 'Super Admin' },
    { level: 2, name: 'national_admin', displayName: 'National Admin' },
    { level: 3, name: 'state_admin', displayName: 'State Admin' },
    { level: 4, name: 'mclo_admin', displayName: 'MCLO Admin' },
    { level: 5, name: 'finance_treasurer', displayName: 'Finance/Treasurer' },
    { level: 6, name: 'member', displayName: 'Member' },
    { level: 7, name: 'auditor', displayName: 'Auditor/Read-Only' }
  ];
};

roleSchema.statics.findByHierarchyLevel = function(level) {
  return this.find({ hierarchyLevel: level, isActive: true });
};

roleSchema.statics.findSubordinateRoles = function(hierarchyLevel) {
  return this.find({ 
    hierarchyLevel: { $gt: hierarchyLevel }, 
    isActive: true 
  }).sort({ hierarchyLevel: 1 });
};

// Pre-save middleware
roleSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase().replace(/\s+/g, '_');
  }
  next();
});

// Pre-remove middleware to prevent deletion of system roles
roleSchema.pre('remove', function(next) {
  if (this.isSystemRole) {
    const error = new Error('Cannot delete system role');
    error.status = 400;
    return next(error);
  }
  next();
});

const Role = mongoose.model("Role", roleSchema);

export default Role;

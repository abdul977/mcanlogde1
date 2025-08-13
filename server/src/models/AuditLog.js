import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  // User who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
    index: true
  },
  // Action details
  action: {
    type: String,
    required: [true, "Action is required"],
    enum: [
      // Authentication actions
      "login", "logout", "login_failed", "password_reset", "password_changed",
      "mfa_setup", "mfa_verified", "mfa_failed", "account_locked", "account_unlocked",
      
      // User management actions
      "user_created", "user_updated", "user_deleted", "user_role_changed",
      "user_permissions_changed", "user_suspended", "user_activated",
      
      // Role and permission actions
      "role_created", "role_updated", "role_deleted", "permission_granted", 
      "permission_revoked", "role_assigned", "role_removed",
      
      // Resource actions
      "booking_created", "booking_updated", "booking_approved", "booking_cancelled",
      "payment_created", "payment_approved", "payment_rejected",
      "content_created", "content_updated", "content_deleted", "content_published",
      
      // System actions
      "settings_updated", "system_backup", "system_restore", "data_export",
      "bulk_operation", "api_key_created", "api_key_revoked",
      
      // Security actions
      "security_breach_detected", "suspicious_activity", "rate_limit_exceeded",
      "unauthorized_access_attempt", "privilege_escalation_attempt"
    ]
  },
  // Resource being acted upon
  resource: {
    type: String,
    required: [true, "Resource is required"],
    enum: [
      "user", "role", "permission", "booking", "payment", "content", "post",
      "category", "accommodation", "settings", "system", "session", "mfa_device",
      "audit_log", "api_key", "notification", "report"
    ]
  },
  // Resource ID (if applicable)
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  // Target user (for user management actions)
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  // Action result
  result: {
    type: String,
    enum: ["success", "failure", "partial", "pending"],
    required: [true, "Result is required"],
    index: true
  },
  // Detailed description
  description: {
    type: String,
    required: [true, "Description is required"],
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  // Request details
  requestDetails: {
    method: String,
    url: String,
    userAgent: String,
    ipAddress: {
      type: String,
      required: true,
      index: true
    },
    headers: {
      type: Map,
      of: String
    },
    body: {
      type: mongoose.Schema.Types.Mixed
    },
    query: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  // Response details
  responseDetails: {
    statusCode: Number,
    responseTime: Number, // in milliseconds
    dataSize: Number // response size in bytes
  },
  // Security context
  securityContext: {
    sessionId: String,
    tokenId: String,
    mfaVerified: {
      type: Boolean,
      default: false
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },
    threatIndicators: [String]
  },
  // Changes made (for update operations)
  changes: {
    before: {
      type: mongoose.Schema.Types.Mixed
    },
    after: {
      type: mongoose.Schema.Types.Mixed
    },
    fields: [String] // List of changed fields
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Geolocation data
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  // Error details (for failed actions)
  error: {
    code: String,
    message: String,
    stack: String
  },
  // Retention and compliance
  retentionDate: {
    type: Date,
    index: true
  },
  complianceFlags: {
    gdprRelevant: {
      type: Boolean,
      default: false
    },
    piiInvolved: {
      type: Boolean,
      default: false
    },
    financialData: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ result: 1, createdAt: -1 });
auditLogSchema.index({ "securityContext.riskLevel": 1, createdAt: -1 });
auditLogSchema.index({ "requestDetails.ipAddress": 1, createdAt: -1 });
auditLogSchema.index({ retentionDate: 1 });

// Virtual for action severity
auditLogSchema.virtual('severity').get(function() {
  const highSeverityActions = [
    'user_deleted', 'role_deleted', 'permission_revoked', 'security_breach_detected',
    'unauthorized_access_attempt', 'privilege_escalation_attempt'
  ];
  
  const mediumSeverityActions = [
    'user_role_changed', 'user_permissions_changed', 'settings_updated',
    'mfa_failed', 'account_locked', 'suspicious_activity'
  ];
  
  if (highSeverityActions.includes(this.action)) return 'high';
  if (mediumSeverityActions.includes(this.action)) return 'medium';
  return 'low';
});

// Instance methods
auditLogSchema.methods.addThreatIndicator = function(indicator) {
  if (!this.securityContext.threatIndicators.includes(indicator)) {
    this.securityContext.threatIndicators.push(indicator);
  }
  return this.save();
};

auditLogSchema.methods.updateRiskLevel = function(level) {
  this.securityContext.riskLevel = level;
  return this.save();
};

auditLogSchema.methods.maskSensitiveData = function() {
  // Create a copy without sensitive data
  const masked = this.toObject();
  
  // Mask sensitive fields
  if (masked.requestDetails?.body?.password) {
    masked.requestDetails.body.password = '***MASKED***';
  }
  
  if (masked.requestDetails?.body?.token) {
    masked.requestDetails.body.token = '***MASKED***';
  }
  
  if (masked.changes?.before?.password) {
    masked.changes.before.password = '***MASKED***';
  }
  
  if (masked.changes?.after?.password) {
    masked.changes.after.password = '***MASKED***';
  }
  
  return masked;
};

// Static methods
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    // Set retention date (default 7 years for compliance)
    const retentionYears = actionData.retentionYears || 7;
    actionData.retentionDate = new Date(Date.now() + retentionYears * 365 * 24 * 60 * 60 * 1000);
    
    const auditLog = new this(actionData);
    return await auditLog.save();
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

auditLogSchema.statics.findByUser = function(userId, options = {}) {
  const { limit = 50, skip = 0, startDate, endDate } = options;
  
  const query = { user: userId };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email')
    .populate('targetUser', 'name email');
};

auditLogSchema.statics.findByAction = function(action, options = {}) {
  const { limit = 50, skip = 0, startDate, endDate } = options;
  
  const query = { action };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email')
    .populate('targetUser', 'name email');
};

auditLogSchema.statics.findSecurityEvents = function(options = {}) {
  const { limit = 100, skip = 0, riskLevel = 'medium' } = options;
  
  const securityActions = [
    'login_failed', 'security_breach_detected', 'suspicious_activity',
    'unauthorized_access_attempt', 'privilege_escalation_attempt',
    'rate_limit_exceeded', 'mfa_failed'
  ];
  
  const query = {
    $or: [
      { action: { $in: securityActions } },
      { 'securityContext.riskLevel': { $in: [riskLevel, 'high', 'critical'] } }
    ]
  };
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email');
};

auditLogSchema.statics.getActionStatistics = async function(timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
  
  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ['$result', 'success'] }, 1, 0] }
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ['$result', 'failure'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

auditLogSchema.statics.cleanupExpiredLogs = async function() {
  const result = await this.deleteMany({
    retentionDate: { $lt: new Date() }
  });
  
  return result.deletedCount;
};

// Pre-save middleware
auditLogSchema.pre('save', function(next) {
  // Auto-detect PII involvement
  if (this.resource === 'user' || this.targetUser) {
    this.complianceFlags.piiInvolved = true;
  }
  
  // Auto-detect financial data
  if (this.resource === 'payment' || this.action.includes('payment')) {
    this.complianceFlags.financialData = true;
  }
  
  // Set GDPR relevance for EU users (simplified check)
  if (this.complianceFlags.piiInvolved) {
    this.complianceFlags.gdprRelevant = true;
  }
  
  next();
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;

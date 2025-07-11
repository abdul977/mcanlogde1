import mongoose from 'mongoose';

const paymentAuditLogSchema = new mongoose.Schema({
  // Reference to the payment verification
  paymentVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentVerification',
    required: true
  },

  // Reference to the booking
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },

  // User who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of action performed
  action: {
    type: String,
    enum: [
      'payment_submitted',
      'payment_approved',
      'payment_rejected',
      'payment_resubmitted',
      'receipt_generated',
      'receipt_downloaded',
      'payment_exported',
      'payment_viewed',
      'payment_edited',
      'payment_deleted',
      'status_changed',
      'notes_added',
      'file_uploaded',
      'file_deleted'
    ],
    required: true
  },

  // Detailed description of the action
  description: {
    type: String,
    required: true
  },

  // Previous state (for tracking changes)
  previousState: {
    status: String,
    amount: Number,
    paymentMethod: String,
    notes: String,
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verifiedAt: Date
  },

  // New state (for tracking changes)
  newState: {
    status: String,
    amount: Number,
    paymentMethod: String,
    notes: String,
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verifiedAt: Date
  },

  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    requestId: String,
    fileDetails: {
      filename: String,
      size: Number,
      mimetype: String
    },
    exportDetails: {
      format: String,
      filters: mongoose.Schema.Types.Mixed,
      recordCount: Number
    }
  },

  // Severity level
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Category for grouping
  category: {
    type: String,
    enum: [
      'submission',
      'verification',
      'administration',
      'export',
      'security',
      'system'
    ],
    required: true
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  },

  // Additional tags for filtering
  tags: [{
    type: String
  }]
}, {
  timestamps: true,
  collection: 'payment_audit_logs'
});

// Indexes for efficient querying
paymentAuditLogSchema.index({ paymentVerification: 1, timestamp: -1 });
paymentAuditLogSchema.index({ booking: 1, timestamp: -1 });
paymentAuditLogSchema.index({ performedBy: 1, timestamp: -1 });
paymentAuditLogSchema.index({ action: 1, timestamp: -1 });
paymentAuditLogSchema.index({ category: 1, timestamp: -1 });
paymentAuditLogSchema.index({ severity: 1, timestamp: -1 });
paymentAuditLogSchema.index({ timestamp: -1 });

// Virtual for formatted timestamp
paymentAuditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Method to get human-readable action description
paymentAuditLogSchema.methods.getActionDescription = function() {
  const actionDescriptions = {
    'payment_submitted': 'Payment proof submitted',
    'payment_approved': 'Payment approved by admin',
    'payment_rejected': 'Payment rejected by admin',
    'payment_resubmitted': 'Payment proof resubmitted',
    'receipt_generated': 'Payment receipt generated',
    'receipt_downloaded': 'Payment receipt downloaded',
    'payment_exported': 'Payment data exported',
    'payment_viewed': 'Payment details viewed',
    'payment_edited': 'Payment details edited',
    'payment_deleted': 'Payment record deleted',
    'status_changed': 'Payment status changed',
    'notes_added': 'Notes added to payment',
    'file_uploaded': 'Payment proof file uploaded',
    'file_deleted': 'Payment proof file deleted'
  };
  
  return actionDescriptions[this.action] || this.action;
};

// Static method to log an action
paymentAuditLogSchema.statics.logAction = async function(data) {
  try {
    const logEntry = new this(data);
    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Error logging payment audit action:', error);
    throw error;
  }
};

// Static method to get audit trail for a payment
paymentAuditLogSchema.statics.getPaymentAuditTrail = async function(paymentId, options = {}) {
  try {
    const { limit = 50, page = 1, category, action } = options;
    
    const query = { paymentVerification: paymentId };
    if (category) query.category = category;
    if (action) query.action = action;
    
    const logs = await this.find(query)
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await this.countDocuments(query);
    
    return {
      logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  } catch (error) {
    console.error('Error getting payment audit trail:', error);
    throw error;
  }
};

// Static method to get user activity
paymentAuditLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  try {
    const { limit = 50, page = 1, startDate, endDate } = options;
    
    const query = { performedBy: userId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await this.find(query)
      .populate('paymentVerification', 'monthNumber amount')
      .populate('booking', 'accommodation', { populate: { path: 'accommodation', select: 'title' } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await this.countDocuments(query);
    
    return {
      logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
};

// Static method to get system statistics
paymentAuditLogSchema.statics.getAuditStatistics = async function(options = {}) {
  try {
    const { startDate, endDate } = options;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    
    const stats = await this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          actionsByCategory: {
            $push: {
              category: '$category',
              action: '$action'
            }
          },
          actionsBySeverity: {
            $push: '$severity'
          }
        }
      },
      {
        $project: {
          totalActions: 1,
          categoryBreakdown: {
            $reduce: {
              input: '$actionsByCategory',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [[{
                      k: '$$this.category',
                      v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.category', input: '$$value' } }, 0] }, 1] }
                    }]]
                  }
                ]
              }
            }
          },
          severityBreakdown: {
            $reduce: {
              input: '$actionsBySeverity',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [[{
                      k: '$$this',
                      v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] }
                    }]]
                  }
                ]
              }
            }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalActions: 0,
      categoryBreakdown: {},
      severityBreakdown: {}
    };
  } catch (error) {
    console.error('Error getting audit statistics:', error);
    throw error;
  }
};

export default mongoose.model('PaymentAuditLog', paymentAuditLogSchema);

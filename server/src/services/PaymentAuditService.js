import PaymentAuditLog from '../models/PaymentAuditLog.js';

class PaymentAuditService {
  
  /**
   * Log a payment-related action
   */
  static async logAction({
    paymentVerificationId,
    bookingId,
    performedBy,
    action,
    description,
    previousState = null,
    newState = null,
    metadata = {},
    severity = 'medium',
    category,
    tags = [],
    req = null
  }) {
    try {
      // Extract request metadata if available
      if (req) {
        metadata.ipAddress = req.ip || req.connection.remoteAddress;
        metadata.userAgent = req.get('User-Agent');
        metadata.sessionId = req.sessionID;
        metadata.requestId = req.id;
      }

      const logData = {
        paymentVerification: paymentVerificationId,
        booking: bookingId,
        performedBy,
        action,
        description,
        previousState,
        newState,
        metadata,
        severity,
        category,
        tags
      };

      const auditLog = await PaymentAuditLog.logAction(logData);
      console.log(`Payment audit logged: ${action} by ${performedBy}`);
      
      return auditLog;
    } catch (error) {
      console.error('Error in PaymentAuditService.logAction:', error);
      // Don't throw error to prevent breaking main functionality
      return null;
    }
  }

  /**
   * Log payment submission
   */
  static async logPaymentSubmission(paymentVerification, user, req = null) {
    return this.logAction({
      paymentVerificationId: paymentVerification._id,
      bookingId: paymentVerification.booking,
      performedBy: user._id,
      action: 'payment_submitted',
      description: `Payment proof submitted for month ${paymentVerification.monthNumber} - Amount: ₦${paymentVerification.amount.toLocaleString()}`,
      newState: {
        status: paymentVerification.verificationStatus,
        amount: paymentVerification.amount,
        paymentMethod: paymentVerification.paymentMethod
      },
      metadata: {
        fileDetails: {
          filename: paymentVerification.paymentProof?.filename,
          size: paymentVerification.paymentProof?.size,
          mimetype: paymentVerification.paymentProof?.mimetype
        }
      },
      severity: 'medium',
      category: 'submission',
      tags: ['user_action', 'file_upload'],
      req
    });
  }

  /**
   * Log payment verification (approval/rejection)
   */
  static async logPaymentVerification(payment, admin, action, adminNotes, previousStatus, req = null) {
    const isApproval = action === 'approve';
    
    return this.logAction({
      paymentVerificationId: payment._id,
      bookingId: payment.booking,
      performedBy: admin._id,
      action: isApproval ? 'payment_approved' : 'payment_rejected',
      description: `Payment ${action}d by admin${adminNotes ? ` - Notes: ${adminNotes}` : ''}`,
      previousState: {
        status: previousStatus,
        verifiedBy: null,
        verifiedAt: null
      },
      newState: {
        status: payment.verificationStatus,
        verifiedBy: payment.verifiedBy,
        verifiedAt: payment.verifiedAt,
        notes: adminNotes
      },
      severity: isApproval ? 'medium' : 'high',
      category: 'verification',
      tags: ['admin_action', isApproval ? 'approval' : 'rejection'],
      req
    });
  }

  /**
   * Log receipt generation
   */
  static async logReceiptGeneration(payment, receiptInfo, req = null) {
    return this.logAction({
      paymentVerificationId: payment._id,
      bookingId: payment.booking,
      performedBy: payment.verifiedBy || payment.user,
      action: 'receipt_generated',
      description: `Payment receipt generated - Receipt #${receiptInfo.receiptNumber}`,
      metadata: {
        receiptDetails: {
          receiptNumber: receiptInfo.receiptNumber,
          filename: receiptInfo.filename
        }
      },
      severity: 'low',
      category: 'administration',
      tags: ['receipt', 'document_generation'],
      req
    });
  }

  /**
   * Log receipt download
   */
  static async logReceiptDownload(payment, user, req = null) {
    return this.logAction({
      paymentVerificationId: payment._id,
      bookingId: payment.booking,
      performedBy: user._id,
      action: 'receipt_downloaded',
      description: `Payment receipt downloaded - Receipt #${payment.receiptNumber}`,
      metadata: {
        receiptDetails: {
          receiptNumber: payment.receiptNumber,
          downloadedBy: user.role
        }
      },
      severity: 'low',
      category: 'administration',
      tags: ['receipt', 'download'],
      req
    });
  }

  /**
   * Log payment export
   */
  static async logPaymentExport(user, exportDetails, req = null) {
    return this.logAction({
      paymentVerificationId: null, // Not specific to one payment
      bookingId: null,
      performedBy: user._id,
      action: 'payment_exported',
      description: `Payment data exported in ${exportDetails.format} format - ${exportDetails.recordCount} records`,
      metadata: {
        exportDetails: {
          format: exportDetails.format,
          filters: exportDetails.filters,
          recordCount: exportDetails.recordCount,
          filename: exportDetails.filename
        }
      },
      severity: 'medium',
      category: 'export',
      tags: ['admin_action', 'data_export', exportDetails.format],
      req
    });
  }

  /**
   * Log payment viewing
   */
  static async logPaymentView(paymentId, bookingId, user, req = null) {
    return this.logAction({
      paymentVerificationId: paymentId,
      bookingId: bookingId,
      performedBy: user._id,
      action: 'payment_viewed',
      description: `Payment details viewed by ${user.role}`,
      severity: 'low',
      category: 'administration',
      tags: ['view', user.role],
      req
    });
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(paymentId, bookingId, user, eventType, description, req = null) {
    return this.logAction({
      paymentVerificationId: paymentId,
      bookingId: bookingId,
      performedBy: user._id,
      action: eventType,
      description: description,
      severity: 'high',
      category: 'security',
      tags: ['security', 'alert'],
      req
    });
  }

  /**
   * Get audit trail for a payment
   */
  static async getPaymentAuditTrail(paymentId, options = {}) {
    try {
      return await PaymentAuditLog.getPaymentAuditTrail(paymentId, options);
    } catch (error) {
      console.error('Error getting payment audit trail:', error);
      throw error;
    }
  }

  /**
   * Get user activity
   */
  static async getUserActivity(userId, options = {}) {
    try {
      return await PaymentAuditLog.getUserActivity(userId, options);
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(options = {}) {
    try {
      return await PaymentAuditLog.getAuditStatistics(options);
    } catch (error) {
      console.error('Error getting audit statistics:', error);
      throw error;
    }
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  static async cleanupOldLogs(daysToKeep = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await PaymentAuditLog.deleteMany({
        timestamp: { $lt: cutoffDate },
        severity: { $in: ['low', 'medium'] } // Keep high and critical logs longer
      });
      
      console.log(`Cleaned up ${result.deletedCount} old audit logs`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      throw error;
    }
  }

  /**
   * Get recent suspicious activities
   */
  static async getSuspiciousActivities(options = {}) {
    try {
      const { limit = 50, hours = 24 } = options;
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);
      
      const suspiciousLogs = await PaymentAuditLog.find({
        timestamp: { $gte: cutoffDate },
        $or: [
          { severity: 'critical' },
          { category: 'security' },
          { action: { $in: ['payment_rejected', 'file_deleted'] } }
        ]
      })
      .populate('performedBy', 'name email role')
      .populate('paymentVerification', 'monthNumber amount')
      .sort({ timestamp: -1 })
      .limit(limit);
      
      return suspiciousLogs;
    } catch (error) {
      console.error('Error getting suspicious activities:', error);
      throw error;
    }
  }
}

export default PaymentAuditService;

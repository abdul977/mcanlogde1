import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Security Monitoring Service
 */
class SecurityMonitor {
  constructor() {
    this.alertThresholds = {
      failedLogins: 5, // per 15 minutes
      suspiciousIPs: 3, // different IPs per user per hour
      rapidRequests: 100, // requests per minute
      privilegeEscalation: 1, // any attempt
      dataExport: 5, // exports per day
      adminActions: 20 // admin actions per hour
    };
    
    this.monitoringInterval = 5 * 60 * 1000; // 5 minutes
    this.alertCallbacks = [];
  }

  /**
   * Start security monitoring
   */
  start() {
    console.log('🔒 Starting security monitoring service...');
    
    // Run initial check
    this.runSecurityChecks();
    
    // Schedule periodic checks
    this.monitoringTimer = setInterval(() => {
      this.runSecurityChecks();
    }, this.monitoringInterval);
  }

  /**
   * Stop security monitoring
   */
  stop() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    console.log('🔒 Security monitoring service stopped');
  }

  /**
   * Add alert callback
   */
  addAlertCallback(callback) {
    this.alertCallbacks.push(callback);
  }

  /**
   * Trigger security alert
   */
  async triggerAlert(alertData) {
    try {
      // Log the security event
      await AuditLog.logAction({
        user: alertData.userId || null,
        action: 'security_breach_detected',
        resource: 'system',
        result: 'success',
        description: alertData.description,
        requestDetails: {
          ipAddress: alertData.ipAddress || 'unknown',
          userAgent: alertData.userAgent || 'unknown'
        },
        securityContext: {
          riskLevel: alertData.severity || 'high',
          threatIndicators: alertData.indicators || []
        },
        metadata: alertData.metadata || {}
      });

      // Call alert callbacks
      for (const callback of this.alertCallbacks) {
        try {
          await callback(alertData);
        } catch (error) {
          console.error('Error in alert callback:', error);
        }
      }

      console.warn('🚨 SECURITY ALERT:', alertData.description);

    } catch (error) {
      console.error('Error triggering security alert:', error);
    }
  }

  /**
   * Run all security checks
   */
  async runSecurityChecks() {
    try {
      await Promise.all([
        this.checkFailedLogins(),
        this.checkSuspiciousIPs(),
        this.checkPrivilegeEscalation(),
        this.checkUnusualAccess(),
        this.checkDataExports(),
        this.checkAccountLockouts(),
        this.checkTokenAnomalies()
      ]);
    } catch (error) {
      console.error('Error running security checks:', error);
    }
  }

  /**
   * Check for excessive failed login attempts
   */
  async checkFailedLogins() {
    const timeWindow = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
    
    const failedLogins = await AuditLog.aggregate([
      {
        $match: {
          action: 'login_failed',
          createdAt: { $gte: timeWindow }
        }
      },
      {
        $group: {
          _id: '$requestDetails.ipAddress',
          count: { $sum: 1 },
          users: { $addToSet: '$user' },
          lastAttempt: { $max: '$createdAt' }
        }
      },
      {
        $match: {
          count: { $gte: this.alertThresholds.failedLogins }
        }
      }
    ]);

    for (const attack of failedLogins) {
      await this.triggerAlert({
        type: 'brute_force_attack',
        severity: 'high',
        description: `Brute force attack detected from IP ${attack._id}: ${attack.count} failed login attempts in 15 minutes`,
        ipAddress: attack._id,
        indicators: ['brute_force', 'failed_authentication'],
        metadata: {
          attemptCount: attack.count,
          targetUsers: attack.users.length,
          lastAttempt: attack.lastAttempt
        }
      });
    }
  }

  /**
   * Check for suspicious IP patterns
   */
  async checkSuspiciousIPs() {
    const timeWindow = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    const suspiciousUsers = await AuditLog.aggregate([
      {
        $match: {
          action: { $in: ['login', 'login_failed'] },
          createdAt: { $gte: timeWindow }
        }
      },
      {
        $group: {
          _id: '$user',
          ips: { $addToSet: '$requestDetails.ipAddress' },
          locations: { $addToSet: '$location.country' }
        }
      },
      {
        $match: {
          $or: [
            { 'ips.3': { $exists: true } }, // More than 3 IPs
            { 'locations.2': { $exists: true } } // More than 2 countries
          ]
        }
      }
    ]);

    for (const suspiciousUser of suspiciousUsers) {
      const user = await User.findById(suspiciousUser._id);
      if (user) {
        await this.triggerAlert({
          type: 'suspicious_location',
          severity: 'medium',
          description: `Suspicious access pattern for user ${user.email}: multiple IPs/locations in 1 hour`,
          userId: user._id,
          indicators: ['multiple_locations', 'ip_hopping'],
          metadata: {
            ipCount: suspiciousUser.ips.length,
            ips: suspiciousUser.ips,
            countries: suspiciousUser.locations
          }
        });
      }
    }
  }

  /**
   * Check for privilege escalation attempts
   */
  async checkPrivilegeEscalation() {
    const timeWindow = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    const escalationAttempts = await AuditLog.find({
      action: { $in: ['user_role_changed', 'permission_granted', 'role_assigned'] },
      result: 'failure',
      createdAt: { $gte: timeWindow }
    }).populate('user', 'name email');

    for (const attempt of escalationAttempts) {
      await this.triggerAlert({
        type: 'privilege_escalation',
        severity: 'critical',
        description: `Failed privilege escalation attempt by ${attempt.user?.email || 'unknown user'}`,
        userId: attempt.user?._id,
        indicators: ['privilege_escalation', 'unauthorized_access'],
        metadata: {
          action: attempt.action,
          targetUser: attempt.targetUser,
          timestamp: attempt.createdAt
        }
      });
    }
  }

  /**
   * Check for unusual access patterns
   */
  async checkUnusualAccess() {
    const timeWindow = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    // Check for off-hours admin activity
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) { // Outside 6 AM - 10 PM
      const adminActivity = await AuditLog.find({
        action: { $in: ['user_deleted', 'role_deleted', 'settings_updated'] },
        createdAt: { $gte: timeWindow }
      }).populate('user', 'name email roles');

      for (const activity of adminActivity) {
        await this.triggerAlert({
          type: 'off_hours_admin',
          severity: 'medium',
          description: `Off-hours admin activity: ${activity.user?.email} performed ${activity.action} at ${activity.createdAt}`,
          userId: activity.user?._id,
          indicators: ['off_hours_access', 'admin_activity'],
          metadata: {
            action: activity.action,
            hour: currentHour,
            timestamp: activity.createdAt
          }
        });
      }
    }
  }

  /**
   * Check for excessive data exports
   */
  async checkDataExports() {
    const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    const exports = await AuditLog.aggregate([
      {
        $match: {
          action: 'data_export',
          createdAt: { $gte: timeWindow }
        }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          actions: { $push: '$createdAt' }
        }
      },
      {
        $match: {
          count: { $gte: this.alertThresholds.dataExport }
        }
      }
    ]);

    for (const userExports of exports) {
      const user = await User.findById(userExports._id);
      if (user) {
        await this.triggerAlert({
          type: 'excessive_data_export',
          severity: 'high',
          description: `Excessive data exports by ${user.email}: ${userExports.count} exports in 24 hours`,
          userId: user._id,
          indicators: ['data_exfiltration', 'excessive_exports'],
          metadata: {
            exportCount: userExports.count,
            timestamps: userExports.actions
          }
        });
      }
    }
  }

  /**
   * Check for account lockout patterns
   */
  async checkAccountLockouts() {
    const timeWindow = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    const lockouts = await AuditLog.find({
      action: 'account_locked',
      createdAt: { $gte: timeWindow }
    }).populate('user', 'name email');

    if (lockouts.length >= 5) { // 5 or more lockouts in an hour
      await this.triggerAlert({
        type: 'mass_account_lockout',
        severity: 'high',
        description: `Mass account lockout detected: ${lockouts.length} accounts locked in 1 hour`,
        indicators: ['mass_lockout', 'potential_attack'],
        metadata: {
          lockoutCount: lockouts.length,
          affectedUsers: lockouts.map(l => l.user?.email).filter(Boolean)
        }
      });
    }
  }

  /**
   * Check for token anomalies
   */
  async checkTokenAnomalies() {
    // Check for tokens from suspicious locations
    const suspiciousTokens = await RefreshToken.find({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      'securityFlags.suspiciousActivity': true
    }).populate('user', 'name email');

    for (const token of suspiciousTokens) {
      await this.triggerAlert({
        type: 'suspicious_token',
        severity: 'medium',
        description: `Suspicious token activity detected for user ${token.user?.email}`,
        userId: token.user?._id,
        indicators: ['suspicious_token', 'anomalous_behavior'],
        metadata: {
          tokenId: token._id,
          deviceInfo: token.deviceInfo,
          location: token.location
        }
      });
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(timeframe = 24) {
    const startDate = new Date(Date.now() - timeframe * 60 * 60 * 1000);
    
    const stats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          securityEvents: {
            $sum: {
              $cond: [
                {
                  $in: ['$action', [
                    'login_failed', 'security_breach_detected', 'suspicious_activity',
                    'unauthorized_access_attempt', 'privilege_escalation_attempt'
                  ]]
                },
                1, 0
              ]
            }
          },
          failedLogins: {
            $sum: { $cond: [{ $eq: ['$action', 'login_failed'] }, 1, 0] }
          },
          successfulLogins: {
            $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] }
          },
          uniqueIPs: { $addToSet: '$requestDetails.ipAddress' },
          highRiskEvents: {
            $sum: {
              $cond: [
                { $in: ['$securityContext.riskLevel', ['high', 'critical']] },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalEvents: 0,
      securityEvents: 0,
      failedLogins: 0,
      successfulLogins: 0,
      uniqueIPs: [],
      highRiskEvents: 0
    };
  }
}

// Create singleton instance
const securityMonitor = new SecurityMonitor();

export default securityMonitor;

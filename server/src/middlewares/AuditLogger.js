import AuditLog from '../models/AuditLog.js';

/**
 * Audit Logger Middleware
 */
class AuditLogger {
  constructor() {
    this.sensitiveFields = ['password', 'token', 'secret', 'key', 'mfaSecret'];
    this.excludedPaths = ['/health', '/ping', '/favicon.ico'];
  }

  /**
   * Create audit log entry
   */
  async logAction(actionData) {
    try {
      // Remove sensitive data from request body
      const sanitizedBody = this.sanitizeData(actionData.requestDetails?.body);
      
      const logEntry = {
        ...actionData,
        requestDetails: {
          ...actionData.requestDetails,
          body: sanitizedBody
        }
      };

      return await AuditLog.logAction(logEntry);
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error to avoid breaking the main request
    }
  }

  /**
   * Sanitize sensitive data
   */
  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    
    for (const field of this.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***MASKED***';
      }
    }
    
    return sanitized;
  }

  /**
   * Extract request details
   */
  extractRequestDetails(req) {
    return {
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      headers: this.sanitizeHeaders(req.headers),
      body: req.body,
      query: req.query
    };
  }

  /**
   * Sanitize headers (remove sensitive ones)
   */
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***MASKED***';
      }
    }
    
    return sanitized;
  }

  /**
   * Determine risk level based on action and context
   */
  determineRiskLevel(action, user, requestDetails) {
    // Critical actions
    const criticalActions = [
      'user_deleted', 'role_deleted', 'security_breach_detected',
      'unauthorized_access_attempt', 'privilege_escalation_attempt'
    ];
    
    // High risk actions
    const highRiskActions = [
      'user_role_changed', 'permission_granted', 'permission_revoked',
      'settings_updated', 'data_export', 'system_backup'
    ];
    
    // Medium risk actions
    const mediumRiskActions = [
      'user_created', 'user_updated', 'mfa_setup', 'password_changed',
      'payment_approved', 'content_deleted'
    ];

    if (criticalActions.includes(action)) return 'critical';
    if (highRiskActions.includes(action)) return 'high';
    if (mediumRiskActions.includes(action)) return 'medium';
    
    // Check for suspicious patterns
    if (this.isSuspiciousRequest(requestDetails)) return 'high';
    
    return 'low';
  }

  /**
   * Check for suspicious request patterns
   */
  isSuspiciousRequest(requestDetails) {
    const suspiciousPatterns = [
      /script/i, /alert/i, /eval/i, /javascript:/i,
      /union.*select/i, /drop.*table/i, /insert.*into/i
    ];
    
    const requestString = JSON.stringify(requestDetails).toLowerCase();
    
    return suspiciousPatterns.some(pattern => pattern.test(requestString));
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

/**
 * Middleware to automatically log all requests
 */
export const auditMiddleware = (req, res, next) => {
  // Skip excluded paths
  if (auditLogger.excludedPaths.some(path => req.path.includes(path))) {
    return next();
  }

  const startTime = Date.now();
  
  // Store original res.json to capture response
  const originalJson = res.json;
  let responseData = null;
  
  res.json = function(data) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Store original res.end to capture when response is sent
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Create audit log entry for significant actions
    if (req.method !== 'GET' || res.statusCode >= 400) {
      const requestDetails = auditLogger.extractRequestDetails(req);
      const user = req.user;
      
      if (user) {
        const action = auditLogger.mapRequestToAction(req, res);
        const resource = auditLogger.mapRequestToResource(req);
        
        if (action && resource) {
          const riskLevel = auditLogger.determineRiskLevel(action, user, requestDetails);
          
          auditLogger.logAction({
            user: user._id || user.id,
            action,
            resource,
            resourceId: req.params.id || req.params.userId || null,
            targetUser: req.params.userId || req.body.userId || null,
            result: res.statusCode < 400 ? 'success' : 'failure',
            description: auditLogger.generateDescription(action, resource, req, res),
            requestDetails,
            responseDetails: {
              statusCode: res.statusCode,
              responseTime,
              dataSize: res.get('Content-Length') || 0
            },
            securityContext: {
              sessionId: req.sessionID,
              tokenId: req.user?.jti,
              mfaVerified: req.mfaInfo?.verified || false,
              riskLevel,
              threatIndicators: auditLogger.isSuspiciousRequest(requestDetails) ? ['suspicious_pattern'] : []
            },
            metadata: {
              userAgent: requestDetails.userAgent,
              referer: req.get('Referer'),
              responseData: responseData?.success !== undefined ? { success: responseData.success } : null
            }
          });
        }
      }
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Map HTTP request to audit action
 */
auditLogger.mapRequestToAction = (req, res) => {
  const { method, path } = req;
  const statusCode = res.statusCode;
  
  // Authentication actions
  if (path.includes('/login')) {
    return statusCode < 400 ? 'login' : 'login_failed';
  }
  if (path.includes('/logout')) return 'logout';
  if (path.includes('/register')) return 'user_created';
  if (path.includes('/password') && method === 'POST') return 'password_changed';
  
  // MFA actions
  if (path.includes('/mfa/setup')) return 'mfa_setup';
  if (path.includes('/mfa/verify')) {
    return statusCode < 400 ? 'mfa_verified' : 'mfa_failed';
  }
  
  // User management
  if (path.includes('/users') || path.includes('/user')) {
    if (method === 'POST') return 'user_created';
    if (method === 'PUT' || method === 'PATCH') return 'user_updated';
    if (method === 'DELETE') return 'user_deleted';
  }
  
  // Role management
  if (path.includes('/role')) {
    if (method === 'POST') return 'role_created';
    if (method === 'PUT' || method === 'PATCH') return 'role_updated';
    if (method === 'DELETE') return 'role_deleted';
  }
  
  // Booking actions
  if (path.includes('/booking')) {
    if (method === 'POST') return 'booking_created';
    if (method === 'PUT' || method === 'PATCH') {
      if (path.includes('/status')) return 'booking_approved';
      if (path.includes('/cancel')) return 'booking_cancelled';
      return 'booking_updated';
    }
  }
  
  // Payment actions
  if (path.includes('/payment')) {
    if (method === 'POST') return 'payment_created';
    if (method === 'PUT' && path.includes('/approve')) return 'payment_approved';
  }
  
  // Content actions
  if (path.includes('/content') || path.includes('/post')) {
    if (method === 'POST') return 'content_created';
    if (method === 'PUT' || method === 'PATCH') return 'content_updated';
    if (method === 'DELETE') return 'content_deleted';
  }
  
  // Settings
  if (path.includes('/settings') && (method === 'PUT' || method === 'PATCH')) {
    return 'settings_updated';
  }
  
  return null; // No specific action mapping
};

/**
 * Map HTTP request to resource type
 */
auditLogger.mapRequestToResource = (req) => {
  const { path } = req;
  
  if (path.includes('/user')) return 'user';
  if (path.includes('/role')) return 'role';
  if (path.includes('/permission')) return 'permission';
  if (path.includes('/booking')) return 'booking';
  if (path.includes('/payment')) return 'payment';
  if (path.includes('/content') || path.includes('/post')) return 'content';
  if (path.includes('/category')) return 'category';
  if (path.includes('/settings')) return 'settings';
  if (path.includes('/mfa')) return 'mfa_device';
  
  return 'system'; // Default resource
};

/**
 * Generate human-readable description
 */
auditLogger.generateDescription = (action, resource, req, res) => {
  const user = req.user;
  const userName = user?.name || user?.email || 'Unknown User';
  const statusCode = res.statusCode;
  const success = statusCode < 400 ? 'successfully' : 'failed to';
  
  const actionMap = {
    'login': `User ${userName} ${success} logged in`,
    'logout': `User ${userName} logged out`,
    'user_created': `User ${userName} ${success} created a new user account`,
    'user_updated': `User ${userName} ${success} updated user information`,
    'user_deleted': `User ${userName} ${success} deleted a user account`,
    'mfa_setup': `User ${userName} ${success} set up MFA`,
    'mfa_verified': `User ${userName} ${success} verified MFA`,
    'booking_created': `User ${userName} ${success} created a booking`,
    'payment_approved': `User ${userName} ${success} approved a payment`,
    'settings_updated': `User ${userName} ${success} updated system settings`
  };
  
  return actionMap[action] || `User ${userName} performed ${action} on ${resource}`;
};

/**
 * Manual audit logging function
 */
export const logAuditEvent = async (eventData) => {
  return await auditLogger.logAction(eventData);
};

/**
 * Audit controller for admin access
 */
export const getAuditLogsController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      user,
      resource,
      startDate,
      endDate,
      riskLevel
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (action) query.action = action;
    if (user) query.user = user;
    if (resource) query.resource = resource;
    if (riskLevel) query['securityContext.riskLevel'] = riskLevel;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email')
      .populate('targetUser', 'name email');

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      logs: logs.map(log => log.maskSensitiveData()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      code: 'AUDIT_LOGS_ERROR'
    });
  }
};

export { auditLogger };
export default auditMiddleware;

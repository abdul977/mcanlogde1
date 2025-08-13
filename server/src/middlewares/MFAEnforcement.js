import User from '../models/User.js';
import MFADevice from '../models/MFADevice.js';
import { roleHierarchyManager } from './RoleHierarchy.js';

/**
 * MFA Enforcement Manager
 */
class MFAEnforcementManager {
  constructor() {
    this.mfaRequiredRoles = ['super_admin', 'national_admin'];
    this.mfaRequiredActions = [
      'users:delete',
      'users:manage',
      'roles:create',
      'roles:update',
      'roles:delete',
      'settings:update',
      'payments:approve'
    ];
  }

  /**
   * Check if user role requires MFA
   */
  async requiresMFAByRole(userId) {
    try {
      const user = await User.findById(userId).populate('roles').populate('primaryRole');
      if (!user) {
        return { required: false, reason: 'User not found' };
      }

      // Check if user has any MFA-required roles
      const hasRequiredRole = user.roles?.some(role => 
        this.mfaRequiredRoles.includes(role.name)
      ) || this.mfaRequiredRoles.includes(user.role); // Legacy role check

      if (hasRequiredRole) {
        return { 
          required: true, 
          reason: 'User has role that requires MFA',
          roles: user.roles?.map(r => r.name) || [user.role]
        };
      }

      return { required: false, reason: 'User role does not require MFA' };

    } catch (error) {
      console.error('Error checking MFA requirement by role:', error);
      return { required: false, reason: 'Error checking role requirements' };
    }
  }

  /**
   * Check if action requires MFA
   */
  requiresMFAByAction(resource, action) {
    const actionKey = `${resource}:${action}`;
    return this.mfaRequiredActions.includes(actionKey);
  }

  /**
   * Check if user has active MFA setup
   */
  async hasActiveMFA(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.mfaEnabled) {
        return { hasActive: false, reason: 'MFA not enabled for user' };
      }

      const activeDevices = await MFADevice.findUserDevices(userId);
      if (activeDevices.length === 0) {
        return { hasActive: false, reason: 'No active MFA devices found' };
      }

      return { 
        hasActive: true, 
        deviceCount: activeDevices.length,
        devices: activeDevices.map(d => ({
          id: d._id,
          name: d.deviceName,
          type: d.deviceType,
          isPrimary: d.isPrimary
        }))
      };

    } catch (error) {
      console.error('Error checking active MFA:', error);
      return { hasActive: false, reason: 'Error checking MFA status' };
    }
  }

  /**
   * Check if user has completed MFA verification in current session
   */
  hasMFAVerification(req) {
    // Check for MFA verification flag in session or token
    return req.session?.mfaVerified || 
           req.user?.mfaVerified || 
           req.headers['x-mfa-verified'] === 'true';
  }

  /**
   * Set MFA verification status
   */
  setMFAVerification(req, verified = true) {
    if (req.session) {
      req.session.mfaVerified = verified;
      req.session.mfaVerifiedAt = new Date();
    }
    
    if (req.user) {
      req.user.mfaVerified = verified;
      req.user.mfaVerifiedAt = new Date();
    }
  }

  /**
   * Check if MFA verification has expired
   */
  isMFAVerificationExpired(req) {
    const verifiedAt = req.session?.mfaVerifiedAt || req.user?.mfaVerifiedAt;
    if (!verifiedAt) return true;

    // MFA verification expires after 30 minutes
    const expiryTime = 30 * 60 * 1000; // 30 minutes
    return (new Date() - new Date(verifiedAt)) > expiryTime;
  }
}

// Create singleton instance
const mfaEnforcementManager = new MFAEnforcementManager();

/**
 * Middleware to enforce MFA for required roles
 */
export const requireMFAForRole = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user role requires MFA
    const roleRequirement = await mfaEnforcementManager.requiresMFAByRole(userId);
    
    if (!roleRequirement.required) {
      // MFA not required for this role, continue
      return next();
    }

    // Check if user has active MFA setup
    const mfaStatus = await mfaEnforcementManager.hasActiveMFA(userId);
    
    if (!mfaStatus.hasActive) {
      return res.status(403).json({
        success: false,
        message: 'MFA setup required for your role',
        reason: mfaStatus.reason,
        requiredRoles: roleRequirement.roles,
        setupRequired: true,
        code: 'MFA_SETUP_REQUIRED'
      });
    }

    // Check if MFA verification is present and not expired
    if (!mfaEnforcementManager.hasMFAVerification(req) || 
        mfaEnforcementManager.isMFAVerificationExpired(req)) {
      
      return res.status(403).json({
        success: false,
        message: 'MFA verification required',
        reason: 'Action requires recent MFA verification',
        mfaDevices: mfaStatus.devices,
        verificationRequired: true,
        code: 'MFA_VERIFICATION_REQUIRED'
      });
    }

    // Add MFA info to request
    req.mfaInfo = {
      required: true,
      verified: true,
      devices: mfaStatus.devices
    };

    next();

  } catch (error) {
    console.error('Error in MFA role enforcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking MFA requirements',
      code: 'MFA_CHECK_ERROR'
    });
  }
};

/**
 * Middleware to enforce MFA for specific actions
 */
export const requireMFAForAction = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Check if action requires MFA
      if (!mfaEnforcementManager.requiresMFAByAction(resource, action)) {
        // MFA not required for this action, continue
        return next();
      }

      // Check if user has active MFA setup
      const mfaStatus = await mfaEnforcementManager.hasActiveMFA(userId);
      
      if (!mfaStatus.hasActive) {
        return res.status(403).json({
          success: false,
          message: 'MFA setup required for this action',
          reason: mfaStatus.reason,
          action: `${resource}:${action}`,
          setupRequired: true,
          code: 'MFA_SETUP_REQUIRED'
        });
      }

      // Check if MFA verification is present and not expired
      if (!mfaEnforcementManager.hasMFAVerification(req) || 
          mfaEnforcementManager.isMFAVerificationExpired(req)) {
        
        return res.status(403).json({
          success: false,
          message: 'MFA verification required for this action',
          reason: 'Sensitive action requires recent MFA verification',
          action: `${resource}:${action}`,
          mfaDevices: mfaStatus.devices,
          verificationRequired: true,
          code: 'MFA_VERIFICATION_REQUIRED'
        });
      }

      // Add MFA info to request
      req.mfaInfo = {
        required: true,
        verified: true,
        action: `${resource}:${action}`,
        devices: mfaStatus.devices
      };

      next();

    } catch (error) {
      console.error('Error in MFA action enforcement:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking MFA requirements',
        code: 'MFA_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware to set MFA verification after successful verification
 */
export const setMFAVerified = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to detect successful MFA verification
  res.json = function(data) {
    // If this is a successful MFA verification response
    if (data.success && (data.message?.includes('MFA verification successful') || 
                        data.message?.includes('TOTP setup completed'))) {
      
      mfaEnforcementManager.setMFAVerification(req, true);
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to clear MFA verification on logout
 */
export const clearMFAVerification = (req, res, next) => {
  mfaEnforcementManager.setMFAVerification(req, false);
  next();
};

/**
 * Middleware to check MFA status for current user
 */
export const getMFAStatusMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const roleRequirement = await mfaEnforcementManager.requiresMFAByRole(userId);
    const mfaStatus = await mfaEnforcementManager.hasActiveMFA(userId);
    const isVerified = mfaEnforcementManager.hasMFAVerification(req) && 
                      !mfaEnforcementManager.isMFAVerificationExpired(req);

    res.json({
      success: true,
      mfaStatus: {
        required: roleRequirement.required,
        reason: roleRequirement.reason,
        hasActiveMFA: mfaStatus.hasActive,
        isVerified,
        deviceCount: mfaStatus.deviceCount || 0,
        devices: mfaStatus.devices || [],
        verificationExpired: mfaEnforcementManager.isMFAVerificationExpired(req)
      }
    });

  } catch (error) {
    console.error('Error getting MFA status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving MFA status',
      code: 'MFA_STATUS_ERROR'
    });
  }
};

export { mfaEnforcementManager };
export default {
  requireMFAForRole,
  requireMFAForAction,
  setMFAVerified,
  clearMFAVerification,
  getMFAStatusMiddleware,
  mfaEnforcementManager
};

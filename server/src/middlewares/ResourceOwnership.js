import User from '../models/User.js';
import Booking from '../models/Booking.js';
import PaymentVerification from '../models/PaymentVerification.js';
import Post from '../models/Post.js';
import { roleHierarchyManager } from './RoleHierarchy.js';

/**
 * Resource Ownership Validation Manager
 */
class ResourceOwnershipManager {
  constructor() {
    this.resourceValidators = {
      'users': this.validateUserAccess.bind(this),
      'bookings': this.validateBookingAccess.bind(this),
      'payments': this.validatePaymentAccess.bind(this),
      'content': this.validateContentAccess.bind(this),
      'posts': this.validatePostAccess.bind(this)
    };
  }

  /**
   * Validate user access based on scope and ownership
   */
  async validateUserAccess(currentUser, targetUserId, action, context = {}) {
    try {
      // Self-access is always allowed for read operations
      if (currentUser._id.toString() === targetUserId && ['read', 'update'].includes(action)) {
        return { allowed: true, reason: 'Self-access' };
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return { allowed: false, reason: 'Target user not found' };
      }

      const currentUserRole = await roleHierarchyManager.getUserHighestRole(currentUser._id);
      if (!currentUserRole) {
        return { allowed: false, reason: 'Unable to determine user role' };
      }

      // Global scope - can access all users
      if (currentUserRole.scope === 'global') {
        return { allowed: true, reason: 'Global scope access' };
      }

      // National scope - can access all users
      if (currentUserRole.scope === 'national') {
        return { allowed: true, reason: 'National scope access' };
      }

      // State scope - can only access users in same state
      if (currentUserRole.scope === 'state') {
        if (!currentUser.stateId) {
          return { allowed: false, reason: 'Current user has no state assignment' };
        }
        if (targetUser.stateId !== currentUser.stateId) {
          return { allowed: false, reason: 'Target user is in different state' };
        }
        return { allowed: true, reason: 'Same state access' };
      }

      // Campus scope - can only access users in same campus
      if (currentUserRole.scope === 'campus') {
        if (!currentUser.campusId) {
          return { allowed: false, reason: 'Current user has no campus assignment' };
        }
        if (targetUser.campusId !== currentUser.campusId) {
          return { allowed: false, reason: 'Target user is in different campus' };
        }
        return { allowed: true, reason: 'Same campus access' };
      }

      // Personal scope - can only access own records
      if (currentUserRole.scope === 'personal') {
        if (currentUser._id.toString() !== targetUserId) {
          return { allowed: false, reason: 'Personal scope - can only access own records' };
        }
        return { allowed: true, reason: 'Own record access' };
      }

      return { allowed: false, reason: 'Unknown scope or insufficient permissions' };

    } catch (error) {
      console.error('Error validating user access:', error);
      return { allowed: false, reason: 'Error validating access' };
    }
  }

  /**
   * Validate booking access
   */
  async validateBookingAccess(currentUser, bookingId, action, context = {}) {
    try {
      const booking = await Booking.findById(bookingId).populate('user');
      if (!booking) {
        return { allowed: false, reason: 'Booking not found' };
      }

      const currentUserRole = await roleHierarchyManager.getUserHighestRole(currentUser._id);
      if (!currentUserRole) {
        return { allowed: false, reason: 'Unable to determine user role' };
      }

      // Owner can always access their own bookings
      if (booking.user._id.toString() === currentUser._id.toString()) {
        return { allowed: true, reason: 'Booking owner access' };
      }

      // Global/National scope - can access all bookings
      if (['global', 'national'].includes(currentUserRole.scope)) {
        return { allowed: true, reason: `${currentUserRole.scope} scope access` };
      }

      // State scope - can access bookings from same state
      if (currentUserRole.scope === 'state') {
        if (!currentUser.stateId) {
          return { allowed: false, reason: 'Current user has no state assignment' };
        }
        if (booking.user.stateId !== currentUser.stateId) {
          return { allowed: false, reason: 'Booking user is in different state' };
        }
        return { allowed: true, reason: 'Same state booking access' };
      }

      // Campus scope - can access bookings from same campus
      if (currentUserRole.scope === 'campus') {
        if (!currentUser.campusId) {
          return { allowed: false, reason: 'Current user has no campus assignment' };
        }
        if (booking.user.campusId !== currentUser.campusId) {
          return { allowed: false, reason: 'Booking user is in different campus' };
        }
        return { allowed: true, reason: 'Same campus booking access' };
      }

      return { allowed: false, reason: 'Insufficient permissions for booking access' };

    } catch (error) {
      console.error('Error validating booking access:', error);
      return { allowed: false, reason: 'Error validating booking access' };
    }
  }

  /**
   * Validate payment access
   */
  async validatePaymentAccess(currentUser, paymentId, action, context = {}) {
    try {
      const payment = await PaymentVerification.findById(paymentId).populate('user');
      if (!payment) {
        return { allowed: false, reason: 'Payment not found' };
      }

      const currentUserRole = await roleHierarchyManager.getUserHighestRole(currentUser._id);
      if (!currentUserRole) {
        return { allowed: false, reason: 'Unable to determine user role' };
      }

      // Owner can access their own payments
      if (payment.user._id.toString() === currentUser._id.toString()) {
        return { allowed: true, reason: 'Payment owner access' };
      }

      // Finance/Treasurer role can access all payments
      if (currentUserRole.name === 'finance_treasurer') {
        return { allowed: true, reason: 'Finance role access' };
      }

      // Global/National scope - can access all payments
      if (['global', 'national'].includes(currentUserRole.scope)) {
        return { allowed: true, reason: `${currentUserRole.scope} scope access` };
      }

      // State scope - can access payments from same state
      if (currentUserRole.scope === 'state') {
        if (!currentUser.stateId) {
          return { allowed: false, reason: 'Current user has no state assignment' };
        }
        if (payment.user.stateId !== currentUser.stateId) {
          return { allowed: false, reason: 'Payment user is in different state' };
        }
        return { allowed: true, reason: 'Same state payment access' };
      }

      return { allowed: false, reason: 'Insufficient permissions for payment access' };

    } catch (error) {
      console.error('Error validating payment access:', error);
      return { allowed: false, reason: 'Error validating payment access' };
    }
  }

  /**
   * Validate content access
   */
  async validateContentAccess(currentUser, contentId, action, context = {}) {
    try {
      // For content, we'll use a generic approach since content models vary
      const { contentType = 'post' } = context;
      let content = null;

      switch (contentType) {
        case 'post':
          content = await Post.findById(contentId);
          break;
        // Add other content types as needed
        default:
          return { allowed: false, reason: 'Unknown content type' };
      }

      if (!content) {
        return { allowed: false, reason: 'Content not found' };
      }

      const currentUserRole = await roleHierarchyManager.getUserHighestRole(currentUser._id);
      if (!currentUserRole) {
        return { allowed: false, reason: 'Unable to determine user role' };
      }

      // Read access is generally open for published content
      if (action === 'read' && content.status === 'published') {
        return { allowed: true, reason: 'Public content read access' };
      }

      // Owner can manage their own content
      if (content.createdBy && content.createdBy.toString() === currentUser._id.toString()) {
        return { allowed: true, reason: 'Content owner access' };
      }

      // Global/National scope - can manage all content
      if (['global', 'national'].includes(currentUserRole.scope)) {
        return { allowed: true, reason: `${currentUserRole.scope} scope access` };
      }

      // State scope - can manage content in same state (if content has state info)
      if (currentUserRole.scope === 'state' && content.stateId) {
        if (!currentUser.stateId) {
          return { allowed: false, reason: 'Current user has no state assignment' };
        }
        if (content.stateId !== currentUser.stateId) {
          return { allowed: false, reason: 'Content is for different state' };
        }
        return { allowed: true, reason: 'Same state content access' };
      }

      return { allowed: false, reason: 'Insufficient permissions for content access' };

    } catch (error) {
      console.error('Error validating content access:', error);
      return { allowed: false, reason: 'Error validating content access' };
    }
  }

  /**
   * Validate post access (alias for content access)
   */
  async validatePostAccess(currentUser, postId, action, context = {}) {
    return this.validateContentAccess(currentUser, postId, action, { ...context, contentType: 'post' });
  }

  /**
   * Generic resource access validation
   */
  async validateResourceAccess(currentUser, resourceType, resourceId, action, context = {}) {
    const validator = this.resourceValidators[resourceType];
    
    if (!validator) {
      return { allowed: false, reason: `No validator found for resource type: ${resourceType}` };
    }

    return await validator(currentUser, resourceId, action, context);
  }
}

// Create singleton instance
const resourceOwnershipManager = new ResourceOwnershipManager();

/**
 * Middleware factory for resource ownership validation
 */
export const requireResourceAccess = (resourceType, options = {}) => {
  return async (req, res, next) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const resourceId = req.params.id || req.params[`${resourceType}Id`] || req.body[`${resourceType}Id`];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: `${resourceType} ID is required`,
          code: 'RESOURCE_ID_REQUIRED'
        });
      }

      const action = options.action || req.method.toLowerCase();
      const context = {
        ...options.context,
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body
      };

      const validation = await resourceOwnershipManager.validateResourceAccess(
        currentUser,
        resourceType,
        resourceId,
        action,
        context
      );

      if (!validation.allowed) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
          reason: validation.reason,
          resourceType,
          resourceId,
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      // Add validation info to request
      req.resourceAccess = validation;
      next();

    } catch (error) {
      console.error('Error in resource access middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Error validating resource access',
        code: 'RESOURCE_ACCESS_ERROR'
      });
    }
  };
};

/**
 * Middleware to validate state-scoped access
 */
export const requireStateScope = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const targetStateId = req.params.stateId || req.body.stateId || req.query.stateId;
    
    const currentUserRole = await roleHierarchyManager.getUserHighestRole(currentUser._id);
    if (!currentUserRole) {
      return res.status(403).json({
        success: false,
        message: 'Unable to determine user role',
        code: 'ROLE_DETERMINATION_ERROR'
      });
    }

    // Global and national scope can access any state
    if (['global', 'national'].includes(currentUserRole.scope)) {
      return next();
    }

    // State scope users can only access their own state
    if (currentUserRole.scope === 'state') {
      if (!currentUser.stateId) {
        return res.status(403).json({
          success: false,
          message: 'User has no state assignment',
          code: 'NO_STATE_ASSIGNMENT'
        });
      }

      if (targetStateId && targetStateId !== currentUser.stateId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: different state',
          userState: currentUser.stateId,
          requestedState: targetStateId,
          code: 'STATE_ACCESS_DENIED'
        });
      }

      return next();
    }

    // Campus and personal scope cannot access state-level data
    return res.status(403).json({
      success: false,
      message: 'Insufficient scope for state-level access',
      userScope: currentUserRole.scope,
      code: 'INSUFFICIENT_SCOPE'
    });

  } catch (error) {
    console.error('Error in state scope middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating state scope',
      code: 'STATE_SCOPE_ERROR'
    });
  }
};

/**
 * Middleware to validate campus-scoped access
 */
export const requireCampusScope = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const targetCampusId = req.params.campusId || req.body.campusId || req.query.campusId;
    
    const currentUserRole = await roleHierarchyManager.getUserHighestRole(currentUser._id);
    if (!currentUserRole) {
      return res.status(403).json({
        success: false,
        message: 'Unable to determine user role',
        code: 'ROLE_DETERMINATION_ERROR'
      });
    }

    // Global, national, and state scope can access any campus
    if (['global', 'national', 'state'].includes(currentUserRole.scope)) {
      return next();
    }

    // Campus scope users can only access their own campus
    if (currentUserRole.scope === 'campus') {
      if (!currentUser.campusId) {
        return res.status(403).json({
          success: false,
          message: 'User has no campus assignment',
          code: 'NO_CAMPUS_ASSIGNMENT'
        });
      }

      if (targetCampusId && targetCampusId !== currentUser.campusId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: different campus',
          userCampus: currentUser.campusId,
          requestedCampus: targetCampusId,
          code: 'CAMPUS_ACCESS_DENIED'
        });
      }

      return next();
    }

    // Personal scope cannot access campus-level data
    return res.status(403).json({
      success: false,
      message: 'Insufficient scope for campus-level access',
      userScope: currentUserRole.scope,
      code: 'INSUFFICIENT_SCOPE'
    });

  } catch (error) {
    console.error('Error in campus scope middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating campus scope',
      code: 'CAMPUS_SCOPE_ERROR'
    });
  }
};

export { resourceOwnershipManager };
export default {
  requireResourceAccess,
  requireStateScope,
  requireCampusScope,
  resourceOwnershipManager
};

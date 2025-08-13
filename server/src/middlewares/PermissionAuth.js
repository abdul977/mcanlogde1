import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import RolePermission from '../models/RolePermission.js';
import User from '../models/User.js';

/**
 * Permission-based authorization middleware
 */
class PermissionAuthManager {
  constructor() {
    this.permissionCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get user permissions with caching
   */
  async getUserPermissions(userId) {
    const cacheKey = `user_permissions_${userId}`;
    const cached = this.permissionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.permissions;
    }

    try {
      // Get user with roles
      const user = await User.findById(userId).populate('roles').populate('primaryRole');
      
      if (!user) {
        throw new Error('User not found');
      }

      const allPermissions = new Map();

      // Get permissions from all user roles
      for (const role of user.roles || []) {
        const rolePermissions = await RolePermission.getRolePermissions(role._id, {
          stateCode: user.stateId,
          campusId: user.campusId
        });

        for (const mapping of rolePermissions) {
          const permission = mapping.permission;
          const key = `${permission.resource}:${permission.action}`;
          
          // Store the most permissive scope if permission exists multiple times
          if (!allPermissions.has(key) || this.isMorePermissive(mapping.effectiveScope, allPermissions.get(key).scope)) {
            allPermissions.set(key, {
              id: permission._id,
              name: permission.name,
              resource: permission.resource,
              action: permission.action,
              scope: mapping.effectiveScope || permission.scope,
              conditions: permission.conditions,
              requiresMFA: permission.requiresMFA,
              riskLevel: permission.riskLevel
            });
          }
        }
      }

      const permissions = Array.from(allPermissions.values());

      // Cache the result
      this.permissionCache.set(cacheKey, {
        permissions,
        timestamp: Date.now()
      });

      return permissions;

    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Check if one scope is more permissive than another
   */
  isMorePermissive(scope1, scope2) {
    const scopeHierarchy = {
      'global': 5,
      'national': 4,
      'state': 3,
      'campus': 2,
      'personal': 1,
      'own_records': 0
    };

    return (scopeHierarchy[scope1] || 0) > (scopeHierarchy[scope2] || 0);
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId, resource, action, context = {}) {
    try {
      const permissions = await this.getUserPermissions(userId);
      
      const permission = permissions.find(p => 
        p.resource === resource && p.action === action
      );

      if (!permission) {
        return { hasPermission: false, reason: 'Permission not found' };
      }

      // Check scope constraints
      const scopeCheck = this.checkScopeConstraints(permission, context);
      if (!scopeCheck.allowed) {
        return { hasPermission: false, reason: scopeCheck.reason };
      }

      // Check additional conditions
      const conditionCheck = this.checkPermissionConditions(permission, context);
      if (!conditionCheck.allowed) {
        return { hasPermission: false, reason: conditionCheck.reason };
      }

      return { 
        hasPermission: true, 
        permission,
        requiresMFA: permission.requiresMFA
      };

    } catch (error) {
      console.error('Error checking permission:', error);
      return { hasPermission: false, reason: 'Permission check error' };
    }
  }

  /**
   * Check scope constraints
   */
  checkScopeConstraints(permission, context) {
    const { scope } = permission;
    const { user, targetUserId, stateId, campusId, resourceOwnerId } = context;

    switch (scope) {
      case 'global':
        return { allowed: true };

      case 'national':
        // National scope - can access all states
        return { allowed: true };

      case 'state':
        if (!user.stateId) {
          return { allowed: false, reason: 'User has no state assignment' };
        }
        if (stateId && stateId !== user.stateId) {
          return { allowed: false, reason: 'Access denied: different state' };
        }
        return { allowed: true };

      case 'campus':
        if (!user.campusId) {
          return { allowed: false, reason: 'User has no campus assignment' };
        }
        if (campusId && campusId !== user.campusId) {
          return { allowed: false, reason: 'Access denied: different campus' };
        }
        return { allowed: true };

      case 'personal':
        return { allowed: true };

      case 'own_records':
        if (targetUserId && targetUserId !== user._id.toString()) {
          return { allowed: false, reason: 'Access denied: can only access own records' };
        }
        if (resourceOwnerId && resourceOwnerId !== user._id.toString()) {
          return { allowed: false, reason: 'Access denied: can only access own resources' };
        }
        return { allowed: true };

      default:
        return { allowed: false, reason: 'Unknown scope' };
    }
  }

  /**
   * Check permission conditions
   */
  checkPermissionConditions(permission, context) {
    const { conditions } = permission;
    const { ipAddress, userAgent, currentTime = new Date() } = context;

    // Check time restrictions
    if (conditions.timeRestrictions?.allowedHours) {
      const currentHour = currentTime.getHours();
      const { start, end } = conditions.timeRestrictions.allowedHours;
      
      if (start !== undefined && end !== undefined) {
        if (start <= end) {
          if (currentHour < start || currentHour > end) {
            return { allowed: false, reason: 'Access denied: outside allowed hours' };
          }
        } else {
          if (currentHour < start && currentHour > end) {
            return { allowed: false, reason: 'Access denied: outside allowed hours' };
          }
        }
      }
    }

    // Check day restrictions
    if (conditions.timeRestrictions?.allowedDays?.length > 0) {
      const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (!conditions.timeRestrictions.allowedDays.includes(currentDay)) {
        return { allowed: false, reason: 'Access denied: not allowed on this day' };
      }
    }

    // Check IP restrictions
    if (ipAddress) {
      if (conditions.ipRestrictions?.blockedIPs?.includes(ipAddress)) {
        return { allowed: false, reason: 'Access denied: IP address blocked' };
      }
      
      if (conditions.ipRestrictions?.allowedIPs?.length > 0) {
        if (!conditions.ipRestrictions.allowedIPs.includes(ipAddress)) {
          return { allowed: false, reason: 'Access denied: IP address not allowed' };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Clear permission cache for user
   */
  clearUserPermissionCache(userId) {
    const cacheKey = `user_permissions_${userId}`;
    this.permissionCache.delete(cacheKey);
  }

  /**
   * Clear all permission cache
   */
  clearAllPermissionCache() {
    this.permissionCache.clear();
  }
}

// Create singleton instance
const permissionAuthManager = new PermissionAuthManager();

/**
 * Middleware factory for permission checking
 */
export const requirePermission = (resource, action, options = {}) => {
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

      // Build context for permission check
      const context = {
        user: req.user,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        currentTime: new Date(),
        targetUserId: req.params.userId || req.params.id,
        stateId: req.params.stateId || req.body.stateId,
        campusId: req.params.campusId || req.body.campusId,
        resourceOwnerId: req.params.ownerId || req.body.ownerId,
        ...options.context
      };

      // Check permission
      const permissionCheck = await permissionAuthManager.hasPermission(
        userId,
        resource,
        action,
        context
      );

      if (!permissionCheck.hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          reason: permissionCheck.reason,
          required: { resource, action },
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Add permission info to request
      req.permission = permissionCheck.permission;
      req.requiresMFA = permissionCheck.requiresMFA;

      next();

    } catch (error) {
      console.error('Error in permission middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check error',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Middleware to check multiple permissions (OR logic)
 */
export const requireAnyPermission = (permissions, options = {}) => {
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

      const context = {
        user: req.user,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        currentTime: new Date(),
        targetUserId: req.params.userId || req.params.id,
        stateId: req.params.stateId || req.body.stateId,
        campusId: req.params.campusId || req.body.campusId,
        resourceOwnerId: req.params.ownerId || req.body.ownerId,
        ...options.context
      };

      // Check if user has any of the required permissions
      for (const { resource, action } of permissions) {
        const permissionCheck = await permissionAuthManager.hasPermission(
          userId,
          resource,
          action,
          context
        );

        if (permissionCheck.hasPermission) {
          req.permission = permissionCheck.permission;
          req.requiresMFA = permissionCheck.requiresMFA;
          return next();
        }
      }

      // No permissions matched
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permissions,
        code: 'INSUFFICIENT_PERMISSIONS'
      });

    } catch (error) {
      console.error('Error in any permission middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check error',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Middleware to get user permissions
 */
export const getUserPermissionsMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const permissions = await permissionAuthManager.getUserPermissions(userId);
    
    res.json({
      success: true,
      permissions: permissions.map(p => ({
        resource: p.resource,
        action: p.action,
        scope: p.scope,
        requiresMFA: p.requiresMFA,
        riskLevel: p.riskLevel
      })),
      totalPermissions: permissions.length
    });

  } catch (error) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving permissions',
      code: 'PERMISSIONS_ERROR'
    });
  }
};

export { permissionAuthManager };
export default {
  requirePermission,
  requireAnyPermission,
  getUserPermissionsMiddleware,
  permissionAuthManager
};

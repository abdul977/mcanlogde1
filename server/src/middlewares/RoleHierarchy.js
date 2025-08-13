import Role from '../models/Role.js';
import User from '../models/User.js';

/**
 * Role Hierarchy Validation Manager
 */
class RoleHierarchyManager {
  constructor() {
    this.roleCache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get role hierarchy with caching
   */
  async getRoleHierarchy() {
    const cacheKey = 'role_hierarchy';
    const cached = this.roleCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.hierarchy;
    }

    try {
      const roles = await Role.find({ isActive: true }).sort({ hierarchyLevel: 1 });
      const hierarchy = {};

      roles.forEach(role => {
        hierarchy[role.name] = {
          id: role._id,
          name: role.name,
          displayName: role.displayName,
          hierarchyLevel: role.hierarchyLevel,
          scope: role.scope,
          capabilities: role.capabilities
        };
      });

      // Cache the result
      this.roleCache.set(cacheKey, {
        hierarchy,
        timestamp: Date.now()
      });

      return hierarchy;

    } catch (error) {
      console.error('Error getting role hierarchy:', error);
      return {};
    }
  }

  /**
   * Get user's highest role (lowest hierarchy level number)
   */
  async getUserHighestRole(userId) {
    try {
      const user = await User.findById(userId).populate('roles').populate('primaryRole');
      
      if (!user) {
        throw new Error('User not found');
      }

      const hierarchy = await this.getRoleHierarchy();
      let highestRole = null;
      let lowestLevel = Infinity;

      // Check primary role first
      if (user.primaryRole && hierarchy[user.primaryRole.name]) {
        const role = hierarchy[user.primaryRole.name];
        if (role.hierarchyLevel < lowestLevel) {
          lowestLevel = role.hierarchyLevel;
          highestRole = role;
        }
      }

      // Check all roles
      for (const role of user.roles || []) {
        if (hierarchy[role.name] && hierarchy[role.name].hierarchyLevel < lowestLevel) {
          lowestLevel = hierarchy[role.name].hierarchyLevel;
          highestRole = hierarchy[role.name];
        }
      }

      // Fallback to legacy role
      if (!highestRole && user.role) {
        const legacyRoleMap = {
          'admin': 'super_admin',
          'user': 'member'
        };
        const mappedRole = legacyRoleMap[user.role] || 'member';
        highestRole = hierarchy[mappedRole];
      }

      return highestRole || hierarchy['member'];

    } catch (error) {
      console.error('Error getting user highest role:', error);
      return null;
    }
  }

  /**
   * Check if user can manage target user
   */
  async canManageUser(managerId, targetUserId) {
    try {
      if (managerId === targetUserId) {
        return { canManage: true, reason: 'Self-management allowed' };
      }

      const managerRole = await this.getUserHighestRole(managerId);
      const targetRole = await this.getUserHighestRole(targetUserId);

      if (!managerRole || !targetRole) {
        return { canManage: false, reason: 'Unable to determine user roles' };
      }

      // Manager must have higher authority (lower hierarchy level)
      if (managerRole.hierarchyLevel >= targetRole.hierarchyLevel) {
        return { 
          canManage: false, 
          reason: `Insufficient authority: ${managerRole.displayName} cannot manage ${targetRole.displayName}` 
        };
      }

      return { canManage: true, managerRole, targetRole };

    } catch (error) {
      console.error('Error checking user management permission:', error);
      return { canManage: false, reason: 'Error checking permissions' };
    }
  }

  /**
   * Check if user can assign role
   */
  async canAssignRole(assignerId, roleToAssign, targetUserId) {
    try {
      const assignerRole = await this.getUserHighestRole(assignerId);
      const hierarchy = await this.getRoleHierarchy();
      const targetRole = hierarchy[roleToAssign];

      if (!assignerRole || !targetRole) {
        return { canAssign: false, reason: 'Invalid roles' };
      }

      // Assigner must have higher authority than the role being assigned
      if (assignerRole.hierarchyLevel >= targetRole.hierarchyLevel) {
        return { 
          canAssign: false, 
          reason: `Cannot assign role with equal or higher authority: ${targetRole.displayName}` 
        };
      }

      // Additional check: can the assigner manage the target user?
      if (targetUserId && targetUserId !== assignerId) {
        const managementCheck = await this.canManageUser(assignerId, targetUserId);
        if (!managementCheck.canManage) {
          return { 
            canAssign: false, 
            reason: `Cannot manage target user: ${managementCheck.reason}` 
          };
        }
      }

      return { canAssign: true, assignerRole, targetRole };

    } catch (error) {
      console.error('Error checking role assignment permission:', error);
      return { canAssign: false, reason: 'Error checking permissions' };
    }
  }

  /**
   * Get roles that user can assign
   */
  async getAssignableRoles(userId) {
    try {
      const userRole = await this.getUserHighestRole(userId);
      const hierarchy = await this.getRoleHierarchy();

      if (!userRole) {
        return [];
      }

      const assignableRoles = [];
      
      for (const [roleName, role] of Object.entries(hierarchy)) {
        // User can assign roles with higher hierarchy level (lower authority)
        if (role.hierarchyLevel > userRole.hierarchyLevel) {
          assignableRoles.push({
            name: role.name,
            displayName: role.displayName,
            hierarchyLevel: role.hierarchyLevel,
            scope: role.scope
          });
        }
      }

      return assignableRoles.sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);

    } catch (error) {
      console.error('Error getting assignable roles:', error);
      return [];
    }
  }

  /**
   * Clear role cache
   */
  clearCache() {
    this.roleCache.clear();
  }
}

// Create singleton instance
const roleHierarchyManager = new RoleHierarchyManager();

/**
 * Middleware to check if user can manage target user
 */
export const requireUserManagementPermission = async (req, res, next) => {
  try {
    const managerId = req.user?.id || req.user?._id;
    const targetUserId = req.params.userId || req.params.id || req.body.userId;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required',
        code: 'TARGET_USER_REQUIRED'
      });
    }

    const managementCheck = await roleHierarchyManager.canManageUser(managerId, targetUserId);

    if (!managementCheck.canManage) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient authority to manage this user',
        reason: managementCheck.reason,
        code: 'INSUFFICIENT_AUTHORITY'
      });
    }

    // Add management info to request
    req.managementPermission = managementCheck;
    next();

  } catch (error) {
    console.error('Error in user management permission middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking management permissions',
      code: 'MANAGEMENT_CHECK_ERROR'
    });
  }
};

/**
 * Middleware to check if user can assign specific role
 */
export const requireRoleAssignmentPermission = async (req, res, next) => {
  try {
    const assignerId = req.user?.id || req.user?._id;
    const roleToAssign = req.body.role || req.body.roleName;
    const targetUserId = req.params.userId || req.params.id || req.body.userId;

    if (!assignerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roleToAssign) {
      return res.status(400).json({
        success: false,
        message: 'Role to assign is required',
        code: 'ROLE_REQUIRED'
      });
    }

    const assignmentCheck = await roleHierarchyManager.canAssignRole(
      assignerId, 
      roleToAssign, 
      targetUserId
    );

    if (!assignmentCheck.canAssign) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient authority to assign this role',
        reason: assignmentCheck.reason,
        code: 'INSUFFICIENT_AUTHORITY'
      });
    }

    // Add assignment info to request
    req.roleAssignmentPermission = assignmentCheck;
    next();

  } catch (error) {
    console.error('Error in role assignment permission middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking role assignment permissions',
      code: 'ASSIGNMENT_CHECK_ERROR'
    });
  }
};

/**
 * Middleware to get assignable roles for current user
 */
export const getAssignableRolesMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const assignableRoles = await roleHierarchyManager.getAssignableRoles(userId);
    const userRole = await roleHierarchyManager.getUserHighestRole(userId);

    res.json({
      success: true,
      userRole: userRole ? {
        name: userRole.name,
        displayName: userRole.displayName,
        hierarchyLevel: userRole.hierarchyLevel
      } : null,
      assignableRoles,
      totalAssignableRoles: assignableRoles.length
    });

  } catch (error) {
    console.error('Error getting assignable roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assignable roles',
      code: 'ASSIGNABLE_ROLES_ERROR'
    });
  }
};

/**
 * Middleware to check escalation requirements
 */
export const checkEscalationRequirement = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const action = req.body.action || req.params.action;
    const targetUserId = req.params.userId || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = await roleHierarchyManager.getUserHighestRole(userId);
    
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Unable to determine user role',
        code: 'ROLE_DETERMINATION_ERROR'
      });
    }

    // Define actions that require escalation
    const escalationRequiredActions = {
      'delete_user': 2, // Requires National Admin or higher
      'suspend_account': 3, // Requires State Admin or higher
      'reset_mfa': 2, // Requires National Admin or higher
      'unlock_account': 3, // Requires State Admin or higher
      'change_role': 2, // Requires National Admin or higher
      'access_audit_logs': 2 // Requires National Admin or higher
    };

    const requiredLevel = escalationRequiredActions[action];
    
    if (requiredLevel && userRole.hierarchyLevel > requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Action '${action}' requires escalation to higher authority`,
        currentLevel: userRole.hierarchyLevel,
        requiredLevel,
        escalationRequired: true,
        code: 'ESCALATION_REQUIRED'
      });
    }

    // Add escalation info to request
    req.escalationInfo = {
      action,
      userRole,
      escalationRequired: false
    };

    next();

  } catch (error) {
    console.error('Error checking escalation requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking escalation requirements',
      code: 'ESCALATION_CHECK_ERROR'
    });
  }
};

export { roleHierarchyManager };
export default {
  requireUserManagementPermission,
  requireRoleAssignmentPermission,
  getAssignableRolesMiddleware,
  checkEscalationRequirement,
  roleHierarchyManager
};

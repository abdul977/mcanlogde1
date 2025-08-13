import express from "express";
import {
  getAllUsersController,
  getUserDetailsController,
  updateUserRoleController,
  removeUserRoleController,
  toggleAccountLockController,
  resetUserPasswordController,
  bulkUserOperationsController,
  getUserActivityController
} from "../controller/AdminUserManagement.js";
import { requireSignIn } from "../middlewares/Auth.js";
import { requirePermission, requireAnyPermission } from "../middlewares/PermissionAuth.js";
import { requireUserManagementPermission, requireRoleAssignmentPermission } from "../middlewares/RoleHierarchy.js";
import { requireMFAForRole, requireMFAForAction } from "../middlewares/MFAEnforcement.js";
import { adminRateLimit } from "../middlewares/RateLimit.js";
import { validatePasswordPolicy } from "../middlewares/PasswordValidation.js";
import { getAuditLogsController } from "../middlewares/AuditLogger.js";

const router = express.Router();

// User Management Routes

// Get all users with filtering and pagination
router.get("/users", 
  requireSignIn,
  requireMFAForRole,
  requirePermission('users', 'read'),
  getAllUsersController
);

// Get specific user details
router.get("/users/:userId", 
  requireSignIn,
  requireMFAForRole,
  requirePermission('users', 'read'),
  requireUserManagementPermission,
  getUserDetailsController
);

// Update user role
router.put("/users/:userId/role", 
  requireSignIn,
  adminRateLimit,
  requireMFAForRole,
  requireMFAForAction('users', 'manage'),
  requirePermission('users', 'manage'),
  requireUserManagementPermission,
  requireRoleAssignmentPermission,
  updateUserRoleController
);

// Remove user role
router.delete("/users/:userId/roles/:roleId", 
  requireSignIn,
  adminRateLimit,
  requireMFAForRole,
  requireMFAForAction('users', 'manage'),
  requirePermission('users', 'manage'),
  requireUserManagementPermission,
  removeUserRoleController
);

// Lock/Unlock user account
router.put("/users/:userId/lock", 
  requireSignIn,
  adminRateLimit,
  requireMFAForRole,
  requirePermission('users', 'manage'),
  requireUserManagementPermission,
  toggleAccountLockController
);

// Reset user password (admin)
router.put("/users/:userId/password/reset", 
  requireSignIn,
  adminRateLimit,
  requireMFAForRole,
  requireMFAForAction('users', 'manage'),
  requirePermission('users', 'manage'),
  requireUserManagementPermission,
  validatePasswordPolicy,
  resetUserPasswordController
);

// Get user activity
router.get("/users/:userId/activity", 
  requireSignIn,
  requirePermission('audit_logs', 'read'),
  requireUserManagementPermission,
  getUserActivityController
);

// Bulk Operations

// Bulk user operations
router.post("/users/bulk", 
  requireSignIn,
  adminRateLimit,
  requireMFAForRole,
  requireMFAForAction('users', 'manage'),
  requirePermission('users', 'manage'),
  bulkUserOperationsController
);

// Audit and Monitoring Routes

// Get audit logs
router.get("/audit-logs", 
  requireSignIn,
  requireMFAForRole,
  requirePermission('audit_logs', 'read'),
  getAuditLogsController
);

// Security monitoring endpoints
router.get("/security/stats", 
  requireSignIn,
  requireMFAForRole,
  requirePermission('audit_logs', 'read'),
  async (req, res) => {
    try {
      const { timeframe = 24 } = req.query;
      const securityMonitor = (await import('../services/SecurityMonitor.js')).default;
      
      const stats = await securityMonitor.getSecurityStats(parseInt(timeframe));
      
      res.json({
        success: true,
        stats: {
          ...stats,
          uniqueIPCount: stats.uniqueIPs?.length || 0,
          timeframe: parseInt(timeframe)
        }
      });

    } catch (error) {
      console.error('Error fetching security stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching security statistics',
        code: 'SECURITY_STATS_ERROR'
      });
    }
  }
);

// System Management Routes

// Get system health
router.get("/system/health", 
  requireSignIn,
  requirePermission('settings', 'read'),
  async (req, res) => {
    try {
      const mongoose = (await import('mongoose')).default;
      const User = (await import('../models/User.js')).default;
      const AuditLog = (await import('../models/AuditLog.js')).default;
      
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ accountStatus: 'active' });
      const recentLogs = await AuditLog.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      res.json({
        success: true,
        health: {
          database: dbStatus,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          users: {
            total: totalUsers,
            active: activeUsers
          },
          auditLogs: {
            last24Hours: recentLogs
          },
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Error fetching system health:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching system health',
        code: 'SYSTEM_HEALTH_ERROR'
      });
    }
  }
);

// Role Management Routes

// Get all roles
router.get("/roles", 
  requireSignIn,
  requirePermission('roles', 'read'),
  async (req, res) => {
    try {
      const Role = (await import('../models/Role.js')).default;
      
      const roles = await Role.find({ isActive: true })
        .sort({ hierarchyLevel: 1 })
        .select('-defaultPermissions');

      res.json({
        success: true,
        roles
      });

    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching roles',
        code: 'ROLES_ERROR'
      });
    }
  }
);

// Get role permissions
router.get("/roles/:roleId/permissions", 
  requireSignIn,
  requirePermission('roles', 'read'),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const RolePermission = (await import('../models/RolePermission.js')).default;
      
      const permissions = await RolePermission.getRolePermissions(roleId);
      
      res.json({
        success: true,
        permissions: permissions.map(mapping => ({
          id: mapping.permission._id,
          name: mapping.permission.name,
          displayName: mapping.permission.displayName,
          resource: mapping.permission.resource,
          action: mapping.permission.action,
          scope: mapping.effectiveScope,
          riskLevel: mapping.permission.riskLevel,
          requiresMFA: mapping.permission.requiresMFA
        }))
      });

    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching role permissions',
        code: 'ROLE_PERMISSIONS_ERROR'
      });
    }
  }
);

// Statistics and Reports

// Get user statistics
router.get("/stats/users", 
  requireSignIn,
  requirePermission('reports', 'read'),
  async (req, res) => {
    try {
      const User = (await import('../models/User.js')).default;
      
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$accountStatus', 'active'] }, 1, 0] } },
            mfaEnabled: { $sum: { $cond: ['$mfaEnabled', 1, 0] } },
            locked: { $sum: { $cond: ['$accountLocked', 1, 0] } }
          }
        }
      ]);

      const roleStats = await User.aggregate([
        { $unwind: { path: '$roles', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'roles', localField: 'roles', foreignField: '_id', as: 'roleInfo' } },
        { $unwind: { path: '$roleInfo', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$roleInfo.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        stats: stats[0] || { total: 0, active: 0, mfaEnabled: 0, locked: 0 },
        roleDistribution: roleStats
      });

    } catch (error) {
      console.error('Error fetching user statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user statistics',
        code: 'USER_STATS_ERROR'
      });
    }
  }
);

export default router;

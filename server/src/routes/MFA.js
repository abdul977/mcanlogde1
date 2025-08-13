import express from "express";
import {
  setupTOTPController,
  verifyTOTPSetupController,
  verifyTOTPController,
  getMFADevicesController,
  removeMFADeviceController,
  generateBackupCodesController,
  disableMFAController
} from "../controller/MFA.js";
import { requireSignIn } from "../middlewares/Auth.js";
import { requirePermission } from "../middlewares/PermissionAuth.js";
import { requireUserManagementPermission } from "../middlewares/RoleHierarchy.js";
import { authRateLimit, adminRateLimit } from "../middlewares/RateLimit.js";
import { setMFAVerified, getMFAStatusMiddleware } from "../middlewares/MFAEnforcement.js";
import User from "../models/User.js";
import MFADevice from "../models/MFADevice.js";

const router = express.Router();

// MFA Setup Routes
// Setup TOTP MFA
router.post("/setup/totp", 
  requireSignIn,
  authRateLimit,
  setupTOTPController
);

// Verify TOTP setup
router.post("/setup/totp/verify",
  requireSignIn,
  authRateLimit,
  setMFAVerified,
  verifyTOTPSetupController
);

// MFA Verification Routes
// Verify TOTP token for authentication
router.post("/verify",
  requireSignIn,
  authRateLimit,
  setMFAVerified,
  verifyTOTPController
);

// Device Management Routes
// Get user's MFA devices
router.get("/devices", 
  requireSignIn,
  getMFADevicesController
);

// Remove MFA device
router.delete("/devices/:deviceId", 
  requireSignIn,
  authRateLimit,
  removeMFADeviceController
);

// Generate new backup codes
router.post("/devices/:deviceId/backup-codes", 
  requireSignIn,
  authRateLimit,
  generateBackupCodesController
);

// Admin Routes
// Disable MFA for a user (admin only)
router.post("/admin/disable/:userId", 
  requireSignIn,
  adminRateLimit,
  requirePermission('users', 'manage'),
  requireUserManagementPermission,
  disableMFAController
);

// Get MFA status for user (admin only)
router.get("/admin/status/:userId", 
  requireSignIn,
  requirePermission('users', 'read'),
  requireUserManagementPermission,
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId).select('mfaEnabled');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      const devices = await MFADevice.findUserDevices(userId);
      
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          mfaEnabled: user.mfaEnabled
        },
        devices: devices.map(device => ({
          id: device._id,
          name: device.deviceName,
          type: device.deviceType,
          isPrimary: device.isPrimary,
          isActive: device.isActive,
          isVerified: device.isVerified,
          lastUsed: device.lastUsed,
          createdAt: device.createdAt,
          status: device.status
        })),
        totalDevices: devices.length
      });

    } catch (error) {
      console.error('Error getting MFA status:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving MFA status',
        code: 'MFA_STATUS_ERROR'
      });
    }
  }
);

// Utility Routes
// Get MFA status for current user
router.get("/status",
  requireSignIn,
  getMFAStatusMiddleware
);

// Get MFA requirements for current user
router.get("/requirements",
  requireSignIn,
  async (req, res) => {
    try {
      const userId = req.user?.id || req.user?._id;
      
      const user = await User.findById(userId).populate('roles').populate('primaryRole');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if user has roles that require MFA
      const mfaRequiredRoles = ['super_admin', 'national_admin'];
      const requiresMFA = user.roles?.some(role => 
        mfaRequiredRoles.includes(role.name)
      ) || mfaRequiredRoles.includes(user.role);

      const devices = await MFADevice.findUserDevices(userId);
      const hasActiveMFA = devices.length > 0;

      res.status(200).json({
        success: true,
        requirements: {
          mfaRequired: requiresMFA,
          mfaEnabled: user.mfaEnabled,
          hasActiveMFA,
          canOptOut: !requiresMFA,
          requiredRoles: mfaRequiredRoles,
          userRoles: user.roles?.map(role => role.name) || [user.role]
        },
        devices: devices.map(device => ({
          id: device._id,
          name: device.deviceName,
          type: device.deviceType,
          isPrimary: device.isPrimary,
          status: device.status
        }))
      });

    } catch (error) {
      console.error('Error getting MFA requirements:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving MFA requirements',
        code: 'MFA_REQUIREMENTS_ERROR'
      });
    }
  }
);

// Get MFA statistics (admin only)
router.get("/admin/statistics", 
  requireSignIn,
  requirePermission('audit_logs', 'read'),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const mfaEnabledUsers = await User.countDocuments({ mfaEnabled: true });
      const totalDevices = await MFADevice.countDocuments({ isActive: true, isVerified: true });
      
      const deviceTypeStats = await MFADevice.aggregate([
        { $match: { isActive: true, isVerified: true } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } }
      ]);

      const recentSetups = await MFADevice.countDocuments({
        isVerified: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });

      res.status(200).json({
        success: true,
        statistics: {
          totalUsers,
          mfaEnabledUsers,
          mfaAdoptionRate: totalUsers > 0 ? (mfaEnabledUsers / totalUsers * 100).toFixed(2) : 0,
          totalActiveDevices: totalDevices,
          deviceTypes: deviceTypeStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          recentSetups
        }
      });

    } catch (error) {
      console.error('Error getting MFA statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving MFA statistics',
        code: 'MFA_STATS_ERROR'
      });
    }
  }
);

export default router;

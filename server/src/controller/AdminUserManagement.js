import mongoose from 'mongoose';
import User from '../models/User.js';
import Role from '../models/Role.js';
import RolePermission from '../models/RolePermission.js';
import MFADevice from '../models/MFADevice.js';
import AuditLog from '../models/AuditLog.js';
import { hashPassword, generateSecurePassword } from '../utils/passwordPolicy.js';
import { logAuditEvent } from '../middlewares/AuditLogger.js';

/**
 * Get all users with pagination and filtering
 */
export const getAllUsersController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      stateId,
      status,
      mfaEnabled,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (stateId) query.stateId = stateId;
    if (status) query.accountStatus = status;
    if (mfaEnabled !== undefined) query.mfaEnabled = mfaEnabled === 'true';

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .populate('roles', 'name displayName hierarchyLevel')
      .populate('primaryRole', 'name displayName hierarchyLevel')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password -mfaSecret -passwordHistory');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      code: 'FETCH_USERS_ERROR'
    });
  }
};

/**
 * Get user details by ID
 */
export const getUserDetailsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('roles', 'name displayName hierarchyLevel scope')
      .populate('primaryRole', 'name displayName hierarchyLevel scope')
      .select('-password -mfaSecret -passwordHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get user's MFA devices
    const mfaDevices = await MFADevice.findUserDevices(userId);

    // Get recent activity
    const recentActivity = await AuditLog.findByUser(userId, { limit: 10 });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        securityStatus: user.securityStatus
      },
      mfaDevices: mfaDevices.map(device => ({
        id: device._id,
        name: device.deviceName,
        type: device.deviceType,
        isPrimary: device.isPrimary,
        lastUsed: device.lastUsed,
        status: device.status
      })),
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        resource: activity.resource,
        result: activity.result,
        description: activity.description,
        createdAt: activity.createdAt,
        ipAddress: activity.requestDetails?.ipAddress
      }))
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      code: 'USER_DETAILS_ERROR'
    });
  }
};

/**
 * Update user role
 */
export const updateUserRoleController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId, isPrimary = false } = req.body;
    const adminId = req.user?.id || req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
        code: 'ROLE_NOT_FOUND'
      });
    }

    // Store old roles for audit
    const oldRoles = [...user.roles];

    // Add role if not already present
    if (!user.roles.includes(roleId)) {
      await user.addRole(roleId);
    }

    // Set as primary if requested
    if (isPrimary) {
      user.primaryRole = roleId;
      await user.save();
    }

    // Log the action
    await logAuditEvent({
      user: adminId,
      action: 'user_role_changed',
      resource: 'user',
      resourceId: userId,
      targetUser: userId,
      result: 'success',
      description: `Admin assigned role ${role.displayName} to user ${user.email}`,
      changes: {
        before: { roles: oldRoles },
        after: { roles: user.roles },
        fields: ['roles']
      },
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        roles: user.roles,
        primaryRole: user.primaryRole
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      code: 'ROLE_UPDATE_ERROR'
    });
  }
};

/**
 * Remove user role
 */
export const removeUserRoleController = async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    const adminId = req.user?.id || req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
        code: 'ROLE_NOT_FOUND'
      });
    }

    // Store old roles for audit
    const oldRoles = [...user.roles];

    // Remove role
    await user.removeRole(roleId);

    // Log the action
    await logAuditEvent({
      user: adminId,
      action: 'role_removed',
      resource: 'user',
      resourceId: userId,
      targetUser: userId,
      result: 'success',
      description: `Admin removed role ${role.displayName} from user ${user.email}`,
      changes: {
        before: { roles: oldRoles },
        after: { roles: user.roles },
        fields: ['roles']
      },
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'User role removed successfully',
      user: {
        id: user._id,
        roles: user.roles,
        primaryRole: user.primaryRole
      }
    });

  } catch (error) {
    console.error('Error removing user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing user role',
      code: 'ROLE_REMOVE_ERROR'
    });
  }
};

/**
 * Lock/Unlock user account
 */
export const toggleAccountLockController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lock, reason } = req.body;
    const adminId = req.user?.id || req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (lock) {
      user.accountLocked = true;
      user.accountLockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      user.loginAttempts = 0;
    } else {
      user.accountLocked = false;
      user.accountLockedUntil = undefined;
      user.loginAttempts = 0;
    }

    await user.save();

    // Log the action
    await logAuditEvent({
      user: adminId,
      action: lock ? 'account_locked' : 'account_unlocked',
      resource: 'user',
      resourceId: userId,
      targetUser: userId,
      result: 'success',
      description: `Admin ${lock ? 'locked' : 'unlocked'} account for user ${user.email}${reason ? `: ${reason}` : ''}`,
      metadata: { reason },
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: `Account ${lock ? 'locked' : 'unlocked'} successfully`,
      user: {
        id: user._id,
        accountLocked: user.accountLocked,
        accountLockedUntil: user.accountLockedUntil
      }
    });

  } catch (error) {
    console.error('Error toggling account lock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating account lock status',
      code: 'ACCOUNT_LOCK_ERROR'
    });
  }
};

/**
 * Reset user password (admin)
 */
export const resetUserPasswordController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword, forceChange = true } = req.body;
    const adminId = req.user?.id || req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate password if not provided
    const password = newPassword || generateSecurePassword(12);
    const hashedPassword = await hashPassword(password);

    // Update user password
    user.password = hashedPassword;
    if (forceChange) {
      user.passwordChangeRequired = true;
    }
    
    // Reset login attempts
    user.loginAttempts = 0;
    user.accountLocked = false;
    user.accountLockedUntil = undefined;

    await user.save();

    // Log the action
    await logAuditEvent({
      user: adminId,
      action: 'password_reset',
      resource: 'user',
      resourceId: userId,
      targetUser: userId,
      result: 'success',
      description: `Admin reset password for user ${user.email}`,
      metadata: { 
        forceChange,
        generatedPassword: !newPassword
      },
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
      ...(newPassword ? {} : { temporaryPassword: password }),
      forceChange
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      code: 'PASSWORD_RESET_ERROR'
    });
  }
};

/**
 * Bulk user operations
 */
export const bulkUserOperationsController = async (req, res) => {
  try {
    const { operation, userIds, data } = req.body;
    const adminId = req.user?.id || req.user?._id;

    if (!operation || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Operation and user IDs are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }

        switch (operation) {
          case 'lock_accounts':
            user.accountLocked = true;
            user.accountLockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();
            break;

          case 'unlock_accounts':
            user.accountLocked = false;
            user.accountLockedUntil = undefined;
            user.loginAttempts = 0;
            await user.save();
            break;

          case 'assign_role':
            if (data.roleId) {
              await user.addRole(data.roleId);
            }
            break;

          case 'remove_role':
            if (data.roleId) {
              await user.removeRole(data.roleId);
            }
            break;

          case 'update_state':
            if (data.stateId) {
              user.stateId = data.stateId;
              await user.save();
            }
            break;

          default:
            errors.push({ userId, error: 'Unknown operation' });
            continue;
        }

        results.push({ userId, success: true });

        // Log individual action
        await logAuditEvent({
          user: adminId,
          action: `bulk_${operation}`,
          resource: 'user',
          resourceId: userId,
          targetUser: userId,
          result: 'success',
          description: `Admin performed bulk operation ${operation} on user ${user.email}`,
          metadata: { bulkOperation: true, data },
          requestDetails: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        });

      } catch (error) {
        errors.push({ userId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk operation ${operation} completed`,
      results: {
        successful: results.length,
        failed: errors.length,
        details: { results, errors }
      }
    });

  } catch (error) {
    console.error('Error in bulk operations:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk operations',
      code: 'BULK_OPERATION_ERROR'
    });
  }
};

/**
 * Get user activity summary
 */
export const getUserActivityController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const activity = await AuditLog.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          totalActions: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      activity,
      summary: {
        totalDays: days,
        activeDays: activity.length,
        totalActions: activity.reduce((sum, day) => sum + day.totalActions, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity',
      code: 'USER_ACTIVITY_ERROR'
    });
  }
};

export default {
  getAllUsersController,
  getUserDetailsController,
  updateUserRoleController,
  removeUserRoleController,
  toggleAccountLockController,
  resetUserPasswordController,
  bulkUserOperationsController,
  getUserActivityController
};

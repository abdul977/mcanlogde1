import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import User from '../models/User.js';
import MFADevice from '../models/MFADevice.js';

/**
 * Setup TOTP MFA for user
 */
export const setupTOTPController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { deviceName = 'Authenticator App' } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user already has TOTP device
    const existingDevice = await MFADevice.findOne({
      user: userId,
      deviceType: 'authenticator_app',
      isActive: true
    });

    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'TOTP device already exists. Please remove existing device first.',
        code: 'TOTP_ALREADY_EXISTS'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `MCAN Lodge (${user.email})`,
      issuer: 'MCAN Lodge',
      length: 32
    });

    // Create device record (unverified)
    const createdFrom = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const device = await MFADevice.createDevice(userId, {
      deviceName,
      deviceType: 'authenticator_app',
      secret: secret.base32
    }, createdFrom);

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: 'TOTP setup initiated',
      setup: {
        deviceId: device._id,
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        backupCodes: device.backupCodes.map(bc => bc.code),
        instructions: [
          '1. Install an authenticator app (Google Authenticator, Authy, etc.)',
          '2. Scan the QR code or manually enter the secret key',
          '3. Enter the 6-digit code from your app to verify setup'
        ]
      }
    });

  } catch (error) {
    console.error('Error setting up TOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up TOTP',
      code: 'TOTP_SETUP_ERROR'
    });
  }
};

/**
 * Verify TOTP setup
 */
export const verifyTOTPSetupController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { deviceId, token } = req.body;

    if (!userId || !deviceId || !token) {
      return res.status(400).json({
        success: false,
        message: 'Device ID and verification token are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    // Get device
    const device = await MFADevice.findOne({
      _id: deviceId,
      user: userId,
      deviceType: 'authenticator_app',
      isVerified: false
    }).select('+secret');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or already verified',
        code: 'DEVICE_NOT_FOUND'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: device.secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });

    if (!verified) {
      await device.recordVerificationAttempt(false);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        attemptsRemaining: Math.max(0, 5 - device.verificationAttempts.count),
        code: 'INVALID_TOKEN'
      });
    }

    // Activate device
    await device.activate();
    await device.recordVerificationAttempt(true);

    // Update user MFA status
    const user = await User.findById(userId);
    user.mfaEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'TOTP setup completed successfully',
      device: {
        id: device._id,
        name: device.deviceName,
        type: device.deviceType,
        isPrimary: device.isPrimary,
        backupCodesRemaining: device.availableBackupCodes
      }
    });

  } catch (error) {
    console.error('Error verifying TOTP setup:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying TOTP setup',
      code: 'TOTP_VERIFY_ERROR'
    });
  }
};

/**
 * Verify TOTP token for authentication
 */
export const verifyTOTPController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { token, deviceId } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Get device (primary if not specified)
    let device;
    if (deviceId) {
      device = await MFADevice.findOne({
        _id: deviceId,
        user: userId,
        isActive: true,
        isVerified: true
      }).select('+secret');
    } else {
      device = await MFADevice.findPrimaryDevice(userId).select('+secret');
    }

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'No active MFA device found',
        code: 'NO_MFA_DEVICE'
      });
    }

    if (device.isLocked()) {
      const lockTimeRemaining = Math.ceil((device.verificationAttempts.lockedUntil - new Date()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Device is locked due to too many failed attempts. Try again in ${lockTimeRemaining} minutes.`,
        code: 'DEVICE_LOCKED',
        lockTimeRemaining
      });
    }

    let verified = false;

    // Try TOTP verification
    if (device.deviceType === 'authenticator_app') {
      verified = speakeasy.totp.verify({
        secret: device.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    // Try backup code if TOTP failed
    if (!verified && device.deviceType === 'authenticator_app') {
      const backupResult = device.useBackupCode(token);
      if (backupResult.success) {
        verified = true;
        await device.save(); // Save backup code usage
      }
    }

    if (!verified) {
      await device.recordVerificationAttempt(false);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        attemptsRemaining: Math.max(0, 5 - device.verificationAttempts.count),
        code: 'INVALID_TOKEN'
      });
    }

    // Record successful verification
    await device.recordVerificationAttempt(true);

    res.status(200).json({
      success: true,
      message: 'MFA verification successful',
      device: {
        id: device._id,
        name: device.deviceName,
        type: device.deviceType
      }
    });

  } catch (error) {
    console.error('Error verifying TOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying MFA token',
      code: 'MFA_VERIFY_ERROR'
    });
  }
};

/**
 * Get user's MFA devices
 */
export const getMFADevicesController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const devices = await MFADevice.findUserDevices(userId);

    const deviceList = devices.map(device => ({
      id: device._id,
      name: device.deviceName,
      type: device.deviceType,
      isPrimary: device.isPrimary,
      isActive: device.isActive,
      isVerified: device.isVerified,
      lastUsed: device.lastUsed,
      usageCount: device.usageCount,
      backupCodesRemaining: device.availableBackupCodes,
      createdAt: device.createdAt,
      status: device.status
    }));

    res.status(200).json({
      success: true,
      devices: deviceList,
      totalDevices: deviceList.length,
      hasActiveMFA: deviceList.some(d => d.isActive && d.isVerified)
    });

  } catch (error) {
    console.error('Error getting MFA devices:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving MFA devices',
      code: 'MFA_DEVICES_ERROR'
    });
  }
};

/**
 * Remove MFA device
 */
export const removeMFADeviceController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { deviceId } = req.params;

    if (!userId || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required',
        code: 'MISSING_DEVICE_ID'
      });
    }

    const device = await MFADevice.findOne({
      _id: deviceId,
      user: userId
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
        code: 'DEVICE_NOT_FOUND'
      });
    }

    // Check if this is the last active device
    const activeDeviceCount = await MFADevice.getUserDeviceCount(userId);
    
    if (activeDeviceCount === 1 && device.isActive && device.isVerified) {
      // Disable MFA for user if removing last device
      const user = await User.findById(userId);
      user.mfaEnabled = false;
      await user.save();
    }

    await device.remove();

    res.status(200).json({
      success: true,
      message: 'MFA device removed successfully',
      mfaStillEnabled: activeDeviceCount > 1
    });

  } catch (error) {
    console.error('Error removing MFA device:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing MFA device',
      code: 'MFA_REMOVE_ERROR'
    });
  }
};

/**
 * Generate new backup codes
 */
export const generateBackupCodesController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { deviceId } = req.params;

    if (!userId || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required',
        code: 'MISSING_DEVICE_ID'
      });
    }

    const device = await MFADevice.findOne({
      _id: deviceId,
      user: userId,
      deviceType: 'authenticator_app',
      isActive: true,
      isVerified: true
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or not eligible for backup codes',
        code: 'DEVICE_NOT_FOUND'
      });
    }

    const newCodes = device.generateBackupCodes();
    await device.save();

    res.status(200).json({
      success: true,
      message: 'New backup codes generated',
      backupCodes: newCodes,
      warning: 'Store these codes securely. They will not be shown again.'
    });

  } catch (error) {
    console.error('Error generating backup codes:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating backup codes',
      code: 'BACKUP_CODES_ERROR'
    });
  }
};

/**
 * Disable MFA for user (admin only)
 */
export const disableMFAController = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Get target user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Deactivate all MFA devices
    await MFADevice.updateMany(
      { user: userId },
      { isActive: false }
    );

    // Disable MFA for user
    user.mfaEnabled = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA disabled for user',
      user: {
        id: user._id,
        email: user.email,
        mfaEnabled: user.mfaEnabled
      }
    });

  } catch (error) {
    console.error('Error disabling MFA:', error);
    res.status(500).json({
      success: false,
      message: 'Error disabling MFA',
      code: 'MFA_DISABLE_ERROR'
    });
  }
};

export default {
  setupTOTPController,
  verifyTOTPSetupController,
  verifyTOTPController,
  getMFADevicesController,
  removeMFADeviceController,
  generateBackupCodesController,
  disableMFAController
};

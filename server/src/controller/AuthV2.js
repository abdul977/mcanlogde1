import User from "../models/User.js";
import { hashPassword, verifyPassword, validatePassword, addToPasswordHistory } from "../utils/passwordPolicy.js";
import tokenManager from "../utils/tokenManager.js";
import RefreshToken from "../models/RefreshToken.js";

/**
 * Enhanced login controller with token rotation
 */
export const loginV2Controller = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Find user and include security fields
    const user = await User.findOne({ email })
      .populate('roles')
      .populate('primaryRole')
      .select('+password +loginAttempts +accountLocked +accountLockedUntil +mfaEnabled +mfaSecret');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockTimeRemaining = Math.ceil((user.accountLockedUntil - new Date()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account is locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
        code: "ACCOUNT_LOCKED",
        lockTimeRemaining
      });
    }

    // Verify password (support both bcrypt and argon2)
    let isPasswordValid = false;
    if (user.password.startsWith('$argon2')) {
      isPasswordValid = await verifyPassword(password, user.password);
    } else {
      // Legacy bcrypt support
      const bcrypt = await import('bcryptjs');
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Check if account is active
    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus}. Please contact support.`,
        code: "ACCOUNT_INACTIVE"
      });
    }

    // Parse device information
    const deviceInfo = tokenManager.parseDeviceInfo(req);

    // Check for suspicious activity
    const suspiciousActivity = await tokenManager.detectSuspiciousActivity(user._id, deviceInfo);
    
    if (suspiciousActivity.success && suspiciousActivity.flags.multipleIPs) {
      console.warn(`🚨 Suspicious login activity detected for user ${user.email}`);
      // Could implement additional security measures here
    }

    // Generate token pair
    const tokenData = await tokenManager.generateTokenPair(user, deviceInfo, {
      location: req.body.location // Optional location data
    });

    // Record successful login
    await user.recordLogin(deviceInfo.ipAddress, deviceInfo.userAgent);

    // Add session to user
    await user.addSession(tokenData.refreshTokenDoc.jti, deviceInfo);

    // Prepare user response (exclude sensitive fields)
    const userResponse = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: user.roles,
      primaryRole: user.primaryRole,
      stateId: user.stateId,
      chapterId: user.chapterId,
      campusId: user.campusId,
      profileCompleted: user.profileCompleted,
      mfaEnabled: user.mfaEnabled,
      accountStatus: user.accountStatus,
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenType: tokenData.tokenType,
      expiresIn: tokenData.expiresIn,
      user: userResponse,
      sessionId: tokenData.refreshTokenDoc.jti,
      requiresMFA: user.mfaEnabled && user.roles?.some(role => 
        ['super_admin', 'national_admin'].includes(role.name)
      )
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login",
      code: "LOGIN_ERROR"
    });
  }
};

/**
 * Token refresh controller
 */
export const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
        code: "REFRESH_TOKEN_REQUIRED"
      });
    }

    // Parse device information
    const deviceInfo = tokenManager.parseDeviceInfo(req);

    // Rotate the refresh token
    const rotationResult = await tokenManager.rotateRefreshToken(refreshToken, deviceInfo);

    if (!rotationResult.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
        error: rotationResult.error,
        code: "INVALID_REFRESH_TOKEN"
      });
    }

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: rotationResult.accessToken,
      refreshToken: rotationResult.refreshToken,
      tokenType: rotationResult.tokenType,
      expiresIn: rotationResult.expiresIn,
      user: rotationResult.user
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
      code: "REFRESH_ERROR"
    });
  }
};

/**
 * Enhanced logout controller
 */
export const logoutV2Controller = async (req, res) => {
  try {
    const { refreshToken, logoutAll = false } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
        code: "NOT_AUTHENTICATED"
      });
    }

    if (logoutAll) {
      // Logout from all devices
      const result = await tokenManager.revokeAllUserTokens(userId, userId, 'user_logout_all');
      
      if (result.success) {
        // Clear user sessions
        const user = await User.findById(userId);
        if (user) {
          user.activeSessions = [];
          await user.save();
        }

        return res.status(200).json({
          success: true,
          message: `Logged out from all devices (${result.revokedCount} sessions)`,
          code: "LOGOUT_ALL_SUCCESS"
        });
      }
    } else if (refreshToken) {
      // Logout from current device only
      const result = await tokenManager.revokeRefreshToken(refreshToken, userId, 'user_logout');
      
      if (result.success) {
        // Remove session from user
        const user = await User.findById(userId);
        if (user) {
          // Find and remove the session by refresh token
          const tokenDoc = await RefreshToken.findOne({ 
            user: userId, 
            tokenHash: require('crypto').createHash('sha256').update(refreshToken).digest('hex')
          });
          
          if (tokenDoc) {
            await user.removeSession(tokenDoc.jti);
          }
        }

        return res.status(200).json({
          success: true,
          message: "Logged out successfully",
          code: "LOGOUT_SUCCESS"
        });
      }
    }

    // Fallback - just return success even if token wasn't found
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      code: "LOGOUT_SUCCESS"
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
      code: "LOGOUT_ERROR"
    });
  }
};

/**
 * Get user sessions
 */
export const getUserSessionsController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
        code: "NOT_AUTHENTICATED"
      });
    }

    const result = await tokenManager.getUserActiveSessions(userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        sessions: result.sessions,
        totalSessions: result.sessions.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error retrieving sessions",
        error: result.error,
        code: "SESSIONS_ERROR"
      });
    }

  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving sessions",
      code: "SESSIONS_ERROR"
    });
  }
};

/**
 * Revoke specific session
 */
export const revokeSessionController = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "User ID and session ID are required",
        code: "MISSING_PARAMETERS"
      });
    }

    // Find the refresh token by JTI (session ID)
    const tokenDoc = await RefreshToken.findOne({ 
      user: userId, 
      jti: sessionId,
      isActive: true 
    });

    if (!tokenDoc) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
        code: "SESSION_NOT_FOUND"
      });
    }

    // Revoke the token
    await tokenDoc.revoke(userId, 'user_session_revoke');

    // Remove from user sessions
    const user = await User.findById(userId);
    if (user) {
      await user.removeSession(sessionId);
    }

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
      code: "SESSION_REVOKED"
    });

  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error revoking session",
      code: "REVOKE_SESSION_ERROR"
    });
  }
};

export default {
  loginV2Controller,
  refreshTokenController,
  logoutV2Controller,
  getUserSessionsController,
  revokeSessionController
};

import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import tokenManager from '../utils/tokenManager.js';

/**
 * Session Manager for secure HTTP-only cookie management
 */
class SessionManager {
  constructor() {
    this.cookieName = 'mcan_refresh_token';
    this.sessionCookieName = 'mcan_session_id';
    this.maxConcurrentSessions = 5;
    this.cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    };
  }

  /**
   * Set refresh token in HTTP-only cookie
   */
  setRefreshTokenCookie(res, refreshToken, options = {}) {
    const cookieOptions = {
      ...this.cookieOptions,
      ...options
    };

    res.cookie(this.cookieName, refreshToken, cookieOptions);
  }

  /**
   * Set session ID in HTTP-only cookie
   */
  setSessionCookie(res, sessionId, options = {}) {
    const cookieOptions = {
      ...this.cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours for session ID
      ...options
    };

    res.cookie(this.sessionCookieName, sessionId, cookieOptions);
  }

  /**
   * Get refresh token from cookie
   */
  getRefreshTokenFromCookie(req) {
    return req.cookies?.[this.cookieName];
  }

  /**
   * Get session ID from cookie
   */
  getSessionIdFromCookie(req) {
    return req.cookies?.[this.sessionCookieName];
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(res) {
    res.clearCookie(this.cookieName, { path: '/' });
    res.clearCookie(this.sessionCookieName, { path: '/' });
  }

  /**
   * Create secure session
   */
  async createSession(user, deviceInfo, res, options = {}) {
    try {
      // Check concurrent session limit
      const activeSessions = await RefreshToken.getUserActiveTokens(user._id);
      
      if (activeSessions.length >= this.maxConcurrentSessions) {
        // Remove oldest session
        const oldestSession = activeSessions[activeSessions.length - 1];
        await oldestSession.revoke(user._id, 'session_limit_exceeded');
        
        // Remove from user's active sessions
        await user.removeSession(oldestSession.jti);
      }

      // Generate token pair
      const tokenData = await tokenManager.generateTokenPair(user, deviceInfo, options);

      // Set cookies
      this.setRefreshTokenCookie(res, tokenData.refreshToken);
      this.setSessionCookie(res, tokenData.refreshTokenDoc.jti);

      // Add session to user
      await user.addSession(tokenData.refreshTokenDoc.jti, deviceInfo);

      return {
        success: true,
        sessionId: tokenData.refreshTokenDoc.jti,
        accessToken: tokenData.accessToken,
        expiresIn: tokenData.expiresIn,
        tokenType: tokenData.tokenType
      };

    } catch (error) {
      console.error('Error creating session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(req, res) {
    try {
      const refreshToken = this.getRefreshTokenFromCookie(req);
      
      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token found in cookies'
        };
      }

      // Parse device information
      const deviceInfo = tokenManager.parseDeviceInfo(req);

      // Rotate the refresh token
      const rotationResult = await tokenManager.rotateRefreshToken(refreshToken, deviceInfo);

      if (!rotationResult.success) {
        // Clear invalid cookies
        this.clearAuthCookies(res);
        return rotationResult;
      }

      // Set new cookies
      this.setRefreshTokenCookie(res, rotationResult.refreshToken);
      this.setSessionCookie(res, rotationResult.refreshTokenDoc.jti);

      // Update user session
      const user = await User.findById(rotationResult.user.id);
      if (user) {
        await user.updateSessionActivity(rotationResult.refreshTokenDoc.jti);
      }

      return {
        success: true,
        accessToken: rotationResult.accessToken,
        expiresIn: rotationResult.expiresIn,
        tokenType: rotationResult.tokenType,
        user: rotationResult.user
      };

    } catch (error) {
      console.error('Error refreshing session:', error);
      this.clearAuthCookies(res);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Destroy session
   */
  async destroySession(req, res, userId) {
    try {
      const refreshToken = this.getRefreshTokenFromCookie(req);
      const sessionId = this.getSessionIdFromCookie(req);

      // Clear cookies first
      this.clearAuthCookies(res);

      if (refreshToken) {
        // Revoke refresh token
        await tokenManager.revokeRefreshToken(refreshToken, userId, 'user_logout');
      }

      if (sessionId && userId) {
        // Remove session from user
        const user = await User.findById(userId);
        if (user) {
          await user.removeSession(sessionId);
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Error destroying session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate session
   */
  async validateSession(req) {
    try {
      const sessionId = this.getSessionIdFromCookie(req);
      const refreshToken = this.getRefreshTokenFromCookie(req);

      if (!sessionId || !refreshToken) {
        return {
          valid: false,
          error: 'Missing session cookies'
        };
      }

      // Verify refresh token
      const verification = await tokenManager.verifyRefreshToken(refreshToken);

      if (!verification.valid) {
        return {
          valid: false,
          error: verification.error
        };
      }

      // Check if session ID matches
      if (verification.tokenDoc.jti !== sessionId) {
        return {
          valid: false,
          error: 'Session ID mismatch'
        };
      }

      // Get user and validate session
      const user = await User.findById(verification.decoded.userId);
      if (!user) {
        return {
          valid: false,
          error: 'User not found'
        };
      }

      const userSession = user.activeSessions?.find(session => 
        session.sessionId === sessionId && session.isActive
      );

      if (!userSession) {
        return {
          valid: false,
          error: 'Session not found in user records'
        };
      }

      return {
        valid: true,
        user,
        session: userSession,
        tokenDoc: verification.tokenDoc
      };

    } catch (error) {
      console.error('Error validating session:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get session info
   */
  async getSessionInfo(req) {
    try {
      const validation = await this.validateSession(req);

      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const deviceInfo = tokenManager.parseDeviceInfo(req);

      return {
        success: true,
        session: {
          id: validation.session.sessionId,
          userId: validation.user._id,
          deviceInfo: validation.session.deviceInfo,
          createdAt: validation.session.createdAt,
          lastActivity: validation.session.lastActivity,
          currentDevice: deviceInfo,
          isCurrentDevice: validation.session.deviceInfo.deviceFingerprint === deviceInfo.deviceFingerprint
        }
      };

    } catch (error) {
      console.error('Error getting session info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Middleware functions

/**
 * Middleware to extract session from cookies
 */
export const extractSessionMiddleware = async (req, res, next) => {
  try {
    const sessionManager = new SessionManager();
    const validation = await sessionManager.validateSession(req);

    if (validation.valid) {
      req.session = {
        user: validation.user,
        sessionInfo: validation.session,
        tokenDoc: validation.tokenDoc
      };
    }

    req.sessionManager = sessionManager;
    next();

  } catch (error) {
    console.error('Error in session extraction middleware:', error);
    req.sessionManager = new SessionManager();
    next();
  }
};

/**
 * Middleware to require valid session
 */
export const requireValidSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Valid session required',
        code: 'INVALID_SESSION'
      });
    }

    // Add user to request for compatibility
    req.user = {
      ...req.session.user.toObject(),
      _id: req.session.user._id,
      id: req.session.user._id
    };

    next();

  } catch (error) {
    console.error('Error in session validation middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Session validation error',
      code: 'SESSION_ERROR'
    });
  }
};

/**
 * Middleware to auto-refresh expired access tokens
 */
export const autoRefreshMiddleware = async (req, res, next) => {
  try {
    // Check if we have a valid session but no valid access token
    if (req.session && req.session.user && !req.user) {
      const refreshResult = await req.sessionManager.refreshSession(req, res);

      if (refreshResult.success) {
        // Add refreshed user to request
        req.user = {
          ...refreshResult.user,
          _id: refreshResult.user.id,
          id: refreshResult.user.id
        };

        // Add new access token to response headers
        res.set('X-New-Access-Token', refreshResult.accessToken);
      }
    }

    next();

  } catch (error) {
    console.error('Error in auto-refresh middleware:', error);
    next();
  }
};

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;

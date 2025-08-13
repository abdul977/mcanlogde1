import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';

/**
 * Token Manager for JWT Access/Refresh Token System
 */
class TokenManager {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    this.accessTokenExpiry = '15m'; // 15 minutes
    this.refreshTokenExpiry = 7; // 7 days
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload) {
    const tokenPayload = {
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID()
    };

    return jwt.sign(tokenPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'mcan-lodge',
      audience: 'mcan-users'
    });
  }

  /**
   * Generate refresh token and store in database
   */
  async generateRefreshToken(userId, deviceInfo, options = {}) {
    const jti = crypto.randomUUID();
    const tokenFamily = options.tokenFamily || crypto.randomUUID();
    
    // Create token payload
    const tokenPayload = {
      userId,
      type: 'refresh',
      jti,
      tokenFamily,
      iat: Math.floor(Date.now() / 1000)
    };

    // Sign the token
    const token = jwt.sign(tokenPayload, this.refreshTokenSecret, {
      expiresIn: `${this.refreshTokenExpiry}d`,
      issuer: 'mcan-lodge',
      audience: 'mcan-users'
    });

    // Hash the token for storage
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Store in database
    const refreshTokenDoc = await RefreshToken.createToken(
      userId,
      deviceInfo,
      {
        expiresInDays: this.refreshTokenExpiry,
        tokenFamily,
        previousToken: options.previousToken,
        location: options.location
      }
    );

    // Update the token hash
    refreshTokenDoc.tokenHash = tokenHash;
    refreshTokenDoc.jti = jti;
    await refreshTokenDoc.save();

    return {
      token,
      tokenDoc: refreshTokenDoc,
      jti,
      tokenFamily
    };
  }

  /**
   * Generate token pair (access + refresh)
   */
  async generateTokenPair(user, deviceInfo, options = {}) {
    // Prepare user payload for access token
    const userPayload = {
      _id: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      roles: user.roles,
      primaryRole: user.primaryRole,
      stateId: user.stateId,
      chapterId: user.chapterId,
      campusId: user.campusId
    };

    // Generate access token
    const accessToken = this.generateAccessToken(userPayload);

    // Generate refresh token
    const refreshTokenData = await this.generateRefreshToken(
      user._id,
      deviceInfo,
      options
    );

    return {
      accessToken,
      refreshToken: refreshTokenData.token,
      refreshTokenDoc: refreshTokenData.tokenDoc,
      tokenFamily: refreshTokenData.tokenFamily,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'mcan-lodge',
        audience: 'mcan-users'
      });

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return { valid: true, decoded, error: null };
    } catch (error) {
      return { valid: false, decoded: null, error: error.message };
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token) {
    try {
      // First verify JWT signature and structure
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'mcan-lodge',
        audience: 'mcan-users'
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Hash the token to find in database
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find token in database
      const tokenDoc = await RefreshToken.findByTokenHash(tokenHash);

      if (!tokenDoc) {
        throw new Error('Token not found in database');
      }

      if (!tokenDoc.isUsable()) {
        throw new Error('Token is not usable');
      }

      return {
        valid: true,
        decoded,
        tokenDoc,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        decoded: null,
        tokenDoc: null,
        error: error.message
      };
    }
  }

  /**
   * Rotate refresh token
   */
  async rotateRefreshToken(oldToken, deviceInfo) {
    try {
      // Verify the old token
      const verification = await this.verifyRefreshToken(oldToken);

      if (!verification.valid) {
        throw new Error(`Invalid refresh token: ${verification.error}`);
      }

      const { decoded, tokenDoc } = verification;

      // Check for token reuse (security breach detection)
      if (tokenDoc.usageCount > 0) {
        // Potential token theft - revoke entire token family
        await RefreshToken.revokeTokenFamily(
          decoded.tokenFamily,
          null,
          'security_breach'
        );
        throw new Error('Token reuse detected - security breach');
      }

      // Mark old token as used
      await tokenDoc.use();

      // Get user
      const user = await User.findById(decoded.userId).populate('roles');
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token pair
      const newTokens = await this.generateTokenPair(
        user,
        deviceInfo,
        {
          tokenFamily: decoded.tokenFamily,
          previousToken: tokenDoc._id
        }
      );

      return {
        success: true,
        ...newTokens,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          roles: user.roles,
          primaryRole: user.primaryRole
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token, revokedBy, reason = 'user_logout') {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const tokenDoc = await RefreshToken.findByTokenHash(tokenHash);

      if (tokenDoc) {
        await tokenDoc.revoke(revokedBy, reason);
        return { success: true };
      }

      return { success: false, error: 'Token not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revoke all user tokens
   */
  async revokeAllUserTokens(userId, revokedBy, reason = 'admin_revoke') {
    try {
      const revokedTokens = await RefreshToken.revokeAllUserTokens(
        userId,
        revokedBy,
        reason
      );
      return { success: true, revokedCount: revokedTokens.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user active sessions
   */
  async getUserActiveSessions(userId) {
    try {
      const activeTokens = await RefreshToken.getUserActiveTokens(userId);
      
      const sessions = activeTokens.map(token => ({
        id: token._id,
        deviceInfo: token.deviceInfo,
        location: token.location,
        createdAt: token.createdAt,
        lastUsedAt: token.lastUsedAt,
        isActive: token.isActive,
        ageInMinutes: token.ageInMinutes
      }));

      return { success: true, sessions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect suspicious token activity
   */
  async detectSuspiciousActivity(userId, deviceInfo) {
    try {
      const suspiciousFlags = await RefreshToken.detectSuspiciousActivity(
        userId,
        deviceInfo
      );

      return { success: true, flags: suspiciousFlags };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract token from authorization header
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    // Support both "Bearer <token>" and token without "Bearer" prefix
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return authHeader;
  }

  /**
   * Parse device info from request
   */
  parseDeviceInfo(req) {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;

    // Simple device type detection
    let deviceType = 'unknown';
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/desktop|windows|mac|linux/i.test(userAgent)) {
      deviceType = 'desktop';
    }

    // Simple browser detection
    let browser = 'unknown';
    if (/chrome/i.test(userAgent)) browser = 'chrome';
    else if (/firefox/i.test(userAgent)) browser = 'firefox';
    else if (/safari/i.test(userAgent)) browser = 'safari';
    else if (/edge/i.test(userAgent)) browser = 'edge';

    // Simple OS detection
    let os = 'unknown';
    if (/windows/i.test(userAgent)) os = 'windows';
    else if (/mac/i.test(userAgent)) os = 'macos';
    else if (/linux/i.test(userAgent)) os = 'linux';
    else if (/android/i.test(userAgent)) os = 'android';
    else if (/ios/i.test(userAgent)) os = 'ios';

    return {
      userAgent,
      ipAddress: ip,
      deviceType,
      browser,
      os,
      deviceFingerprint: crypto
        .createHash('md5')
        .update(userAgent + ip)
        .digest('hex')
        .slice(0, 16)
    };
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;

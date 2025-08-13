import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import Redis from 'redis';
import User from '../models/User.js';

// Redis client for distributed rate limiting
let redisClient = null;

// Initialize Redis client if available
const initializeRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        redisClient = null;
      });
      
      await redisClient.connect();
      console.log('✅ Redis connected for rate limiting');
    }
  } catch (error) {
    console.warn('⚠️ Redis not available, using memory store for rate limiting');
    redisClient = null;
  }
};

// Initialize Redis on module load
initializeRedis();

// Custom store for Redis-backed rate limiting
class RedisStore {
  constructor(options = {}) {
    this.prefix = options.prefix || 'rl:';
    this.client = redisClient;
  }

  async increment(key) {
    if (!this.client) {
      // Fallback to memory store behavior
      return { totalHits: 1, resetTime: new Date(Date.now() + 60000) };
    }

    const redisKey = this.prefix + key;
    const multi = this.client.multi();
    
    multi.incr(redisKey);
    multi.expire(redisKey, 60); // 1 minute expiry
    multi.ttl(redisKey);
    
    const results = await multi.exec();
    const totalHits = results[0];
    const ttl = results[2];
    
    return {
      totalHits,
      resetTime: new Date(Date.now() + ttl * 1000)
    };
  }

  async decrement(key) {
    if (!this.client) return;
    
    const redisKey = this.prefix + key;
    await this.client.decr(redisKey);
  }

  async resetKey(key) {
    if (!this.client) return;
    
    const redisKey = this.prefix + key;
    await this.client.del(redisKey);
  }
}

// Simple key generator to avoid IPv6 issues
const enhancedKeyGenerator = (req) => {
  const userId = req.user?.id || req.user?._id;

  // For authenticated users, use user ID
  if (userId) {
    return `user:${userId}`;
  }

  // For unauthenticated users, use default IP-based key
  return req.ip || req.connection.remoteAddress || '127.0.0.1';
};

// Custom handler for rate limit exceeded
const rateLimitHandler = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.user?.id || req.user?._id;
  
  // Log the rate limit violation
  console.warn(`🚨 Rate limit exceeded - IP: ${ip}, User: ${userId || 'Anonymous'}, Path: ${req.path}`);
  
  // If user is authenticated, increment their login attempts
  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        await user.incrementLoginAttempts();
      }
    } catch (error) {
      console.error('Error updating user login attempts:', error);
    }
  }
  
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(req.rateLimit.resetTime.getTime() / 1000),
    code: 'RATE_LIMIT_EXCEEDED'
  });
};

// Skip function for rate limiting
const skipSuccessfulRequests = (req, res) => {
  // Skip rate limiting for successful requests (status < 400)
  return res.statusCode < 400;
};

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'GENERAL_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({ prefix: 'general:' }) : undefined,
  // Use default IP-based key generator
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({ prefix: 'auth:' }) : undefined,
  keyGenerator: enhancedKeyGenerator,
  handler: rateLimitHandler,
  skipSuccessfulRequests: skipSuccessfulRequests
});

// Progressive delay for repeated requests
export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  store: redisClient ? new RedisStore({ prefix: 'slow:' }) : undefined,
  keyGenerator: enhancedKeyGenerator
});

// Strict rate limiting for password reset
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 1 hour.',
    code: 'PASSWORD_RESET_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({ prefix: 'reset:' }) : undefined,
  keyGenerator: enhancedKeyGenerator
});

// Rate limiting for admin operations
export const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit admin operations
  message: {
    success: false,
    message: 'Too many admin operations. Please slow down.',
    code: 'ADMIN_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({ prefix: 'admin:' }) : undefined,
  keyGenerator: enhancedKeyGenerator
});

// Rate limiting for file uploads
export const uploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit file uploads
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.',
    code: 'UPLOAD_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({ prefix: 'upload:' }) : undefined,
  keyGenerator: enhancedKeyGenerator
});

// Custom middleware for account lockout
export const accountLockoutMiddleware = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }
    
    const user = await User.findOne({ email }).select('+loginAttempts +accountLocked +accountLockedUntil');
    
    if (!user) {
      return next();
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockTimeRemaining = Math.ceil((user.accountLockedUntil - new Date()) / 1000 / 60);
      
      return res.status(423).json({
        success: false,
        message: `Account is locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
        code: 'ACCOUNT_LOCKED',
        lockTimeRemaining: lockTimeRemaining
      });
    }
    
    // Add user to request for potential use in rate limit handler
    req.targetUser = user;
    next();
    
  } catch (error) {
    console.error('Error in account lockout middleware:', error);
    next();
  }
};

// Middleware to reset rate limits on successful authentication
export const resetRateLimitOnSuccess = async (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to detect successful responses
  res.json = function(data) {
    // If this is a successful login response
    if (data.success && data.token && req.targetUser) {
      // Reset rate limits for this user/IP combination
      if (redisClient) {
        const key = enhancedKeyGenerator(req);
        Promise.all([
          redisClient.del(`auth:${key}`),
          redisClient.del(`slow:${key}`)
        ]).catch(err => console.error('Error resetting rate limits:', err));
      }
      
      // Reset user's login attempts
      req.targetUser.resetLoginAttempts().catch(err => 
        console.error('Error resetting login attempts:', err)
      );
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

// Export Redis client for other modules
export { redisClient };

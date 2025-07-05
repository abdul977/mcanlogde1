import { createClient } from 'redis';

// Redis configuration
const redisConfig = {
  host: 'redis-15049.c274.us-east-1-3.ec2.redns.redis-cloud.com',
  port: 15049,
  // Add password if you have one
  // password: 'your-redis-password'
};

// Create Redis client
const redisClient = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  // password: redisConfig.password, // Uncomment if you have a password
});

// Redis connection event handlers
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

redisClient.on('end', () => {
  console.log('Redis connection ended');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

// Redis utility functions for messaging
export const redisUtils = {
  // Store user's socket ID for real-time messaging
  setUserSocket: async (userId, socketId) => {
    try {
      await redisClient.set(`user:${userId}:socket`, socketId, {
        EX: 3600 // Expire after 1 hour
      });
    } catch (error) {
      console.error('Error setting user socket:', error);
    }
  },

  // Get user's socket ID
  getUserSocket: async (userId) => {
    try {
      return await redisClient.get(`user:${userId}:socket`);
    } catch (error) {
      console.error('Error getting user socket:', error);
      return null;
    }
  },

  // Remove user's socket ID
  removeUserSocket: async (userId) => {
    try {
      await redisClient.del(`user:${userId}:socket`);
    } catch (error) {
      console.error('Error removing user socket:', error);
    }
  },

  // Store message in cache for quick retrieval
  cacheMessage: async (threadId, message) => {
    try {
      const key = `thread:${threadId}:messages`;
      await redisClient.lPush(key, JSON.stringify(message));
      // Keep only last 100 messages in cache
      await redisClient.lTrim(key, 0, 99);
      // Set expiration for the list
      await redisClient.expire(key, 86400); // 24 hours
    } catch (error) {
      console.error('Error caching message:', error);
    }
  },

  // Get cached messages for a thread
  getCachedMessages: async (threadId, limit = 50) => {
    try {
      const key = `thread:${threadId}:messages`;
      const messages = await redisClient.lRange(key, 0, limit - 1);
      return messages.map(msg => JSON.parse(msg)).reverse();
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  },

  // Set user online status
  setUserOnline: async (userId) => {
    try {
      await redisClient.set(`user:${userId}:online`, 'true', {
        EX: 300 // Expire after 5 minutes
      });
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  },

  // Check if user is online
  isUserOnline: async (userId) => {
    try {
      const status = await redisClient.get(`user:${userId}:online`);
      return status === 'true';
    } catch (error) {
      console.error('Error checking user online status:', error);
      return false;
    }
  },

  // Set user offline
  setUserOffline: async (userId) => {
    try {
      await redisClient.del(`user:${userId}:online`);
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  },

  // Store unread message count
  incrementUnreadCount: async (userId, threadId) => {
    try {
      const key = `user:${userId}:unread:${threadId}`;
      await redisClient.incr(key);
      await redisClient.expire(key, 86400); // 24 hours
    } catch (error) {
      console.error('Error incrementing unread count:', error);
    }
  },

  // Get unread message count
  getUnreadCount: async (userId, threadId) => {
    try {
      const key = `user:${userId}:unread:${threadId}`;
      const count = await redisClient.get(key);
      return parseInt(count) || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Clear unread count
  clearUnreadCount: async (userId, threadId) => {
    try {
      const key = `user:${userId}:unread:${threadId}`;
      await redisClient.del(key);
    } catch (error) {
      console.error('Error clearing unread count:', error);
    }
  }
};

export { redisClient, connectRedis };
export default redisClient;

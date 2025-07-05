import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { redisUtils } from './redis.js';

let io;

// Initialize Socket.IO
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'https://mcanlogde1.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded._id || decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Handle socket connections
  io.on('connection', async (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Store user's socket ID in Redis
    await redisUtils.setUserSocket(socket.userId, socket.id);
    await redisUtils.setUserOnline(socket.userId);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining a chat thread
    socket.on('join-thread', (threadId) => {
      socket.join(`thread:${threadId}`);
      console.log(`User ${socket.userId} joined thread ${threadId}`);
    });

    // Handle leaving a chat thread
    socket.on('leave-thread', (threadId) => {
      socket.leave(`thread:${threadId}`);
      console.log(`User ${socket.userId} left thread ${threadId}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(`thread:${data.threadId}`).emit('user-typing', {
        userId: socket.userId,
        threadId: data.threadId
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`thread:${data.threadId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        threadId: data.threadId
      });
    });

    // Handle message read status
    socket.on('mark-messages-read', async (data) => {
      const { threadId } = data;
      await redisUtils.clearUnreadCount(socket.userId, threadId);
      
      // Notify other users in the thread
      socket.to(`thread:${threadId}`).emit('messages-read', {
        userId: socket.userId,
        threadId
      });
    });

    // Handle user going offline
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);
      await redisUtils.removeUserSocket(socket.userId);
      await redisUtils.setUserOffline(socket.userId);
    });

    // Handle manual refresh request
    socket.on('refresh-messages', (threadId) => {
      socket.emit('refresh-requested', { threadId });
    });
  });

  return io;
};

// Utility functions for emitting events
export const socketUtils = {
  // Emit new message to thread participants
  emitNewMessage: async (threadId, message, excludeUserId = null) => {
    if (!io) return;

    const socketData = {
      message,
      threadId
    };

    if (excludeUserId) {
      io.to(`thread:${threadId}`).except(`user:${excludeUserId}`).emit('new-message', socketData);
    } else {
      io.to(`thread:${threadId}`).emit('new-message', socketData);
    }

    // Cache the message in Redis
    await redisUtils.cacheMessage(threadId, message);
  },

  // Emit message to specific user
  emitToUser: async (userId, event, data) => {
    if (!io) return;

    const socketId = await redisUtils.getUserSocket(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  },

  // Emit to all users in a thread
  emitToThread: (threadId, event, data) => {
    if (!io) return;
    io.to(`thread:${threadId}`).emit(event, data);
  },

  // Check if user is online
  isUserOnline: async (userId) => {
    return await redisUtils.isUserOnline(userId);
  },

  // Get online users count
  getOnlineUsersCount: () => {
    if (!io) return 0;
    return io.sockets.sockets.size;
  },

  // Emit notification to user
  emitNotification: async (userId, notification) => {
    if (!io) return;

    const socketId = await redisUtils.getUserSocket(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
  }
};

export { io };
export default io;

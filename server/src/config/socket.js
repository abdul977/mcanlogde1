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

    // Community-specific socket events

    // Join community room
    socket.on('join_community', async (data) => {
      try {
        const { communityId } = data;

        // Verify user is a member of the community
        const CommunityMember = (await import('../models/CommunityMember.js')).default;
        const member = await CommunityMember.findOne({
          community: communityId,
          user: socket.userId,
          status: 'active'
        });

        if (member) {
          socket.join(`community_${communityId}`);

          // Update member's last seen
          await member.updateLastSeen();

          // Notify other members that user joined
          socket.to(`community_${communityId}`).emit('member_online', {
            userId: socket.userId,
            timestamp: new Date()
          });

          socket.emit('community_joined', { communityId });
          console.log(`User ${socket.userId} joined community ${communityId}`);
        } else {
          socket.emit('error', { message: 'Not a member of this community' });
        }
      } catch (error) {
        console.error('Error joining community:', error);
        socket.emit('error', { message: 'Failed to join community' });
      }
    });

    // Leave community room
    socket.on('leave_community', (data) => {
      try {
        const { communityId } = data;
        socket.leave(`community_${communityId}`);

        // Notify other members that user left
        socket.to(`community_${communityId}`).emit('member_offline', {
          userId: socket.userId,
          timestamp: new Date()
        });

        socket.emit('community_left', { communityId });
        console.log(`User ${socket.userId} left community ${communityId}`);
      } catch (error) {
        console.error('Error leaving community:', error);
      }
    });

    // Handle typing indicators for communities
    socket.on('community_typing_start', (data) => {
      const { communityId } = data;
      socket.to(`community_${communityId}`).emit('member_typing_start', {
        userId: socket.userId,
        communityId,
        timestamp: new Date()
      });
    });

    socket.on('community_typing_stop', (data) => {
      const { communityId } = data;
      socket.to(`community_${communityId}`).emit('member_typing_stop', {
        userId: socket.userId,
        communityId,
        timestamp: new Date()
      });
    });

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
    if (!io) {
      console.log('Socket.IO not initialized');
      return;
    }

    const socketData = {
      message,
      threadId
    };

    console.log(`Emitting message to thread:${threadId}`, socketData);

    // Get all sockets in the thread room for debugging
    const socketsInRoom = await io.in(`thread:${threadId}`).fetchSockets();
    console.log(`Sockets in thread:${threadId}:`, socketsInRoom.length);

    // Emit to all users in the thread (including sender for real-time sync)
    io.to(`thread:${threadId}`).emit('new-message', socketData);

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

// Get Socket.IO instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Initialize community socket service
export const initializeCommunitySocket = () => {
  import('../services/communitySocketService.js').then(module => {
    module.default.initialize();
  });
};

export { io };
export default io;

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './UserContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [auth] = useAuth();

  useEffect(() => {
    if (auth?.token && auth?.user) {
      // Initialize socket connection
      const socketUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
      console.log('Connecting to socket server:', socketUrl);

      const newSocket = io(socketUrl, {
        auth: {
          token: auth.token
        },
        autoConnect: true,
        transports: ['websocket', 'polling']
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected to server:', socketUrl);
        console.log('Socket ID:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected from server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🚨 Socket connection error:', error);
        setIsConnected(false);
      });

      // User status events
      newSocket.on('user-online', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user-offline', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // If no auth, disconnect socket
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [auth?.token, auth?.user]);

  // Socket utility functions
  const socketUtils = {
    // Join a chat thread
    joinThread: (threadId) => {
      if (socket && isConnected) {
        console.log('Frontend: Joining thread:', threadId);
        socket.emit('join-thread', threadId);
      } else {
        console.log('Frontend: Cannot join thread - socket:', !!socket, 'isConnected:', isConnected);
      }
    },

    // Leave a chat thread
    leaveThread: (threadId) => {
      if (socket && isConnected) {
        socket.emit('leave-thread', threadId);
      }
    },

    // Send typing indicator
    startTyping: (threadId) => {
      if (socket && isConnected) {
        socket.emit('typing-start', { threadId });
      }
    },

    // Stop typing indicator
    stopTyping: (threadId) => {
      if (socket && isConnected) {
        socket.emit('typing-stop', { threadId });
      }
    },

    // Mark messages as read
    markMessagesRead: (threadId) => {
      if (socket && isConnected) {
        socket.emit('mark-messages-read', { threadId });
      }
    },

    // Request message refresh
    refreshMessages: (threadId) => {
      if (socket && isConnected) {
        socket.emit('refresh-messages', threadId);
      }
    },

    // Listen for new messages
    onNewMessage: (callback) => {
      if (socket) {
        socket.on('new-message', callback);
        return () => socket.off('new-message', callback);
      }
    },

    // Listen for typing indicators
    onUserTyping: (callback) => {
      if (socket) {
        socket.on('user-typing', callback);
        return () => socket.off('user-typing', callback);
      }
    },

    onUserStoppedTyping: (callback) => {
      if (socket) {
        socket.on('user-stopped-typing', callback);
        return () => socket.off('user-stopped-typing', callback);
      }
    },

    // Listen for message read status
    onMessagesRead: (callback) => {
      if (socket) {
        socket.on('messages-read', callback);
        return () => socket.off('messages-read', callback);
      }
    },

    // Listen for notifications
    onNotification: (callback) => {
      if (socket) {
        socket.on('notification', callback);
        return () => socket.off('notification', callback);
      }
    },

    // Listen for refresh requests
    onRefreshRequested: (callback) => {
      if (socket) {
        socket.on('refresh-requested', callback);
        return () => socket.off('refresh-requested', callback);
      }
    },

    // Check if user is online
    isUserOnline: (userId) => {
      return onlineUsers.has(userId);
    },

    // Get connection status
    isConnected: () => isConnected
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    ...socketUtils
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

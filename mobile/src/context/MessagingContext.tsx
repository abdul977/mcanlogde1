import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket/socketService';
import { messagingService, Message } from '../services/api/messagingService';
import { useAuth } from './AuthContext';

interface MessagingContextType {
  isConnected: boolean;
  unreadCount: number;
  onlineUsers: Set<string>;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinThread: (threadId: string) => void;
  leaveThread: (threadId: string) => void;
  startTyping: (threadId: string) => void;
  stopTyping: (threadId: string) => void;
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onUserTyping: (callback: (data: { userId: string; threadId: string; userName: string }) => void) => () => void;
  onUserStoppedTyping: (callback: (data: { userId: string; threadId: string }) => void) => () => void;
  refreshUnreadCount: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = (): MessagingContextType => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

interface MessagingProviderProps {
  children: React.ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Connect to socket
  const connect = useCallback(async () => {
    if (!token || !isAuthenticated) {
      console.log('No token available for socket connection');
      return;
    }

    try {
      await socketService.connect(token);
      setIsConnected(true);
      console.log('✅ Messaging service connected');
      
      // Refresh unread count after connecting
      await refreshUnreadCount();
    } catch (error) {
      console.error('❌ Failed to connect messaging service:', error);
      setIsConnected(false);
    }
  }, [token, isAuthenticated]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setOnlineUsers(new Set());
    console.log('📤 Messaging service disconnected');
  }, []);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await messagingService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !isConnected) {
      connect();
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, token, isConnected, connect, disconnect]);

  // Listen for socket connection status changes
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.getConnectionStatus();
      setIsConnected(connected);
    };

    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Listen for user online/offline status
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeUserOnline = socketService.onUserOnline((data) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });

    const unsubscribeUserOffline = socketService.onUserOffline((data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    return () => {
      unsubscribeUserOnline();
      unsubscribeUserOffline();
    };
  }, [isConnected]);

  // Listen for new messages to update unread count
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeNewMessage = socketService.onNewMessage((message) => {
      // If message is not from current user, increment unread count
      if (message.sender._id !== user?._id) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribeNewMessage;
  }, [isConnected, user?._id]);

  // Wrapper functions for socket service
  const joinThread = useCallback((threadId: string) => {
    socketService.joinThread(threadId);
  }, []);

  const leaveThread = useCallback((threadId: string) => {
    socketService.leaveThread(threadId);
  }, []);

  const startTyping = useCallback((threadId: string) => {
    socketService.startTyping(threadId);
  }, []);

  const stopTyping = useCallback((threadId: string) => {
    socketService.stopTyping(threadId);
  }, []);

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    return socketService.onNewMessage(callback);
  }, []);

  const onUserTyping = useCallback((callback: (data: { userId: string; threadId: string; userName: string }) => void) => {
    return socketService.onUserTyping(callback);
  }, []);

  const onUserStoppedTyping = useCallback((callback: (data: { userId: string; threadId: string }) => void) => {
    return socketService.onUserStoppedTyping(callback);
  }, []);

  const value: MessagingContextType = {
    isConnected,
    unreadCount,
    onlineUsers,
    connect,
    disconnect,
    joinThread,
    leaveThread,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserTyping,
    onUserStoppedTyping,
    refreshUnreadCount,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export default MessagingContext;

import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../../constants';
import { Message } from '../api/messagingService';

export interface SocketEvents {
  'new-message': (message: Message) => void;
  'user-typing': (data: { userId: string; threadId: string; userName: string }) => void;
  'user-stopped-typing': (data: { userId: string; threadId: string }) => void;
  'user-online': (data: { userId: string }) => void;
  'user-offline': (data: { userId: string }) => void;
  'message-read': (data: { messageId: string; userId: string }) => void;
  'thread-joined': (data: { threadId: string; userId: string }) => void;
  'thread-left': (data: { threadId: string; userId: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Initialize socket connection
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          resolve();
          return;
        }

        this.socket = io(API_CONFIG.BASE_URL, {
          auth: {
            token: token,
          },
          autoConnect: true,
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        // Connection event handlers
        this.socket.on('connect', () => {
          console.log('✅ Socket connected to server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason);
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          this.isConnected = false;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Failed to connect to socket server'));
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('❌ Socket reconnection error:', error);
          this.reconnectAttempts++;
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Socket reconnection failed');
          this.isConnected = false;
        });

      } catch (error) {
        console.error('Error initializing socket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Join a thread room
   */
  joinThread(threadId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-thread', { threadId });
      console.log(`📥 Joined thread: ${threadId}`);
    }
  }

  /**
   * Leave a thread room
   */
  leaveThread(threadId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-thread', { threadId });
      console.log(`📤 Left thread: ${threadId}`);
    }
  }

  /**
   * Start typing indicator
   */
  startTyping(threadId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-start', { threadId });
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping(threadId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-stop', { threadId });
    }
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (message: Message) => void): () => void {
    return this.addEventListener('new-message', callback);
  }

  /**
   * Listen for typing indicators
   */
  onUserTyping(callback: (data: { userId: string; threadId: string; userName: string }) => void): () => void {
    return this.addEventListener('user-typing', callback);
  }

  /**
   * Listen for stopped typing indicators
   */
  onUserStoppedTyping(callback: (data: { userId: string; threadId: string }) => void): () => void {
    return this.addEventListener('user-stopped-typing', callback);
  }

  /**
   * Listen for user online status
   */
  onUserOnline(callback: (data: { userId: string }) => void): () => void {
    return this.addEventListener('user-online', callback);
  }

  /**
   * Listen for user offline status
   */
  onUserOffline(callback: (data: { userId: string }) => void): () => void {
    return this.addEventListener('user-offline', callback);
  }

  /**
   * Listen for message read receipts
   */
  onMessageRead(callback: (data: { messageId: string; userId: string }) => void): () => void {
    return this.addEventListener('message-read', callback);
  }

  /**
   * Generic event listener with cleanup
   */
  private addEventListener(event: string, callback: Function): () => void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return () => {};
    }

    // Store the listener for cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    // Add the listener to socket
    this.socket.on(event, callback as any);

    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
      
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    this.eventListeners.clear();
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;

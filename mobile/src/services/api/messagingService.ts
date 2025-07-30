import { ApiResponse } from '../../types';
import apiClient from './apiClient';
import { ENDPOINTS } from '../../constants';

// Message types
export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  threadId: string;
  priority: 'normal' | 'high' | 'urgent';
  messageType: 'text' | 'image';
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id?: string;
  threadId?: string;
  participants?: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  otherUser?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage?: Message | {
    content: string;
    createdAt: string;
    isFromCurrentUser?: boolean;
    messageType?: string;
    priority?: string;
  };
  unreadCount: number;
  updatedAt?: string;
}

export interface SendMessageRequest {
  recipientId: string;
  content: string;
  priority?: 'normal' | 'high' | 'urgent';
  messageType?: 'text' | 'image';
  caption?: string;
}

export interface SendMessageResponse extends ApiResponse {
  data: Message;
}

export interface GetConversationsResponse extends ApiResponse {
  data?: Conversation[];
  conversations?: Conversation[];
}

export interface GetConversationResponse extends ApiResponse {
  data: {
    messages: Message[];
    threadId: string;
    participant: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export interface UnreadCountResponse extends ApiResponse {
  unreadCount: number;
}

export interface AdminUsersResponse extends ApiResponse {
  data: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

class MessagingService {
  /**
   * Send a new message
   */
  async sendMessage(messageData: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await apiClient.post<SendMessageResponse>(
        ENDPOINTS.SEND_MESSAGE,
        messageData
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<GetConversationsResponse> {
    try {
      const response = await apiClient.get<any>(
        ENDPOINTS.CONVERSATIONS
      );

      // Handle server response format: { success: true, conversations: [...] }
      const serverResponse = response.data;

      if (serverResponse.success) {
        return {
          success: true,
          message: serverResponse.message || 'Conversations retrieved successfully',
          data: serverResponse.conversations || serverResponse.data || [],
          conversations: serverResponse.conversations || serverResponse.data || []
        };
      } else {
        return {
          success: false,
          message: serverResponse.message || 'Failed to fetch conversations',
          data: [],
          conversations: []
        };
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages with a specific user
   */
  async getConversation(userId: string): Promise<GetConversationResponse> {
    try {
      const response = await apiClient.get<GetConversationResponse>(
        `${ENDPOINTS.MESSAGES}/conversation/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await apiClient.get<UnreadCountResponse>(
        `${ENDPOINTS.MESSAGES}/unread-count`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read for a specific user
   */
  async markMessagesAsRead(userId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.put<ApiResponse>(
        `${ENDPOINTS.MESSAGES}/mark-read/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get admin users for messaging (for regular users)
   */
  async getAdminUsers(): Promise<AdminUsersResponse> {
    try {
      const response = await apiClient.get<AdminUsersResponse>(
        `${ENDPOINTS.MESSAGES}/admins`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  /**
   * Get all users for messaging (admin only)
   */
  async getAllUsersForMessaging(): Promise<AdminUsersResponse> {
    try {
      const response = await apiClient.get<AdminUsersResponse>(
        `${ENDPOINTS.MESSAGES}/admin/users`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
}

export const messagingService = new MessagingService();
export default messagingService;

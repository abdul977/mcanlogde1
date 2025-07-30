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
  updatedAt?: string;
  __isOptimistic?: boolean; // Flag for optimistic updates
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
    unreadCount?: number;
    createdAt?: string;
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
   * Send an image message with file upload
   */
  async sendImageMessage(
    recipientId: string,
    imageUri: string,
    caption?: string
  ): Promise<SendMessageResponse> {
    try {
      console.log('📤 Starting image upload:', { recipientId, imageUri, caption });

      // Create FormData for file upload
      const formData = new FormData();

      // Add the image file
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('📁 File details:', { filename, type });

      // React Native FormData format for file uploads
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      formData.append('recipientId', recipientId);
      formData.append('messageType', 'image');

      if (caption) {
        formData.append('content', caption);
      }

      console.log('📤 Sending FormData to server...');

      const response = await apiClient.post<SendMessageResponse>(
        ENDPOINTS.SEND_MESSAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for image uploads
        }
      );

      console.log('✅ Image upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error sending image message:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);

      let errorMessage = 'Failed to send image message';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Return error response instead of throwing
      return {
        success: false,
        message: errorMessage,
        data: null
      };
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
      const response = await apiClient.get<any>(
        `${ENDPOINTS.MESSAGES}/conversation/${userId}`
      );

      // Handle server response format: { success: true, messages: [...], otherUser: {...} }
      const serverResponse = response.data;

      if (serverResponse.success) {
        return {
          success: true,
          message: 'Conversation retrieved successfully',
          data: {
            messages: serverResponse.messages || [],
            threadId: '', // Will be generated in ChatScreen
            participant: serverResponse.otherUser || {
              _id: userId,
              name: 'Unknown User',
              email: '',
              role: 'user'
            }
          }
        };
      } else {
        return {
          success: false,
          message: serverResponse.message || 'Failed to fetch conversation',
          data: {
            messages: [],
            threadId: '',
            participant: {
              _id: userId,
              name: 'Unknown User',
              email: '',
              role: 'user'
            }
          }
        };
      }
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
      const response = await apiClient.get<any>(
        `${ENDPOINTS.MESSAGES}/admins`
      );

      // Handle server response format: { success: true, users: [...] }
      const serverResponse = response.data;

      if (serverResponse.success) {
        return {
          success: true,
          message: 'Admin users retrieved successfully',
          data: serverResponse.users || []
        };
      } else {
        return {
          success: false,
          message: serverResponse.message || 'Failed to fetch admin users',
          data: []
        };
      }
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
      const response = await apiClient.get<any>(
        `${ENDPOINTS.MESSAGES}/admin/users`
      );

      console.log('📥 Admin users API response:', response.data);

      // Handle server response format: { success: true, users: [...], pagination: {...} }
      const serverResponse = response.data;

      if (serverResponse.success) {
        return {
          success: true,
          message: 'Users retrieved successfully',
          data: serverResponse.users || []
        };
      } else {
        return {
          success: false,
          message: serverResponse.message || 'Failed to fetch users',
          data: []
        };
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
}

export const messagingService = new MessagingService();
export default messagingService;

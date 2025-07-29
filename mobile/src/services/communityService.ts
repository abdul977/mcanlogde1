import { apiClient } from './apiClient';
import type { Community, CommunityMessage, CreateCommunityData } from '../types';

export interface CommunityFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface MessageFilters {
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

class CommunityService {
  // Get all communities (public)
  async getAllCommunities(filters: CommunityFilters = {}): Promise<Community[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.featured) params.append('featured', 'true');
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`/chat-communities?${params.toString()}`);
      return response.data.communities;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  }

  // Get user's communities
  async getUserCommunities(): Promise<Community[]> {
    try {
      const response = await apiClient.get('/chat-communities/user/my-communities');
      return response.data.communities.map((item: any) => item.community);
    } catch (error) {
      console.error('Error fetching user communities:', error);
      throw error;
    }
  }

  // Get single community by ID
  async getCommunity(communityId: string): Promise<Community> {
    try {
      const response = await apiClient.get(`/chat-communities/${communityId}`);
      return response.data.community;
    } catch (error) {
      console.error('Error fetching community:', error);
      throw error;
    }
  }

  // Create new community
  async createCommunity(data: CreateCommunityData): Promise<Community> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(data).forEach(key => {
        if (key !== 'avatar' && key !== 'banner') {
          const value = data[key as keyof CreateCommunityData];
          if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined) {
            formData.append(key, value.toString());
          }
        }
      });

      // Add files
      if (data.avatar) {
        formData.append('avatar', data.avatar as any);
      }
      if (data.banner) {
        formData.append('banner', data.banner as any);
      }

      const response = await apiClient.post('/chat-communities/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.community;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  // Join community
  async joinCommunity(communityId: string): Promise<void> {
    try {
      await apiClient.post(`/community-members/${communityId}/join`);
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  // Leave community
  async leaveCommunity(communityId: string): Promise<void> {
    try {
      await apiClient.post(`/community-members/${communityId}/leave`);
    } catch (error) {
      console.error('Error leaving community:', error);
      throw error;
    }
  }

  // Get community messages
  async getCommunityMessages(
    communityId: string, 
    filters: MessageFilters = {}
  ): Promise<CommunityMessage[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.before) params.append('before', filters.before);
      if (filters.after) params.append('after', filters.after);

      const response = await apiClient.get(
        `/community-messages/${communityId}/messages?${params.toString()}`
      );
      return response.data.messages;
    } catch (error) {
      console.error('Error fetching community messages:', error);
      throw error;
    }
  }

  // Send message to community
  async sendMessage(
    communityId: string,
    messageData: {
      content: string;
      messageType?: string;
      replyTo?: string | null;
    },
    attachments?: any[]
  ): Promise<CommunityMessage> {
    try {
      const formData = new FormData();
      
      // Add message data
      formData.append('content', messageData.content);
      if (messageData.messageType) {
        formData.append('messageType', messageData.messageType);
      }
      if (messageData.replyTo) {
        formData.append('replyTo', messageData.replyTo);
      }

      // Add attachments
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment, index) => {
          formData.append('attachments', attachment);
        });
      }

      const response = await apiClient.post(
        `/community-messages/${communityId}/send`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId: string, reason?: string): Promise<void> {
    try {
      await apiClient.delete(`/community-messages/message/${messageId}`, {
        data: { reason: reason || 'Message deleted' }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Pin/Unpin message
  async togglePinMessage(messageId: string, pin: boolean = true): Promise<void> {
    try {
      await apiClient.put(`/community-messages/message/${messageId}/pin`, { pin });
    } catch (error) {
      console.error('Error toggling pin message:', error);
      throw error;
    }
  }

  // Get community members
  async getCommunityMembers(
    communityId: string,
    filters: {
      page?: number;
      limit?: number;
      role?: string;
      status?: string;
      search?: string;
    } = {}
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await apiClient.get(
        `/community-members/${communityId}/members?${params.toString()}`
      );
      return response.data.members;
    } catch (error) {
      console.error('Error fetching community members:', error);
      throw error;
    }
  }

  // Moderation actions
  async kickMember(
    communityId: string, 
    userId: string, 
    reason: string
  ): Promise<void> {
    try {
      await apiClient.put(
        `/community-members/${communityId}/members/${userId}/kick`,
        { reason }
      );
    } catch (error) {
      console.error('Error kicking member:', error);
      throw error;
    }
  }

  async banMember(
    communityId: string, 
    userId: string, 
    reason: string,
    duration?: number
  ): Promise<void> {
    try {
      await apiClient.put(
        `/community-members/${communityId}/members/${userId}/ban`,
        { reason, duration }
      );
    } catch (error) {
      console.error('Error banning member:', error);
      throw error;
    }
  }

  async unbanMember(
    communityId: string, 
    userId: string, 
    reason: string
  ): Promise<void> {
    try {
      await apiClient.put(
        `/community-members/${communityId}/members/${userId}/unban`,
        { reason }
      );
    } catch (error) {
      console.error('Error unbanning member:', error);
      throw error;
    }
  }

  async muteMember(
    communityId: string, 
    userId: string, 
    reason: string,
    duration: number = 60
  ): Promise<void> {
    try {
      await apiClient.put(
        `/community-members/${communityId}/members/${userId}/mute`,
        { reason, duration }
      );
    } catch (error) {
      console.error('Error muting member:', error);
      throw error;
    }
  }

  // Add/Remove moderators
  async addModerator(
    communityId: string, 
    userId: string, 
    permissions: any = {}
  ): Promise<void> {
    try {
      await apiClient.put(
        `/community-members/${communityId}/moderators/${userId}/add`,
        { permissions }
      );
    } catch (error) {
      console.error('Error adding moderator:', error);
      throw error;
    }
  }

  async removeModerator(
    communityId: string, 
    userId: string
  ): Promise<void> {
    try {
      await apiClient.put(
        `/community-members/${communityId}/moderators/${userId}/remove`
      );
    } catch (error) {
      console.error('Error removing moderator:', error);
      throw error;
    }
  }

  // Update community
  async updateCommunity(
    communityId: string, 
    data: Partial<CreateCommunityData>
  ): Promise<Community> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(data).forEach(key => {
        if (key !== 'avatar' && key !== 'banner') {
          const value = data[key as keyof CreateCommunityData];
          if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined) {
            formData.append(key, value.toString());
          }
        }
      });

      // Add files
      if (data.avatar) {
        formData.append('avatar', data.avatar as any);
      }
      if (data.banner) {
        formData.append('banner', data.banner as any);
      }

      const response = await apiClient.put(
        `/chat-communities/${communityId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.community;
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  }
}

export const communityService = new CommunityService();

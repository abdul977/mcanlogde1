import apiClient from './api/apiClient';
import type { Community, CommunityMessage } from '../types';

export interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  isPrivate?: boolean;
  avatar?: any;
  banner?: any;
}

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

      const response = await apiClient.get(`/api/chat-communities?${params.toString()}`);
      return response.data.communities;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  }

  // Get user's communities
  async getUserCommunities(): Promise<Community[]> {
    try {
      const response = await apiClient.get('/api/chat-communities/user/my-communities');
      return response.data.communities.map((item: any) => item.community);
    } catch (error) {
      console.error('Error fetching user communities:', error);
      throw error;
    }
  }

  // Get single community by ID
  async getCommunity(communityId: string): Promise<Community> {
    try {
      console.log('🔍 [DEBUG] Fetching community with ID:', communityId);

      // Try the new by-id endpoint first
      try {
        const response = await apiClient.get(`/api/chat-communities/by-id/${communityId}`);
        console.log('✅ [DEBUG] Community response (by-id):', response.data);
        return response.data.community;
      } catch (byIdError) {
        console.log('⚠️ [DEBUG] by-id endpoint failed, trying fallback...');

        // If by-id endpoint fails, try to get from user communities
        // Note: getUserCommunities() already extracts the nested community data
        const userCommunities = await this.getUserCommunities();
        const community = userCommunities.find(c => c._id === communityId);

        if (community) {
          console.log('✅ [DEBUG] Found community in user communities');
          return community;
        }

        // If not found in user communities, try getting all communities
        const allCommunities = await this.getAllCommunities({ limit: 100 });
        const foundCommunity = allCommunities.find(c => c._id === communityId);

        if (foundCommunity) {
          console.log('✅ [DEBUG] Found community in all communities');
          return foundCommunity;
        }

        // If still not found, throw the original error
        throw byIdError;
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error fetching community:', error);
      console.error('❌ [DEBUG] Error response:', error.response?.data);
      throw new Error('Community not found or no longer exists');
    }
  }

  // Create new community
  async createCommunity(data: CreateCommunityData): Promise<Community> {
    try {
      const hasFiles = data.avatar || data.banner;

      if (hasFiles) {
        // Use FormData for file uploads
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

        const response = await apiClient.post('/api/chat-communities/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data.community;
      } else {
        // Use JSON for text-only data
        const jsonData = {
          name: data.name,
          description: data.description,
          category: data.category,
          tags: data.tags || [],
          isPrivate: data.isPrivate || false,
        };

        const response = await apiClient.post('/api/chat-communities/create', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data.community;
      }
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  // Join community
  async joinCommunity(communityId: string): Promise<void> {
    try {
      await apiClient.post(`/api/community-members/${communityId}/join`);
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  // Leave community
  async leaveCommunity(communityId: string): Promise<void> {
    try {
      await apiClient.post(`/api/community-members/${communityId}/leave`);
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
        `/api/community-messages/${communityId}/messages?${params.toString()}`
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
        `/api/community-messages/${communityId}/send`,
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
      await apiClient.delete(`/api/community-messages/message/${messageId}`, {
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
      await apiClient.put(`/api/community-messages/message/${messageId}/pin`, { pin });
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
        `/api/community-members/${communityId}/members?${params.toString()}`
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
        `/api/community-members/${communityId}/members/${userId}/kick`,
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
        `/api/community-members/${communityId}/members/${userId}/ban`,
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
        `/api/community-members/${communityId}/members/${userId}/unban`,
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
        `/api/community-members/${communityId}/members/${userId}/mute`,
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
        `/api/community-members/${communityId}/moderators/${userId}/add`,
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
        `/api/community-members/${communityId}/moderators/${userId}/remove`
      );
    } catch (error) {
      console.error('Error removing moderator:', error);
      throw error;
    }
  }

  // Additional methods for the new screens
  async getCommunityById(communityId: string): Promise<Community> {
    return this.getCommunity(communityId);
  }

  async updateCommunitySettings(
    communityId: string,
    settings: Record<string, any>
  ): Promise<void> {
    try {
      await apiClient.put(`/api/chat-communities/${communityId}/settings`, settings);
    } catch (error) {
      console.error('Error updating community settings:', error);
      throw error;
    }
  }

  async deleteCommunity(communityId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/chat-communities/${communityId}`);
    } catch (error) {
      console.error('Error deleting community:', error);
      throw error;
    }
  }

  async updateMemberRole(
    communityId: string,
    userId: string,
    role: string
  ): Promise<void> {
    try {
      await apiClient.put(
        `/api/community-members/${communityId}/members/${userId}/role`,
        { role }
      );
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  async removeMember(
    communityId: string,
    userId: string
  ): Promise<void> {
    try {
      await apiClient.delete(`/api/community-members/${communityId}/members/${userId}`);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  async getModerationLogs(communityId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/chat-communities/${communityId}/moderation-logs`);
      return response.data.logs || [];
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      throw error;
    }
  }

  async getPendingReports(communityId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/chat-communities/${communityId}/reports?status=pending`);
      return response.data.reports || [];
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      throw error;
    }
  }

  async handleReport(reportId: string, action: 'approve' | 'dismiss'): Promise<void> {
    try {
      await apiClient.put(`/api/chat-communities/reports/${reportId}/${action}`);
    } catch (error) {
      console.error('Error handling report:', error);
      throw error;
    }
  }

  async clearChatHistory(communityId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/community-messages/${communityId}/clear`);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  async muteAllMembers(communityId: string, duration: number): Promise<void> {
    try {
      await apiClient.put(`/api/community-members/${communityId}/mute-all`, { duration });
    } catch (error) {
      console.error('Error muting all members:', error);
      throw error;
    }
  }

  async lockCommunity(communityId: string): Promise<void> {
    try {
      await apiClient.put(`/api/chat-communities/${communityId}/lock`);
    } catch (error) {
      console.error('Error locking community:', error);
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
        `/api/chat-communities/${communityId}`,
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

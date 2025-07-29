import { messagingService } from '../../services/api/messagingService';
import { API_CONFIG } from '../../constants';

// Mock axios
jest.mock('axios');

describe('MessagingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Message sent successfully',
          data: {
            _id: 'message123',
            sender: { _id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'user' },
            recipient: { _id: 'admin1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
            content: 'Hello, I need help',
            threadId: 'thread123',
            priority: 'normal',
            messageType: 'text',
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };

      const axios = require('axios');
      axios.post.mockResolvedValue(mockResponse);

      const result = await messagingService.sendMessage({
        recipientId: 'admin1',
        content: 'Hello, I need help',
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('Hello, I need help');
      expect(axios.post).toHaveBeenCalledWith(
        '/api/messages/send',
        {
          recipientId: 'admin1',
          content: 'Hello, I need help',
        }
      );
    });

    it('should handle send message error', async () => {
      const axios = require('axios');
      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(
        messagingService.sendMessage({
          recipientId: 'admin1',
          content: 'Hello',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getConversations', () => {
    it('should fetch conversations successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              _id: 'conv1',
              participants: [
                { _id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'user' },
                { _id: 'admin1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
              ],
              lastMessage: {
                _id: 'msg1',
                content: 'Hello',
                createdAt: new Date().toISOString(),
                sender: { _id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'user' },
              },
              unreadCount: 1,
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      };

      const axios = require('axios');
      axios.get.mockResolvedValue(mockResponse);

      const result = await messagingService.getConversations();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].unreadCount).toBe(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { count: 5 },
        },
      };

      const axios = require('axios');
      axios.get.mockResolvedValue(mockResponse);

      const result = await messagingService.getUnreadCount();

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(5);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Messages marked as read',
        },
      };

      const axios = require('axios');
      axios.put.mockResolvedValue(mockResponse);

      const result = await messagingService.markMessagesAsRead('admin1');

      expect(result.success).toBe(true);
      expect(axios.put).toHaveBeenCalledWith('/api/messages/mark-read/admin1');
    });
  });
});

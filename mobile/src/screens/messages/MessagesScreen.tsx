import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { ConversationItem, LoadingSpinner, EmptyState } from '../../components';
import { messagingService, Conversation } from '../../services/api/messagingService';
import { socketService } from '../../services/socket/socketService';
import { useAuth } from '../../context/AuthContext';
import { ProfileStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

type MessagesScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Messages'>;

interface MessagesScreenProps {
  navigation: MessagesScreenNavigationProp;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const response = await messagingService.getConversations();
      
      if (response.success) {
        setConversations(response.data);
      } else {
        setError(response.message || 'Failed to load conversations');
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initialize socket connection and load conversations
  useEffect(() => {
    const initializeMessaging = async () => {
      if (token) {
        try {
          // Connect to socket
          await socketService.connect(token);
          
          // Load conversations
          await loadConversations();
        } catch (error) {
          console.error('Error initializing messaging:', error);
          setError('Failed to connect to messaging service');
          setLoading(false);
        }
      }
    };

    initializeMessaging();

    // Cleanup on unmount
    return () => {
      socketService.removeAllListeners();
    };
  }, [token, loadConversations]);

  // Listen for new messages to update conversation list
  useEffect(() => {
    const unsubscribeNewMessage = socketService.onNewMessage((message) => {
      setConversations(prevConversations => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          conv => conv._id === message.threadId
        );

        if (conversationIndex >= 0) {
          // Update existing conversation
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            lastMessage: message,
            unreadCount: message.sender._id !== user?._id 
              ? updatedConversations[conversationIndex].unreadCount + 1
              : updatedConversations[conversationIndex].unreadCount,
            updatedAt: message.createdAt,
          };

          // Move to top
          const [updatedConversation] = updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(updatedConversation);
        }

        return updatedConversations;
      });
    });

    return unsubscribeNewMessage;
  }, [user?._id]);

  // Refresh conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadConversations();
      }
    }, [loadConversations, loading])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleConversationPress = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(
      participant => participant._id !== user?._id
    );

    if (otherParticipant) {
      navigation.navigate('Chat', {
        userId: otherParticipant._id,
        userName: otherParticipant.name,
      });
    }
  };

  const handleNewMessage = () => {
    // Navigate to admin users list or create new conversation
    Alert.alert(
      'New Message',
      'Would you like to start a conversation with an admin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await messagingService.getAdminUsers();
              if (response.success && response.data.length > 0) {
                const admin = response.data[0]; // Get first admin
                navigation.navigate('Chat', {
                  userId: admin._id,
                  userName: admin.name,
                });
              } else {
                Alert.alert('No Admins Available', 'No administrators are currently available for messaging.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to load administrators. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      currentUserId={user?._id || ''}
      onPress={() => handleConversationPress(item)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="chatbubbles-outline"
      title="No Conversations"
      subtitle="Start a conversation with an administrator"
      actionText="New Message"
      onActionPress={handleNewMessage}
    />
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (error && conversations.length === 0) {
    return <View style={styles.container}>{renderError()}</View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleNewMessage}>
        <Ionicons name="add" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL,
    color: COLORS.GRAY_600,
  },
  emptyContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.ERROR,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL,
    color: COLORS.GRAY_600,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.XL,
    right: SPACING.XL,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default MessagesScreen;

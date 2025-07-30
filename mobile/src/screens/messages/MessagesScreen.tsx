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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { ConversationItem, LoadingSpinner, EmptyState, Header } from '../../components';
import { messagingService, Conversation } from '../../services/api/messagingService';
import { socketService } from '../../services/socket/socketService';
import { useAuth } from '../../context/AuthContext';
import { ProfileStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

type MessagesScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Messages'>;

interface MessagesScreenProps {
  navigation: MessagesScreenNavigationProp;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  unreadCount: number;
  createdAt: string;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  // Debug state changes
  useEffect(() => {
    console.log('📊 Admin users state updated:', adminUsers.length, adminUsers);
  }, [adminUsers]);

  // Load conversations for regular users
  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const response = await messagingService.getConversations();

      if (response.success) {
        // Handle both possible response formats: data or conversations
        const conversationsData = response.data || response.conversations || [];
        setConversations(Array.isArray(conversationsData) ? conversationsData : []);
      } else {
        setError(response.message || 'Failed to load conversations');
        setConversations([]); // Ensure conversations is always an array
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setConversations([]); // Ensure conversations is always an array
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load all users for admin
  const loadAdminUsers = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 Loading admin users...');

      const response = await messagingService.getAllUsersForMessaging();
      console.log('📥 Admin users response:', response);

      if (response.success) {
        // Map the response data to match AdminUser interface
        const users = (response.data || []).map((user: any) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          unreadCount: user.unreadCount || 0,
          createdAt: user.createdAt || new Date().toISOString(),
        }));

        console.log('👥 Mapped admin users:', users);
        console.log('📊 Admin users count:', users.length);

        setAdminUsers(users);
      } else {
        console.error('❌ Failed to load admin users:', response.message);
        setError(response.message || 'Failed to load users');
        setAdminUsers([]);
      }
    } catch (err: any) {
      console.error('❌ Error loading admin users:', err);
      setError(err.message || 'Failed to load users');
      setAdminUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);



  // Initialize socket connection and load data
  useEffect(() => {
    const initializeMessaging = async () => {
      if (token) {
        try {
          console.log('🚀 Initializing messaging for:', isAdmin ? 'admin' : 'user');

          // Connect to socket
          await socketService.connect(token);

          // Load data based on user role
          if (isAdmin) {
            await loadAdminUsers();
          } else {
            await loadConversations();
          }
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
  }, [token, isAdmin]); // Simplified dependencies

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

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        if (isAdmin) {
          loadAdminUsers();
        } else {
          loadConversations();
        }
      }
    }, [loading, isAdmin])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    if (isAdmin) {
      loadAdminUsers();
    } else {
      loadConversations();
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    // Handle both server formats: participants array or otherUser object
    const otherParticipant = conversation.otherUser ||
      (conversation.participants?.find(participant => participant._id !== user?._id));

    if (otherParticipant) {
      navigation.navigate('Chat', {
        userId: otherParticipant._id,
        userName: otherParticipant.name,
      });
    }
  };

  const handleAdminUserPress = (adminUser: AdminUser) => {
    navigation.navigate('Chat', {
      userId: adminUser._id,
      userName: adminUser.name,
    });
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

  const renderAdminUserItem = ({ item }: { item: AdminUser }) => (
    <TouchableOpacity
      style={styles.adminUserItem}
      onPress={() => handleAdminUserPress(item)}
    >
      <View style={styles.adminUserAvatar}>
        <Ionicons name="person" size={24} color={COLORS.WHITE} />
      </View>
      <View style={styles.adminUserInfo}>
        <Text style={styles.adminUserName}>{item.name}</Text>
        <Text style={styles.adminUserEmail}>{item.email}</Text>
        <Text style={styles.adminUserRole}>
          {item.role === 'admin' ? 'Administrator' : 'User'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {item.unreadCount > 99 ? '99+' : item.unreadCount}
          </Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY_400} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isAdmin) {
      return (
        <EmptyState
          icon="people-outline"
          title="No Users Found"
          subtitle="No users are available for messaging"
          actionText="Refresh"
          onActionPress={handleRefresh}
        />
      );
    }

    return (
      <EmptyState
        icon="chatbubbles-outline"
        title="No Conversations"
        subtitle="Start a conversation with an administrator"
        actionText="New Message"
        onActionPress={handleNewMessage}
      />
    );
  };

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
      <View style={styles.container}>
        <Header
          title="Messages"
          backgroundColor={COLORS.PRIMARY}
          titleColor={COLORS.WHITE}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  if (error && conversations.length === 0 && adminUsers.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title={isAdmin ? "User Messages" : "Messages"}
          backgroundColor={COLORS.PRIMARY}
          titleColor={COLORS.WHITE}
        />
        {renderError()}
      </View>
    );
  }

  // Calculate bottom padding to account for tab bar
  const tabBarHeight = 60 + Math.max(insets.bottom - 8, 0);
  const bottomPadding = tabBarHeight + SPACING.MD;

  // Debug logging for render
  console.log('🎨 Rendering MessagesScreen:', {
    isAdmin,
    adminUsersCount: adminUsers.length,
    conversationsCount: conversations.length,
    loading,
    error
  });

  return (
    <View style={styles.container}>
      <Header
        title={isAdmin ? "User Messages" : "Messages"}
        backgroundColor={COLORS.PRIMARY}
        titleColor={COLORS.WHITE}
      />

      {isAdmin ? (
        <FlatList
          data={adminUsers}
          renderItem={renderAdminUserItem}
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
          contentContainerStyle={
            adminUsers.length === 0
              ? [styles.emptyContainer, { paddingBottom: bottomPadding }]
              : { paddingBottom: bottomPadding }
          }
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item._id || item.threadId || Math.random().toString()}
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
          contentContainerStyle={
            conversations.length === 0
              ? [styles.emptyContainer, { paddingBottom: bottomPadding }]
              : { paddingBottom: bottomPadding }
          }
        />
      )}

      {/* Floating Action Button - only show for regular users */}
      {!isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { bottom: tabBarHeight + SPACING.MD }]}
          onPress={handleNewMessage}
        >
          <Ionicons name="add" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      )}
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
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
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
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.ERROR,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
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
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  fab: {
    position: 'absolute',
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
  // Admin user item styles
  adminUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  adminUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  adminUserInfo: {
    flex: 1,
  },
  adminUserName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.GRAY_900,
    marginBottom: 2,
  },
  adminUserEmail: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
    color: COLORS.GRAY_600,
    marginBottom: 2,
  },
  adminUserRole: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
    color: COLORS.PRIMARY,
    textTransform: 'uppercase',
  },
  unreadBadge: {
    backgroundColor: COLORS.ERROR,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SM,
    paddingHorizontal: 6,
  },
  unreadText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
  },
});

export default MessagesScreen;

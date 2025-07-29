import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { MessageBubble, TypingIndicator, MessageInput, LoadingSpinner } from '../../components';
import { messagingService, Message } from '../../services/api/messagingService';
import { socketService } from '../../services/socket/socketService';
import { useAuth } from '../../context/AuthContext';
import { ProfileStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type ChatScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<ProfileStackParamList, 'Chat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { userId, userName } = route.params;
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Set navigation header
  useEffect(() => {
    navigation.setOptions({
      title: userName,
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            // TODO: Add user info or call functionality
            Alert.alert('User Info', `Chatting with ${userName}`);
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userName]);

  // Load conversation messages
  const loadConversation = useCallback(async () => {
    try {
      setError(null);
      const response = await messagingService.getConversation(userId);
      
      if (response.success) {
        setMessages(response.data.messages);
        setThreadId(response.data.threadId);
        
        // Join the thread for real-time updates
        if (response.data.threadId) {
          socketService.joinThread(response.data.threadId);
        }
        
        // Mark messages as read
        await messagingService.markMessagesAsRead(userId);
      } else {
        setError(response.message || 'Failed to load conversation');
      }
    } catch (err: any) {
      console.error('Error loading conversation:', err);
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initialize conversation
  useEffect(() => {
    if (token) {
      loadConversation();
    }

    // Cleanup: leave thread when component unmounts
    return () => {
      if (threadId) {
        socketService.leaveThread(threadId);
      }
    };
  }, [token, loadConversation, threadId]);

  // Listen for real-time messages
  useEffect(() => {
    const unsubscribeNewMessage = socketService.onNewMessage((message) => {
      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some(msg => msg._id === message._id);
        if (messageExists) {
          return prevMessages;
        }
        
        // Add new message and sort by creation time
        const updatedMessages = [...prevMessages, message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        return updatedMessages;
      });

      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const unsubscribeTyping = socketService.onUserTyping((data) => {
      if (data.userId !== user?._id) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      }
    });

    const unsubscribeStoppedTyping = socketService.onUserStoppedTyping((data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeStoppedTyping();
    };
  }, [user?._id]);

  // Mark messages as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        messagingService.markMessagesAsRead(userId).catch(console.error);
      }
    }, [userId, loading])
  );

  const handleSendMessage = async (messageText: string) => {
    try {
      setSending(true);
      
      const response = await messagingService.sendMessage({
        recipientId: userId,
        content: messageText,
      });

      if (response.success) {
        // Message will be added via socket listener
        // Just scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTypingStart = () => {
    if (threadId) {
      socketService.startTyping(threadId);
    }
  };

  const handleTypingStop = () => {
    if (threadId) {
      socketService.stopTyping(threadId);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.sender._id === user?._id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showTimestamp = !previousMessage || 
      new Date(item.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() > 300000; // 5 minutes

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showTimestamp={showTimestamp}
      />
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    
    return (
      <TypingIndicator
        isVisible={true}
        userName={userName}
      />
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadConversation}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  if (error && messages.length === 0) {
    return <View style={styles.container}>{renderError()}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          // Auto-scroll to bottom when content changes
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        onLayout={() => {
          // Auto-scroll to bottom on initial layout
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        ListFooterComponent={renderTypingIndicator}
        contentContainerStyle={styles.messagesList}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        sending={sending}
        disabled={!socketService.getConnectionStatus()}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_50,
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL,
    color: COLORS.GRAY_600,
  },
  messagesList: {
    paddingVertical: SPACING.SM,
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
  headerButton: {
    marginRight: SPACING.MD,
  },
});

export default ChatScreen;

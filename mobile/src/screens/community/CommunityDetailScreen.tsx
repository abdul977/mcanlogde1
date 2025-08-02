import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { 
  Header, 
  MessageBubble, 
  MessageInput, 
  TypingIndicator,
  LoadingSpinner 
} from '../../components';
import { useAuth, useSocket } from '../../context';
import { communityService } from '../../services';
import type { CommunityMessage, Community } from '../../types';

interface RouteParams {
  communityId: string;
  communityName: string;
}

const CommunityDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { communityId, communityName } = route.params as RouteParams;
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [community, setCommunity] = useState<(Community & { userRole?: string; isMember?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<CommunityMessage | null>(null);

  const flatListRef = useRef<FlatList>(null);
  // Fix: Provide null as initial value for useRef with generic type
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate bottom space for tab bar (same calculation as MainNavigator)
  const tabBarHeight = 60 + Math.max(insets.bottom - 8, 0);
  const totalBottomSpace = tabBarHeight;

  useEffect(() => {
    loadCommunityData();
    loadMessages();
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, [communityId]);

  const loadCommunityData = async () => {
    try {
      const communityData = await communityService.getCommunity(communityId);
      setCommunity(communityData);
    } catch (error) {
      console.error('Error loading community:', error);

      // Type guard for error handling in strict mode
      const isAxiosError = (err: unknown): err is { response?: { status: number }; message?: string } => {
        return typeof err === 'object' && err !== null;
      };

      // Check if it's a 404 error (community not found)
      if (isAxiosError(error) && (error.response?.status === 404 || error.message?.includes('not found'))) {
        Alert.alert(
          'Community Not Found',
          'This community no longer exists or has been removed.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load community details');
      }
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await communityService.getCommunityMessages(communityId);
      // Sort messages to show oldest first, newest at bottom (like WhatsApp)
      const sortedMessages = messagesData.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);

      // Type guard for error handling in strict mode
      const isAxiosError = (err: unknown): err is { response?: { status: number }; message?: string } => {
        return typeof err === 'object' && err !== null;
      };

      // Check if it's a 404 error (community not found)
      if (isAxiosError(error) && (error.response?.status === 404 || error.message?.includes('not found'))) {
        // Community doesn't exist, navigate back
        Alert.alert(
          'Community Not Found',
          'This community no longer exists or has been removed.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket || !isConnected) {
      console.log('⚠️ Cannot setup community socket listeners - socket:', !!socket, 'isConnected:', isConnected);
      return;
    }

    console.log('🔌 Setting up community socket listeners for community:', communityId);

    // Join community room
    socket.emit('join_community', { communityId });
    console.log('📥 Joining community room:', communityId);

    // Listen for new messages
    socket.on('new_community_message', handleNewMessage);

    // Listen for message deletions
    socket.on('community_message_deleted', handleMessageDeleted);

    // Listen for typing indicators
    socket.on('member_typing_start', handleTypingStart);
    socket.on('member_typing_stop', handleTypingStop);

    // Listen for member actions
    socket.on('community_member_joined', handleMemberJoined);
    socket.on('community_member_left', handleMemberLeft);
    socket.on('community_member_kicked', handleMemberKicked);
    socket.on('community_member_banned', handleMemberBanned);

    // Listen for community join confirmation
    socket.on('community_joined', (data: any) => {
      console.log('✅ Successfully joined community:', data.communityId);
    });

    // Listen for errors
    socket.on('error', (error: any) => {
      console.error('❌ Community socket error:', error);
    });

    console.log('✅ Community socket listeners setup complete');
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;

    console.log('🧹 Cleaning up community socket listeners for community:', communityId);

    socket.emit('leave_community', { communityId });
    socket.off('new_community_message');
    socket.off('community_message_deleted');
    socket.off('member_typing_start');
    socket.off('member_typing_stop');
    socket.off('community_member_joined');
    socket.off('community_member_left');
    socket.off('community_member_kicked');
    socket.off('community_member_banned');
    socket.off('community_joined');
    socket.off('error');

    console.log('✅ Community socket listeners cleanup complete');
  };

  const handleNewMessage = (data: { message: CommunityMessage }) => {
    console.log('📨 New community message received via socket:', data.message);
    setMessages(prevMessages => {
      // Check if message already exists to prevent duplicates
      const messageExists = prevMessages.some(msg =>
        msg._id === data.message._id ||
        (msg.content === data.message.content &&
         msg.sender._id === data.message.sender._id &&
         Math.abs(new Date(msg.createdAt).getTime() - new Date(data.message.createdAt).getTime()) < 5000)
      );

      if (messageExists) {
        console.log('⚠️ Duplicate community message detected, skipping socket message');
        return prevMessages;
      }

      console.log('✅ Adding new community message to state');

      // Remove any optimistic messages that match this real message
      const filteredMessages = prevMessages.filter(msg => !msg.__isOptimistic);
      // Add new message at the end (newest at bottom)
      const newMessages = [...filteredMessages, data.message].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      return newMessages;
    });
  };

  const handleMessageDeleted = (data: { messageId: string }) => {
    setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
  };

  const handleTypingStart = (data: { userId: string }) => {
    if (data.userId !== user?._id) {
      setTypingUsers(prev => [...new Set([...prev, data.userId])]);
    }
  };

  const handleTypingStop = (data: { userId: string }) => {
    setTypingUsers(prev => prev.filter(id => id !== data.userId));
  };

  const handleMemberJoined = (data: { member: any }) => {
    // Show notification or update member count
    console.log('Member joined:', data.member);
  };

  const handleMemberLeft = (data: { userId: string, reason: string }) => {
    // Show notification
    console.log('Member left:', data);
  };

  const handleMemberKicked = (data: { targetUserId: string, reason: string }) => {
    if (data.targetUserId === user?._id) {
      Alert.alert(
        'Kicked from Community',
        `You have been kicked from this community. Reason: ${data.reason}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleMemberBanned = (data: { targetUserId: string, reason: string }) => {
    if (data.targetUserId === user?._id) {
      Alert.alert(
        'Banned from Community',
        `You have been banned from this community. Reason: ${data.reason}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    try {
      setSending(true);

      const messageData = {
        content: content.trim(),
        messageType: attachments && attachments.length > 0 ? 'image' : 'text',
        replyTo: replyToMessage?._id || null,
      };

      // Create optimistic message for immediate display (text messages only)
      if (!attachments || attachments.length === 0) {
        const optimisticMessage: CommunityMessage = {
          _id: `temp_${Date.now()}`, // Temporary ID
          content: content.trim(),
          sender: {
            _id: user?._id || '',
            name: user?.name || '',
            email: user?.email || '',
            profilePicture: user?.avatar || user?.profileImage || null,
          },
          community: communityId,
          createdAt: new Date().toISOString(),
          messageType: 'text',
          attachments: [],
          replyTo: replyToMessage || null,
          isPinned: false,
          reactions: [],
          __isOptimistic: true, // Flag to identify optimistic messages
        } as any;

        // Add optimistic message immediately at the end (newest at bottom)
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, optimisticMessage].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return updatedMessages;
        });

        // Auto-scroll to bottom immediately
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }

      await communityService.sendMessage(communityId, messageData, attachments);

      // Clear reply
      setReplyToMessage(null);

    } catch (error) {
      console.error('Error sending message:', error);

      // Remove optimistic message on error
      setMessages(prevMessages =>
        prevMessages.filter(msg => !msg.__isOptimistic)
      );

      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async (imageUri: string, caption?: string) => {
    try {
      setSending(true);

      // Create FormData for image upload
      const formData = new FormData();

      // Add the image file
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // React Native FormData format for file uploads
      const imageFile = {
        uri: imageUri,
        name: filename,
        type: type,
      } as any;

      const messageData = {
        content: caption || '',
        messageType: 'image' as const,
        replyTo: replyToMessage?._id || null,
      };

      await communityService.sendMessage(communityId, messageData, [imageFile]);

      // Clear reply
      setReplyToMessage(null);

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !isConnected) return;

    if (isTyping) {
      socket.emit('community_typing_start', { communityId });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('community_typing_stop', { communityId });
      }, 3000);
    } else {
      socket.emit('community_typing_stop', { communityId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleMessageLongPress = (message: CommunityMessage) => {
    const options = ['Reply'];
    
    // Add delete option if user can delete the message
    if (message.sender._id === user?._id || community?.userRole === 'creator' || community?.userRole === 'moderator') {
      options.push('Delete');
    }
    
    options.push('Cancel');

    Alert.alert(
      'Message Options',
      '',
      options.map(option => ({
        text: option,
        style: option === 'Cancel' ? 'cancel' : option === 'Delete' ? 'destructive' : 'default',
        onPress: () => {
          if (option === 'Reply') {
            setReplyToMessage(message);
          } else if (option === 'Delete') {
            handleDeleteMessage(message._id);
          }
        }
      }))
    );
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await communityService.deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const renderMessage = ({ item, index }: { item: CommunityMessage; index: number }) => {
    const isOwnMessage = item.sender._id === user?._id;
    const showSender = !isOwnMessage && (index === 0 || messages[index - 1].sender._id !== item.sender._id);

    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        showSender={showSender}
        onLongPress={() => handleMessageLongPress(item)}
        replyToMessage={item.replyTo}
      />
    );
  };

  const handleCommunitySettings = () => {
    (navigation as any).navigate('CommunitySettings', {
      communityId,
      community
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={communityName}
        showBackButton
        backgroundColor={COLORS.PRIMARY}
        titleColor={COLORS.WHITE}
        rightComponent={
          <TouchableOpacity onPress={handleCommunitySettings}>
            <Ionicons name="settings-outline" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          enabled={true}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            style={styles.messagesList}
            contentContainerStyle={[styles.messagesContainer, { paddingBottom: totalBottomSpace + 100 }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={20}
            windowSize={10}
            ListFooterComponent={() => (
              <>
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator
                    isVisible={typingUsers.length > 0}
                    userName={typingUsers.length === 1 ? 'Someone' : `${typingUsers.length} people`}
                  />
                )}
              </>
            )}
          />

          {/* Reply Preview */}
          {replyToMessage && (
            <View style={styles.replyPreview}>
              <View style={styles.replyContent}>
                <Text style={styles.replyLabel}>
                  Replying to {replyToMessage.sender.name}
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {replyToMessage.content}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReplyToMessage(null)}
                style={styles.replyClose}
              >
                <Ionicons name="close" size={20} color={COLORS.GRAY_500} />
              </TouchableOpacity>
            </View>
          )}

          {/* Message Input */}
          <View style={[styles.inputWrapper, { bottom: 0 }]}>
            <MessageInput
              onSendMessage={handleSendMessage}
              onSendImage={handleSendImage}
              onTypingStart={() => handleTyping(true)}
              onTypingStop={() => handleTyping(false)}
              sending={sending}
              disabled={false}
              placeholder={`Message ${communityName}...`}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#E5DDD5', // WhatsApp-like background
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: SPACING.SM,
    paddingBottom: 20,
    flexGrow: 1,
  },
  inputWrapper: {
    backgroundColor: 'transparent',
    paddingBottom: SPACING.MD,
    minHeight: 60,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_50,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  replyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.GRAY_600,
  },
  replyClose: {
    padding: SPACING.XS,
  },
});

export default CommunityDetailScreen;


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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<CommunityMessage | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

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

      // Check if it's a 404 error (community not found)
      if (error.response?.status === 404 || error.message?.includes('not found')) {
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
      setMessages(messagesData.reverse()); // Reverse to show newest at bottom
    } catch (error) {
      console.error('Error loading messages:', error);

      // Check if it's a 404 error (community not found)
      if (error.response?.status === 404 || error.message?.includes('not found')) {
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
    if (!socket || !isConnected) return;

    // Join community room
    socket.emit('join_community', { communityId });

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
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;

    socket.emit('leave_community', { communityId });
    socket.off('new_community_message');
    socket.off('community_message_deleted');
    socket.off('member_typing_start');
    socket.off('member_typing_stop');
    socket.off('community_member_joined');
    socket.off('community_member_left');
    socket.off('community_member_kicked');
    socket.off('community_member_banned');
  };

  const handleNewMessage = (data: { message: CommunityMessage }) => {
    setMessages(prev => [...prev, data.message]);
    // Auto-scroll to bottom for new messages
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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

      await communityService.sendMessage(communityId, messageData, attachments);
      
      // Clear reply
      setReplyToMessage(null);
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
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
    navigation.navigate('CommunitySettings', { 
      communityId,
      community 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={communityName}
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={handleCommunitySettings}>
            <Ionicons name="settings-outline" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item._id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              showsVerticalScrollIndicator={false}
            />

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator userIds={typingUsers} />
            )}

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

            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              sending={sending}
              placeholder={`Message ${communityName}...`}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: SPACING.SM,
    paddingBottom: SPACING.MD,
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
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
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

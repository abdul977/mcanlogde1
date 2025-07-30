import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { Message } from '../../services/api/messagingService';
import type { CommunityMessage } from '../../types';

interface MessageBubbleProps {
  message: Message | CommunityMessage;
  isCurrentUser?: boolean;
  isOwnMessage?: boolean; // For community messages
  showTimestamp?: boolean;
  showSender?: boolean; // For community messages
  onPress?: () => void;
  onLongPress?: () => void;
  replyToMessage?: CommunityMessage | null; // For reply functionality
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  isOwnMessage,
  showTimestamp = true,
  showSender = false,
  onPress,
  onLongPress,
  replyToMessage,
}) => {
  // Determine if this is a community message
  const isCommunityMessage = 'sender' in message && typeof message.sender === 'object';
  const isOwn = isCommunityMessage ? isOwnMessage : isCurrentUser;
  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const getBubbleStyle = () => {
    return [
      styles.bubble,
      isOwn ? styles.sentBubble : styles.receivedBubble,
    ];
  };

  const getTextStyle = () => {
    return [
      styles.messageText,
      isOwn ? styles.sentText : styles.receivedText,
    ];
  };

  const getSenderName = () => {
    if (!isCommunityMessage || !showSender) return null;
    const communityMsg = message as CommunityMessage;
    return communityMsg.sender?.name || 'Unknown User';
  };

  const getMessageContent = () => {
    return isCommunityMessage ? (message as CommunityMessage).content : (message as Message).content;
  };

  const getMessageTime = () => {
    return isCommunityMessage ? (message as CommunityMessage).createdAt : (message as Message).createdAt;
  };

  return (
    <View style={[styles.container, isOwn ? styles.sentContainer : styles.receivedContainer]}>
      {/* Sender name for community messages */}
      {showSender && getSenderName() && (
        <Text style={styles.senderName}>{getSenderName()}</Text>
      )}

      <TouchableOpacity
        style={getBubbleStyle()}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        {/* Reply preview */}
        {replyToMessage && (
          <View style={styles.replyContainer}>
            <View style={styles.replyBar} />
            <View style={styles.replyContent}>
              <Text style={styles.replyAuthor}>
                {replyToMessage.sender?.name || 'Unknown User'}
              </Text>
              <Text style={styles.replyText} numberOfLines={2}>
                {replyToMessage.content}
              </Text>
            </View>
          </View>
        )}

        {/* Message content */}
        <Text style={getTextStyle()}>
          {getMessageContent()}
        </Text>

        {/* Timestamp */}
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={[styles.timestamp, isOwn ? styles.sentTimestamp : styles.receivedTimestamp]}>
              {formatMessageTime(getMessageTime())}
            </Text>

            {/* Message status indicators for sent messages (only for 1-to-1 messages) */}
            {!isCommunityMessage && isOwn && 'isRead' in message && (
              <View style={styles.statusContainer}>
                {message.isRead ? (
                  <Text style={styles.readStatus}>✓✓</Text>
                ) : (
                  <Text style={styles.deliveredStatus}>✓</Text>
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.XS,
    paddingHorizontal: SPACING.MD,
    width: '100%',
  },
  sentContainer: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginLeft: '20%', // Ensure sent messages don't take full width
  },
  receivedContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginRight: '20%', // Ensure received messages don't take full width
  },
  bubble: {
    maxWidth: '100%',
    minWidth: 60,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 18,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  sentBubble: {
    backgroundColor: '#007AFF', // WhatsApp-like blue for sent messages
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#F0F0F0', // Light gray for received messages
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY.FONT_SIZES.BASE * 1.4,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL,
  },
  sentText: {
    color: COLORS.WHITE,
  },
  receivedText: {
    color: '#000000', // Pure black for better readability on light gray
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.XS,
  },
  timestamp: {
    fontSize: 11, // Smaller timestamp like WhatsApp
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL,
  },
  sentTimestamp: {
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  receivedTimestamp: {
    color: COLORS.GRAY_600,
  },
  statusContainer: {
    marginLeft: SPACING.XS,
  },
  readStatus: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.WHITE,
    opacity: 0.8,
  },
  deliveredStatus: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.WHITE,
    opacity: 0.6,
  },
  // Community message styles
  senderName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.PRIMARY,
    marginBottom: 2,
    marginLeft: SPACING.XS,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.XS,
    opacity: 0.8,
  },
  replyBar: {
    width: 3,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 1.5,
    marginRight: SPACING.XS,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.PRIMARY,
    marginBottom: 1,
  },
  replyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.GRAY_600,
    fontStyle: 'italic',
  },
});

export default MessageBubble;

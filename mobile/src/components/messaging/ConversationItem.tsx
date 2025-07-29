import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { Conversation } from '../../services/api/messagingService';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
  onLongPress?: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  onPress,
  onLongPress,
}) => {
  // Get the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    participant => participant._id !== currentUserId
  );

  const formatLastMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getLastMessagePreview = (): string => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }

    const { content, messageType, sender } = conversation.lastMessage;
    const isCurrentUserSender = sender._id === currentUserId;
    const prefix = isCurrentUserSender ? 'You: ' : '';

    if (messageType === 'image') {
      return `${prefix}📷 Image`;
    }

    // Truncate long messages
    const maxLength = 35;
    const truncatedContent = content.length > maxLength 
      ? `${content.substring(0, maxLength)}...` 
      : content;

    return `${prefix}${truncatedContent}`;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(otherParticipant?.name || 'Unknown')}
          </Text>
        </View>
        
        {/* Online status indicator */}
        <View style={styles.onlineIndicator} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.participantName} numberOfLines={1}>
            {otherParticipant?.name || 'Unknown User'}
          </Text>
          
          <Text style={styles.timestamp}>
            {conversation.lastMessage 
              ? formatLastMessageTime(conversation.lastMessage.createdAt)
              : ''
            }
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              conversation.unreadCount > 0 && styles.unreadMessage
            ]} 
            numberOfLines={1}
          >
            {getLastMessagePreview()}
          </Text>
          
          {/* Unread badge */}
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.MD,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.MEDIUM,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.SUCCESS,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  participantName: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.MEDIUM,
    color: COLORS.GRAY_900,
    marginRight: SPACING.SM,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.REGULAR,
    color: COLORS.GRAY_500,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.REGULAR,
    color: COLORS.GRAY_600,
    marginRight: SPACING.SM,
  },
  unreadMessage: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY.MEDIUM,
    color: COLORS.GRAY_900,
  },
  unreadBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XS,
  },
  unreadCount: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.MEDIUM,
  },
});

export default ConversationItem;

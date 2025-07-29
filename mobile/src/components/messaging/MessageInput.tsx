import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  placeholder = 'Type a message...',
  disabled = false,
  sending = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (text: string) => {
    setMessage(text);

    // Handle typing indicators
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop?.();
    }, 1000);
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      return;
    }

    if (trimmedMessage.length > 1000) {
      Alert.alert(
        'Message Too Long',
        'Please keep your message under 1000 characters.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Send the message
    onSendMessage(trimmedMessage);
    
    // Clear input and stop typing
    setMessage('');
    setIsTyping(false);
    onTypingStop?.();
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus back to input
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !sending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        {/* Attachment button (future feature) */}
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={() => {
            // TODO: Implement attachment functionality
            Alert.alert('Coming Soon', 'File attachments will be available soon!');
          }}
          disabled={disabled}
        >
          <Ionicons
            name="attach"
            size={24}
            color={disabled ? COLORS.GRAY_400 : COLORS.GRAY_600}
          />
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={message}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY_500}
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
        />

        {/* Send button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonInactive,
          ]}
          onPress={handleSendMessage}
          disabled={!canSend}
        >
          <Ionicons
            name={sending ? 'hourglass' : 'send'}
            size={20}
            color={canSend ? COLORS.WHITE : COLORS.GRAY_400}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minHeight: 60,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: 20,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontFamily: TYPOGRAPHY.FONT_FAMILY.REGULAR,
    color: COLORS.GRAY_900,
    maxHeight: 100,
    marginRight: SPACING.SM,
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        paddingTop: SPACING.SM,
      },
      android: {
        paddingTop: SPACING.SM,
      },
    }),
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  sendButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.GRAY_300,
  },
});

export default MessageInput;

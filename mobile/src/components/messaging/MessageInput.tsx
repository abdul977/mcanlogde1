import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (imageUri: string, caption?: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendImage,
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

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to send images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show action sheet on iOS, direct picker on Android
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Library'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              await openCamera();
            } else if (buttonIndex === 2) {
              await openImageLibrary();
            }
          }
        );
      } else {
        // On Android, show alert
        Alert.alert(
          'Select Image',
          'Choose an option',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Take Photo', onPress: openCamera },
            { text: 'Choose from Library', onPress: openImageLibrary },
          ]
        );
      }
    } catch (error) {
      console.error('Error opening image picker:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permission to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onSendImage?.(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onSendImage?.(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening image library:', error);
      Alert.alert('Error', 'Failed to open image library. Please try again.');
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !sending;



  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Image attachment button */}
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleImagePicker}
          disabled={disabled || sending}
        >
          <Ionicons
            name="camera"
            size={20}
            color={disabled || sending ? COLORS.GRAY_400 : COLORS.GRAY_600}
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
            size={18}
            color={canSend ? COLORS.WHITE : COLORS.GRAY_500}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', // Remove white background
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.WHITE,
    borderRadius: 25,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    marginHorizontal: SPACING.XS,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  attachmentButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.XS,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
    color: COLORS.GRAY_900,
    maxHeight: 100,
    minHeight: 40,
    marginHorizontal: SPACING.XS,
    textAlignVertical: 'center',
    borderRadius: 20,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.XS,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF', // WhatsApp-like blue
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.GRAY_300,
    elevation: 0,
  },
});

export default MessageInput;

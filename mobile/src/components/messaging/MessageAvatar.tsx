import React, { memo, useState, useCallback } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants';

interface MessageAvatarProps {
  source?: string;
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: any;
}

/**
 * Optimized Avatar component for messaging with caching and performance optimizations
 * Uses React.memo to prevent unnecessary re-renders
 */
const MessageAvatar: React.FC<MessageAvatarProps> = memo(({
  source,
  name,
  size = 32,
  backgroundColor = COLORS.PRIMARY,
  textColor = COLORS.WHITE,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getInitials = useCallback((fullName: string): string => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    ...style,
  };

  const textStyles = {
    fontSize: size * 0.4,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: textColor,
  };

  const imageStyles = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // Show initials if no image source or image failed to load
  // Don't show initials while loading if we have a source
  const showInitials = !source || imageError;

  return (
    <View style={avatarStyle}>
      {source && !imageError && (
        <Image
          source={{ uri: source }}
          style={imageStyles}
          onError={handleImageError}
          onLoad={handleImageLoad}
          // Reduce memory usage for small avatars
          resizeMode="cover"
        />
      )}
      
      {showInitials && (
        <Text style={textStyles}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';

import { COLORS, TYPOGRAPHY } from '../../constants';

interface AvatarProps {
  source?: string | null;
  name: string;
  size?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  imageStyle?: ImageStyle;
  backgroundColor?: string;
  textColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 40,
  style,
  textStyle,
  imageStyle,
  backgroundColor = COLORS.PRIMARY,
  textColor = COLORS.WHITE,
  showBorder = false,
  borderColor = COLORS.WHITE,
  borderWidth = 2,
}) => {
  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const avatarStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(showBorder && {
      borderWidth,
      borderColor,
    }),
    ...style,
  };

  const textStyles: TextStyle = {
    fontSize: size * 0.4,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: textColor,
    ...textStyle,
  };

  const imageStyles: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    ...imageStyle,
  };

  return (
    <View style={avatarStyle}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={imageStyles}
          onError={() => {
            // If image fails to load, it will fall back to initials
            console.log('Avatar image failed to load:', source);
          }}
        />
      ) : (
        <Text style={textStyles}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};

export default Avatar;

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants';

interface EnhancedAvatarProps {
  source?: string | null;
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  textStyle?: TextStyle;
  imageStyle?: ImageStyle;
  backgroundColor?: string;
  textColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  showGradientBorder?: boolean;
  showEditIcon?: boolean;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  onEditPress?: () => void;
}

const AVATAR_SIZES = {
  small: 40,
  medium: 60,
  large: 80,
  xlarge: 120,
};

const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  source,
  name,
  size = 'medium',
  style,
  textStyle,
  imageStyle,
  backgroundColor = COLORS.PRIMARY,
  textColor = COLORS.WHITE,
  showBorder = false,
  borderColor = COLORS.WHITE,
  borderWidth = 2,
  showGradientBorder = false,
  showEditIcon = false,
  showOnlineStatus = false,
  isOnline = false,
  isLoading = false,
  onPress,
  onEditPress,
}) => {
  const avatarSize = AVATAR_SIZES[size];
  const borderRadius = avatarSize / 2;
  const editIconSize = avatarSize * 0.25;
  const statusSize = avatarSize * 0.2;

  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const avatarStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(showBorder && !showGradientBorder && {
      borderWidth,
      borderColor,
    }),
    ...SHADOWS.MD,
    ...style,
  };

  const textStyles: TextStyle = {
    fontSize: avatarSize * 0.4,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: textColor,
    ...textStyle,
  };

  const imageStyles: ImageStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius,
    ...imageStyle,
  };

  const renderAvatarContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size={size === 'xlarge' ? 'large' : 'small'}
          color={COLORS.WHITE}
        />
      );
    }

    return source ? (
      <Image
        source={{ uri: source }}
        style={imageStyles}
        onError={() => {
          console.log('Avatar image failed to load:', source);
        }}
      />
    ) : (
      <Text style={textStyles}>
        {getInitials(name)}
      </Text>
    );
  };

  const renderAvatar = () => {
    if (showGradientBorder) {
      return (
        <LinearGradient
          colors={[COLORS.PRIMARY, COLORS.SECONDARY, COLORS.ACCENT]}
          style={[
            styles.gradientBorder,
            {
              width: avatarSize + 6,
              height: avatarSize + 6,
              borderRadius: (avatarSize + 6) / 2,
            },
          ]}
        >
          <View style={[styles.innerContainer, { borderRadius }]}>
            <View style={avatarStyle}>
              {renderAvatarContent()}
            </View>
          </View>
        </LinearGradient>
      );
    }

    return (
      <View style={avatarStyle}>
        {renderAvatarContent()}
      </View>
    );
  };

  const AvatarComponent = onPress ? TouchableOpacity : View;
  const avatarProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <AvatarComponent style={styles.container} {...avatarProps}>
      {renderAvatar()}
      
      {showEditIcon && (
        <TouchableOpacity
          style={[
            styles.editIcon,
            {
              width: editIconSize * 2,
              height: editIconSize * 2,
              borderRadius: editIconSize,
            },
          ]}
          onPress={onEditPress}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={editIconSize} color={COLORS.WHITE} />
        </TouchableOpacity>
      )}
      
      {showOnlineStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: isOnline ? COLORS.SUCCESS : COLORS.GRAY_400,
            },
          ]}
        />
      )}
    </AvatarComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  gradientBorder: {
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.LG,
  },
  innerContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 3,
  },
  editIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    ...SHADOWS.SM,
  },
  statusIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    ...SHADOWS.SM,
  },
});

export default EnhancedAvatar;

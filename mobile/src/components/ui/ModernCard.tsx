import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../../constants';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'glass';
  onPress?: () => void;
  disabled?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'xlarge';
  backgroundColor?: string;
  gradientColors?: string[];
  shadowIntensity?: 'none' | 'light' | 'medium' | 'heavy';
}

const PADDING_SIZES = {
  none: 0,
  small: SPACING.SM,
  medium: SPACING.MD,
  large: SPACING.LG,
};

const BORDER_RADIUS_SIZES = {
  small: BORDER_RADIUS.SM,
  medium: BORDER_RADIUS.MD,
  large: BORDER_RADIUS.LG,
  xlarge: BORDER_RADIUS.XL,
};

const SHADOW_INTENSITIES = {
  none: {},
  light: SHADOWS.SM,
  medium: SHADOWS.MD,
  heavy: SHADOWS.LG,
};

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
  disabled = false,
  padding = 'medium',
  borderRadius = 'large',
  backgroundColor,
  gradientColors,
  shadowIntensity = 'medium',
}) => {
  const paddingValue = PADDING_SIZES[padding];
  const borderRadiusValue = BORDER_RADIUS_SIZES[borderRadius];
  const shadowStyle = SHADOW_INTENSITIES[shadowIntensity];

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadiusValue,
      padding: paddingValue,
      ...shadowStyle,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || COLORS.WHITE,
          ...SHADOWS.LG,
        };

      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || COLORS.WHITE,
          borderWidth: 1,
          borderColor: COLORS.GRAY_200,
          ...SHADOWS.SM,
        };

      case 'gradient':
        return {
          ...baseStyle,
          overflow: 'hidden',
        };

      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          ...SHADOWS.MD,
        };

      default:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || COLORS.WHITE,
        };
    }
  };

  const cardStyle = [getCardStyle(), style];

  const renderCard = () => {
    if (variant === 'gradient') {
      const colors = gradientColors || [COLORS.PRIMARY, COLORS.SECONDARY];
      return (
        <LinearGradient
          colors={colors}
          style={cardStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View style={cardStyle}>
        {children}
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          styles.touchable,
          disabled && styles.disabled,
        ]}
      >
        {renderCard()}
      </TouchableOpacity>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  touchable: {
    // Base touchable styles
  },
  disabled: {
    opacity: 0.6,
  },
});

export default ModernCard;

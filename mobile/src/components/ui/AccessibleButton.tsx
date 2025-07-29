/**
 * Accessible Button Component
 * 
 * This component demonstrates comprehensive accessibility implementation
 * with proper ARIA attributes, focus management, and screen reader support.
 */

import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { useAccessibility, useHighContrast } from '../../hooks/useAccessibility';

// Button variant types
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

// Component props
interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  
  // Icon props
  leftIcon?: string;
  rightIcon?: string;
  iconSize?: number;
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: any;
  accessibilityActions?: Array<{ name: string; label: string }>;
  
  // Styling
  style?: any;
  textStyle?: any;
  
  // Test ID
  testID?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  
  leftIcon,
  rightIcon,
  iconSize,
  
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityActions,
  
  style,
  textStyle,
  testID,
}) => {
  const buttonRef = useRef<TouchableOpacity>(null);
  const [isPressed, setIsPressed] = useState(false);
  
  // Accessibility hooks
  const {
    isScreenReaderEnabled,
    getAnimationDuration,
    getAdjustedFontSize,
    getAccessibilityProps,
    shouldBeFocusable,
    announce,
  } = useAccessibility();
  
  const { getContrastAwareColors } = useHighContrast();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Handle press with accessibility feedback
  const handlePress = () => {
    if (disabled || loading) return;

    // Animate button press
    const animationDuration = getAnimationDuration(150);
    
    if (animationDuration > 0) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }

    // Provide accessibility feedback
    if (isScreenReaderEnabled) {
      announce(`${accessibilityLabel || title} activated`);
    }

    onPress();
  };

  // Handle press in/out for visual feedback
  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // Get button colors based on variant and accessibility preferences
  const getButtonColors = () => {
    const baseColors = {
      primary: {
        background: COLORS.PRIMARY,
        text: COLORS.WHITE,
        border: COLORS.PRIMARY,
      },
      secondary: {
        background: COLORS.GRAY_100,
        text: COLORS.TEXT_PRIMARY,
        border: COLORS.GRAY_300,
      },
      outline: {
        background: 'transparent',
        text: COLORS.PRIMARY,
        border: COLORS.PRIMARY,
      },
      ghost: {
        background: 'transparent',
        text: COLORS.PRIMARY,
        border: 'transparent',
      },
      danger: {
        background: COLORS.ERROR,
        text: COLORS.WHITE,
        border: COLORS.ERROR,
      },
    };

    const colors = baseColors[variant];
    
    // Apply high contrast colors if needed
    return getContrastAwareColors(colors);
  };

  // Get button size styles
  const getSizeStyles = () => {
    const sizeMap = {
      small: {
        paddingVertical: SPACING.SM,
        paddingHorizontal: SPACING.MD,
        minHeight: 36,
        fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      },
      medium: {
        paddingVertical: SPACING.MD,
        paddingHorizontal: SPACING.LG,
        minHeight: 44, // Minimum touch target size
        fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
      },
      large: {
        paddingVertical: SPACING.LG,
        paddingHorizontal: SPACING.XL,
        minHeight: 56,
        fontSize: TYPOGRAPHY.FONT_SIZES.LG,
      },
    };

    return sizeMap[size];
  };

  // Get icon size based on button size
  const getIconSize = () => {
    if (iconSize) return iconSize;
    
    const sizeMap = {
      small: 16,
      medium: 20,
      large: 24,
    };

    return sizeMap[size];
  };

  // Get adjusted font size for accessibility
  const getAdjustedTextSize = () => {
    const baseSize = getSizeStyles().fontSize;
    return getAdjustedFontSize(baseSize);
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();
  const adjustedFontSize = getAdjustedTextSize();

  // Build accessibility props
  const accessibilityProps = getAccessibilityProps({
    label: accessibilityLabel || title,
    hint: accessibilityHint,
    role: accessibilityRole,
    state: {
      disabled: disabled || loading,
      busy: loading,
      ...accessibilityState,
    },
    actions: accessibilityActions,
  });

  // Determine if button should be focusable
  const isFocusable = shouldBeFocusable({
    disabled: disabled || loading,
    interactive: true,
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.button,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            minHeight: sizeStyles.minHeight,
            opacity: disabled ? 0.6 : 1,
          },
          isPressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessible={isFocusable}
        focusable={isFocusable}
        testID={testID}
        {...accessibilityProps}
      >
        <View style={styles.content}>
          {/* Left Icon */}
          {leftIcon && !loading && (
            <Ionicons
              name={leftIcon as any}
              size={getIconSize()}
              color={colors.text}
              style={styles.leftIcon}
            />
          )}

          {/* Loading Indicator */}
          {loading && (
            <ActivityIndicator
              size="small"
              color={colors.text}
              style={styles.loadingIndicator}
            />
          )}

          {/* Button Text */}
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: adjustedFontSize,
              },
              textStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>

          {/* Right Icon */}
          {rightIcon && !loading && (
            <Ionicons
              name={rightIcon as any}
              size={getIconSize()}
              color={colors.text}
              style={styles.rightIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.SM,
  },
  pressed: {
    ...SHADOWS.MD,
  },
  disabled: {
    ...SHADOWS.NONE,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: SPACING.SM,
  },
  rightIcon: {
    marginLeft: SPACING.SM,
  },
  loadingIndicator: {
    marginRight: SPACING.SM,
  },
});

export default AccessibleButton;

/**
 * Animated Button Component
 * 
 * This component demonstrates smooth animations and transitions
 * with accessibility considerations and performance optimizations.
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
import { 
  useButtonPressAnimation, 
  useFadeAnimation, 
  useLoadingPulseAnimation,
  useShakeAnimation,
} from '../../hooks/useAnimations';
import { useAccessibility } from '../../hooks/useAccessibility';

// Button variant types
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'small' | 'medium' | 'large';

// Component props
interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  
  // Animation props
  animateOnPress?: boolean;
  animateOnMount?: boolean;
  shakeOnError?: boolean;
  
  // Icon props
  leftIcon?: string;
  rightIcon?: string;
  iconSize?: number;
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Styling
  style?: any;
  textStyle?: any;
  
  // Test ID
  testID?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  
  animateOnPress = true,
  animateOnMount = true,
  shakeOnError = false,
  
  leftIcon,
  rightIcon,
  iconSize,
  
  accessibilityLabel,
  accessibilityHint,
  
  style,
  textStyle,
  testID,
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Animation hooks
  const { scaleAnim, animatePress } = useButtonPressAnimation();
  const { fadeAnim, fadeIn } = useFadeAnimation(animateOnMount ? 0 : 1);
  const { scaleAnim: pulseAnim } = useLoadingPulseAnimation(loading);
  const { shakeAnim, shake } = useShakeAnimation();
  
  // Accessibility hook
  const { getAnimationDuration, announce } = useAccessibility();

  // Handle press with animations
  const handlePress = async () => {
    if (disabled || loading) return;

    try {
      // Animate button press if enabled
      if (animateOnPress) {
        animatePress();
      }

      // Provide accessibility feedback
      announce(`${accessibilityLabel || title} activated`);

      // Execute the onPress function
      await onPress();
      
      // Clear any previous error state
      setHasError(false);
    } catch (error) {
      console.error('Button press error:', error);
      setHasError(true);
      
      // Shake animation on error if enabled
      if (shakeOnError) {
        shake({ intensity: 8, duration: 400 });
      }
      
      announce('Action failed');
    }
  };

  // Mount animation
  React.useEffect(() => {
    if (animateOnMount) {
      const delay = Math.random() * 200; // Stagger for multiple buttons
      setTimeout(() => {
        fadeIn({ delay });
      }, delay);
    }
  }, [animateOnMount, fadeIn]);

  // Get button colors based on variant
  const getButtonColors = () => {
    const colorMap = {
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
      success: {
        background: COLORS.SUCCESS,
        text: COLORS.WHITE,
        border: COLORS.SUCCESS,
      },
    };

    return colorMap[variant];
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
        minHeight: 44,
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

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  // Combine all animations
  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { scale: loading ? pulseAnim : scaleAnim },
      { translateX: shakeAnim },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
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
          hasError && styles.errorState,
          disabled && styles.disabled,
          style,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        testID={testID}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          {/* Left Icon */}
          {leftIcon && !loading && (
            <Animated.View style={styles.iconContainer}>
              <Ionicons
                name={leftIcon as any}
                size={getIconSize()}
                color={colors.text}
                style={styles.leftIcon}
              />
            </Animated.View>
          )}

          {/* Loading Indicator */}
          {loading && (
            <Animated.View style={styles.iconContainer}>
              <ActivityIndicator
                size="small"
                color={colors.text}
                style={styles.loadingIndicator}
              />
            </Animated.View>
          )}

          {/* Button Text */}
          <Animated.Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {loading ? 'Loading...' : title}
          </Animated.Text>

          {/* Right Icon */}
          {rightIcon && !loading && (
            <Animated.View style={styles.iconContainer}>
              <Ionicons
                name={rightIcon as any}
                size={getIconSize()}
                color={colors.text}
                style={styles.rightIcon}
              />
            </Animated.View>
          )}
        </View>

        {/* Ripple Effect Overlay */}
        <View style={styles.rippleOverlay} pointerEvents="none" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.SM,
  },
  disabled: {
    ...SHADOWS.NONE,
  },
  errorState: {
    borderColor: COLORS.ERROR,
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  rippleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0,
  },
});

export default AnimatedButton;

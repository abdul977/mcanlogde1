/**
 * Biometric Authentication Button Component
 * 
 * This component provides a user-friendly button for biometric authentication
 * with appropriate icons, labels, and feedback.
 */

import React, { useState } from 'react';
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
import { useBiometric } from '../../hooks/useBiometric';
import { BiometricAuthResult } from '../../services/biometric/BiometricService';

// Component props
interface BiometricButtonProps {
  onSuccess?: (result: BiometricAuthResult) => void;
  onError?: (error: string) => void;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  showLabel?: boolean;
  customLabel?: string;
  promptMessage?: string;
  testID?: string;
}

export const BiometricButton: React.FC<BiometricButtonProps> = ({
  onSuccess,
  onError,
  onPress,
  disabled = false,
  style,
  size = 'medium',
  variant = 'primary',
  showLabel = true,
  customLabel,
  promptMessage,
  testID,
}) => {
  const {
    isAvailable,
    isEnrolled,
    isEnabled,
    primaryType,
    isLoading: biometricLoading,
    authenticate,
    getBiometricTypeName,
    getBiometricIcon,
  } = useBiometric();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Check if biometric authentication can be used
  const canUseBiometric = isAvailable && isEnrolled && isEnabled && !biometricLoading;

  // Handle button press
  const handlePress = async () => {
    if (disabled || isAuthenticating || !canUseBiometric) {
      return;
    }

    // Custom onPress handler
    if (onPress) {
      onPress();
      return;
    }

    try {
      setIsAuthenticating(true);

      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Perform biometric authentication
      const result = await authenticate({
        promptMessage: promptMessage || `Sign in with ${getBiometricTypeName()}`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        onSuccess?.(result);
      } else if (result.error) {
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      onError?.('Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Get button styles based on variant and size
  const getButtonStyles = () => {
    const baseStyles = [styles.button];

    // Size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyles.push(styles.buttonLarge);
        break;
      default:
        baseStyles.push(styles.buttonMedium);
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyles.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyles.push(styles.buttonOutline);
        break;
      default:
        baseStyles.push(styles.buttonPrimary);
    }

    // Disabled styles
    if (disabled || !canUseBiometric) {
      baseStyles.push(styles.buttonDisabled);
    }

    return baseStyles;
  };

  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  // Get text styles based on variant
  const getTextStyles = () => {
    const baseStyles = [styles.buttonText];

    switch (variant) {
      case 'secondary':
        baseStyles.push(styles.buttonTextSecondary);
        break;
      case 'outline':
        baseStyles.push(styles.buttonTextOutline);
        break;
      default:
        baseStyles.push(styles.buttonTextPrimary);
    }

    if (disabled || !canUseBiometric) {
      baseStyles.push(styles.buttonTextDisabled);
    }

    return baseStyles;
  };

  // Get button label
  const getButtonLabel = () => {
    if (customLabel) return customLabel;
    if (!canUseBiometric) return 'Biometric Unavailable';
    return `Sign in with ${getBiometricTypeName()}`;
  };

  // Get icon color based on variant and state
  const getIconColor = () => {
    if (disabled || !canUseBiometric) {
      return COLORS.GRAY_400;
    }

    switch (variant) {
      case 'secondary':
        return COLORS.TEXT_PRIMARY;
      case 'outline':
        return COLORS.PRIMARY;
      default:
        return COLORS.WHITE;
    }
  };

  // Don't render if biometric is still loading
  if (biometricLoading) {
    return (
      <View style={[getButtonStyles(), styles.loadingContainer]}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        {showLabel && (
          <Text style={getTextStyles()}>Checking biometric availability...</Text>
        )}
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[getButtonStyles(), style]}
        onPress={handlePress}
        disabled={disabled || !canUseBiometric || isAuthenticating}
        accessibilityRole="button"
        accessibilityLabel={getButtonLabel()}
        accessibilityHint={canUseBiometric ? 'Authenticate using biometrics' : 'Biometric authentication not available'}
        accessibilityState={{
          disabled: disabled || !canUseBiometric || isAuthenticating,
        }}
        testID={testID}
      >
        <View style={styles.buttonContent}>
          {/* Icon or Loading Indicator */}
          {isAuthenticating ? (
            <ActivityIndicator 
              size="small" 
              color={getIconColor()} 
              style={styles.buttonIcon}
            />
          ) : (
            <Ionicons
              name={getBiometricIcon() as any}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.buttonIcon}
            />
          )}

          {/* Label */}
          {showLabel && (
            <Text style={getTextStyles()}>
              {isAuthenticating ? 'Authenticating...' : getButtonLabel()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...SHADOWS.SM,
  },
  buttonSmall: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    minHeight: 40,
  },
  buttonMedium: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.XL,
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonSecondary: {
    backgroundColor: COLORS.GRAY_100,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  buttonDisabled: {
    backgroundColor: COLORS.GRAY_200,
    borderColor: COLORS.GRAY_300,
    ...SHADOWS.NONE,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: SPACING.SM,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
  },
  buttonTextPrimary: {
    color: COLORS.WHITE,
  },
  buttonTextSecondary: {
    color: COLORS.TEXT_PRIMARY,
  },
  buttonTextOutline: {
    color: COLORS.PRIMARY,
  },
  buttonTextDisabled: {
    color: COLORS.GRAY_400,
  },
  loadingContainer: {
    backgroundColor: COLORS.GRAY_100,
  },
});

export default BiometricButton;

/**
 * Remember Me Checkbox Component
 * 
 * This component provides a user-friendly checkbox for remember me functionality
 * with proper accessibility and visual feedback.
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';

// Component props
interface RememberMeCheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: any;
  checkboxStyle?: any;
  labelStyle?: any;
  size?: 'small' | 'medium' | 'large';
  testID?: string;
}

export const RememberMeCheckbox: React.FC<RememberMeCheckboxProps> = ({
  checked,
  onToggle,
  disabled = false,
  label = 'Remember me',
  style,
  checkboxStyle,
  labelStyle,
  size = 'medium',
  testID,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  // Handle press with animation
  const handlePress = () => {
    if (disabled) return;

    // Animate press
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

    onToggle(!checked);
  };

  // Get checkbox size based on size prop
  const getCheckboxSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 26;
      default:
        return 22;
    }
  };

  // Get icon size based on size prop
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  // Get text size based on size prop
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return TYPOGRAPHY.FONT_SIZES.SM;
      case 'large':
        return TYPOGRAPHY.FONT_SIZES.LG;
      default:
        return TYPOGRAPHY.FONT_SIZES.BASE;
    }
  };

  // Get checkbox styles
  const getCheckboxStyles = () => {
    const baseStyles = [styles.checkbox];
    const checkboxSize = getCheckboxSize();

    baseStyles.push({
      width: checkboxSize,
      height: checkboxSize,
      borderRadius: checkboxSize * 0.2,
    });

    if (checked) {
      baseStyles.push(styles.checkboxChecked);
    } else {
      baseStyles.push(styles.checkboxUnchecked);
    }

    if (disabled) {
      baseStyles.push(styles.checkboxDisabled);
    }

    return baseStyles;
  };

  // Get label styles
  const getLabelStyles = () => {
    const baseStyles = [styles.label];

    baseStyles.push({
      fontSize: getTextSize(),
    });

    if (disabled) {
      baseStyles.push(styles.labelDisabled);
    }

    return baseStyles;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={label}
        accessibilityHint={checked ? 'Uncheck to disable remember me' : 'Check to enable remember me'}
        testID={testID}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <View style={[getCheckboxStyles(), checkboxStyle]}>
          {checked && (
            <Ionicons
              name="checkmark"
              size={getIconSize()}
              color={disabled ? COLORS.GRAY_400 : COLORS.WHITE}
            />
          )}
        </View>

        {/* Label */}
        <Text style={[getLabelStyles(), labelStyle]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  checkbox: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SM,
  },
  checkboxUnchecked: {
    borderColor: COLORS.GRAY_400,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY,
  },
  checkboxDisabled: {
    borderColor: COLORS.GRAY_300,
    backgroundColor: COLORS.GRAY_200,
  },
  label: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '400' as const,
    flex: 1,
  },
  labelDisabled: {
    color: COLORS.GRAY_400,
  },
});

export default RememberMeCheckbox;

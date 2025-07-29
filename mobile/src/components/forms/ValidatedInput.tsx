/**
 * Enhanced Validated Input Component
 * 
 * This component provides comprehensive form input with real-time validation,
 * accessibility features, and visual feedback.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { ValidationResult } from '../../utils/validation';
import { useAccessibility, useFocusManagement } from '../../hooks/useAccessibility';

// Input variant types
type InputVariant = 'default' | 'outlined' | 'filled';
type InputSize = 'small' | 'medium' | 'large';

// Component props
interface ValidatedInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Validation
  validationResult?: ValidationResult;
  showValidation?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  
  // Styling
  variant?: InputVariant;
  size?: InputSize;
  disabled?: boolean;
  required?: boolean;
  
  // Icons
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  
  // Password specific
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Container styling
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
  warningStyle?: any;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,

  // Validation
  validationResult,
  showValidation = true,
  validateOnChange = true,
  validateOnBlur = true,

  // Styling
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  required = false,

  // Icons
  leftIcon,
  rightIcon,
  onRightIconPress,

  // Password
  secureTextEntry = false,
  showPasswordToggle = false,

  // Accessibility
  accessibilityLabel,
  accessibilityHint,

  // Styles
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  warningStyle,

  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Accessibility hooks
  const {
    isScreenReaderEnabled,
    getAnimationDuration,
    getAdjustedFontSize,
    getAccessibilityProps,
    announce,
  } = useAccessibility();

  const { focusRef, focusElement } = useFocusManagement();

  // Animation values
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Input ref for accessibility
  const inputRef = useRef<TextInput>(null);
  
  // Determine validation state
  const hasError = validationResult && !validationResult.isValid && hasInteracted && showValidation;
  const hasWarning = validationResult && validationResult.warnings && validationResult.warnings.length > 0 && hasInteracted && showValidation;
  const isValid = validationResult && validationResult.isValid && hasInteracted && value.length > 0;
  
  // Handle focus animation
  useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnimation]);
  
  // Handle error shake animation
  useEffect(() => {
    if (hasError) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hasError, shakeAnimation]);
  
  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setHasInteracted(true);
    onFocus?.();
  };
  
  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  // Handle text change
  const handleChangeText = (text: string) => {
    setHasInteracted(true);
    onChangeText(text);
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Get container style based on variant and state
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (variant === 'outlined') {
      baseStyle.push(styles.outlined);
    } else if (variant === 'filled') {
      baseStyle.push(styles.filled);
    }
    
    if (hasError) {
      baseStyle.push(styles.error);
    } else if (hasWarning) {
      baseStyle.push(styles.warning);
    } else if (isValid) {
      baseStyle.push(styles.valid);
    } else if (isFocused) {
      baseStyle.push(styles.focused);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };
  
  // Get input style based on size
  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (size === 'small') {
      baseStyle.push(styles.inputSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.inputLarge);
    }
    
    return baseStyle;
  };
  
  // Get enhanced accessibility props
  const getEnhancedAccessibilityProps = () => {
    let hint = accessibilityHint || '';

    // Build comprehensive hint
    if (required && !hint.includes('required')) {
      hint = hint ? `${hint}. Required field` : 'Required field';
    }

    if (hasError && validationResult?.errors) {
      const errorText = validationResult.errors.join('. ');
      hint = hint ? `${hint}. Error: ${errorText}` : `Error: ${errorText}`;
    } else if (hasWarning && validationResult?.warnings) {
      const warningText = validationResult.warnings.join('. ');
      hint = hint ? `${hint}. Warning: ${warningText}` : `Warning: ${warningText}`;
    }

    if (secureTextEntry) {
      hint = hint ? `${hint}. Password field` : 'Password field';
      if (showPasswordToggle) {
        hint += showPassword ? '. Password is visible' : '. Password is hidden';
      }
    }

    return {
      accessibilityLabel: accessibilityLabel || label || placeholder,
      accessibilityHint: hint || undefined,
      accessibilityState: {
        disabled,
        invalid: hasError,
        required,
      },
    };
  };

  // Announce validation changes to screen reader
  const announceValidationChange = (newValidationResult?: ValidationResult) => {
    if (!isScreenReaderEnabled || !hasInteracted) return;

    if (newValidationResult && !newValidationResult.isValid && newValidationResult.errors.length > 0) {
      announce(`Validation error: ${newValidationResult.errors.join('. ')}`);
    } else if (newValidationResult && newValidationResult.isValid && value.length > 0) {
      announce('Input is valid');
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.wrapper,
        { transform: [{ translateX: shakeAnimation }] },
        containerStyle
      ]}
    >
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      {/* Input Container */}
      <View style={getContainerStyle()}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons 
              name={leftIcon as any} 
              size={20} 
              color={hasError ? COLORS.ERROR : isFocused ? COLORS.PRIMARY : COLORS.GRAY_500} 
            />
          </View>
        )}
        
        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[getInputStyle(), inputStyle]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY_400}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          {...getEnhancedAccessibilityProps()}
          {...textInputProps}
        />
        
        {/* Right Icon / Password Toggle */}
        {(rightIcon || showPasswordToggle) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={showPasswordToggle ? togglePasswordVisibility : onRightIconPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={showPasswordToggle ? (showPassword ? 'Hide password' : 'Show password') : 'Action button'}
          >
            <Ionicons
              name={
                showPasswordToggle
                  ? (showPassword ? 'eye-off-outline' : 'eye-outline')
                  : (rightIcon as any)
              }
              size={20}
              color={hasError ? COLORS.ERROR : isFocused ? COLORS.PRIMARY : COLORS.GRAY_500}
            />
          </TouchableOpacity>
        )}
        
        {/* Validation Icon */}
        {showValidation && hasInteracted && (
          <View style={styles.validationIconContainer}>
            {hasError && (
              <Ionicons name="alert-circle" size={16} color={COLORS.ERROR} />
            )}
            {hasWarning && !hasError && (
              <Ionicons name="warning" size={16} color={COLORS.WARNING} />
            )}
            {isValid && !hasError && !hasWarning && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
            )}
          </View>
        )}
      </View>
      
      {/* Validation Messages */}
      {showValidation && hasInteracted && (
        <View style={styles.validationContainer}>
          {/* Error Messages */}
          {hasError && validationResult?.errors && (
            <View style={styles.errorContainer}>
              {validationResult.errors.map((error, index) => (
                <Text key={index} style={[styles.errorText, errorStyle]}>
                  {error}
                </Text>
              ))}
            </View>
          )}
          
          {/* Warning Messages */}
          {hasWarning && validationResult?.warnings && !hasError && (
            <View style={styles.warningContainer}>
              {validationResult.warnings.map((warning, index) => (
                <Text key={index} style={[styles.warningText, warningStyle]}>
                  {warning}
                </Text>
              ))}
            </View>
          )}
          
          {/* Password Strength Indicator */}
          {validationResult?.strength && secureTextEntry && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Password strength: </Text>
              <Text style={[
                styles.strengthValue,
                validationResult.strength === 'weak' && styles.strengthWeak,
                validationResult.strength === 'medium' && styles.strengthMedium,
                validationResult.strength === 'strong' && styles.strengthStrong,
              ]}>
                {validationResult.strength.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.MD,
  },
  labelContainer: {
    marginBottom: SPACING.XS,
  },
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  required: {
    color: COLORS.ERROR,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.WHITE,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_300,
  },
  filled: {
    backgroundColor: COLORS.GRAY_100,
  },
  focused: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  error: {
    borderColor: COLORS.ERROR,
    borderWidth: 1,
  },
  warning: {
    borderColor: COLORS.WARNING,
    borderWidth: 1,
  },
  valid: {
    borderColor: COLORS.SUCCESS,
    borderWidth: 1,
  },
  disabled: {
    backgroundColor: COLORS.GRAY_100,
    opacity: 0.6,
  },
  leftIconContainer: {
    paddingLeft: SPACING.MD,
    paddingRight: SPACING.SM,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 48,
  },
  inputSmall: {
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    minHeight: 40,
  },
  inputLarge: {
    paddingVertical: SPACING.LG,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    minHeight: 56,
  },
  rightIconContainer: {
    paddingRight: SPACING.MD,
    paddingLeft: SPACING.SM,
  },
  validationIconContainer: {
    paddingRight: SPACING.MD,
  },
  validationContainer: {
    marginTop: SPACING.XS,
  },
  errorContainer: {
    marginBottom: SPACING.XS,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.ERROR,
    marginBottom: 2,
  },
  warningContainer: {
    marginBottom: SPACING.XS,
  },
  warningText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.WARNING,
    marginBottom: 2,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS,
  },
  strengthLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  strengthValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  strengthWeak: {
    color: COLORS.ERROR,
  },
  strengthMedium: {
    color: COLORS.WARNING,
  },
  strengthStrong: {
    color: COLORS.SUCCESS,
  },
});

export default ValidatedInput;

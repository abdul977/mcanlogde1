/**
 * Enhanced Forgot Password Screen
 *
 * This screen provides comprehensive password reset functionality with
 * email validation, OTP verification, and secure password reset.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { useFormValidation } from '../../hooks';
import { ValidatedInput, ValidatedForm, SafeAreaScreen } from '../../components';
import { ValidationConfig } from '../../utils/validation';

// Password reset flow steps
enum ResetStep {
  EMAIL_INPUT = 'email_input',
  OTP_VERIFICATION = 'otp_verification',
  NEW_PASSWORD = 'new_password',
  SUCCESS = 'success',
}

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();

  // State management
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.EMAIL_INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Form validation configurations for different steps
  const emailValidationRules: Record<string, ValidationConfig> = {
    email: {
      required: true,
      realTime: true,
      debounceMs: 500,
    },
  };

  const otpValidationRules: Record<string, ValidationConfig> = {
    otp: {
      required: true,
      minLength: 6,
      maxLength: 6,
      pattern: /^\d{6}$/,
      realTime: true,
    },
  };

  const passwordValidationRules: Record<string, ValidationConfig> = {
    newPassword: {
      required: true,
      minLength: 8,
      realTime: true,
    },
    confirmPassword: {
      required: true,
      realTime: true,
    },
  };

  // Form validation hooks for different steps
  const emailForm = useFormValidation({
    initialValues: { email: '' },
    validationRules: emailValidationRules,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const otpForm = useFormValidation({
    initialValues: { otp: '' },
    validationRules: otpValidationRules,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const passwordForm = useFormValidation({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationRules: passwordValidationRules,
    validateOnChange: true,
    validateOnBlur: true,
  });

  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Handle email submission
  const handleEmailSubmit = async (formValues: Record<string, string>) => {
    try {
      setIsLoading(true);
      setEmail(formValues.email);

      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Move to OTP verification step
      setCurrentStep(ResetStep.OTP_VERIFICATION);
      setOtpTimer(60); // 60 seconds timer
      setCanResendOtp(false);

      Alert.alert(
        'OTP Sent',
        `A 6-digit verification code has been sent to ${formValues.email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send reset code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (formValues: Record<string, string>) => {
    try {
      setIsLoading(true);
      setOtp(formValues.otp);

      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Move to new password step
      setCurrentStep(ResetStep.NEW_PASSWORD);
    } catch (error) {
      Alert.alert(
        'Invalid Code',
        'The verification code is incorrect. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (formValues: Record<string, string>) => {
    try {
      setIsLoading(true);

      // Validate passwords match
      if (formValues.newPassword !== formValues.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Move to success step
      setCurrentStep(ResetStep.SUCCESS);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to reset password. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);

      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOtpTimer(60);
      setCanResendOtp(false);

      Alert.alert(
        'Code Resent',
        `A new verification code has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to resend code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === ResetStep.EMAIL_INPUT) {
      navigation.goBack();
    } else if (currentStep === ResetStep.OTP_VERIFICATION) {
      setCurrentStep(ResetStep.EMAIL_INPUT);
    } else if (currentStep === ResetStep.NEW_PASSWORD) {
      setCurrentStep(ResetStep.OTP_VERIFICATION);
    }
  };

  // Handle success navigation
  const handleSuccessNavigation = () => {
    navigation.navigate('Login' as never);
  };

  // Get step title and subtitle
  const getStepContent = () => {
    switch (currentStep) {
      case ResetStep.EMAIL_INPUT:
        return {
          title: 'Reset Password',
          subtitle: 'Enter your email address to receive a verification code',
          icon: 'mail-outline',
        };
      case ResetStep.OTP_VERIFICATION:
        return {
          title: 'Verify Code',
          subtitle: `Enter the 6-digit code sent to ${email}`,
          icon: 'shield-checkmark-outline',
        };
      case ResetStep.NEW_PASSWORD:
        return {
          title: 'New Password',
          subtitle: 'Create a strong new password for your account',
          icon: 'lock-closed-outline',
        };
      case ResetStep.SUCCESS:
        return {
          title: 'Password Reset',
          subtitle: 'Your password has been successfully reset',
          icon: 'checkmark-circle-outline',
        };
      default:
        return {
          title: 'Reset Password',
          subtitle: 'Enter your email address to receive a verification code',
          icon: 'mail-outline',
        };
    }
  };

  const stepContent = getStepContent();

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case ResetStep.EMAIL_INPUT:
        return (
          <ValidatedInput
            label="Email Address"
            placeholder="Enter your email address"
            value={emailForm.values.email}
            onChangeText={(text) => emailForm.setValue('email', text)}
            onBlur={() => emailForm.setFieldTouched('email')}
            validationResult={emailForm.errors.email}
            showValidation={emailForm.touched.email}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            required
          />
        );

      case ResetStep.OTP_VERIFICATION:
        return (
          <View>
            <ValidatedInput
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={otpForm.values.otp}
              onChangeText={(text) => otpForm.setValue('otp', text)}
              onBlur={() => otpForm.setFieldTouched('otp')}
              validationResult={otpForm.errors.otp}
              showValidation={otpForm.touched.otp}
              leftIcon="shield-checkmark-outline"
              keyboardType="numeric"
              maxLength={6}
              required
            />

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              {otpTimer > 0 ? (
                <Text style={styles.timerText}>
                  Resend code in {otpTimer}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={isLoading}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case ResetStep.NEW_PASSWORD:
        return (
          <View>
            <ValidatedInput
              label="New Password"
              placeholder="Enter new password"
              value={passwordForm.values.newPassword}
              onChangeText={(text) => passwordForm.setValue('newPassword', text)}
              onBlur={() => passwordForm.setFieldTouched('newPassword')}
              validationResult={passwordForm.errors.newPassword}
              showValidation={passwordForm.touched.newPassword}
              leftIcon="lock-closed-outline"
              secureTextEntry={true}
              showPasswordToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <ValidatedInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={passwordForm.values.confirmPassword}
              onChangeText={(text) => passwordForm.setValue('confirmPassword', text)}
              onBlur={() => passwordForm.setFieldTouched('confirmPassword')}
              validationResult={passwordForm.errors.confirmPassword}
              showValidation={passwordForm.touched.confirmPassword}
              leftIcon="lock-closed-outline"
              secureTextEntry={true}
              showPasswordToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              required
            />
          </View>
        );

      case ResetStep.SUCCESS:
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={COLORS.SUCCESS}
              />
            </View>
            <Text style={styles.successMessage}>
              Your password has been successfully reset. You can now sign in with your new password.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  // Get current form and handler based on step
  const getCurrentFormHandler = () => {
    switch (currentStep) {
      case ResetStep.EMAIL_INPUT:
        return { form: emailForm, handler: handleEmailSubmit };
      case ResetStep.OTP_VERIFICATION:
        return { form: otpForm, handler: handleOtpSubmit };
      case ResetStep.NEW_PASSWORD:
        return { form: passwordForm, handler: handlePasswordReset };
      default:
        return null;
    }
  };

  const currentFormData = getCurrentFormHandler();

  return (
    <SafeAreaScreen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ValidatedForm
            title={stepContent.title}
            subtitle={stepContent.subtitle}
            errors={currentFormData?.form.errors || {}}
            isValid={currentFormData?.form.isValid || false}
            isSubmitting={isLoading}
            showSummaryErrors={false}
            keyboardAvoidingEnabled={false}
            scrollEnabled={true}
            contentContainerStyle={styles.formContainer}
          >
            {/* Header with back button */}
            <View style={styles.header}>
              {currentStep !== ResetStep.SUCCESS && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
              )}

              <View style={styles.iconContainer}>
                <Ionicons
                  name={stepContent.icon as any}
                  size={40}
                  color={COLORS.PRIMARY}
                />
              </View>
            </View>

            {/* Step Content */}
            <View style={styles.stepContent}>
              {renderStepContent()}
            </View>

            {/* Action Button */}
            {currentStep !== ResetStep.SUCCESS && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (!currentFormData?.form.isValid || isLoading) && styles.actionButtonDisabled
                ]}
                onPress={() => currentFormData?.form.handleSubmit(currentFormData.handler)}
                disabled={!currentFormData?.form.isValid || isLoading}
                accessibilityRole="button"
                accessibilityState={{ disabled: !currentFormData?.form.isValid || isLoading }}
              >
                <View style={styles.actionButtonContent}>
                  {isLoading && (
                    <Ionicons name="refresh" size={20} color={COLORS.WHITE} style={styles.loadingIcon} />
                  )}
                  <Text style={styles.actionButtonText}>
                    {isLoading
                      ? 'Processing...'
                      : currentStep === ResetStep.EMAIL_INPUT
                        ? 'Send Code'
                        : currentStep === ResetStep.OTP_VERIFICATION
                          ? 'Verify Code'
                          : 'Reset Password'
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Success Action */}
            {currentStep === ResetStep.SUCCESS && (
              <TouchableOpacity
                style={styles.successButton}
                onPress={handleSuccessNavigation}
                accessibilityRole="button"
                accessibilityLabel="Go to login"
              >
                <Text style={styles.successButtonText}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            )}
          </ValidatedForm>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XL,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: SPACING.SM,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_100,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.MD,
  },
  stepContent: {
    marginBottom: SPACING.XL,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  timerText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '400' as const,
  },
  resendButton: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  resendButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: '600' as const,
    textDecorationLine: 'underline',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  successIconContainer: {
    marginBottom: SPACING.LG,
  },
  successMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.GRAY_300,
    ...SHADOWS.SM,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: '600' as const,
  },
  loadingIcon: {
    marginRight: SPACING.SM,
  },
  successButton: {
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 12,
    paddingVertical: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...SHADOWS.MD,
  },
  successButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: '600' as const,
  },
});

export default ForgotPasswordScreen;

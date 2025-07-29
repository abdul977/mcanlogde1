import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

import { COLORS, TYPOGRAPHY, SPACING, APP_CONFIG, SHADOWS, STORAGE_KEYS } from '../../constants';
import { useAuth } from '../../context';
import { useFormValidation, useBiometric, useRememberMe } from '../../hooks';
import { useEntranceAnimation } from '../../hooks/useAnimations';
import { ValidatedInput, ValidatedForm, BiometricButton, SafeAreaScreen } from '../../components';
import { RememberMeCheckbox } from '../../components/ui/RememberMeCheckbox';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { ValidationConfig } from '../../utils/validation';

const LoginScreen: React.FC = () => {
  console.log('🔑 LoginScreen rendering...');
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useAuth();
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled } = useBiometric();
  const {
    enableRememberMe,
    disableRememberMe,
    lastRememberedEmail,
    getRememberedCredentials
  } = useRememberMe();

  // Local state
  const [rememberMe, setRememberMe] = useState(false);

  // Animation hook
  const { fadeAnim, slideAnim } = useEntranceAnimation(true, { duration: 800 });

  // Form validation configuration
  const validationRules: Record<string, ValidationConfig> = {
    email: {
      required: true,
      realTime: false, // Don't validate email in real-time during typing
      debounceMs: 1000,
    },
    password: {
      required: true,
      minLength: 6,
      realTime: false, // Don't validate password in real-time for login
    },
  };

  // Form validation hook
  const {
    values,
    errors: validationErrors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    handleSubmit,
  } = useFormValidation({
    initialValues: {
      email: lastRememberedEmail || '',
      password: ''
    },
    validationRules,
    validateOnChange: false, // Only validate on blur and submit
    validateOnBlur: true,
  });

  // Handle login submission
  const handleLogin = async (formValues: Record<string, string>) => {
    try {
      clearError(); // Clear any previous auth errors

      // Perform login
      await login({
        email: formValues.email,
        password: formValues.password,
      });

      // Handle remember me functionality
      if (rememberMe) {
        await enableRememberMe(formValues.email, biometricEnabled);
      } else {
        // If remember me is disabled, clear any existing credentials
        await disableRememberMe();
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handle forgot password navigation
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  // Handle register navigation
  const handleRegister = () => {
    navigation.navigate('Register' as never);
  };

  // Handle biometric login success
  const handleBiometricSuccess = async () => {
    try {
      clearError();
      console.log('Biometric authentication successful, attempting login...');

      // Check if we have stored credentials for biometric login
      const credentials = await getRememberedCredentials();

      if (!credentials || !credentials.biometricEnabled) {
        Alert.alert(
          'Biometric Login Not Available',
          'Please sign in with your email and password first, then enable biometric authentication.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // For biometric login, check if we have stored auth token
      const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const storedUserData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUserData) {
        try {
          // Validate the stored token by making a test API call
          const user = JSON.parse(storedUserData);
          console.log('✅ Biometric login successful for user:', user.email);

          // The auth context should automatically pick up the stored credentials
          // Force a re-initialization to trigger the login state
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
          });

        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          throw new Error('Invalid stored credentials');
        }
      } else {
        // No stored credentials, ask user to login normally
        if (credentials.email) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please enter your password to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'OK',
                onPress: () => {
                  // Pre-fill email and focus password field
                  setValue('email', credentials.email);
                  setFieldTouched('email', true);
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please sign in with your email and password.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      }

    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert(
        'Biometric Login Failed',
        'Unable to sign in with biometric authentication. Please try again or use your email and password.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handle biometric login error
  const handleBiometricError = (error: string) => {
    console.log('Biometric authentication failed:', error);
    // Don't show alert here as the BiometricButton handles user feedback
  };

  // Animation is now handled by useEntranceAnimation hook

  return (
    <SafeAreaScreen style={styles.container}>
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
          title="Welcome Back"
          subtitle={`Sign in to ${APP_CONFIG.NAME}`}
          errors={validationErrors}
          isValid={isValid}
          isSubmitting={isLoading}
          showSummaryErrors={false}
          keyboardAvoidingEnabled={true}
          scrollEnabled={false}
          contentContainerStyle={styles.formContainer}
        >
          {/* App Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoImageContainer}>
              <Image
                source={require('../../../assets/mcan-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="MCAN Lodge Logo"
              />
            </View>
            <Text style={styles.appName}>{APP_CONFIG.NAME}</Text>
            <Text style={styles.tagline}>Muslim Corpers' Association of Nigeria</Text>
          </View>

          {/* Login Form Fields */}
          <View style={styles.formFields}>
            {/* Email Input */}
            <ValidatedInput
              label="Email Address"
              placeholder="Enter your email address"
              value={values.email}
              onChangeText={(text) => setValue('email', text)}
              onBlur={() => setFieldTouched('email')}
              validationResult={validationErrors.email}
              showValidation={touched.email}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              required
              accessibilityLabel="Email address input"
              accessibilityHint="Enter your registered email address"
            />

            {/* Password Input */}
            <ValidatedInput
              label="Password"
              placeholder="Enter your password"
              value={values.password}
              onChangeText={(text) => setValue('password', text)}
              onBlur={() => setFieldTouched('password')}
              validationResult={validationErrors.password}
              showValidation={touched.password}
              leftIcon="lock-closed-outline"
              secureTextEntry={true}
              showPasswordToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              textContentType="none"
              required
              accessibilityLabel="Password input"
              accessibilityHint="Enter your account password"
            />

            {/* Remember Me Checkbox */}
            <View style={styles.rememberMeContainer}>
              <RememberMeCheckbox
                checked={rememberMe}
                onToggle={setRememberMe}
                label="Remember me"
                size="medium"
                testID="remember-me-checkbox"
              />
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              accessibilityHint="Navigate to password reset screen"
            >
              <Text style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Authentication Methods */}
          <View style={styles.authenticationSection}>
            {/* Traditional Login */}
            <View style={styles.traditionalAuth}>
              <AnimatedButton
                title="Sign In with Email"
                onPress={() => handleSubmit(handleLogin)}
                variant="primary"
                size="large"
                disabled={!isValid || isLoading}
                loading={isLoading}
                animateOnPress={true}
                animateOnMount={true}
                shakeOnError={true}
                leftIcon={isLoading ? undefined : "log-in-outline"}
                accessibilityLabel="Sign in with email and password"
                accessibilityHint="Sign in to your account using email and password"
                style={styles.loginButton}
                testID="login-button"
              />
            </View>

            {/* Biometric Authentication Option */}
            {biometricAvailable && biometricEnabled && (
              <>
                {/* Divider */}
                <View style={styles.authDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Biometric Login */}
                <View style={styles.biometricAuth}>
                  <BiometricButton
                    onSuccess={handleBiometricSuccess}
                    onError={handleBiometricError}
                    size="large"
                    variant="outline"
                    style={styles.biometricLoginButton}
                    promptMessage="Sign in to MCAN Lodge"
                    customLabel="Sign In with Fingerprint"
                    showLabel={true}
                  />
                </View>
              </>
            )}

            {/* Auth Error Display */}
            {error && (
              <Animated.View style={styles.authErrorContainer}>
                <View style={styles.authErrorContent}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.ERROR} />
                  <Text style={styles.authErrorText}>{error}</Text>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>


            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={handleRegister}
                accessibilityRole="button"
                accessibilityLabel="Create account"
                accessibilityHint="Navigate to registration screen"
              >
                <Text style={styles.signUpLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <Text style={styles.versionText}>
              Version {APP_CONFIG.VERSION}
            </Text>
          </View>
        </ValidatedForm>
      </Animated.View>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  logoImageContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: TYPOGRAPHY.FONT_SIZES['2XL'],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XS,
    textAlign: 'center',
  },
  tagline: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  formFields: {
    marginBottom: SPACING.MD,
  },
  rememberMeContainer: {
    marginTop: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: SPACING.XS,
    marginBottom: SPACING.MD,
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  authenticationSection: {
    marginBottom: SPACING.MD,
  },
  traditionalAuth: {
    marginBottom: SPACING.SM,
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.MD,
    width: '100%',
  },
  biometricAuth: {
    alignItems: 'center',
  },
  biometricLoginButton: {
    width: '100%',
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.GRAY_200,
  },
  dividerText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: SPACING.MD,
    fontWeight: '500' as const,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...SHADOWS.MD,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.GRAY_300,
    ...SHADOWS.SM,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: '600' as const,
    marginLeft: SPACING.SM,
  },
  loadingIndicator: {
    marginRight: SPACING.SM,
  },
  authErrorContainer: {
    marginTop: SPACING.MD,
    backgroundColor: COLORS.ERROR + '10',
    borderColor: COLORS.ERROR + '30',
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.MD,
  },
  authErrorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authErrorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.ERROR,
    marginLeft: SPACING.SM,
    flex: 1,
    fontWeight: '500' as const,
  },
  footer: {
    alignItems: 'center',
  },

  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  signUpText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '400' as const,
  },
  signUpLink: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.PRIMARY,
    fontWeight: '600' as const,
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_MUTED,
    textAlign: 'center',
    fontWeight: '400' as const,
  },
  biometricButton: {
    marginBottom: SPACING.LG,
  },
});

export default LoginScreen;

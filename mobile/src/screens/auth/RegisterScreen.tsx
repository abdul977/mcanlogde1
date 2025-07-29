import React, { useState, useEffect } from 'react';
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

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  APP_CONFIG,
  SHADOWS,
  NYSC_STREAMS,
  NIGERIAN_STATES,
  GENDER_OPTIONS
} from '../../constants';
import { useAuth } from '../../context';
import { useFormValidation } from '../../hooks';
import { ValidatedInput, ValidatedForm, SafeAreaScreen } from '../../components';
import { ValidationConfig } from '../../utils/validation';
import { RegisterForm } from '../../types';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register, isLoading, error, clearError } = useAuth();

  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [showNyscFields, setShowNyscFields] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Form validation configuration
  const validationRules: Record<string, ValidationConfig> = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      realTime: true,
      debounceMs: 300,
    },
    email: {
      required: true,
      realTime: true,
      debounceMs: 500,
    },
    password: {
      required: true,
      minLength: 8,
      realTime: true,
      debounceMs: 300,
    },
    confirmPassword: {
      required: true,
      realTime: true,
      debounceMs: 300,
    },
    phone: {
      required: false,
      realTime: true,
      debounceMs: 500,
    },
    // NYSC fields (optional)
    gender: {
      required: false,
    },
    stateCode: {
      required: false,
    },
    batch: {
      required: false,
    },
    stream: {
      required: false,
    },
    callUpNumber: {
      required: false,
    },
    institution: {
      required: false,
      maxLength: 100,
    },
    course: {
      required: false,
      maxLength: 100,
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      gender: '',
      stateCode: '',
      batch: '',
      stream: '',
      callUpNumber: '',
      dateOfBirth: '',
      institution: '',
      course: '',
    },
    validationRules,
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Handle registration submission
  const handleRegister = async (formValues: Record<string, string>) => {
    try {
      clearError(); // Clear any previous auth errors

      // Prepare registration data
      const registrationData: RegisterForm = {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
        phone: formValues.phone || undefined,
        // Include NYSC fields if provided
        gender: formValues.gender as 'male' | 'female' || undefined,
        stateCode: formValues.stateCode || undefined,
        batch: formValues.batch || undefined,
        stream: formValues.stream as 'A' | 'B' | 'C' || undefined,
        callUpNumber: formValues.callUpNumber || undefined,
        dateOfBirth: formValues.dateOfBirth || undefined,
        institution: formValues.institution || undefined,
        course: formValues.course || undefined,
      };

      // Perform registration
      await register(registrationData);

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. You can now sign in.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Please check your information and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handle login navigation
  const handleLogin = () => {
    navigation.navigate('Login' as never);
  };

  // Toggle NYSC fields visibility
  const toggleNyscFields = () => {
    setShowNyscFields(!showNyscFields);
  };

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
          title="Create Account"
          subtitle={`Join the ${APP_CONFIG.NAME} community`}
          errors={validationErrors}
          isValid={isValid}
          isSubmitting={isLoading}
          showSummaryErrors={false}
          keyboardAvoidingEnabled={true}
          scrollEnabled={true}
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

          {/* Registration Form Fields */}
          <View style={styles.formFields}>
            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>

            {/* Full Name Input */}
            <ValidatedInput
              label="Full Name"
              placeholder="Enter your full name"
              value={values.name}
              onChangeText={(text) => setValue('name', text)}
              onBlur={() => setFieldTouched('name')}
              validationResult={validationErrors.name}
              showValidation={touched.name}
              leftIcon="person-outline"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              required
              accessibilityLabel="Full name input"
              accessibilityHint="Enter your full name as it appears on official documents"
            />

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
              accessibilityHint="Enter a valid email address for account verification"
            />

            {/* Phone Input */}
            <ValidatedInput
              label="Phone Number (Optional)"
              placeholder="Enter your phone number"
              value={values.phone}
              onChangeText={(text) => setValue('phone', text)}
              onBlur={() => setFieldTouched('phone')}
              validationResult={validationErrors.phone}
              showValidation={touched.phone}
              leftIcon="call-outline"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              accessibilityLabel="Phone number input"
              accessibilityHint="Enter your phone number for account recovery"
            />

            {/* Password Input */}
            <ValidatedInput
              label="Password"
              placeholder="Create a strong password"
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
              autoComplete="password-new"
              textContentType="newPassword"
              required
              accessibilityLabel="Password input"
              accessibilityHint="Create a strong password with at least 8 characters"
            />

            {/* Confirm Password Input */}
            <ValidatedInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={values.confirmPassword}
              onChangeText={(text) => setValue('confirmPassword', text)}
              onBlur={() => setFieldTouched('confirmPassword')}
              validationResult={validationErrors.confirmPassword}
              showValidation={touched.confirmPassword}
              leftIcon="lock-closed-outline"
              secureTextEntry={true}
              showPasswordToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password-new"
              textContentType="newPassword"
              required
              accessibilityLabel="Confirm password input"
              accessibilityHint="Re-enter your password to confirm"
            />
          </View>

          {/* NYSC Information Toggle */}
          <View style={styles.nyscToggleContainer}>
            <TouchableOpacity
              style={styles.nyscToggleButton}
              onPress={toggleNyscFields}
              accessibilityRole="button"
              accessibilityLabel="Toggle NYSC information"
              accessibilityHint="Show or hide NYSC-specific fields"
            >
              <View style={styles.nyscToggleContent}>
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={COLORS.PRIMARY}
                />
                <Text style={styles.nyscToggleText}>
                  {showNyscFields ? 'Hide' : 'Add'} NYSC Information (Optional)
                </Text>
                <Ionicons
                  name={showNyscFields ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.PRIMARY}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* NYSC Fields (Collapsible) */}
          {showNyscFields && (
            <Animated.View style={styles.nyscFieldsContainer}>
              <Text style={styles.sectionTitle}>NYSC Information</Text>
              <Text style={styles.sectionSubtitle}>
                Complete your NYSC details to connect with fellow corps members
              </Text>

              {/* Gender Input */}
              <ValidatedInput
                label="Gender"
                placeholder="Enter your gender (male/female)"
                value={values.gender}
                onChangeText={(text) => setValue('gender', text)}
                onBlur={() => setFieldTouched('gender')}
                validationResult={validationErrors.gender}
                showValidation={touched.gender}
                leftIcon="person-outline"
                autoCapitalize="none"
                accessibilityLabel="Gender input"
                accessibilityHint="Enter your gender (male or female)"
              />

              {/* State Code Input */}
              <ValidatedInput
                label="State of Deployment"
                placeholder="Enter state code (e.g., LA, AB, FC)"
                value={values.stateCode}
                onChangeText={(text) => setValue('stateCode', text.toUpperCase())}
                onBlur={() => setFieldTouched('stateCode')}
                validationResult={validationErrors.stateCode}
                showValidation={touched.stateCode}
                leftIcon="location-outline"
                autoCapitalize="characters"
                maxLength={2}
                accessibilityLabel="State of deployment input"
                accessibilityHint="Enter your NYSC state of deployment code"
              />

              {/* Batch Input */}
              <ValidatedInput
                label="Batch"
                placeholder="e.g., 2023 Batch B"
                value={values.batch}
                onChangeText={(text) => setValue('batch', text)}
                onBlur={() => setFieldTouched('batch')}
                validationResult={validationErrors.batch}
                showValidation={touched.batch}
                leftIcon="calendar-outline"
                autoCapitalize="characters"
                accessibilityLabel="NYSC batch input"
                accessibilityHint="Enter your NYSC batch information"
              />

              {/* Stream Input */}
              <ValidatedInput
                label="Stream"
                placeholder="Enter your stream (A, B, or C)"
                value={values.stream}
                onChangeText={(text) => setValue('stream', text.toUpperCase())}
                onBlur={() => setFieldTouched('stream')}
                validationResult={validationErrors.stream}
                showValidation={touched.stream}
                leftIcon="git-branch-outline"
                autoCapitalize="characters"
                maxLength={1}
                accessibilityLabel="Stream input"
                accessibilityHint="Enter your NYSC stream (A, B, or C)"
              />

              {/* Call-up Number Input */}
              <ValidatedInput
                label="Call-up Number"
                placeholder="e.g., NYSC/2023/B/LA/A/12345"
                value={values.callUpNumber}
                onChangeText={(text) => setValue('callUpNumber', text)}
                onBlur={() => setFieldTouched('callUpNumber')}
                validationResult={validationErrors.callUpNumber}
                showValidation={touched.callUpNumber}
                leftIcon="card-outline"
                autoCapitalize="characters"
                accessibilityLabel="Call-up number input"
                accessibilityHint="Enter your NYSC call-up number"
              />

              {/* Institution Input */}
              <ValidatedInput
                label="Institution"
                placeholder="Your university/polytechnic"
                value={values.institution}
                onChangeText={(text) => setValue('institution', text)}
                onBlur={() => setFieldTouched('institution')}
                validationResult={validationErrors.institution}
                showValidation={touched.institution}
                leftIcon="school-outline"
                autoCapitalize="words"
                accessibilityLabel="Institution input"
                accessibilityHint="Enter your educational institution"
              />

              {/* Course Input */}
              <ValidatedInput
                label="Course of Study"
                placeholder="Your field of study"
                value={values.course}
                onChangeText={(text) => setValue('course', text)}
                onBlur={() => setFieldTouched('course')}
                validationResult={validationErrors.course}
                showValidation={touched.course}
                leftIcon="book-outline"
                autoCapitalize="words"
                accessibilityLabel="Course of study input"
                accessibilityHint="Enter your course of study"
              />
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (!isValid || isLoading) && styles.registerButtonDisabled
              ]}
              onPress={() => handleSubmit(handleRegister)}
              disabled={!isValid || isLoading}
              accessibilityRole="button"
              accessibilityLabel="Create account"
              accessibilityHint="Create your MCAN Lodge account"
              accessibilityState={{ disabled: !isValid || isLoading }}
            >
              <View style={styles.registerButtonContent}>
                {isLoading && (
                  <Animated.View style={styles.loadingIndicator}>
                    <Ionicons name="refresh" size={20} color={COLORS.WHITE} />
                  </Animated.View>
                )}
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </View>
            </TouchableOpacity>

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
            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={handleLogin}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                accessibilityHint="Navigate to login screen"
              >
                <Text style={styles.signInLink}>Sign In</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  logoImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
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
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
    marginTop: SPACING.MD,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  nyscToggleContainer: {
    marginBottom: SPACING.LG,
  },
  nyscToggleButton: {
    backgroundColor: COLORS.GRAY_50,
    borderColor: COLORS.PRIMARY + '30',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.MD,
  },
  nyscToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nyscToggleText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    flex: 1,
    marginLeft: SPACING.SM,
  },
  nyscFieldsContainer: {
    marginBottom: SPACING.LG,
  },
  actionButtons: {
    marginBottom: SPACING.XL,
  },
  registerButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...SHADOWS.MD,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.GRAY_300,
    ...SHADOWS.SM,
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  signInText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '400' as const,
  },
  signInLink: {
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
});

export default RegisterScreen;

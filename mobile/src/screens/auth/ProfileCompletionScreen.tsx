import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
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
import { ValidatedInput, ValidatedForm } from '../../components';
import { ValidationConfig } from '../../utils/validation';

interface ProfileCompletionScreenProps {
  route?: {
    params?: {
      skipable?: boolean;
    };
  };
}

const ProfileCompletionScreen: React.FC<ProfileCompletionScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  const skipable = route?.params?.skipable ?? true;

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Form validation configuration
  const validationRules: Record<string, ValidationConfig> = {
    gender: {
      required: true,
    },
    stateCode: {
      required: true,
    },
    batch: {
      required: true,
    },
    stream: {
      required: true,
    },
    callUpNumber: {
      required: true,
    },
    phone: {
      required: false,
      realTime: true,
      debounceMs: 500,
    },
    dateOfBirth: {
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
      gender: user?.gender || '',
      stateCode: user?.stateCode || '',
      batch: user?.batch || '',
      stream: user?.stream || '',
      callUpNumber: user?.callUpNumber || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      institution: user?.institution || '',
      course: user?.course || '',
    },
    validationRules,
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Handle profile completion submission
  const handleCompleteProfile = async (formValues: Record<string, string>) => {
    try {
      clearError(); // Clear any previous auth errors

      // Prepare profile update data
      const profileData = {
        gender: formValues.gender as 'male' | 'female',
        stateCode: formValues.stateCode.toUpperCase(),
        batch: formValues.batch,
        stream: formValues.stream.toUpperCase() as 'A' | 'B' | 'C',
        callUpNumber: formValues.callUpNumber.toUpperCase(),
        phone: formValues.phone || undefined,
        dateOfBirth: formValues.dateOfBirth || undefined,
        institution: formValues.institution || undefined,
        course: formValues.course || undefined,
      };

      // Update profile
      await updateProfile(profileData);

      Alert.alert(
        'Profile Completed',
        'Your NYSC information has been saved successfully!',
        [
          {
            text: 'Continue',
            style: 'default',
            onPress: () => navigation.navigate('Main' as never),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.message || 'Please check your information and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Handle skip profile completion
  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Completion?',
      'You can complete your NYSC information later in your profile settings.',
      [
        {
          text: 'Complete Now',
          style: 'default',
        },
        {
          text: 'Skip for Now',
          style: 'destructive',
          onPress: () => navigation.navigate('Main' as never),
        },
      ]
    );
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
    <SafeAreaView style={styles.container}>
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
          title="Complete Your Profile"
          subtitle="Help us connect you with fellow corps members"
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
            <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
          </View>

          {/* Profile Completion Form Fields */}
          <View style={styles.formFields}>
            <Text style={styles.sectionTitle}>NYSC Information</Text>
            <Text style={styles.sectionSubtitle}>
              Complete your NYSC details to unlock all features and connect with fellow corps members in your area.
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
              required
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
              required
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
              required
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
              required
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
              required
              accessibilityLabel="Call-up number input"
              accessibilityHint="Enter your NYSC call-up number"
            />

            {/* Optional Fields */}
            <Text style={styles.optionalSectionTitle}>Additional Information (Optional)</Text>

            {/* Phone Input */}
            <ValidatedInput
              label="Phone Number"
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
              accessibilityHint="Enter your phone number"
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
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Complete Profile Button */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                (!isValid || isLoading) && styles.completeButtonDisabled
              ]}
              onPress={() => handleSubmit(handleCompleteProfile)}
              disabled={!isValid || isLoading}
              accessibilityRole="button"
              accessibilityLabel="Complete profile"
              accessibilityHint="Save your NYSC information"
              accessibilityState={{ disabled: !isValid || isLoading }}
            >
              <View style={styles.completeButtonContent}>
                {isLoading && (
                  <Animated.View style={styles.loadingIndicator}>
                    <Ionicons name="refresh" size={20} color={COLORS.WHITE} />
                  </Animated.View>
                )}
                <Text style={styles.completeButtonText}>
                  {isLoading ? 'Saving...' : 'Complete Profile'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Skip Button (if skipable) */}
            {skipable && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel="Skip profile completion"
                accessibilityHint="Skip completing your profile for now"
              >
                <Text style={styles.skipButtonText}>Skip for Now</Text>
              </TouchableOpacity>
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
        </ValidatedForm>
      </Animated.View>
    </SafeAreaView>
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
  welcomeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
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
    marginBottom: SPACING.LG,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.SM,
  },
  optionalSectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
    marginTop: SPACING.LG,
  },
  actionButtons: {
    marginBottom: SPACING.XL,
  },
  completeButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
  },
  completeButtonDisabled: {
    backgroundColor: COLORS.GRAY_300,
    ...SHADOWS.SM,
  },
  completeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: '600' as const,
    marginLeft: SPACING.SM,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.GRAY_300,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  skipButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: '500' as const,
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
});

export default ProfileCompletionScreen;

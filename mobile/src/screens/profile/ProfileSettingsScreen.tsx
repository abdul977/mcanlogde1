/**
 * Profile Settings Screen - User profile management
 * 
 * Features:
 * - Edit personal information
 * - Update profile details
 * - NYSC-specific information
 * - Profile completion tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, GENDER_OPTIONS, NYSC_STREAMS } from '../../constants';
import { useAuth } from '../../context';
import { SafeAreaScreen, ValidatedInput, AnimatedButton } from '../../components';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ValidationConfig } from '../../utils/validation';

const ProfileSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation configuration
  const validationRules: Record<string, ValidationConfig> = {
    name: {
      required: true,
      minLength: 2,
    },
    phone: {
      required: false,
      pattern: /^[0-9+\-\s()]+$/,
    },
    institution: {
      required: false,
      minLength: 2,
    },
    course: {
      required: false,
      minLength: 2,
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
      name: user?.name || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      stateCode: user?.stateCode || '',
      batch: user?.batch || '',
      stream: user?.stream || '',
      callUpNumber: user?.callUpNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
      institution: user?.institution || '',
      course: user?.course || '',
    },
    validationRules,
    validateOnChange: false,
    validateOnBlur: true,
  });

  // Handle form submission
  const handleUpdateProfile = async (formData: any) => {
    try {
      setIsLoading(true);
      
      await updateProfile(formData);
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    const fields = ['name', 'phone', 'gender', 'stateCode', 'batch', 'stream', 'callUpNumber', 'institution', 'course'];
    const completedFields = fields.filter(field => values[field] && values[field].trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const completionPercentage = getProfileCompletion();

  return (
    <SafeAreaScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Completion */}
        <View style={styles.section}>
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.completionTitle}>Profile Completion</Text>
            </View>
            <Text style={styles.completionPercentage}>{completionPercentage}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
            </View>
            <Text style={styles.completionDescription}>
              Complete your profile to get better recommendations
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <ValidatedInput
            label="Full Name"
            placeholder="Enter your full name"
            value={values.name}
            onChangeText={(text) => setValue('name', text)}
            onBlur={() => setFieldTouched('name')}
            validationResult={validationErrors.name}
            showValidation={touched.name}
            leftIcon="person-outline"
            required
          />

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
          />

          <ValidatedInput
            label="Gender"
            placeholder="Select gender"
            value={values.gender}
            onChangeText={(text) => setValue('gender', text)}
            onBlur={() => setFieldTouched('gender')}
            leftIcon="person-outline"
            isDropdown
            dropdownOptions={GENDER_OPTIONS}
          />

          <ValidatedInput
            label="Date of Birth"
            placeholder="Select date of birth"
            value={values.dateOfBirth}
            onChangeText={(text) => setValue('dateOfBirth', text)}
            onBlur={() => setFieldTouched('dateOfBirth')}
            leftIcon="calendar-outline"
            isDatePicker
          />
        </View>

        {/* NYSC Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NYSC Information</Text>
          
          <ValidatedInput
            label="State Code"
            placeholder="Enter your state code (e.g., FC/24A/1234)"
            value={values.stateCode}
            onChangeText={(text) => setValue('stateCode', text)}
            onBlur={() => setFieldTouched('stateCode')}
            leftIcon="location-outline"
            autoCapitalize="characters"
          />

          <ValidatedInput
            label="Batch"
            placeholder="Enter your batch (e.g., 2024 Batch A)"
            value={values.batch}
            onChangeText={(text) => setValue('batch', text)}
            onBlur={() => setFieldTouched('batch')}
            leftIcon="calendar-outline"
          />

          <ValidatedInput
            label="Stream"
            placeholder="Select your stream"
            value={values.stream}
            onChangeText={(text) => setValue('stream', text)}
            onBlur={() => setFieldTouched('stream')}
            leftIcon="git-branch-outline"
            isDropdown
            dropdownOptions={NYSC_STREAMS}
          />

          <ValidatedInput
            label="Call-Up Number"
            placeholder="Enter your call-up number"
            value={values.callUpNumber}
            onChangeText={(text) => setValue('callUpNumber', text)}
            onBlur={() => setFieldTouched('callUpNumber')}
            leftIcon="card-outline"
            autoCapitalize="characters"
          />
        </View>

        {/* Educational Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educational Background</Text>
          
          <ValidatedInput
            label="Institution"
            placeholder="Enter your institution"
            value={values.institution}
            onChangeText={(text) => setValue('institution', text)}
            onBlur={() => setFieldTouched('institution')}
            validationResult={validationErrors.institution}
            showValidation={touched.institution}
            leftIcon="school-outline"
          />

          <ValidatedInput
            label="Course of Study"
            placeholder="Enter your course"
            value={values.course}
            onChangeText={(text) => setValue('course', text)}
            onBlur={() => setFieldTouched('course')}
            validationResult={validationErrors.course}
            showValidation={touched.course}
            leftIcon="book-outline"
          />
        </View>

        {/* Save Button */}
        <View style={styles.section}>
          <AnimatedButton
            title="Update Profile"
            onPress={() => handleSubmit(handleUpdateProfile)}
            variant="primary"
            size="large"
            disabled={!isValid || isLoading}
            loading={isLoading}
            leftIcon="checkmark-outline"
            style={styles.saveButton}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  headerRight: {
    width: 40, // Balance the back button
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  completionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  completionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  completionPercentage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.GRAY_200,
    borderRadius: 4,
    marginBottom: SPACING.SM,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  completionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: SPACING.MD,
  },
  bottomSpacing: {
    height: 100, // Space for tab bar
  },
});

export default ProfileSettingsScreen;

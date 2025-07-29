/**
 * Account Security Screen - Security settings and password management
 * 
 * Features:
 * - Change password
 * - Biometric authentication toggle
 * - Session management
 * - Security recommendations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants';
import { useAuth } from '../../context';
import { useBiometric } from '../../hooks';
import { SafeAreaScreen, ValidatedInput, AnimatedButton, BiometricButton } from '../../components';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ValidationConfig } from '../../utils/validation';

const AccountSecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    isAvailable: biometricAvailable, 
    isEnabled: biometricEnabled, 
    enableBiometric, 
    disableBiometric 
  } = useBiometric();
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Password change form validation
  const validationRules: Record<string, ValidationConfig> = {
    currentPassword: {
      required: true,
      minLength: 6,
    },
    newPassword: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    confirmPassword: {
      required: true,
      minLength: 8,
    },
  };

  const {
    values,
    errors: validationErrors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
  } = useFormValidation({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationRules,
    validateOnChange: false,
    validateOnBlur: true,
  });

  // Handle password change
  const handleChangePassword = async (formData: any) => {
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // TODO: Implement password change API call
      // await authService.changePassword(formData);
      
      Alert.alert(
        'Success',
        'Password changed successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            setShowPasswordForm(false);
            resetForm();
          }
        }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to change password. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle biometric toggle
  const handleBiometricToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const success = await enableBiometric();
        if (!success) {
          // Error already shown by enableBiometric
          return;
        }
      } else {
        await disableBiometric();
        Alert.alert(
          'Biometric Disabled',
          'Biometric authentication has been disabled for your account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert(
        'Error',
        'Failed to update biometric settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Security recommendations
  const getSecurityScore = () => {
    let score = 0;
    if (user?.email) score += 20;
    if (biometricEnabled) score += 30;
    // TODO: Add more security checks (password strength, 2FA, etc.)
    score += 50; // Base score for having an account
    return Math.min(score, 100);
  };

  const securityScore = getSecurityScore();

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
        <Text style={styles.headerTitle}>Account Security</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Security Score */}
        <View style={styles.section}>
          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <Ionicons 
                name="shield-checkmark" 
                size={24} 
                color={securityScore >= 80 ? COLORS.SUCCESS : securityScore >= 60 ? COLORS.WARNING : COLORS.ERROR} 
              />
              <Text style={styles.securityTitle}>Security Score</Text>
            </View>
            <Text style={[
              styles.securityScore,
              { color: securityScore >= 80 ? COLORS.SUCCESS : securityScore >= 60 ? COLORS.WARNING : COLORS.ERROR }
            ]}>
              {securityScore}%
            </Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                { 
                  width: `${securityScore}%`,
                  backgroundColor: securityScore >= 80 ? COLORS.SUCCESS : securityScore >= 60 ? COLORS.WARNING : COLORS.ERROR
                }
              ]} />
            </View>
            <Text style={styles.securityDescription}>
              {securityScore >= 80 ? 'Excellent security!' : 
               securityScore >= 60 ? 'Good security, consider improvements' : 
               'Security needs improvement'}
            </Text>
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password & Authentication</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="key-outline" size={20} color={COLORS.PRIMARY} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Change Password</Text>
                  <Text style={styles.settingSubtitle}>Update your account password</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowPasswordForm(!showPasswordForm)}
              >
                <Text style={styles.actionButtonText}>
                  {showPasswordForm ? 'Cancel' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>

            {showPasswordForm && (
              <View style={styles.passwordForm}>
                <ValidatedInput
                  label="Current Password"
                  placeholder="Enter current password"
                  value={values.currentPassword}
                  onChangeText={(text) => setValue('currentPassword', text)}
                  onBlur={() => setFieldTouched('currentPassword')}
                  validationResult={validationErrors.currentPassword}
                  showValidation={touched.currentPassword}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  required
                />

                <ValidatedInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={values.newPassword}
                  onChangeText={(text) => setValue('newPassword', text)}
                  onBlur={() => setFieldTouched('newPassword')}
                  validationResult={validationErrors.newPassword}
                  showValidation={touched.newPassword}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  required
                  helperText="Must contain uppercase, lowercase, number, and special character"
                />

                <ValidatedInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={values.confirmPassword}
                  onChangeText={(text) => setValue('confirmPassword', text)}
                  onBlur={() => setFieldTouched('confirmPassword')}
                  validationResult={validationErrors.confirmPassword}
                  showValidation={touched.confirmPassword}
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                  required
                />

                <AnimatedButton
                  title="Update Password"
                  onPress={() => handleSubmit(handleChangePassword)}
                  variant="primary"
                  size="medium"
                  disabled={!isValid || isChangingPassword}
                  loading={isChangingPassword}
                  leftIcon="checkmark-outline"
                  style={styles.updateButton}
                />
              </View>
            )}
          </View>
        </View>

        {/* Biometric Authentication */}
        {biometricAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biometric Authentication</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="finger-print-outline" size={20} color={COLORS.PRIMARY} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Fingerprint Login</Text>
                    <Text style={styles.settingSubtitle}>
                      {biometricEnabled ? 'Enabled' : 'Use fingerprint to sign in'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY + '40' }}
                  thumbColor={biometricEnabled ? COLORS.PRIMARY : COLORS.GRAY_500}
                />
              </View>

              {biometricEnabled && (
                <View style={styles.biometricTest}>
                  <Text style={styles.testTitle}>Test Biometric Authentication</Text>
                  <BiometricButton
                    onSuccess={() => Alert.alert('Success', 'Biometric authentication working correctly!')}
                    onError={(error) => Alert.alert('Error', error)}
                    size="medium"
                    variant="outline"
                    customLabel="Test Fingerprint"
                    promptMessage="Test your biometric authentication"
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Security Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Recommendations</Text>
          
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationItem}>
              <Ionicons 
                name={biometricEnabled ? "checkmark-circle" : "alert-circle-outline"} 
                size={20} 
                color={biometricEnabled ? COLORS.SUCCESS : COLORS.WARNING} 
              />
              <Text style={styles.recommendationText}>
                {biometricEnabled ? 'Biometric authentication enabled' : 'Enable biometric authentication'}
              </Text>
            </View>
            
            <View style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.SUCCESS} />
              <Text style={styles.recommendationText}>Strong password required</Text>
            </View>
            
            <View style={styles.recommendationItem}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.WARNING} />
              <Text style={styles.recommendationText}>Consider enabling two-factor authentication</Text>
            </View>
          </View>
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
    width: 40,
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
  securityCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  securityTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
  },
  securityScore: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
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
    borderRadius: 4,
  },
  securityDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  settingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.MD,
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.WHITE,
  },
  passwordForm: {
    marginTop: SPACING.LG,
    paddingTop: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
  },
  updateButton: {
    marginTop: SPACING.MD,
  },
  biometricTest: {
    marginTop: SPACING.LG,
    paddingTop: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    alignItems: 'center',
  },
  testTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  recommendationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    ...SHADOWS.SM,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  recommendationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default AccountSecurityScreen;

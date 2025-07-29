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
  SHADOWS
} from '../../constants';
import { useBiometric } from '../../hooks';
import { BiometricButton, SafeAreaScreen } from '../../components';

interface BiometricSetupScreenProps {
  route?: {
    params?: {
      skipable?: boolean;
      onComplete?: () => void;
    };
  };
}

const BiometricSetupScreen: React.FC<BiometricSetupScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const {
    isAvailable,
    isEnrolled,
    isEnabled,
    primaryType,
    isLoading,
    enableBiometric,
    getBiometricTypeName,
    getBiometricIcon,
  } = useBiometric();

  const skipable = route?.params?.skipable ?? true;
  const onComplete = route?.params?.onComplete;

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Handle biometric setup
  const handleEnableBiometric = async () => {
    try {
      const success = await enableBiometric();
      if (success) {
        if (onComplete) {
          onComplete();
        } else {
          navigation.navigate('Main' as never);
        }
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
    }
  };

  // Handle skip biometric setup
  const handleSkip = () => {
    Alert.alert(
      'Skip Biometric Setup?',
      'You can enable biometric authentication later in your profile settings for added security.',
      [
        {
          text: 'Set Up Now',
          style: 'default',
        },
        {
          text: 'Skip for Now',
          style: 'destructive',
          onPress: () => {
            if (onComplete) {
              onComplete();
            } else {
              navigation.navigate('Main' as never);
            }
          },
        },
      ]
    );
  };

  // Handle biometric authentication success (for testing)
  const handleBiometricSuccess = () => {
    Alert.alert(
      'Authentication Successful',
      'Biometric authentication is working correctly!',
      [{ text: 'Great!', style: 'default' }]
    );
  };

  // Handle biometric authentication error
  const handleBiometricError = (error: string) => {
    console.log('Biometric authentication failed:', error);
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

  // Render different states
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking biometric availability...</Text>
        </View>
      );
    }

    if (!isAvailable) {
      return (
        <View style={styles.unavailableContainer}>
          <Ionicons name="shield-outline" size={80} color={COLORS.GRAY_400} />
          <Text style={styles.unavailableTitle}>Biometric Authentication Unavailable</Text>
          <Text style={styles.unavailableText}>
            Your device doesn't support biometric authentication or it's not available.
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (onComplete) {
                onComplete();
              } else {
                navigation.navigate('Main' as never);
              }
            }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!isEnrolled) {
      return (
        <View style={styles.notEnrolledContainer}>
          <Ionicons name="finger-print-outline" size={80} color={COLORS.WARNING} />
          <Text style={styles.notEnrolledTitle}>No Biometric Credentials Found</Text>
          <Text style={styles.notEnrolledText}>
            Please set up {getBiometricTypeName().toLowerCase()} authentication in your device settings first.
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              Alert.alert(
                'Device Settings',
                'Please go to your device settings to set up biometric authentication, then return to this screen.',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
          {skipable && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (isEnabled) {
      return (
        <View style={styles.enabledContainer}>
          <Ionicons name="shield-checkmark" size={80} color={COLORS.SUCCESS} />
          <Text style={styles.enabledTitle}>Biometric Authentication Enabled</Text>
          <Text style={styles.enabledText}>
            Your account is secured with {getBiometricTypeName().toLowerCase()} authentication.
          </Text>
          
          {/* Test Biometric Button */}
          <View style={styles.testContainer}>
            <Text style={styles.testTitle}>Test Your Biometric Authentication</Text>
            <BiometricButton
              onSuccess={handleBiometricSuccess}
              onError={handleBiometricError}
              size="large"
              variant="outline"
              style={styles.testBiometricButton}
              promptMessage="Test your biometric authentication"
            />
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (onComplete) {
                onComplete();
              } else {
                navigation.navigate('Main' as never);
              }
            }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Available and enrolled but not enabled
    return (
      <View style={styles.setupContainer}>
        <Ionicons 
          name={getBiometricIcon() as any} 
          size={80} 
          color={COLORS.PRIMARY} 
        />
        <Text style={styles.setupTitle}>Secure Your Account</Text>
        <Text style={styles.setupSubtitle}>
          Enable {getBiometricTypeName().toLowerCase()} authentication for quick and secure access to your account.
        </Text>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits:</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.benefitText}>Quick and secure login</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.benefitText}>No need to remember passwords</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.benefitText}>Enhanced account security</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleEnableBiometric}
        >
          <View style={styles.enableButtonContent}>
            <Ionicons 
              name={getBiometricIcon() as any} 
              size={20} 
              color={COLORS.WHITE} 
            />
            <Text style={styles.enableButtonText}>
              Enable {getBiometricTypeName()}
            </Text>
          </View>
        </TouchableOpacity>

        {skipable && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        </View>

        {renderContent()}
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
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  unavailableTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  unavailableText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
    marginBottom: SPACING.XL,
  },
  notEnrolledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  notEnrolledTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  notEnrolledText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
    marginBottom: SPACING.XL,
  },
  enabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  enabledTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  enabledText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
    marginBottom: SPACING.XL,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  setupTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  setupSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED * TYPOGRAPHY.FONT_SIZES.BASE,
    marginBottom: SPACING.XL,
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    marginBottom: SPACING.XL,
  },
  benefitsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SM,
    flex: 1,
  },
  testContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  testTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  testBiometricButton: {
    marginTop: SPACING.SM,
  },
  enableButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    alignSelf: 'stretch',
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
  },
  enableButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enableButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: '600' as const,
    marginLeft: SPACING.SM,
  },
  continueButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    alignSelf: 'stretch',
    ...SHADOWS.MD,
  },
  continueButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: '600' as const,
  },
  settingsButton: {
    backgroundColor: COLORS.WARNING,
    borderRadius: 12,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    alignSelf: 'stretch',
    marginBottom: SPACING.MD,
    ...SHADOWS.SM,
  },
  settingsButtonText: {
    color: COLORS.WHITE,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: '600' as const,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.GRAY_300,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    alignSelf: 'stretch',
  },
  skipButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: '500' as const,
  },
});

export default BiometricSetupScreen;

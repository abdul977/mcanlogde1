/**
 * Enhanced Authentication Navigator
 *
 * This navigator handles the authentication flow with improved navigation,
 * deep linking support, and accessibility features.
 */

import React from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { Platform } from 'react-native';

import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { AuthStackParamList } from './types';

// Import actual screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileCompletionScreen from '../screens/auth/ProfileCompletionScreen';
import BiometricSetupScreen from '../screens/auth/BiometricSetupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  console.log('🔐 AuthNavigator rendering...');

  // Simplified screen options without accessibility for debugging
  const getScreenOptions = (): StackNavigationOptions => ({
    headerStyle: {
      backgroundColor: COLORS.PRIMARY,
      elevation: 0,
      shadowOpacity: 0,
      height: Platform.OS === 'ios' ? 100 : 80,
    },
    headerTitleStyle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.LG,
      fontWeight: '600' as const,
      color: COLORS.WHITE,
    },
    headerTintColor: COLORS.WHITE,
    headerBackTitleVisible: false,
    headerBackAccessibilityLabel: 'Go back',
    gestureEnabled: true,
    gestureResponseDistance: 50, // Changed from object to number for React Navigation 6 compatibility
    cardStyle: {
      backgroundColor: COLORS.BACKGROUND,
    },
    animationEnabled: true,
  });

  console.log('🔐 AuthNavigator screen options created');

  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={getScreenOptions()}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Welcome Back',
          headerShown: false, // Custom header in component for better design control
          gestureEnabled: false, // Prevent swipe back from login screen
        }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerShown: false, // Custom header in component
          gestureEnabled: true,
          headerBackAccessibilityLabel: 'Back to login',
        }}
      />
      <AuthStack.Screen
        name="ProfileCompletion"
        component={ProfileCompletionScreen}
        options={{
          title: 'Complete Profile',
          headerShown: false, // Custom header in component
          gestureEnabled: false, // Prevent going back during profile completion
        }}
      />
      <AuthStack.Screen
        name="BiometricSetup"
        component={BiometricSetupScreen}
        options={{
          title: 'Biometric Setup',
          headerShown: false, // Custom header in component
          gestureEnabled: true,
          headerBackAccessibilityLabel: 'Skip biometric setup',
        }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: false, // Using custom header in enhanced component
          gestureEnabled: true,
          headerBackAccessibilityLabel: 'Back to login',
        }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;

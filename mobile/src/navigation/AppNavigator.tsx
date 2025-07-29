import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { COLORS } from '../constants';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ModalNavigator from './ModalNavigator';
import LoadingScreen from '../components/ui/LoadingScreen';

// Create the root stack navigator
const RootStack = createStackNavigator<RootStackParamList>();

// Navigation theme with proper React Navigation structure
export const navigationTheme = {
  dark: false,
  colors: {
    primary: COLORS.PRIMARY,
    background: COLORS.BACKGROUND,
    card: COLORS.WHITE,
    text: COLORS.TEXT_PRIMARY,
    border: COLORS.GRAY_200,
    notification: COLORS.ERROR,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900' as const,
    },
  },
};

interface AppNavigatorProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({
  isAuthenticated,
  isLoading,
}) => {
  // Debug logging
  console.log('🧭 AppNavigator - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  // Show loading screen while checking authentication
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'default',
      }}
    >
      {isAuthenticated ? (
        // Authenticated user screens
        <>
          <RootStack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
          <RootStack.Group
            screenOptions={{
              presentation: 'modal',
              headerShown: false,
            }}
          >
            <RootStack.Screen name="Modal" component={ModalNavigator} />
          </RootStack.Group>
        </>
      ) : (
        // Unauthenticated user screens
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator;

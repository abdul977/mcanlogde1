import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';

import { ErrorBoundary } from './src/components';
import { AuthProvider, CartProvider, SearchProvider, ThemeProvider, MessagingProvider, SocketProvider, useAuth } from './src/context';
import { AppNavigator, navigationTheme } from './src/navigation';
import { navigationService } from './src/services/navigation/NavigationService';
import { accessibilityService } from './src/services/accessibility/AccessibilityService';
import { RootStackParamList } from './src/navigation/types';

// Main app component with navigation
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        // Initialize accessibility service
        await accessibilityService.initialize();

        // Set navigation reference for programmatic navigation
        navigationService.setNavigationRef(navigationRef);
      } catch (error) {
        console.error('Service initialization error:', error);
      }
    };

    initializeServices();
  }, []);

  useEffect(() => {
    // Hide splash screen when app is ready
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors if splash screen is already hidden
      });
    }
  }, [isLoading]);

  // Deep linking configuration
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: navigationService.getDeepLinkConfig(),
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        linking={linking}
        onReady={() => {
          // Navigation is ready
          console.log('Navigation ready');
        }}
        onStateChange={(state) => {
          // Track navigation state changes
          console.log('Navigation state changed:', state);
        }}
      >
        <AppNavigator isAuthenticated={isAuthenticated} isLoading={isLoading} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  useEffect(() => {
    // Prepare the splash screen
    SplashScreen.preventAutoHideAsync();

    // Configure LogBox to ignore specific warnings
    LogBox.ignoreLogs([
      // 'Text strings must be rendered within a <Text> component', // Temporarily enabled to debug
      // 'Warning: Text strings must be rendered within a <Text> component', // Temporarily enabled to debug
      'Console Error',
      'Warning: Stack:',
      'Warning: TypeError:',
      'ERROR  Warning:',
      'ERROR  💀 FATAL:',
      'GROUP    🚨 FATAL ERROR',
      'Request failed with status code 404',
      'Community not found',
      'Network Error',
      'AxiosError',
      'Error loading',
    ]);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <MessagingProvider>
              <CartProvider>
                <SearchProvider>
                  <AppContent />
                </SearchProvider>
              </CartProvider>
            </MessagingProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}



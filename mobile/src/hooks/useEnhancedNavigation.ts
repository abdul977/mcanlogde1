/**
 * Enhanced Navigation Hook
 * 
 * This hook provides enhanced navigation capabilities with accessibility
 * announcements, navigation tracking, and deep linking support.
 */

import { useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { navigationService } from '../services/navigation/NavigationService';
import { useAnnouncements } from './useAccessibility';

// Navigation hook return type
interface UseEnhancedNavigationReturn {
  // Basic navigation
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  reset: (screen: string, params?: any) => void;
  
  // Stack navigation
  push: (screen: string, params?: any) => void;
  pop: (count?: number) => void;
  
  // Tab navigation
  navigateToTab: (tabName: string, params?: any) => void;
  
  // Modal navigation
  openModal: (modalName: string, params?: any) => void;
  closeModal: () => void;
  
  // Utility functions
  getCurrentRoute: () => string | null;
  canGoBack: () => boolean;
  getNavigationState: () => any;
  
  // Deep linking
  handleDeepLink: (url: string) => boolean;
}

export const useEnhancedNavigation = (): UseEnhancedNavigationReturn => {
  const navigation = useNavigation();
  const route = useRoute();
  const { announceNavigation } = useAnnouncements();

  // Basic navigation with accessibility announcements
  const navigate = useCallback((screen: string, params?: any) => {
    navigationService.navigate(screen, params);
  }, []);

  const goBack = useCallback(() => {
    navigationService.goBack();
  }, []);

  const reset = useCallback((screen: string, params?: any) => {
    navigationService.reset(screen, params);
  }, []);

  // Stack navigation
  const push = useCallback((screen: string, params?: any) => {
    navigationService.push(screen, params);
  }, []);

  const pop = useCallback((count?: number) => {
    navigationService.pop(count);
  }, []);

  // Tab navigation
  const navigateToTab = useCallback((tabName: string, params?: any) => {
    navigationService.navigateToTab(tabName, params);
  }, []);

  // Modal navigation
  const openModal = useCallback((modalName: string, params?: any) => {
    navigationService.openModal(modalName, params);
  }, []);

  const closeModal = useCallback(() => {
    navigationService.closeModal();
  }, []);

  // Utility functions
  const getCurrentRoute = useCallback(() => {
    return navigationService.getCurrentRouteName();
  }, []);

  const canGoBack = useCallback(() => {
    return navigation.canGoBack();
  }, [navigation]);

  const getNavigationState = useCallback(() => {
    return navigationService.getNavigationState();
  }, []);

  // Deep linking
  const handleDeepLink = useCallback((url: string) => {
    return navigationService.handleDeepLink(url);
  }, []);

  return {
    navigate,
    goBack,
    reset,
    push,
    pop,
    navigateToTab,
    openModal,
    closeModal,
    getCurrentRoute,
    canGoBack,
    getNavigationState,
    handleDeepLink,
  };
};

// Hook for screen focus tracking with accessibility announcements
export const useScreenFocus = (screenName?: string) => {
  const route = useRoute();
  const { announceNavigation } = useAnnouncements();

  useFocusEffect(
    useCallback(() => {
      const currentScreenName = screenName || route.name;
      announceNavigation(currentScreenName);
    }, [screenName, route.name, announceNavigation])
  );
};

// Hook for navigation state tracking
export const useNavigationState = () => {
  const navigation = useNavigation();
  
  const getNavigationState = useCallback(() => {
    return navigation.getState();
  }, [navigation]);

  const getCurrentRoute = useCallback(() => {
    const state = navigation.getState();
    if (!state) return null;
    
    const route = state.routes[state.index];
    return route?.name || null;
  }, [navigation]);

  const getRouteParams = useCallback(() => {
    const state = navigation.getState();
    if (!state) return null;
    
    const route = state.routes[state.index];
    return route?.params || null;
  }, [navigation]);

  return {
    getNavigationState,
    getCurrentRoute,
    getRouteParams,
  };
};

// Hook for deep link handling
export const useDeepLinking = () => {
  const { navigate } = useEnhancedNavigation();

  const handleDeepLink = useCallback((url: string) => {
    try {
      // Parse the URL
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Convert search params to object
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Handle different deep link patterns
      if (path.startsWith('/auth/')) {
        const authScreen = path.replace('/auth/', '');
        navigate(authScreen, params);
        return true;
      }

      if (path.startsWith('/accommodations/')) {
        const accommodationId = path.replace('/accommodations/', '');
        navigate('AccommodationDetails', { id: accommodationId, ...params });
        return true;
      }

      if (path.startsWith('/products/')) {
        const productId = path.replace('/products/', '');
        navigate('ProductDetails', { id: productId, ...params });
        return true;
      }

      if (path.startsWith('/events/')) {
        const eventId = path.replace('/events/', '');
        navigate('EventDetails', { id: eventId, ...params });
        return true;
      }

      // Default navigation
      const screenName = path.replace('/', '') || 'Home';
      navigate(screenName, params);
      return true;
    } catch (error) {
      console.error('Deep link parsing error:', error);
      return false;
    }
  }, [navigate]);

  return {
    handleDeepLink,
  };
};

// Hook for navigation guards (authentication, permissions, etc.)
export const useNavigationGuards = () => {
  const { navigate, reset } = useEnhancedNavigation();

  const requireAuth = useCallback((callback: () => void, redirectTo: string = 'Login') => {
    // This would check authentication status
    // For now, it's a placeholder implementation
    const isAuthenticated = true; // Replace with actual auth check
    
    if (isAuthenticated) {
      callback();
    } else {
      navigate(redirectTo);
    }
  }, [navigate]);

  const requirePermission = useCallback((
    permission: string,
    callback: () => void,
    redirectTo: string = 'Home'
  ) => {
    // This would check user permissions
    // For now, it's a placeholder implementation
    const hasPermission = true; // Replace with actual permission check
    
    if (hasPermission) {
      callback();
    } else {
      navigate(redirectTo);
    }
  }, [navigate]);

  const requireOnboarding = useCallback((callback: () => void) => {
    // This would check if user has completed onboarding
    // For now, it's a placeholder implementation
    const hasCompletedOnboarding = true; // Replace with actual check
    
    if (hasCompletedOnboarding) {
      callback();
    } else {
      reset('Onboarding');
    }
  }, [reset]);

  return {
    requireAuth,
    requirePermission,
    requireOnboarding,
  };
};

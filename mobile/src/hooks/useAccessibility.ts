/**
 * Accessibility Hook
 * 
 * This hook provides easy access to accessibility functionality
 * with state management and real-time updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';

import {
  accessibilityService,
  AccessibilityPreferences,
  AnnouncementType,
  FocusTarget,
} from '../services/accessibility/AccessibilityService';

// Hook state interface
interface UseAccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredFontScale: number;
  isVoiceOverEnabled: boolean;
  isTalkBackEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

// Hook actions interface
interface UseAccessibilityActions {
  announce: (message: string, type?: AnnouncementType) => void;
  setFocus: (target: FocusTarget) => void;
  getAccessibilityProps: (config: any) => any;
  getHighContrastColors: () => any;
  getAnimationDuration: (baseDuration: number) => number;
  getAdjustedFontSize: (baseFontSize: number) => number;
  shouldBeFocusable: (element: any) => boolean;
  getSemanticRole: (elementType: string) => string;
  refresh: () => Promise<void>;
  clearError: () => void;
}

// Hook return type
type UseAccessibilityReturn = UseAccessibilityState & UseAccessibilityActions;

export const useAccessibility = (): UseAccessibilityReturn => {
  // State
  const [state, setState] = useState<UseAccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    preferredFontScale: 1,
    isVoiceOverEnabled: false,
    isTalkBackEnabled: false,
    isLoading: true,
    error: null,
  });

  // Initialize accessibility service
  const initializeAccessibility = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Initialize service
      await accessibilityService.initialize();

      // Get current preferences
      const preferences = accessibilityService.getPreferences();
      
      if (preferences) {
        setState(prev => ({
          ...prev,
          isScreenReaderEnabled: preferences.isScreenReaderEnabled,
          isReduceMotionEnabled: preferences.isReduceMotionEnabled,
          isHighContrastEnabled: preferences.isHighContrastEnabled,
          preferredFontScale: preferences.preferredFontScale,
          isVoiceOverEnabled: preferences.isVoiceOverEnabled,
          isTalkBackEnabled: preferences.isTalkBackEnabled,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load accessibility preferences',
        }));
      }
    } catch (error) {
      console.error('Error initializing accessibility:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize accessibility features',
      }));
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAccessibility();

    // Setup listeners for accessibility changes
    const listeners: Array<() => void> = [];

    // Screen reader change listener
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled: boolean) => {
        setState(prev => ({
          ...prev,
          isScreenReaderEnabled: isEnabled,
          isVoiceOverEnabled: isEnabled, // Simplified for this example
          isTalkBackEnabled: isEnabled,
        }));
      }
    );

    // Reduce motion change listener
    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        setState(prev => ({
          ...prev,
          isReduceMotionEnabled: isEnabled,
        }));
      }
    );

    listeners.push(() => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    });

    // Cleanup on unmount
    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, []); // Remove initializeAccessibility dependency since it's memoized with useCallback

  // Announce message
  const announce = useCallback((message: string, type: AnnouncementType = AnnouncementType.POLITE) => {
    accessibilityService.announce(message, type);
  }, []);

  // Set focus
  const setFocus = useCallback((target: FocusTarget) => {
    accessibilityService.setFocus(target);
  }, []);

  // Get accessibility props
  const getAccessibilityProps = useCallback((config: any) => {
    return accessibilityService.getAccessibilityProps(config);
  }, []);

  // Get high contrast colors
  const getHighContrastColors = useCallback(() => {
    return accessibilityService.getHighContrastColors();
  }, []);

  // Get animation duration
  const getAnimationDuration = useCallback((baseDuration: number) => {
    return accessibilityService.getAnimationDuration(baseDuration);
  }, []);

  // Get adjusted font size
  const getAdjustedFontSize = useCallback((baseFontSize: number) => {
    return accessibilityService.getAdjustedFontSize(baseFontSize);
  }, []);

  // Should be focusable
  const shouldBeFocusable = useCallback((element: any) => {
    return accessibilityService.shouldBeFocusable(element);
  }, []);

  // Get semantic role
  const getSemanticRole = useCallback((elementType: string) => {
    return accessibilityService.getSemanticRole(elementType);
  }, []);

  // Refresh accessibility state
  const refresh = useCallback(async () => {
    await initializeAccessibility();
  }, [initializeAccessibility]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    ...state,

    // Actions
    announce,
    setFocus,
    getAccessibilityProps,
    getHighContrastColors,
    getAnimationDuration,
    getAdjustedFontSize,
    shouldBeFocusable,
    getSemanticRole,
    refresh,
    clearError,
  };
};

// Helper hook for focus management
export const useFocusManagement = () => {
  const focusRef = useRef<any>(null);
  const { setFocus } = useAccessibility();

  const focusElement = useCallback((delay?: number) => {
    if (focusRef.current) {
      setFocus({ ref: focusRef, delay });
    }
  }, [setFocus]);

  const createFocusTarget = useCallback((ref: React.RefObject<any>, delay?: number): FocusTarget => {
    return { ref, delay };
  }, []);

  return {
    focusRef,
    focusElement,
    createFocusTarget,
    setFocus,
  };
};

// Helper hook for announcements
export const useAnnouncements = () => {
  const { announce } = useAccessibility();

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, AnnouncementType.POLITE);
  }, [announce]);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, AnnouncementType.ASSERTIVE);
  }, [announce]);

  const announceWarning = useCallback((message: string) => {
    announce(`Warning: ${message}`, AnnouncementType.POLITE);
  }, [announce]);

  const announceInfo = useCallback((message: string) => {
    announce(message, AnnouncementType.POLITE);
  }, [announce]);

  const announceNavigation = useCallback((screenName: string) => {
    announce(`Navigated to ${screenName}`, AnnouncementType.POLITE);
  }, [announce]);

  return {
    announce,
    announceSuccess,
    announceError,
    announceWarning,
    announceInfo,
    announceNavigation,
  };
};

// Helper hook for high contrast support
export const useHighContrast = () => {
  const { isHighContrastEnabled, getHighContrastColors } = useAccessibility();

  const getContrastAwareColors = useCallback((normalColors: any) => {
    if (isHighContrastEnabled) {
      const highContrastColors = getHighContrastColors();
      return highContrastColors || normalColors;
    }
    return normalColors;
  }, [isHighContrastEnabled, getHighContrastColors]);

  return {
    isHighContrastEnabled,
    getContrastAwareColors,
    getHighContrastColors,
  };
};

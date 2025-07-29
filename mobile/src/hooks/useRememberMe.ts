/**
 * Remember Me Hook
 * 
 * This hook provides remember me functionality with secure credential storage
 * and automatic login capabilities.
 */

import { useState, useEffect, useCallback } from 'react';
import { secureStorageService, UserSession, RememberMeCredentials, AutoLoginSettings } from '../services/storage/SecureStorageService';

// Hook state interface
interface UseRememberMeState {
  isRememberMeEnabled: boolean;
  isAutoLoginEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  lastRememberedEmail: string | null;
}

// Hook actions interface
interface UseRememberMeActions {
  enableRememberMe: (email: string, biometricEnabled?: boolean) => Promise<void>;
  disableRememberMe: () => Promise<void>;
  getRememberedCredentials: () => Promise<RememberMeCredentials | null>;
  enableAutoLogin: (settings?: Partial<AutoLoginSettings>) => Promise<void>;
  disableAutoLogin: () => Promise<void>;
  checkAutoLoginAvailability: () => Promise<boolean>;
  updateLastActivity: () => Promise<void>;
  clearError: () => void;
}

// Hook return type
type UseRememberMeReturn = UseRememberMeState & UseRememberMeActions;

export const useRememberMe = (): UseRememberMeReturn => {
  // State
  const [state, setState] = useState<UseRememberMeState>({
    isRememberMeEnabled: false,
    isAutoLoginEnabled: false,
    isLoading: true,
    error: null,
    lastRememberedEmail: null,
  });

  // Initialize remember me state
  const initializeRememberMe = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check remember me status
      const isRememberMeEnabled = await secureStorageService.isRememberMeEnabled();
      const credentials = await secureStorageService.getRememberMeCredentials();
      const autoLoginSettings = await secureStorageService.getAutoLoginSettings();

      setState(prev => ({
        ...prev,
        isRememberMeEnabled,
        isAutoLoginEnabled: autoLoginSettings.enabled,
        lastRememberedEmail: credentials?.email || null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error initializing remember me:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize remember me functionality',
      }));
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeRememberMe();
  }, [initializeRememberMe]);

  // Enable remember me
  const enableRememberMe = useCallback(async (email: string, biometricEnabled: boolean = false) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const credentials: RememberMeCredentials = {
        email,
        biometricEnabled,
        lastUsedAt: Date.now(),
      };

      await secureStorageService.storeRememberMeCredentials(credentials);

      setState(prev => ({
        ...prev,
        isRememberMeEnabled: true,
        lastRememberedEmail: email,
      }));
    } catch (error) {
      console.error('Error enabling remember me:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to enable remember me',
      }));
      throw error;
    }
  }, []);

  // Disable remember me
  const disableRememberMe = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      await secureStorageService.clearRememberMeCredentials();

      setState(prev => ({
        ...prev,
        isRememberMeEnabled: false,
        lastRememberedEmail: null,
      }));
    } catch (error) {
      console.error('Error disabling remember me:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to disable remember me',
      }));
      throw error;
    }
  }, []);

  // Get remembered credentials
  const getRememberedCredentials = useCallback(async (): Promise<RememberMeCredentials | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await secureStorageService.getRememberMeCredentials();
    } catch (error) {
      console.error('Error getting remembered credentials:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to retrieve remembered credentials',
      }));
      return null;
    }
  }, []);

  // Enable auto-login
  const enableAutoLogin = useCallback(async (settings: Partial<AutoLoginSettings> = {}) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const defaultSettings: AutoLoginSettings = {
        enabled: true,
        biometricRequired: false,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxInactivityTime: 30 * 60 * 1000, // 30 minutes
        ...settings,
      };

      await secureStorageService.storeAutoLoginSettings(defaultSettings);

      setState(prev => ({
        ...prev,
        isAutoLoginEnabled: true,
      }));
    } catch (error) {
      console.error('Error enabling auto-login:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to enable auto-login',
      }));
      throw error;
    }
  }, []);

  // Disable auto-login
  const disableAutoLogin = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const settings: AutoLoginSettings = {
        enabled: false,
        biometricRequired: false,
        sessionTimeout: 24 * 60 * 60 * 1000,
        maxInactivityTime: 30 * 60 * 1000,
      };

      await secureStorageService.storeAutoLoginSettings(settings);

      setState(prev => ({
        ...prev,
        isAutoLoginEnabled: false,
      }));
    } catch (error) {
      console.error('Error disabling auto-login:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to disable auto-login',
      }));
      throw error;
    }
  }, []);

  // Check auto-login availability
  const checkAutoLoginAvailability = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await secureStorageService.isAutoLoginAvailable();
    } catch (error) {
      console.error('Error checking auto-login availability:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to check auto-login availability',
      }));
      return false;
    }
  }, []);

  // Update last activity
  const updateLastActivity = useCallback(async () => {
    try {
      await secureStorageService.updateLastActivity();
    } catch (error) {
      console.error('Error updating last activity:', error);
      // Don't set error state for this as it's a background operation
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    ...state,

    // Actions
    enableRememberMe,
    disableRememberMe,
    getRememberedCredentials,
    enableAutoLogin,
    disableAutoLogin,
    checkAutoLoginAvailability,
    updateLastActivity,
    clearError,
  };
};

// Helper hook for auto-login functionality
export const useAutoLogin = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { checkAutoLoginAvailability, updateLastActivity } = useRememberMe();

  const attemptAutoLogin = useCallback(async (): Promise<boolean> => {
    if (isChecking) return false;

    try {
      setIsChecking(true);
      const isAvailable = await checkAutoLoginAvailability();
      
      if (isAvailable) {
        await updateLastActivity();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Auto-login attempt failed:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, checkAutoLoginAvailability, updateLastActivity]);

  return {
    isChecking,
    attemptAutoLogin,
  };
};

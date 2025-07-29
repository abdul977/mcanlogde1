/**
 * Biometric Authentication Hook
 * 
 * This hook provides easy access to biometric authentication functionality
 * with state management and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import {
  biometricService,
  BiometricType,
  BiometricAuthResult,
  BiometricAvailability,
  BiometricSettings,
} from '../services/biometric/BiometricService';

// Hook state interface
interface UseBiometricState {
  isAvailable: boolean;
  isEnrolled: boolean;
  isEnabled: boolean;
  supportedTypes: BiometricType[];
  primaryType: BiometricType | null;
  securityLevel: 'none' | 'weak' | 'strong';
  isLoading: boolean;
  error: string | null;
}

// Hook actions interface
interface UseBiometricActions {
  authenticate: (options?: {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
    showAlert?: boolean;
  }) => Promise<BiometricAuthResult>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  checkAvailability: () => Promise<void>;
  clearError: () => void;
  getBiometricTypeName: (type?: BiometricType) => string;
  getBiometricIcon: (type?: BiometricType) => string;
}

// Hook return type
type UseBiometricReturn = UseBiometricState & UseBiometricActions;

export const useBiometric = (): UseBiometricReturn => {
  // State
  const [state, setState] = useState<UseBiometricState>({
    isAvailable: false,
    isEnrolled: false,
    isEnabled: false,
    supportedTypes: [],
    primaryType: null,
    securityLevel: 'none',
    isLoading: true,
    error: null,
  });

  // Initialize biometric service
  const initializeBiometric = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Initialize service
      await biometricService.initialize();

      // Get availability
      const availability = await biometricService.checkAvailability();
      const isEnabled = await biometricService.isBiometricEnabled();

      // Determine primary biometric type
      const primaryType = availability.supportedTypes.length > 0 
        ? availability.supportedTypes[0] 
        : null;

      setState(prev => ({
        ...prev,
        isAvailable: availability.isAvailable,
        isEnrolled: availability.isEnrolled,
        isEnabled,
        supportedTypes: availability.supportedTypes,
        primaryType,
        securityLevel: availability.securityLevel,
        isLoading: false,
        error: availability.error || null,
      }));
    } catch (error) {
      console.error('Error initializing biometric:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize biometric authentication',
      }));
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeBiometric();
  }, [initializeBiometric]);

  // Check availability
  const checkAvailability = useCallback(async () => {
    await initializeBiometric();
  }, [initializeBiometric]);

  // Authenticate with biometrics
  const authenticate = useCallback(async (options?: {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
    showAlert?: boolean;
  }): Promise<BiometricAuthResult> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      if (!state.isAvailable || !state.isEnrolled) {
        const error = 'Biometric authentication is not available';
        setState(prev => ({ ...prev, error }));
        
        if (options?.showAlert) {
          Alert.alert(
            'Biometric Authentication',
            'Biometric authentication is not available on this device or no biometric credentials are enrolled.',
            [{ text: 'OK' }]
          );
        }
        
        return { success: false, error };
      }

      const result = await biometricService.authenticate({
        promptMessage: options?.promptMessage,
        cancelLabel: options?.cancelLabel,
        fallbackLabel: options?.fallbackLabel,
      });

      if (!result.success && result.error) {
        setState(prev => ({ ...prev, error: result.error || null }));
        
        if (options?.showAlert && result.error !== 'User canceled authentication') {
          Alert.alert(
            'Authentication Failed',
            result.error,
            [{ text: 'OK' }]
          );
        }
      }

      return result;
    } catch (error) {
      const errorMessage = 'Authentication failed due to an unexpected error';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (options?.showAlert) {
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
      
      return { success: false, error: errorMessage };
    }
  }, [state.isAvailable, state.isEnrolled]);

  // Enable biometric authentication
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      if (!state.isAvailable || !state.isEnrolled) {
        const error = 'Biometric authentication is not available';
        setState(prev => ({ ...prev, error }));
        
        Alert.alert(
          'Biometric Authentication',
          'Biometric authentication is not available on this device or no biometric credentials are enrolled. Please set up biometric authentication in your device settings first.',
          [{ text: 'OK' }]
        );
        
        return false;
      }

      const result = await biometricService.enableBiometric();
      
      if (result.success) {
        setState(prev => ({ ...prev, isEnabled: true }));
        
        Alert.alert(
          'Success',
          'Biometric authentication has been enabled for your account.',
          [{ text: 'OK' }]
        );
        
        return true;
      } else {
        setState(prev => ({ ...prev, error: result.error || null }));
        
        if (result.error !== 'User canceled authentication') {
          Alert.alert(
            'Failed to Enable',
            result.error || 'Failed to enable biometric authentication',
            [{ text: 'OK' }]
          );
        }
        
        return false;
      }
    } catch (error) {
      const errorMessage = 'Failed to enable biometric authentication';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      return false;
    }
  }, [state.isAvailable, state.isEnrolled]);

  // Disable biometric authentication
  const disableBiometric = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      await biometricService.disableBiometric();
      setState(prev => ({ ...prev, isEnabled: false }));
      
      Alert.alert(
        'Disabled',
        'Biometric authentication has been disabled for your account.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = 'Failed to disable biometric authentication';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get biometric type name
  const getBiometricTypeName = useCallback((type?: BiometricType): string => {
    const targetType = type || state.primaryType;
    return targetType ? biometricService.getBiometricTypeName(targetType) : 'Biometric';
  }, [state.primaryType]);

  // Get biometric icon
  const getBiometricIcon = useCallback((type?: BiometricType): string => {
    const targetType = type || state.primaryType;
    return targetType ? biometricService.getBiometricIcon(targetType) : 'shield-checkmark';
  }, [state.primaryType]);

  return {
    // State
    ...state,
    
    // Actions
    authenticate,
    enableBiometric,
    disableBiometric,
    checkAvailability,
    clearError,
    getBiometricTypeName,
    getBiometricIcon,
  };
};

// Helper hook for quick biometric authentication check
export const useBiometricQuickAuth = () => {
  const { isAvailable, isEnrolled, isEnabled, authenticate } = useBiometric();
  
  const canUseBiometric = isAvailable && isEnrolled && isEnabled;
  
  const quickAuth = useCallback(async (promptMessage?: string): Promise<boolean> => {
    if (!canUseBiometric) return false;
    
    const result = await authenticate({
      promptMessage: promptMessage || 'Authenticate to continue',
      showAlert: false,
    });
    
    return result.success;
  }, [canUseBiometric, authenticate]);
  
  return {
    canUseBiometric,
    quickAuth,
  };
};

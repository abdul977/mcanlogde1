/**
 * Biometric Authentication Service
 * 
 * This service provides comprehensive biometric authentication functionality
 * including fingerprint and face recognition with secure fallback options.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '../../constants';

// Biometric authentication types
export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE_ID = 'faceId',
  FACE_RECOGNITION = 'faceRecognition',
  IRIS = 'iris',
  UNKNOWN = 'unknown',
}

// Authentication result interface
export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
  biometricType?: BiometricType;
}

// Biometric availability interface
export interface BiometricAvailability {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: BiometricType[];
  securityLevel: 'none' | 'weak' | 'strong';
  error?: string;
}

// Biometric settings interface
export interface BiometricSettings {
  enabled: boolean;
  preferredType?: BiometricType;
  fallbackToPassword: boolean;
  promptMessage: string;
  cancelLabel: string;
  fallbackLabel: string;
}

class BiometricAuthenticationService {
  private static instance: BiometricAuthenticationService;
  private isInitialized = false;
  private availability: BiometricAvailability | null = null;

  private constructor() {}

  public static getInstance(): BiometricAuthenticationService {
    if (!BiometricAuthenticationService.instance) {
      BiometricAuthenticationService.instance = new BiometricAuthenticationService();
    }
    return BiometricAuthenticationService.instance;
  }

  /**
   * Initialize the biometric service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.availability = await this.checkAvailability();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize biometric service:', error);
      this.availability = {
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        securityLevel: 'none',
        error: 'Initialization failed',
      };
    }
  }

  /**
   * Check biometric authentication availability
   */
  public async checkAvailability(): Promise<BiometricAvailability> {
    try {
      // Check if hardware is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return {
          isAvailable: false,
          isEnrolled: false,
          supportedTypes: [],
          securityLevel: 'none',
          error: 'Biometric hardware not available',
        };
      }

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return {
          isAvailable: true,
          isEnrolled: false,
          supportedTypes: [],
          securityLevel: 'none',
          error: 'No biometric credentials enrolled',
        };
      }

      // Get supported authentication types
      const supportedTypes = await this.getSupportedTypes();
      const securityLevel = await this.getSecurityLevel();

      return {
        isAvailable: true,
        isEnrolled: true,
        supportedTypes,
        securityLevel,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        securityLevel: 'none',
        error: 'Failed to check availability',
      };
    }
  }

  /**
   * Get supported biometric types
   */
  private async getSupportedTypes(): Promise<BiometricType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types.map(type => this.mapAuthenticationType(type));
    } catch (error) {
      console.error('Error getting supported types:', error);
      return [];
    }
  }

  /**
   * Map LocalAuthentication types to our BiometricType enum
   */
  private mapAuthenticationType(type: LocalAuthentication.AuthenticationType): BiometricType {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return BiometricType.FINGERPRINT;
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return BiometricType.FACE_RECOGNITION;
      case LocalAuthentication.AuthenticationType.IRIS:
        return BiometricType.IRIS;
      default:
        return BiometricType.UNKNOWN;
    }
  }

  /**
   * Get security level of biometric authentication
   */
  private async getSecurityLevel(): Promise<'none' | 'weak' | 'strong'> {
    try {
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      switch (securityLevel) {
        case LocalAuthentication.SecurityLevel.NONE:
          return 'none';
        case LocalAuthentication.SecurityLevel.SECRET:
          return 'weak';
        case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
          return 'weak';
        case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
          return 'strong';
        default:
          return 'none';
      }
    } catch (error) {
      console.error('Error getting security level:', error);
      return 'none';
    }
  }

  /**
   * Authenticate using biometrics
   */
  public async authenticate(options?: {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
    disableDeviceFallback?: boolean;
  }): Promise<BiometricAuthResult> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check availability
      if (!this.availability?.isAvailable || !this.availability?.isEnrolled) {
        return {
          success: false,
          error: this.availability?.error || 'Biometric authentication not available',
        };
      }

      // Prepare authentication options
      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: options?.promptMessage || 'Authenticate to access your account',
        cancelLabel: options?.cancelLabel || 'Cancel',
        fallbackLabel: options?.fallbackLabel || 'Use Password',
        disableDeviceFallback: options?.disableDeviceFallback || false,
      };

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        return {
          success: true,
          biometricType: this.getPrimaryBiometricType(),
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
          warning: result.warning,
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed due to an unexpected error',
      };
    }
  }

  /**
   * Get the primary biometric type available
   */
  private getPrimaryBiometricType(): BiometricType {
    if (!this.availability?.supportedTypes.length) {
      return BiometricType.UNKNOWN;
    }

    // Prioritize Face ID on iOS, then fingerprint
    if (Platform.OS === 'ios') {
      if (this.availability.supportedTypes.includes(BiometricType.FACE_ID)) {
        return BiometricType.FACE_ID;
      }
    }

    if (this.availability.supportedTypes.includes(BiometricType.FINGERPRINT)) {
      return BiometricType.FINGERPRINT;
    }

    if (this.availability.supportedTypes.includes(BiometricType.FACE_RECOGNITION)) {
      return BiometricType.FACE_RECOGNITION;
    }

    return this.availability.supportedTypes[0] || BiometricType.UNKNOWN;
  }

  /**
   * Get biometric settings from secure storage
   */
  public async getBiometricSettings(): Promise<BiometricSettings> {
    try {
      const settingsJson = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('Error getting biometric settings:', error);
    }

    // Return default settings
    return {
      enabled: false,
      fallbackToPassword: true,
      promptMessage: 'Authenticate to access your account',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Password',
    };
  }

  /**
   * Save biometric settings to secure storage
   */
  public async saveBiometricSettings(settings: BiometricSettings): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving biometric settings:', error);
      throw new Error('Failed to save biometric settings');
    }
  }

  /**
   * Enable biometric authentication
   */
  public async enableBiometric(): Promise<BiometricAuthResult> {
    try {
      // First authenticate to confirm user identity
      const authResult = await this.authenticate({
        promptMessage: 'Authenticate to enable biometric login',
      });

      if (authResult.success) {
        const settings = await this.getBiometricSettings();
        settings.enabled = true;
        settings.preferredType = authResult.biometricType;
        await this.saveBiometricSettings(settings);
      }

      return authResult;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return {
        success: false,
        error: 'Failed to enable biometric authentication',
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  public async disableBiometric(): Promise<void> {
    try {
      const settings = await this.getBiometricSettings();
      settings.enabled = false;
      await this.saveBiometricSettings(settings);
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw new Error('Failed to disable biometric authentication');
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  public async isBiometricEnabled(): Promise<boolean> {
    try {
      const settings = await this.getBiometricSettings();
      return settings.enabled && this.availability?.isAvailable && this.availability?.isEnrolled;
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Get current availability status
   */
  public getAvailability(): BiometricAvailability | null {
    return this.availability;
  }

  /**
   * Get user-friendly biometric type name
   */
  public getBiometricTypeName(type: BiometricType): string {
    switch (type) {
      case BiometricType.FINGERPRINT:
        return 'Fingerprint';
      case BiometricType.FACE_ID:
        return 'Face ID';
      case BiometricType.FACE_RECOGNITION:
        return 'Face Recognition';
      case BiometricType.IRIS:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  /**
   * Get appropriate icon name for biometric type
   */
  public getBiometricIcon(type: BiometricType): string {
    switch (type) {
      case BiometricType.FINGERPRINT:
        return 'finger-print';
      case BiometricType.FACE_ID:
      case BiometricType.FACE_RECOGNITION:
        return 'face-recognition';
      case BiometricType.IRIS:
        return 'eye';
      default:
        return 'shield-checkmark';
    }
  }
}

// Export singleton instance
export const biometricService = BiometricAuthenticationService.getInstance();

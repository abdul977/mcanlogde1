/**
 * Secure Storage Service
 * 
 * This service provides secure storage functionality for sensitive data
 * like authentication tokens, user credentials, and session information.
 */

import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../constants';

// Storage options interface
interface SecureStorageOptions {
  requireAuthentication?: boolean;
  accessGroup?: string;
  keychainService?: string;
}

// User session data interface
export interface UserSession {
  token: string;
  refreshToken?: string;
  userId: string;
  email: string;
  expiresAt: number;
  rememberMe: boolean;
  lastLoginAt: number;
}

// Remember me credentials interface
export interface RememberMeCredentials {
  email: string;
  hashedPassword?: string; // For security, we don't store plain passwords
  biometricEnabled: boolean;
  lastUsedAt: number;
}

// Auto-login settings interface
export interface AutoLoginSettings {
  enabled: boolean;
  biometricRequired: boolean;
  sessionTimeout: number; // in milliseconds
  maxInactivityTime: number; // in milliseconds
}

class SecureStorageService {
  private static instance: SecureStorageService;
  private defaultOptions: SecureStorageOptions = {
    requireAuthentication: false,
  };

  private constructor() {}

  public static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Store a value securely
   */
  private async setItem(key: string, value: string, options?: SecureStorageOptions): Promise<void> {
    try {
      const storeOptions = { ...this.defaultOptions, ...options };
      await SecureStore.setItemAsync(key, value, storeOptions);
    } catch (error) {
      console.error(`Error storing item with key ${key}:`, error);
      throw new Error(`Failed to store ${key}`);
    }
  }

  /**
   * Retrieve a value securely
   */
  private async getItem(key: string, options?: SecureStorageOptions): Promise<string | null> {
    try {
      const storeOptions = { ...this.defaultOptions, ...options };
      return await SecureStore.getItemAsync(key, storeOptions);
    } catch (error) {
      console.error(`Error retrieving item with key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value securely
   */
  private async removeItem(key: string, options?: SecureStorageOptions): Promise<void> {
    try {
      const storeOptions = { ...this.defaultOptions, ...options };
      await SecureStore.deleteItemAsync(key, storeOptions);
    } catch (error) {
      console.error(`Error removing item with key ${key}:`, error);
      throw new Error(`Failed to remove ${key}`);
    }
  }

  /**
   * Store user session data
   */
  public async storeUserSession(session: UserSession): Promise<void> {
    try {
      const sessionData = JSON.stringify(session);
      await this.setItem(STORAGE_KEYS.AUTH_TOKEN, session.token);
      await this.setItem(STORAGE_KEYS.USER_DATA, sessionData);
    } catch (error) {
      console.error('Error storing user session:', error);
      throw new Error('Failed to store user session');
    }
  }

  /**
   * Retrieve user session data
   */
  public async getUserSession(): Promise<UserSession | null> {
    try {
      const sessionData = await this.getItem(STORAGE_KEYS.USER_DATA);
      if (!sessionData) return null;

      const session: UserSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        await this.clearUserSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error retrieving user session:', error);
      return null;
    }
  }

  /**
   * Clear user session data
   */
  public async clearUserSession(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await this.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing user session:', error);
      throw new Error('Failed to clear user session');
    }
  }

  /**
   * Store remember me credentials
   */
  public async storeRememberMeCredentials(credentials: RememberMeCredentials): Promise<void> {
    try {
      const credentialsData = JSON.stringify(credentials);
      await this.setItem('mcan_lodge_remember_me', credentialsData, {
        requireAuthentication: true, // Require biometric/passcode to access
      });
    } catch (error) {
      console.error('Error storing remember me credentials:', error);
      throw new Error('Failed to store remember me credentials');
    }
  }

  /**
   * Retrieve remember me credentials
   */
  public async getRememberMeCredentials(): Promise<RememberMeCredentials | null> {
    try {
      const credentialsData = await this.getItem('mcan_lodge_remember_me', {
        requireAuthentication: true,
      });
      
      if (!credentialsData) return null;

      const credentials: RememberMeCredentials = JSON.parse(credentialsData);
      
      // Check if credentials are too old (e.g., 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (Date.now() - credentials.lastUsedAt > maxAge) {
        await this.clearRememberMeCredentials();
        return null;
      }

      return credentials;
    } catch (error) {
      console.error('Error retrieving remember me credentials:', error);
      return null;
    }
  }

  /**
   * Clear remember me credentials
   */
  public async clearRememberMeCredentials(): Promise<void> {
    try {
      await this.removeItem('mcan_lodge_remember_me');
    } catch (error) {
      console.error('Error clearing remember me credentials:', error);
      throw new Error('Failed to clear remember me credentials');
    }
  }

  /**
   * Store auto-login settings
   */
  public async storeAutoLoginSettings(settings: AutoLoginSettings): Promise<void> {
    try {
      const settingsData = JSON.stringify(settings);
      await this.setItem('mcan_lodge_auto_login_settings', settingsData);
    } catch (error) {
      console.error('Error storing auto-login settings:', error);
      throw new Error('Failed to store auto-login settings');
    }
  }

  /**
   * Retrieve auto-login settings
   */
  public async getAutoLoginSettings(): Promise<AutoLoginSettings> {
    try {
      const settingsData = await this.getItem('mcan_lodge_auto_login_settings');
      
      if (!settingsData) {
        // Return default settings
        return {
          enabled: false,
          biometricRequired: false,
          sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
          maxInactivityTime: 30 * 60 * 1000, // 30 minutes
        };
      }

      return JSON.parse(settingsData);
    } catch (error) {
      console.error('Error retrieving auto-login settings:', error);
      // Return default settings on error
      return {
        enabled: false,
        biometricRequired: false,
        sessionTimeout: 24 * 60 * 60 * 1000,
        maxInactivityTime: 30 * 60 * 1000,
      };
    }
  }

  /**
   * Update last activity timestamp
   */
  public async updateLastActivity(): Promise<void> {
    try {
      const session = await this.getUserSession();
      if (session) {
        session.lastLoginAt = Date.now();
        await this.storeUserSession(session);
      }
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }

  /**
   * Check if auto-login is available
   */
  public async isAutoLoginAvailable(): Promise<boolean> {
    try {
      const settings = await this.getAutoLoginSettings();
      const session = await this.getUserSession();
      
      if (!settings.enabled || !session) {
        return false;
      }

      // Check session timeout
      const now = Date.now();
      const sessionAge = now - session.lastLoginAt;
      const inactivityTime = now - session.lastLoginAt;

      if (sessionAge > settings.sessionTimeout || inactivityTime > settings.maxInactivityTime) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking auto-login availability:', error);
      return false;
    }
  }

  /**
   * Store authentication token
   */
  public async storeAuthToken(token: string): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve authentication token
   */
  public async getAuthToken(): Promise<string | null> {
    try {
      return await this.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  public async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        this.clearUserSession(),
        this.clearRememberMeCredentials(),
        this.removeItem('mcan_lodge_auto_login_settings'),
        this.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
        this.removeItem(STORAGE_KEYS.APP_SETTINGS),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  /**
   * Check if remember me is enabled
   */
  public async isRememberMeEnabled(): Promise<boolean> {
    try {
      const credentials = await this.getRememberMeCredentials();
      return credentials !== null;
    } catch (error) {
      console.error('Error checking remember me status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const secureStorageService = SecureStorageService.getInstance();

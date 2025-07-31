/**
 * Comprehensive User Registration Script for MCAN Lodge Mobile App
 * 
 * This script provides utilities for creating new users with proper validation,
 * backend integration, and error handling. It can be used for testing,
 * development, or administrative purposes.
 */

import { Alert } from 'react-native';
import { authService } from '../services/api/authService';
import { RegisterForm, User } from '../types';
import { NIGERIAN_STATES, NYSC_STREAMS, GENDER_OPTIONS } from '../constants';

// Validation utilities
export class UserRegistrationValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePhone(phone: string): boolean {
    // Nigerian phone number validation
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone);
  }

  static validateCallUpNumber(callUpNumber: string): boolean {
    // NYSC call-up number format: NYSC/2023/123456
    const callUpRegex = /^NYSC\/\d{4}\/\d{6}$/;
    return callUpRegex.test(callUpNumber);
  }

  static validateBatch(batch: string): boolean {
    // Batch format: 2023 Batch A, 2023 Batch B, etc.
    const batchRegex = /^\d{4} Batch [ABC]$/;
    return batchRegex.test(batch);
  }

  static validateStateCode(stateCode: string): boolean {
    return NIGERIAN_STATES.some(state => state.code === stateCode);
  }

  static validateStream(stream: string): boolean {
    return NYSC_STREAMS.includes(stream as 'A' | 'B' | 'C');
  }

  static validateGender(gender: string): boolean {
    return ['male', 'female'].includes(gender);
  }
}

// User registration data generator for testing
export class UserDataGenerator {
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateTestUser(overrides: Partial<RegisterForm> = {}): RegisterForm {
    const randomId = this.generateRandomString(6);
    const currentYear = new Date().getFullYear();
    const gender = this.getRandomElement(['male', 'female']);
    const state = this.getRandomElement(NIGERIAN_STATES);
    const stream = this.getRandomElement(NYSC_STREAMS);

    return {
      name: `Test User ${randomId}`,
      email: `testuser${randomId}@example.com`,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      phone: `0${this.getRandomElement(['701', '702', '703', '704', '705'])}${this.generateRandomString(7)}`,
      gender: gender as 'male' | 'female',
      stateCode: state.code,
      batch: `${currentYear} Batch ${stream}`,
      stream: stream as 'A' | 'B' | 'C',
      callUpNumber: `NYSC/${currentYear}/${Math.floor(Math.random() * 900000) + 100000}`,
      dateOfBirth: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${currentYear - Math.floor(Math.random() * 10) - 20}`,
      institution: `Test University ${randomId}`,
      course: `Test Course ${randomId}`,
      ...overrides
    };
  }

  static generateMultipleTestUsers(count: number, baseData: Partial<RegisterForm> = {}): RegisterForm[] {
    return Array.from({ length: count }, () => this.generateTestUser(baseData));
  }
}

// Main registration script class
export class UserRegistrationScript {
  private static async validateRegistrationData(userData: RegisterForm): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!UserRegistrationValidator.validateEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    const passwordValidation = UserRegistrationValidator.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    if (userData.password !== userData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Optional field validation
    if (userData.phone && !UserRegistrationValidator.validatePhone(userData.phone)) {
      errors.push('Invalid phone number format');
    }

    if (userData.gender && !UserRegistrationValidator.validateGender(userData.gender)) {
      errors.push('Invalid gender value');
    }

    if (userData.stateCode && !UserRegistrationValidator.validateStateCode(userData.stateCode)) {
      errors.push('Invalid state code');
    }

    if (userData.stream && !UserRegistrationValidator.validateStream(userData.stream)) {
      errors.push('Invalid stream value');
    }

    if (userData.callUpNumber && !UserRegistrationValidator.validateCallUpNumber(userData.callUpNumber)) {
      errors.push('Invalid call-up number format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Register a single user with comprehensive validation
   */
  static async registerUser(userData: RegisterForm): Promise<{ success: boolean; user?: User; errors?: string[] }> {
    try {
      // Validate data
      const validation = await this.validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Attempt registration
      const response = await authService.register(userData);
      
      if (response.success) {
        console.log('✅ User registered successfully:', userData.email);
        return {
          success: true,
          user: response.user
        };
      } else {
        return {
          success: false,
          errors: [response.message || 'Registration failed']
        };
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        errors: [error.message || 'Network error during registration']
      };
    }
  }

  /**
   * Register multiple users in batch
   */
  static async registerMultipleUsers(usersData: RegisterForm[]): Promise<{
    successful: number;
    failed: number;
    results: Array<{ email: string; success: boolean; errors?: string[] }>;
  }> {
    const results: Array<{ email: string; success: boolean; errors?: string[] }> = [];
    let successful = 0;
    let failed = 0;

    for (const userData of usersData) {
      const result = await this.registerUser(userData);
      
      if (result.success) {
        successful++;
        results.push({ email: userData.email, success: true });
      } else {
        failed++;
        results.push({ 
          email: userData.email, 
          success: false, 
          errors: result.errors 
        });
      }

      // Add delay between registrations to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { successful, failed, results };
  }

  /**
   * Interactive registration with user prompts
   */
  static async interactiveRegistration(): Promise<void> {
    Alert.alert(
      'User Registration',
      'Choose registration type:',
      [
        {
          text: 'Single User',
          onPress: () => this.promptSingleUserRegistration()
        },
        {
          text: 'Test Users',
          onPress: () => this.promptTestUsersRegistration()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  }

  private static promptSingleUserRegistration(): void {
    // This would typically open a form or prompt for user input
    Alert.alert(
      'Single User Registration',
      'This would open a registration form. For now, creating a test user...',
      [
        {
          text: 'Create Test User',
          onPress: async () => {
            const testUser = UserDataGenerator.generateTestUser();
            const result = await this.registerUser(testUser);
            
            if (result.success) {
              Alert.alert('Success', `User ${testUser.email} registered successfully!`);
            } else {
              Alert.alert('Error', `Registration failed: ${result.errors?.join(', ')}`);
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }

  private static promptTestUsersRegistration(): void {
    Alert.alert(
      'Test Users Registration',
      'How many test users would you like to create?',
      [
        {
          text: '5 Users',
          onPress: () => this.createTestUsers(5)
        },
        {
          text: '10 Users',
          onPress: () => this.createTestUsers(10)
        },
        {
          text: '20 Users',
          onPress: () => this.createTestUsers(20)
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }

  private static async createTestUsers(count: number): Promise<void> {
    const testUsers = UserDataGenerator.generateMultipleTestUsers(count);
    
    Alert.alert(
      'Creating Test Users',
      `Creating ${count} test users. This may take a few minutes...`,
      [{ text: 'OK' }]
    );

    const results = await this.registerMultipleUsers(testUsers);
    
    Alert.alert(
      'Registration Complete',
      `Successfully created: ${results.successful}\nFailed: ${results.failed}`,
      [{ text: 'OK' }]
    );
  }
}

// Export for use in other parts of the app
export default UserRegistrationScript;

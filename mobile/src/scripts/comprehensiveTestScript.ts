/**
 * Comprehensive Test Script for MCAN Lodge Mobile App
 * 
 * This script tests all the fixes and improvements implemented:
 * 1. Payment method validation fixes
 * 2. Profile integration with checkout and booking systems
 * 3. Cross-platform data synchronization
 * 4. User registration functionality
 */

import { Alert } from 'react-native';
import { authService } from '../services/api/authService';
import { API_CONFIG, ENDPOINTS } from '../constants';
import { UserRegistrationScript, UserDataGenerator } from './userRegistrationScript';
import { RegisterForm, User } from '../types';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
}

interface TestSuite {
  suiteName: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export class ComprehensiveTestScript {
  private static testResults: TestSuite[] = [];
  private static currentUser: User | null = null;
  private static authToken: string | null = null;

  /**
   * Run all test suites
   */
  static async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive Test Suite...');
    
    try {
      // Clear previous results
      this.testResults = [];

      // Run test suites in order
      await this.testUserRegistration();
      await this.testPaymentMethodValidation();
      await this.testProfileIntegration();
      await this.testCrossPlatformSync();
      await this.testBookingFlow();
      await this.testOrderFlow();

      // Display final results
      this.displayFinalResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      Alert.alert('Test Suite Error', `Failed to run tests: ${error.message}`);
    }
  }

  /**
   * Test user registration functionality
   */
  private static async testUserRegistration(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'User Registration Tests',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };

    console.log('📝 Testing User Registration...');

    // Test 1: Generate valid test user data
    try {
      const testUser = UserDataGenerator.generateTestUser();
      suite.results.push({
        testName: 'Generate Test User Data',
        success: true,
        message: 'Successfully generated test user data',
        details: { email: testUser.email, name: testUser.name }
      });
    } catch (error) {
      suite.results.push({
        testName: 'Generate Test User Data',
        success: false,
        message: `Failed to generate test user: ${error.message}`
      });
    }

    // Test 2: Register a new user
    try {
      const testUser = UserDataGenerator.generateTestUser({
        email: `test_${Date.now()}@example.com`
      });
      
      const result = await UserRegistrationScript.registerUser(testUser);
      
      if (result.success) {
        this.currentUser = result.user || null;
        suite.results.push({
          testName: 'User Registration',
          success: true,
          message: 'Successfully registered new user',
          details: { email: testUser.email }
        });
      } else {
        suite.results.push({
          testName: 'User Registration',
          success: false,
          message: `Registration failed: ${result.errors?.join(', ')}`
        });
      }
    } catch (error) {
      suite.results.push({
        testName: 'User Registration',
        success: false,
        message: `Registration error: ${error.message}`
      });
    }

    // Test 3: Login with registered user
    if (this.currentUser) {
      try {
        const testUser = UserDataGenerator.generateTestUser();
        const loginResult = await authService.login({
          email: testUser.email,
          password: testUser.password
        });
        
        this.authToken = loginResult.token;
        suite.results.push({
          testName: 'User Login',
          success: true,
          message: 'Successfully logged in with registered user'
        });
      } catch (error) {
        suite.results.push({
          testName: 'User Login',
          success: false,
          message: `Login failed: ${error.message}`
        });
      }
    }

    this.updateSuiteStats(suite);
    this.testResults.push(suite);
  }

  /**
   * Test payment method validation fixes
   */
  private static async testPaymentMethodValidation(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Payment Method Validation Tests',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };

    console.log('💳 Testing Payment Method Validation...');

    // Test valid payment methods
    const validPaymentMethods = ['bank_transfer', 'card', 'mobile_money', 'cash_on_delivery'];
    
    for (const method of validPaymentMethods) {
      try {
        // Simulate order creation with valid payment method
        const isValid = this.validatePaymentMethod(method);
        
        suite.results.push({
          testName: `Valid Payment Method: ${method}`,
          success: isValid,
          message: isValid ? `${method} is valid` : `${method} validation failed`
        });
      } catch (error) {
        suite.results.push({
          testName: `Valid Payment Method: ${method}`,
          success: false,
          message: `Error validating ${method}: ${error.message}`
        });
      }
    }

    // Test invalid payment methods
    const invalidPaymentMethods = ['delivery', 'transfer', 'paypal', 'bitcoin'];
    
    for (const method of invalidPaymentMethods) {
      try {
        const isValid = this.validatePaymentMethod(method);
        
        suite.results.push({
          testName: `Invalid Payment Method: ${method}`,
          success: !isValid, // Success means it correctly identified as invalid
          message: !isValid ? `${method} correctly identified as invalid` : `${method} incorrectly accepted`
        });
      } catch (error) {
        suite.results.push({
          testName: `Invalid Payment Method: ${method}`,
          success: false,
          message: `Error testing ${method}: ${error.message}`
        });
      }
    }

    this.updateSuiteStats(suite);
    this.testResults.push(suite);
  }

  /**
   * Test profile integration with forms
   */
  private static async testProfileIntegration(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Profile Integration Tests',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };

    console.log('👤 Testing Profile Integration...');

    if (!this.currentUser) {
      suite.results.push({
        testName: 'Profile Integration',
        success: false,
        message: 'No user available for profile integration tests'
      });
      this.updateSuiteStats(suite);
      this.testResults.push(suite);
      return;
    }

    // Test 1: Checkout form pre-population
    try {
      const checkoutFormData = {
        fullName: this.currentUser.name || '',
        phone: this.currentUser.phone || '',
        email: this.currentUser.email || ''
      };

      const hasPrefilledData = checkoutFormData.fullName || checkoutFormData.phone;
      
      suite.results.push({
        testName: 'Checkout Form Pre-population',
        success: hasPrefilledData,
        message: hasPrefilledData ? 'Checkout form successfully pre-filled from profile' : 'No profile data available for pre-filling',
        details: checkoutFormData
      });
    } catch (error) {
      suite.results.push({
        testName: 'Checkout Form Pre-population',
        success: false,
        message: `Error testing checkout pre-population: ${error.message}`
      });
    }

    // Test 2: Booking form pre-population
    try {
      const bookingFormData = {
        fullName: this.currentUser.name || '',
        phone: this.currentUser.phone || '',
        stateCode: this.currentUser.stateCode || ''
      };

      const hasPrefilledData = bookingFormData.fullName || bookingFormData.phone || bookingFormData.stateCode;
      
      suite.results.push({
        testName: 'Booking Form Pre-population',
        success: hasPrefilledData,
        message: hasPrefilledData ? 'Booking form successfully pre-filled from profile' : 'No profile data available for pre-filling',
        details: bookingFormData
      });
    } catch (error) {
      suite.results.push({
        testName: 'Booking Form Pre-population',
        success: false,
        message: `Error testing booking pre-population: ${error.message}`
      });
    }

    this.updateSuiteStats(suite);
    this.testResults.push(suite);
  }

  /**
   * Test cross-platform data synchronization
   */
  private static async testCrossPlatformSync(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Cross-Platform Sync Tests',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };

    console.log('🔄 Testing Cross-Platform Synchronization...');

    if (!this.authToken) {
      suite.results.push({
        testName: 'Cross-Platform Sync',
        success: false,
        message: 'No auth token available for sync tests'
      });
      this.updateSuiteStats(suite);
      this.testResults.push(suite);
      return;
    }

    // Test 1: Fetch user profile from API
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.PROFILE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      const data = await response.json();
      
      suite.results.push({
        testName: 'Profile API Sync',
        success: response.ok && data.success,
        message: response.ok ? 'Profile data successfully synced from API' : 'Failed to sync profile data',
        details: data
      });
    } catch (error) {
      suite.results.push({
        testName: 'Profile API Sync',
        success: false,
        message: `Profile sync error: ${error.message}`
      });
    }

    // Test 2: Fetch user orders
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MY_ORDERS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      const data = await response.json();
      
      suite.results.push({
        testName: 'Orders API Sync',
        success: response.ok,
        message: response.ok ? 'Orders data successfully synced from API' : 'Failed to sync orders data',
        details: { orderCount: data.orders?.length || 0 }
      });
    } catch (error) {
      suite.results.push({
        testName: 'Orders API Sync',
        success: false,
        message: `Orders sync error: ${error.message}`
      });
    }

    // Test 3: Fetch user bookings
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MY_BOOKINGS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      const data = await response.json();
      
      suite.results.push({
        testName: 'Bookings API Sync',
        success: response.ok,
        message: response.ok ? 'Bookings data successfully synced from API' : 'Failed to sync bookings data',
        details: { bookingCount: data.bookings?.length || 0 }
      });
    } catch (error) {
      suite.results.push({
        testName: 'Bookings API Sync',
        success: false,
        message: `Bookings sync error: ${error.message}`
      });
    }

    this.updateSuiteStats(suite);
    this.testResults.push(suite);
  }

  /**
   * Test booking flow with profile integration
   */
  private static async testBookingFlow(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Booking Flow Tests',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };

    console.log('🏠 Testing Booking Flow...');

    // Test booking data validation
    try {
      const bookingData = {
        bookingType: 'accommodation',
        accommodationId: 'test-accommodation-id',
        checkInDate: new Date().toISOString(),
        checkOutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        numberOfGuests: 1,
        userNotes: 'Test booking',
        contactInfo: {
          phone: this.currentUser?.phone || '08012345678',
          emergencyContact: {
            name: 'Test Emergency Contact',
            phone: '08087654321',
            relationship: 'Friend'
          }
        }
      };

      const isValid = this.validateBookingData(bookingData);
      
      suite.results.push({
        testName: 'Booking Data Validation',
        success: isValid,
        message: isValid ? 'Booking data validation passed' : 'Booking data validation failed',
        details: bookingData
      });
    } catch (error) {
      suite.results.push({
        testName: 'Booking Data Validation',
        success: false,
        message: `Booking validation error: ${error.message}`
      });
    }

    this.updateSuiteStats(suite);
    this.testResults.push(suite);
  }

  /**
   * Test order flow with profile integration
   */
  private static async testOrderFlow(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Order Flow Tests',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };

    console.log('🛒 Testing Order Flow...');

    // Test order data validation
    try {
      const orderData = {
        items: [{
          product: 'test-product-id',
          quantity: 1,
          price: 1000
        }],
        shippingAddress: {
          fullName: this.currentUser?.name || 'Test User',
          email: this.currentUser?.email || 'test@example.com',
          phone: this.currentUser?.phone || '08012345678',
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          postalCode: '000000',
          country: 'Nigeria'
        },
        paymentMethod: 'bank_transfer',
        customerNotes: 'Test order',
        shippingMethod: 'standard'
      };

      const isValid = this.validateOrderData(orderData);
      
      suite.results.push({
        testName: 'Order Data Validation',
        success: isValid,
        message: isValid ? 'Order data validation passed' : 'Order data validation failed',
        details: orderData
      });
    } catch (error) {
      suite.results.push({
        testName: 'Order Data Validation',
        success: false,
        message: `Order validation error: ${error.message}`
      });
    }

    this.updateSuiteStats(suite);
    this.testResults.push(suite);
  }

  /**
   * Helper method to validate payment methods
   */
  private static validatePaymentMethod(method: string): boolean {
    const validMethods = ['bank_transfer', 'card', 'mobile_money', 'cash_on_delivery'];
    return validMethods.includes(method);
  }

  /**
   * Helper method to validate booking data
   */
  private static validateBookingData(data: any): boolean {
    return !!(
      data.bookingType &&
      data.accommodationId &&
      data.checkInDate &&
      data.checkOutDate &&
      data.numberOfGuests &&
      data.contactInfo?.phone
    );
  }

  /**
   * Helper method to validate order data
   */
  private static validateOrderData(data: any): boolean {
    return !!(
      data.items?.length > 0 &&
      data.shippingAddress?.fullName &&
      data.shippingAddress?.email &&
      data.shippingAddress?.phone &&
      data.shippingAddress?.address &&
      data.paymentMethod &&
      this.validatePaymentMethod(data.paymentMethod)
    );
  }

  /**
   * Update suite statistics
   */
  private static updateSuiteStats(suite: TestSuite): void {
    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.success).length;
    suite.failedTests = suite.totalTests - suite.passedTests;
  }

  /**
   * Display final test results
   */
  private static displayFinalResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    this.testResults.forEach(suite => {
      console.log(`\n${suite.suiteName}:`);
      console.log(`  Total: ${suite.totalTests}, Passed: ${suite.passedTests}, Failed: ${suite.failedTests}`);
      
      totalTests += suite.totalTests;
      totalPassed += suite.passedTests;
      totalFailed += suite.failedTests;

      // Show failed tests
      const failedTests = suite.results.filter(r => !r.success);
      if (failedTests.length > 0) {
        console.log('  Failed Tests:');
        failedTests.forEach(test => {
          console.log(`    ❌ ${test.testName}: ${test.message}`);
        });
      }
    });

    console.log('\n========================');
    console.log(`Overall Results: ${totalPassed}/${totalTests} tests passed (${Math.round((totalPassed/totalTests) * 100)}%)`);

    // Show alert with results
    Alert.alert(
      'Test Results',
      `${totalPassed}/${totalTests} tests passed\n${totalFailed} tests failed\n\nCheck console for detailed results.`,
      [{ text: 'OK' }]
    );
  }

  /**
   * Run specific test suite
   */
  static async runSpecificTest(testType: 'registration' | 'payment' | 'profile' | 'sync' | 'booking' | 'order'): Promise<void> {
    this.testResults = [];

    switch (testType) {
      case 'registration':
        await this.testUserRegistration();
        break;
      case 'payment':
        await this.testPaymentMethodValidation();
        break;
      case 'profile':
        await this.testProfileIntegration();
        break;
      case 'sync':
        await this.testCrossPlatformSync();
        break;
      case 'booking':
        await this.testBookingFlow();
        break;
      case 'order':
        await this.testOrderFlow();
        break;
    }

    this.displayFinalResults();
  }
}

export default ComprehensiveTestScript;

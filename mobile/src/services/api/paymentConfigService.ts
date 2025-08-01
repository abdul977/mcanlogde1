/**
 * Payment Configuration Service
 * 
 * Handles API calls related to payment configuration,
 * including fetching bank details and payment settings.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from '../../constants';

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  sortCode?: string;
}

export interface MobilePayment {
  provider: string;
  number: string;
  accountName: string;
}

export interface PaymentInstructions {
  general: string;
  bankTransfer: string;
  mobilePayment: string;
}

export interface PaymentSupport {
  email: string;
  phone: string;
  whatsapp: string;
  workingHours: string;
}

export interface Currency {
  primary: string;
  symbol: string;
}

export interface VerificationSettings {
  allowedFileTypes: string[];
  maxFileSize: number;
  requireTransactionReference: boolean;
}

export interface PaymentConfiguration {
  organizationName: string;
  bankDetails: BankDetails;
  mobilePayments: MobilePayment[];
  paymentInstructions: PaymentInstructions;
  paymentSupport: PaymentSupport;
  currency: Currency;
  verificationSettings: VerificationSettings;
}

export interface PaymentConfigResponse {
  success: boolean;
  paymentDetails: PaymentConfiguration;
  message?: string;
}

class PaymentConfigService {
  /**
   * Fetch payment configuration details
   * This endpoint is public and doesn't require authentication
   */
  async getPaymentConfiguration(): Promise<PaymentConfiguration> {
    try {
      // First attempt: Try to fetch from database with retry mechanism
      return await this.fetchWithRetry(3);
    } catch (error: any) {
      console.error('All attempts to fetch payment configuration failed:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('API Error Response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Network Error - No response received:', error.request);
      } else {
        console.error('Request Setup Error:', error.message);
      }

      // Only use emergency fallback in extreme cases
      // This will show clear error messages to users
      console.warn('Using emergency fallback configuration - users will see error messages');
      return this.getEmergencyFallback();
    }
  }

  /**
   * Attempt to fetch payment configuration with retry mechanism
   * This ensures we always try to get real data from the database
   */
  private async fetchWithRetry(maxRetries: number = 2): Promise<PaymentConfiguration> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting to fetch payment config (attempt ${attempt}/${maxRetries})`);
        
        if (!apiClient) {
          throw new Error('API client is not initialized');
        }

        const response = await apiClient.get<PaymentConfigResponse>(
          `${ENDPOINTS.PAYMENT_CONFIG}/details`
        );

        if (response.data.success && response.data.paymentDetails) {
          console.log('Successfully fetched payment configuration from database');
          return response.data.paymentDetails;
        } else {
          throw new Error(response.data.message || 'API returned no payment details');
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw new Error(`Failed to fetch payment configuration after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Get minimal fallback configuration when database is completely unavailable
   * This should only be used in extreme cases and shows clear error messages
   */
  private getEmergencyFallback(): PaymentConfiguration {
    console.error('Using emergency fallback - database is unavailable');
    return {
      organizationName: 'Payment System Unavailable',
      bankDetails: {
        accountName: 'Bank details unavailable - please contact support',
        accountNumber: 'N/A',
        bankName: 'Service temporarily unavailable',
        sortCode: 'N/A'
      },
      mobilePayments: [],
      paymentInstructions: {
        general: 'Payment system is temporarily unavailable. Please contact support for payment details.',
        bankTransfer: 'Bank transfer details are currently unavailable. Please contact support.',
        mobilePayment: 'Mobile payment options are currently unavailable. Please contact support.'
      },
      paymentSupport: {
        email: 'support@mcan.org.ng',
        phone: 'Contact support',
        whatsapp: 'Contact support',
        workingHours: 'Please contact support for assistance'
      },
      currency: {
        primary: 'NGN',
        symbol: '₦'
      },
      verificationSettings: {
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        maxFileSize: 5242880,
        requireTransactionReference: false
      }
    };
  }

  /**
   * Check if bank details are properly configured
   */
  isBankDetailsConfigured(bankDetails: BankDetails): boolean {
    return !!(
      bankDetails.accountNumber &&
      bankDetails.bankName &&
      bankDetails.accountName &&
      bankDetails.accountNumber !== 'Please configure bank details' &&
      bankDetails.bankName !== 'Please configure bank details' &&
      bankDetails.accountNumber !== '0000000000' &&
      bankDetails.accountNumber !== 'Not configured' &&
      bankDetails.bankName !== 'Not configured'
    );
  }

  /**
   * Format bank details for display
   */
  formatBankDetails(bankDetails: BankDetails): BankDetails {
    // Ensure we have valid bank details before formatting
    if (!this.isBankDetailsConfigured(bankDetails)) {
      console.warn('Bank details not properly configured, returning placeholder values');
    }
    
    return {
      accountName: bankDetails.accountName?.trim() || 'Account name not configured',
      accountNumber: bankDetails.accountNumber?.trim() || 'Account number not configured',
      bankName: bankDetails.bankName?.trim() || 'Bank name not configured',
      sortCode: bankDetails.sortCode?.trim() || undefined
    };
  }

  /**
   * Validate if the payment configuration is complete and usable
   */
  validatePaymentConfiguration(config: PaymentConfiguration): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check bank details
    if (!this.isBankDetailsConfigured(config.bankDetails)) {
      errors.push('Bank details are not properly configured');
    }

    // Check mobile payments
    if (!config.mobilePayments || config.mobilePayments.length === 0) {
      warnings.push('No mobile payment options configured');
    }

    // Check organization name
    if (!config.organizationName || config.organizationName.trim() === '') {
      warnings.push('Organization name is not set');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const paymentConfigService = new PaymentConfigService();
export default paymentConfigService;

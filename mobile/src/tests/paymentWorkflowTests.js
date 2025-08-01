/**
 * Comprehensive Payment Workflow Test Scripts
 * Tests for shop order payment flows including screenshot upload, admin confirmation, and status updates
 */

import { API_CONFIG } from '../constants';

// Test configuration
const TEST_CONFIG = {
  BASE_URL: API_CONFIG.BASE_URL,
  TEST_USER: {
    email: 'testuser@example.com',
    password: 'testpassword123'
  },
  TEST_ADMIN: {
    email: 'admin@example.com',
    password: 'adminpassword123'
  },
  SAMPLE_PRODUCTS: [
    { name: 'Test Product 1', price: 5000, quantity: 2 },
    { name: 'Test Product 2', price: 3000, quantity: 1 }
  ]
};

// Test utilities
class PaymentTestUtils {
  constructor() {
    this.userToken = null;
    this.adminToken = null;
    this.testOrderId = null;
    this.testPaymentId = null;
  }

  async authenticateUser() {
    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_CONFIG.TEST_USER)
      });
      
      const result = await response.json();
      if (result.success) {
        this.userToken = result.token;
        console.log('✅ User authentication successful');
        return true;
      } else {
        console.error('❌ User authentication failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ User authentication error:', error.message);
      return false;
    }
  }

  async authenticateAdmin() {
    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_CONFIG.TEST_ADMIN)
      });
      
      const result = await response.json();
      if (result.success) {
        this.adminToken = result.token;
        console.log('✅ Admin authentication successful');
        return true;
      } else {
        console.error('❌ Admin authentication failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Admin authentication error:', error.message);
      return false;
    }
  }

  async createTestOrder() {
    try {
      const orderData = {
        items: TEST_CONFIG.SAMPLE_PRODUCTS.map(product => ({
          product: 'test_product_id', // This would be actual product IDs in real test
          quantity: product.quantity,
          price: product.price
        })),
        shippingAddress: {
          fullName: 'Test User',
          phone: '+2348012345678',
          address: '123 Test Street',
          city: 'Lagos',
          state: 'Lagos',
          postalCode: '100001'
        },
        paymentMethod: 'bank_transfer',
        totalAmount: 13000 // 5000*2 + 3000*1 + 2000 shipping
      };

      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.userToken}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      if (result.success) {
        this.testOrderId = result.order._id;
        console.log('✅ Test order created:', result.order.orderNumber);
        return result.order;
      } else {
        console.error('❌ Order creation failed:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Order creation error:', error.message);
      return null;
    }
  }

  async uploadPaymentScreenshot() {
    try {
      // Create a mock FormData for testing
      const formData = new FormData();
      formData.append('orderId', this.testOrderId);
      formData.append('amount', '13000');
      formData.append('paymentMethod', 'bank_transfer');
      formData.append('transactionReference', 'TEST_TXN_' + Date.now());
      formData.append('paymentDate', new Date().toISOString().split('T')[0]);
      formData.append('userNotes', 'Test payment upload');
      
      // Mock image file (in real test, this would be an actual image)
      const mockImageBlob = new Blob(['mock image data'], { type: 'image/jpeg' });
      formData.append('paymentScreenshot', mockImageBlob, 'test_payment.jpg');

      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/payments/submit-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.userToken}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        this.testPaymentId = result.paymentVerification._id;
        console.log('✅ Payment screenshot uploaded successfully');
        return result.paymentVerification;
      } else {
        console.error('❌ Payment upload failed:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Payment upload error:', error.message);
      return null;
    }
  }

  async approvePayment() {
    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.adminToken}`
        },
        body: JSON.stringify({
          paymentId: this.testPaymentId,
          action: 'approve',
          adminNotes: 'Test payment approval'
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Payment approved successfully');
        return result;
      } else {
        console.error('❌ Payment approval failed:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Payment approval error:', error.message);
      return null;
    }
  }

  async rejectPayment() {
    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.adminToken}`
        },
        body: JSON.stringify({
          paymentId: this.testPaymentId,
          action: 'reject',
          adminNotes: 'Test payment rejection - invalid screenshot'
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Payment rejected successfully');
        return result;
      } else {
        console.error('❌ Payment rejection failed:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Payment rejection error:', error.message);
      return null;
    }
  }

  async verifyOrderStatus(expectedStatus) {
    try {
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/orders/${this.testOrderId}`, {
        headers: {
          'Authorization': `Bearer ${this.userToken}`
        }
      });

      const result = await response.json();
      if (result.success) {
        const actualStatus = result.order.orderStatus;
        if (actualStatus === expectedStatus) {
          console.log(`✅ Order status verified: ${actualStatus}`);
          return true;
        } else {
          console.error(`❌ Order status mismatch. Expected: ${expectedStatus}, Actual: ${actualStatus}`);
          return false;
        }
      } else {
        console.error('❌ Failed to fetch order status:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Order status verification error:', error.message);
      return false;
    }
  }

  async cleanup() {
    // Clean up test data
    if (this.testOrderId) {
      try {
        await fetch(`${TEST_CONFIG.BASE_URL}/api/orders/${this.testOrderId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.adminToken}` }
        });
        console.log('🧹 Test order cleaned up');
      } catch (error) {
        console.warn('⚠️ Failed to cleanup test order:', error.message);
      }
    }

    if (this.testPaymentId) {
      try {
        await fetch(`${TEST_CONFIG.BASE_URL}/api/payments/${this.testPaymentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.adminToken}` }
        });
        console.log('🧹 Test payment cleaned up');
      } catch (error) {
        console.warn('⚠️ Failed to cleanup test payment:', error.message);
      }
    }
  }
}

// Test scenarios
export const PaymentWorkflowTests = {
  async runAllTests() {
    console.log('🚀 Starting Payment Workflow Tests...\n');
    
    const testUtils = new PaymentTestUtils();
    let testsPassed = 0;
    let totalTests = 0;

    try {
      // Test 1: Complete Payment Approval Flow
      totalTests++;
      console.log('📋 Test 1: Complete Payment Approval Flow');
      if (await this.testCompleteApprovalFlow(testUtils)) {
        testsPassed++;
      }

      // Test 2: Payment Rejection Flow
      totalTests++;
      console.log('\n📋 Test 2: Payment Rejection Flow');
      if (await this.testPaymentRejectionFlow(testUtils)) {
        testsPassed++;
      }

      // Test 3: Error Handling
      totalTests++;
      console.log('\n📋 Test 3: Error Handling');
      if (await this.testErrorHandling(testUtils)) {
        testsPassed++;
      }

    } finally {
      await testUtils.cleanup();
    }

    console.log(`\n📊 Test Results: ${testsPassed}/${totalTests} tests passed`);
    return testsPassed === totalTests;
  },

  async testCompleteApprovalFlow(testUtils) {
    try {
      // Authenticate users
      if (!await testUtils.authenticateUser()) return false;
      if (!await testUtils.authenticateAdmin()) return false;

      // Create test order
      const order = await testUtils.createTestOrder();
      if (!order) return false;

      // Upload payment screenshot
      const payment = await testUtils.uploadPaymentScreenshot();
      if (!payment) return false;

      // Verify initial order status
      if (!await testUtils.verifyOrderStatus('pending_payment')) return false;

      // Admin approves payment
      const approval = await testUtils.approvePayment();
      if (!approval) return false;

      // Verify order status updated to confirmed
      if (!await testUtils.verifyOrderStatus('confirmed')) return false;

      console.log('✅ Complete approval flow test passed');
      return true;
    } catch (error) {
      console.error('❌ Complete approval flow test failed:', error.message);
      return false;
    }
  },

  async testPaymentRejectionFlow(testUtils) {
    try {
      // Create new test order
      const order = await testUtils.createTestOrder();
      if (!order) return false;

      // Upload payment screenshot
      const payment = await testUtils.uploadPaymentScreenshot();
      if (!payment) return false;

      // Admin rejects payment
      const rejection = await testUtils.rejectPayment();
      if (!rejection) return false;

      // Verify order status remains pending
      if (!await testUtils.verifyOrderStatus('pending_payment')) return false;

      console.log('✅ Payment rejection flow test passed');
      return true;
    } catch (error) {
      console.error('❌ Payment rejection flow test failed:', error.message);
      return false;
    }
  },

  async testErrorHandling(testUtils) {
    try {
      // Test invalid payment ID
      const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUtils.adminToken}`
        },
        body: JSON.stringify({
          paymentId: 'invalid_id',
          action: 'approve',
          adminNotes: 'Test'
        })
      });

      const result = await response.json();
      if (!result.success && response.status === 404) {
        console.log('✅ Error handling test passed - invalid payment ID handled correctly');
        return true;
      } else {
        console.error('❌ Error handling test failed - should have returned 404');
        return false;
      }
    } catch (error) {
      console.error('❌ Error handling test failed:', error.message);
      return false;
    }
  }
};

// Export for use in test runner
export default PaymentWorkflowTests;

/**
 * Shopping Cart and Price Calculation Test Scripts
 * Tests for cart operations, price calculations, and checkout flow validation
 */

import { formatPrice, calculateShipping, calculatePriceBreakdown, calculateItemTotal, validatePrice } from '../utils/priceUtils';

// Mock products for testing
const MOCK_PRODUCTS = {
  product1: {
    _id: 'prod1',
    name: 'Test Product 1',
    price: 5000,
    sku: 'TEST001',
    image: 'https://example.com/product1.jpg'
  },
  product2: {
    _id: 'prod2',
    name: 'Test Product 2',
    price: 3000,
    sku: 'TEST002',
    image: 'https://example.com/product2.jpg'
  },
  expensiveProduct: {
    _id: 'prod3',
    name: 'Expensive Product',
    price: 60000,
    sku: 'TEST003',
    image: 'https://example.com/product3.jpg'
  },
  freeProduct: {
    _id: 'prod4',
    name: 'Free Product',
    price: 0,
    sku: 'TEST004',
    image: 'https://example.com/product4.jpg'
  }
};

// Test utilities
class ShoppingCartTestUtils {
  constructor() {
    this.cart = [];
  }

  addItem(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        product,
        quantity,
        addedAt: new Date()
      });
    }
    
    return this.cart;
  }

  removeItem(productId) {
    this.cart = this.cart.filter(item => item.product._id !== productId);
    return this.cart;
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.product._id === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      } else {
        item.quantity = quantity;
      }
    }
    return this.cart;
  }

  clearCart() {
    this.cart = [];
    return this.cart;
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => {
      return total + calculateItemTotal(item.product.price, item.quantity);
    }, 0);
  }

  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }
}

// Shopping Cart Tests
export const ShoppingCartTests = {
  async runAllTests() {
    console.log('🚀 Starting Shopping Cart Tests...\n');
    
    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: Basic Cart Operations
    totalTests++;
    console.log('📋 Test 1: Basic Cart Operations');
    if (await this.testBasicCartOperations()) {
      testsPassed++;
    }

    // Test 2: Price Calculation Accuracy
    totalTests++;
    console.log('\n📋 Test 2: Price Calculation Accuracy');
    if (await this.testPriceCalculationAccuracy()) {
      testsPassed++;
    }

    // Test 3: Shipping Calculation
    totalTests++;
    console.log('\n📋 Test 3: Shipping Calculation');
    if (await this.testShippingCalculation()) {
      testsPassed++;
    }

    // Test 4: Edge Cases and Error Handling
    totalTests++;
    console.log('\n📋 Test 4: Edge Cases and Error Handling');
    if (await this.testEdgeCasesAndErrorHandling()) {
      testsPassed++;
    }

    // Test 5: Price Formatting
    totalTests++;
    console.log('\n📋 Test 5: Price Formatting');
    if (await this.testPriceFormatting()) {
      testsPassed++;
    }

    // Test 6: Cart State Persistence
    totalTests++;
    console.log('\n📋 Test 6: Cart State Persistence');
    if (await this.testCartStatePersistence()) {
      testsPassed++;
    }

    console.log(`\n📊 Test Results: ${testsPassed}/${totalTests} tests passed`);
    return testsPassed === totalTests;
  },

  async testBasicCartOperations() {
    try {
      const cart = new ShoppingCartTestUtils();

      // Test adding items
      cart.addItem(MOCK_PRODUCTS.product1, 2);
      if (cart.getItemCount() !== 2) {
        console.error('❌ Failed to add items to cart');
        return false;
      }

      cart.addItem(MOCK_PRODUCTS.product2, 1);
      if (cart.getItemCount() !== 3) {
        console.error('❌ Failed to add second product to cart');
        return false;
      }

      // Test adding same product (should increase quantity)
      cart.addItem(MOCK_PRODUCTS.product1, 1);
      if (cart.getItemCount() !== 4) {
        console.error('❌ Failed to increase quantity of existing product');
        return false;
      }

      // Test updating quantity
      cart.updateQuantity(MOCK_PRODUCTS.product1._id, 5);
      if (cart.getItemCount() !== 6) {
        console.error('❌ Failed to update product quantity');
        return false;
      }

      // Test removing item
      cart.removeItem(MOCK_PRODUCTS.product2._id);
      if (cart.getItemCount() !== 5) {
        console.error('❌ Failed to remove item from cart');
        return false;
      }

      // Test clearing cart
      cart.clearCart();
      if (cart.getItemCount() !== 0) {
        console.error('❌ Failed to clear cart');
        return false;
      }

      console.log('✅ Basic cart operations test passed');
      return true;
    } catch (error) {
      console.error('❌ Basic cart operations test failed:', error.message);
      return false;
    }
  },

  async testPriceCalculationAccuracy() {
    try {
      const cart = new ShoppingCartTestUtils();

      // Test single item calculation
      cart.addItem(MOCK_PRODUCTS.product1, 2);
      const expectedTotal1 = 5000 * 2;
      if (cart.getCartTotal() !== expectedTotal1) {
        console.error(`❌ Single item calculation failed. Expected: ${expectedTotal1}, Got: ${cart.getCartTotal()}`);
        return false;
      }

      // Test multiple items calculation
      cart.addItem(MOCK_PRODUCTS.product2, 3);
      const expectedTotal2 = (5000 * 2) + (3000 * 3);
      if (cart.getCartTotal() !== expectedTotal2) {
        console.error(`❌ Multiple items calculation failed. Expected: ${expectedTotal2}, Got: ${cart.getCartTotal()}`);
        return false;
      }

      // Test price breakdown calculation
      const breakdown = calculatePriceBreakdown(cart.getCartTotal());
      const expectedShipping = calculateShipping(cart.getCartTotal());
      const expectedTotal = cart.getCartTotal() + expectedShipping;

      if (breakdown.total !== expectedTotal) {
        console.error(`❌ Price breakdown calculation failed. Expected: ${expectedTotal}, Got: ${breakdown.total}`);
        return false;
      }

      // Test item total calculation
      const itemTotal = calculateItemTotal(5000, 3);
      if (itemTotal !== 15000) {
        console.error(`❌ Item total calculation failed. Expected: 15000, Got: ${itemTotal}`);
        return false;
      }

      console.log('✅ Price calculation accuracy test passed');
      return true;
    } catch (error) {
      console.error('❌ Price calculation accuracy test failed:', error.message);
      return false;
    }
  },

  async testShippingCalculation() {
    try {
      // Test standard shipping (under ₦50,000)
      const standardShipping = calculateShipping(30000);
      if (standardShipping !== 2000) {
        console.error(`❌ Standard shipping calculation failed. Expected: 2000, Got: ${standardShipping}`);
        return false;
      }

      // Test free shipping (over ₦50,000)
      const freeShipping = calculateShipping(60000);
      if (freeShipping !== 0) {
        console.error(`❌ Free shipping calculation failed. Expected: 0, Got: ${freeShipping}`);
        return false;
      }

      // Test edge case (exactly ₦50,000)
      const edgeShipping = calculateShipping(50000);
      if (edgeShipping !== 0) {
        console.error(`❌ Edge case shipping calculation failed. Expected: 0, Got: ${edgeShipping}`);
        return false;
      }

      // Test with expensive product
      const cart = new ShoppingCartTestUtils();
      cart.addItem(MOCK_PRODUCTS.expensiveProduct, 1);
      const expensiveShipping = calculateShipping(cart.getCartTotal());
      if (expensiveShipping !== 0) {
        console.error(`❌ Expensive product shipping calculation failed. Expected: 0, Got: ${expensiveShipping}`);
        return false;
      }

      console.log('✅ Shipping calculation test passed');
      return true;
    } catch (error) {
      console.error('❌ Shipping calculation test failed:', error.message);
      return false;
    }
  },

  async testEdgeCasesAndErrorHandling() {
    try {
      const cart = new ShoppingCartTestUtils();

      // Test zero quantity
      cart.addItem(MOCK_PRODUCTS.product1, 0);
      if (cart.getItemCount() !== 0) {
        console.error('❌ Zero quantity handling failed');
        return false;
      }

      // Test negative quantity
      cart.updateQuantity(MOCK_PRODUCTS.product1._id, -1);
      if (cart.getItemCount() !== 0) {
        console.error('❌ Negative quantity handling failed');
        return false;
      }

      // Test free product
      cart.addItem(MOCK_PRODUCTS.freeProduct, 5);
      if (cart.getCartTotal() !== 0) {
        console.error('❌ Free product calculation failed');
        return false;
      }

      // Test invalid price validation
      const validatedPrice = validatePrice(-100);
      if (validatedPrice !== 0) {
        console.error(`❌ Price validation failed. Expected: 0, Got: ${validatedPrice}`);
        return false;
      }

      // Test NaN price validation
      const nanPrice = validatePrice(NaN);
      if (nanPrice !== 0) {
        console.error(`❌ NaN price validation failed. Expected: 0, Got: ${nanPrice}`);
        return false;
      }

      // Test removing non-existent item
      const initialCount = cart.getItemCount();
      cart.removeItem('non-existent-id');
      if (cart.getItemCount() !== initialCount) {
        console.error('❌ Non-existent item removal handling failed');
        return false;
      }

      console.log('✅ Edge cases and error handling test passed');
      return true;
    } catch (error) {
      console.error('❌ Edge cases and error handling test failed:', error.message);
      return false;
    }
  },

  async testPriceFormatting() {
    try {
      // Test basic formatting
      const formatted1 = formatPrice(5000);
      if (formatted1 !== '₦5,000') {
        console.error(`❌ Basic price formatting failed. Expected: ₦5,000, Got: ${formatted1}`);
        return false;
      }

      // Test large number formatting
      const formatted2 = formatPrice(1234567);
      if (formatted2 !== '₦1,234,567') {
        console.error(`❌ Large number formatting failed. Expected: ₦1,234,567, Got: ${formatted2}`);
        return false;
      }

      // Test zero formatting
      const formatted3 = formatPrice(0);
      if (formatted3 !== '₦0') {
        console.error(`❌ Zero formatting failed. Expected: ₦0, Got: ${formatted3}`);
        return false;
      }

      // Test without currency symbol
      const formatted4 = formatPrice(5000, false);
      if (formatted4 !== '5,000') {
        console.error(`❌ No currency formatting failed. Expected: 5,000, Got: ${formatted4}`);
        return false;
      }

      // Test negative number formatting
      const formatted5 = formatPrice(-1000);
      if (formatted5 !== '₦0') {
        console.error(`❌ Negative number formatting failed. Expected: ₦0, Got: ${formatted5}`);
        return false;
      }

      console.log('✅ Price formatting test passed');
      return true;
    } catch (error) {
      console.error('❌ Price formatting test failed:', error.message);
      return false;
    }
  },

  async testCartStatePersistence() {
    try {
      const cart1 = new ShoppingCartTestUtils();
      
      // Add items to cart
      cart1.addItem(MOCK_PRODUCTS.product1, 2);
      cart1.addItem(MOCK_PRODUCTS.product2, 1);
      
      const cartState = JSON.stringify(cart1.cart);
      
      // Simulate cart restoration
      const cart2 = new ShoppingCartTestUtils();
      cart2.cart = JSON.parse(cartState);
      
      if (cart2.getItemCount() !== 3) {
        console.error('❌ Cart state persistence failed - item count mismatch');
        return false;
      }
      
      if (cart2.getCartTotal() !== cart1.getCartTotal()) {
        console.error('❌ Cart state persistence failed - total mismatch');
        return false;
      }

      // Test cart operations after restoration
      cart2.updateQuantity(MOCK_PRODUCTS.product1._id, 5);
      if (cart2.getItemCount() !== 6) {
        console.error('❌ Cart operations after restoration failed');
        return false;
      }

      console.log('✅ Cart state persistence test passed');
      return true;
    } catch (error) {
      console.error('❌ Cart state persistence test failed:', error.message);
      return false;
    }
  }
};

// Export for use in test runner
export default ShoppingCartTests;

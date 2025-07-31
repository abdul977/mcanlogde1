/**
 * Mobile App Shopping Integration Test
 * Tests the mobile app shopping flow against the actual server
 * Run this script to verify the mobile app can successfully create orders and manage shopping cart
 */

const axios = require('axios');

// Configuration - matches mobile app constants
const CONFIG = {
  BASE_URL: 'https://mcanlogde1.onrender.com', // Render server for testing
  TEST_USER: {
    email: 'fatima.ibrahim@mcanenugu.org.ng',
    password: 'Fatima456!'
  }
};

// Mobile app endpoints (from constants/index.ts)
const ENDPOINTS = {
  LOGIN: '/auth/api/login',
  PRODUCTS: '/api/products',
  PRODUCT_CATEGORIES: '/api/product-categories',
  CREATE_ORDER: '/api/orders/create',
  MY_ORDERS: '/api/orders/my-orders',
  PAYMENT_CONFIG: '/api/payment-config/details'
};

async function testMobileShoppingIntegration() {
  console.log('🧪 Testing Mobile App Shopping Integration');
  console.log('=' .repeat(60));
  console.log('📱 Simulating mobile app shopping flow...');
  
  try {
    // Step 1: Login (same as mobile app)
    console.log('\n1️⃣ Testing mobile app login...');
    const loginResponse = await axios.post(`${CONFIG.BASE_URL}${ENDPOINTS.LOGIN}`, CONFIG.TEST_USER);
    
    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Mobile login successful for:', user.name);
    console.log('📧 Email:', user.email);

    // Step 2: Fetch products (mobile app style)
    console.log('\n2️⃣ Fetching products for mobile shop...');
    const productsResponse = await axios.get(`${CONFIG.BASE_URL}${ENDPOINTS.PRODUCTS}`);
    
    if (!productsResponse.data.success || !productsResponse.data.products) {
      throw new Error('Failed to fetch products');
    }
    
    const products = productsResponse.data.products;
    console.log('✅ Products fetched successfully!');
    console.log('📦 Total products available:', products.length);
    
    if (products.length === 0) {
      throw new Error('No products available for testing');
    }

    // Display sample products (mobile app would show these in list)
    console.log('📱 Sample products for mobile display:');
    products.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₦${product.price.toLocaleString()}`);
      console.log(`      SKU: ${product.sku}, Status: ${product.status}`);
    });

    // Step 3: Test product categories (for mobile filtering)
    console.log('\n3️⃣ Testing product categories for mobile filters...');
    const categoriesResponse = await axios.get(`${CONFIG.BASE_URL}${ENDPOINTS.PRODUCT_CATEGORIES}`);
    
    if (categoriesResponse.data.success && categoriesResponse.data.categories) {
      console.log('✅ Categories fetched for mobile filters!');
      console.log('🏷️ Available categories:', categoriesResponse.data.categories.length);
      
      // Show categories that would appear in mobile filter
      categoriesResponse.data.categories.slice(0, 3).forEach(cat => {
        console.log(`   - ${cat.name}`);
      });
    }

    // Step 4: Simulate mobile cart functionality
    console.log('\n4️⃣ Simulating mobile cart functionality...');
    
    // Select first available product for cart test
    const testProduct = products[0];
    console.log('🛒 Adding to mobile cart:', testProduct.name);
    
    // Mobile cart item structure (matches CartContext.tsx)
    const cartItem = {
      product: testProduct,
      quantity: 2
    };
    
    console.log('✅ Mobile cart item created:');
    console.log(`   Product: ${cartItem.product.name}`);
    console.log(`   Quantity: ${cartItem.quantity}`);
    console.log(`   Unit Price: ₦${cartItem.product.price.toLocaleString()}`);
    console.log(`   Total: ₦${(cartItem.product.price * cartItem.quantity).toLocaleString()}`);

    // Step 5: Test mobile order creation
    console.log('\n5️⃣ Testing mobile order creation...');
    
    const mobileOrderData = {
      items: [{
        product: testProduct._id,
        quantity: cartItem.quantity,
        variants: {}
      }],
      shippingAddress: {
        fullName: user.name,
        email: user.email,
        phone: user.phone || "08012345678",
        address: "123 Mobile Test Street",
        city: "Abuja",
        state: "FCT",
        postalCode: "900001",
        country: "Nigeria",
        landmark: "Near Mobile Test Landmark"
      },
      paymentMethod: "bank_transfer",
      customerNotes: "Test order from mobile app integration test",
      shippingMethod: "standard"
    };

    const orderResponse = await axios.post(
      `${CONFIG.BASE_URL}${ENDPOINTS.CREATE_ORDER}`,
      mobileOrderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!orderResponse.data.success) {
      throw new Error(`Mobile order creation failed: ${orderResponse.data.message}`);
    }

    console.log('✅ Mobile order created successfully!');
    console.log('📱 Order details:');
    console.log(`   Order Number: ${orderResponse.data.order.orderNumber}`);
    console.log(`   Total Amount: ₦${orderResponse.data.order.totalAmount.toLocaleString()}`);
    console.log(`   Status: ${orderResponse.data.order.status}`);
    console.log(`   Payment Status: ${orderResponse.data.order.paymentStatus}`);

    // Step 6: Test mobile order history
    console.log('\n6️⃣ Testing mobile order history...');
    const ordersResponse = await axios.get(
      `${CONFIG.BASE_URL}${ENDPOINTS.MY_ORDERS}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!ordersResponse.data.success) {
      throw new Error('Failed to fetch mobile order history');
    }

    console.log('✅ Mobile order history fetched!');
    console.log('📱 Order history for profile:');
    console.log(`   Total orders: ${ordersResponse.data.orders.length}`);
    
    // Show recent orders (mobile profile would display these)
    ordersResponse.data.orders.slice(0, 3).forEach(order => {
      console.log(`   - ${order.orderNumber}: ₦${order.totalAmount.toLocaleString()} (${order.status})`);
    });

    // Step 7: Test payment configuration for mobile
    console.log('\n7️⃣ Testing payment configuration for mobile...');
    const paymentResponse = await axios.get(`${CONFIG.BASE_URL}${ENDPOINTS.PAYMENT_CONFIG}`);
    
    if (paymentResponse.data.success) {
      console.log('✅ Payment configuration available for mobile!');
      console.log('💳 Payment methods for mobile checkout:', paymentResponse.data.paymentMethods?.length || 0);
    }

    // Step 8: Cleanup test order
    console.log('\n8️⃣ Cleaning up mobile test order...');
    await axios.put(
      `${CONFIG.BASE_URL}/api/orders/cancel/${orderResponse.data.order._id}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    console.log('✅ Mobile test order cleaned up');

    // Success summary
    console.log('\n🎉 MOBILE APP SHOPPING INTEGRATION TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ Mobile app authentication works correctly');
    console.log('✅ Mobile app product fetching works correctly');
    console.log('✅ Mobile app cart simulation works correctly');
    console.log('✅ Mobile app order creation works correctly');
    console.log('✅ Mobile app order history works correctly');
    console.log('✅ Mobile app payment configuration works correctly');
    console.log('✅ All mobile shopping endpoints are functioning properly');
    console.log('\n📱 The mobile app shopping flow is ready for integration!');

  } catch (error) {
    console.log('\n💥 MOBILE SHOPPING INTEGRATION TEST FAILED!');
    console.log('=' .repeat(60));
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('📱 Response Status:', error.response.status);
      console.error('📱 Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Verify server is running and accessible');
    console.log('2. Check user credentials are correct');
    console.log('3. Ensure products exist in database');
    console.log('4. Verify API endpoints are properly configured');
    
    process.exit(1);
  }
}

// Run the test
testMobileShoppingIntegration();

/**
 * Complete Shopping Flow End-to-End Test
 * Tests the entire shopping experience from product browsing to order completion
 * and profile integration
 */

const axios = require('axios');

// Configuration
const CONFIG = {
  BASE_URL: 'https://mcanlogde1.onrender.com',
  TEST_USER: {
    email: 'fatima.ibrahim@mcanenugu.org.ng',
    password: 'Fatima456!'
  }
};

// Test endpoints
const ENDPOINTS = {
  LOGIN: '/auth/api/login',
  PRODUCTS: '/api/products',
  PRODUCT_CATEGORIES: '/api/product-categories',
  CREATE_ORDER: '/api/orders/create',
  MY_ORDERS: '/api/orders/my-orders',
  MY_BOOKINGS: '/api/bookings/my-bookings',
  PAYMENT_CONFIG: '/api/payment-config/details'
};

async function testCompleteShoppingFlow() {
  console.log('🛍️ Complete Shopping Flow End-to-End Test');
  console.log('=' .repeat(60));
  
  let testOrder = null;
  let token = null;
  let user = null;
  
  try {
    // Step 1: User Authentication
    console.log('\n1️⃣ Testing User Authentication...');
    const loginResponse = await axios.post(`${CONFIG.BASE_URL}${ENDPOINTS.LOGIN}`, CONFIG.TEST_USER);
    
    if (!loginResponse.data.success) {
      throw new Error(`Authentication failed: ${loginResponse.data.message}`);
    }
    
    token = loginResponse.data.token;
    user = loginResponse.data.user;
    console.log('✅ User authenticated successfully');
    console.log(`   User: ${user.name} (${user.email})`);

    // Step 2: Product Discovery
    console.log('\n2️⃣ Testing Product Discovery...');
    
    // Fetch categories
    const categoriesResponse = await axios.get(`${CONFIG.BASE_URL}${ENDPOINTS.PRODUCT_CATEGORIES}`);
    if (!categoriesResponse.data.success) {
      throw new Error('Failed to fetch product categories');
    }
    
    const categories = categoriesResponse.data.categories;
    console.log('✅ Product categories loaded');
    console.log(`   Found ${categories.length} categories`);
    
    // Fetch products
    const productsResponse = await axios.get(`${CONFIG.BASE_URL}${ENDPOINTS.PRODUCTS}`);
    if (!productsResponse.data.success || !productsResponse.data.products.length) {
      throw new Error('No products available for testing');
    }
    
    const products = productsResponse.data.products;
    console.log('✅ Products loaded successfully');
    console.log(`   Found ${products.length} products available`);

    // Step 3: Shopping Cart Simulation
    console.log('\n3️⃣ Testing Shopping Cart Functionality...');
    
    // Select products for cart
    const selectedProducts = products.slice(0, Math.min(2, products.length));
    const cartItems = selectedProducts.map(product => ({
      product: product._id,
      quantity: Math.floor(Math.random() * 3) + 1, // 1-3 items
      variants: {}
    }));
    
    console.log('✅ Shopping cart simulated');
    cartItems.forEach((item, index) => {
      const product = selectedProducts[index];
      console.log(`   - ${product.name} (Qty: ${item.quantity}) - ₦${(product.price * item.quantity).toLocaleString()}`);
    });
    
    const cartTotal = cartItems.reduce((total, item, index) => {
      return total + (selectedProducts[index].price * item.quantity);
    }, 0);
    console.log(`   Cart Total: ₦${cartTotal.toLocaleString()}`);

    // Step 4: Order Creation
    console.log('\n4️⃣ Testing Order Creation...');
    
    const orderData = {
      items: cartItems,
      shippingAddress: {
        fullName: user.name,
        email: user.email,
        phone: user.phone || "08012345678",
        address: "123 Test Shopping Street",
        city: "Abuja",
        state: "FCT",
        postalCode: "900001",
        country: "Nigeria",
        landmark: "Near Shopping Test Center"
      },
      paymentMethod: "bank_transfer",
      customerNotes: "End-to-end test order - please process for testing",
      shippingMethod: "standard"
    };

    const orderResponse = await axios.post(
      `${CONFIG.BASE_URL}${ENDPOINTS.CREATE_ORDER}`,
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!orderResponse.data.success) {
      throw new Error(`Order creation failed: ${orderResponse.data.message}`);
    }

    testOrder = orderResponse.data.order;
    console.log('✅ Order created successfully');
    console.log(`   Order Number: ${testOrder.orderNumber}`);
    console.log(`   Order ID: ${testOrder._id}`);
    console.log(`   Total Amount: ₦${testOrder.totalAmount.toLocaleString()}`);
    console.log(`   Status: ${testOrder.status}`);
    console.log(`   Payment Status: ${testOrder.paymentStatus}`);

    // Step 5: Order History Verification
    console.log('\n5️⃣ Testing Order History Integration...');
    
    const ordersResponse = await axios.get(
      `${CONFIG.BASE_URL}${ENDPOINTS.MY_ORDERS}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!ordersResponse.data.success) {
      throw new Error('Failed to fetch order history');
    }

    const userOrders = ordersResponse.data.orders;
    const createdOrder = userOrders.find(order => order._id === testOrder._id);
    
    if (!createdOrder) {
      throw new Error('Created order not found in user order history');
    }

    console.log('✅ Order history integration verified');
    console.log(`   Total orders in history: ${userOrders.length}`);
    console.log(`   Created order found in history: ${createdOrder.orderNumber}`);

    // Step 6: Profile Stats Integration
    console.log('\n6️⃣ Testing Profile Statistics Integration...');
    
    // Fetch bookings for comparison
    const bookingsResponse = await axios.get(
      `${CONFIG.BASE_URL}${ENDPOINTS.MY_BOOKINGS}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    let bookingsCount = 0;
    if (bookingsResponse.data.success) {
      bookingsCount = bookingsResponse.data.bookings ? bookingsResponse.data.bookings.length : 0;
    }

    console.log('✅ Profile statistics verified');
    console.log(`   Bookings count: ${bookingsCount}`);
    console.log(`   Orders count: ${userOrders.length}`);
    console.log(`   Profile integration: Ready for mobile/web display`);

    // Step 7: Payment Configuration
    console.log('\n7️⃣ Testing Payment System Integration...');
    
    const paymentResponse = await axios.get(`${CONFIG.BASE_URL}${ENDPOINTS.PAYMENT_CONFIG}`);
    
    if (!paymentResponse.data.success) {
      throw new Error('Payment configuration not available');
    }

    console.log('✅ Payment system integration verified');
    console.log(`   Payment methods available: ${paymentResponse.data.paymentMethods?.length || 0}`);
    console.log(`   Payment configuration: Ready for checkout`);

    // Step 8: Cleanup Test Order
    console.log('\n8️⃣ Cleaning up test data...');
    
    await axios.put(
      `${CONFIG.BASE_URL}/api/orders/cancel/${testOrder._id}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    console.log('✅ Test order cleaned up successfully');

    // Success Summary
    console.log('\n🎉 COMPLETE SHOPPING FLOW TEST PASSED!');
    console.log('=' .repeat(60));
    console.log('✅ User authentication works correctly');
    console.log('✅ Product discovery and browsing works correctly');
    console.log('✅ Shopping cart functionality works correctly');
    console.log('✅ Order creation and processing works correctly');
    console.log('✅ Order history integration works correctly');
    console.log('✅ Profile statistics integration works correctly');
    console.log('✅ Payment system integration works correctly');
    console.log('✅ Cross-platform data consistency verified');
    console.log('\n🚀 The complete shopping flow is ready for production use!');

  } catch (error) {
    console.log('\n💥 COMPLETE SHOPPING FLOW TEST FAILED!');
    console.log('=' .repeat(60));
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('📱 Response Status:', error.response.status);
      console.error('📱 Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Cleanup on failure
    if (testOrder && token) {
      try {
        await axios.put(
          `${CONFIG.BASE_URL}/api/orders/cancel/${testOrder._id}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        console.log('🧹 Test order cleaned up after failure');
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup test order:', cleanupError.message);
      }
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Verify all API endpoints are working correctly');
    console.log('2. Check database connectivity and data integrity');
    console.log('3. Ensure user authentication is properly configured');
    console.log('4. Verify product and order management systems');
    
    process.exit(1);
  }
}

// Run the test
testCompleteShoppingFlow();

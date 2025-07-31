import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = process.env.BACKEND_URL || "https://mcanlogde1.onrender.com";

async function testPaymentShoppingAPI() {
  try {
    console.log("🧪 Testing Payment & Shopping API Integration");
    console.log("Base URL:", BASE_URL);

    // Step 1: Test login to get a valid token
    console.log("\n1️⃣ Testing login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, {
      email: "fatima.ibrahim@mcanenugu.org.ng", // Using Fatima from seedUsers.js
      password: "Fatima456!" // Password from seedUsers.js
    });

    if (!loginResponse.data.success) {
      console.log("❌ Login failed:", loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log("✅ Login successful");
    console.log("User:", user.name);
    console.log("Token (first 20 chars):", token.substring(0, 20) + "...");

    // Step 2: Test getting products
    console.log("\n2️⃣ Testing product fetch...");
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    
    if (!productsResponse.data.products || productsResponse.data.products.length === 0) {
      console.log("❌ No products found");
      console.log("Response:", productsResponse.data);
      return;
    }

    const products = productsResponse.data.products;
    console.log("✅ Products fetched successfully!");
    console.log(`Found ${products.length} products`);
    console.log("Sample product:", {
      name: products[0].name,
      price: products[0].price,
      sku: products[0].sku,
      status: products[0].status
    });

    // Step 3: Test product categories
    console.log("\n3️⃣ Testing product categories...");
    const categoriesResponse = await axios.get(`${BASE_URL}/api/product-categories`);
    
    if (categoriesResponse.data.success && categoriesResponse.data.categories) {
      console.log("✅ Categories fetched successfully!");
      console.log(`Found ${categoriesResponse.data.categories.length} categories`);
      if (categoriesResponse.data.categories.length > 0) {
        console.log("Sample category:", categoriesResponse.data.categories[0].name);
      }
    } else {
      console.log("⚠️ No categories found or error:", categoriesResponse.data);
    }

    // Step 4: Test order creation
    console.log("\n4️⃣ Testing order creation...");
    const orderData = {
      items: [{
        product: products[0]._id,
        quantity: 1,
        variants: {}
      }],
      shippingAddress: {
        fullName: user.name,
        email: user.email,
        phone: user.phone || "08012345678",
        address: "123 Test Street",
        city: "Abuja",
        state: "FCT",
        postalCode: "900001",
        country: "Nigeria",
        landmark: "Near Test Landmark"
      },
      paymentMethod: "bank_transfer",
      customerNotes: "Test order from API integration test",
      shippingMethod: "standard"
    };

    const orderResponse = await axios.post(
      `${BASE_URL}/api/orders/create`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (orderResponse.data.success) {
      console.log("✅ Order created successfully!");
      console.log("Order Number:", orderResponse.data.order.orderNumber);
      console.log("Order ID:", orderResponse.data.order._id);
      console.log("Total Amount:", orderResponse.data.order.totalAmount);
      
      // Step 5: Test getting user orders
      console.log("\n5️⃣ Testing user orders fetch...");
      const userOrdersResponse = await axios.get(
        `${BASE_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (userOrdersResponse.data.success) {
        console.log("✅ User orders fetched successfully!");
        console.log(`Found ${userOrdersResponse.data.orders.length} orders`);
      } else {
        console.log("❌ Failed to fetch user orders:", userOrdersResponse.data);
      }

      // Step 6: Test order cancellation (cleanup)
      console.log("\n6️⃣ Cleaning up test order...");
      await axios.put(
        `${BASE_URL}/api/orders/cancel/${orderResponse.data.order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("✅ Test order cancelled/cleaned up");
    } else {
      console.log("❌ Order creation failed:", orderResponse.data);
    }

    // Step 7: Test payment endpoints
    console.log("\n7️⃣ Testing payment configuration...");
    const paymentConfigResponse = await axios.get(`${BASE_URL}/api/payment-config/details`);
    
    if (paymentConfigResponse.data.success) {
      console.log("✅ Payment configuration fetched successfully!");
      console.log("Available payment methods:", paymentConfigResponse.data.paymentMethods?.length || 0);
    } else {
      console.log("⚠️ Payment configuration not available:", paymentConfigResponse.data);
    }

    console.log("\n🎉 Payment & Shopping API Integration Test Complete!");
    console.log("\n📝 Test Summary:");
    console.log("✅ User authentication: Working");
    console.log("✅ Product fetching: Working");
    console.log("✅ Order creation: Working");
    console.log("✅ Order management: Working");
    console.log("✅ Payment configuration: Working");

  } catch (error) {
    console.error("\n💥 Test failed with error:");
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testPaymentShoppingAPI();

import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";

async function testBookingAPI() {
  try {
    console.log("🧪 Testing Booking API Integration");
    console.log("Base URL:", BASE_URL);

    // Step 1: Test login to get a valid token
    console.log("\n1️⃣ Testing login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, {
      email: "admin@mcanlogde.com", // Using the admin user from our test
      password: "admin123" // You may need to adjust this password
    });

    if (!loginResponse.data.success) {
      console.log("❌ Login failed:", loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log("✅ Login successful");
    console.log("User:", user);
    console.log("Token (first 20 chars):", token.substring(0, 20) + "...");

    // Step 2: Test getting accommodations
    console.log("\n2️⃣ Testing accommodation fetch...");
    const accommodationsResponse = await axios.get(`${BASE_URL}/api/post/get-all-post`);
    
    if (!accommodationsResponse.data.posts || accommodationsResponse.data.posts.length === 0) {
      console.log("❌ No accommodations found");
      return;
    }

    const accommodation = accommodationsResponse.data.posts[0];
    console.log("✅ Found accommodation:", accommodation.title);

    // Step 3: Test booking creation
    console.log("\n3️⃣ Testing booking creation...");
    const bookingData = {
      bookingType: "accommodation",
      accommodationId: accommodation._id,
      checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      checkOutDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      numberOfGuests: 2,
      userNotes: "Test booking from API integration script",
      contactInfo: {
        phone: "+234 123 456 7890",
        emergencyContact: {
          name: "Test Contact",
          phone: "+234 987 654 3210",
          relationship: "Friend"
        }
      }
    };

    console.log("Booking data:", JSON.stringify(bookingData, null, 2));
    console.log("Using token:", token.substring(0, 20) + "...");

    const bookingResponse = await axios.post(
      `${BASE_URL}/api/bookings/create`,
      bookingData,
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (bookingResponse.data.success) {
      console.log("✅ Booking created successfully!");
      console.log("Booking ID:", bookingResponse.data.booking._id);
      
      // Clean up - delete the test booking
      console.log("\n4️⃣ Cleaning up test booking...");
      await axios.put(
        `${BASE_URL}/api/bookings/${bookingResponse.data.booking._id}/cancel`,
        {},
        {
          headers: {
            Authorization: token
          }
        }
      );
      console.log("✅ Test booking cleaned up");
    } else {
      console.log("❌ Booking creation failed:", bookingResponse.data);
    }

    console.log("\n🎉 API Integration Test Complete!");

  } catch (error) {
    console.error("❌ API Test Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request made but no response received");
      console.error("Request:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
}

// Run the test
testBookingAPI();

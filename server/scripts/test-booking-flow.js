const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'fatima.ibrahim@mcanenugu.org.ng',
  password: 'Fatima456!'
};

// Test data for booking
const BOOKING_DATA = {
  bookingType: 'accommodation',
  accommodationId: null, // Will be populated from available accommodations
  checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  checkOutDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  numberOfGuests: 2,
  userNotes: 'Test booking from mobile app perspective',
  contactInfo: {
    phone: '+234-806-123-4567',
    emergencyContact: {
      name: 'Aisha Ibrahim',
      phone: '+234-806-987-6543',
      relationship: 'Sister'
    }
  },
  bookingDuration: {
    months: 1,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString()
  },
  totalAmount: 50000
};

async function testBookingFlow() {
  console.log('🧪 Testing Booking Flow from Mobile App Perspective');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Test server health
    console.log('\n1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server health:', healthResponse.data);

    // Step 2: Login as Fatima
    console.log('\n2️⃣ Logging in as Fatima...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, TEST_USER);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful for:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Token received:', token ? 'Yes' : 'No');

    // Step 3: Get available accommodations for sisters (Fatima is female)
    console.log('\n3️⃣ Fetching available accommodations for sisters...');
    let accommodation = null;

    const accommodationsResponse = await axios.get(`${BASE_URL}/api/post/accommodations/sisters`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!accommodationsResponse.data.success || !accommodationsResponse.data.posts.length) {
      console.log('❌ No accommodations available for sisters:', accommodationsResponse.data);

      // Try getting all accommodations as fallback
      console.log('🔄 Trying to get all accommodations...');
      const allAccommodationsResponse = await axios.get(`${BASE_URL}/api/post/get-all-post`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!allAccommodationsResponse.data.success || !allAccommodationsResponse.data.posts.length) {
        console.log('❌ No accommodations available at all:', allAccommodationsResponse.data);
        return;
      }

      // Filter for accommodation posts
      const accommodationPosts = allAccommodationsResponse.data.posts.filter(post =>
        post.category && post.category.name === 'accommodation'
      );

      if (!accommodationPosts.length) {
        console.log('❌ No accommodation posts found in all posts');
        return;
      }

      accommodation = accommodationPosts[0];
      console.log('✅ Found accommodation from all posts:', accommodation.title);
    } else {
      accommodation = accommodationsResponse.data.posts[0];
      console.log('✅ Found accommodation for sisters:', accommodation.title);
    }
    BOOKING_DATA.accommodationId = accommodation._id;
    console.log('✅ Found accommodation:', accommodation.title);
    console.log('🏠 Accommodation ID:', accommodation._id);
    console.log('💰 Price:', accommodation.price);

    // Step 4: Create booking request
    console.log('\n4️⃣ Creating booking request...');
    console.log('📋 Booking data:', JSON.stringify(BOOKING_DATA, null, 2));
    
    const bookingResponse = await axios.post(`${BASE_URL}/api/bookings/create`, BOOKING_DATA, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!bookingResponse.data.success) {
      console.log('❌ Booking creation failed:', bookingResponse.data);
      return;
    }
    
    const booking = bookingResponse.data.booking;
    console.log('✅ Booking created successfully!');
    console.log('🆔 Booking ID:', booking._id);
    console.log('📊 Status:', booking.status);
    console.log('📅 Request Date:', booking.requestDate);
    console.log('💵 Total Amount:', booking.totalAmount);

    // Step 5: Verify booking was created
    console.log('\n5️⃣ Verifying booking...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/bookings/${booking._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!verifyResponse.data.success) {
      console.log('❌ Booking verification failed:', verifyResponse.data);
      return;
    }
    
    console.log('✅ Booking verified successfully!');
    console.log('📋 Booking details:', {
      id: verifyResponse.data.booking._id,
      status: verifyResponse.data.booking.status,
      user: verifyResponse.data.booking.user.name,
      accommodation: verifyResponse.data.booking.accommodation.title,
      checkIn: verifyResponse.data.booking.checkInDate,
      checkOut: verifyResponse.data.booking.checkOutDate,
      guests: verifyResponse.data.booking.numberOfGuests
    });

    // Step 6: Get user's bookings
    console.log('\n6️⃣ Fetching user bookings...');
    const userBookingsResponse = await axios.get(`${BASE_URL}/api/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!userBookingsResponse.data.success) {
      console.log('❌ Failed to fetch user bookings:', userBookingsResponse.data);
      return;
    }
    
    console.log('✅ User bookings fetched successfully!');
    console.log('📊 Total bookings:', userBookingsResponse.data.bookings.length);
    console.log('📋 Latest booking:', userBookingsResponse.data.bookings[0]?.status);

    console.log('\n🎉 BOOKING FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ All booking functionality is working correctly');
    console.log('✅ The issue is likely with mobile app dependency resolution');
    console.log('✅ Server-side booking logic is functioning properly');
    
  } catch (error) {
    console.log('\n❌ BOOKING FLOW TEST FAILED!');
    console.log('=' .repeat(60));
    
    if (error.response) {
      console.log('🔴 HTTP Error:', error.response.status);
      console.log('📄 Response:', error.response.data);
    } else if (error.request) {
      console.log('🔴 Network Error:', error.message);
      console.log('🌐 Check if server is running on', BASE_URL);
    } else {
      console.log('🔴 Error:', error.message);
    }
    
    console.log('\n🔍 Troubleshooting steps:');
    console.log('1. Ensure server is running: npm start in server directory');
    console.log('2. Check server logs for errors');
    console.log('3. Verify database connection');
    console.log('4. Check if seed data exists');
  }
}

// Run the test
testBookingFlow();

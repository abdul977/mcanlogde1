/**
 * Mobile App Booking Integration Test
 * Tests the mobile app booking flow against the actual server
 * Run this script to verify the mobile app can successfully create bookings
 */

const axios = require('axios');

// Configuration - matches mobile app constants
const CONFIG = {
  BASE_URL: 'https://mcanlogde1.onrender.com', // Production server
  TEST_USER: {
    email: 'fatima.ibrahim@mcanenugu.org.ng',
    password: 'Fatima456!'
  }
};

// Mobile app endpoints (from constants/index.ts)
const ENDPOINTS = {
  LOGIN: '/auth/api/login',
  ACCOMMODATIONS_BY_GENDER: '/api/post/accommodations',
  CREATE_BOOKING: '/api/bookings/create',
  MY_BOOKINGS: '/api/bookings/my-bookings'
};

async function testMobileBookingIntegration() {
  console.log('🧪 Testing Mobile App Booking Integration');
  console.log('=' .repeat(60));
  console.log('📱 Simulating mobile app booking flow...');
  
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

    // Step 2: Fetch accommodations using mobile app logic
    console.log('\n2️⃣ Fetching accommodations (mobile app style)...');
    
    // Determine user gender for appropriate accommodations (mobile app logic)
    const userGender = user.gender || 'female'; // Fatima is female
    let endpoint = `${CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}`;
    
    if (userGender === 'female') {
      endpoint = `${CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/sisters`;
    } else if (userGender === 'male') {
      endpoint = `${CONFIG.BASE_URL}${ENDPOINTS.ACCOMMODATIONS_BY_GENDER}/brothers`;
    }

    console.log('🏠 Fetching from endpoint:', endpoint);

    const accommodationsResponse = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`, // Mobile app format
        'Content-Type': 'application/json',
      },
    });

    if (!accommodationsResponse.data.success || !accommodationsResponse.data.posts.length) {
      throw new Error('No accommodations available for sisters');
    }

    const accommodation = accommodationsResponse.data.posts[0];
    console.log('✅ Found accommodation:', accommodation.title);
    console.log('🏠 Accommodation ID:', accommodation._id);
    console.log('💰 Price:', accommodation.price);
    console.log('🚻 Gender Restriction:', accommodation.genderRestriction);

    // Step 3: Create booking using mobile app data structure
    console.log('\n3️⃣ Creating booking (mobile app format)...');
    
    // Prepare booking data exactly as mobile app does
    const checkInDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const checkOutDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const bookingMonths = 1;
    const startDate = checkInDate.toISOString();
    const endDate = new Date(checkInDate.getTime() + (bookingMonths * 30 * 24 * 60 * 60 * 1000)).toISOString();
    
    const bookingData = {
      bookingType: 'accommodation',
      accommodationId: accommodation._id,
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      numberOfGuests: 2,
      userNotes: 'Test booking from mobile app integration test',
      contactInfo: {
        phone: '+234-806-123-4567',
        emergencyContact: {
          name: 'Aisha Ibrahim',
          phone: '+234-806-987-6543',
          relationship: 'Sister'
        }
      },
      bookingDuration: {
        months: bookingMonths,
        startDate: startDate,
        endDate: endDate
      },
      totalAmount: accommodation.price
    };

    console.log('📋 Mobile booking data structure:');
    console.log(JSON.stringify(bookingData, null, 2));

    const bookingResponse = await axios.post(`${CONFIG.BASE_URL}${ENDPOINTS.CREATE_BOOKING}`, bookingData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Mobile app format
      },
    });

    if (!bookingResponse.data.success) {
      throw new Error(`Booking creation failed: ${bookingResponse.data.message}`);
    }

    const booking = bookingResponse.data.booking;
    console.log('✅ Mobile booking created successfully!');
    console.log('🆔 Booking ID:', booking._id);
    console.log('📊 Status:', booking.status);
    console.log('💵 Total Amount:', booking.totalAmount);

    // Step 4: Verify booking (mobile app verification)
    console.log('\n4️⃣ Verifying mobile booking...');
    const verifyResponse = await axios.get(`${CONFIG.BASE_URL}/api/bookings/${booking._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!verifyResponse.data.success) {
      throw new Error('Mobile booking verification failed');
    }

    console.log('✅ Mobile booking verified successfully!');
    console.log('📋 Verified booking details:', {
      id: verifyResponse.data.booking._id,
      status: verifyResponse.data.booking.status,
      user: verifyResponse.data.booking.user.name,
      accommodation: verifyResponse.data.booking.accommodation.title
    });

    // Step 5: Test user bookings list (mobile app)
    console.log('\n5️⃣ Testing mobile bookings list...');
    const userBookingsResponse = await axios.get(`${CONFIG.BASE_URL}${ENDPOINTS.MY_BOOKINGS}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!userBookingsResponse.data.success) {
      throw new Error('Failed to fetch mobile user bookings');
    }

    console.log('✅ Mobile user bookings fetched successfully!');
    console.log('📊 Total mobile bookings:', userBookingsResponse.data.bookings.length);

    // Success summary
    console.log('\n🎉 MOBILE APP BOOKING INTEGRATION TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ Mobile app authentication works correctly');
    console.log('✅ Mobile app accommodation fetching works correctly');
    console.log('✅ Mobile app booking creation works correctly');
    console.log('✅ Mobile app booking verification works correctly');
    console.log('✅ Mobile app user bookings list works correctly');
    console.log('✅ All mobile app endpoints are functioning properly');
    console.log('\n📱 The mobile app booking flow is ready for production!');

  } catch (error) {
    console.log('\n❌ MOBILE APP BOOKING INTEGRATION TEST FAILED!');
    console.log('=' .repeat(60));
    
    if (error.response) {
      console.log('🔴 HTTP Error:', error.response.status);
      console.log('📄 Response:', error.response.data);
      console.log('🌐 URL:', error.config?.url);
      console.log('📤 Request Data:', error.config?.data);
    } else if (error.request) {
      console.log('🔴 Network Error:', error.message);
      console.log('🌐 Check if server is running on', CONFIG.BASE_URL);
    } else {
      console.log('🔴 Error:', error.message);
    }
    
    console.log('\n🔍 Mobile app troubleshooting steps:');
    console.log('1. Verify server is running and accessible');
    console.log('2. Check mobile app API endpoints match server routes');
    console.log('3. Verify authentication token format');
    console.log('4. Check booking data structure matches server expectations');
    console.log('5. Test with different user accounts');
    
    process.exit(1);
  }
}

// Run the test
testMobileBookingIntegration();

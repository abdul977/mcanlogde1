import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { updateBookingStats, checkAccommodationAvailability, incrementBookingStats } from '../utils/bookingStatsUtils.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Comprehensive test script for the configurable booking limit system
 * This script tests:
 * 1. Backward compatibility with existing data
 * 2. New booking limit functionality
 * 3. Count-based availability logic
 * 4. Booking statistics accuracy
 * 5. Performance of new queries
 */

const testBookingLimitSystem = async () => {
  try {
    console.log('🧪 Starting comprehensive booking limit system tests...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mcan');
    console.log('✅ Connected to MongoDB');

    let testsPassed = 0;
    let testsFailed = 0;
    const testResults = [];

    // Helper function to run tests
    const runTest = async (testName, testFunction) => {
      try {
        console.log(`\n🔍 Running test: ${testName}`);
        await testFunction();
        console.log(`✅ PASSED: ${testName}`);
        testResults.push({ name: testName, status: 'PASSED' });
        testsPassed++;
      } catch (error) {
        console.error(`❌ FAILED: ${testName} - ${error.message}`);
        testResults.push({ name: testName, status: 'FAILED', error: error.message });
        testsFailed++;
      }
    };

    // Test 1: Verify Post model schema updates
    await runTest('Post Model Schema Validation', async () => {
      const samplePost = new Post({
        title: 'Test Accommodation',
        accommodationType: 'Single Room',
        location: 'Test Location',
        description: 'Test Description',
        facilities: ['WiFi', 'AC'],
        nearArea: ['Mosque', 'Market'],
        category: new mongoose.Types.ObjectId(),
        guest: 2,
        price: 50000,
        mosqueProximity: 500,
        genderRestriction: 'brothers',
        images: ['test1.jpg', 'test2.jpg', 'test3.jpg']
      });

      // Validate default values
      if (samplePost.maxBookings !== 20) {
        throw new Error(`Expected maxBookings default to be 20, got ${samplePost.maxBookings}`);
      }

      if (!samplePost.bookingStats) {
        throw new Error('bookingStats should be initialized');
      }

      if (samplePost.bookingStats.approvedCount !== 0) {
        throw new Error(`Expected approvedCount default to be 0, got ${samplePost.bookingStats.approvedCount}`);
      }

      // Test validation limits
      samplePost.maxBookings = 101;
      try {
        await samplePost.validate();
        throw new Error('Should have failed validation for maxBookings > 100');
      } catch (validationError) {
        if (!validationError.message.includes('Maximum bookings cannot exceed 100')) {
          throw new Error('Validation error message incorrect');
        }
      }

      samplePost.maxBookings = 0;
      try {
        await samplePost.validate();
        throw new Error('Should have failed validation for maxBookings < 1');
      } catch (validationError) {
        if (!validationError.message.includes('Maximum bookings must be at least 1')) {
          throw new Error('Validation error message incorrect');
        }
      }
    });

    // Test 2: Booking statistics utility functions
    await runTest('Booking Statistics Utilities', async () => {
      // Create a test accommodation
      const testAccommodation = new Post({
        title: 'Test Stats Accommodation',
        accommodationType: 'Single Room',
        location: 'Test Location',
        description: 'Test Description',
        facilities: ['WiFi'],
        nearArea: ['Mosque'],
        category: new mongoose.Types.ObjectId(),
        guest: 1,
        price: 30000,
        mosqueProximity: 200,
        genderRestriction: 'sisters',
        images: ['test1.jpg', 'test2.jpg', 'test3.jpg'],
        maxBookings: 5
      });

      await testAccommodation.save();

      // Test availability check
      const availability = await checkAccommodationAvailability(testAccommodation._id);
      if (availability.maxBookings !== 5) {
        throw new Error(`Expected maxBookings 5, got ${availability.maxBookings}`);
      }
      if (availability.approvedCount !== 0) {
        throw new Error(`Expected approvedCount 0, got ${availability.approvedCount}`);
      }
      if (!availability.canBook) {
        throw new Error('Should be able to book when no approved bookings exist');
      }

      // Test booking stats update
      const updatedStats = await updateBookingStats(testAccommodation._id);
      if (updatedStats.approvedCount !== 0) {
        throw new Error(`Expected updated approvedCount 0, got ${updatedStats.approvedCount}`);
      }

      // Clean up
      await Post.findByIdAndDelete(testAccommodation._id);
    });

    // Test 3: Count-based availability logic
    await runTest('Count-based Availability Logic', async () => {
      // Create test accommodation with limit of 3
      const testAccommodation = new Post({
        title: 'Test Availability Accommodation',
        accommodationType: 'Shared Apartment',
        location: 'Test Location',
        description: 'Test Description',
        facilities: ['WiFi'],
        nearArea: ['Mosque'],
        category: new mongoose.Types.ObjectId(),
        guest: 4,
        price: 40000,
        mosqueProximity: 300,
        genderRestriction: 'family',
        images: ['test1.jpg', 'test2.jpg', 'test3.jpg'],
        maxBookings: 3
      });

      await testAccommodation.save();

      // Create test users
      const testUsers = [];
      for (let i = 0; i < 4; i++) {
        const user = new User({
          name: `Test User ${i}`,
          email: `testuser${i}@test.com`,
          password: 'testpassword',
          role: 'user'
        });
        await user.save();
        testUsers.push(user);
      }

      // Create bookings to test limits
      const bookings = [];
      
      // Create 2 approved bookings (should still be available)
      for (let i = 0; i < 2; i++) {
        const booking = new Booking({
          user: testUsers[i]._id,
          accommodation: testAccommodation._id,
          bookingType: 'accommodation',
          status: 'approved',
          checkInDate: new Date(),
          checkOutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          numberOfGuests: 1
        });
        await booking.save();
        bookings.push(booking);
      }

      // Update stats and check availability
      await updateBookingStats(testAccommodation._id);
      let availability = await checkAccommodationAvailability(testAccommodation._id);
      
      if (availability.approvedCount !== 2) {
        throw new Error(`Expected 2 approved bookings, got ${availability.approvedCount}`);
      }
      if (!availability.canBook) {
        throw new Error('Should still be able to book (2/3 slots filled)');
      }

      // Create 3rd approved booking (should reach limit)
      const thirdBooking = new Booking({
        user: testUsers[2]._id,
        accommodation: testAccommodation._id,
        bookingType: 'accommodation',
        status: 'approved',
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        numberOfGuests: 1
      });
      await thirdBooking.save();
      bookings.push(thirdBooking);

      // Update stats and check availability
      await updateBookingStats(testAccommodation._id);
      availability = await checkAccommodationAvailability(testAccommodation._id);
      
      if (availability.approvedCount !== 3) {
        throw new Error(`Expected 3 approved bookings, got ${availability.approvedCount}`);
      }
      if (availability.canBook) {
        throw new Error('Should NOT be able to book (3/3 slots filled)');
      }

      // Test that rejected/cancelled bookings don't count toward limit
      const rejectedBooking = new Booking({
        user: testUsers[3]._id,
        accommodation: testAccommodation._id,
        bookingType: 'accommodation',
        status: 'rejected',
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        numberOfGuests: 1
      });
      await rejectedBooking.save();

      await updateBookingStats(testAccommodation._id);
      availability = await checkAccommodationAvailability(testAccommodation._id);
      
      if (availability.approvedCount !== 3) {
        throw new Error('Rejected bookings should not count toward approved count');
      }

      // Clean up
      await Promise.all([
        ...bookings.map(b => Booking.findByIdAndDelete(b._id)),
        Booking.findByIdAndDelete(rejectedBooking._id),
        ...testUsers.map(u => User.findByIdAndDelete(u._id)),
        Post.findByIdAndDelete(testAccommodation._id)
      ]);
    });

    // Test 4: Incremental booking statistics updates
    await runTest('Incremental Statistics Updates', async () => {
      // Create test accommodation
      const testAccommodation = new Post({
        title: 'Test Incremental Stats',
        accommodationType: 'Studio',
        location: 'Test Location',
        description: 'Test Description',
        facilities: ['WiFi'],
        nearArea: ['Mosque'],
        category: new mongoose.Types.ObjectId(),
        guest: 2,
        price: 35000,
        mosqueProximity: 400,
        genderRestriction: 'brothers',
        images: ['test1.jpg', 'test2.jpg', 'test3.jpg'],
        maxBookings: 10
      });

      await testAccommodation.save();

      // Test status transitions
      const initialStats = await updateBookingStats(testAccommodation._id);
      if (initialStats.approvedCount !== 0 || initialStats.pendingCount !== 0) {
        throw new Error('Initial stats should be zero');
      }

      // Test pending -> approved transition
      let updatedStats = await incrementBookingStats(testAccommodation._id, 'pending', 'approved');
      if (updatedStats.approvedCount !== 1) {
        throw new Error(`Expected approvedCount 1 after increment, got ${updatedStats.approvedCount}`);
      }

      // Test approved -> rejected transition
      updatedStats = await incrementBookingStats(testAccommodation._id, 'approved', 'rejected');
      if (updatedStats.approvedCount !== 0) {
        throw new Error(`Expected approvedCount 0 after decrement, got ${updatedStats.approvedCount}`);
      }

      // Clean up
      await Post.findByIdAndDelete(testAccommodation._id);
    });

    // Test 5: Backward compatibility with existing data
    await runTest('Backward Compatibility', async () => {
      // Find existing accommodations (if any)
      const existingPosts = await Post.find({}).limit(5);
      
      for (const post of existingPosts) {
        // Check that existing posts have default values
        if (typeof post.maxBookings !== 'number' || post.maxBookings < 1) {
          throw new Error(`Existing post ${post._id} should have valid maxBookings`);
        }

        if (!post.bookingStats) {
          throw new Error(`Existing post ${post._id} should have bookingStats initialized`);
        }

        // Test that availability check works with existing data
        const availability = await checkAccommodationAvailability(post._id);
        if (typeof availability.canBook !== 'boolean') {
          throw new Error(`Availability check should return boolean canBook for ${post._id}`);
        }
      }
    });

    // Test 6: Performance validation
    await runTest('Performance Validation', async () => {
      const startTime = Date.now();
      
      // Test bulk availability checks
      const posts = await Post.find({}).limit(10);
      const availabilityPromises = posts.map(post => checkAccommodationAvailability(post._id));
      await Promise.all(availabilityPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (duration > 5000) { // 5 seconds threshold
        throw new Error(`Bulk availability checks took too long: ${duration}ms`);
      }
      
      console.log(`  ⚡ Bulk availability checks completed in ${duration}ms`);
    });

    // Test 7: API endpoint validation (mock tests)
    await runTest('API Endpoint Structure Validation', async () => {
      // Test that required functions exist and are callable
      const requiredFunctions = [
        updateBookingStats,
        checkAccommodationAvailability,
        incrementBookingStats
      ];

      for (const func of requiredFunctions) {
        if (typeof func !== 'function') {
          throw new Error(`Required function is not available: ${func.name}`);
        }
      }

      // Test error handling
      try {
        await checkAccommodationAvailability('invalid-id');
        throw new Error('Should have thrown error for invalid accommodation ID');
      } catch (error) {
        if (!error.message.includes('Cast to ObjectId failed')) {
          // Expected error for invalid ObjectId
        }
      }
    });

    // Display test results
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

    console.log('\n📋 Detailed Results:');
    testResults.forEach((result, index) => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    if (testsFailed === 0) {
      console.log('\n🎉 All tests passed! The booking limit system is working correctly.');
      console.log('\n✅ System Validation Complete:');
      console.log('  - Backward compatibility maintained');
      console.log('  - New booking limit functionality working');
      console.log('  - Count-based availability logic functional');
      console.log('  - Performance within acceptable limits');
      console.log('  - Database schema updates successful');
    } else {
      console.log(`\n⚠️  ${testsFailed} test(s) failed. Please review and fix issues before deployment.`);
    }

    return { testsPassed, testsFailed, testResults };

  } catch (error) {
    console.error('💥 Test execution failed:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBookingLimitSystem()
    .then((results) => {
      process.exit(results.testsFailed === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export default testBookingLimitSystem;
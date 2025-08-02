import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Booking from '../models/Booking.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Migration script to add booking limits and statistics to existing accommodations
 * This script will:
 * 1. Add maxBookings field (default: 20) to all existing posts
 * 2. Initialize bookingStats with current booking counts
 * 3. Update isAvailable based on actual booking counts vs limits
 */

const migrateBookingLimits = async () => {
  try {
    console.log('🚀 Starting booking limits migration...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mcan');
    console.log('✅ Connected to MongoDB');

    // Get all existing posts (accommodations)
    const posts = await Post.find({});
    console.log(`📊 Found ${posts.length} accommodations to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        // Calculate current booking statistics
        const approvedBookings = await Booking.countDocuments({
          accommodation: post._id,
          status: 'approved'
        });

        const pendingBookings = await Booking.countDocuments({
          accommodation: post._id,
          status: 'pending'
        });

        const totalBookings = await Booking.countDocuments({
          accommodation: post._id,
          status: { $in: ['approved', 'pending', 'rejected', 'cancelled'] }
        });

        // Initialize booking statistics if not present
        if (!post.bookingStats) {
          post.bookingStats = {};
        }

        // Set default maxBookings if not present
        if (!post.maxBookings) {
          post.maxBookings = 20;
        }

        // Update booking statistics
        post.bookingStats.approvedCount = approvedBookings;
        post.bookingStats.pendingCount = pendingBookings;
        post.bookingStats.totalCount = totalBookings;
        post.bookingStats.lastUpdated = new Date();

        // Update availability based on new logic
        post.isAvailable = approvedBookings < post.maxBookings;

        // Save the updated post
        await post.save();

        migratedCount++;
        console.log(`✅ Migrated accommodation: ${post.title} (${post._id})`);
        console.log(`   - Max Bookings: ${post.maxBookings}`);
        console.log(`   - Approved: ${approvedBookings}, Pending: ${pendingBookings}, Total: ${totalBookings}`);
        console.log(`   - Available: ${post.isAvailable}`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating accommodation ${post._id}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} accommodations`);
    console.log(`❌ Errors encountered: ${errorCount} accommodations`);

    // Verify migration results
    const updatedPosts = await Post.find({
      maxBookings: { $exists: true },
      'bookingStats.approvedCount': { $exists: true }
    });

    console.log(`\n🔍 Verification: ${updatedPosts.length} accommodations now have booking limits and statistics`);

    // Show some statistics
    const availableCount = await Post.countDocuments({ isAvailable: true });
    const unavailableCount = await Post.countDocuments({ isAvailable: false });
    
    console.log(`📊 Availability Status:`);
    console.log(`   - Available: ${availableCount}`);
    console.log(`   - Unavailable: ${unavailableCount}`);

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateBookingLimits();
}

export default migrateBookingLimits;
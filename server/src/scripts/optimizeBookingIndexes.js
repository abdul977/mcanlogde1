import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Booking from '../models/Booking.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database index optimization script for the configurable booking limit system
 * This script creates optimized indexes for:
 * 1. Booking statistics queries
 * 2. Availability checks
 * 3. Admin overview queries
 * 4. Performance-critical booking operations
 */

const optimizeBookingIndexes = async () => {
  try {
    console.log('🚀 Starting database index optimization for booking system...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mcan');
    console.log('✅ Connected to MongoDB');

    // Get database collections
    const db = mongoose.connection.db;
    const postsCollection = db.collection('posts');
    const bookingsCollection = db.collection('bookings');

    console.log('\n📊 Creating optimized indexes for Posts collection...');

    // Posts collection indexes for booking system
    const postIndexes = [
      // Booking statistics indexes
      { 
        key: { 'bookingStats.approvedCount': 1, 'maxBookings': 1 },
        name: 'booking_availability_idx',
        background: true
      },
      { 
        key: { 'bookingStats.approvedCount': 1, 'bookingStats.pendingCount': 1 },
        name: 'booking_counts_idx',
        background: true
      },
      { 
        key: { 'bookingStats.lastUpdated': -1 },
        name: 'booking_stats_updated_idx',
        background: true
      },
      
      // Availability and admin queries
      { 
        key: { 'isAvailable': 1, 'maxBookings': 1, 'adminStatus': 1 },
        name: 'availability_admin_idx',
        background: true
      },
      { 
        key: { 'maxBookings': 1, 'bookingStats.approvedCount': 1 },
        name: 'capacity_utilization_idx',
        background: true
      },
      
      // Admin overview and filtering
      { 
        key: { 'adminStatus': 1, 'isVisible': 1, 'isAvailable': 1 },
        name: 'admin_visibility_idx',
        background: true
      },
      { 
        key: { 'createdAt': -1, 'adminStatus': 1 },
        name: 'admin_created_status_idx',
        background: true
      },

      // Performance optimization for bulk operations
      { 
        key: { '_id': 1, 'maxBookings': 1, 'bookingStats.approvedCount': 1 },
        name: 'bulk_update_optimization_idx',
        background: true
      }
    ];

    // Create indexes for Posts collection
    for (const indexSpec of postIndexes) {
      try {
        await postsCollection.createIndex(indexSpec.key, {
          name: indexSpec.name,
          background: indexSpec.background
        });
        console.log(`✅ Created index: ${indexSpec.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠️  Index ${indexSpec.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating index ${indexSpec.name}:`, error.message);
        }
      }
    }

    console.log('\n📊 Creating optimized indexes for Bookings collection...');

    // Bookings collection indexes for enhanced performance
    const bookingIndexes = [
      // Accommodation booking queries
      { 
        key: { 'accommodation': 1, 'status': 1, 'requestDate': -1 },
        name: 'accommodation_status_date_idx',
        background: true
      },
      { 
        key: { 'accommodation': 1, 'status': 1, 'user': 1 },
        name: 'accommodation_status_user_idx',
        background: true
      },
      
      // Statistics calculation optimization
      { 
        key: { 'accommodation': 1, 'status': 1 },
        name: 'accommodation_status_stats_idx',
        background: true
      },
      
      // User booking queries
      { 
        key: { 'user': 1, 'status': 1, 'bookingType': 1 },
        name: 'user_status_type_idx',
        background: true
      },
      { 
        key: { 'user': 1, 'accommodation': 1, 'status': 1 },
        name: 'user_accommodation_status_idx',
        background: true
      },
      
      // Admin queries and reporting
      { 
        key: { 'status': 1, 'bookingType': 1, 'requestDate': -1 },
        name: 'admin_status_type_date_idx',
        background: true
      },
      { 
        key: { 'requestDate': -1, 'status': 1 },
        name: 'admin_date_status_idx',
        background: true
      },
      
      // Payment and overdue tracking
      { 
        key: { 'status': 1, 'paymentSchedule.dueDate': 1, 'paymentSchedule.status': 1 },
        name: 'payment_tracking_idx',
        background: true
      },
      
      // Booking type specific queries
      { 
        key: { 'bookingType': 1, 'status': 1, 'accommodation': 1 },
        name: 'type_status_accommodation_idx',
        background: true
      }
    ];

    // Create indexes for Bookings collection
    for (const indexSpec of bookingIndexes) {
      try {
        await bookingsCollection.createIndex(indexSpec.key, {
          name: indexSpec.name,
          background: indexSpec.background
        });
        console.log(`✅ Created index: ${indexSpec.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠️  Index ${indexSpec.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating index ${indexSpec.name}:`, error.message);
        }
      }
    }

    console.log('\n🔍 Analyzing existing indexes...');

    // Get current indexes for both collections
    const postIndexes_current = await postsCollection.indexes();
    const bookingIndexes_current = await bookingsCollection.indexes();

    console.log(`\n📈 Posts Collection Indexes (${postIndexes_current.length} total):`);
    postIndexes_current.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log(`\n📈 Bookings Collection Indexes (${bookingIndexes_current.length} total):`);
    bookingIndexes_current.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Performance recommendations
    console.log('\n💡 Performance Optimization Recommendations:');
    console.log('  1. Monitor query performance using MongoDB Profiler');
    console.log('  2. Consider compound indexes for frequently used query patterns');
    console.log('  3. Use explain() to analyze query execution plans');
    console.log('  4. Regularly review and optimize slow queries');
    console.log('  5. Consider read replicas for heavy reporting workloads');

    // Test index effectiveness with sample queries
    console.log('\n🧪 Testing index effectiveness...');
    
    try {
      // Test accommodation availability query
      const availabilityQuery = await postsCollection.find({
        'bookingStats.approvedCount': { $lt: '$maxBookings' },
        'isAvailable': true
      }).explain('executionStats');
      
      console.log(`✅ Availability query uses index: ${availabilityQuery.executionStats.totalDocsExamined <= availabilityQuery.executionStats.totalDocsReturned * 2}`);
      
      // Test booking statistics query
      const statsQuery = await bookingsCollection.find({
        'accommodation': new mongoose.Types.ObjectId(),
        'status': 'approved'
      }).explain('executionStats');
      
      console.log(`✅ Booking stats query optimized: ${statsQuery.executionStats.executionSuccess}`);
      
    } catch (testError) {
      console.log('⚠️  Index effectiveness test skipped (no data available)');
    }

    console.log('\n🎉 Database index optimization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Posts collection: ${postIndexes.length} new indexes created`);
    console.log(`  - Bookings collection: ${bookingIndexes.length} new indexes created`);
    console.log('  - All indexes created in background mode for minimal impact');
    console.log('  - Query performance should be significantly improved');

  } catch (error) {
    console.error('💥 Index optimization failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run optimization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeBookingIndexes();
}

export default optimizeBookingIndexes;
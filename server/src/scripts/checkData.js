import { connectToDb } from '../config/db.js';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

async function checkData() {
  try {
    // Connect to database
    await connectToDb();

    // Check categories
    const categories = await Category.find({});
    console.log('\nCategories:', categories.length);
    categories.forEach(cat => {
      console.log(`- ${cat.name}`);
    });

    // Check total accommodations
    const totalPosts = await Post.countDocuments({});
    console.log('\nTotal accommodations:', totalPosts);

    // Check brothers' accommodations
    const brothersPosts = await Post.countDocuments({ genderRestriction: 'brothers' });
    console.log('Brothers bed spaces:', brothersPosts);

    // Check sisters' accommodations
    const sistersPosts = await Post.countDocuments({ genderRestriction: 'sisters' });
    console.log('Sisters bed spaces:', sistersPosts);

    // Check available spaces
    const availablePosts = await Post.countDocuments({ isAvailable: true });
    console.log('Available bed spaces:', availablePosts);

    // Get all posts with their details
    const posts = await Post.find({}).populate('category');
    console.log('\nAll accommodations:');
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log('   Location:', post.location);
      console.log('   Price:', post.price);
      console.log('   Category:', post.category.name);
      console.log('   Gender Restriction:', post.genderRestriction);
      console.log('   Guest Capacity:', post.guest);
      console.log('   Mosque Proximity:', post.mosqueProximity, 'meters');
      console.log('   Prayer Facilities:', post.prayerFacilities ? 'Yes' : 'No');
      console.log('   Available:', post.isAvailable ? 'Yes' : 'No');
      console.log('   Near Area:', post.nearArea.join(', '));
      console.log('   Facilities:', post.facilities.join(', '));
    });

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
  }
}

// Run the check
checkData().catch(console.error);
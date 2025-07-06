import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkBlog() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const blogId = '6869037e5d6daf15d0d1d7d1';
    console.log(`Checking for blog with ID: ${blogId}`);

    const blog = await Blog.findById(blogId);
    
    if (blog) {
      console.log('✅ Blog found!');
      console.log('Title:', blog.title);
      console.log('Status:', blog.status);
      console.log('Author:', blog.author);
      console.log('Created:', blog.createdAt);
    } else {
      console.log('❌ Blog not found');
      
      // Let's check all blogs to see what IDs exist
      console.log('\nChecking all blogs in database:');
      const allBlogs = await Blog.find({}).select('_id title status').limit(10);
      
      if (allBlogs.length > 0) {
        console.log('Available blogs:');
        allBlogs.forEach(blog => {
          console.log(`- ID: ${blog._id}, Title: ${blog.title}, Status: ${blog.status}`);
        });
      } else {
        console.log('No blogs found in database');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkBlog();

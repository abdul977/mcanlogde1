import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import ProductCategory from "../models/ProductCategory.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

async function checkCategories() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check existing categories
    console.log('\n📂 Checking existing categories...');
    const categories = await ProductCategory.find({});
    console.log(`Found ${categories.length} existing categories`);

    if (categories.length > 0) {
      console.log('\n📋 Existing categories:');
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (${category.slug})`);
        console.log(`   Active: ${category.isActive}`);
        console.log(`   Visible: ${category.isVisible}`);
        console.log(`   Featured: ${category.isFeatured}`);
        console.log('');
      });
    } else {
      console.log('❌ No categories found. You need to seed categories first.');
      console.log('Run: node server/src/seeds/productCategories.js');
    }

  } catch (error) {
    console.error('❌ Error checking categories:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit();
  }
}

// Run the check
checkCategories();

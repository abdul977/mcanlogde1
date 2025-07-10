import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Product from "../models/Product.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

console.log('Environment check:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI preview:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'undefined');

async function checkProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check existing products
    console.log('\n📦 Checking existing products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} existing products`);

    if (products.length > 0) {
      console.log('\n📋 Existing products:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - SKU: ${product.sku} - Status: ${product.status}`);
      });

      console.log('\n⚠️  To clear all existing products and start fresh, run:');
      console.log('node server/src/scripts/checkProducts.js --clear');
    } else {
      console.log('✅ No existing products found. You can create new products without SKU conflicts.');
    }

  } catch (error) {
    console.error('❌ Error checking products:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit();
  }
}

async function clearProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    console.log('\n🗑️  Clearing all existing products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} products`);

    console.log('\n🎉 All products cleared successfully!');
    console.log('You can now create new products without SKU conflicts.');

  } catch (error) {
    console.error('❌ Error clearing products:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit();
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--clear')) {
  console.log('🚨 WARNING: This will delete ALL existing products!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  setTimeout(() => {
    clearProducts();
  }, 5000);
} else {
  checkProducts();
}

import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Product from "../models/Product.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

async function updateProductStatus() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Update all draft products to active
    console.log('\n📦 Updating product statuses...');
    const result = await Product.updateMany(
      { status: 'draft' },
      { status: 'active' }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} products from draft to active`);

    // Show updated products
    const products = await Product.find({});
    console.log('\n📋 All products after update:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Visible: ${product.isVisible}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error updating product status:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit();
  }
}

// Run the update
updateProductStatus();

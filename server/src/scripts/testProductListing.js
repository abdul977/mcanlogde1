import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Product from "../models/Product.js";

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

async function testProductListing() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Test different queries
    console.log('\n📦 Testing product queries...');
    
    // 1. All products (no filter)
    const allProducts = await Product.find({});
    console.log(`1. All products (no filter): ${allProducts.length}`);
    
    // 2. Active products only
    const activeProducts = await Product.find({ status: 'active' });
    console.log(`2. Active products: ${activeProducts.length}`);
    
    // 3. Draft products only
    const draftProducts = await Product.find({ status: 'draft' });
    console.log(`3. Draft products: ${draftProducts.length}`);
    
    // 4. Visible products
    const visibleProducts = await Product.find({ isVisible: true });
    console.log(`4. Visible products: ${visibleProducts.length}`);
    
    // 5. Active + Visible (public query)
    const publicProducts = await Product.find({ status: 'active', isVisible: true });
    console.log(`5. Public products (active + visible): ${publicProducts.length}`);

    if (allProducts.length > 0) {
      console.log('\n📋 Product details:');
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   Status: ${product.status}`);
        console.log(`   Visible: ${product.isVisible}`);
        console.log(`   Created: ${product.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error testing product listing:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit();
  }
}

// Run the test
testProductListing();

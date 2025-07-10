import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { connectToDb } from './src/config/db.js';
import Product from './src/models/Product.js';
import ProductCategory from './src/models/ProductCategory.js';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') });

console.log('Starting debug script...');

async function testProductCreation() {
  try {
    console.log('Connecting to database...');
    await connectToDb();
    console.log('✓ Database connected');

    // Check if we have any categories
    console.log('Checking for product categories...');
    const categories = await ProductCategory.find({});
    console.log(`Found ${categories.length} categories`);

    if (categories.length === 0) {
      console.log('Creating a test category...');
      const testCategory = new ProductCategory({
        name: 'Test Category',
        description: 'A test category for debugging',
        slug: 'test-category'
      });
      await testCategory.save();
      console.log('✓ Test category created');
      categories.push(testCategory);
    }

    // Test the exact same data structure as the controller
    console.log('Testing product creation with controller-like data...');

    const productData = {
      name: 'Test Product',
      description: 'A test product for debugging',
      shortDescription: '',
      price: 100,
      comparePrice: undefined,
      sku: 'TEST-001',
      category: categories[0]._id,
      brand: 'MCAN',
      collection: '',
      variants: [],
      inventory: { trackQuantity: true, quantity: 0 },
      specifications: [],
      dimensions: {},
      weight: {},
      tags: [],
      images: [],
      metaTitle: '',
      metaDescription: '',
      isFeatured: false,
      status: 'draft'
    };

    const testProduct = new Product(productData);
    await testProduct.save();
    console.log('✓ Test product created successfully');
    console.log('Product ID:', testProduct._id);

    // Clean up
    await Product.findByIdAndDelete(testProduct._id);
    console.log('✓ Test product cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    process.exit(0);
  }
}

testProductCreation();

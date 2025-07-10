import axios from 'axios';

async function testAdminEndpoint() {
  try {
    console.log('🧪 Testing admin products endpoint...');
    
    // Test the public endpoint (should filter by status=active)
    console.log('\n1. Testing public endpoint (should show only active products):');
    try {
      const publicResponse = await axios.get('http://localhost:3000/api/products');
      console.log(`   Public products: ${publicResponse.data.products?.length || 0}`);
      if (publicResponse.data.products?.length > 0) {
        publicResponse.data.products.forEach(p => {
          console.log(`   - ${p.name} (${p.status})`);
        });
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Test the admin endpoint (should show all products)
    console.log('\n2. Testing admin endpoint (should show all products):');
    try {
      // Note: This will fail without authentication, but we can see if the endpoint exists
      const adminResponse = await axios.get('http://localhost:3000/api/products/admin/all');
      console.log(`   Admin products: ${adminResponse.data.products?.length || 0}`);
      if (adminResponse.data.products?.length > 0) {
        adminResponse.data.products.forEach(p => {
          console.log(`   - ${p.name} (${p.status})`);
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Admin endpoint exists but requires authentication (expected)');
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }

    // Test categories endpoint
    console.log('\n3. Testing categories endpoint:');
    try {
      const categoriesResponse = await axios.get('http://localhost:3000/api/product-categories');
      console.log(`   Categories: ${categoriesResponse.data.categories?.length || 0}`);
      if (categoriesResponse.data.categories?.length > 0) {
        categoriesResponse.data.categories.forEach(c => {
          console.log(`   - ${c.name}`);
        });
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

// Run the test
testAdminEndpoint();

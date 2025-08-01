import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = 'http://localhost:3000';

async function testCommunityEndpoints() {
  try {
    console.log('🧪 Testing Community API Endpoints...\n');
    
    // Test 1: Get all public communities
    console.log('1. Testing public communities endpoint:');
    try {
      const response = await axios.get(`${BASE_URL}/api/chat-communities`);
      console.log(`   ✅ Success: ${response.data.communities?.length || 0} communities found`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message}`);
      
      if (response.data.communities?.length > 0) {
        console.log('   Communities:');
        response.data.communities.forEach(c => {
          console.log(`   - ${c.name} (${c.status}) - ${c.category}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Test admin endpoint (should fail without auth)
    console.log('\n2. Testing admin communities endpoint (without auth):');
    try {
      const response = await axios.get(`${BASE_URL}/api/chat-communities/admin/all`);
      console.log(`   ✅ Unexpected success: ${response.data.communities?.length || 0} communities`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Expected: Admin endpoint requires authentication');
      } else {
        console.log(`   ❌ Unexpected error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 3: Test community creation endpoint (should fail without auth)
    console.log('\n3. Testing community creation endpoint (without auth):');
    try {
      const testCommunity = {
        name: "Test Community",
        description: "A test community for API testing",
        category: "general"
      };
      
      const response = await axios.post(`${BASE_URL}/api/chat-communities/create`, testCommunity);
      console.log(`   ✅ Unexpected success: Community created`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Expected: Community creation requires authentication');
      } else {
        console.log(`   ❌ Unexpected error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 4: Test individual community endpoint
    console.log('\n4. Testing individual community endpoint:');
    try {
      // First get a community slug from the public list
      const listResponse = await axios.get(`${BASE_URL}/api/chat-communities`);
      if (listResponse.data.communities?.length > 0) {
        const firstCommunity = listResponse.data.communities[0];
        const slug = firstCommunity.slug;
        
        const response = await axios.get(`${BASE_URL}/api/chat-communities/${slug}`);
        console.log(`   ✅ Success: Retrieved community "${response.data.community?.name}"`);
        console.log(`   Status: ${response.data.community?.status}`);
        console.log(`   Members: ${response.data.community?.memberCount}`);
      } else {
        console.log('   ⚠️  No communities available to test individual endpoint');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Test filtering and search
    console.log('\n5. Testing community filtering:');
    try {
      const response = await axios.get(`${BASE_URL}/api/chat-communities?category=general&limit=5`);
      console.log(`   ✅ Success: ${response.data.communities?.length || 0} general communities found`);
      
      if (response.data.pagination) {
        console.log(`   Pagination: Page ${response.data.pagination.current} of ${response.data.pagination.pages}`);
        console.log(`   Total: ${response.data.pagination.total}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 Community endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testCommunityEndpoints();

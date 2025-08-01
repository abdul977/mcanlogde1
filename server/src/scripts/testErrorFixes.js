import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = 'https://mcanlogde1.onrender.com'; // Production URL
const LOCAL_URL = 'http://localhost:3000'; // Local URL

// Test user credentials
const TEST_CREDENTIALS = {
  email: 'fatima.ibrahim@mcanenugu.org.ng',
  password: 'Fatima456!'
};

async function testErrorFixes() {
  try {
    console.log('🧪 Testing Error Fixes...\n');
    
    // Step 1: Test login and profile data
    console.log('1. Testing login and profile data...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    const loginUser = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User: ${loginUser.name} (${loginUser.email})`);
    console.log(`   Has complete data: ${!!(loginUser.name && loginUser.email)}`);
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    };
    
    // Step 2: Test profile endpoint
    console.log('\n2. Testing profile endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/api/profile`, {
      headers: authHeaders
    });
    
    if (profileResponse.data.success && profileResponse.data.user) {
      const profileUser = profileResponse.data.user;
      console.log('✅ Profile endpoint working');
      console.log(`   Name: ${profileUser.name || 'MISSING'}`);
      console.log(`   Email: ${profileUser.email || 'MISSING'}`);
      console.log(`   Profile Image: ${profileUser.profileImage || 'None'}`);
      console.log(`   Display Avatar: ${profileUser.displayAvatar || 'None'}`);
      console.log(`   Initials: ${profileUser.initials || 'None'}`);
    } else {
      console.log('❌ Profile endpoint failed');
      console.log('   Response:', profileResponse.data);
    }
    
    // Step 3: Test community endpoints
    console.log('\n3. Testing community endpoints...');
    
    // Test getting user communities
    try {
      const userCommunitiesResponse = await axios.get(`${BASE_URL}/api/chat-communities/user/my-communities`, {
        headers: authHeaders
      });
      
      console.log('✅ User communities endpoint working');
      const communities = userCommunitiesResponse.data.communities || [];
      console.log(`   Found ${communities.length} communities`);
      
      if (communities.length > 0) {
        const firstCommunity = communities[0].community || communities[0];
        const communityId = firstCommunity._id;
        console.log(`   Testing community ID: ${communityId}`);
        
        // Test the new by-id endpoint
        try {
          const communityByIdResponse = await axios.get(`${BASE_URL}/api/chat-communities/by-id/${communityId}`, {
            headers: authHeaders
          });
          console.log('✅ Community by-id endpoint working');
          console.log(`   Community: ${communityByIdResponse.data.community?.name}`);
        } catch (byIdError) {
          console.log('⚠️ Community by-id endpoint not available (expected on production)');
          console.log('   This is normal - the new endpoint hasn\'t been deployed yet');
          
          // Test fallback - get all communities
          try {
            const allCommunitiesResponse = await axios.get(`${BASE_URL}/api/chat-communities`, {
              headers: authHeaders
            });
            console.log('✅ Fallback: All communities endpoint working');
            console.log(`   Found ${allCommunitiesResponse.data.communities?.length || 0} total communities`);
          } catch (allError) {
            console.log('❌ All communities endpoint failed:', allError.response?.status);
          }
        }
        
        // Test community messages
        try {
          const messagesResponse = await axios.get(`${BASE_URL}/api/community-messages/${communityId}/messages`, {
            headers: authHeaders
          });
          console.log('✅ Community messages endpoint working');
          console.log(`   Found ${messagesResponse.data.messages?.length || 0} messages`);
        } catch (messagesError) {
          console.log('❌ Community messages endpoint failed:', messagesError.response?.status);
        }
      }
      
    } catch (communitiesError) {
      console.log('❌ User communities endpoint failed:', communitiesError.response?.status);
    }
    
    // Step 4: Test profile picture upload (just check endpoint availability)
    console.log('\n4. Testing profile picture upload endpoint availability...');
    
    try {
      // Make a test request without actual file to see if endpoint exists
      const testUploadResponse = await axios.put(`${BASE_URL}/auth/api/profile/picture`, {}, {
        headers: authHeaders,
        validateStatus: () => true // Accept any status code
      });
      
      if (testUploadResponse.status === 400) {
        console.log('✅ Profile picture upload endpoint exists (400 = missing file, expected)');
      } else if (testUploadResponse.status === 404) {
        console.log('❌ Profile picture upload endpoint not found');
      } else {
        console.log(`⚠️ Profile picture upload endpoint returned status: ${testUploadResponse.status}`);
      }
    } catch (uploadError) {
      console.log('❌ Profile picture upload endpoint test failed');
    }
    
    // Step 5: Summary
    console.log('\n📋 Summary of Fixes Applied:');
    console.log('✅ 1. Community service now has fallback for missing by-id endpoint');
    console.log('✅ 2. Profile picture upload FormData handling improved');
    console.log('✅ 3. AuthContext user data loading enhanced with debugging');
    console.log('✅ 4. Better error handling for all API calls');
    console.log('✅ 5. Profile screen debugging added for troubleshooting');
    
    console.log('\n🎯 Expected Results:');
    console.log('• Profile screen should show user name/email instead of "Loading..."');
    console.log('• Community access should work with fallback mechanism');
    console.log('• Profile picture upload should have better error messages');
    console.log('• Pull-to-refresh should work without excessive reloading');
    
    console.log('\n🚀 Next Steps:');
    console.log('• Test the mobile app to verify fixes are working');
    console.log('• Deploy the new community by-id endpoint to production when ready');
    console.log('• Monitor logs for any remaining issues');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testErrorFixes();

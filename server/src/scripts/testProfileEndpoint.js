import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = 'http://localhost:3000';

// Test user credentials
const TEST_CREDENTIALS = {
  email: 'fatima.ibrahim@mcanenugu.org.ng',
  password: 'Fatima456!'
};

async function testProfileEndpoint() {
  try {
    console.log('🧪 Testing Profile Endpoint...\n');
    
    // Step 1: Login to get token
    console.log('1. Logging in to get authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    const loginUser = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User: ${loginUser.name} (${loginUser.email})`);
    console.log(`   Token length: ${token.length}`);
    console.log(`   User data from login:`, {
      id: loginUser.id,
      _id: loginUser._id,
      name: loginUser.name,
      email: loginUser.email,
      role: loginUser.role
    });
    
    // Step 2: Test profile endpoint
    console.log('\n2. Testing /auth/api/profile endpoint...');
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const profileResponse = await axios.get(`${BASE_URL}/auth/api/profile`, {
        headers: authHeaders
      });
      
      console.log('✅ Profile endpoint successful');
      console.log('   Response status:', profileResponse.status);
      console.log('   Response success:', profileResponse.data.success);
      
      if (profileResponse.data.success && profileResponse.data.user) {
        const profileUser = profileResponse.data.user;
        console.log('   Profile data:', {
          id: profileUser.id,
          _id: profileUser._id,
          name: profileUser.name,
          email: profileUser.email,
          role: profileUser.role,
          profileImage: profileUser.profileImage,
          avatar: profileUser.avatar,
          displayAvatar: profileUser.displayAvatar,
          initials: profileUser.initials,
          profileCompleted: profileUser.profileCompleted
        });
        
        // Check if essential fields are present
        const hasName = profileUser.name && profileUser.name.trim();
        const hasEmail = profileUser.email && profileUser.email.trim();
        
        console.log('\n📋 Data validation:');
        console.log(`   Has name: ${hasName ? '✅' : '❌'} (${profileUser.name})`);
        console.log(`   Has email: ${hasEmail ? '✅' : '❌'} (${profileUser.email})`);
        console.log(`   Has profile image: ${profileUser.profileImage ? '✅' : '❌'}`);
        console.log(`   Has avatar: ${profileUser.avatar ? '✅' : '❌'}`);
        console.log(`   Has display avatar: ${profileUser.displayAvatar ? '✅' : '❌'}`);
        
        if (!hasName || !hasEmail) {
          console.log('\n⚠️  Missing essential profile data - this would cause "Loading..." to show');
        } else {
          console.log('\n✅ All essential profile data is present');
        }
        
      } else {
        console.log('❌ Profile response missing user data');
        console.log('   Full response:', profileResponse.data);
      }
      
    } catch (profileError) {
      console.log('❌ Profile endpoint failed');
      console.log('   Status:', profileError.response?.status);
      console.log('   Error:', profileError.response?.data?.message || profileError.message);
      console.log('   Headers sent:', profileError.config?.headers);
    }
    
    // Step 3: Test alternative user info endpoint
    console.log('\n3. Testing alternative /auth/api/user endpoint...');
    
    try {
      const userInfoResponse = await axios.get(`${BASE_URL}/auth/api/user`, {
        headers: authHeaders
      });
      
      console.log('✅ User info endpoint successful');
      console.log('   Response:', userInfoResponse.data);
      
    } catch (userInfoError) {
      console.log('❌ User info endpoint failed');
      console.log('   Status:', userInfoError.response?.status);
      console.log('   Error:', userInfoError.response?.data?.message || userInfoError.message);
    }
    
    // Step 4: Test mobile app API client configuration
    console.log('\n4. Testing mobile app API configuration...');
    
    // Test with production URL (what mobile app uses)
    const PRODUCTION_URL = 'https://mcanlogde1.onrender.com';
    
    try {
      console.log(`   Testing production endpoint: ${PRODUCTION_URL}/auth/api/profile`);
      const prodProfileResponse = await axios.get(`${PRODUCTION_URL}/auth/api/profile`, {
        headers: authHeaders,
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ Production profile endpoint successful');
      console.log('   Status:', prodProfileResponse.status);
      console.log('   Has user data:', !!prodProfileResponse.data.user);
      
      if (prodProfileResponse.data.user) {
        const prodUser = prodProfileResponse.data.user;
        console.log('   Production user data:', {
          name: prodUser.name,
          email: prodUser.email,
          hasName: !!(prodUser.name && prodUser.name.trim()),
          hasEmail: !!(prodUser.email && prodUser.email.trim())
        });
      }
      
    } catch (prodError) {
      console.log('❌ Production profile endpoint failed');
      console.log('   Error:', prodError.message);
      if (prodError.code === 'ECONNABORTED') {
        console.log('   This might be a timeout issue - production server might be slow');
      }
    }
    
    console.log('\n🎉 Profile endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Error during profile testing:', error.message);
  }
}

// Run the test
testProfileEndpoint();

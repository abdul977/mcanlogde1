import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = 'http://localhost:3000';

// Admin credentials from seedUsers.js
const ADMIN_CREDENTIALS = {
  email: 'ahmed.hassan@mcanenugu.org.ng',
  password: 'Ahmed123!'
};

async function debugAuth() {
  try {
    console.log('🔍 Debugging Authentication...\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, ADMIN_CREDENTIALS);
    
    console.log('Login response:', {
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.user,
      userRole: loginResponse.data.user?.role
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed');
      return;
    }
    
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token length: ${adminToken.length}`);
    console.log(`   User ID: ${loginResponse.data.user._id}`);
    console.log(`   User Role: ${loginResponse.data.user.role}`);
    
    // Step 2: Test a simple authenticated endpoint first
    console.log('\n2. Testing basic authenticated endpoint...');
    try {
      const authHeaders = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      };
      
      // Try a simple endpoint that requires authentication but not admin
      const testResponse = await axios.get(
        `${BASE_URL}/api/chat-communities/user/my-communities`,
        { headers: authHeaders }
      );
      
      console.log('✅ Basic auth test successful');
      console.log('   Response:', testResponse.data);
      
    } catch (authError) {
      console.log('❌ Basic auth test failed:', authError.response?.data?.message || authError.message);
      console.log('   Status:', authError.response?.status);
      console.log('   Headers sent:', authError.config?.headers);
    }
    
    // Step 3: Test admin endpoint
    console.log('\n3. Testing admin endpoint...');
    try {
      const authHeaders = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      };
      
      const adminResponse = await axios.get(
        `${BASE_URL}/api/chat-communities/admin/all`,
        { headers: authHeaders }
      );
      
      console.log('✅ Admin endpoint test successful');
      console.log('   Communities found:', adminResponse.data.communities?.length || 0);
      
    } catch (adminError) {
      console.log('❌ Admin endpoint test failed:', adminError.response?.data?.message || adminError.message);
      console.log('   Status:', adminError.response?.status);
      console.log('   Response data:', adminError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Error during auth debugging:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

// Run the debug
debugAuth();

// Test script to verify backend connection
import axios from 'axios';

const BACKEND_URL = 'https://mcanlogde1.onrender.com';

async function testBackendConnection() {
  console.log('🧪 Testing Backend Connection...');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Test 1: Basic health check
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 30000 // 30 seconds timeout for cold start
    });
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: API status
    console.log('\n2️⃣ Testing API status...');
    const statusResponse = await axios.get(`${BACKEND_URL}/api/status`, {
      timeout: 30000
    });
    console.log('✅ API status check passed:', statusResponse.data);
    
    // Test 3: Test a real API endpoint
    console.log('\n3️⃣ Testing posts endpoint...');
    const postsResponse = await axios.get(`${BACKEND_URL}/api/post/get-all-post`, {
      timeout: 30000
    });
    console.log('✅ Posts endpoint working:', {
      success: postsResponse.data.success,
      postsCount: postsResponse.data.posts?.length || 0
    });
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Backend connection failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('- Server is not running or not accessible');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('- Request timed out (server might be starting up)');
    } else if (error.response) {
      console.error('- Server responded with error:', error.response.status, error.response.data);
    } else {
      console.error('- Network error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if the backend is deployed on Render');
    console.log('2. Verify environment variables are set correctly');
    console.log('3. Check Render logs for any startup errors');
    console.log('4. Wait 30-60 seconds for cold start (free tier)');
  }
}

// Run the test
testBackendConnection();

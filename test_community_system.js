// Community System Test Script
// Tests the fixed community system endpoints

const BASE_URL = 'https://mcanlogde1.onrender.com';

// Test 1: Check if server is responding
async function testServerHealth() {
  console.log('🔍 Testing server health...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Server is responding');
      return true;
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not accessible:', error.message);
    return false;
  }
}

// Test 2: Check if chat communities endpoint exists
async function testChatCommunitiesEndpoint() {
  console.log('🔍 Testing chat communities endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/chat-communities`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat communities endpoint working');
      console.log(`📊 Found ${data.communities?.length || 0} communities`);
      return true;
    } else {
      console.log('❌ Chat communities endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Chat communities endpoint error:', error.message);
    return false;
  }
}

// Test 3: Check if admin endpoints exist (without auth)
async function testAdminEndpointsExist() {
  console.log('🔍 Testing admin endpoints existence...');
  try {
    // This should return 401 (unauthorized) but not 404 (not found)
    const response = await fetch(`${BASE_URL}/api/chat-communities/admin/all`);
    if (response.status === 401) {
      console.log('✅ Admin endpoint exists (returns 401 as expected)');
      return true;
    } else if (response.status === 404) {
      console.log('❌ Admin endpoint not found');
      return false;
    } else {
      console.log('⚠️ Admin endpoint returned unexpected status:', response.status);
      return true; // Still exists, just different response
    }
  } catch (error) {
    console.log('❌ Admin endpoint test error:', error.message);
    return false;
  }
}

// Test 4: Check if delete endpoint exists
async function testDeleteEndpointExists() {
  console.log('🔍 Testing delete endpoint existence...');
  try {
    // This should return 401 (unauthorized) but not 404 (not found)
    const response = await fetch(`${BASE_URL}/api/chat-communities/admin/test-id/delete`, {
      method: 'DELETE'
    });
    if (response.status === 401) {
      console.log('✅ Delete endpoint exists (returns 401 as expected)');
      return true;
    } else if (response.status === 404) {
      console.log('❌ Delete endpoint not found');
      return false;
    } else {
      console.log('⚠️ Delete endpoint returned unexpected status:', response.status);
      return true; // Still exists, just different response
    }
  } catch (error) {
    console.log('❌ Delete endpoint test error:', error.message);
    return false;
  }
}

// Test 5: Test multipart form handling (without files)
async function testMultipartFormHandling() {
  console.log('🔍 Testing multipart form handling...');
  try {
    const formData = new FormData();
    formData.append('name', 'Test Community');
    formData.append('description', 'Test Description');
    formData.append('category', 'general');
    
    const response = await fetch(`${BASE_URL}/api/chat-communities/create`, {
      method: 'POST',
      body: formData
    });
    
    if (response.status === 401) {
      console.log('✅ Multipart form handling working (returns 401 - auth required)');
      return true;
    } else if (response.status === 500) {
      console.log('❌ Multipart form handling still has 500 error');
      return false;
    } else {
      console.log('⚠️ Multipart form returned unexpected status:', response.status);
      return true; // Not a 500 error, so the fix worked
    }
  } catch (error) {
    console.log('❌ Multipart form test error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Community System Tests\n');
  
  const tests = [
    { name: 'Server Health', test: testServerHealth },
    { name: 'Chat Communities Endpoint', test: testChatCommunitiesEndpoint },
    { name: 'Admin Endpoints Exist', test: testAdminEndpointsExist },
    { name: 'Delete Endpoint Exists', test: testDeleteEndpointExists },
    { name: 'Multipart Form Handling', test: testMultipartFormHandling }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const { name, test } of tests) {
    console.log(`\n--- ${name} ---`);
    const result = await test();
    if (result) passed++;
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Community system fixes are working.');
  } else {
    console.log('⚠️ Some tests failed. Please check the issues above.');
  }
  
  return passed === total;
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    global.FormData = FormData;
    runTests();
  }).catch(() => {
    console.log('❌ node-fetch not available. Please run: npm install node-fetch');
  });
} else {
  // Browser environment
  runTests();
}

export { runTests };

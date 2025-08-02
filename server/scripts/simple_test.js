// Simple test to verify community system fixes
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCommunityEndpoints() {
  console.log('🚀 Testing Community System Endpoints\n');
  
  // Test 1: Get all communities
  console.log('1. Testing GET /api/chat-communities');
  try {
    const response = await makeRequest('https://mcanlogde1.onrender.com/api/chat-communities');
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      const data = JSON.parse(response.data);
      console.log(`   ✅ Success - Found ${data.communities?.length || 0} communities`);
    } else {
      console.log(`   ❌ Failed with status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: Test admin endpoint (should return 401)
  console.log('2. Testing GET /api/chat-communities/admin/all');
  try {
    const response = await makeRequest('https://mcanlogde1.onrender.com/api/chat-communities/admin/all');
    console.log(`   Status: ${response.status}`);
    if (response.status === 401) {
      console.log('   ✅ Admin endpoint exists (401 Unauthorized as expected)');
    } else if (response.status === 404) {
      console.log('   ❌ Admin endpoint not found');
    } else {
      console.log(`   ⚠️ Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 3: Test delete endpoint (should return 401)
  console.log('3. Testing DELETE /api/chat-communities/admin/test/delete');
  try {
    const response = await makeRequest('https://mcanlogde1.onrender.com/api/chat-communities/admin/test/delete', {
      method: 'DELETE'
    });
    console.log(`   Status: ${response.status}`);
    if (response.status === 401) {
      console.log('   ✅ Delete endpoint exists (401 Unauthorized as expected)');
    } else if (response.status === 404) {
      console.log('   ❌ Delete endpoint not found');
    } else {
      console.log(`   ⚠️ Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 4: Test multipart form (should return 401, not 500)
  console.log('4. Testing POST /api/chat-communities/create (multipart form)');
  try {
    const boundary = '----formdata-boundary-' + Math.random().toString(36);
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="name"',
      '',
      'Test Community',
      `--${boundary}`,
      'Content-Disposition: form-data; name="description"',
      '',
      'Test Description',
      `--${boundary}--`
    ].join('\r\n');
    
    const response = await makeRequest('https://mcanlogde1.onrender.com/api/chat-communities/create', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      },
      body: formData
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 401) {
      console.log('   ✅ Multipart form handling fixed (401 Unauthorized, not 500 error)');
    } else if (response.status === 500) {
      console.log('   ❌ Multipart form still has 500 error');
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
    } else {
      console.log(`   ⚠️ Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n🏁 Test completed!');
}

testCommunityEndpoints();

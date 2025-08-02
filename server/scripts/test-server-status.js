// Test server status and basic endpoints
const https = require('https');

const testEndpoint = (path, description) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'mcanlogde1-master.onrender.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Test Client'
      }
    };

    console.log(`\n--- Testing ${description} ---`);
    console.log('URL:', `https://${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
      console.log('Status:', res.statusCode, res.statusMessage);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (data.length < 200) {
          console.log('Response:', data);
        } else {
          console.log('Response length:', data.length, 'characters');
          console.log('First 100 chars:', data.substring(0, 100));
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error.message);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.error('Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('Testing server endpoints...');
  
  await testEndpoint('/', 'Root endpoint');
  await testEndpoint('/api/payment-config/details', 'Payment config details');
  await testEndpoint('/api/products', 'Products endpoint');
  await testEndpoint('/api/orders', 'Orders endpoint');
  
  console.log('\nAll tests completed.');
};

runTests();

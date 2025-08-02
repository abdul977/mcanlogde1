// Test the correct server URL that mobile app uses
const https = require('https');

const testEndpoint = (hostname, path, description) => {
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
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
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log('Success! Response:', JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log('Response (not JSON):', data.substring(0, 200));
          }
        } else {
          console.log('Response:', data.substring(0, 100));
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.error('Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('Testing both server URLs...');
  
  // Test the URL mobile app uses
  await testEndpoint('mcanlogde1.onrender.com', '/', 'Mobile app server root');
  await testEndpoint('mcanlogde1.onrender.com', '/api/payment-config/details', 'Mobile app payment config');
  
  // Test the URL we were using before
  await testEndpoint('mcanlogde1-master.onrender.com', '/', 'Master server root');
  await testEndpoint('mcanlogde1-master.onrender.com', '/api/payment-config/details', 'Master payment config');
  
  console.log('\nAll tests completed.');
};

runTests();

// Simple test to check payment configuration API
const https = require('https');

const testPaymentConfigAPI = () => {
  const options = {
    hostname: 'mcanlogde1-master.onrender.com',
    port: 443,
    path: '/api/payment-config/details',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Node.js Test Client'
    }
  };

  console.log('Testing payment configuration API...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log('\n--- Response ---');
    console.log('Status Code:', res.statusCode);
    console.log('Status Message:', res.statusMessage);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n--- Response Body ---');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (jsonData.success && jsonData.paymentDetails) {
          console.log('\n--- Bank Details Analysis ---');
          const bankDetails = jsonData.paymentDetails.bankDetails;
          console.log('Account Number:', bankDetails.accountNumber);
          console.log('Bank Name:', bankDetails.bankName);
          console.log('Account Name:', bankDetails.accountName);
          
          const isConfigured = !!(
            bankDetails.accountNumber &&
            bankDetails.bankName &&
            bankDetails.accountNumber !== 'Please configure bank details' &&
            bankDetails.bankName !== 'Please configure bank details' &&
            bankDetails.accountNumber !== '0000000000'
          );
          console.log('Bank Details Configured:', isConfigured);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('JSON Parse Error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error.message);
  });

  req.setTimeout(10000, () => {
    console.error('Request timeout');
    req.destroy();
  });

  req.end();
};

testPaymentConfigAPI();

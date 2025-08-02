// Test the updated payment configuration API
const https = require('https');

const testPaymentConfigAPI = () => {
  const options = {
    hostname: 'mcanlogde1.onrender.com',
    port: 443,
    path: '/api/payment-config/details',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Node.js Test Client'
    }
  };

  console.log('Testing updated payment configuration API...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log('\n--- Response ---');
    console.log('Status Code:', res.statusCode);
    console.log('Status Message:', res.statusMessage);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n--- Response Analysis ---');
      try {
        const jsonData = JSON.parse(data);
        console.log('Success:', jsonData.success);
        
        if (jsonData.success && jsonData.paymentDetails) {
          const bankDetails = jsonData.paymentDetails.bankDetails;
          console.log('\n--- Bank Details from API ---');
          console.log('Account Name:', bankDetails.accountName);
          console.log('Account Number:', bankDetails.accountNumber);
          console.log('Bank Name:', bankDetails.bankName);
          console.log('Sort Code:', bankDetails.sortCode);
          
          // Test the same validation logic as mobile app
          const isConfigured = !!(
            bankDetails.accountNumber &&
            bankDetails.bankName &&
            bankDetails.accountNumber !== 'Please configure bank details' &&
            bankDetails.bankName !== 'Please configure bank details' &&
            bankDetails.accountNumber !== '0000000000'
          );
          
          console.log('\n--- Mobile App Validation ---');
          console.log('Bank Details Configured:', isConfigured);
          
          if (isConfigured) {
            console.log('✅ SUCCESS: Mobile app should now display bank details!');
          } else {
            console.log('❌ ISSUE: Mobile app will still show "not configured" message');
          }
          
          // Show mobile payments if any
          if (jsonData.paymentDetails.mobilePayments && jsonData.paymentDetails.mobilePayments.length > 0) {
            console.log('\n--- Mobile Payments ---');
            jsonData.paymentDetails.mobilePayments.forEach(payment => {
              console.log(`${payment.provider}: ${payment.number} (${payment.accountName})`);
            });
          }
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

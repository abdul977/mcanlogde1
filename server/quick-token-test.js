// Quick test to check token structure after server restart
import jwt from 'jsonwebtoken';

async function quickTest() {
  console.log('🔍 Quick Token Test After Server Restart\n');

  try {
    // Login and get token
    const response = await fetch('http://localhost:3000/auth/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@mcanlodge.com',
        password: 'YourSecurePassword123!'
      })
    });

    const result = await response.json();
    console.log('Login Status:', response.status);
    
    if (!response.ok) {
      console.log('❌ Login failed:', result);
      return;
    }

    console.log('✅ Login successful');
    const token = result.token;

    // Decode token
    const decoded = jwt.decode(token, { complete: true });
    console.log('\n📋 Token Payload:');
    console.log(JSON.stringify(decoded.payload, null, 2));

    // Check for user ID
    const payload = decoded.payload;
    console.log('\n🔍 User ID Check:');
    console.log('Has _id:', !!payload._id);
    console.log('Has id:', !!payload.id);
    console.log('Has buffer:', !!payload.buffer);
    console.log('Type of _id:', typeof payload._id);
    console.log('Type of id:', typeof payload.id);

    if (payload._id && typeof payload._id === 'string') {
      console.log('✅ Token has valid user ID');
      
      // Test authentication
      const authResponse = await fetch('http://localhost:3000/auth/api/user-auth', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('\n🔐 Auth Test Status:', authResponse.status);
      const authResult = await authResponse.json();
      console.log('Auth Result:', authResult);
      
    } else {
      console.log('❌ Token missing valid user ID - server needs restart');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

quickTest();

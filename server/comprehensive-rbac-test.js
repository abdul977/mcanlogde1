// Comprehensive RBAC System Test
async function testRBACSystem() {
  console.log('🧪 Comprehensive RBAC System Test\n');
  console.log('=' .repeat(50));

  let accessToken = null;

  try {
    // Step 1: Login
    console.log('\n1️⃣ Testing Login...');
    const loginResponse = await fetch('http://localhost:3000/auth/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@mcanlodge.com',
        password: 'YourSecurePassword123!'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    console.log('Response:', loginResult);

    if (!loginResponse.ok) {
      console.log('❌ Login failed - stopping test');
      return;
    }

    accessToken = loginResult.token;
    console.log('✅ Login successful');

    // Step 2: Test User Authentication
    console.log('\n2️⃣ Testing User Authentication...');
    const userAuthResponse = await fetch('http://localhost:3000/auth/api/user-auth', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const userAuthResult = await userAuthResponse.json();
    console.log('Status:', userAuthResponse.status);
    console.log('Response:', userAuthResult);

    if (userAuthResponse.ok) {
      console.log('✅ User authentication successful');
    } else {
      console.log('❌ User authentication failed');
    }

    // Step 3: Test Admin Authentication
    console.log('\n3️⃣ Testing Admin Authentication...');
    const adminAuthResponse = await fetch('http://localhost:3000/auth/api/admin-auth', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const adminAuthResult = await adminAuthResponse.json();
    console.log('Status:', adminAuthResponse.status);
    console.log('Response:', adminAuthResult);

    if (adminAuthResponse.ok) {
      console.log('✅ Admin authentication successful');
    } else {
      console.log('❌ Admin authentication failed');
    }

    // Step 4: Test MFA Setup
    console.log('\n4️⃣ Testing MFA Setup...');
    const mfaResponse = await fetch('http://localhost:3000/api/mfa/setup/totp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceName: 'Test Device'
      })
    });

    console.log('MFA Status:', mfaResponse.status);
    
    if (mfaResponse.ok) {
      const mfaResult = await mfaResponse.json();
      console.log('MFA Response:', mfaResult);
      console.log('✅ MFA setup endpoint working');
    } else {
      const mfaError = await mfaResponse.text();
      console.log('MFA Error:', mfaError);
      console.log('❌ MFA setup failed');
    }

    // Step 5: Test Admin User Management
    console.log('\n5️⃣ Testing Admin User Management...');
    const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Users Status:', usersResponse.status);
    
    if (usersResponse.ok) {
      const usersResult = await usersResponse.json();
      console.log('Users Response:', usersResult);
      console.log('✅ Admin user management endpoint working');
    } else {
      const usersError = await usersResponse.text();
      console.log('Users Error:', usersError);
      console.log('❌ Admin user management failed');
    }

    // Step 6: Test Role Management
    console.log('\n6️⃣ Testing Role Management...');
    const rolesResponse = await fetch('http://localhost:3000/api/admin/roles', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Roles Status:', rolesResponse.status);
    
    if (rolesResponse.ok) {
      const rolesResult = await rolesResponse.json();
      console.log('Roles Response:', rolesResult);
      console.log('✅ Role management endpoint working');
    } else {
      const rolesError = await rolesResponse.text();
      console.log('Roles Error:', rolesError);
      console.log('❌ Role management failed');
    }

    // Step 7: Test Security Stats
    console.log('\n7️⃣ Testing Security Statistics...');
    const statsResponse = await fetch('http://localhost:3000/api/admin/security/stats', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Stats Status:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsResult = await statsResponse.json();
      console.log('Stats Response:', statsResult);
      console.log('✅ Security statistics endpoint working');
    } else {
      const statsError = await statsResponse.text();
      console.log('Stats Error:', statsError);
      console.log('❌ Security statistics failed');
    }

    // Step 8: Test System Health
    console.log('\n8️⃣ Testing System Health...');
    const healthResponse = await fetch('http://localhost:3000/api/admin/system/health', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Health Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthResult = await healthResponse.json();
      console.log('Health Response:', healthResult);
      console.log('✅ System health endpoint working');
    } else {
      const healthError = await healthResponse.text();
      console.log('Health Error:', healthError);
      console.log('❌ System health failed');
    }

    // Summary
    console.log('\n📊 Test Summary');
    console.log('=' .repeat(50));
    console.log('✅ Login: Working');
    console.log(userAuthResponse.ok ? '✅ User Auth: Working' : '❌ User Auth: Failed');
    console.log(adminAuthResponse.ok ? '✅ Admin Auth: Working' : '❌ Admin Auth: Failed');
    console.log(mfaResponse.ok ? '✅ MFA Setup: Working' : '❌ MFA Setup: Failed');
    console.log(usersResponse.ok ? '✅ User Management: Working' : '❌ User Management: Failed');
    console.log(rolesResponse.ok ? '✅ Role Management: Working' : '❌ Role Management: Failed');
    console.log(statsResponse.ok ? '✅ Security Stats: Working' : '❌ Security Stats: Failed');
    console.log(healthResponse.ok ? '✅ System Health: Working' : '❌ System Health: Failed');

    console.log('\n🎉 RBAC System Test Complete!');

    if (adminAuthResponse.ok) {
      console.log('\n🚀 Next Steps:');
      console.log('1. Set up MFA for the super admin account');
      console.log('2. Create additional admin users');
      console.log('3. Test permission-based access control');
      console.log('4. Review audit logs');
    } else {
      console.log('\n⚠️ Issues Found:');
      console.log('- JWT token audience/issuer configuration needs fixing');
      console.log('- Restart the server after code changes');
      console.log('- Verify token manager is being used correctly');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testRBACSystem();

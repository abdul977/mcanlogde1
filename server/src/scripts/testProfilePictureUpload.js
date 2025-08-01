import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

const BASE_URL = 'http://localhost:3000';

// Test user credentials
const TEST_CREDENTIALS = {
  email: 'fatima.ibrahim@mcanenugu.org.ng',
  password: 'Fatima456!'
};

async function testProfilePictureUpload() {
  try {
    console.log('🧪 Testing Profile Picture Upload...\n');
    
    // Step 1: Login to get token
    console.log('1. Logging in to get authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/api/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    const loginUser = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User: ${loginUser.name} (${loginUser.email})`);
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    };
    
    // Step 2: Check current profile data
    console.log('\n2. Checking current profile data...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/api/profile`, {
      headers: authHeaders
    });
    
    if (profileResponse.data.success && profileResponse.data.user) {
      const currentUser = profileResponse.data.user;
      console.log('✅ Current profile data:');
      console.log(`   Name: ${currentUser.name}`);
      console.log(`   Email: ${currentUser.email}`);
      console.log(`   Profile Image: ${currentUser.profileImage || 'None'}`);
      console.log(`   Avatar: ${currentUser.avatar || 'None'}`);
      console.log(`   Display Avatar: ${currentUser.displayAvatar || 'None'}`);
      console.log(`   Initials: ${currentUser.initials || 'None'}`);
    }
    
    // Step 3: Create a test image file
    console.log('\n3. Creating test image file...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]);
    
    const testImagePath = path.join(process.cwd(), 'src/uploads/temp/test-profile.png');
    
    // Ensure temp directory exists
    const tempDir = path.dirname(testImagePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log('✅ Test image created:', testImagePath);
    console.log(`   File size: ${fs.statSync(testImagePath).size} bytes`);
    
    // Step 4: Test profile picture upload
    console.log('\n4. Testing profile picture upload...');
    
    try {
      const formData = new FormData();
      formData.append('profileImage', fs.createReadStream(testImagePath), {
        filename: 'test-profile.png',
        contentType: 'image/png'
      });
      
      console.log('📤 Uploading profile picture...');
      const uploadResponse = await axios.put(
        `${BASE_URL}/auth/api/profile/picture`,
        formData,
        {
          headers: {
            ...authHeaders,
            ...formData.getHeaders()
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log('✅ Profile picture upload successful');
      console.log('   Response status:', uploadResponse.status);
      console.log('   Response data:', uploadResponse.data);
      
      if (uploadResponse.data.success && uploadResponse.data.data) {
        const uploadData = uploadResponse.data.data;
        console.log('   New profile image URL:', uploadData.profileImage);
        console.log('   New avatar URL:', uploadData.avatar);
        console.log('   New display avatar URL:', uploadData.displayAvatar);
      }
      
    } catch (uploadError) {
      console.log('❌ Profile picture upload failed');
      console.log('   Status:', uploadError.response?.status);
      console.log('   Error:', uploadError.response?.data?.message || uploadError.message);
      console.log('   Full error response:', uploadError.response?.data);
    }
    
    // Step 5: Verify updated profile data
    console.log('\n5. Verifying updated profile data...');
    const updatedProfileResponse = await axios.get(`${BASE_URL}/auth/api/profile`, {
      headers: authHeaders
    });
    
    if (updatedProfileResponse.data.success && updatedProfileResponse.data.user) {
      const updatedUser = updatedProfileResponse.data.user;
      console.log('✅ Updated profile data:');
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Profile Image: ${updatedUser.profileImage || 'None'}`);
      console.log(`   Avatar: ${updatedUser.avatar || 'None'}`);
      console.log(`   Display Avatar: ${updatedUser.displayAvatar || 'None'}`);
      console.log(`   Initials: ${updatedUser.initials || 'None'}`);
      
      // Check if profile image was updated
      if (updatedUser.profileImage && updatedUser.profileImage.includes('supabase.co')) {
        console.log('✅ Profile image successfully uploaded to Supabase');
      } else {
        console.log('⚠️  Profile image may not have been uploaded correctly');
      }
    }
    
    // Step 6: Test mobile app endpoint compatibility
    console.log('\n6. Testing mobile app endpoint compatibility...');
    
    // Test with production URL (what mobile app uses)
    const PRODUCTION_URL = 'https://mcanlogde1.onrender.com';
    
    try {
      console.log(`   Testing production profile endpoint: ${PRODUCTION_URL}/auth/api/profile`);
      const prodProfileResponse = await axios.get(`${PRODUCTION_URL}/auth/api/profile`, {
        headers: authHeaders,
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ Production profile endpoint successful');
      
      if (prodProfileResponse.data.user) {
        const prodUser = prodProfileResponse.data.user;
        console.log('   Production profile data:', {
          name: prodUser.name,
          email: prodUser.email,
          hasProfileImage: !!prodUser.profileImage,
          hasAvatar: !!prodUser.avatar,
          hasDisplayAvatar: !!prodUser.displayAvatar,
          initials: prodUser.initials
        });
      }
      
    } catch (prodError) {
      console.log('❌ Production profile endpoint failed');
      console.log('   Error:', prodError.message);
      if (prodError.code === 'ECONNABORTED') {
        console.log('   This might be a timeout issue - production server might be slow');
      }
    }
    
    // Cleanup
    console.log('\n7. Cleaning up...');
    try {
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
        console.log('✅ Test image file cleaned up');
      }
    } catch (cleanupError) {
      console.log('⚠️  Could not clean up test image file:', cleanupError.message);
    }
    
    console.log('\n🎉 Profile picture upload testing completed!');
    
  } catch (error) {
    console.error('❌ Error during profile picture upload testing:', error.message);
  }
}

// Run the test
testProfilePictureUpload();

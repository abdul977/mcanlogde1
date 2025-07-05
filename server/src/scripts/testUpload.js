import supabaseStorage from '../services/supabaseStorage.js';

async function testUpload() {
  console.log('🧪 Testing Supabase Storage Upload...');
  
  try {
    // Create a test file
    const testFile = {
      data: Buffer.from('This is a test file content for MCAN Lodge'),
      name: 'test-upload.txt',
      mimetype: 'text/plain'
    };
    
    console.log('📤 Uploading test file...');
    
    // Test upload to mcan-donations bucket
    const result = await supabaseStorage.uploadFile(
      'mcan-donations',
      `test/upload-test-${Date.now()}.txt`,
      testFile.data,
      { contentType: testFile.mimetype }
    );
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log('🔗 File URL:', result.data.secure_url);
      console.log('📊 File size:', result.data.bytes, 'bytes');
      console.log('🎉 Your Supabase Storage is working correctly!');
      
      // Test if URL is accessible
      console.log('\n🌐 Testing URL accessibility...');
      try {
        const response = await fetch(result.data.secure_url);
        if (response.ok) {
          console.log('✅ File is publicly accessible!');
          const content = await response.text();
          console.log('📄 File content:', content);
        } else {
          console.log('⚠️  File uploaded but not publicly accessible:', response.status);
        }
      } catch (fetchError) {
        console.log('⚠️  Could not test URL accessibility:', fetchError.message);
      }
      
    } else {
      console.log('❌ Upload failed:', result.error);
      
      if (result.error.includes('bucket')) {
        console.log('\n💡 This error suggests the bucket doesn\'t exist.');
        console.log('📋 Please create the storage buckets in your Supabase dashboard:');
        console.log('   1. Go to Storage in Supabase dashboard');
        console.log('   2. Create bucket: mcan-donations (make it public)');
        console.log('   3. Repeat for all required buckets');
      }
    }
    
  } catch (error) {
    console.log('💥 Test failed with error:', error.message);
    
    if (error.message.includes('Invalid Compact JWS')) {
      console.log('\n🔧 JWT Token Issue:');
      console.log('   - Check your SUPABASE_ANON_KEY in .env file');
      console.log('   - Make sure it starts with "eyJ" and has 3 parts separated by dots');
    }
  }
}

// Run the test
console.log('🚀 Starting Supabase Storage Test...');
console.log('=' .repeat(50));

testUpload()
  .then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed!');
  })
  .catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });

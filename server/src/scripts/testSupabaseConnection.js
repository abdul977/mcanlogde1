import supabase from '../config/supabase.js';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('📦 Available buckets:', data.map(bucket => bucket.name));
    
    // Test 2: Check required buckets
    console.log('\n2. Checking required buckets...');
    const requiredBuckets = [
      'mcan-donations', 'mcan-posts', 'mcan-community', 'mcan-resources',
      'mcan-services', 'mcan-quran-classes', 'mcan-authors', 
      'mcan-participants', 'mcan-thumbnails'
    ];
    
    const existingBuckets = data.map(bucket => bucket.name);
    const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));
    
    if (missingBuckets.length > 0) {
      console.log('⚠️  Missing buckets:', missingBuckets);
      console.log('📝 Please create these buckets in your Supabase dashboard');
    } else {
      console.log('✅ All required buckets exist!');
    }
    
    // Test 3: Test upload capability
    console.log('\n3. Testing upload capability...');
    const testBucket = existingBuckets.find(bucket => requiredBuckets.includes(bucket));
    
    if (testBucket) {
      const testFile = Buffer.from('test-content');
      const testPath = `test/connection-test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(testBucket)
        .upload(testPath, testFile);
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError.message);
      } else {
        console.log('✅ Upload test successful!');
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(testBucket)
          .getPublicUrl(testPath);
        
        console.log('🔗 Test file URL:', urlData.publicUrl);
        
        // Clean up test file
        await supabase.storage.from(testBucket).remove([testPath]);
        console.log('🧹 Test file cleaned up');
      }
    } else {
      console.log('⚠️  No suitable bucket found for upload test');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 Supabase connection test completed successfully!');
      console.log('✅ Your migration should work correctly now.');
    } else {
      console.log('❌ Supabase connection test failed.');
      console.log('🔧 Please check your configuration and try again.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });

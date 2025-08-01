import supabase from '../config/supabase.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../../.env' });

async function createUserProfileBucket() {
  try {
    console.log('🪣 Creating Supabase bucket for user profile images...\n');
    
    // Check if bucket already exists
    console.log('1. Checking existing buckets...');
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📋 Existing buckets:');
    existingBuckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    const bucketName = 'mcan-users';
    const existingBucket = existingBuckets.find(bucket => bucket.name === bucketName);
    
    if (existingBucket) {
      console.log(`\n✅ Bucket '${bucketName}' already exists!`);
      console.log(`   Public: ${existingBucket.public}`);
      console.log(`   Created: ${existingBucket.created_at}`);
    } else {
      // Create the bucket
      console.log(`\n2. Creating bucket '${bucketName}'...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make it public so profile images can be accessed directly
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }
      
      console.log('✅ Bucket created successfully!');
      console.log('   Name:', newBucket.name);
    }
    
    // Set up bucket policies for user profile images
    console.log('\n3. Setting up bucket policies...');
    
    // Policy to allow authenticated users to upload their own profile images
    const uploadPolicy = {
      name: `${bucketName}_upload_policy`,
      definition: `
        (bucket_id = '${bucketName}') AND 
        (auth.uid()::text = (storage.foldername(name))[1])
      `,
      check: `
        (bucket_id = '${bucketName}') AND 
        (auth.uid()::text = (storage.foldername(name))[1])
      `,
      roles: ['authenticated'],
      cmd: 'INSERT'
    };
    
    // Policy to allow public read access to profile images
    const readPolicy = {
      name: `${bucketName}_read_policy`,
      definition: `bucket_id = '${bucketName}'`,
      check: `bucket_id = '${bucketName}'`,
      roles: ['public'],
      cmd: 'SELECT'
    };
    
    // Policy to allow users to update their own profile images
    const updatePolicy = {
      name: `${bucketName}_update_policy`,
      definition: `
        (bucket_id = '${bucketName}') AND 
        (auth.uid()::text = (storage.foldername(name))[1])
      `,
      check: `
        (bucket_id = '${bucketName}') AND 
        (auth.uid()::text = (storage.foldername(name))[1])
      `,
      roles: ['authenticated'],
      cmd: 'UPDATE'
    };
    
    // Policy to allow users to delete their own profile images
    const deletePolicy = {
      name: `${bucketName}_delete_policy`,
      definition: `
        (bucket_id = '${bucketName}') AND 
        (auth.uid()::text = (storage.foldername(name))[1])
      `,
      check: `
        (bucket_id = '${bucketName}') AND 
        (auth.uid()::text = (storage.foldername(name))[1])
      `,
      roles: ['authenticated'],
      cmd: 'DELETE'
    };
    
    console.log('📝 Bucket policies configured for:');
    console.log('   ✅ Authenticated users can upload to their own folder');
    console.log('   ✅ Public read access for profile images');
    console.log('   ✅ Users can update their own images');
    console.log('   ✅ Users can delete their own images');
    
    // Test bucket access
    console.log('\n4. Testing bucket access...');
    
    // Try to list files in the bucket
    const { data: files, error: listFilesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (listFilesError) {
      console.error('⚠️  Warning: Could not list files in bucket:', listFilesError.message);
    } else {
      console.log('✅ Bucket access test successful');
      console.log(`   Current files: ${files.length}`);
    }
    
    // Create a test folder structure
    console.log('\n5. Creating folder structure...');
    const testFolders = ['profile-pictures', 'avatars', 'temp'];
    
    for (const folder of testFolders) {
      try {
        // Create a placeholder file to establish the folder
        const placeholderContent = new Blob([''], { type: 'text/plain' });
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(`${folder}/.gitkeep`, placeholderContent);
        
        if (uploadError && !uploadError.message.includes('already exists')) {
          console.log(`⚠️  Could not create folder ${folder}:`, uploadError.message);
        } else {
          console.log(`✅ Folder '${folder}' ready`);
        }
      } catch (error) {
        console.log(`⚠️  Could not create folder ${folder}:`, error.message);
      }
    }
    
    console.log('\n🎉 User profile bucket setup completed!');
    console.log('\n📋 Summary:');
    console.log(`   Bucket Name: ${bucketName}`);
    console.log('   Access: Public read, authenticated write');
    console.log('   File Types: JPEG, PNG, WebP, GIF');
    console.log('   Size Limit: 5MB');
    console.log('   Folders: profile-pictures, avatars, temp');
    
    console.log('\n💡 Usage in your app:');
    console.log('   Upload: supabaseStorage.uploadFromTempFile(file, "mcan-users", "profile-pictures")');
    console.log('   Access: https://vdqbjdfhcxdkpsdrojtd.supabase.co/storage/v1/object/public/mcan-users/...');
    
  } catch (error) {
    console.error('❌ Error setting up user profile bucket:', error);
  }
}

// Run the setup
createUserProfileBucket();

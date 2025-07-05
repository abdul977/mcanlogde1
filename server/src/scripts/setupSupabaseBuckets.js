import supabase from '../config/supabase.js';

const buckets = [
  {
    name: 'mcan-donations',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'mcan-posts',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'mcan-community',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'mcan-resources',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    fileSizeLimit: 10485760 // 10MB for documents
  },
  {
    name: 'mcan-services',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'mcan-quran-classes',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'mcan-authors',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 2097152 // 2MB for author images
  },
  {
    name: 'mcan-participants',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 2097152 // 2MB for participant images
  },
  {
    name: 'mcan-thumbnails',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 1048576 // 1MB for thumbnails
  }
];

async function createBucket(bucketConfig) {
  try {
    console.log(`Creating bucket: ${bucketConfig.name}`);
    
    const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
      public: bucketConfig.public,
      allowedMimeTypes: bucketConfig.allowedMimeTypes,
      fileSizeLimit: bucketConfig.fileSizeLimit
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✓ Bucket ${bucketConfig.name} already exists`);
        return true;
      }
      throw error;
    }

    console.log(`✓ Created bucket: ${bucketConfig.name}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to create bucket ${bucketConfig.name}:`, error.message);
    return false;
  }
}

async function setupBuckets() {
  console.log('Setting up Supabase Storage buckets...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const bucket of buckets) {
    const success = await createBucket(bucket);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n=== Setup Summary ===');
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`Total: ${buckets.length}`);

  if (failCount === 0) {
    console.log('\n🎉 All buckets created successfully!');
  } else {
    console.log('\n⚠️  Some buckets failed to create. Please check the errors above.');
  }
}

// Run the setup
setupBuckets().catch(console.error);

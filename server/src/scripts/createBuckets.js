import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// For bucket creation, we need service role permissions
// Use service key if available (JWT format), otherwise use anon key
const apiKey = (supabaseServiceKey && supabaseServiceKey.startsWith('eyJ'))
  ? supabaseServiceKey
  : supabaseAnonKey;

if (!supabaseUrl || !apiKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Required: SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY)');
  process.exit(1);
}

console.log('🔧 Creating Supabase client...');
console.log('URL:', supabaseUrl);
console.log('Using key type:', (supabaseServiceKey && supabaseServiceKey.startsWith('eyJ')) ? 'service_role' : 'anon');

const supabase = createClient(supabaseUrl, apiKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    console.log(`\n📦 Creating bucket: ${bucketConfig.name}`);
    
    const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
      public: bucketConfig.public,
      allowedMimeTypes: bucketConfig.allowedMimeTypes,
      fileSizeLimit: bucketConfig.fileSizeLimit
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Bucket ${bucketConfig.name} already exists`);
        return { success: true, existed: true };
      }
      console.error(`❌ Failed to create bucket ${bucketConfig.name}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Successfully created bucket: ${bucketConfig.name}`);
    return { success: true, existed: false, data };
  } catch (error) {
    console.error(`❌ Exception creating bucket ${bucketConfig.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function listExistingBuckets() {
  try {
    console.log('📋 Checking existing buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Failed to list buckets:', error.message);
      return [];
    }
    
    console.log('📦 Existing buckets:', data.map(b => b.name).join(', '));
    return data;
  } catch (error) {
    console.error('❌ Exception listing buckets:', error.message);
    return [];
  }
}

async function createAllBuckets() {
  console.log('🚀 Starting bucket creation process...');
  console.log('=' .repeat(50));
  
  // First, list existing buckets
  const existingBuckets = await listExistingBuckets();
  
  let successCount = 0;
  let failCount = 0;
  let existedCount = 0;
  const results = [];

  for (const bucket of buckets) {
    const result = await createBucket(bucket);
    results.push({ bucket: bucket.name, ...result });
    
    if (result.success) {
      if (result.existed) {
        existedCount++;
      } else {
        successCount++;
      }
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 BUCKET CREATION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Successfully created: ${successCount}`);
  console.log(`📦 Already existed: ${existedCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total processed: ${buckets.length}`);

  if (failCount > 0) {
    console.log('\n❌ FAILED BUCKETS:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.bucket}: ${r.error}`);
      });
  }

  if (successCount + existedCount === buckets.length) {
    console.log('\n🎉 ALL BUCKETS ARE READY!');
    console.log('✅ Your Supabase Storage is properly configured.');
    console.log('🚀 You can now test image uploads in your application.');
  } else {
    console.log('\n⚠️  Some buckets could not be created.');
    console.log('🔧 Please check the errors above and try again.');
  }

  return { successCount, failCount, existedCount, results };
}

// Run the bucket creation
createAllBuckets()
  .then(summary => {
    const success = summary.failCount === 0;
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

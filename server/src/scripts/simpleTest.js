import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Supabase configuration...');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Anon Key (first 20 chars):', process.env.SUPABASE_ANON_KEY?.substring(0, 20) + '...');
console.log('Service Key (first 20 chars):', process.env.SUPABASE_SERVICE_KEY?.substring(0, 20) + '...');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    console.log('Attempting to list buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Buckets:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

test();

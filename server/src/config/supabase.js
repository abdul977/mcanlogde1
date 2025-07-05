import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

// Use service_role key if available (JWT format), otherwise use anon key
const apiKey = supabaseServiceKey && supabaseServiceKey.startsWith('eyJ')
  ? supabaseServiceKey
  : supabaseAnonKey;

if (!apiKey) {
  throw new Error('Missing valid Supabase API key (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY)');
}

console.log('Supabase config:', {
  url: supabaseUrl,
  keyType: supabaseServiceKey && supabaseServiceKey.startsWith('eyJ') ? 'service_role' : 'anon',
  keyPrefix: apiKey.substring(0, 10) + '...'
});

// Create Supabase client
const supabase = createClient(supabaseUrl, apiKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default supabase;

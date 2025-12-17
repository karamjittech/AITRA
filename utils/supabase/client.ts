import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Browser code can only access NEXT_PUBLIC_ prefixed environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only validate in browser runtime, not during build
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables for browser client:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  });
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
}

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('Supabase Client Configuration:', {
    url: supabaseUrl?.substring(0, 40) + '...',
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  });
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

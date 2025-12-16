import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const supabaseUrl = process.env.CUSTOM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.CUSTOM_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    usingCustom: !!(process.env.CUSTOM_SUPABASE_URL),
  });
  console.error('Please ensure CUSTOM_SUPABASE_URL and CUSTOM_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_*) are set in your .env file');
}

const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder';

if (process.env.NODE_ENV === 'development') {
  console.log('Supabase Client Configuration:', {
    url: url?.substring(0, 40) + '...',
    usingCustomVariables: !!(process.env.CUSTOM_SUPABASE_URL),
  });
}

export const supabase = createBrowserClient<Database>(url, key);

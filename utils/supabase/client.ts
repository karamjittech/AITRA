import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use placeholders during build time to prevent prerender crashes
// Runtime validation will catch actual missing vars when used
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-anon-key';

// Warn during build but don't crash
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // Build time - just warn
    console.warn('⚠️ Supabase env vars missing at build time, using placeholders for prerender');
  } else {
    // Runtime - this is a real error
    console.error('=== SUPABASE CONFIG ERROR ===');
    console.error('Missing environment variables!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
    console.error('');
    console.error('TO FIX THIS:');
    console.error('1. Go to Bolt Settings (gear icon)');
    console.error('2. Click on "Secrets" tab');
    console.error('3. Add NEXT_PUBLIC_SUPABASE_URL');
    console.error('4. Add NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('5. Restart the dev server');
    console.error('=============================');
  }
}

export const supabase = createBrowserClient<Database>(url, key);

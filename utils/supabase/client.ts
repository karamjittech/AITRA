import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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

  throw new Error(
    'Supabase environment variables missing. Go to Bolt Settings → Secrets and add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart.'
  );
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

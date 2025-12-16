import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

const supabaseUrl = process.env.CUSTOM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.CUSTOM_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Missing required Supabase environment variables. Please set CUSTOM_SUPABASE_URL and CUSTOM_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_*) in your .env file';
    console.error(errorMsg, {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      usingCustom: !!(process.env.CUSTOM_SUPABASE_URL),
    });
    throw new Error(errorMsg);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase Server Configuration:', {
      url: supabaseUrl?.substring(0, 40) + '...',
      usingCustomVariables: !!(process.env.CUSTOM_SUPABASE_URL),
    });
  }

  const cookieStore = cookies();

  return createSSRClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Handle error in middleware or server components
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // Handle error in middleware or server components
        }
      },
    },
  });
}

import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Missing required Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file';
    console.error(errorMsg, {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });
    throw new Error(errorMsg);
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

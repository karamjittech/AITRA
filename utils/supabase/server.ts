import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

const supabaseUrl = process.env.CUSTOM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.CUSTOM_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createServerClient() {
  // During build, environment variables might not be available
  // Only throw error at runtime when actually needed
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      console.error('Missing required Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        usingCustom: !!(process.env.CUSTOM_SUPABASE_URL),
      });
    }
    // Provide placeholder during build to avoid build failures
    if (!supabaseUrl || !supabaseAnonKey) {
      const placeholderUrl = supabaseUrl || 'https://placeholder.supabase.co';
      const placeholderKey = supabaseAnonKey || 'placeholder-key';

      return createSSRClient<Database>(placeholderUrl, placeholderKey, {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
      });
    }
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

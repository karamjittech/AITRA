import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Use placeholders during build time to prevent prerender crashes
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder-anon-key';

  // Warn during build but don't crash
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase env vars missing, using placeholders. This is OK during build.');
  }

  const cookieStore = cookies();

  return createSSRClient<Database>(url, key, {
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

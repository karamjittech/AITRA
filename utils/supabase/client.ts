import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import { config } from '@/lib/config';

// Use runtime config values - these are always available
// No need for placeholders or environment variable checks
export const supabase = createBrowserClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
);

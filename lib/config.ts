/**
 * Runtime Configuration
 *
 * This module provides runtime configuration values that work reliably
 * in Bolt.new and other hosting environments where environment variables
 * may not be available at build time.
 *
 * These values are embedded directly in the code and loaded at runtime,
 * ensuring they're always available in both server and client components.
 */

export const config = {
  supabase: {
    url: 'https://wkihztdrhkgkcteqwvwn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraWh6dGRyaGtna2N0ZXF3dnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzMzNDksImV4cCI6MjA4MDk0OTM0OX0._RRBz7ldnFTu8_e9z7meBDKH_fx6OXRqI5IcBoNkmHU',
  },
  paddle: {
    clientToken: 'pdl_sdbx_apikey_01kcbgb9119ksnqygd6k6gjj2c_r43PXqaCbmPMnNBH84ND7D_A9S',
    environment: 'sandbox' as const,
    proPriceId: 'pri_01kcbj0yk158vrs63t7yw1fjxn',
    agencyPriceId: 'pri_01kcbhy8emkcytbxds6rp7rny9',
  },
} as const;

// Helper function to get Edge Function URL
// Uses Next.js API routes instead of Supabase Edge Functions for better compatibility
export function getEdgeFunctionUrl(functionName: string): string {
  // Check if we're in browser or server
  if (typeof window !== 'undefined') {
    // Browser: use current origin
    return `${window.location.origin}/api/${functionName}`;
  }
  // Server: try to get base URL from env, fallback to Supabase edge function
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;
  if (baseUrl) {
    return `${baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`}/api/${functionName}`;
  }
  // Fallback to Supabase edge function (for backward compatibility)
  return `${config.supabase.url}/functions/v1/${functionName}`;
}

// Helper function to get authorization headers
export function getSupabaseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.supabase.anonKey}`,
    'apikey': config.supabase.anonKey,
  };
}

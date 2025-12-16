# Bolt.new Custom Variables Guide

## Problem: Bolt.new Auto-Reverts Supabase Credentials

Bolt.new automatically manages `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` because it has its own internal Supabase provisioning system. Every time the project rebuilds or Bolt refreshes, it **overwrites these variables** with its internally provisioned database.

## Solution: Use Custom Variable Names

This project now uses **custom environment variable names** that Bolt.new won't recognize or auto-manage.

### Variable Priority System

The application checks environment variables in this order:

1. **CUSTOM_SUPABASE_*** (Priority 1 - Your external database)
2. **NEXT_PUBLIC_SUPABASE_*** (Priority 2 - Fallback to Bolt's internal database)

### Required Custom Variables

Add these to your Bolt.new Project Settings > Secrets:

```bash
CUSTOM_SUPABASE_URL=https://ifsymkwsnoapxcwsfmww.supabase.co
CUSTOM_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CUSTOM_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How It Works

### Client-Side (utils/supabase/client.ts)
```typescript
const supabaseUrl = process.env.CUSTOM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.CUSTOM_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

### Server-Side (utils/supabase/server.ts)
```typescript
const supabaseUrl = process.env.CUSTOM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.CUSTOM_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

### Edge Functions (supabase/functions/*/index.ts)
```typescript
const supabaseUrl = Deno.env.get("CUSTOM_SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("CUSTOM_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
```

## Setup Instructions

### Step 1: Get Your Supabase Credentials

1. Go to https://app.supabase.com/project/ifsymkwsnoapxcwsfmww/settings/api
2. Copy these values:
   - **Project URL** (e.g., `https://ifsymkwsnoapxcwsfmww.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 2: Add Secrets to Bolt.new

1. Open your project in Bolt.new
2. Click on Project Settings (gear icon)
3. Navigate to "Secrets" section
4. Add these three secrets:

   **Secret 1:**
   - Name: `CUSTOM_SUPABASE_URL`
   - Value: `https://ifsymkwsnoapxcwsfmww.supabase.co`

   **Secret 2:**
   - Name: `CUSTOM_SUPABASE_ANON_KEY`
   - Value: `[your anon key from Supabase]`

   **Secret 3:**
   - Name: `CUSTOM_SUPABASE_SERVICE_ROLE_KEY`
   - Value: `[your service role key from Supabase]`

### Step 3: Update .env File (Local Development)

Add these to the top of your `.env` file:

```bash
# CUSTOM External Supabase (YOUR DATABASE - Bolt won't auto-manage these)
CUSTOM_SUPABASE_URL=https://ifsymkwsnoapxcwsfmww.supabase.co
CUSTOM_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CUSTOM_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Verify Configuration

1. Visit `/debug-secrets` in your running application
2. Click "Show Secrets"
3. Verify that:
   - Green alert shows "Custom Variables Active"
   - CUSTOM_SUPABASE_URL shows your external database URL
   - The blue "CUSTOM Variables" section shows your credentials

## Files Modified

### Core Supabase Clients
- ✅ `utils/supabase/client.ts` - Client-side Supabase initialization
- ✅ `utils/supabase/server.ts` - Server-side Supabase initialization
- ✅ `middleware.ts` - Auth middleware

### Edge Functions (7 files)
- ✅ `supabase/functions/analyze-page/index.ts`
- ✅ `supabase/functions/analyze-citation-context/index.ts`
- ✅ `supabase/functions/analyze-eeat/index.ts`
- ✅ `supabase/functions/analyze-sentiment/index.ts`
- ✅ `supabase/functions/calculate-share-of-voice/index.ts`
- ✅ `supabase/functions/generate-fix/index.ts`
- ✅ `supabase/functions/paddle-webhook/index.ts`

### API Routes
- ✅ `app/api/webhooks/paddle/route.ts`

### Configuration Files
- ✅ `.env` - Added CUSTOM_ variables at top
- ✅ `.env.example` - Documented both variable sets

### Debug Tools
- ✅ `app/debug-secrets/page.tsx` - Shows both custom and standard variables

## Troubleshooting

### Issue: Still connecting to wrong database

**Solution:**
1. Clear Bolt.new cache: Settings > Clear Cache
2. Restart dev server
3. Check browser console for "Supabase Client Configuration" log
4. Verify `usingCustomVariables: true` in the logs

### Issue: Edge Functions not using custom variables

**Solution:**
1. Redeploy Edge Functions with new environment variables
2. Check Supabase Dashboard > Edge Functions > Logs
3. Verify custom variables are set in Supabase Edge Function secrets

### Issue: Authentication not working

**Solution:**
1. Verify CUSTOM_SUPABASE_ANON_KEY is correctly copied (no extra spaces)
2. Check JWT token is valid: `https://jwt.io/` (should show `"ref": "ifsymkwsnoapxcwsfmww"`)
3. Verify RLS policies exist in your external database

## Benefits of This Approach

✅ **Bolt-Proof** - Custom variable names won't trigger Bolt's auto-management
✅ **Backward Compatible** - Fallback logic means code still works if custom vars not set
✅ **Production Ready** - Works in Netlify/Vercel deployments where you control env vars
✅ **No Breaking Changes** - Existing functionality preserved during migration
✅ **Easy Verification** - Debug page shows which variables are active

## Production Deployment (Netlify/Vercel)

When deploying to production, set these environment variables:

### Netlify
```bash
netlify env:set CUSTOM_SUPABASE_URL "https://ifsymkwsnoapxcwsfmww.supabase.co"
netlify env:set CUSTOM_SUPABASE_ANON_KEY "your_anon_key"
netlify env:set CUSTOM_SUPABASE_SERVICE_ROLE_KEY "your_service_role_key"
```

### Vercel
1. Go to Project Settings > Environment Variables
2. Add each CUSTOM_SUPABASE_* variable
3. Set for Production, Preview, and Development environments

## Reference

- External Supabase Project: `https://ifsymkwsnoapxcwsfmww.supabase.co`
- Project Ref ID: `ifsymkwsnoapxcwsfmww`
- Dashboard: https://app.supabase.com/project/ifsymkwsnoapxcwsfmww

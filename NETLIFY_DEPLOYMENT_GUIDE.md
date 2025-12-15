# Netlify Deployment Guide

## Current Issue

The build is failing because **environment variables are not configured** in your Netlify deployment settings.

Error: `@supabase/ssr: Your project's URL and API key are required to create a Supabase client!`

## Fix: Add Environment Variables to Netlify

### Step 1: Go to Netlify Dashboard

1. Log in to [Netlify](https://app.netlify.com)
2. Select your site/project
3. Go to **Site configuration** → **Environment variables**

### Step 2: Add Required Environment Variables

Add the following environment variables (copy values from your local `.env` file):

| Variable Name | Value | Where to Find |
|---------------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wkihztdrhkgkcteqwvwn.supabase.co` | Your `.env` file line 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your `.env` file line 2 |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Your `.env` file line 3 |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | `pdl_sdbx_apikey_01kcbgb9119ksnqygd6k6gjj2c_r43PXqaCbmPMnNBH84ND7D_A9S` | Your `.env` file line 6 |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | `sandbox` | Your `.env` file line 7 |
| `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID` | `pri_01kcbj0yk158vrs63t7yw1fjxn` | Your `.env` file line 8 |
| `NEXT_PUBLIC_PADDLE_AGENCY_PRICE_ID` | `pri_01kcbhy8emkcytbxds6rp7rny9` | Your `.env` file line 9 |
| `PADDLE_WEBHOOK_SECRET` | (Empty for now, fill later) | Your `.env` file line 12 |

### Step 3: Redeploy

After adding all environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete

## Important Notes

1. **NEVER commit `.env` file to Git** - It's already in `.gitignore`
2. **Environment variables are deployment-specific** - Each platform (Netlify, Vercel, etc.) needs them configured separately
3. **Sensitive keys** - Keep your `SUPABASE_SERVICE_ROLE_KEY` and `PADDLE_WEBHOOK_SECRET` secure

## Alternative: Use Netlify CLI

You can also set environment variables using the Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Set environment variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://wkihztdrhkgkcteqwvwn.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_anon_key_here"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_service_role_key_here"
# ... add remaining variables
```

## Verification

After deployment succeeds:

1. Visit your deployed site URL
2. Check browser console for errors
3. Test login/signup functionality
4. Verify Supabase connection is working

## Troubleshooting

### Build Still Failing?

1. **Clear Netlify cache**: Site configuration → Build & deploy → Post processing → Clear cache and retry
2. **Check variable names**: Ensure exact spelling (case-sensitive)
3. **Check for spaces**: No spaces before/after values
4. **Redeploy**: Trigger a fresh deploy after saving variables

### Runtime Errors?

1. **Check browser console**: Look for specific error messages
2. **Verify Supabase URL**: Make sure it's accessible from Netlify servers
3. **Check CORS settings**: Ensure your Supabase project allows requests from your Netlify domain

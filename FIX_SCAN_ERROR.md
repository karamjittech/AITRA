# Quick Fix for "Scan Now" Button Error

## Problem
Getting error: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

## Root Cause
Missing `JINA_API_KEY` environment variable in Supabase Edge Functions

---

## Solution (5 Minutes)

### Step 1: Get Jina.ai API Key
1. Go to https://jina.ai
2. Sign up (free tier: 10M tokens/month - enough for ~1000 page scans)
3. Navigate to: **Dashboard → API Keys**
4. Click **"Create API Key"**
5. Copy the key (starts with `jina_`)

### Step 2: Add to Supabase
1. Go to: https://supabase.com/dashboard/project/wkihztdrhkgkcteqwvwn/functions
2. Click: **"analyze-page"** function
3. Click: **"Settings"** or **"Secrets"** tab
4. Add two environment variables:

   **Variable 1:**
   ```
   Name: JINA_API_KEY
   Value: [paste your Jina API key here]
   ```

   **Variable 2:**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraWh6dGRyaGtna2N0ZXF3dnduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM3MzM0OSwiZXhwIjoyMDgwOTQ5MzQ5fQ.WFiQ5bMgLbd2eV4s6F3AiNLfIzJ6Qs4MjjcmYl_3mSs
   ```

5. Click **"Save"**
6. Wait 30 seconds for the function to restart

### Step 3: Add to Local .env (for local development)
Add your Jina API key to `.env` file:
```bash
JINA_API_KEY=your_jina_api_key_here
```

### Step 4: Test
1. Refresh your app
2. Click "Scan Now"
3. Enter a URL (try: `https://example.com`)
4. Should complete in 10-30 seconds

---

## Expected Behavior After Fix

**Success:**
- Loading animation for 10-30 seconds
- Results page with:
  - Overall AI readiness score (0-100)
  - Platform breakdown (ChatGPT, Claude, Gemini, Perplexity)
  - Critical/Medium/Minor gaps
  - Recommendations with research citations

**Still Broken?**
Check Supabase logs:
1. Dashboard → Edge Functions → analyze-page → **Logs**
2. Look for errors about missing keys or API failures

---

## Alternative: Use Supabase CLI

```bash
# If you have Supabase CLI installed
supabase secrets set JINA_API_KEY=your_jina_api_key_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraWh6dGRyaGtna2N0ZXF3dnduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM3MzM0OSwiZXhwIjoyMDgwOTQ5MzQ5fQ.WFiQ5bMgLbd2eV4s6F3AiNLfIzJ6Qs4MjjcmYl_3mSs
```

---

## What These Keys Do

**JINA_API_KEY:**
- Fetches and parses webpage HTML
- Extracts structured content (headings, paragraphs, schema, etc.)
- Alternative to building your own scraper

**SUPABASE_SERVICE_ROLE_KEY:**
- Bypasses Row Level Security for database writes
- Needed because Edge Functions write to database on behalf of users
- Already in your .env file, just needs to be in Supabase too

---

## Cost Estimate

**Free Tier Limits:**
- Jina.ai: 10M tokens/month (1000+ page scans)
- Supabase Edge Functions: 500K invocations/month
- Supabase Database: 500 MB storage

**You're well within free limits for MVP testing!**

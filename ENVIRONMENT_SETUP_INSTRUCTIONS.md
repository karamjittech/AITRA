# Environment Setup Instructions - CRITICAL

## Issue
The `analyze-page` Edge Function is failing because it's missing the required environment variables in Supabase.

## Required Environment Variables

The Edge Function needs these variables set in **Supabase Edge Functions Dashboard** (not just .env file):

### 1. JINA_API_KEY
- **What**: API key for Jina.ai web scraping service
- **Get it from**: https://jina.ai (free tier: 10M tokens)
- **How to get**:
  1. Sign up at https://jina.ai
  2. Go to Dashboard → API Keys
  3. Create new API key
  4. Copy the key (starts with `jina_`)

### 2. SUPABASE_SERVICE_ROLE_KEY
- **What**: Service role key for database operations
- **Where to find**: Your Supabase project settings
- **Already have it**: Check your .env file, it's: `CUSTOM_SUPABASE_SERVICE_ROLE_KEY`

### 3. SUPABASE_URL (Optional - auto-set by Supabase)
- This is automatically set by Supabase Edge Functions
- Your URL: https://wkihztdrhkgkcteqwvwn.supabase.co

---

## How to Set Environment Variables in Supabase

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wkihztdrhkgkcteqwvwn
2. Click **"Edge Functions"** in left sidebar
3. Click on **"analyze-page"** function
4. Click **"Settings"** tab (or "Environment Variables" if visible)
5. Add these variables:
   ```
   JINA_API_KEY = [your-jina-api-key-here]
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraWh6dGRyaGtna2N0ZXF3dnduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM3MzM0OSwiZXhwIjoyMDgwOTQ5MzQ5fQ.WFiQ5bMgLbd2eV4s6F3AiNLfIzJ6Qs4MjjcmYl_3mSs
   ```
6. Click **"Save"**
7. The function will automatically restart with new variables

### Method 2: Via Supabase CLI (Alternative)

```bash
# Set JINA_API_KEY
supabase secrets set JINA_API_KEY=your-jina-api-key-here

# Set SERVICE_ROLE_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraWh6dGRyaGtna2N0ZXF3dnduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM3MzM0OSwiZXhwIjoyMDgwOTQ5MzQ5fQ.WFiQ5bMgLbd2eV4s6F3AiNLfIzJ6Qs4MjjcmYl_3mSs
```

---

## Testing After Setup

1. Go to your app: http://localhost:3000 (or your deployed URL)
2. Click "Scan Now" on the home page
3. Enter a test URL (e.g., https://example.com)
4. You should see the analysis complete successfully

---

## Troubleshooting

### If you still get "Unexpected token '<'" error:
- Wait 30 seconds after setting variables (function needs to restart)
- Check Supabase Edge Functions logs:
  1. Go to Dashboard → Edge Functions → analyze-page
  2. Click "Logs" tab
  3. Look for errors mentioning "JINA_API_KEY"

### If you get "Server configuration error":
- Double-check that JINA_API_KEY is set correctly
- Verify the key is active (not expired) in Jina.ai dashboard

### If you get database errors:
- The SERVICE_ROLE_KEY might be incorrect
- Verify it matches your .env file value

---

## Cost Considerations

**Jina.ai Free Tier:**
- 10 million tokens per month
- ~100 words = 1 token
- Average webpage = 5,000-10,000 tokens
- You can analyze ~1,000-2,000 pages per month for free

**Supabase Free Tier:**
- Edge Functions: 500,000 invocations/month
- Database: 500 MB storage
- This should be more than enough for MVP testing

---

## Next Steps After Setup

1. Set the environment variables in Supabase Dashboard
2. Test the scan functionality
3. Monitor Jina.ai usage in their dashboard
4. Consider adding rate limiting if needed

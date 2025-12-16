# Edge Functions Deployment Guide

## Security Fixes Applied

All hardcoded API keys have been removed from:
- `analyze-page/index.ts` - Removed hardcoded Jina API key
- `generate-fix/index.ts` - Removed hardcoded Gemini API key
- `analyze-sentiment/index.ts` - Removed hardcoded Gemini API key
- `analyze-eeat/index.ts` - Removed hardcoded Gemini API key
- `analyze-citation-context/index.ts` - Removed hardcoded Gemini API key
- `suggest-fan-out/index.ts` - Removed hardcoded Gemini API key

All functions now properly use `Deno.env.get()` for API keys.

## Edge Functions Ready for Deployment (8 Total)

### 1. **analyze-page**
- **Purpose:** Analyzes webpage content using Jina.ai for scraping
- **External APIs:** Jina.ai Reader API
- **Required Secrets:**
  - `JINA_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 2. **generate-fix**
- **Purpose:** Generates schema markup and optimization fixes using Gemini AI
- **External APIs:** Google Gemini API
- **Required Secrets:**
  - `GEMINI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 3. **analyze-sentiment**
- **Purpose:** Analyzes citation sentiment using Gemini AI
- **External APIs:** Google Gemini API
- **Required Secrets:**
  - `GEMINI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 4. **analyze-eeat**
- **Purpose:** Analyzes E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals
- **External APIs:** Google Gemini API, Jina.ai Reader API
- **Required Secrets:**
  - `GEMINI_API_KEY`
  - `JINA_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 5. **analyze-citation-context**
- **Purpose:** Analyzes citation context and verifies links
- **External APIs:** Google Gemini API
- **Required Secrets:**
  - `GEMINI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 6. **suggest-fan-out**
- **Purpose:** Generates keyword fan-out suggestions using AI
- **External APIs:** Google Gemini API
- **Required Secrets:**
  - `GEMINI_API_KEY`

### 7. **calculate-share-of-voice**
- **Purpose:** Calculates competitive share of voice metrics
- **External APIs:** None (pure logic)
- **Required Secrets:**
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 8. **paddle-webhook** (NEW)
- **Purpose:** Handles Paddle payment webhooks
- **External APIs:** None
- **Required Secrets:**
  - `PADDLE_WEBHOOK_SECRET` (for signature verification)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Deployment Method 1: Supabase CLI (Recommended)

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 1: Set Environment Variables

```bash
# Set all required secrets
supabase secrets set JINA_API_KEY="your_jina_api_key_here"
supabase secrets set GEMINI_API_KEY="your_gemini_api_key_here"
supabase secrets set PADDLE_WEBHOOK_SECRET="your_paddle_webhook_secret_here"

# Verify secrets are set
supabase secrets list
```

### Step 2: Deploy All Functions

```bash
# Deploy individual functions
supabase functions deploy analyze-page
supabase functions deploy generate-fix
supabase functions deploy analyze-sentiment
supabase functions deploy analyze-eeat
supabase functions deploy analyze-citation-context
supabase functions deploy suggest-fan-out
supabase functions deploy calculate-share-of-voice
supabase functions deploy paddle-webhook

# Or deploy all at once
supabase functions deploy
```

### Step 3: Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs (if needed)
supabase functions logs analyze-page
```

## Deployment Method 2: Supabase Dashboard (Manual)

### Step 1: Set Secrets in Dashboard

1. Go to **Supabase Dashboard** → **Edge Functions** → **Settings**
2. Click **Add Secret**
3. Add each secret:
   - `JINA_API_KEY` = Your Jina API key
   - `GEMINI_API_KEY` = Your Gemini API key
   - `PADDLE_WEBHOOK_SECRET` = Your Paddle webhook secret
   - `SUPABASE_URL` = Your Supabase URL (auto-populated)
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key (auto-populated)

### Step 2: Deploy via Dashboard

Since the Supabase Dashboard doesn't support direct file upload for Edge Functions, you **must use the CLI** for deployment.

## Function Endpoints (After Deployment)

After deployment, your functions will be available at:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-page
https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-fix
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-sentiment
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-eeat
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-citation-context
https://YOUR_PROJECT_REF.supabase.co/functions/v1/suggest-fan-out
https://YOUR_PROJECT_REF.supabase.co/functions/v1/calculate-share-of-voice
https://YOUR_PROJECT_REF.supabase.co/functions/v1/paddle-webhook
```

## Calling Edge Functions from Frontend

### Example: Analyze Page

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-page`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      url: 'https://example.com/page',
      userId: userId,
    }),
  }
);

const result = await response.json();
```

### Example: Generate Fix

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-fix`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      pageId: pageId,
      fixType: 'faq-schema',
      currentContent: {
        title: 'Page Title',
        metaDescription: 'Page description',
        url: 'https://example.com/page',
      },
    }),
  }
);

const result = await response.json();
```

## Paddle Webhook Configuration

After deploying the `paddle-webhook` function:

1. Go to **Paddle Dashboard** → **Developer Tools** → **Webhooks**
2. Add a new webhook endpoint:
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/paddle-webhook`
3. Select events to monitor:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.payment_failed`
   - `transaction.completed`
4. Copy the **Webhook Secret** and set it as `PADDLE_WEBHOOK_SECRET` in Supabase

## Testing Edge Functions

### Test analyze-page locally:

```bash
supabase functions serve analyze-page --env-file ./supabase/.env.local
```

Then call it:

```bash
curl -X POST http://localhost:54321/functions/v1/analyze-page \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "userId": "test-user-id"
  }'
```

## Troubleshooting

### Error: "JINA_API_KEY not set"
- Run: `supabase secrets set JINA_API_KEY="your_key"`
- Verify: `supabase secrets list`

### Error: "Server configuration error"
- Check that all required environment variables are set
- Verify your Supabase project is linked: `supabase link --project-ref YOUR_REF`

### Error: "Invalid signature" (Paddle webhook)
- Verify `PADDLE_WEBHOOK_SECRET` matches your Paddle dashboard
- Check Paddle webhook logs for delivery attempts

### Function not responding
- Check logs: `supabase functions logs FUNCTION_NAME`
- Verify deployment: `supabase functions list`

## Cost Considerations

### Jina.ai
- Free tier: 10M tokens
- Pay-per-use after free tier
- ~1,000 tokens per page analysis

### Gemini API
- Free tier: 60 requests per minute
- Pay-per-use: $0.00025/1K characters (input)
- Each fix generation: ~500-2,000 characters

### Supabase Edge Functions
- Free tier: 500K executions/month
- 2M CPU seconds/month
- Beyond free tier: $2 per 1M executions

## Next Steps

1. Set all environment variables in Supabase
2. Deploy all 5 Edge Functions
3. Configure Paddle webhook URL
4. Test each function with sample data
5. Monitor logs for any errors

## Support

If you encounter issues:
- Check Supabase Edge Functions logs
- Verify all secrets are set correctly
- Test functions locally before deploying
- Review CORS headers if calling from frontend

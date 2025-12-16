# Edge Functions Deployment Checklist

## Pre-Deployment Security Check

- [x] **analyze-page/index.ts** - Hardcoded Jina API key removed
- [x] **generate-fix/index.ts** - Hardcoded Gemini API key removed
- [x] **analyze-sentiment/index.ts** - Hardcoded Gemini API key removed
- [x] **analyze-eeat/index.ts** - Hardcoded Gemini API key removed
- [x] **analyze-citation-context/index.ts** - Hardcoded Gemini API key removed
- [x] **suggest-fan-out/index.ts** - Hardcoded Gemini API key removed
- [x] **paddle-webhook/index.ts** - Created (no hardcoded secrets)

## API Keys Required

### Get Your API Keys

1. **Jina.ai API Key**
   - Sign up: https://jina.ai/
   - Get free API key (10M tokens free tier)
   - Format: `jina_XXXXXXXXXXXXXXX`

2. **Google Gemini API Key**
   - Get key: https://makersuite.google.com/app/apikey
   - Free tier: 60 requests/minute
   - Format: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX`

3. **Paddle Webhook Secret**
   - Get from: Paddle Dashboard → Webhooks
   - Set after deploying the function
   - Format: `pdl_ntfset_XXXXXXXXXXXXXXX`

## Quick Deployment Commands

```bash
# 1. Install Supabase CLI (if not installed)
npm install -g supabase

# 2. Login
supabase login

# 3. Link project (replace with your project ref)
supabase link --project-ref YOUR_PROJECT_REF

# 4. Set secrets
supabase secrets set JINA_API_KEY="jina_YOUR_KEY_HERE"
supabase secrets set GEMINI_API_KEY="AIzaSy_YOUR_KEY_HERE"
supabase secrets set PADDLE_WEBHOOK_SECRET="pdl_ntfset_YOUR_SECRET"

# 5. Deploy all functions
cd supabase/functions
supabase functions deploy analyze-page
supabase functions deploy generate-fix
supabase functions deploy analyze-sentiment
supabase functions deploy analyze-eeat
supabase functions deploy analyze-citation-context
supabase functions deploy suggest-fan-out
supabase functions deploy calculate-share-of-voice
supabase functions deploy paddle-webhook

# 6. Verify deployment
supabase functions list
```

## Post-Deployment Configuration

### 1. Configure Paddle Webhook

After deploying `paddle-webhook`:

1. Go to **Paddle Dashboard** → **Developer Tools** → **Webhooks**
2. Add webhook URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/paddle-webhook`
3. Select events:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `subscription.payment_failed`
   - ✅ `transaction.completed`
4. Copy webhook secret and update Supabase:
   ```bash
   supabase secrets set PADDLE_WEBHOOK_SECRET="your_paddle_secret"
   ```

### 2. Test Each Function

```bash
# Test analyze-page
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-page \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"url":"https://example.com","userId":"test-user-id"}'

# Test generate-fix
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-fix \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"pageId":"test-page-id","fixType":"faq-schema","currentContent":{"title":"Test"}}'

# Test calculate-share-of-voice
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/calculate-share-of-voice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"websiteId":"test-website-id"}'
```

### 3. Monitor Logs

```bash
# Check for errors in each function
supabase functions logs analyze-page --tail
supabase functions logs generate-fix --tail
supabase functions logs analyze-sentiment --tail
supabase functions logs calculate-share-of-voice --tail
supabase functions logs paddle-webhook --tail
```

## Function URLs Reference

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference:

```
analyze-page:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-page

generate-fix:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-fix

analyze-sentiment:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-sentiment

analyze-eeat:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-eeat

analyze-citation-context:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-citation-context

suggest-fan-out:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/suggest-fan-out

calculate-share-of-voice:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/calculate-share-of-voice

paddle-webhook:
https://YOUR_PROJECT_REF.supabase.co/functions/v1/paddle-webhook
```

## Environment Variables Summary

| Variable | Used By | Where to Get |
|----------|---------|--------------|
| `JINA_API_KEY` | analyze-page | https://jina.ai/ |
| `GEMINI_API_KEY` | generate-fix, analyze-sentiment | https://makersuite.google.com/app/apikey |
| `PADDLE_WEBHOOK_SECRET` | paddle-webhook | Paddle Dashboard → Webhooks |
| `SUPABASE_URL` | All functions | Auto-populated by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | All functions | Auto-populated by Supabase |

## Deployment Status

- [ ] Supabase CLI installed
- [ ] Project linked to Supabase
- [ ] JINA_API_KEY set
- [ ] GEMINI_API_KEY set
- [ ] PADDLE_WEBHOOK_SECRET set (after configuring Paddle)
- [ ] analyze-page deployed
- [ ] generate-fix deployed
- [ ] analyze-sentiment deployed
- [ ] analyze-eeat deployed
- [ ] analyze-citation-context deployed
- [ ] suggest-fan-out deployed
- [ ] calculate-share-of-voice deployed
- [ ] paddle-webhook deployed
- [ ] Paddle webhook URL configured
- [ ] All functions tested
- [ ] Logs checked for errors

## Common Issues

### "JINA_API_KEY not set"
```bash
supabase secrets set JINA_API_KEY="your_key_here"
```

### "GEMINI_API_KEY not set"
```bash
supabase secrets set GEMINI_API_KEY="your_key_here"
```

### "Invalid signature" (Paddle webhook)
- Verify webhook secret matches Paddle dashboard
- Check Paddle webhook logs for signature format

### Function not responding
```bash
# Check if function is deployed
supabase functions list

# Check logs for errors
supabase functions logs FUNCTION_NAME --tail
```

## Success Indicators

You'll know deployment was successful when:

1. `supabase functions list` shows all 8 functions as "Deployed"
2. Test API calls return 200 status codes
3. Function logs show successful execution (no errors)
4. Paddle webhook test from dashboard succeeds
5. Frontend can successfully call Edge Functions

## Need Help?

- Review `EDGE_FUNCTIONS_DEPLOYMENT.md` for detailed instructions
- Check Supabase Edge Functions logs for specific errors
- Verify all environment variables are set correctly
- Test functions locally before production deployment

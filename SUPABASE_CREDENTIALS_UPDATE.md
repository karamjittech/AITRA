# Supabase Credentials Update Summary

## What Was Changed

Successfully updated all references from the **OLD** Supabase project to your **CORRECT** external Supabase project.

### Old Credentials (REMOVED)
- URL: `https://wkihztdrhkgkcteqwvwn.supabase.co`
- Anon Key: `eyJhbGc...BoNkmHU` (old key)

### New Credentials (ACTIVE)
- URL: `https://ifsymkwsnoapxcwsfmww.supabase.co`
- Anon Key: `eyJhbGc...p6iFY` (your correct key)

## Files Updated

### 1. `.env` (Lines 15, 27-28)
Primary environment configuration file now points to correct Supabase project.

### 2. `DEPLOYMENT_FIXES.md` (Line 24)
Documentation updated with correct URL in deployment examples.

### 3. `NETLIFY_DEPLOYMENT_GUIDE.md` (Lines 23, 58)
Deployment guide now references correct Supabase project URL.

### 4. `OAUTH_SETUP_CHECKLIST.md` (Lines 20, 34, 37)
OAuth setup instructions updated with correct dashboard link and redirect URIs.

## Verification Complete

Ran grep search to confirm:
- Zero references to old URL `wkihztdrhkgkcteqwvwn`
- All 4 files now contain correct URL `ifsymkwsnoapxcwsfmww`

## Next Steps

### 1. Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

### 2. Test Supabase Connection
- Visit your local site (http://localhost:3000)
- Try signing up or logging in
- Check browser console for any errors
- Verify dashboard loads data from correct database

### 3. If Using External Deployment (Netlify/Vercel)

You need to update environment variables in your deployment platform:

**Netlify:**
1. Go to: Site configuration > Environment variables
2. Update:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ifsymkwsnoapxcwsfmww.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmc3lta3dzbm9hcHhjd3NmbXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTA4MTEsImV4cCI6MjA4MTM2NjgxMX0.LwaCuxjtuzenrtWudqxYtP2tZL992HhFrrkdLFp6iFY`
3. Redeploy: Deploys > Trigger deploy > Deploy site

**Vercel:**
1. Go to: Project Settings > Environment Variables
2. Update the same variables
3. Redeploy from the dashboard

### 4. Additional Credentials Needed

You still need to add the **Service Role Key** from your correct Supabase project:

1. Go to: https://ifsymkwsnoapxcwsfmww.supabase.co
2. Navigate to: Project Settings > API
3. Copy the `service_role` key (secret - keep it secure!)
4. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 5. Update OAuth Configuration (If Using Google Login)

Since the Supabase project changed, you need to update your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Update **Authorized JavaScript origins**:
   - Change: `https://wkihztdrhkgkcteqwvwn.supabase.co`
   - To: `https://ifsymkwsnoapxcwsfmww.supabase.co`
5. Update **Authorized redirect URIs**:
   - Change: `https://wkihztdrhkgkcteqwvwn.supabase.co/auth/v1/callback`
   - To: `https://ifsymkwsnoapxcwsfmww.supabase.co/auth/v1/callback`
6. Save changes

Then update Supabase:
1. Go to: https://ifsymkwsnoapxcwsfmww.supabase.co
2. Navigate to: Authentication > Providers > Google
3. Enter your Google Client ID and Client Secret
4. Save

## Troubleshooting

### Issue: "Invalid API key" error
**Solution:** Double-check that the anon key in `.env` matches exactly (no extra spaces).

### Issue: "Could not connect to Supabase"
**Solution:**
1. Verify your Supabase project is active at https://ifsymkwsnoapxcwsfmww.supabase.co
2. Check that your IP isn't blocked in Supabase settings
3. Restart your dev server

### Issue: OAuth still redirects to old project
**Solution:** Clear browser cache and cookies, then update Google Cloud Console redirect URIs as described above.

### Issue: Database tables not found
**Solution:** Your migrations are already in the `/supabase/migrations/` folder. If needed, re-apply them to the correct project using the Supabase dashboard SQL editor.

## Status

All configuration files successfully updated to point to your correct external Supabase project (`ifsymkwsnoapxcwsfmww`).

# Google OAuth Setup Checklist

The code changes have been implemented to fix the OAuth callback issue. Now you need to verify your Supabase configuration.

## What Was Fixed

1. **Client Configuration**: Updated `/utils/supabase/client.ts` to use `createBrowserClient` from `@supabase/ssr` instead of basic `createClient`. This enables proper PKCE flow for OAuth.

2. **Callback Handler**: Enhanced `/app/auth/callback/route.ts` with:
   - Better error handling for OAuth failures
   - Proper cookie management for session persistence
   - Error parameter detection and redirection

3. **Error Display**: Updated `/app/login/page.tsx` to display OAuth errors from callback redirects.

## Supabase Configuration Steps

### 1. Enable Google OAuth Provider

1. Go to your Supabase dashboard: https://wkihztdrhkgkcteqwvwn.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the provider list
4. Toggle it to **Enabled**

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. For Application type, select **Web application**
7. Add **Authorized JavaScript origins**:
   - `https://wkihztdrhkgkcteqwvwn.supabase.co`
   - `http://localhost:3000` (for local development)
8. Add **Authorized redirect URIs**:
   - `https://wkihztdrhkgkcteqwvwn.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

### 3. Add Google Credentials to Supabase

1. Return to Supabase **Authentication** → **Providers** → **Google**
2. Paste the **Google Client ID**
3. Paste the **Google Client Secret**
4. Click **Save**

### 4. Configure Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your application URL:
   - Development: `http://localhost:3000`
   - Production: Your actual domain
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - Your production callback URL (e.g., `https://yourdomain.com/auth/callback`)
4. Click **Save**

## Testing the OAuth Flow

1. Start your development server
2. Navigate to `/signup` or `/login`
3. Click "Continue with Google"
4. You should be redirected to Google's consent screen
5. After authorization, you should be redirected to `/auth/callback?code=...`
6. The callback will exchange the code for a session and redirect you to the dashboard
7. Check that your user profile is created in the `users` table

## Troubleshooting

### If you still get a 404:
- Verify the redirect URL in Google Cloud Console matches exactly
- Check that the Supabase Site URL is correct
- Ensure cookies are enabled in your browser

### If you get "Unsupported provider":
- Confirm Google OAuth is enabled in Supabase
- Verify the Client ID and Secret are correctly entered
- Check that there are no extra spaces in the credentials

### If authentication succeeds but no user profile is created:
- Check the browser console for errors
- Verify the `users` table exists and has proper RLS policies
- Check the server logs for profile creation errors

## How the OAuth Flow Works Now

1. User clicks "Continue with Google"
2. Supabase initiates PKCE flow and redirects to Google
3. User authorizes on Google's consent screen
4. Google redirects back to `/auth/callback?code=XXXXX`
5. The callback route exchanges the code for a session
6. User profile is created/updated in the database
7. User is redirected to the dashboard with active session

The key difference from before is that we're now using PKCE flow (query parameter `?code=`) instead of implicit flow (hash fragment `#access_token=`), which works properly with Next.js server-side routes.

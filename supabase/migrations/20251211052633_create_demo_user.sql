/*
  # Create Demo User for Anonymous Access

  1. Purpose
    - Creates a demo user with valid UUID for anonymous/guest access
    - Allows the application to work without authentication
    - All anonymous users will share this account initially

  2. Changes
    - Insert demo user into auth.users table (required for FK)
    - Insert demo user into public.users table
    - Uses UUID: 00000000-0000-0000-0000-000000000001

  3. Security Notes
    - This is a temporary solution for MVP
    - All anonymous users will share data
    - Should be replaced with proper auth or per-session UUIDs
*/

-- Insert demo user into auth.users (required for foreign key constraint)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@aireadiness.local',
  crypt('demo-password-not-used', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo user into public.users table
INSERT INTO public.users (id, email, created_at, subscription_plan, gsc_connected)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@aireadiness.local',
  NOW(),
  'free',
  false
)
ON CONFLICT (id) DO NOTHING;
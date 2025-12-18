/*
  # Security Fixes Part 1 - Drop Functions

  Drop all functions that need to be recreated with security fixes
*/

DROP FUNCTION IF EXISTS public.auto_flag_citation_issues() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_citation_reputation_stats() CASCADE;
DROP FUNCTION IF EXISTS public.normalize_domain(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_share_of_voice(UUID, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.update_brand_identity_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_brand_identity(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_credits_remaining(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.deduct_credits(UUID, TEXT, INTEGER, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.revoke_redemption_code(TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.adjust_user_credits(UUID, UUID, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.change_user_tier(UUID, UUID, INTEGER, TEXT) CASCADE;

/*
  # Security Fixes Part 3 - Recreate Functions with Secure Search Path

  Recreate all functions with:
  - SECURITY DEFINER
  - SET search_path = public, pg_temp (prevents search path injection vulnerabilities)
*/

-- =====================================================
-- ADMIN HELPER FUNCTIONS
-- =====================================================

-- Function to revoke a code and downgrade the user
CREATE OR REPLACE FUNCTION revoke_redemption_code(
  p_code TEXT,
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'Refund processed'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code_record RECORD;
  v_user_record RECORD;
  v_admin_email TEXT;
  v_result JSONB;
  v_remaining_codes INT;
BEGIN
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  SELECT * INTO v_code_record FROM redemption_codes WHERE code = UPPER(p_code);
  IF v_code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code not found');
  END IF;

  IF NOT v_code_record.is_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code has not been redeemed');
  END IF;

  SELECT * INTO v_user_record FROM users WHERE id = v_code_record.redeemed_by;

  UPDATE redemption_codes
  SET 
    revoked_at = NOW(),
    revoked_by = p_admin_id,
    revoke_reason = p_reason,
    is_claimed = FALSE
  WHERE code = UPPER(p_code);

  UPDATE users
  SET codes_redeemed = array_remove(codes_redeemed, UPPER(p_code))
  WHERE id = v_code_record.redeemed_by;

  SELECT array_length(codes_redeemed, 1) INTO v_remaining_codes
  FROM users WHERE id = v_code_record.redeemed_by;

  v_remaining_codes := COALESCE(v_remaining_codes, 0);

  IF v_remaining_codes = 0 THEN
    UPDATE users
    SET 
      appsumo_tier = 0,
      is_lifetime_deal = FALSE,
      credits_total = 50,
      credits_used = 0,
      websites_limit = 1,
      keywords_limit = 3
    WHERE id = v_code_record.redeemed_by;
  ELSE
    UPDATE users
    SET 
      appsumo_tier = GREATEST(1, appsumo_tier - 1),
      credits_total = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 100
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 250
        ELSE 500
      END,
      credits_used = 0,
      websites_limit = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 3
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 10
        ELSE 50
      END,
      keywords_limit = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 25
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 100
        ELSE 500
      END
    WHERE id = v_code_record.redeemed_by;
  END IF;

  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'code_revoke',
    v_code_record.redeemed_by,
    v_user_record.email,
    jsonb_build_object(
      'code', v_code_record.code,
      'tier', v_code_record.tier,
      'reason', p_reason,
      'old_tier', v_user_record.appsumo_tier,
      'remaining_codes', v_remaining_codes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Code revoked and user downgraded',
    'code', v_code_record.code,
    'user_email', v_user_record.email,
    'remaining_codes', v_remaining_codes
  );
END;
$$;

-- Function to manually adjust user credits
CREATE OR REPLACE FUNCTION adjust_user_credits(
  p_user_id UUID,
  p_credit_change INT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_total INT;
BEGIN
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  v_new_total := GREATEST(0, v_user_record.credits_total + p_credit_change);

  UPDATE users
  SET credits_total = v_new_total
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'credit_adjust',
    p_user_id,
    v_user_record.email,
    jsonb_build_object(
      'credit_change', p_credit_change,
      'old_total', v_user_record.credits_total,
      'new_total', v_new_total,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Credits adjusted successfully',
    'old_total', v_user_record.credits_total,
    'new_total', v_new_total
  );
END;
$$;

-- Function to change user tier manually
CREATE OR REPLACE FUNCTION change_user_tier(
  p_user_id UUID,
  p_new_tier INT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_credits INT;
  v_new_websites INT;
  v_new_keywords INT;
BEGIN
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  IF p_new_tier NOT IN (0, 1, 2, 3) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid tier. Must be 0, 1, 2, or 3');
  END IF;

  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  CASE p_new_tier
    WHEN 0 THEN
      v_new_credits := 50;
      v_new_websites := 1;
      v_new_keywords := 3;
    WHEN 1 THEN
      v_new_credits := 100;
      v_new_websites := 3;
      v_new_keywords := 25;
    WHEN 2 THEN
      v_new_credits := 250;
      v_new_websites := 10;
      v_new_keywords := 100;
    WHEN 3 THEN
      v_new_credits := 500;
      v_new_websites := 50;
      v_new_keywords := 500;
  END CASE;

  UPDATE users
  SET 
    appsumo_tier = p_new_tier,
    is_lifetime_deal = (p_new_tier > 0),
    credits_total = v_new_credits,
    credits_used = 0,
    websites_limit = v_new_websites,
    keywords_limit = v_new_keywords
  WHERE id = p_user_id;

  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'tier_change',
    p_user_id,
    v_user_record.email,
    jsonb_build_object(
      'old_tier', v_user_record.appsumo_tier,
      'new_tier', p_new_tier,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Tier changed successfully',
    'old_tier', v_user_record.appsumo_tier,
    'new_tier', p_new_tier
  );
END;
$$;

-- =====================================================
-- CREDITS HELPER FUNCTIONS
-- =====================================================

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_credits INT,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_credits_remaining INT;
BEGIN
  SELECT (credits_total - credits_used) INTO v_credits_remaining
  FROM users
  WHERE id = p_user_id;

  IF v_credits_remaining < p_credits THEN
    RETURN FALSE;
  END IF;

  UPDATE users
  SET credits_used = credits_used + p_credits
  WHERE id = p_user_id;

  INSERT INTO credits_usage (user_id, action_type, credits_consumed, metadata)
  VALUES (p_user_id, p_action_type, p_credits, p_metadata);

  RETURN TRUE;
END;
$$;

-- =====================================================
-- SHARE OF VOICE CALCULATION
-- =====================================================

-- Function to calculate share of voice
CREATE OR REPLACE FUNCTION calculate_share_of_voice(
  p_website_id UUID,
  p_platform TEXT DEFAULT NULL
)
RETURNS TABLE (
  domain TEXT,
  citation_count BIGINT,
  sov_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  total_citations BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_citations
  FROM serp_snapshots ss
  JOIN tracked_keywords tk ON ss.keyword_id = tk.id
  WHERE tk.website_id = p_website_id
    AND (p_platform IS NULL OR ss.platform = p_platform)
    AND ss.snapshot_date >= NOW() - INTERVAL '30 days';

  IF total_citations = 0 THEN
    total_citations := 1;
  END IF;

  RETURN QUERY
  SELECT 
    unnest(ss.cited_domains) as domain,
    COUNT(*) as citation_count,
    ROUND((COUNT(*)::NUMERIC / total_citations) * 100, 2) as sov_percentage
  FROM serp_snapshots ss
  JOIN tracked_keywords tk ON ss.keyword_id = tk.id
  WHERE tk.website_id = p_website_id
    AND (p_platform IS NULL OR ss.platform = p_platform)
    AND ss.snapshot_date >= NOW() - INTERVAL '30 days'
  GROUP BY unnest(ss.cited_domains)
  ORDER BY citation_count DESC;
END;
$$;

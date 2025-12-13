/*
  # Extend Admin Panel & AppSumo LTD Support

  1. Overview
    This migration extends existing tables to support the admin panel for managing
    AppSumo lifetime deals, including code management and audit logging.

  2. Table Extensions
    - `redemption_codes` - Add missing columns (id, is_claimed, revoked_at, etc.)
    - `users` - Add is_admin flag for admin access

  3. New Tables
    - `admin_actions` - Complete audit log for all admin operations

  4. Security
    - RLS policies for admin-only access
    - Comprehensive audit logging
    - Admin helper functions for common operations

  5. Notes
    - Handles existing redemption_codes table gracefully
    - All changes are idempotent and can be run multiple times safely
*/

-- ============================================================================
-- ADD IS_ADMIN TO USERS TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;
    COMMENT ON COLUMN users.is_admin IS 'Admin flag for access to /admin portal';
  END IF;
END $$;

-- ============================================================================
-- EXTEND REDEMPTION_CODES TABLE
-- ============================================================================

-- Add id column as primary key (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'id'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN id UUID DEFAULT gen_random_uuid();
    -- Drop old primary key on code
    ALTER TABLE redemption_codes DROP CONSTRAINT IF EXISTS redemption_codes_pkey;
    -- Add new primary key on id
    ALTER TABLE redemption_codes ADD PRIMARY KEY (id);
    -- Keep code unique
    ALTER TABLE redemption_codes ADD CONSTRAINT redemption_codes_code_unique UNIQUE (code);
  END IF;
END $$;

-- Add is_claimed column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'is_claimed'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE;
    -- Update existing rows based on redeemed_by
    UPDATE redemption_codes SET is_claimed = TRUE WHERE redeemed_by IS NOT NULL;
  END IF;
END $$;

-- Add revocation tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoked_at'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoked_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoked_by'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoked_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoke_reason'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoke_reason TEXT;
  END IF;
END $$;

-- Add comments and indexes
COMMENT ON TABLE redemption_codes IS 'AppSumo LTD redemption codes with tier assignments and revocation tracking';
COMMENT ON COLUMN redemption_codes.is_claimed IS 'Whether code has been redeemed';
COMMENT ON COLUMN redemption_codes.revoked_at IS 'When code was revoked (for refunds)';
COMMENT ON COLUMN redemption_codes.revoked_by IS 'Admin who revoked the code';
COMMENT ON COLUMN redemption_codes.revoke_reason IS 'Reason for revocation (refund, abuse, etc.)';

CREATE INDEX IF NOT EXISTS idx_redemption_codes_is_claimed ON redemption_codes(is_claimed);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_tier ON redemption_codes(tier);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed_by ON redemption_codes(redeemed_by);

-- ============================================================================
-- CREATE ADMIN ACTIONS AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_email TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_actions IS 'Audit log of all admin operations for compliance and debugging';
COMMENT ON COLUMN admin_actions.action_type IS 'Type: code_upload, code_revoke, credit_adjust, tier_change, user_impersonate';
COMMENT ON COLUMN admin_actions.details IS 'JSON payload with action-specific data (amount, reason, old_value, new_value)';

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);

-- ============================================================================
-- ROW LEVEL SECURITY FOR REDEMPTION CODES (ADMIN ACCESS)
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can insert redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can update redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can delete redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Service role can update codes during redemption" ON redemption_codes;

-- Admins can view all codes
CREATE POLICY "Admins can view all redemption codes"
  ON redemption_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can insert codes (bulk upload)
CREATE POLICY "Admins can insert redemption codes"
  ON redemption_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can update codes (mark as revoked)
CREATE POLICY "Admins can update redemption codes"
  ON redemption_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can delete codes
CREATE POLICY "Admins can delete redemption codes"
  ON redemption_codes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- ============================================================================
-- ROW LEVEL SECURITY FOR ADMIN ACTIONS
-- ============================================================================

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin actions"
  ON admin_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can insert admin actions"
  ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- ============================================================================
-- ADMIN HELPER FUNCTIONS
-- ============================================================================

-- Function to revoke a code and downgrade the user
CREATE OR REPLACE FUNCTION revoke_redemption_code(
  p_code TEXT,
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'Refund processed'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record RECORD;
  v_user_record RECORD;
  v_admin_email TEXT;
  v_result JSONB;
  v_remaining_codes INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Get code details
  SELECT * INTO v_code_record FROM redemption_codes WHERE code = UPPER(p_code);
  IF v_code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code not found');
  END IF;

  IF NOT v_code_record.is_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code has not been redeemed');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = v_code_record.redeemed_by;

  -- Mark code as revoked
  UPDATE redemption_codes
  SET 
    revoked_at = NOW(),
    revoked_by = p_admin_id,
    revoke_reason = p_reason,
    is_claimed = FALSE
  WHERE code = UPPER(p_code);

  -- Remove code from user's redeemed list
  UPDATE users
  SET codes_redeemed = array_remove(codes_redeemed, UPPER(p_code))
  WHERE id = v_code_record.redeemed_by;

  -- Get remaining codes count
  SELECT array_length(codes_redeemed, 1) INTO v_remaining_codes
  FROM users WHERE id = v_code_record.redeemed_by;

  v_remaining_codes := COALESCE(v_remaining_codes, 0);

  -- Downgrade user tier
  IF v_remaining_codes = 0 THEN
    -- No more codes, revert to free tier
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
    -- Downgrade by one tier
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

  -- Log admin action
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
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_total INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Calculate new credit total
  v_new_total := GREATEST(0, v_user_record.credits_total + p_credit_change);

  -- Update user credits
  UPDATE users
  SET credits_total = v_new_total
  WHERE id = p_user_id;

  -- Log admin action
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
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_credits INT;
  v_new_websites INT;
  v_new_keywords INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Validate tier
  IF p_new_tier NOT IN (0, 1, 2, 3) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid tier. Must be 0, 1, 2, or 3');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Determine new limits based on tier
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

  -- Update user tier and limits
  UPDATE users
  SET 
    appsumo_tier = p_new_tier,
    is_lifetime_deal = (p_new_tier > 0),
    credits_total = v_new_credits,
    credits_used = 0,
    websites_limit = v_new_websites,
    keywords_limit = v_new_keywords
  WHERE id = p_user_id;

  -- Log admin action
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
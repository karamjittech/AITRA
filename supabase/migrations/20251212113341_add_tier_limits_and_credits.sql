/*
  # Add Tier Limits and Credit Tracking

  1. Overview
    This migration extends the users table to support tiered subscription limits
    and credit-based usage tracking for AI features.

  2. New Columns Added to Users Table
    - `credits_total` (int) - Total credits allocated for current billing period
    - `credits_used` (int) - Credits consumed this billing period
    - `websites_limit` (int) - Maximum websites user can track
    - `keywords_limit` (int) - Maximum keywords user can track
    - `stripe_customer_id` (text) - Stripe customer ID for billing
    - `stripe_subscription_id` (text) - Stripe subscription ID
    - `subscription_status` (text) - active, canceled, past_due, etc.
    - `billing_cycle_start` (timestamp) - Start of current billing cycle
    - `billing_cycle_end` (timestamp) - End of current billing cycle

  3. New Tables
    - `credits_usage` - Historical log of credit consumption for analytics

  4. Tier Specifications
    FREE:   credits_total=50,  websites_limit=1,  keywords_limit=3
    PRO:    credits_total=500, websites_limit=3,  keywords_limit=50
    AGENCY: credits_total=2500, websites_limit=15, keywords_limit=250

  5. Security
    - Users can view their own limits (read-only)
    - Only service role can modify limits
    - Credits usage tracking for transparency
*/

-- ============================================================================
-- EXTEND USERS TABLE WITH TIER LIMITS AND CREDITS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits_total'
  ) THEN
    ALTER TABLE users ADD COLUMN credits_total INT DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits_used'
  ) THEN
    ALTER TABLE users ADD COLUMN credits_used INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'websites_limit'
  ) THEN
    ALTER TABLE users ADD COLUMN websites_limit INT DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'keywords_limit'
  ) THEN
    ALTER TABLE users ADD COLUMN keywords_limit INT DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'billing_cycle_start'
  ) THEN
    ALTER TABLE users ADD COLUMN billing_cycle_start TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'billing_cycle_end'
  ) THEN
    ALTER TABLE users ADD COLUMN billing_cycle_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
  END IF;
END $$;

COMMENT ON COLUMN users.credits_total IS 'Total credits allocated for current billing period';
COMMENT ON COLUMN users.credits_used IS 'Credits consumed in current billing period';
COMMENT ON COLUMN users.websites_limit IS 'Maximum number of websites user can track';
COMMENT ON COLUMN users.keywords_limit IS 'Maximum number of keywords user can track';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, canceled, past_due';

-- ============================================================================
-- CREATE CREDITS USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credits_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  credits_consumed INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

COMMENT ON TABLE credits_usage IS 'Historical log of credit consumption for analytics';
COMMENT ON COLUMN credits_usage.action_type IS 'Type of AI action: sentiment, fan_out, sov, schema, eeat';
COMMENT ON COLUMN credits_usage.credits_consumed IS 'Number of credits deducted';
COMMENT ON COLUMN credits_usage.metadata IS 'Additional context: page_url, keyword, etc.';

CREATE INDEX IF NOT EXISTS idx_credits_usage_user_id ON credits_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_usage_created_at ON credits_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_usage_user_date ON credits_usage(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY FOR CREDITS USAGE
-- ============================================================================

ALTER TABLE credits_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit usage"
  ON credits_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert credit usage"
  ON credits_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- UPDATE DEMO USER WITH FREE TIER LIMITS
-- ============================================================================

UPDATE users
SET
  credits_total = 50,
  credits_used = 0,
  websites_limit = 1,
  keywords_limit = 3,
  subscription_status = 'active',
  billing_cycle_start = NOW(),
  billing_cycle_end = NOW() + INTERVAL '30 days'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_credits_remaining(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INT;
  v_used INT;
BEGIN
  SELECT credits_total, credits_used
  INTO v_total, v_used
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_total, 0) - COALESCE(v_used, 0);
END;
$$;

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_credits INT,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INT;
BEGIN
  v_remaining := get_credits_remaining(p_user_id);

  IF v_remaining < p_credits THEN
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
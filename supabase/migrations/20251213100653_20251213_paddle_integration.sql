/*
  # Add Paddle Payment Integration Support

  1. Overview
    This migration adds Paddle payment gateway support alongside existing AppSumo
    lifetime deals. Users can subscribe via Paddle for Pro or Agency plans.

  2. Column Changes
    - Rename `stripe_customer_id` to `paddle_customer_id`
    - Rename `stripe_subscription_id` to `paddle_subscription_id`
    - Add `paddle_variant_id` (text) - The Paddle price ID (pro or agency)
    - Add `next_bill_date` (timestamp) - Next billing date from Paddle
    - Add `payment_method` (varchar) - Payment source: 'paddle', 'appsumo', or 'free'

  3. New Table: payment_history
    - Audit log of all Paddle payment events
    - Tracks transactions, subscriptions, and status changes
    - Includes full event data from Paddle webhooks

  4. Security
    - RLS enabled on payment_history table
    - Users can only view their own payment history
    - Service role required for webhook updates

  5. Compatibility
    - Preserves existing AppSumo functionality
    - Users with is_lifetime_deal flag unaffected
    - Supports hybrid model: some users on AppSumo, some on Paddle
*/

-- ============================================================================
-- RENAME STRIPE COLUMNS TO PADDLE (PAYMENT AGNOSTIC)
-- ============================================================================

DO $$
BEGIN
  -- Rename stripe_customer_id to paddle_customer_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users RENAME COLUMN stripe_customer_id TO paddle_customer_id;
  END IF;

  -- Rename stripe_subscription_id to paddle_subscription_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE users RENAME COLUMN stripe_subscription_id TO paddle_subscription_id;
  END IF;
END $$;

-- ============================================================================
-- ADD NEW PADDLE-SPECIFIC COLUMNS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'paddle_variant_id'
  ) THEN
    ALTER TABLE users ADD COLUMN paddle_variant_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'next_bill_date'
  ) THEN
    ALTER TABLE users ADD COLUMN next_bill_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE users ADD COLUMN payment_method VARCHAR(20) DEFAULT 'free';
  END IF;
END $$;

-- Add helpful comments
COMMENT ON COLUMN users.paddle_customer_id IS 'Paddle customer ID for billing';
COMMENT ON COLUMN users.paddle_subscription_id IS 'Paddle subscription ID';
COMMENT ON COLUMN users.paddle_variant_id IS 'Paddle price ID (pro or agency plan)';
COMMENT ON COLUMN users.next_bill_date IS 'Next billing date from Paddle';
COMMENT ON COLUMN users.payment_method IS 'Payment source: paddle, appsumo, or free';

-- ============================================================================
-- CREATE PAYMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paddle_transaction_id TEXT NOT NULL,
  paddle_subscription_id TEXT,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50),
  tier VARCHAR(20),
  event_type VARCHAR(50),
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payment_history IS 'Audit log of all Paddle payment events';
COMMENT ON COLUMN payment_history.paddle_transaction_id IS 'Unique transaction ID from Paddle';
COMMENT ON COLUMN payment_history.paddle_subscription_id IS 'Associated subscription ID';
COMMENT ON COLUMN payment_history.event_type IS 'Paddle event type (e.g., subscription.created)';
COMMENT ON COLUMN payment_history.event_data IS 'Full webhook payload from Paddle';

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_transaction_id ON payment_history(paddle_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history"
  ON payment_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert payment records (for webhooks)
CREATE POLICY "Service role can insert payment history"
  ON payment_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

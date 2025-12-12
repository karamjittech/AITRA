/*
  # Add Trust Signals Checklist Column

  ## Overview
  Adds a column to store user's progress through the E-E-A-T trust signals checklist.
  This enables tracking which trust signals have been implemented.

  ## What This Enables
  - Save/load user checklist state
  - Track implementation progress
  - Provide persistent UX across sessions

  ## New Column
  - **trust_signals_checklist** (JSONB) - Stores checklist state as key-value pairs
    Example: {"author-bio": true, "credentials": false, ...}

  ## Security
  - Uses existing RLS policies on brand_identity table
  - No additional security measures needed
*/

-- ============================================================================
-- ADD TRUST SIGNALS CHECKLIST COLUMN
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_identity' AND column_name = 'trust_signals_checklist'
  ) THEN
    ALTER TABLE brand_identity ADD COLUMN trust_signals_checklist JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;

-- ============================================================================
-- ADD COLUMN COMMENT
-- ============================================================================

COMMENT ON COLUMN brand_identity.trust_signals_checklist IS 'User progress through E-E-A-T trust signals checklist';
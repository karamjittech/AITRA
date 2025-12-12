/*
  # AI Authority & Entity Builder - Brand Identity Storage

  ## Overview
  This migration creates the brand_identity table to store site-wide entity information
  and E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) audit data.
  
  This is the "Secret Weapon" feature - research shows adding Identity signals like
  linked credentials can boost AI citations by 45%.

  ## New Tables

  1. **brand_identity** - Site-wide brand and entity information
     - `id` (uuid, primary key)
     - `user_id` (uuid, FK to users) - UNIQUE constraint, one brand per user
     - `organization_name` (text) - Brand/company name
     - `organization_type` (text) - Schema.org type (Corporation, LocalBusiness, etc.)
     - `logo_url` (text) - URL to brand logo
     - `description` (text) - Brand description (200-500 chars)
     - `website_url` (text) - Primary website URL
     - `same_as_links` (jsonb) - Array of authority links (LinkedIn, Wikipedia, etc.)
     - `knows_about` (jsonb) - Array of expertise topics
     - `physical_address` (jsonb) - Complete address object
     - `contact_info` (jsonb) - Phone, email, contact page
     - `founding_date` (date) - When organization was founded
     - `about_page_url` (text) - URL to About Us page
     - `eeat_score` (float) - E-E-A-T trust score (0-100)
     - `eeat_analyzed_at` (timestamptz) - When E-E-A-T was last analyzed
     - `eeat_missing_signals` (jsonb) - Array of missing trust signals
     - `eeat_recommendations` (jsonb) - Array of actionable recommendations
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Research Backing
  - "Updating author bios with linked credentials (sameAs) increased LLM citations by 45%"
  - "Government sources are 11.75x more likely to be cited by AI models"
  - Entity identity + Knowledge Graph connections = AI trust signals

  ## Security
  - RLS enabled on brand_identity table
  - Users can only access their own brand identity
  - Service role can read all for analytics
  - UNIQUE constraint ensures one brand identity per user

  ## Performance
  - Index on user_id for fast lookups
  - Index on eeat_score for leaderboards/analytics
  - GIN index on same_as_links for searches
*/

-- ============================================================================
-- CREATE BRAND_IDENTITY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_identity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type TEXT DEFAULT 'Organization',
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  same_as_links JSONB DEFAULT '[]'::JSONB,
  knows_about JSONB DEFAULT '[]'::JSONB,
  physical_address JSONB DEFAULT '{}'::JSONB,
  contact_info JSONB DEFAULT '{}'::JSONB,
  founding_date DATE,
  about_page_url TEXT,
  eeat_score FLOAT DEFAULT 0,
  eeat_analyzed_at TIMESTAMPTZ,
  eeat_missing_signals JSONB DEFAULT '[]'::JSONB,
  eeat_recommendations JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

COMMENT ON TABLE brand_identity IS 'Site-wide brand entity information and E-E-A-T audit data';
COMMENT ON COLUMN brand_identity.organization_name IS 'Brand or company name';
COMMENT ON COLUMN brand_identity.organization_type IS 'Schema.org type: Organization, Corporation, LocalBusiness, EducationalOrganization, etc.';
COMMENT ON COLUMN brand_identity.same_as_links IS 'Array of authority links: LinkedIn, Wikipedia, Wikidata, Crunchbase, ORCID, etc.';
COMMENT ON COLUMN brand_identity.knows_about IS 'Array of expertise topics/keywords for knowsAbout property';
COMMENT ON COLUMN brand_identity.physical_address IS 'Complete address: {street, city, state, country, postalCode}';
COMMENT ON COLUMN brand_identity.contact_info IS 'Contact details: {email, phone, contactPageUrl}';
COMMENT ON COLUMN brand_identity.eeat_score IS 'E-E-A-T trust score (0-100) from About page analysis';
COMMENT ON COLUMN brand_identity.eeat_missing_signals IS 'Array of missing trust signals detected by analysis';
COMMENT ON COLUMN brand_identity.eeat_recommendations IS 'Array of actionable recommendations with priority and impact';

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_brand_identity_user_id ON brand_identity(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_identity_eeat_score ON brand_identity(eeat_score DESC);
CREATE INDEX IF NOT EXISTS idx_brand_identity_same_as_links ON brand_identity USING GIN(same_as_links);
CREATE INDEX IF NOT EXISTS idx_brand_identity_knows_about ON brand_identity USING GIN(knows_about);

-- ============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_brand_identity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_identity_updated_at
  BEFORE UPDATE ON brand_identity
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_identity_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE brand_identity ENABLE ROW LEVEL SECURITY;

-- Users can view their own brand identity
CREATE POLICY "Users can view own brand identity"
  ON brand_identity
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own brand identity
CREATE POLICY "Users can insert own brand identity"
  ON brand_identity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand identity
CREATE POLICY "Users can update own brand identity"
  ON brand_identity
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own brand identity
CREATE POLICY "Users can delete own brand identity"
  ON brand_identity
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all brand identities for analytics
CREATE POLICY "Service role can manage brand identities"
  ON brand_identity
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTION: GET OR CREATE BRAND IDENTITY
-- ============================================================================

CREATE OR REPLACE FUNCTION get_or_create_brand_identity(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_brand_id UUID;
  v_user_email TEXT;
BEGIN
  -- Try to get existing brand identity
  SELECT id INTO v_brand_id
  FROM brand_identity
  WHERE user_id = p_user_id;
  
  -- If doesn't exist, create with defaults
  IF v_brand_id IS NULL THEN
    -- Get user email for default organization name
    SELECT email INTO v_user_email
    FROM users
    WHERE id = p_user_id;
    
    INSERT INTO brand_identity (
      user_id,
      organization_name,
      description
    ) VALUES (
      p_user_id,
      COALESCE(SPLIT_PART(v_user_email, '@', 2), 'My Organization'),
      'Add your brand description here to improve AI visibility'
    )
    RETURNING id INTO v_brand_id;
  END IF;
  
  RETURN v_brand_id;
END;
$$;

COMMENT ON FUNCTION get_or_create_brand_identity IS 'Gets existing brand identity or creates one with defaults for a user';

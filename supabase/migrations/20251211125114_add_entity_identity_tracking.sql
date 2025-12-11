/*
  # Add Entity Identity & Schema Tracking

  ## Overview
  This migration adds entity identity tracking to the page_data table. This is a
  competitive advantage over ClickRank - tracking Organization/Person schema with
  Knowledge Graph connections (sameAs links to Wikipedia, Wikidata, LinkedIn, etc.).

  ## What This Enables
  - Detection of Organization schema (for brands)
  - Detection of Person schema (for authors/experts)
  - Tracking of sameAs links (Knowledge Graph identity)
  - Entity identity scoring (0-15 points)
  - Platform-specific recommendations (especially important for Claude & Gemini)

  ## Research Backing
  "Government sources are 11.75x more likely to be cited by AI models"
  - This suggests entity authority matters
  - sameAs links establish entity identity in Knowledge Graphs
  - AI models use these to verify authority and trustworthiness

  ## New Columns in page_data
  1. **has_organization_schema** (boolean) - Organization schema present
  2. **has_person_schema** (boolean) - Person/Author schema present
  3. **has_same_as_links** (boolean) - sameAs links to external identity sources
  4. **same_as_platforms** (text[]) - Array of platforms linked (Wikipedia, Wikidata, LinkedIn, etc.)
  5. **entity_type** (varchar) - Entity type: 'organization', 'person', 'both', 'none'
  6. **entity_identity_score** (float) - Entity identity strength (0-15 points)

  ## Scoring Logic
  - Organization schema present: +5 points
  - Person schema present: +3 points
  - sameAs links present: +7 points
  - Maximum: 15 points (full entity identity)

  ## Security
  - No new tables, extending existing page_data table
  - RLS policies already cover page_data
  - No additional security measures needed

  ## Performance
  - No new indexes needed (existing page_id indexes sufficient)
  - Minimal storage impact (boolean + text array fields)
*/

-- ============================================================================
-- ADD ENTITY IDENTITY COLUMNS TO PAGE_DATA
-- ============================================================================

DO $$
BEGIN
  -- Add Organization schema detection
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_data' AND column_name = 'has_organization_schema'
  ) THEN
    ALTER TABLE page_data ADD COLUMN has_organization_schema BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add Person schema detection
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_data' AND column_name = 'has_person_schema'
  ) THEN
    ALTER TABLE page_data ADD COLUMN has_person_schema BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add sameAs links detection
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_data' AND column_name = 'has_same_as_links'
  ) THEN
    ALTER TABLE page_data ADD COLUMN has_same_as_links BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add sameAs platforms array
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_data' AND column_name = 'same_as_platforms'
  ) THEN
    ALTER TABLE page_data ADD COLUMN same_as_platforms TEXT[] DEFAULT '{}'::TEXT[];
  END IF;

  -- Add entity type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_data' AND column_name = 'entity_type'
  ) THEN
    ALTER TABLE page_data ADD COLUMN entity_type VARCHAR(20) DEFAULT 'none';
  END IF;

  -- Add entity identity score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_data' AND column_name = 'entity_identity_score'
  ) THEN
    ALTER TABLE page_data ADD COLUMN entity_identity_score FLOAT DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- ADD COLUMN COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN page_data.has_organization_schema IS 'Organization schema markup present (JSON-LD)';
COMMENT ON COLUMN page_data.has_person_schema IS 'Person/Author schema markup present (JSON-LD)';
COMMENT ON COLUMN page_data.has_same_as_links IS 'sameAs links to external identity sources present';
COMMENT ON COLUMN page_data.same_as_platforms IS 'Array of platforms linked via sameAs (Wikipedia, Wikidata, LinkedIn, etc.)';
COMMENT ON COLUMN page_data.entity_type IS 'Entity type: organization, person, both, or none';
COMMENT ON COLUMN page_data.entity_identity_score IS 'Entity identity strength score (0-15 points)';

/*
  # Add Fan-Out Query Support to Tracked Keywords

  ## Overview
  This migration adds support for keyword clustering and intent-based query fan-out,
  enabling the Smart Query Simulation Engine to track parent-child keyword relationships.

  ## Changes
  
  ### 1. New Columns Added to tracked_keywords
  - `parent_id` (uuid, nullable) - References parent keyword for hierarchical tracking
  - `intent_category` (text) - Intent type: Informational, Comparative, Instructional, Brand, Evaluative
  - `is_fan_out` (boolean) - Indicates if keyword is AI-generated fan-out query
  - `cluster_name` (text, nullable) - Optional name for keyword cluster grouping
  
  ### 2. Performance Indexes
  - Index on `parent_id` for faster hierarchical queries
  - Index on `intent_category` for filtering by intent type
  
  ### 3. Security
  - RLS policies automatically apply to new columns
  - No additional policies needed (existing policies cover new fields)
  
  ## Intent Categories
  Based on LLM optimization research, we track 5 intent categories:
  - **Informational**: "How does X work?", "What is X?"
  - **Comparative**: "X vs Y", "Best X for Y"
  - **Instructional**: "How to use X", "Steps to Y"
  - **Brand**: "X features", "X pricing for enterprise"
  - **Evaluative**: "Is X good?", "Should I use X?"
  
  ## Notes
  - Maintains backward compatibility (all new columns are nullable or have defaults)
  - Existing tracked_keywords data remains unchanged
  - Parent-child relationships enable 1:N keyword clustering
*/

-- Add fan-out support columns to tracked_keywords table
DO $$
BEGIN
  -- Add parent_id column for hierarchical keyword relationships
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracked_keywords' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE tracked_keywords 
    ADD COLUMN parent_id UUID REFERENCES tracked_keywords(id) ON DELETE CASCADE;
  END IF;

  -- Add intent_category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracked_keywords' AND column_name = 'intent_category'
  ) THEN
    ALTER TABLE tracked_keywords 
    ADD COLUMN intent_category TEXT;
  END IF;

  -- Add is_fan_out flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracked_keywords' AND column_name = 'is_fan_out'
  ) THEN
    ALTER TABLE tracked_keywords 
    ADD COLUMN is_fan_out BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add cluster_name for grouping
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracked_keywords' AND column_name = 'cluster_name'
  ) THEN
    ALTER TABLE tracked_keywords 
    ADD COLUMN cluster_name TEXT;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN tracked_keywords.parent_id IS 'References parent keyword for hierarchical fan-out tracking';
COMMENT ON COLUMN tracked_keywords.intent_category IS 'Intent type: Informational, Comparative, Instructional, Brand, Evaluative';
COMMENT ON COLUMN tracked_keywords.is_fan_out IS 'True if this is an AI-generated fan-out query';
COMMENT ON COLUMN tracked_keywords.cluster_name IS 'Optional name for keyword cluster grouping';

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_parent_id 
  ON tracked_keywords(parent_id);

CREATE INDEX IF NOT EXISTS idx_tracked_keywords_intent_category 
  ON tracked_keywords(intent_category);

CREATE INDEX IF NOT EXISTS idx_tracked_keywords_is_fan_out 
  ON tracked_keywords(is_fan_out);

-- Drop the old unique constraint and create a new one that allows duplicates across websites
-- but still prevents duplicates within the same website and parent context
DO $$
BEGIN
  -- Check if the old constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tracked_keywords_website_id_keyword_key'
  ) THEN
    ALTER TABLE tracked_keywords 
    DROP CONSTRAINT tracked_keywords_website_id_keyword_key;
  END IF;
END $$;

-- Create new unique constraint that allows same keyword under different parents
-- This enables multiple fan-out clusters to have similar queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_tracked_keywords_unique_website_keyword_parent
  ON tracked_keywords(website_id, keyword, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));
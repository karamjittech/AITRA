/*
  # Competitive Analysis & Roadmap Schema

  ## Overview
  This migration adds support for competitive analysis and optimization roadmap tracking.
  It enables users to compare their sites against competitors and track progress through
  optimization phases.

  ## New Tables

  1. **competitor_benchmarks** - Store competitor data for comparison
     - `id` (uuid, primary key)
     - `page_id` (uuid, references page_data) - The user's analyzed page
     - `competitor_name` (text) - Display name of competitor
     - `competitor_url` (text) - Competitor's page URL
     - `competitor_domain` (text) - Competitor's domain
     - `domain_rating` (int) - Domain authority (0-100)
     - `backlink_count` (int) - Number of backlinks
     - `content_length` (int) - Word count
     - `h1_count` (int) - Number of H1 tags
     - `h2_count` (int) - Number of H2 tags
     - `schema_present` (boolean) - Has schema markup
     - `freshness_days` (int) - Days since last update
     - `overall_score` (float) - AI readiness score (0-100)
     - `google_rank` (int) - Position in Google SERP (null if not ranking)
     - `ai_citation_percentage` (float) - Percentage of AI citations (0-100)
     - `is_mock_data` (boolean) - Whether this is mock/demo data
     - `created_at` (timestamp)

  2. **optimization_roadmap** - Track user's optimization phase and progress
     - `id` (uuid, primary key)
     - `page_id` (uuid, references page_data) - The analyzed page
     - `current_phase` (int) - Current phase number (1, 2, or 3)
     - `phase_1_completed` (boolean) - Phase 1 completion status
     - `phase_2_completed` (boolean) - Phase 2 completion status
     - `phase_3_completed` (boolean) - Phase 3 completion status
     - `phase_1_completion_date` (timestamp) - When Phase 1 was completed
     - `phase_2_completion_date` (timestamp) - When Phase 2 was completed
     - `phase_3_completion_date` (timestamp) - When Phase 3 was completed
     - `estimated_completion_weeks` (int) - Estimated weeks to complete current phase
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

  ## Security
  - RLS enabled on all new tables
  - Users can only access competitor data for their own analyzed pages
  - Users can only access roadmap data for their own pages

  ## Performance
  - Indexes added on foreign keys
  - Composite indexes for querying by page and creation date
*/

-- ============================================================================
-- COMPETITOR BENCHMARKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitor_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_url TEXT,
  competitor_domain TEXT,
  domain_rating INT DEFAULT 0,
  backlink_count INT DEFAULT 0,
  content_length INT DEFAULT 0,
  h1_count INT DEFAULT 0,
  h2_count INT DEFAULT 0,
  schema_present BOOLEAN DEFAULT FALSE,
  freshness_days INT DEFAULT 0,
  overall_score FLOAT DEFAULT 0,
  google_rank INT,
  ai_citation_percentage FLOAT DEFAULT 0,
  is_mock_data BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE competitor_benchmarks IS 'Competitor data for comparison analysis';
COMMENT ON COLUMN competitor_benchmarks.domain_rating IS 'Domain authority score 0-100';
COMMENT ON COLUMN competitor_benchmarks.google_rank IS 'Position in Google SERP, null if not ranking';
COMMENT ON COLUMN competitor_benchmarks.ai_citation_percentage IS 'Percentage of time cited by AI models (0-100)';
COMMENT ON COLUMN competitor_benchmarks.is_mock_data IS 'True if this is demo/mock data for MVP';

-- ============================================================================
-- OPTIMIZATION ROADMAP TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS optimization_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL UNIQUE REFERENCES page_data(id) ON DELETE CASCADE,
  current_phase INT NOT NULL DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 3),
  phase_1_completed BOOLEAN DEFAULT FALSE,
  phase_2_completed BOOLEAN DEFAULT FALSE,
  phase_3_completed BOOLEAN DEFAULT FALSE,
  phase_1_completion_date TIMESTAMPTZ,
  phase_2_completion_date TIMESTAMPTZ,
  phase_3_completion_date TIMESTAMPTZ,
  estimated_completion_weeks INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE optimization_roadmap IS 'User optimization phase tracking and progress';
COMMENT ON COLUMN optimization_roadmap.current_phase IS 'Current optimization phase: 1=Content, 2=Authority, 3=AI Optimization';
COMMENT ON COLUMN optimization_roadmap.estimated_completion_weeks IS 'Estimated weeks to complete all phases';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_competitor_benchmarks_page_id
  ON competitor_benchmarks(page_id);

CREATE INDEX IF NOT EXISTS idx_competitor_benchmarks_created
  ON competitor_benchmarks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_optimization_roadmap_page_id
  ON optimization_roadmap(page_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE competitor_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_roadmap ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMPETITOR BENCHMARKS POLICIES
-- ============================================================================

CREATE POLICY "Users can view competitors for own pages"
  ON competitor_benchmarks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = competitor_benchmarks.page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert competitors for own pages"
  ON competitor_benchmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update competitors for own pages"
  ON competitor_benchmarks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = competitor_benchmarks.page_id
      AND websites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete competitors for own pages"
  ON competitor_benchmarks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = competitor_benchmarks.page_id
      AND websites.user_id = auth.uid()
    )
  );

-- ============================================================================
-- OPTIMIZATION ROADMAP POLICIES
-- ============================================================================

CREATE POLICY "Users can view roadmap for own pages"
  ON optimization_roadmap
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = optimization_roadmap.page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert roadmap for own pages"
  ON optimization_roadmap
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update roadmap for own pages"
  ON optimization_roadmap
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = optimization_roadmap.page_id
      AND websites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete roadmap for own pages"
  ON optimization_roadmap
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = optimization_roadmap.page_id
      AND websites.user_id = auth.uid()
    )
  );

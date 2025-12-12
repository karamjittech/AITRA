/*
  # AI Share of Voice (SOV) Engine Enhancements

  ## Overview
  This migration enhances competitive intelligence tracking for the AI Share of Voice Engine.
  It adds comprehensive domain tracking, co-citation analysis, and platform-specific
  competitive metrics.

  ## Changes to Existing Tables

  **citations** table:
  - `cited_domain` (text) - Normalized domain extracted from citation
  - `is_user_domain` (boolean) - Whether this citation is for the user's domain
  - `citation_strength` (text) - primary/supporting/mention classification
  
  **serp_snapshots** table:
  - `all_cited_domains` (jsonb) - Complete list of all domains cited in this snapshot
  - `competitor_leaderboard` (jsonb) - Cached SOV calculations for performance
  - `total_citations_count` (int) - Total number of citations in this snapshot
  
  **competitor_benchmarks** table:
  - `sov_percentage` (float) - Share of Voice percentage across tracked keywords
  - `co_citation_frequency` (int) - How often cited alongside user's domain
  - `platforms_cited` (text[]) - Which AI platforms cite this competitor
  - `last_seen` (timestamptz) - Last time competitor was cited
  
  ## New Tables
  
  **competitor_domains** - Persistent tracking of competitor domains
  - `id` (uuid, primary key)
  - `website_id` (uuid, references websites)
  - `domain` (text) - Normalized competitor domain
  - `display_name` (text) - Human-readable competitor name
  - `total_citations` (int) - Lifetime citation count
  - `sov_percentage` (float) - Current share of voice percentage
  - `first_seen` (timestamptz) - First citation timestamp
  - `last_seen` (timestamptz) - Most recent citation timestamp
  - `is_verified` (boolean) - Whether user verified this as a real competitor
  - `is_noise` (boolean) - Whether this is a noise domain (Wikipedia, etc.)
  
  ## Performance Improvements
  - Index on cited_domain for fast competitor lookups
  - Index on is_user_domain for quick filtering
  - JSONB indexes for efficient competitor leaderboard queries
  - Materialized view considerations for real-time SOV dashboards

  ## Research Backing
  - "Co-citation analysis reveals competitive positioning" - SearchAtlas Research
  - "Platform-specific SOV varies by 23% on average" - Adobe LLM Study
  - "Share of Voice correlates 0.68 with market perception" - Backlinko Analysis
*/

-- ============================================================================
-- ENHANCE CITATIONS TABLE
-- ============================================================================

-- Add domain tracking fields
ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS cited_domain TEXT;

ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS is_user_domain BOOLEAN DEFAULT FALSE;

ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS citation_strength TEXT CHECK (citation_strength IN ('primary', 'supporting', 'mention'));

COMMENT ON COLUMN citations.cited_domain IS 'Normalized domain extracted from citation (e.g., example.com)';
COMMENT ON COLUMN citations.is_user_domain IS 'Whether this citation is for the user own domain';
COMMENT ON COLUMN citations.citation_strength IS 'Citation type: primary (featured), supporting (listed), or mention (referenced)';

-- ============================================================================
-- ENHANCE SERP_SNAPSHOTS TABLE
-- ============================================================================

-- Add comprehensive domain tracking
ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS all_cited_domains JSONB DEFAULT '[]'::JSONB;

ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS competitor_leaderboard JSONB DEFAULT '{}'::JSONB;

ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS total_citations_count INT DEFAULT 0;

COMMENT ON COLUMN serp_snapshots.all_cited_domains IS 'Complete array of all domains cited in this snapshot: [{domain, position, strength}]';
COMMENT ON COLUMN serp_snapshots.competitor_leaderboard IS 'Cached SOV calculations: {domain: {citations, sov_percent, rank}}';
COMMENT ON COLUMN serp_snapshots.total_citations_count IS 'Total number of citations in this snapshot for SOV calculations';

-- ============================================================================
-- ENHANCE COMPETITOR_BENCHMARKS TABLE
-- ============================================================================

-- Add SOV tracking fields
ALTER TABLE competitor_benchmarks
  ADD COLUMN IF NOT EXISTS sov_percentage FLOAT DEFAULT 0;

ALTER TABLE competitor_benchmarks
  ADD COLUMN IF NOT EXISTS co_citation_frequency INT DEFAULT 0;

ALTER TABLE competitor_benchmarks
  ADD COLUMN IF NOT EXISTS platforms_cited TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE competitor_benchmarks
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

COMMENT ON COLUMN competitor_benchmarks.sov_percentage IS 'Share of Voice percentage (0-100) across all tracked keywords';
COMMENT ON COLUMN competitor_benchmarks.co_citation_frequency IS 'Number of times cited alongside user domain';
COMMENT ON COLUMN competitor_benchmarks.platforms_cited IS 'Array of AI platforms that cite this competitor';
COMMENT ON COLUMN competitor_benchmarks.last_seen IS 'Timestamp of most recent citation';

-- ============================================================================
-- CREATE COMPETITOR_DOMAINS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitor_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  display_name TEXT NOT NULL,
  total_citations INT DEFAULT 0,
  sov_percentage FLOAT DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  is_noise BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(website_id, domain)
);

COMMENT ON TABLE competitor_domains IS 'Persistent tracking of competitor domains across all citations';
COMMENT ON COLUMN competitor_domains.domain IS 'Normalized competitor domain (e.g., competitor.com)';
COMMENT ON COLUMN competitor_domains.display_name IS 'Human-readable competitor name for UI display';
COMMENT ON COLUMN competitor_domains.total_citations IS 'Lifetime citation count across all keywords/platforms';
COMMENT ON COLUMN competitor_domains.sov_percentage IS 'Current Share of Voice percentage (0-100)';
COMMENT ON COLUMN competitor_domains.is_verified IS 'Whether user confirmed this is a real competitor';
COMMENT ON COLUMN competitor_domains.is_noise IS 'Whether this is a noise domain (Wikipedia, news sites, etc.)';

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Citations table indexes
CREATE INDEX IF NOT EXISTS idx_citations_cited_domain ON citations(cited_domain) WHERE cited_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_citations_is_user_domain ON citations(is_user_domain);
CREATE INDEX IF NOT EXISTS idx_citations_citation_strength ON citations(citation_strength);

-- SERP snapshots JSONB indexes
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_all_cited_domains ON serp_snapshots USING GIN(all_cited_domains);
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_competitor_leaderboard ON serp_snapshots USING GIN(competitor_leaderboard);

-- Competitor domains indexes
CREATE INDEX IF NOT EXISTS idx_competitor_domains_website_id ON competitor_domains(website_id);
CREATE INDEX IF NOT EXISTS idx_competitor_domains_domain ON competitor_domains(domain);
CREATE INDEX IF NOT EXISTS idx_competitor_domains_sov ON competitor_domains(sov_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_domains_last_seen ON competitor_domains(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_domains_verified ON competitor_domains(is_verified) WHERE is_verified = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE competitor_domains ENABLE ROW LEVEL SECURITY;

-- Users can view competitor domains for their own websites
CREATE POLICY "Users can view competitor domains for own websites"
  ON competitor_domains
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = competitor_domains.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Users can insert competitor domains for their own websites
CREATE POLICY "Users can insert competitor domains for own websites"
  ON competitor_domains
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Users can update competitor domains for their own websites
CREATE POLICY "Users can update competitor domains for own websites"
  ON competitor_domains
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = competitor_domains.website_id
      AND websites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Users can delete competitor domains for their own websites
CREATE POLICY "Users can delete competitor domains for own websites"
  ON competitor_domains
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = competitor_domains.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Service role can manage competitor domains for analysis
CREATE POLICY "Service role can manage competitor domains"
  ON competitor_domains
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTION: NORMALIZE DOMAIN
-- ============================================================================

-- Function to normalize domains for consistent tracking
CREATE OR REPLACE FUNCTION normalize_domain(url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  -- Remove protocol (http://, https://)
  normalized := regexp_replace(url, '^https?://', '', 'i');
  
  -- Remove www. prefix
  normalized := regexp_replace(normalized, '^www\.', '', 'i');
  
  -- Remove path and query params (keep only domain)
  normalized := regexp_replace(normalized, '/.*$', '');
  
  -- Convert to lowercase
  normalized := lower(normalized);
  
  RETURN normalized;
END;
$$;

COMMENT ON FUNCTION normalize_domain IS 'Normalizes URLs to consistent domain format (e.g., example.com)';

-- ============================================================================
-- HELPER FUNCTION: CALCULATE SHARE OF VOICE
-- ============================================================================

-- Function to calculate SOV for a website across all citations
CREATE OR REPLACE FUNCTION calculate_share_of_voice(p_website_id UUID, p_platform TEXT DEFAULT NULL)
RETURNS TABLE(
  domain TEXT,
  citation_count BIGINT,
  sov_percentage NUMERIC,
  platforms TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH total_citations AS (
    SELECT COUNT(*) as total
    FROM citations c
    JOIN tracked_keywords tk ON tk.id = c.keyword_id
    WHERE tk.website_id = p_website_id
      AND (p_platform IS NULL OR c.platform = p_platform)
      AND c.cited_domain IS NOT NULL
  ),
  domain_citations AS (
    SELECT 
      c.cited_domain as domain,
      COUNT(*) as citations,
      array_agg(DISTINCT c.platform) as platforms
    FROM citations c
    JOIN tracked_keywords tk ON tk.id = c.keyword_id
    WHERE tk.website_id = p_website_id
      AND (p_platform IS NULL OR c.platform = p_platform)
      AND c.cited_domain IS NOT NULL
    GROUP BY c.cited_domain
  )
  SELECT 
    dc.domain,
    dc.citations,
    CASE 
      WHEN tc.total > 0 THEN ROUND((dc.citations::NUMERIC / tc.total::NUMERIC * 100), 2)
      ELSE 0
    END as sov_percentage,
    dc.platforms
  FROM domain_citations dc
  CROSS JOIN total_citations tc
  ORDER BY dc.citations DESC;
END;
$$;

COMMENT ON FUNCTION calculate_share_of_voice IS 'Calculates Share of Voice percentage for all domains competing for a website citations';

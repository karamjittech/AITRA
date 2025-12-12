/*
  # Add Link Verification & Alert Tracking

  ## Overview
  This migration enhances the citation tracking system with:
  - Link verification to detect broken/hallucinated URLs
  - Alert system for negative sentiment and broken links
  - Action tracking to monitor issue resolution

  ## Changes to Existing Tables

  ### citations table additions:
  1. **Link Verification Fields**
     - `cited_url` (text) - The actual URL cited in AI response
     - `link_status` (text) - Status: live, broken_404, broken_timeout, hallucinated, pending
     - `link_checked_at` (timestamptz) - When link was last verified
     - `redirect_detected` (boolean) - Whether URL redirects
     - `redirect_url` (text) - Final destination after redirects

  2. **Alert & Action Tracking Fields**
     - `requires_action` (boolean) - Auto-flagged if negative or broken
     - `action_taken` (boolean) - User addressed the issue
     - `action_taken_at` (timestamptz) - When action was taken
     - `surrounding_text` (text) - Larger context window around citation

  ## Performance
  - Indexes on link_status for filtering broken links
  - Indexes on requires_action for alert queries
  - Partial index on unresolved issues

  ## Research Backing
  - "42% of AI citations reference broken URLs" - Adobe LLM Study
  - "Negative sentiment reduces brand trust by 67%" - SearchAtlas Research
  - "Link verification catches hallucinations before users do" - Backlinko Analysis
*/

-- ============================================================================
-- ADD LINK VERIFICATION FIELDS TO CITATIONS TABLE
-- ============================================================================

-- Add cited URL tracking
ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS cited_url TEXT;

COMMENT ON COLUMN citations.cited_url IS 'The actual URL that was cited in the AI response';

-- Add link verification status
ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS link_status TEXT CHECK (link_status IN ('live', 'broken_404', 'broken_timeout', 'broken_other', 'hallucinated', 'pending'));

ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS link_checked_at TIMESTAMPTZ;

COMMENT ON COLUMN citations.link_status IS 'Link verification status: live (200), broken_404, broken_timeout, broken_other, hallucinated (wrong domain), pending';
COMMENT ON COLUMN citations.link_checked_at IS 'Timestamp of last link verification check';

-- Add redirect tracking
ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS redirect_detected BOOLEAN DEFAULT FALSE;

ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS redirect_url TEXT;

COMMENT ON COLUMN citations.redirect_detected IS 'Whether the cited URL redirects to another location';
COMMENT ON COLUMN citations.redirect_url IS 'Final destination URL after following redirects';

-- ============================================================================
-- ADD ALERT & ACTION TRACKING FIELDS
-- ============================================================================

-- Add alert flagging
ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS requires_action BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN citations.requires_action IS 'Auto-flagged TRUE if sentiment is negative OR link is broken';

-- Add action tracking
ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS action_taken BOOLEAN DEFAULT FALSE;

ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS action_taken_at TIMESTAMPTZ;

COMMENT ON COLUMN citations.action_taken IS 'Whether user has addressed the flagged issue';
COMMENT ON COLUMN citations.action_taken_at IS 'Timestamp when user marked issue as resolved';

-- Add larger context window
ALTER TABLE citations
  ADD COLUMN IF NOT EXISTS surrounding_text TEXT;

COMMENT ON COLUMN citations.surrounding_text IS 'Larger context window around the citation (vs snippet_text which is exact quote)';

-- ============================================================================
-- CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Index for filtering by link status
CREATE INDEX IF NOT EXISTS idx_citations_link_status
  ON citations(link_status);

-- Index for alert queries (only index TRUE values for efficiency)
CREATE INDEX IF NOT EXISTS idx_citations_requires_action
  ON citations(requires_action)
  WHERE requires_action = TRUE;

-- Index for unresolved issues (requires action but not taken)
CREATE INDEX IF NOT EXISTS idx_citations_unresolved
  ON citations(requires_action, action_taken)
  WHERE requires_action = TRUE AND action_taken = FALSE;

-- Index for link verification age (find stale checks)
CREATE INDEX IF NOT EXISTS idx_citations_link_age
  ON citations(link_checked_at DESC NULLS LAST);

-- Composite index for reputation dashboard queries
CREATE INDEX IF NOT EXISTS idx_citations_reputation_dashboard
  ON citations(keyword_id, requires_action, sentiment, link_status, created_at DESC);

-- ============================================================================
-- UPDATE EXISTING DATA (SET DEFAULTS)
-- ============================================================================

-- Set default link_status for existing citations without URLs
UPDATE citations
SET link_status = 'pending'
WHERE link_status IS NULL
  AND cited_url IS NULL;

-- Auto-flag existing negative citations as requiring action
UPDATE citations
SET requires_action = TRUE
WHERE sentiment = 'negative'
  AND requires_action = FALSE;

-- ============================================================================
-- ADD HELPER FUNCTION FOR AUTO-FLAGGING
-- ============================================================================

-- Function to automatically set requires_action based on sentiment and link status
CREATE OR REPLACE FUNCTION auto_flag_citation_issues()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-flag if sentiment is negative
  IF NEW.sentiment = 'negative' THEN
    NEW.requires_action := TRUE;
  END IF;

  -- Auto-flag if link is broken or hallucinated
  IF NEW.link_status IN ('broken_404', 'broken_timeout', 'broken_other', 'hallucinated') THEN
    NEW.requires_action := TRUE;
  END IF;

  -- Clear flag if link is fixed and sentiment is not negative
  IF NEW.link_status = 'live' AND NEW.sentiment != 'negative' THEN
    NEW.requires_action := FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-flag issues on insert/update
DROP TRIGGER IF EXISTS trigger_auto_flag_citation_issues ON citations;

CREATE TRIGGER trigger_auto_flag_citation_issues
  BEFORE INSERT OR UPDATE ON citations
  FOR EACH ROW
  EXECUTE FUNCTION auto_flag_citation_issues();

COMMENT ON FUNCTION auto_flag_citation_issues() IS 'Automatically sets requires_action flag based on sentiment and link_status';

-- ============================================================================
-- ADD STATISTICS VIEW FOR REPUTATION DASHBOARD
-- ============================================================================

-- Create materialized view for reputation stats (fast queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS citation_reputation_stats AS
SELECT
  tk.website_id,
  COUNT(*) as total_citations,
  COUNT(*) FILTER (WHERE c.sentiment = 'positive') as positive_count,
  COUNT(*) FILTER (WHERE c.sentiment = 'neutral') as neutral_count,
  COUNT(*) FILTER (WHERE c.sentiment = 'negative') as negative_count,
  COUNT(*) FILTER (WHERE c.link_status LIKE 'broken%') as broken_links_count,
  COUNT(*) FILTER (WHERE c.link_status = 'hallucinated') as hallucinated_count,
  COUNT(*) FILTER (WHERE c.requires_action = TRUE AND c.action_taken = FALSE) as critical_issues_count,
  ROUND(AVG(CASE
    WHEN c.sentiment = 'positive' THEN 100
    WHEN c.sentiment = 'neutral' THEN 50
    WHEN c.sentiment = 'negative' THEN 0
  END), 2) as avg_sentiment_score
FROM citations c
JOIN tracked_keywords tk ON tk.id = c.keyword_id
GROUP BY tk.website_id;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_citation_reputation_stats_website
  ON citation_reputation_stats(website_id);

COMMENT ON MATERIALIZED VIEW citation_reputation_stats IS 'Pre-aggregated reputation statistics for fast dashboard loading';

-- Function to refresh stats (call after bulk updates)
CREATE OR REPLACE FUNCTION refresh_citation_reputation_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY citation_reputation_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_citation_reputation_stats() IS 'Refreshes the citation reputation stats materialized view';
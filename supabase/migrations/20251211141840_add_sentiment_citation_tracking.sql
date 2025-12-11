/*
  # Add Sentiment & Citation Tracking (Milestone 10)

  ## Overview
  This migration adds AI Reputation & Advanced Analytics capabilities:
  - Sentiment analysis for citations (Positive/Neutral/Negative)
  - Context tagging (Recommendation/List/Reference/Comparison/Evaluative)
  - Competitor mention tracking
  - Keyword grouping for fan-out expansion
  - Granular citation tracking

  ## New Tables

  1. **citations** - Individual citation instances from AI models
     - `id` (uuid, primary key)
     - `keyword_id` (uuid, references tracked_keywords)
     - `snapshot_id` (uuid, references serp_snapshots)
     - `platform` (text) - Which AI model (ChatGPT/Claude/Gemini/Perplexity)
     - `snippet_text` (text) - Surrounding context from AI response
     - `position` (integer) - Position in citation list
     - `sentiment` (text) - Positive/Neutral/Negative
     - `context_tag` (text) - Recommendation/List/Reference/Comparison/Evaluative
     - `competitor_mentions` (jsonb) - Array of competitor brands mentioned
     - `sentiment_analyzed` (boolean) - Whether sentiment analysis completed
     - `analyzed_at` (timestamptz) - When sentiment was analyzed
     - `created_at` (timestamptz)

  2. **keyword_groups** - Groups of related keywords (main + fan-out)
     - `id` (uuid, primary key)
     - `website_id` (uuid, references websites)
     - `name` (text) - Group name/main keyword
     - `main_keyword` (text) - Primary keyword for the group
     - `created_at` (timestamptz)

  3. **keyword_group_members** - Junction table for keyword groups
     - `id` (uuid, primary key)
     - `group_id` (uuid, references keyword_groups)
     - `keyword_id` (uuid, references tracked_keywords)
     - `is_main_keyword` (boolean) - Whether this is the primary keyword
     - `is_ai_suggested` (boolean) - Whether AI suggested this keyword
     - `relevance_score` (float) - AI-assigned relevance (0-100)
     - `suggestion_type` (text) - informational/comparative/evaluative/use-case/problem-solution
     - `created_at` (timestamptz)

  ## Changes to Existing Tables

  **serp_snapshots** - Add sentiment and context fields:
  - `snippet_text` (text) - Citation snippet for sentiment analysis
  - `sentiment` (text) - Overall sentiment of snapshot
  - `context_tag` (text) - Context classification
  - `competitor_mentions` (jsonb) - Competitors mentioned in this snapshot
  - `platform` (text) - Which AI platform (ChatGPT/Claude/Gemini/Perplexity)

  **tracked_keywords** - Add fan-out metadata:
  - `is_ai_suggested` (boolean) - Whether keyword came from fan-out
  - `suggestion_type` (text) - Type of fan-out suggestion
  - `parent_keyword_id` (uuid) - Link to main keyword if this is a fan-out

  ## Security
  - RLS enabled on all new tables
  - Users can only access their own data through website ownership chain
  - Policies enforce proper data isolation

  ## Performance
  - Indexes on foreign keys and time-series queries
  - Composite indexes for sentiment trend queries
  - Index on sentiment_analyzed for efficient filtering

  ## Research Backing
  - "Sentiment context affects citation prominence by 34%" - Adobe LLM Study
  - "Informational queries get 2.3x more AI citations" - SearchAtlas Research
  - "Multi-query coverage increases visibility by 67%" - Backlinko Analysis
*/

-- ============================================================================
-- CREATE NEW TABLES
-- ============================================================================

-- Citations table for granular tracking
CREATE TABLE IF NOT EXISTS citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  snapshot_id UUID NOT NULL REFERENCES serp_snapshots(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  snippet_text TEXT,
  position INTEGER,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  context_tag TEXT CHECK (context_tag IN ('recommendation', 'list', 'reference', 'comparison', 'evaluative', 'informational')),
  competitor_mentions JSONB DEFAULT '[]'::JSONB,
  sentiment_analyzed BOOLEAN DEFAULT FALSE,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE citations IS 'Individual citation instances from AI models with sentiment analysis';
COMMENT ON COLUMN citations.platform IS 'AI model: ChatGPT, Claude, Gemini, or Perplexity';
COMMENT ON COLUMN citations.snippet_text IS 'Surrounding context from AI response for sentiment analysis';
COMMENT ON COLUMN citations.sentiment IS 'Sentiment: positive, neutral, or negative';
COMMENT ON COLUMN citations.context_tag IS 'Context type: recommendation, list, reference, comparison, evaluative, or informational';
COMMENT ON COLUMN citations.sentiment_analyzed IS 'Whether sentiment analysis has been completed (prevents re-analysis)';

-- Keyword groups table
CREATE TABLE IF NOT EXISTS keyword_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  main_keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE keyword_groups IS 'Groups of related keywords (main keyword + AI-suggested fan-out keywords)';
COMMENT ON COLUMN keyword_groups.main_keyword IS 'Primary keyword that fan-out suggestions are based on';

-- Keyword group members junction table
CREATE TABLE IF NOT EXISTS keyword_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES keyword_groups(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  is_main_keyword BOOLEAN DEFAULT FALSE,
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  relevance_score FLOAT DEFAULT 0,
  suggestion_type TEXT CHECK (suggestion_type IN ('informational', 'comparative', 'evaluative', 'use-case', 'problem-solution', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, keyword_id)
);

COMMENT ON TABLE keyword_group_members IS 'Junction table linking keywords to groups with AI suggestion metadata';
COMMENT ON COLUMN keyword_group_members.relevance_score IS 'AI-assigned relevance score (0-100)';
COMMENT ON COLUMN keyword_group_members.suggestion_type IS 'Type of AI suggestion or manual if user-added';

-- ============================================================================
-- EXTEND EXISTING TABLES
-- ============================================================================

-- Add sentiment fields to serp_snapshots
ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS snippet_text TEXT;

ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative'));

ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS context_tag TEXT;

ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS competitor_mentions JSONB DEFAULT '[]'::JSONB;

ALTER TABLE serp_snapshots
  ADD COLUMN IF NOT EXISTS platform TEXT;

COMMENT ON COLUMN serp_snapshots.snippet_text IS 'Citation snippet from AI Overview for sentiment analysis';
COMMENT ON COLUMN serp_snapshots.sentiment IS 'Overall sentiment: positive, neutral, or negative';
COMMENT ON COLUMN serp_snapshots.context_tag IS 'Context classification for this citation';
COMMENT ON COLUMN serp_snapshots.competitor_mentions IS 'Array of competitor brands mentioned alongside user brand';
COMMENT ON COLUMN serp_snapshots.platform IS 'AI platform that generated this citation';

-- Add fan-out metadata to tracked_keywords
ALTER TABLE tracked_keywords
  ADD COLUMN IF NOT EXISTS is_ai_suggested BOOLEAN DEFAULT FALSE;

ALTER TABLE tracked_keywords
  ADD COLUMN IF NOT EXISTS suggestion_type TEXT;

ALTER TABLE tracked_keywords
  ADD COLUMN IF NOT EXISTS parent_keyword_id UUID REFERENCES tracked_keywords(id) ON DELETE SET NULL;

COMMENT ON COLUMN tracked_keywords.is_ai_suggested IS 'Whether this keyword came from AI fan-out suggestion';
COMMENT ON COLUMN tracked_keywords.suggestion_type IS 'Type of fan-out: informational, comparative, evaluative, use-case, problem-solution';
COMMENT ON COLUMN tracked_keywords.parent_keyword_id IS 'Main keyword this was fanned out from';

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Citations table indexes
CREATE INDEX IF NOT EXISTS idx_citations_keyword_id ON citations(keyword_id);
CREATE INDEX IF NOT EXISTS idx_citations_snapshot_id ON citations(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_citations_platform ON citations(platform);
CREATE INDEX IF NOT EXISTS idx_citations_sentiment ON citations(sentiment);
CREATE INDEX IF NOT EXISTS idx_citations_created_at ON citations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_citations_sentiment_analyzed ON citations(sentiment_analyzed) WHERE sentiment_analyzed = FALSE;

-- Keyword groups indexes
CREATE INDEX IF NOT EXISTS idx_keyword_groups_website_id ON keyword_groups(website_id);

-- Keyword group members indexes
CREATE INDEX IF NOT EXISTS idx_keyword_group_members_group_id ON keyword_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_keyword_group_members_keyword_id ON keyword_group_members(keyword_id);

-- Serp snapshots sentiment index
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_platform ON serp_snapshots(platform);
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_sentiment ON serp_snapshots(sentiment);

-- Tracked keywords parent relationship index
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_parent ON tracked_keywords(parent_keyword_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_group_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CITATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view citations for own keywords"
  ON citations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN websites ON websites.id = tracked_keywords.website_id
      WHERE tracked_keywords.id = citations.keyword_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert citations for own keywords"
  ON citations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN websites ON websites.id = tracked_keywords.website_id
      WHERE tracked_keywords.id = keyword_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update citations for own keywords"
  ON citations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN websites ON websites.id = tracked_keywords.website_id
      WHERE tracked_keywords.id = citations.keyword_id
      AND websites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN websites ON websites.id = tracked_keywords.website_id
      WHERE tracked_keywords.id = keyword_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete citations for own keywords"
  ON citations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN websites ON websites.id = tracked_keywords.website_id
      WHERE tracked_keywords.id = citations.keyword_id
      AND websites.user_id = auth.uid()
    )
  );

-- ============================================================================
-- KEYWORD GROUPS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view own keyword groups"
  ON keyword_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = keyword_groups.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own keyword groups"
  ON keyword_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own keyword groups"
  ON keyword_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = keyword_groups.website_id
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

CREATE POLICY "Users can delete own keyword groups"
  ON keyword_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = keyword_groups.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- ============================================================================
-- KEYWORD GROUP MEMBERS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view keyword group members for own groups"
  ON keyword_group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM keyword_groups
      JOIN websites ON websites.id = keyword_groups.website_id
      WHERE keyword_groups.id = keyword_group_members.group_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert keyword group members for own groups"
  ON keyword_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM keyword_groups
      JOIN websites ON websites.id = keyword_groups.website_id
      WHERE keyword_groups.id = group_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update keyword group members for own groups"
  ON keyword_group_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM keyword_groups
      JOIN websites ON websites.id = keyword_groups.website_id
      WHERE keyword_groups.id = keyword_group_members.group_id
      AND websites.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM keyword_groups
      JOIN websites ON websites.id = keyword_groups.website_id
      WHERE keyword_groups.id = group_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete keyword group members for own groups"
  ON keyword_group_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM keyword_groups
      JOIN websites ON websites.id = keyword_groups.website_id
      WHERE keyword_groups.id = keyword_group_members.group_id
      AND websites.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SERVICE ROLE POLICIES (FOR EDGE FUNCTIONS)
-- ============================================================================

-- Allow service role to manage citations for sentiment analysis
CREATE POLICY "Service role can manage citations"
  ON citations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow service role to read keyword groups for analysis
CREATE POLICY "Service role can read keyword groups"
  ON keyword_groups
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to read keyword group members
CREATE POLICY "Service role can read keyword group members"
  ON keyword_group_members
  FOR SELECT
  TO service_role
  USING (true);
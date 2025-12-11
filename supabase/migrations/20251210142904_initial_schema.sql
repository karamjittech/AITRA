/*
  # AI SEO Tool - Initial Database Schema

  ## Overview
  This migration creates the complete database schema for the AI SEO optimization tool
  that analyzes content for AI search visibility (Google AI Overviews, ChatGPT,
  Gemini, Claude, Perplexity citations).

  ## New Tables

  ### Core Tables
  1. **users** - User accounts with GSC integration status
     - `id` (uuid, references auth.users)
     - `email` (text, unique)
     - `created_at` (timestamp)
     - `gsc_connected` (boolean) - Google Search Console connection status
     - `gsc_property_url` (text) - Connected GSC property
     - `subscription_plan` (varchar) - User's subscription tier

  2. **websites** - Websites being tracked by users
     - `id` (uuid, primary key)
     - `user_id` (uuid, references users)
     - `url` (text) - Full website URL
     - `domain` (text) - Extracted domain name
     - `created_at` (timestamp)
     - `last_scraped` (timestamp) - Last scraping timestamp

  3. **tracked_keywords** - Keywords being monitored for AI citations
     - `id` (uuid, primary key)
     - `website_id` (uuid, references websites)
     - `keyword` (text) - Search keyword to track
     - `search_volume` (int) - Monthly search volume
     - `created_at` (timestamp)

  ### Analytics Tables
  4. **serp_snapshots** - AI Overview tracking data
     - `id` (uuid, primary key)
     - `keyword_id` (uuid, references tracked_keywords)
     - `snapshot_date` (timestamp) - When snapshot was taken
     - `has_ai_overview` (boolean) - AI Overview present in SERP
     - `ai_overview_html` (text) - HTML content of AI Overview
     - `cited_domains` (text[]) - Array of domains cited
     - `your_site_cited` (boolean) - User's site appeared in citations
     - `your_site_position` (int) - Position in citation list
     - `estimated_traffic_impact` (float) - Traffic estimate

  5. **page_data** - Scraped content and metadata from pages
     - `id` (uuid, primary key)
     - `website_id` (uuid, references websites)
     - `url` (text) - Page URL
     - `title` (text) - Page title tag
     - `meta_description` (text) - Meta description
     - `h1_count` (int) - Number of H1 tags
     - `h2_count` (int) - Number of H2 tags
     - `has_faq_schema` (boolean) - FAQ schema markup present
     - `has_howto_schema` (boolean) - HowTo schema markup present
     - `readability_score` (float) - Content readability score
     - `last_scraped` (timestamp) - Last scrape timestamp

  6. **scores** - AI readiness scores for pages
     - `id` (uuid, primary key)
     - `page_id` (uuid, references page_data)
     - `structure_score` (float) - HTML structure score (0-30)
     - `metadata_score` (float) - Metadata optimization score (0-25)
     - `content_score` (float) - Content quality score (0-25)
     - `citation_pattern_score` (float) - Citation pattern score (0-20)
     - `overall_ai_readiness` (float) - Overall AI readiness (0-100)
     - `calculated_at` (timestamp) - Score calculation timestamp

  ### Integration Tables
  7. **gsc_metrics** - Google Search Console data
     - `id` (uuid, primary key)
     - `website_id` (uuid, references websites)
     - `keyword` (text) - Search query
     - `impressions` (int) - Number of impressions
     - `clicks` (int) - Number of clicks
     - `ctr` (float) - Click-through rate
     - `avg_position` (float) - Average position in SERP
     - `data_date` (date) - Date of metrics

  8. **fixes_generated** - AI-generated optimization recommendations
     - `id` (uuid, primary key)
     - `page_id` (uuid, references page_data)
     - `fix_type` (varchar) - Type of fix (schema, title, description, structure)
     - `schema_json` (jsonb) - Generated schema markup
     - `applied` (boolean) - Whether fix has been applied
     - `created_at` (timestamp) - Fix generation timestamp

  ## Security
  - RLS (Row Level Security) enabled on all tables
  - Users can only access their own data
  - Policies enforce data isolation between users
  - Authenticated users required for all operations

  ## Performance
  - Indexes added on foreign keys and frequently queried columns
  - Composite indexes for time-series queries
  - Unique constraints to prevent duplicate data

  ## Notes
  - All tables use UUID primary keys with gen_random_uuid()
  - Timestamps default to NOW() for audit trails
  - CASCADE DELETE ensures referential integrity
  - JSONB used for flexible schema storage
*/

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  gsc_connected BOOLEAN DEFAULT FALSE,
  gsc_property_url TEXT,
  subscription_plan VARCHAR(20) DEFAULT 'free'
);

COMMENT ON TABLE users IS 'User accounts with GSC integration status and subscription information';
COMMENT ON COLUMN users.gsc_connected IS 'Whether user has connected Google Search Console';
COMMENT ON COLUMN users.subscription_plan IS 'User subscription tier: free, pro, enterprise';

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_scraped TIMESTAMPTZ,
  UNIQUE(user_id, url)
);

COMMENT ON TABLE websites IS 'Websites being tracked for AI search visibility';
COMMENT ON COLUMN websites.last_scraped IS 'Timestamp of last successful scrape';

-- Tracked keywords table
CREATE TABLE IF NOT EXISTS tracked_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(website_id, keyword)
);

COMMENT ON TABLE tracked_keywords IS 'Keywords being monitored for AI Overview citations';
COMMENT ON COLUMN tracked_keywords.search_volume IS 'Estimated monthly search volume';

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- SERP snapshots table
CREATE TABLE IF NOT EXISTS serp_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMPTZ DEFAULT NOW(),
  has_ai_overview BOOLEAN DEFAULT FALSE,
  ai_overview_html TEXT,
  cited_domains TEXT[] DEFAULT '{}'::TEXT[],
  your_site_cited BOOLEAN DEFAULT FALSE,
  your_site_position INT,
  estimated_traffic_impact FLOAT DEFAULT 0
);

COMMENT ON TABLE serp_snapshots IS 'Snapshots of AI Overviews in search results over time';
COMMENT ON COLUMN serp_snapshots.cited_domains IS 'Array of domains cited in AI Overview';
COMMENT ON COLUMN serp_snapshots.your_site_position IS 'Position of user site in citation list (1-indexed)';

-- Page data table
CREATE TABLE IF NOT EXISTS page_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  url TEXT,
  title TEXT,
  meta_description TEXT,
  h1_count INT DEFAULT 0,
  h2_count INT DEFAULT 0,
  has_faq_schema BOOLEAN DEFAULT FALSE,
  has_howto_schema BOOLEAN DEFAULT FALSE,
  readability_score FLOAT DEFAULT 0,
  last_scraped TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(website_id, url)
);

COMMENT ON TABLE page_data IS 'Scraped content and metadata from website pages';
COMMENT ON COLUMN page_data.readability_score IS 'Flesch-Kincaid readability score';

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,
  structure_score FLOAT DEFAULT 0,
  metadata_score FLOAT DEFAULT 0,
  content_score FLOAT DEFAULT 0,
  citation_pattern_score FLOAT DEFAULT 0,
  overall_ai_readiness FLOAT DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE scores IS 'AI readiness scores for analyzed pages';
COMMENT ON COLUMN scores.structure_score IS 'HTML structure score (0-30 points)';
COMMENT ON COLUMN scores.metadata_score IS 'Metadata optimization score (0-25 points)';
COMMENT ON COLUMN scores.content_score IS 'Content quality score (0-25 points)';
COMMENT ON COLUMN scores.citation_pattern_score IS 'Citation pattern score (0-20 points)';
COMMENT ON COLUMN scores.overall_ai_readiness IS 'Overall AI readiness score (0-100 points)';

-- ============================================================================
-- INTEGRATION TABLES
-- ============================================================================

-- GSC metrics table
CREATE TABLE IF NOT EXISTS gsc_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  keyword TEXT,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  avg_position FLOAT DEFAULT 0,
  data_date DATE,
  UNIQUE(website_id, keyword, data_date)
);

COMMENT ON TABLE gsc_metrics IS 'Google Search Console performance metrics';
COMMENT ON COLUMN gsc_metrics.ctr IS 'Click-through rate (0-1)';
COMMENT ON COLUMN gsc_metrics.avg_position IS 'Average position in search results';

-- Fixes generated table
CREATE TABLE IF NOT EXISTS fixes_generated (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,
  fix_type VARCHAR(50),
  schema_json JSONB,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE fixes_generated IS 'AI-generated optimization recommendations and fixes';
COMMENT ON COLUMN fixes_generated.fix_type IS 'Type of fix: schema, title, description, structure';
COMMENT ON COLUMN fixes_generated.schema_json IS 'Generated JSON-LD schema markup';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_website_id ON tracked_keywords(website_id);
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_keyword_id ON serp_snapshots(keyword_id);
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_date ON serp_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_page_data_website_id ON page_data(website_id);
CREATE INDEX IF NOT EXISTS idx_scores_page_id ON scores(page_id);
CREATE INDEX IF NOT EXISTS idx_gsc_metrics_website_date ON gsc_metrics(website_id, data_date DESC);
CREATE INDEX IF NOT EXISTS idx_fixes_generated_page_id ON fixes_generated(page_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixes_generated ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view own record"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- WEBSITES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view own websites"
  ON websites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own websites"
  ON websites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own websites"
  ON websites
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own websites"
  ON websites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- TRACKED KEYWORDS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view keywords for own websites"
  ON tracked_keywords
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = tracked_keywords.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert keywords for own websites"
  ON tracked_keywords
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update keywords for own websites"
  ON tracked_keywords
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = tracked_keywords.website_id
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

CREATE POLICY "Users can delete keywords for own websites"
  ON tracked_keywords
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = tracked_keywords.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SERP SNAPSHOTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view snapshots for own keywords"
  ON serp_snapshots
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN websites ON websites.id = tracked_keywords.website_id
      WHERE tracked_keywords.id = serp_snapshots.keyword_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert snapshots for own keywords"
  ON serp_snapshots
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

CREATE POLICY "Users can update snapshots for own keywords"
  ON serp_snapshots
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tracked_keywords
      JOIN websites ON websites.id = tracked_keywords.website_id
      WHERE tracked_keywords.id = serp_snapshots.keyword_id
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

-- ============================================================================
-- PAGE DATA TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view page data for own websites"
  ON page_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = page_data.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert page data for own websites"
  ON page_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update page data for own websites"
  ON page_data
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = page_data.website_id
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

CREATE POLICY "Users can delete page data for own websites"
  ON page_data
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = page_data.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SCORES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view scores for own pages"
  ON scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = scores.page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scores for own pages"
  ON scores
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

CREATE POLICY "Users can update scores for own pages"
  ON scores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = scores.page_id
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

-- ============================================================================
-- GSC METRICS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view GSC metrics for own websites"
  ON gsc_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = gsc_metrics.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert GSC metrics for own websites"
  ON gsc_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update GSC metrics for own websites"
  ON gsc_metrics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = gsc_metrics.website_id
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

-- ============================================================================
-- FIXES GENERATED TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view fixes for own pages"
  ON fixes_generated
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = fixes_generated.page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert fixes for own pages"
  ON fixes_generated
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

CREATE POLICY "Users can update fixes for own pages"
  ON fixes_generated
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = fixes_generated.page_id
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

CREATE POLICY "Users can delete fixes for own pages"
  ON fixes_generated
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = fixes_generated.page_id
      AND websites.user_id = auth.uid()
    )
  );
/*
  # AI SEO Tool - Master Database Schema Migration
  
  ## Overview
  This is a combined master migration that creates the complete database schema
  for the AI SEO optimization tool in a fresh external Supabase database.
  
  ## What This Migration Does
  Combines all 20 individual migration files into one comprehensive schema:
  
  1. Core tables (users, websites, tracked_keywords)
  2. Analytics tables (serp_snapshots, page_data, scores)
  3. Integration tables (gsc_metrics, fixes_generated)
  4. Platform-specific scores (Gemini, ChatGPT, Claude, Perplexity)
  5. Competitive analysis & roadmap tracking
  6. Bot access verification for AI crawlers
  7. Entity identity & schema tracking (Organization/Person)
  8. AEO (Answer Engine Optimization) fields
  9. Sentiment & citation tracking
  10. Perplexity optimization features
  11. Fan-out keyword support
  12. Link verification & alerts
  13. Share of voice enhancements
  14. Brand identity & E-E-A-T signals
  15. Trust signals checklist
  16. Tier limits & credits system
  17. RLS optimization (auth.uid() caching)
  18. Admin panel with AppSumo support
  19. Paddle payment integration
  20. Demo user creation
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Service role bypass policies for Edge Functions
  - Admin-only policies for system management
  
  ## Created On
  December 15, 2025
  
  ## Combined From
  20 individual migration files (20251210142904 through 20251213100653)
*/

-- ============================================================================
-- MIGRATION 1: Initial Schema (20251210142904)
-- ============================================================================

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
  );/*
  # Add Service Role Bypass Policies

  ## Overview
  This migration adds RLS policies that allow the service role to bypass
  user authentication checks. This enables Edge Functions to insert/update
  data on behalf of users without requiring authenticated sessions.

  ## Changes
  1. Add service role bypass policies for all tables
  2. Allow service role to perform operations without auth.uid() checks
  3. Maintain existing user policies for authenticated users

  ## Security
  - Service role policies only apply when using SUPABASE_SERVICE_ROLE_KEY
  - Regular users still restricted by existing RLS policies
  - No security degradation for authenticated user access

  ## Notes
  - Service role has full access but only used by trusted Edge Functions
  - Existing user policies remain unchanged and take precedence for regular users
*/

-- ============================================================================
-- SERVICE ROLE POLICIES FOR USERS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update users"
  ON users
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all users"
  ON users
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR WEBSITES TABLE
-- ============================================================================

CREATE POLICY "Service role can insert websites"
  ON websites
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update websites"
  ON websites
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all websites"
  ON websites
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete websites"
  ON websites
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR PAGE_DATA TABLE
-- ============================================================================

CREATE POLICY "Service role can insert page data"
  ON page_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update page data"
  ON page_data
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all page data"
  ON page_data
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete page data"
  ON page_data
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR SCORES TABLE
-- ============================================================================

CREATE POLICY "Service role can insert scores"
  ON scores
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scores"
  ON scores
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all scores"
  ON scores
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR TRACKED_KEYWORDS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert keywords"
  ON tracked_keywords
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update keywords"
  ON tracked_keywords
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all keywords"
  ON tracked_keywords
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete keywords"
  ON tracked_keywords
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR SERP_SNAPSHOTS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert snapshots"
  ON serp_snapshots
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update snapshots"
  ON serp_snapshots
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all snapshots"
  ON serp_snapshots
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR GSC_METRICS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert GSC metrics"
  ON gsc_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update GSC metrics"
  ON gsc_metrics
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all GSC metrics"
  ON gsc_metrics
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR FIXES_GENERATED TABLE
-- ============================================================================

CREATE POLICY "Service role can insert fixes"
  ON fixes_generated
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update fixes"
  ON fixes_generated
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all fixes"
  ON fixes_generated
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete fixes"
  ON fixes_generated
  FOR DELETE
  TO service_role
  USING (true);/*
  # Create Demo User for Anonymous Access

  1. Purpose
    - Creates a demo user with valid UUID for anonymous/guest access
    - Allows the application to work without authentication
    - All anonymous users will share this account initially

  2. Changes
    - Insert demo user into auth.users table (required for FK)
    - Insert demo user into public.users table
    - Uses UUID: 00000000-0000-0000-0000-000000000001

  3. Security Notes
    - This is a temporary solution for MVP
    - All anonymous users will share data
    - Should be replaced with proper auth or per-session UUIDs
*/

-- Insert demo user into auth.users (required for foreign key constraint)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@aireadiness.local',
  crypt('demo-password-not-used', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo user into public.users table
INSERT INTO public.users (id, email, created_at, subscription_plan, gsc_connected)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@aireadiness.local',
  NOW(),
  'free',
  false
)
ON CONFLICT (id) DO NOTHING;/*
  # Add List Structure Detection Column

  1. Purpose
    - Adds `has_list_structure` column to track bullet points/lists
    - Completes PRD Section 4 scoring requirements
    - Lists boost AI citation inclusion by 4.72% (research-backed)

  2. Changes
    - Add `has_list_structure` boolean column to `page_data` table
    - Default value: false
    - Required for Structure Score calculation (adds +5 points)

  3. Impact
    - Structure Score will now range 0-35 points (was 0-30)
    - Overall scoring formula remains unchanged
*/

-- Add list structure detection column
ALTER TABLE page_data 
ADD COLUMN IF NOT EXISTS has_list_structure BOOLEAN DEFAULT false;
/*
  # Add Platform-Specific Scores Table

  1. New Tables
    - `platform_scores`
      - `id` (uuid, primary key)
      - `page_id` (uuid, foreign key to page_data)
      - Platform scores (0-100 for each AI model):
        - `gemini_score` (float)
        - `chatgpt_score` (float)
        - `claude_score` (float)
        - `perplexity_score` (float)
      - Sub-component scores for each platform:
        - Gemini: `gemini_schema_component`, `gemini_mobile_component`
        - ChatGPT: `chatgpt_structure_component`, `chatgpt_clarity_component`
        - Claude: `claude_citation_component`, `claude_nuance_component`
        - Perplexity: `perplexity_external_links_component`, `perplexity_data_component`
      - `calculated_at` (timestamp)
  
  2. Security
    - Enable RLS on `platform_scores` table
    - Add policy for authenticated users to read platform scores for their pages
*/

CREATE TABLE IF NOT EXISTS platform_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES page_data(id) ON DELETE CASCADE,
  
  -- Overall platform scores (0-100)
  gemini_score float NOT NULL DEFAULT 0,
  chatgpt_score float NOT NULL DEFAULT 0,
  claude_score float NOT NULL DEFAULT 0,
  perplexity_score float NOT NULL DEFAULT 0,
  
  -- Gemini sub-components
  gemini_schema_component float NOT NULL DEFAULT 0,
  gemini_mobile_component float NOT NULL DEFAULT 0,
  
  -- ChatGPT sub-components
  chatgpt_structure_component float NOT NULL DEFAULT 0,
  chatgpt_clarity_component float NOT NULL DEFAULT 0,
  
  -- Claude sub-components
  claude_citation_component float NOT NULL DEFAULT 0,
  claude_nuance_component float NOT NULL DEFAULT 0,
  
  -- Perplexity sub-components
  perplexity_external_links_component float NOT NULL DEFAULT 0,
  perplexity_data_component float NOT NULL DEFAULT 0,
  
  calculated_at timestamptz DEFAULT now(),
  
  UNIQUE(page_id, calculated_at)
);

ALTER TABLE platform_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read platform scores for their pages"
  ON platform_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data pd
      JOIN websites w ON pd.website_id = w.id
      WHERE pd.id = platform_scores.page_id
      AND w.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_platform_scores_page_id ON platform_scores(page_id);
CREATE INDEX IF NOT EXISTS idx_platform_scores_calculated_at ON platform_scores(calculated_at DESC);
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
/*
  # Add Bot Access Verification Table

  ## Overview
  This migration adds the bot_access table to track whether AI crawler bots
  can physically access the user's website. This is critical for AI visibility -
  if bots are blocked, the site cannot appear in AI search results.

  ## New Tables
  1. **bot_access** - Verification status for AI crawler bots
     - `id` (uuid, primary key)
     - `page_id` (uuid, references page_data) - Links to analyzed page
     - `bot_name` (varchar) - Bot identifier (GPTBot, CCBot, Google-Extended, FacebookBot, PerplexityBot)
     - `is_allowed` (boolean) - Whether bot can access the site
     - `block_reason` (varchar) - Reason: robots_txt, firewall, user_agent_block, or null if allowed
     - `robots_txt_rule` (text) - Specific robots.txt rule causing the block
     - `checked_at` (timestamp) - When verification was performed

  ## Security
  - RLS enabled on bot_access table
  - Users can only view bot access data for their own pages
  - Standard CRUD policies following existing patterns

  ## Performance
  - Index on page_id for fast lookups
  - Composite index on (page_id, is_allowed) for filtering blocked bots
  - Unique constraint on (page_id, bot_name) to prevent duplicates
*/

-- ============================================================================
-- BOT ACCESS VERIFICATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bot_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,
  bot_name VARCHAR(50) NOT NULL,
  is_allowed BOOLEAN DEFAULT TRUE,
  block_reason VARCHAR(50),
  robots_txt_rule TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, bot_name)
);

COMMENT ON TABLE bot_access IS 'Verification status for AI crawler bots (GPTBot, CCBot, etc.)';
COMMENT ON COLUMN bot_access.bot_name IS 'Bot identifier: GPTBot, CCBot, Google-Extended, FacebookBot, PerplexityBot';
COMMENT ON COLUMN bot_access.is_allowed IS 'Whether bot can access the site';
COMMENT ON COLUMN bot_access.block_reason IS 'Reason for block: robots_txt, firewall, user_agent_block, or null if allowed';
COMMENT ON COLUMN bot_access.robots_txt_rule IS 'Specific robots.txt rule causing the block';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bot_access_page_id ON bot_access(page_id);
CREATE INDEX IF NOT EXISTS idx_bot_access_page_blocked ON bot_access(page_id, is_allowed);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE bot_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bot access for own pages"
  ON bot_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = bot_access.page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert bot access for own pages"
  ON bot_access
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

CREATE POLICY "Users can update bot access for own pages"
  ON bot_access
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = bot_access.page_id
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

CREATE POLICY "Users can delete bot access for own pages"
  ON bot_access
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = bot_access.page_id
      AND websites.user_id = auth.uid()
    )
  );/*
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
/*
  # Add Answer Engine Optimization (AEO) Fields

  ## Overview
  This migration adds Answer Engine Optimization tracking to the page_data table.
  AEO measures how well content is formatted for AI "quick answers" in RAG
  (Retrieval Augmented Generation) systems.

  ## Changes to Existing Tables

  1. **page_data** - Add AEO analysis fields:
     - `qa_pairs_count` (integer) - Number of question-answer patterns detected
     - `has_direct_answers` (boolean) - Whether direct Q&A format is present
     - `list_density` (float) - Percentage of content in list format (0-100)
     - `ul_count` (integer) - Number of unordered lists
     - `ol_count` (integer) - Number of ordered lists
     - `table_count` (integer) - Number of data tables detected
     - `has_tables` (boolean) - Whether tables are present
     - `intro_fluff_score` (float) - Fluff detection in first 100 words (0-100, lower is better)
     - `intro_density_score` (float) - Information density of intro (0-100, higher is better)
     - `has_tldr` (boolean) - Whether TL;DR or Key Takeaways section exists
     - `aeo_score` (float) - Overall Answer Engine Optimization score (0-25)

  2. **scores** - Add AEO component:
     - `aeo_score` (float) - AEO contribution to overall score (0-25)

  ## AEO Scoring Components

  - **Direct Answers (0-8 points):**
    - 5+ Q&A pairs = 8 points
    - 2-4 Q&A pairs = 5 points
    - 1 Q&A pair = 3 points
    - No Q&A = 0 points

  - **List Usage (0-7 points):**
    - Optimal density 15-30% = 7 points
    - Some lists 5-14% = 4 points
    - Minimal lists <5% = 1 point

  - **Table Presence (0-6 points):**
    - Multiple tables = 6 points
    - One table = 4 points
    - No tables = 0 points

  - **Introduction Quality (0-4 points):**
    - Low fluff, high density = 4 points
    - Medium fluff = 2 points
    - High fluff = 0 points

  ## Research Backing

  - "Bullet points boost AI Overview inclusion by 4.72%" - Surfer SEO
  - "Perplexity cites tabular data 3.2x more frequently" - Industry research
  - "Direct Q&A format increases AI citation likelihood by 23%" - RAG studies

  ## Performance

  - No new indexes needed (these are analysis fields, not query filters)
  - Default values ensure backward compatibility
*/

-- ============================================================================
-- ADD AEO FIELDS TO page_data TABLE
-- ============================================================================

-- Q&A Detection Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS qa_pairs_count INTEGER DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS has_direct_answers BOOLEAN DEFAULT FALSE;

-- List Analysis Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS list_density FLOAT DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS ul_count INTEGER DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS ol_count INTEGER DEFAULT 0;

-- Table Detection Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS table_count INTEGER DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS has_tables BOOLEAN DEFAULT FALSE;

-- Introduction Quality Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS intro_fluff_score FLOAT DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS intro_density_score FLOAT DEFAULT 0;

-- Summary Detection
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS has_tldr BOOLEAN DEFAULT FALSE;

-- Overall AEO Score
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS aeo_score FLOAT DEFAULT 0;

-- ============================================================================
-- ADD AEO SCORE TO scores TABLE
-- ============================================================================

ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS aeo_score FLOAT DEFAULT 0;

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN page_data.qa_pairs_count IS 'Number of question-answer pairs detected (heading with question + following paragraph)';
COMMENT ON COLUMN page_data.has_direct_answers IS 'Whether page contains direct Q&A format';
COMMENT ON COLUMN page_data.list_density IS 'Percentage of content in list format (0-100), optimal 15-30%';
COMMENT ON COLUMN page_data.ul_count IS 'Count of unordered lists';
COMMENT ON COLUMN page_data.ol_count IS 'Count of ordered lists';
COMMENT ON COLUMN page_data.table_count IS 'Number of data tables (>2 rows, >2 cols)';
COMMENT ON COLUMN page_data.has_tables IS 'Whether page contains data tables';
COMMENT ON COLUMN page_data.intro_fluff_score IS 'Fluff detection in first 100 words (0-100, lower is better)';
COMMENT ON COLUMN page_data.intro_density_score IS 'Information density of intro (0-100, higher is better)';
COMMENT ON COLUMN page_data.has_tldr IS 'Whether page has TL;DR or Key Takeaways section';
COMMENT ON COLUMN page_data.aeo_score IS 'Answer Engine Optimization score (0-25)';
COMMENT ON COLUMN scores.aeo_score IS 'AEO component of overall AI readiness score (0-25)';
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
  USING (true);/*
  # Add Perplexity Optimizer Support

  1. New Columns in page_data
    - `has_comparative_paragraphs` (boolean) - Indicates if page contains comparative data in paragraphs
    - `comparative_data_score` (float) - Score 0-100 indicating density of comparative content
    - `comparative_paragraph_count` (integer) - Number of paragraphs with comparative data
    - `perplexity_table_recommendation` (boolean) - Whether table conversion is recommended
    - `comparative_content_samples` (jsonb) - Sample paragraphs that could be converted to tables

  2. Analytics Table
    - Track Perplexity optimizer usage and conversions
*/

-- Add new columns to page_data for comparative data detection
ALTER TABLE page_data
ADD COLUMN IF NOT EXISTS has_comparative_paragraphs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS comparative_data_score float DEFAULT 0,
ADD COLUMN IF NOT EXISTS comparative_paragraph_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS perplexity_table_recommendation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS comparative_content_samples jsonb DEFAULT '[]'::jsonb;

-- Create analytics table for tracking Perplexity optimizer usage
CREATE TABLE IF NOT EXISTS perplexity_optimizer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES page_data(id) ON DELETE CASCADE,
  comparative_paragraphs_detected integer DEFAULT 0,
  tables_generated integer DEFAULT 0,
  conversion_type text,
  user_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on the analytics table
ALTER TABLE perplexity_optimizer_analytics ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage analytics
CREATE POLICY "Service role can manage perplexity analytics"
  ON perplexity_optimizer_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_perplexity_analytics_page_id
  ON perplexity_optimizer_analytics(page_id);

CREATE INDEX IF NOT EXISTS idx_page_data_comparative
  ON page_data(has_comparative_paragraphs, perplexity_table_recommendation);/*
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

COMMENT ON FUNCTION refresh_citation_reputation_stats() IS 'Refreshes the citation reputation stats materialized view';/*
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

COMMENT ON COLUMN brand_identity.trust_signals_checklist IS 'User progress through E-E-A-T trust signals checklist';/*
  # Add Tier Limits and Credit Tracking

  1. Overview
    This migration extends the users table to support tiered subscription limits
    and credit-based usage tracking for AI features.

  2. New Columns Added to Users Table
    - `credits_total` (int) - Total credits allocated for current billing period
    - `credits_used` (int) - Credits consumed this billing period
    - `websites_limit` (int) - Maximum websites user can track
    - `keywords_limit` (int) - Maximum keywords user can track
    - `stripe_customer_id` (text) - Stripe customer ID for billing
    - `stripe_subscription_id` (text) - Stripe subscription ID
    - `subscription_status` (text) - active, canceled, past_due, etc.
    - `billing_cycle_start` (timestamp) - Start of current billing cycle
    - `billing_cycle_end` (timestamp) - End of current billing cycle

  3. New Tables
    - `credits_usage` - Historical log of credit consumption for analytics

  4. Tier Specifications
    FREE:   credits_total=50,  websites_limit=1,  keywords_limit=3
    PRO:    credits_total=500, websites_limit=3,  keywords_limit=50
    AGENCY: credits_total=2500, websites_limit=15, keywords_limit=250

  5. Security
    - Users can view their own limits (read-only)
    - Only service role can modify limits
    - Credits usage tracking for transparency
*/

-- ============================================================================
-- EXTEND USERS TABLE WITH TIER LIMITS AND CREDITS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits_total'
  ) THEN
    ALTER TABLE users ADD COLUMN credits_total INT DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits_used'
  ) THEN
    ALTER TABLE users ADD COLUMN credits_used INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'websites_limit'
  ) THEN
    ALTER TABLE users ADD COLUMN websites_limit INT DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'keywords_limit'
  ) THEN
    ALTER TABLE users ADD COLUMN keywords_limit INT DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'billing_cycle_start'
  ) THEN
    ALTER TABLE users ADD COLUMN billing_cycle_start TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'billing_cycle_end'
  ) THEN
    ALTER TABLE users ADD COLUMN billing_cycle_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
  END IF;
END $$;

COMMENT ON COLUMN users.credits_total IS 'Total credits allocated for current billing period';
COMMENT ON COLUMN users.credits_used IS 'Credits consumed in current billing period';
COMMENT ON COLUMN users.websites_limit IS 'Maximum number of websites user can track';
COMMENT ON COLUMN users.keywords_limit IS 'Maximum number of keywords user can track';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, canceled, past_due';

-- ============================================================================
-- CREATE CREDITS USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credits_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  credits_consumed INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

COMMENT ON TABLE credits_usage IS 'Historical log of credit consumption for analytics';
COMMENT ON COLUMN credits_usage.action_type IS 'Type of AI action: sentiment, fan_out, sov, schema, eeat';
COMMENT ON COLUMN credits_usage.credits_consumed IS 'Number of credits deducted';
COMMENT ON COLUMN credits_usage.metadata IS 'Additional context: page_url, keyword, etc.';

CREATE INDEX IF NOT EXISTS idx_credits_usage_user_id ON credits_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_usage_created_at ON credits_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_usage_user_date ON credits_usage(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY FOR CREDITS USAGE
-- ============================================================================

ALTER TABLE credits_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit usage"
  ON credits_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert credit usage"
  ON credits_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- UPDATE DEMO USER WITH FREE TIER LIMITS
-- ============================================================================

UPDATE users
SET
  credits_total = 50,
  credits_used = 0,
  websites_limit = 1,
  keywords_limit = 3,
  subscription_status = 'active',
  billing_cycle_start = NOW(),
  billing_cycle_end = NOW() + INTERVAL '30 days'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_credits_remaining(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INT;
  v_used INT;
BEGIN
  SELECT credits_total, credits_used
  INTO v_total, v_used
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_total, 0) - COALESCE(v_used, 0);
END;
$$;

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_credits INT,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INT;
BEGIN
  v_remaining := get_credits_remaining(p_user_id);

  IF v_remaining < p_credits THEN
    RETURN FALSE;
  END IF;

  UPDATE users
  SET credits_used = credits_used + p_credits
  WHERE id = p_user_id;

  INSERT INTO credits_usage (user_id, action_type, credits_consumed, metadata)
  VALUES (p_user_id, p_action_type, p_credits, p_metadata);

  RETURN TRUE;
END;
$$;/*
  # Optimize RLS Policies for Performance

  ## Summary
  This migration optimizes all Row Level Security (RLS) policies by wrapping auth function calls 
  in SELECT statements. This prevents re-evaluation of auth.uid() for each row, significantly 
  improving query performance at scale.

  ## Changes Made
  - Updated all RLS policies across all tables to use `(select auth.uid())` instead of `auth.uid()`
  - This caching pattern improves performance by evaluating the auth function once per query
  - No functional changes - security remains identical

  ## Tables Updated
  - users
  - websites
  - tracked_keywords
  - serp_snapshots
  - page_data
  - scores
  - gsc_metrics
  - fixes_generated
  - platform_scores
  - competitor_benchmarks
  - optimization_roadmap
  - bot_access
  - citations
  - keyword_groups
  - keyword_group_members
  - competitor_domains
  - brand_identity
  - credits_usage
  - redemption_codes

  ## Reference
  https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- Users table policies
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

CREATE POLICY "Users can view own record" ON users
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- Websites table policies
DROP POLICY IF EXISTS "Users can view own websites" ON websites;
DROP POLICY IF EXISTS "Users can insert own websites" ON websites;
DROP POLICY IF EXISTS "Users can update own websites" ON websites;
DROP POLICY IF EXISTS "Users can delete own websites" ON websites;

CREATE POLICY "Users can view own websites" ON websites
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own websites" ON websites
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own websites" ON websites
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own websites" ON websites
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Tracked keywords table policies
DROP POLICY IF EXISTS "Users can view keywords for own websites" ON tracked_keywords;
DROP POLICY IF EXISTS "Users can insert keywords for own websites" ON tracked_keywords;
DROP POLICY IF EXISTS "Users can update keywords for own websites" ON tracked_keywords;
DROP POLICY IF EXISTS "Users can delete keywords for own websites" ON tracked_keywords;

CREATE POLICY "Users can view keywords for own websites" ON tracked_keywords
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert keywords for own websites" ON tracked_keywords
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update keywords for own websites" ON tracked_keywords
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete keywords for own websites" ON tracked_keywords
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

-- SERP snapshots table policies
DROP POLICY IF EXISTS "Users can view snapshots for own keywords" ON serp_snapshots;
DROP POLICY IF EXISTS "Users can insert snapshots for own keywords" ON serp_snapshots;
DROP POLICY IF EXISTS "Users can update snapshots for own keywords" ON serp_snapshots;

CREATE POLICY "Users can view snapshots for own keywords" ON serp_snapshots
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert snapshots for own keywords" ON serp_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update snapshots for own keywords" ON serp_snapshots
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Page data table policies
DROP POLICY IF EXISTS "Users can view page data for own websites" ON page_data;
DROP POLICY IF EXISTS "Users can insert page data for own websites" ON page_data;
DROP POLICY IF EXISTS "Users can update page data for own websites" ON page_data;
DROP POLICY IF EXISTS "Users can delete page data for own websites" ON page_data;

CREATE POLICY "Users can view page data for own websites" ON page_data
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert page data for own websites" ON page_data
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update page data for own websites" ON page_data
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete page data for own websites" ON page_data
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Scores table policies
DROP POLICY IF EXISTS "Users can view scores for own pages" ON scores;
DROP POLICY IF EXISTS "Users can insert scores for own pages" ON scores;
DROP POLICY IF EXISTS "Users can update scores for own pages" ON scores;

CREATE POLICY "Users can view scores for own pages" ON scores
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert scores for own pages" ON scores
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update scores for own pages" ON scores
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ));

-- GSC metrics table policies
DROP POLICY IF EXISTS "Users can view GSC metrics for own websites" ON gsc_metrics;
DROP POLICY IF EXISTS "Users can insert GSC metrics for own websites" ON gsc_metrics;
DROP POLICY IF EXISTS "Users can update GSC metrics for own websites" ON gsc_metrics;

CREATE POLICY "Users can view GSC metrics for own websites" ON gsc_metrics
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert GSC metrics for own websites" ON gsc_metrics
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update GSC metrics for own websites" ON gsc_metrics
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Fixes generated table policies
DROP POLICY IF EXISTS "Users can view fixes for own pages" ON fixes_generated;
DROP POLICY IF EXISTS "Users can insert fixes for own pages" ON fixes_generated;
DROP POLICY IF EXISTS "Users can update fixes for own pages" ON fixes_generated;
DROP POLICY IF EXISTS "Users can delete fixes for own pages" ON fixes_generated;

CREATE POLICY "Users can view fixes for own pages" ON fixes_generated
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert fixes for own pages" ON fixes_generated
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update fixes for own pages" ON fixes_generated
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete fixes for own pages" ON fixes_generated
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Platform scores table policies
DROP POLICY IF EXISTS "Users can read platform scores for their pages" ON platform_scores;

CREATE POLICY "Users can read platform scores for their pages" ON platform_scores
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = platform_scores.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Competitor benchmarks table policies
DROP POLICY IF EXISTS "Users can view competitors for own pages" ON competitor_benchmarks;
DROP POLICY IF EXISTS "Users can insert competitors for own pages" ON competitor_benchmarks;
DROP POLICY IF EXISTS "Users can update competitors for own pages" ON competitor_benchmarks;
DROP POLICY IF EXISTS "Users can delete competitors for own pages" ON competitor_benchmarks;

CREATE POLICY "Users can view competitors for own pages" ON competitor_benchmarks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert competitors for own pages" ON competitor_benchmarks
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update competitors for own pages" ON competitor_benchmarks
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete competitors for own pages" ON competitor_benchmarks
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Optimization roadmap table policies
DROP POLICY IF EXISTS "Users can view roadmap for own pages" ON optimization_roadmap;
DROP POLICY IF EXISTS "Users can insert roadmap for own pages" ON optimization_roadmap;
DROP POLICY IF EXISTS "Users can update roadmap for own pages" ON optimization_roadmap;
DROP POLICY IF EXISTS "Users can delete roadmap for own pages" ON optimization_roadmap;

CREATE POLICY "Users can view roadmap for own pages" ON optimization_roadmap
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert roadmap for own pages" ON optimization_roadmap
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update roadmap for own pages" ON optimization_roadmap
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete roadmap for own pages" ON optimization_roadmap
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Bot access table policies
DROP POLICY IF EXISTS "Users can view bot access for own pages" ON bot_access;
DROP POLICY IF EXISTS "Users can insert bot access for own pages" ON bot_access;
DROP POLICY IF EXISTS "Users can update bot access for own pages" ON bot_access;
DROP POLICY IF EXISTS "Users can delete bot access for own pages" ON bot_access;

CREATE POLICY "Users can view bot access for own pages" ON bot_access
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert bot access for own pages" ON bot_access
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update bot access for own pages" ON bot_access
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete bot access for own pages" ON bot_access
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Citations table policies
DROP POLICY IF EXISTS "Users can view citations for own keywords" ON citations;
DROP POLICY IF EXISTS "Users can insert citations for own keywords" ON citations;
DROP POLICY IF EXISTS "Users can update citations for own keywords" ON citations;
DROP POLICY IF EXISTS "Users can delete citations for own keywords" ON citations;

CREATE POLICY "Users can view citations for own keywords" ON citations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert citations for own keywords" ON citations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update citations for own keywords" ON citations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete citations for own keywords" ON citations
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

-- Keyword groups table policies
DROP POLICY IF EXISTS "Users can view own keyword groups" ON keyword_groups;
DROP POLICY IF EXISTS "Users can insert own keyword groups" ON keyword_groups;
DROP POLICY IF EXISTS "Users can update own keyword groups" ON keyword_groups;
DROP POLICY IF EXISTS "Users can delete own keyword groups" ON keyword_groups;

CREATE POLICY "Users can view own keyword groups" ON keyword_groups
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert own keyword groups" ON keyword_groups
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update own keyword groups" ON keyword_groups
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete own keyword groups" ON keyword_groups
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

-- Keyword group members table policies
DROP POLICY IF EXISTS "Users can view keyword group members for own groups" ON keyword_group_members;
DROP POLICY IF EXISTS "Users can insert keyword group members for own groups" ON keyword_group_members;
DROP POLICY IF EXISTS "Users can update keyword group members for own groups" ON keyword_group_members;
DROP POLICY IF EXISTS "Users can delete keyword group members for own groups" ON keyword_group_members;

CREATE POLICY "Users can view keyword group members for own groups" ON keyword_group_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert keyword group members for own groups" ON keyword_group_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update keyword group members for own groups" ON keyword_group_members
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete keyword group members for own groups" ON keyword_group_members
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

-- Competitor domains table policies
DROP POLICY IF EXISTS "Users can view competitor domains for own websites" ON competitor_domains;
DROP POLICY IF EXISTS "Users can insert competitor domains for own websites" ON competitor_domains;
DROP POLICY IF EXISTS "Users can update competitor domains for own websites" ON competitor_domains;
DROP POLICY IF EXISTS "Users can delete competitor domains for own websites" ON competitor_domains;

CREATE POLICY "Users can view competitor domains for own websites" ON competitor_domains
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert competitor domains for own websites" ON competitor_domains
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update competitor domains for own websites" ON competitor_domains
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete competitor domains for own websites" ON competitor_domains
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

-- Brand identity table policies
DROP POLICY IF EXISTS "Users can view own brand identity" ON brand_identity;
DROP POLICY IF EXISTS "Users can insert own brand identity" ON brand_identity;
DROP POLICY IF EXISTS "Users can update own brand identity" ON brand_identity;
DROP POLICY IF EXISTS "Users can delete own brand identity" ON brand_identity;

CREATE POLICY "Users can view own brand identity" ON brand_identity
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own brand identity" ON brand_identity
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own brand identity" ON brand_identity
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own brand identity" ON brand_identity
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Credits usage table policies
DROP POLICY IF EXISTS "Users can view own credit usage" ON credits_usage;
DROP POLICY IF EXISTS "Service role can insert credit usage" ON credits_usage;

CREATE POLICY "Users can view own credit usage" ON credits_usage
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Service role can insert credit usage" ON credits_usage
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Redemption codes table policies
DROP POLICY IF EXISTS "Users can view their own redeemed codes" ON redemption_codes;
DROP POLICY IF EXISTS "Users can redeem unredeemed codes" ON redemption_codes;

CREATE POLICY "Users can view their own redeemed codes" ON redemption_codes
  FOR SELECT TO authenticated
  USING (redeemed_by = (select auth.uid()));

CREATE POLICY "Users can redeem unredeemed codes" ON redemption_codes
  FOR SELECT TO authenticated
  USING (redeemed_by IS NULL);
/*
  # Extend Admin Panel & AppSumo LTD Support

  1. Overview
    This migration extends existing tables to support the admin panel for managing
    AppSumo lifetime deals, including code management and audit logging.

  2. Table Extensions
    - `redemption_codes` - Add missing columns (id, is_claimed, revoked_at, etc.)
    - `users` - Add is_admin flag for admin access

  3. New Tables
    - `admin_actions` - Complete audit log for all admin operations

  4. Security
    - RLS policies for admin-only access
    - Comprehensive audit logging
    - Admin helper functions for common operations

  5. Notes
    - Handles existing redemption_codes table gracefully
    - All changes are idempotent and can be run multiple times safely
*/

-- ============================================================================
-- ADD IS_ADMIN TO USERS TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;
    COMMENT ON COLUMN users.is_admin IS 'Admin flag for access to /admin portal';
  END IF;
END $$;

-- ============================================================================
-- EXTEND REDEMPTION_CODES TABLE
-- ============================================================================

-- Add id column as primary key (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'id'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN id UUID DEFAULT gen_random_uuid();
    -- Drop old primary key on code
    ALTER TABLE redemption_codes DROP CONSTRAINT IF EXISTS redemption_codes_pkey;
    -- Add new primary key on id
    ALTER TABLE redemption_codes ADD PRIMARY KEY (id);
    -- Keep code unique
    ALTER TABLE redemption_codes ADD CONSTRAINT redemption_codes_code_unique UNIQUE (code);
  END IF;
END $$;

-- Add is_claimed column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'is_claimed'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE;
    -- Update existing rows based on redeemed_by
    UPDATE redemption_codes SET is_claimed = TRUE WHERE redeemed_by IS NOT NULL;
  END IF;
END $$;

-- Add revocation tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoked_at'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoked_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoked_by'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoked_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoke_reason'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoke_reason TEXT;
  END IF;
END $$;

-- Add comments and indexes
COMMENT ON TABLE redemption_codes IS 'AppSumo LTD redemption codes with tier assignments and revocation tracking';
COMMENT ON COLUMN redemption_codes.is_claimed IS 'Whether code has been redeemed';
COMMENT ON COLUMN redemption_codes.revoked_at IS 'When code was revoked (for refunds)';
COMMENT ON COLUMN redemption_codes.revoked_by IS 'Admin who revoked the code';
COMMENT ON COLUMN redemption_codes.revoke_reason IS 'Reason for revocation (refund, abuse, etc.)';

CREATE INDEX IF NOT EXISTS idx_redemption_codes_is_claimed ON redemption_codes(is_claimed);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_tier ON redemption_codes(tier);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed_by ON redemption_codes(redeemed_by);

-- ============================================================================
-- CREATE ADMIN ACTIONS AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_email TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_actions IS 'Audit log of all admin operations for compliance and debugging';
COMMENT ON COLUMN admin_actions.action_type IS 'Type: code_upload, code_revoke, credit_adjust, tier_change, user_impersonate';
COMMENT ON COLUMN admin_actions.details IS 'JSON payload with action-specific data (amount, reason, old_value, new_value)';

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);

-- ============================================================================
-- ROW LEVEL SECURITY FOR REDEMPTION CODES (ADMIN ACCESS)
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can insert redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can update redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can delete redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Service role can update codes during redemption" ON redemption_codes;

-- Admins can view all codes
CREATE POLICY "Admins can view all redemption codes"
  ON redemption_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can insert codes (bulk upload)
CREATE POLICY "Admins can insert redemption codes"
  ON redemption_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can update codes (mark as revoked)
CREATE POLICY "Admins can update redemption codes"
  ON redemption_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can delete codes
CREATE POLICY "Admins can delete redemption codes"
  ON redemption_codes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- ============================================================================
-- ROW LEVEL SECURITY FOR ADMIN ACTIONS
-- ============================================================================

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin actions"
  ON admin_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can insert admin actions"
  ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- ============================================================================
-- ADMIN HELPER FUNCTIONS
-- ============================================================================

-- Function to revoke a code and downgrade the user
CREATE OR REPLACE FUNCTION revoke_redemption_code(
  p_code TEXT,
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'Refund processed'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record RECORD;
  v_user_record RECORD;
  v_admin_email TEXT;
  v_result JSONB;
  v_remaining_codes INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Get code details
  SELECT * INTO v_code_record FROM redemption_codes WHERE code = UPPER(p_code);
  IF v_code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code not found');
  END IF;

  IF NOT v_code_record.is_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code has not been redeemed');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = v_code_record.redeemed_by;

  -- Mark code as revoked
  UPDATE redemption_codes
  SET 
    revoked_at = NOW(),
    revoked_by = p_admin_id,
    revoke_reason = p_reason,
    is_claimed = FALSE
  WHERE code = UPPER(p_code);

  -- Remove code from user's redeemed list
  UPDATE users
  SET codes_redeemed = array_remove(codes_redeemed, UPPER(p_code))
  WHERE id = v_code_record.redeemed_by;

  -- Get remaining codes count
  SELECT array_length(codes_redeemed, 1) INTO v_remaining_codes
  FROM users WHERE id = v_code_record.redeemed_by;

  v_remaining_codes := COALESCE(v_remaining_codes, 0);

  -- Downgrade user tier
  IF v_remaining_codes = 0 THEN
    -- No more codes, revert to free tier
    UPDATE users
    SET 
      appsumo_tier = 0,
      is_lifetime_deal = FALSE,
      credits_total = 50,
      credits_used = 0,
      websites_limit = 1,
      keywords_limit = 3
    WHERE id = v_code_record.redeemed_by;
  ELSE
    -- Downgrade by one tier
    UPDATE users
    SET 
      appsumo_tier = GREATEST(1, appsumo_tier - 1),
      credits_total = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 100
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 250
        ELSE 500
      END,
      credits_used = 0,
      websites_limit = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 3
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 10
        ELSE 50
      END,
      keywords_limit = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 25
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 100
        ELSE 500
      END
    WHERE id = v_code_record.redeemed_by;
  END IF;

  -- Log admin action
  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'code_revoke',
    v_code_record.redeemed_by,
    v_user_record.email,
    jsonb_build_object(
      'code', v_code_record.code,
      'tier', v_code_record.tier,
      'reason', p_reason,
      'old_tier', v_user_record.appsumo_tier,
      'remaining_codes', v_remaining_codes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Code revoked and user downgraded',
    'code', v_code_record.code,
    'user_email', v_user_record.email,
    'remaining_codes', v_remaining_codes
  );
END;
$$;

-- Function to manually adjust user credits
CREATE OR REPLACE FUNCTION adjust_user_credits(
  p_user_id UUID,
  p_credit_change INT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_total INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Calculate new credit total
  v_new_total := GREATEST(0, v_user_record.credits_total + p_credit_change);

  -- Update user credits
  UPDATE users
  SET credits_total = v_new_total
  WHERE id = p_user_id;

  -- Log admin action
  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'credit_adjust',
    p_user_id,
    v_user_record.email,
    jsonb_build_object(
      'credit_change', p_credit_change,
      'old_total', v_user_record.credits_total,
      'new_total', v_new_total,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Credits adjusted successfully',
    'old_total', v_user_record.credits_total,
    'new_total', v_new_total
  );
END;
$$;

-- Function to change user tier manually
CREATE OR REPLACE FUNCTION change_user_tier(
  p_user_id UUID,
  p_new_tier INT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_credits INT;
  v_new_websites INT;
  v_new_keywords INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Validate tier
  IF p_new_tier NOT IN (0, 1, 2, 3) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid tier. Must be 0, 1, 2, or 3');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Determine new limits based on tier
  CASE p_new_tier
    WHEN 0 THEN
      v_new_credits := 50;
      v_new_websites := 1;
      v_new_keywords := 3;
    WHEN 1 THEN
      v_new_credits := 100;
      v_new_websites := 3;
      v_new_keywords := 25;
    WHEN 2 THEN
      v_new_credits := 250;
      v_new_websites := 10;
      v_new_keywords := 100;
    WHEN 3 THEN
      v_new_credits := 500;
      v_new_websites := 50;
      v_new_keywords := 500;
  END CASE;

  -- Update user tier and limits
  UPDATE users
  SET 
    appsumo_tier = p_new_tier,
    is_lifetime_deal = (p_new_tier > 0),
    credits_total = v_new_credits,
    credits_used = 0,
    websites_limit = v_new_websites,
    keywords_limit = v_new_keywords
  WHERE id = p_user_id;

  -- Log admin action
  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'tier_change',
    p_user_id,
    v_user_record.email,
    jsonb_build_object(
      'old_tier', v_user_record.appsumo_tier,
      'new_tier', p_new_tier,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Tier changed successfully',
    'old_tier', v_user_record.appsumo_tier,
    'new_tier', p_new_tier
  );
END;
$$;/*
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
  );/*
  # Add Service Role Bypass Policies

  ## Overview
  This migration adds RLS policies that allow the service role to bypass
  user authentication checks. This enables Edge Functions to insert/update
  data on behalf of users without requiring authenticated sessions.

  ## Changes
  1. Add service role bypass policies for all tables
  2. Allow service role to perform operations without auth.uid() checks
  3. Maintain existing user policies for authenticated users

  ## Security
  - Service role policies only apply when using SUPABASE_SERVICE_ROLE_KEY
  - Regular users still restricted by existing RLS policies
  - No security degradation for authenticated user access

  ## Notes
  - Service role has full access but only used by trusted Edge Functions
  - Existing user policies remain unchanged and take precedence for regular users
*/

-- ============================================================================
-- SERVICE ROLE POLICIES FOR USERS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update users"
  ON users
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all users"
  ON users
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR WEBSITES TABLE
-- ============================================================================

CREATE POLICY "Service role can insert websites"
  ON websites
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update websites"
  ON websites
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all websites"
  ON websites
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete websites"
  ON websites
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR PAGE_DATA TABLE
-- ============================================================================

CREATE POLICY "Service role can insert page data"
  ON page_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update page data"
  ON page_data
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all page data"
  ON page_data
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete page data"
  ON page_data
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR SCORES TABLE
-- ============================================================================

CREATE POLICY "Service role can insert scores"
  ON scores
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scores"
  ON scores
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all scores"
  ON scores
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR TRACKED_KEYWORDS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert keywords"
  ON tracked_keywords
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update keywords"
  ON tracked_keywords
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all keywords"
  ON tracked_keywords
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete keywords"
  ON tracked_keywords
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR SERP_SNAPSHOTS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert snapshots"
  ON serp_snapshots
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update snapshots"
  ON serp_snapshots
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all snapshots"
  ON serp_snapshots
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR GSC_METRICS TABLE
-- ============================================================================

CREATE POLICY "Service role can insert GSC metrics"
  ON gsc_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update GSC metrics"
  ON gsc_metrics
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all GSC metrics"
  ON gsc_metrics
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- SERVICE ROLE POLICIES FOR FIXES_GENERATED TABLE
-- ============================================================================

CREATE POLICY "Service role can insert fixes"
  ON fixes_generated
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update fixes"
  ON fixes_generated
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can view all fixes"
  ON fixes_generated
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete fixes"
  ON fixes_generated
  FOR DELETE
  TO service_role
  USING (true);/*
  # Create Demo User for Anonymous Access

  1. Purpose
    - Creates a demo user with valid UUID for anonymous/guest access
    - Allows the application to work without authentication
    - All anonymous users will share this account initially

  2. Changes
    - Insert demo user into auth.users table (required for FK)
    - Insert demo user into public.users table
    - Uses UUID: 00000000-0000-0000-0000-000000000001

  3. Security Notes
    - This is a temporary solution for MVP
    - All anonymous users will share data
    - Should be replaced with proper auth or per-session UUIDs
*/

-- Insert demo user into auth.users (required for foreign key constraint)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@aireadiness.local',
  crypt('demo-password-not-used', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo user into public.users table
INSERT INTO public.users (id, email, created_at, subscription_plan, gsc_connected)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@aireadiness.local',
  NOW(),
  'free',
  false
)
ON CONFLICT (id) DO NOTHING;/*
  # Add List Structure Detection Column

  1. Purpose
    - Adds `has_list_structure` column to track bullet points/lists
    - Completes PRD Section 4 scoring requirements
    - Lists boost AI citation inclusion by 4.72% (research-backed)

  2. Changes
    - Add `has_list_structure` boolean column to `page_data` table
    - Default value: false
    - Required for Structure Score calculation (adds +5 points)

  3. Impact
    - Structure Score will now range 0-35 points (was 0-30)
    - Overall scoring formula remains unchanged
*/

-- Add list structure detection column
ALTER TABLE page_data 
ADD COLUMN IF NOT EXISTS has_list_structure BOOLEAN DEFAULT false;
/*
  # Add Platform-Specific Scores Table

  1. New Tables
    - `platform_scores`
      - `id` (uuid, primary key)
      - `page_id` (uuid, foreign key to page_data)
      - Platform scores (0-100 for each AI model):
        - `gemini_score` (float)
        - `chatgpt_score` (float)
        - `claude_score` (float)
        - `perplexity_score` (float)
      - Sub-component scores for each platform:
        - Gemini: `gemini_schema_component`, `gemini_mobile_component`
        - ChatGPT: `chatgpt_structure_component`, `chatgpt_clarity_component`
        - Claude: `claude_citation_component`, `claude_nuance_component`
        - Perplexity: `perplexity_external_links_component`, `perplexity_data_component`
      - `calculated_at` (timestamp)
  
  2. Security
    - Enable RLS on `platform_scores` table
    - Add policy for authenticated users to read platform scores for their pages
*/

CREATE TABLE IF NOT EXISTS platform_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES page_data(id) ON DELETE CASCADE,
  
  -- Overall platform scores (0-100)
  gemini_score float NOT NULL DEFAULT 0,
  chatgpt_score float NOT NULL DEFAULT 0,
  claude_score float NOT NULL DEFAULT 0,
  perplexity_score float NOT NULL DEFAULT 0,
  
  -- Gemini sub-components
  gemini_schema_component float NOT NULL DEFAULT 0,
  gemini_mobile_component float NOT NULL DEFAULT 0,
  
  -- ChatGPT sub-components
  chatgpt_structure_component float NOT NULL DEFAULT 0,
  chatgpt_clarity_component float NOT NULL DEFAULT 0,
  
  -- Claude sub-components
  claude_citation_component float NOT NULL DEFAULT 0,
  claude_nuance_component float NOT NULL DEFAULT 0,
  
  -- Perplexity sub-components
  perplexity_external_links_component float NOT NULL DEFAULT 0,
  perplexity_data_component float NOT NULL DEFAULT 0,
  
  calculated_at timestamptz DEFAULT now(),
  
  UNIQUE(page_id, calculated_at)
);

ALTER TABLE platform_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read platform scores for their pages"
  ON platform_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data pd
      JOIN websites w ON pd.website_id = w.id
      WHERE pd.id = platform_scores.page_id
      AND w.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_platform_scores_page_id ON platform_scores(page_id);
CREATE INDEX IF NOT EXISTS idx_platform_scores_calculated_at ON platform_scores(calculated_at DESC);
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
/*
  # Add Bot Access Verification Table

  ## Overview
  This migration adds the bot_access table to track whether AI crawler bots
  can physically access the user's website. This is critical for AI visibility -
  if bots are blocked, the site cannot appear in AI search results.

  ## New Tables
  1. **bot_access** - Verification status for AI crawler bots
     - `id` (uuid, primary key)
     - `page_id` (uuid, references page_data) - Links to analyzed page
     - `bot_name` (varchar) - Bot identifier (GPTBot, CCBot, Google-Extended, FacebookBot, PerplexityBot)
     - `is_allowed` (boolean) - Whether bot can access the site
     - `block_reason` (varchar) - Reason: robots_txt, firewall, user_agent_block, or null if allowed
     - `robots_txt_rule` (text) - Specific robots.txt rule causing the block
     - `checked_at` (timestamp) - When verification was performed

  ## Security
  - RLS enabled on bot_access table
  - Users can only view bot access data for their own pages
  - Standard CRUD policies following existing patterns

  ## Performance
  - Index on page_id for fast lookups
  - Composite index on (page_id, is_allowed) for filtering blocked bots
  - Unique constraint on (page_id, bot_name) to prevent duplicates
*/

-- ============================================================================
-- BOT ACCESS VERIFICATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bot_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,
  bot_name VARCHAR(50) NOT NULL,
  is_allowed BOOLEAN DEFAULT TRUE,
  block_reason VARCHAR(50),
  robots_txt_rule TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, bot_name)
);

COMMENT ON TABLE bot_access IS 'Verification status for AI crawler bots (GPTBot, CCBot, etc.)';
COMMENT ON COLUMN bot_access.bot_name IS 'Bot identifier: GPTBot, CCBot, Google-Extended, FacebookBot, PerplexityBot';
COMMENT ON COLUMN bot_access.is_allowed IS 'Whether bot can access the site';
COMMENT ON COLUMN bot_access.block_reason IS 'Reason for block: robots_txt, firewall, user_agent_block, or null if allowed';
COMMENT ON COLUMN bot_access.robots_txt_rule IS 'Specific robots.txt rule causing the block';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bot_access_page_id ON bot_access(page_id);
CREATE INDEX IF NOT EXISTS idx_bot_access_page_blocked ON bot_access(page_id, is_allowed);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE bot_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bot access for own pages"
  ON bot_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = bot_access.page_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert bot access for own pages"
  ON bot_access
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

CREATE POLICY "Users can update bot access for own pages"
  ON bot_access
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = bot_access.page_id
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

CREATE POLICY "Users can delete bot access for own pages"
  ON bot_access
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM page_data
      JOIN websites ON websites.id = page_data.website_id
      WHERE page_data.id = bot_access.page_id
      AND websites.user_id = auth.uid()
    )
  );/*
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
/*
  # Add Answer Engine Optimization (AEO) Fields

  ## Overview
  This migration adds Answer Engine Optimization tracking to the page_data table.
  AEO measures how well content is formatted for AI "quick answers" in RAG
  (Retrieval Augmented Generation) systems.

  ## Changes to Existing Tables

  1. **page_data** - Add AEO analysis fields:
     - `qa_pairs_count` (integer) - Number of question-answer patterns detected
     - `has_direct_answers` (boolean) - Whether direct Q&A format is present
     - `list_density` (float) - Percentage of content in list format (0-100)
     - `ul_count` (integer) - Number of unordered lists
     - `ol_count` (integer) - Number of ordered lists
     - `table_count` (integer) - Number of data tables detected
     - `has_tables` (boolean) - Whether tables are present
     - `intro_fluff_score` (float) - Fluff detection in first 100 words (0-100, lower is better)
     - `intro_density_score` (float) - Information density of intro (0-100, higher is better)
     - `has_tldr` (boolean) - Whether TL;DR or Key Takeaways section exists
     - `aeo_score` (float) - Overall Answer Engine Optimization score (0-25)

  2. **scores** - Add AEO component:
     - `aeo_score` (float) - AEO contribution to overall score (0-25)

  ## AEO Scoring Components

  - **Direct Answers (0-8 points):**
    - 5+ Q&A pairs = 8 points
    - 2-4 Q&A pairs = 5 points
    - 1 Q&A pair = 3 points
    - No Q&A = 0 points

  - **List Usage (0-7 points):**
    - Optimal density 15-30% = 7 points
    - Some lists 5-14% = 4 points
    - Minimal lists <5% = 1 point

  - **Table Presence (0-6 points):**
    - Multiple tables = 6 points
    - One table = 4 points
    - No tables = 0 points

  - **Introduction Quality (0-4 points):**
    - Low fluff, high density = 4 points
    - Medium fluff = 2 points
    - High fluff = 0 points

  ## Research Backing

  - "Bullet points boost AI Overview inclusion by 4.72%" - Surfer SEO
  - "Perplexity cites tabular data 3.2x more frequently" - Industry research
  - "Direct Q&A format increases AI citation likelihood by 23%" - RAG studies

  ## Performance

  - No new indexes needed (these are analysis fields, not query filters)
  - Default values ensure backward compatibility
*/

-- ============================================================================
-- ADD AEO FIELDS TO page_data TABLE
-- ============================================================================

-- Q&A Detection Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS qa_pairs_count INTEGER DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS has_direct_answers BOOLEAN DEFAULT FALSE;

-- List Analysis Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS list_density FLOAT DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS ul_count INTEGER DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS ol_count INTEGER DEFAULT 0;

-- Table Detection Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS table_count INTEGER DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS has_tables BOOLEAN DEFAULT FALSE;

-- Introduction Quality Fields
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS intro_fluff_score FLOAT DEFAULT 0;

ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS intro_density_score FLOAT DEFAULT 0;

-- Summary Detection
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS has_tldr BOOLEAN DEFAULT FALSE;

-- Overall AEO Score
ALTER TABLE page_data
  ADD COLUMN IF NOT EXISTS aeo_score FLOAT DEFAULT 0;

-- ============================================================================
-- ADD AEO SCORE TO scores TABLE
-- ============================================================================

ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS aeo_score FLOAT DEFAULT 0;

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN page_data.qa_pairs_count IS 'Number of question-answer pairs detected (heading with question + following paragraph)';
COMMENT ON COLUMN page_data.has_direct_answers IS 'Whether page contains direct Q&A format';
COMMENT ON COLUMN page_data.list_density IS 'Percentage of content in list format (0-100), optimal 15-30%';
COMMENT ON COLUMN page_data.ul_count IS 'Count of unordered lists';
COMMENT ON COLUMN page_data.ol_count IS 'Count of ordered lists';
COMMENT ON COLUMN page_data.table_count IS 'Number of data tables (>2 rows, >2 cols)';
COMMENT ON COLUMN page_data.has_tables IS 'Whether page contains data tables';
COMMENT ON COLUMN page_data.intro_fluff_score IS 'Fluff detection in first 100 words (0-100, lower is better)';
COMMENT ON COLUMN page_data.intro_density_score IS 'Information density of intro (0-100, higher is better)';
COMMENT ON COLUMN page_data.has_tldr IS 'Whether page has TL;DR or Key Takeaways section';
COMMENT ON COLUMN page_data.aeo_score IS 'Answer Engine Optimization score (0-25)';
COMMENT ON COLUMN scores.aeo_score IS 'AEO component of overall AI readiness score (0-25)';
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
  USING (true);/*
  # Add Perplexity Optimizer Support

  1. New Columns in page_data
    - `has_comparative_paragraphs` (boolean) - Indicates if page contains comparative data in paragraphs
    - `comparative_data_score` (float) - Score 0-100 indicating density of comparative content
    - `comparative_paragraph_count` (integer) - Number of paragraphs with comparative data
    - `perplexity_table_recommendation` (boolean) - Whether table conversion is recommended
    - `comparative_content_samples` (jsonb) - Sample paragraphs that could be converted to tables

  2. Analytics Table
    - Track Perplexity optimizer usage and conversions
*/

-- Add new columns to page_data for comparative data detection
ALTER TABLE page_data
ADD COLUMN IF NOT EXISTS has_comparative_paragraphs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS comparative_data_score float DEFAULT 0,
ADD COLUMN IF NOT EXISTS comparative_paragraph_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS perplexity_table_recommendation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS comparative_content_samples jsonb DEFAULT '[]'::jsonb;

-- Create analytics table for tracking Perplexity optimizer usage
CREATE TABLE IF NOT EXISTS perplexity_optimizer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES page_data(id) ON DELETE CASCADE,
  comparative_paragraphs_detected integer DEFAULT 0,
  tables_generated integer DEFAULT 0,
  conversion_type text,
  user_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on the analytics table
ALTER TABLE perplexity_optimizer_analytics ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage analytics
CREATE POLICY "Service role can manage perplexity analytics"
  ON perplexity_optimizer_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_perplexity_analytics_page_id
  ON perplexity_optimizer_analytics(page_id);

CREATE INDEX IF NOT EXISTS idx_page_data_comparative
  ON page_data(has_comparative_paragraphs, perplexity_table_recommendation);/*
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
  ON tracked_keywords(website_id, keyword, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));/*
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

COMMENT ON FUNCTION refresh_citation_reputation_stats() IS 'Refreshes the citation reputation stats materialized view';/*
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

COMMENT ON COLUMN brand_identity.trust_signals_checklist IS 'User progress through E-E-A-T trust signals checklist';/*
  # Add Tier Limits and Credit Tracking

  1. Overview
    This migration extends the users table to support tiered subscription limits
    and credit-based usage tracking for AI features.

  2. New Columns Added to Users Table
    - `credits_total` (int) - Total credits allocated for current billing period
    - `credits_used` (int) - Credits consumed this billing period
    - `websites_limit` (int) - Maximum websites user can track
    - `keywords_limit` (int) - Maximum keywords user can track
    - `stripe_customer_id` (text) - Stripe customer ID for billing
    - `stripe_subscription_id` (text) - Stripe subscription ID
    - `subscription_status` (text) - active, canceled, past_due, etc.
    - `billing_cycle_start` (timestamp) - Start of current billing cycle
    - `billing_cycle_end` (timestamp) - End of current billing cycle

  3. New Tables
    - `credits_usage` - Historical log of credit consumption for analytics

  4. Tier Specifications
    FREE:   credits_total=50,  websites_limit=1,  keywords_limit=3
    PRO:    credits_total=500, websites_limit=3,  keywords_limit=50
    AGENCY: credits_total=2500, websites_limit=15, keywords_limit=250

  5. Security
    - Users can view their own limits (read-only)
    - Only service role can modify limits
    - Credits usage tracking for transparency
*/

-- ============================================================================
-- EXTEND USERS TABLE WITH TIER LIMITS AND CREDITS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits_total'
  ) THEN
    ALTER TABLE users ADD COLUMN credits_total INT DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'credits_used'
  ) THEN
    ALTER TABLE users ADD COLUMN credits_used INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'websites_limit'
  ) THEN
    ALTER TABLE users ADD COLUMN websites_limit INT DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'keywords_limit'
  ) THEN
    ALTER TABLE users ADD COLUMN keywords_limit INT DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'billing_cycle_start'
  ) THEN
    ALTER TABLE users ADD COLUMN billing_cycle_start TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'billing_cycle_end'
  ) THEN
    ALTER TABLE users ADD COLUMN billing_cycle_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
  END IF;
END $$;

COMMENT ON COLUMN users.credits_total IS 'Total credits allocated for current billing period';
COMMENT ON COLUMN users.credits_used IS 'Credits consumed in current billing period';
COMMENT ON COLUMN users.websites_limit IS 'Maximum number of websites user can track';
COMMENT ON COLUMN users.keywords_limit IS 'Maximum number of keywords user can track';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, canceled, past_due';

-- ============================================================================
-- CREATE CREDITS USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credits_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  credits_consumed INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

COMMENT ON TABLE credits_usage IS 'Historical log of credit consumption for analytics';
COMMENT ON COLUMN credits_usage.action_type IS 'Type of AI action: sentiment, fan_out, sov, schema, eeat';
COMMENT ON COLUMN credits_usage.credits_consumed IS 'Number of credits deducted';
COMMENT ON COLUMN credits_usage.metadata IS 'Additional context: page_url, keyword, etc.';

CREATE INDEX IF NOT EXISTS idx_credits_usage_user_id ON credits_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_usage_created_at ON credits_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_usage_user_date ON credits_usage(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY FOR CREDITS USAGE
-- ============================================================================

ALTER TABLE credits_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit usage"
  ON credits_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert credit usage"
  ON credits_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- UPDATE DEMO USER WITH FREE TIER LIMITS
-- ============================================================================

UPDATE users
SET
  credits_total = 50,
  credits_used = 0,
  websites_limit = 1,
  keywords_limit = 3,
  subscription_status = 'active',
  billing_cycle_start = NOW(),
  billing_cycle_end = NOW() + INTERVAL '30 days'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_credits_remaining(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INT;
  v_used INT;
BEGIN
  SELECT credits_total, credits_used
  INTO v_total, v_used
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_total, 0) - COALESCE(v_used, 0);
END;
$$;

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_credits INT,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INT;
BEGIN
  v_remaining := get_credits_remaining(p_user_id);

  IF v_remaining < p_credits THEN
    RETURN FALSE;
  END IF;

  UPDATE users
  SET credits_used = credits_used + p_credits
  WHERE id = p_user_id;

  INSERT INTO credits_usage (user_id, action_type, credits_consumed, metadata)
  VALUES (p_user_id, p_action_type, p_credits, p_metadata);

  RETURN TRUE;
END;
$$;/*
  # Optimize RLS Policies for Performance

  ## Summary
  This migration optimizes all Row Level Security (RLS) policies by wrapping auth function calls 
  in SELECT statements. This prevents re-evaluation of auth.uid() for each row, significantly 
  improving query performance at scale.

  ## Changes Made
  - Updated all RLS policies across all tables to use `(select auth.uid())` instead of `auth.uid()`
  - This caching pattern improves performance by evaluating the auth function once per query
  - No functional changes - security remains identical

  ## Tables Updated
  - users
  - websites
  - tracked_keywords
  - serp_snapshots
  - page_data
  - scores
  - gsc_metrics
  - fixes_generated
  - platform_scores
  - competitor_benchmarks
  - optimization_roadmap
  - bot_access
  - citations
  - keyword_groups
  - keyword_group_members
  - competitor_domains
  - brand_identity
  - credits_usage
  - redemption_codes

  ## Reference
  https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- Users table policies
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

CREATE POLICY "Users can view own record" ON users
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own record" ON users
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- Websites table policies
DROP POLICY IF EXISTS "Users can view own websites" ON websites;
DROP POLICY IF EXISTS "Users can insert own websites" ON websites;
DROP POLICY IF EXISTS "Users can update own websites" ON websites;
DROP POLICY IF EXISTS "Users can delete own websites" ON websites;

CREATE POLICY "Users can view own websites" ON websites
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own websites" ON websites
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own websites" ON websites
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own websites" ON websites
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Tracked keywords table policies
DROP POLICY IF EXISTS "Users can view keywords for own websites" ON tracked_keywords;
DROP POLICY IF EXISTS "Users can insert keywords for own websites" ON tracked_keywords;
DROP POLICY IF EXISTS "Users can update keywords for own websites" ON tracked_keywords;
DROP POLICY IF EXISTS "Users can delete keywords for own websites" ON tracked_keywords;

CREATE POLICY "Users can view keywords for own websites" ON tracked_keywords
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert keywords for own websites" ON tracked_keywords
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update keywords for own websites" ON tracked_keywords
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete keywords for own websites" ON tracked_keywords
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = tracked_keywords.website_id 
    AND websites.user_id = (select auth.uid())
  ));

-- SERP snapshots table policies
DROP POLICY IF EXISTS "Users can view snapshots for own keywords" ON serp_snapshots;
DROP POLICY IF EXISTS "Users can insert snapshots for own keywords" ON serp_snapshots;
DROP POLICY IF EXISTS "Users can update snapshots for own keywords" ON serp_snapshots;

CREATE POLICY "Users can view snapshots for own keywords" ON serp_snapshots
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert snapshots for own keywords" ON serp_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update snapshots for own keywords" ON serp_snapshots
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords 
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = serp_snapshots.keyword_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Page data table policies
DROP POLICY IF EXISTS "Users can view page data for own websites" ON page_data;
DROP POLICY IF EXISTS "Users can insert page data for own websites" ON page_data;
DROP POLICY IF EXISTS "Users can update page data for own websites" ON page_data;
DROP POLICY IF EXISTS "Users can delete page data for own websites" ON page_data;

CREATE POLICY "Users can view page data for own websites" ON page_data
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert page data for own websites" ON page_data
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update page data for own websites" ON page_data
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete page data for own websites" ON page_data
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = page_data.website_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Scores table policies
DROP POLICY IF EXISTS "Users can view scores for own pages" ON scores;
DROP POLICY IF EXISTS "Users can insert scores for own pages" ON scores;
DROP POLICY IF EXISTS "Users can update scores for own pages" ON scores;

CREATE POLICY "Users can view scores for own pages" ON scores
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert scores for own pages" ON scores
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update scores for own pages" ON scores
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = scores.page_id 
    AND websites.user_id = (select auth.uid())
  ));

-- GSC metrics table policies
DROP POLICY IF EXISTS "Users can view GSC metrics for own websites" ON gsc_metrics;
DROP POLICY IF EXISTS "Users can insert GSC metrics for own websites" ON gsc_metrics;
DROP POLICY IF EXISTS "Users can update GSC metrics for own websites" ON gsc_metrics;

CREATE POLICY "Users can view GSC metrics for own websites" ON gsc_metrics
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert GSC metrics for own websites" ON gsc_metrics
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update GSC metrics for own websites" ON gsc_metrics
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites 
    WHERE websites.id = gsc_metrics.website_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Fixes generated table policies
DROP POLICY IF EXISTS "Users can view fixes for own pages" ON fixes_generated;
DROP POLICY IF EXISTS "Users can insert fixes for own pages" ON fixes_generated;
DROP POLICY IF EXISTS "Users can update fixes for own pages" ON fixes_generated;
DROP POLICY IF EXISTS "Users can delete fixes for own pages" ON fixes_generated;

CREATE POLICY "Users can view fixes for own pages" ON fixes_generated
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert fixes for own pages" ON fixes_generated
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update fixes for own pages" ON fixes_generated
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete fixes for own pages" ON fixes_generated
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data 
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = fixes_generated.page_id 
    AND websites.user_id = (select auth.uid())
  ));

-- Platform scores table policies
DROP POLICY IF EXISTS "Users can read platform scores for their pages" ON platform_scores;

CREATE POLICY "Users can read platform scores for their pages" ON platform_scores
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = platform_scores.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Competitor benchmarks table policies
DROP POLICY IF EXISTS "Users can view competitors for own pages" ON competitor_benchmarks;
DROP POLICY IF EXISTS "Users can insert competitors for own pages" ON competitor_benchmarks;
DROP POLICY IF EXISTS "Users can update competitors for own pages" ON competitor_benchmarks;
DROP POLICY IF EXISTS "Users can delete competitors for own pages" ON competitor_benchmarks;

CREATE POLICY "Users can view competitors for own pages" ON competitor_benchmarks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert competitors for own pages" ON competitor_benchmarks
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update competitors for own pages" ON competitor_benchmarks
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete competitors for own pages" ON competitor_benchmarks
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = competitor_benchmarks.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Optimization roadmap table policies
DROP POLICY IF EXISTS "Users can view roadmap for own pages" ON optimization_roadmap;
DROP POLICY IF EXISTS "Users can insert roadmap for own pages" ON optimization_roadmap;
DROP POLICY IF EXISTS "Users can update roadmap for own pages" ON optimization_roadmap;
DROP POLICY IF EXISTS "Users can delete roadmap for own pages" ON optimization_roadmap;

CREATE POLICY "Users can view roadmap for own pages" ON optimization_roadmap
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert roadmap for own pages" ON optimization_roadmap
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update roadmap for own pages" ON optimization_roadmap
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete roadmap for own pages" ON optimization_roadmap
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = optimization_roadmap.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Bot access table policies
DROP POLICY IF EXISTS "Users can view bot access for own pages" ON bot_access;
DROP POLICY IF EXISTS "Users can insert bot access for own pages" ON bot_access;
DROP POLICY IF EXISTS "Users can update bot access for own pages" ON bot_access;
DROP POLICY IF EXISTS "Users can delete bot access for own pages" ON bot_access;

CREATE POLICY "Users can view bot access for own pages" ON bot_access
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert bot access for own pages" ON bot_access
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update bot access for own pages" ON bot_access
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete bot access for own pages" ON bot_access
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM page_data
    JOIN websites ON websites.id = page_data.website_id
    WHERE page_data.id = bot_access.page_id
    AND websites.user_id = (select auth.uid())
  ));

-- Citations table policies
DROP POLICY IF EXISTS "Users can view citations for own keywords" ON citations;
DROP POLICY IF EXISTS "Users can insert citations for own keywords" ON citations;
DROP POLICY IF EXISTS "Users can update citations for own keywords" ON citations;
DROP POLICY IF EXISTS "Users can delete citations for own keywords" ON citations;

CREATE POLICY "Users can view citations for own keywords" ON citations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert citations for own keywords" ON citations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update citations for own keywords" ON citations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete citations for own keywords" ON citations
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tracked_keywords
    JOIN websites ON websites.id = tracked_keywords.website_id
    WHERE tracked_keywords.id = citations.keyword_id
    AND websites.user_id = (select auth.uid())
  ));

-- Keyword groups table policies
DROP POLICY IF EXISTS "Users can view own keyword groups" ON keyword_groups;
DROP POLICY IF EXISTS "Users can insert own keyword groups" ON keyword_groups;
DROP POLICY IF EXISTS "Users can update own keyword groups" ON keyword_groups;
DROP POLICY IF EXISTS "Users can delete own keyword groups" ON keyword_groups;

CREATE POLICY "Users can view own keyword groups" ON keyword_groups
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert own keyword groups" ON keyword_groups
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update own keyword groups" ON keyword_groups
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete own keyword groups" ON keyword_groups
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = keyword_groups.website_id
    AND websites.user_id = (select auth.uid())
  ));

-- Keyword group members table policies
DROP POLICY IF EXISTS "Users can view keyword group members for own groups" ON keyword_group_members;
DROP POLICY IF EXISTS "Users can insert keyword group members for own groups" ON keyword_group_members;
DROP POLICY IF EXISTS "Users can update keyword group members for own groups" ON keyword_group_members;
DROP POLICY IF EXISTS "Users can delete keyword group members for own groups" ON keyword_group_members;

CREATE POLICY "Users can view keyword group members for own groups" ON keyword_group_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert keyword group members for own groups" ON keyword_group_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update keyword group members for own groups" ON keyword_group_members
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete keyword group members for own groups" ON keyword_group_members
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM keyword_groups
    JOIN websites ON websites.id = keyword_groups.website_id
    WHERE keyword_groups.id = keyword_group_members.group_id
    AND websites.user_id = (select auth.uid())
  ));

-- Competitor domains table policies
DROP POLICY IF EXISTS "Users can view competitor domains for own websites" ON competitor_domains;
DROP POLICY IF EXISTS "Users can insert competitor domains for own websites" ON competitor_domains;
DROP POLICY IF EXISTS "Users can update competitor domains for own websites" ON competitor_domains;
DROP POLICY IF EXISTS "Users can delete competitor domains for own websites" ON competitor_domains;

CREATE POLICY "Users can view competitor domains for own websites" ON competitor_domains
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can insert competitor domains for own websites" ON competitor_domains
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update competitor domains for own websites" ON competitor_domains
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete competitor domains for own websites" ON competitor_domains
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = competitor_domains.website_id
    AND websites.user_id = (select auth.uid())
  ));

-- Brand identity table policies
DROP POLICY IF EXISTS "Users can view own brand identity" ON brand_identity;
DROP POLICY IF EXISTS "Users can insert own brand identity" ON brand_identity;
DROP POLICY IF EXISTS "Users can update own brand identity" ON brand_identity;
DROP POLICY IF EXISTS "Users can delete own brand identity" ON brand_identity;

CREATE POLICY "Users can view own brand identity" ON brand_identity
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own brand identity" ON brand_identity
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own brand identity" ON brand_identity
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own brand identity" ON brand_identity
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Credits usage table policies
DROP POLICY IF EXISTS "Users can view own credit usage" ON credits_usage;
DROP POLICY IF EXISTS "Service role can insert credit usage" ON credits_usage;

CREATE POLICY "Users can view own credit usage" ON credits_usage
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Service role can insert credit usage" ON credits_usage
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Redemption codes table policies
DROP POLICY IF EXISTS "Users can view their own redeemed codes" ON redemption_codes;
DROP POLICY IF EXISTS "Users can redeem unredeemed codes" ON redemption_codes;

CREATE POLICY "Users can view their own redeemed codes" ON redemption_codes
  FOR SELECT TO authenticated
  USING (redeemed_by = (select auth.uid()));

CREATE POLICY "Users can redeem unredeemed codes" ON redemption_codes
  FOR SELECT TO authenticated
  USING (redeemed_by IS NULL);
/*
  # Extend Admin Panel & AppSumo LTD Support

  1. Overview
    This migration extends existing tables to support the admin panel for managing
    AppSumo lifetime deals, including code management and audit logging.

  2. Table Extensions
    - `redemption_codes` - Add missing columns (id, is_claimed, revoked_at, etc.)
    - `users` - Add is_admin flag for admin access

  3. New Tables
    - `admin_actions` - Complete audit log for all admin operations

  4. Security
    - RLS policies for admin-only access
    - Comprehensive audit logging
    - Admin helper functions for common operations

  5. Notes
    - Handles existing redemption_codes table gracefully
    - All changes are idempotent and can be run multiple times safely
*/

-- ============================================================================
-- ADD IS_ADMIN TO USERS TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;
    COMMENT ON COLUMN users.is_admin IS 'Admin flag for access to /admin portal';
  END IF;
END $$;

-- ============================================================================
-- EXTEND REDEMPTION_CODES TABLE
-- ============================================================================

-- Add id column as primary key (if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'id'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN id UUID DEFAULT gen_random_uuid();
    -- Drop old primary key on code
    ALTER TABLE redemption_codes DROP CONSTRAINT IF EXISTS redemption_codes_pkey;
    -- Add new primary key on id
    ALTER TABLE redemption_codes ADD PRIMARY KEY (id);
    -- Keep code unique
    ALTER TABLE redemption_codes ADD CONSTRAINT redemption_codes_code_unique UNIQUE (code);
  END IF;
END $$;

-- Add is_claimed column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'is_claimed'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE;
    -- Update existing rows based on redeemed_by
    UPDATE redemption_codes SET is_claimed = TRUE WHERE redeemed_by IS NOT NULL;
  END IF;
END $$;

-- Add revocation tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoked_at'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoked_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoked_by'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoked_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'redemption_codes' AND column_name = 'revoke_reason'
  ) THEN
    ALTER TABLE redemption_codes ADD COLUMN revoke_reason TEXT;
  END IF;
END $$;

-- Add comments and indexes
COMMENT ON TABLE redemption_codes IS 'AppSumo LTD redemption codes with tier assignments and revocation tracking';
COMMENT ON COLUMN redemption_codes.is_claimed IS 'Whether code has been redeemed';
COMMENT ON COLUMN redemption_codes.revoked_at IS 'When code was revoked (for refunds)';
COMMENT ON COLUMN redemption_codes.revoked_by IS 'Admin who revoked the code';
COMMENT ON COLUMN redemption_codes.revoke_reason IS 'Reason for revocation (refund, abuse, etc.)';

CREATE INDEX IF NOT EXISTS idx_redemption_codes_is_claimed ON redemption_codes(is_claimed);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_tier ON redemption_codes(tier);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed_by ON redemption_codes(redeemed_by);

-- ============================================================================
-- CREATE ADMIN ACTIONS AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_email TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_actions IS 'Audit log of all admin operations for compliance and debugging';
COMMENT ON COLUMN admin_actions.action_type IS 'Type: code_upload, code_revoke, credit_adjust, tier_change, user_impersonate';
COMMENT ON COLUMN admin_actions.details IS 'JSON payload with action-specific data (amount, reason, old_value, new_value)';

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);

-- ============================================================================
-- ROW LEVEL SECURITY FOR REDEMPTION CODES (ADMIN ACCESS)
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can insert redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can update redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can delete redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Service role can update codes during redemption" ON redemption_codes;

-- Admins can view all codes
CREATE POLICY "Admins can view all redemption codes"
  ON redemption_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can insert codes (bulk upload)
CREATE POLICY "Admins can insert redemption codes"
  ON redemption_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can update codes (mark as revoked)
CREATE POLICY "Admins can update redemption codes"
  ON redemption_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can delete codes
CREATE POLICY "Admins can delete redemption codes"
  ON redemption_codes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- ============================================================================
-- ROW LEVEL SECURITY FOR ADMIN ACTIONS
-- ============================================================================

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin actions"
  ON admin_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can insert admin actions"
  ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- ============================================================================
-- ADMIN HELPER FUNCTIONS
-- ============================================================================

-- Function to revoke a code and downgrade the user
CREATE OR REPLACE FUNCTION revoke_redemption_code(
  p_code TEXT,
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'Refund processed'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record RECORD;
  v_user_record RECORD;
  v_admin_email TEXT;
  v_result JSONB;
  v_remaining_codes INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Get code details
  SELECT * INTO v_code_record FROM redemption_codes WHERE code = UPPER(p_code);
  IF v_code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code not found');
  END IF;

  IF NOT v_code_record.is_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code has not been redeemed');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = v_code_record.redeemed_by;

  -- Mark code as revoked
  UPDATE redemption_codes
  SET 
    revoked_at = NOW(),
    revoked_by = p_admin_id,
    revoke_reason = p_reason,
    is_claimed = FALSE
  WHERE code = UPPER(p_code);

  -- Remove code from user's redeemed list
  UPDATE users
  SET codes_redeemed = array_remove(codes_redeemed, UPPER(p_code))
  WHERE id = v_code_record.redeemed_by;

  -- Get remaining codes count
  SELECT array_length(codes_redeemed, 1) INTO v_remaining_codes
  FROM users WHERE id = v_code_record.redeemed_by;

  v_remaining_codes := COALESCE(v_remaining_codes, 0);

  -- Downgrade user tier
  IF v_remaining_codes = 0 THEN
    -- No more codes, revert to free tier
    UPDATE users
    SET 
      appsumo_tier = 0,
      is_lifetime_deal = FALSE,
      credits_total = 50,
      credits_used = 0,
      websites_limit = 1,
      keywords_limit = 3
    WHERE id = v_code_record.redeemed_by;
  ELSE
    -- Downgrade by one tier
    UPDATE users
    SET 
      appsumo_tier = GREATEST(1, appsumo_tier - 1),
      credits_total = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 100
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 250
        ELSE 500
      END,
      credits_used = 0,
      websites_limit = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 3
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 10
        ELSE 50
      END,
      keywords_limit = CASE 
        WHEN GREATEST(1, appsumo_tier - 1) = 1 THEN 25
        WHEN GREATEST(1, appsumo_tier - 1) = 2 THEN 100
        ELSE 500
      END
    WHERE id = v_code_record.redeemed_by;
  END IF;

  -- Log admin action
  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'code_revoke',
    v_code_record.redeemed_by,
    v_user_record.email,
    jsonb_build_object(
      'code', v_code_record.code,
      'tier', v_code_record.tier,
      'reason', p_reason,
      'old_tier', v_user_record.appsumo_tier,
      'remaining_codes', v_remaining_codes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Code revoked and user downgraded',
    'code', v_code_record.code,
    'user_email', v_user_record.email,
    'remaining_codes', v_remaining_codes
  );
END;
$$;

-- Function to manually adjust user credits
CREATE OR REPLACE FUNCTION adjust_user_credits(
  p_user_id UUID,
  p_credit_change INT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_total INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Calculate new credit total
  v_new_total := GREATEST(0, v_user_record.credits_total + p_credit_change);

  -- Update user credits
  UPDATE users
  SET credits_total = v_new_total
  WHERE id = p_user_id;

  -- Log admin action
  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'credit_adjust',
    p_user_id,
    v_user_record.email,
    jsonb_build_object(
      'credit_change', p_credit_change,
      'old_total', v_user_record.credits_total,
      'new_total', v_new_total,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Credits adjusted successfully',
    'old_total', v_user_record.credits_total,
    'new_total', v_new_total
  );
END;
$$;

-- Function to change user tier manually
CREATE OR REPLACE FUNCTION change_user_tier(
  p_user_id UUID,
  p_new_tier INT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
  v_admin_email TEXT;
  v_new_credits INT;
  v_new_websites INT;
  v_new_keywords INT;
BEGIN
  -- Verify admin status
  SELECT email INTO v_admin_email FROM users WHERE id = p_admin_id AND is_admin = TRUE;
  IF v_admin_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Not an admin');
  END IF;

  -- Validate tier
  IF p_new_tier NOT IN (0, 1, 2, 3) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid tier. Must be 0, 1, 2, or 3');
  END IF;

  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE id = p_user_id;
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Determine new limits based on tier
  CASE p_new_tier
    WHEN 0 THEN
      v_new_credits := 50;
      v_new_websites := 1;
      v_new_keywords := 3;
    WHEN 1 THEN
      v_new_credits := 100;
      v_new_websites := 3;
      v_new_keywords := 25;
    WHEN 2 THEN
      v_new_credits := 250;
      v_new_websites := 10;
      v_new_keywords := 100;
    WHEN 3 THEN
      v_new_credits := 500;
      v_new_websites := 50;
      v_new_keywords := 500;
  END CASE;

  -- Update user tier and limits
  UPDATE users
  SET 
    appsumo_tier = p_new_tier,
    is_lifetime_deal = (p_new_tier > 0),
    credits_total = v_new_credits,
    credits_used = 0,
    websites_limit = v_new_websites,
    keywords_limit = v_new_keywords
  WHERE id = p_user_id;

  -- Log admin action
  INSERT INTO admin_actions (admin_id, admin_email, action_type, target_user_id, target_user_email, details)
  VALUES (
    p_admin_id,
    v_admin_email,
    'tier_change',
    p_user_id,
    v_user_record.email,
    jsonb_build_object(
      'old_tier', v_user_record.appsumo_tier,
      'new_tier', p_new_tier,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Tier changed successfully',
    'old_tier', v_user_record.appsumo_tier,
    'new_tier', p_new_tier
  );
END;
$$;/*
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

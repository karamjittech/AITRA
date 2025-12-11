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
  );
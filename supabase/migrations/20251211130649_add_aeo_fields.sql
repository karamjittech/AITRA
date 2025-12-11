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

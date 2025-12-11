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

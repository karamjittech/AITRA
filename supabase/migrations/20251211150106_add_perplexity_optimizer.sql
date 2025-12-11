/*
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
  ON page_data(has_comparative_paragraphs, perplexity_table_recommendation);
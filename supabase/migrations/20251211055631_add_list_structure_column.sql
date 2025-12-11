/*
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

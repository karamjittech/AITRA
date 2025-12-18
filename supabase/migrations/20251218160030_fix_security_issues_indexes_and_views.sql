/*
  # Fix Security Issues - Indexes and Views

  ## Changes
  
  ### 1. Add Missing Foreign Key Indexes
  Add covering indexes for all foreign keys to improve query performance:
  - admin_actions: admin_id, target_user_id
  - citations: keyword_id, snapshot_id
  - competitor_benchmarks: page_id
  - credits_usage: user_id
  - keyword_group_members: keyword_id
  - keyword_groups: website_id
  - payment_history: user_id
  - perplexity_optimizer_analytics: page_id
  - redemption_codes: redeemed_by
  - scores: page_id
  - serp_snapshots: keyword_id
  - tracked_keywords: parent_id, parent_keyword_id

  ### 2. Remove Unused Index
  Drop idx_redemption_codes_revoked_by as it's not being used

  ### 3. Fix Security Definer View
  Recreate citation_reputation_stats_secure without SECURITY DEFINER
  and rely on RLS policies instead

  ### 4. Performance Notes
  - All indexes use IF NOT EXISTS to prevent errors
  - Indexes improve JOIN performance and foreign key constraint checks
  - Composite indexes added for common query patterns
  - Removed SECURITY DEFINER in favor of standard view with RLS
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- admin_actions indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id 
  ON public.admin_actions(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id 
  ON public.admin_actions(target_user_id);

-- citations indexes
CREATE INDEX IF NOT EXISTS idx_citations_keyword_id 
  ON public.citations(keyword_id);

CREATE INDEX IF NOT EXISTS idx_citations_snapshot_id 
  ON public.citations(snapshot_id);

-- competitor_benchmarks indexes
CREATE INDEX IF NOT EXISTS idx_competitor_benchmarks_page_id 
  ON public.competitor_benchmarks(page_id);

-- credits_usage indexes
CREATE INDEX IF NOT EXISTS idx_credits_usage_user_id 
  ON public.credits_usage(user_id);

-- keyword_group_members indexes
CREATE INDEX IF NOT EXISTS idx_keyword_group_members_keyword_id 
  ON public.keyword_group_members(keyword_id);

-- keyword_groups indexes
CREATE INDEX IF NOT EXISTS idx_keyword_groups_website_id 
  ON public.keyword_groups(website_id);

-- payment_history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id 
  ON public.payment_history(user_id);

-- perplexity_optimizer_analytics indexes
CREATE INDEX IF NOT EXISTS idx_perplexity_optimizer_analytics_page_id 
  ON public.perplexity_optimizer_analytics(page_id);

-- redemption_codes indexes
CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed_by 
  ON public.redemption_codes(redeemed_by);

-- scores indexes
CREATE INDEX IF NOT EXISTS idx_scores_page_id 
  ON public.scores(page_id);

-- serp_snapshots indexes
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_keyword_id 
  ON public.serp_snapshots(keyword_id);

-- tracked_keywords indexes
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_parent_id 
  ON public.tracked_keywords(parent_id);

CREATE INDEX IF NOT EXISTS idx_tracked_keywords_parent_keyword_id 
  ON public.tracked_keywords(parent_keyword_id);

-- =====================================================
-- 2. REMOVE UNUSED INDEX
-- =====================================================

-- Drop unused index on redemption_codes.revoked_by
DROP INDEX IF EXISTS public.idx_redemption_codes_revoked_by;

-- =====================================================
-- 3. FIX SECURITY DEFINER VIEW
-- =====================================================

-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.citation_reputation_stats_secure;

-- Recreate without SECURITY DEFINER
-- This view now relies on RLS policies on underlying tables for security
CREATE VIEW public.citation_reputation_stats_secure AS
SELECT 
  website_id,
  total_citations,
  positive_count,
  neutral_count,
  negative_count,
  broken_links_count,
  hallucinated_count,
  critical_issues_count,
  avg_sentiment_score
FROM citation_reputation_stats
WHERE EXISTS (
  SELECT 1 
  FROM websites w 
  WHERE w.id = citation_reputation_stats.website_id 
  AND w.user_id = auth.uid()
);

-- Grant usage to authenticated users
GRANT SELECT ON public.citation_reputation_stats_secure TO authenticated;

-- =====================================================
-- 4. ADD COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Add composite indexes for frequently queried combinations
-- These improve performance for JOIN operations

-- citations: often filtered by keyword_id and platform
CREATE INDEX IF NOT EXISTS idx_citations_keyword_platform 
  ON public.citations(keyword_id, platform);

-- citations: often need to find user's citations with specific sentiment
CREATE INDEX IF NOT EXISTS idx_citations_keyword_sentiment 
  ON public.citations(keyword_id, sentiment);

-- citations: link verification queries
CREATE INDEX IF NOT EXISTS idx_citations_link_status 
  ON public.citations(link_status) 
  WHERE link_status IS NOT NULL;

-- citations: find citations requiring action
CREATE INDEX IF NOT EXISTS idx_citations_requires_action 
  ON public.citations(keyword_id, requires_action, action_taken) 
  WHERE requires_action = true;

-- credits_usage: often filtered by user_id and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_credits_usage_user_created 
  ON public.credits_usage(user_id, created_at DESC);

-- serp_snapshots: often filtered by keyword_id and ordered by snapshot_date
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_keyword_date 
  ON public.serp_snapshots(keyword_id, snapshot_date DESC);

-- admin_actions: often filtered by admin_id and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_created 
  ON public.admin_actions(admin_id, created_at DESC);

-- payment_history: often filtered by user_id and ordered by created_at
CREATE INDEX IF NOT EXISTS idx_payment_history_user_created 
  ON public.payment_history(user_id, created_at DESC);

-- tracked_keywords: often need to find keywords by website
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_website_created 
  ON public.tracked_keywords(website_id, created_at DESC);

-- =====================================================
-- 5. ADD INDEXES FOR REDEMPTION CODES QUERIES
-- =====================================================

-- redemption_codes: often queried by code value for active unclaimed codes
CREATE INDEX IF NOT EXISTS idx_redemption_codes_code_active 
  ON public.redemption_codes(code) 
  WHERE is_claimed = false AND revoked_at IS NULL;

-- redemption_codes: admin queries for codes by tier and status
CREATE INDEX IF NOT EXISTS idx_redemption_codes_tier_status 
  ON public.redemption_codes(tier, is_claimed, expires_at)
  WHERE revoked_at IS NULL;

-- redemption_codes: find codes redeemed by user
CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed_at 
  ON public.redemption_codes(redeemed_by, redeemed_at DESC)
  WHERE redeemed_by IS NOT NULL;

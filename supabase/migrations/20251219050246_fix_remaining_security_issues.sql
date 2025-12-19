/*
  # Fix Remaining Security Issues

  ## Changes
  
  ### 1. Add Missing Foreign Key Index
  Add index for redemption_codes.revoked_by foreign key
  
  ### 2. Remove Unused Composite Indexes
  Drop composite indexes that aren't being used to reduce index maintenance overhead
  Keep only the essential single-column foreign key indexes
  
  ### 3. Re-fix Security Definer View
  Drop and recreate the view without SECURITY DEFINER property
  
  ### 4. Notes
  - Foreign key indexes are kept even if "unused" - they're needed for JOIN performance
  - Composite indexes removed as they're not currently being utilized
  - View security now enforced through RLS on underlying tables
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEX
-- =====================================================

-- Add index for redemption_codes.revoked_by
CREATE INDEX IF NOT EXISTS idx_redemption_codes_revoked_by 
  ON public.redemption_codes(revoked_by);

-- =====================================================
-- 2. REMOVE UNUSED COMPOSITE INDEXES
-- =====================================================

-- These composite indexes were created speculatively but aren't being used
-- Dropping them reduces index maintenance overhead

DROP INDEX IF EXISTS public.idx_citations_link_status;
DROP INDEX IF EXISTS public.idx_citations_keyword_platform;
DROP INDEX IF EXISTS public.idx_citations_keyword_sentiment;
DROP INDEX IF EXISTS public.idx_citations_requires_action;
DROP INDEX IF EXISTS public.idx_credits_usage_user_created;
DROP INDEX IF EXISTS public.idx_serp_snapshots_keyword_date;
DROP INDEX IF EXISTS public.idx_admin_actions_admin_created;
DROP INDEX IF EXISTS public.idx_payment_history_user_created;
DROP INDEX IF EXISTS public.idx_tracked_keywords_website_created;
DROP INDEX IF EXISTS public.idx_redemption_codes_code_active;
DROP INDEX IF EXISTS public.idx_redemption_codes_tier_status;
DROP INDEX IF EXISTS public.idx_redemption_codes_redeemed_at;

-- =====================================================
-- 3. FIX SECURITY DEFINER VIEW (AGAIN)
-- =====================================================

-- Check if view still has SECURITY DEFINER and fix it
DO $$
BEGIN
  -- Drop the view completely
  DROP VIEW IF EXISTS public.citation_reputation_stats_secure;
  
  -- Recreate as a simple view without any security definer
  -- Security is enforced through RLS on underlying tables
  EXECUTE '
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
    )';
  
  -- Ensure view uses SECURITY INVOKER (not DEFINER)
  -- This makes the view execute with the permissions of the calling user
  ALTER VIEW public.citation_reputation_stats_secure SET (security_invoker = on);
  
  -- Grant select to authenticated users
  GRANT SELECT ON public.citation_reputation_stats_secure TO authenticated;
END $$;

-- =====================================================
-- 4. VERIFY ESSENTIAL FOREIGN KEY INDEXES EXIST
-- =====================================================

-- These indexes are essential for foreign key performance
-- Even if marked as "unused", they improve JOIN and DELETE performance

-- Ensure all critical foreign key indexes exist
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id 
  ON public.admin_actions(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id 
  ON public.admin_actions(target_user_id);

CREATE INDEX IF NOT EXISTS idx_citations_keyword_id 
  ON public.citations(keyword_id);

CREATE INDEX IF NOT EXISTS idx_citations_snapshot_id 
  ON public.citations(snapshot_id);

CREATE INDEX IF NOT EXISTS idx_competitor_benchmarks_page_id 
  ON public.competitor_benchmarks(page_id);

CREATE INDEX IF NOT EXISTS idx_credits_usage_user_id 
  ON public.credits_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_keyword_group_members_keyword_id 
  ON public.keyword_group_members(keyword_id);

CREATE INDEX IF NOT EXISTS idx_keyword_groups_website_id 
  ON public.keyword_groups(website_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id 
  ON public.payment_history(user_id);

CREATE INDEX IF NOT EXISTS idx_perplexity_optimizer_analytics_page_id 
  ON public.perplexity_optimizer_analytics(page_id);

CREATE INDEX IF NOT EXISTS idx_redemption_codes_redeemed_by 
  ON public.redemption_codes(redeemed_by);

CREATE INDEX IF NOT EXISTS idx_scores_page_id 
  ON public.scores(page_id);

CREATE INDEX IF NOT EXISTS idx_serp_snapshots_keyword_id 
  ON public.serp_snapshots(keyword_id);

CREATE INDEX IF NOT EXISTS idx_tracked_keywords_parent_id 
  ON public.tracked_keywords(parent_id);

CREATE INDEX IF NOT EXISTS idx_tracked_keywords_parent_keyword_id 
  ON public.tracked_keywords(parent_keyword_id);

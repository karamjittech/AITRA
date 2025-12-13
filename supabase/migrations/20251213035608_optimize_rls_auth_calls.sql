/*
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

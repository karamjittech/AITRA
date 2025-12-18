/*
  # Security Fixes Part 2 - Policies and Indexes

  - Add missing indexes
  - Optimize RLS policies
  - Secure materialized view
  - Drop unused indexes
*/

-- =====================================================
-- 1. ADD MISSING INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_redemption_codes_revoked_by 
  ON redemption_codes(revoked_by) 
  WHERE revoked_by IS NOT NULL;

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES
-- =====================================================

-- Redemption codes policies
DROP POLICY IF EXISTS "Admins can view all redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can insert redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can update redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Admins can delete redemption codes" ON redemption_codes;
DROP POLICY IF EXISTS "Users can redeem unredeemed codes" ON redemption_codes;
DROP POLICY IF EXISTS "Users can view their own redeemed codes" ON redemption_codes;

CREATE POLICY "Users can view relevant redemption codes"
  ON redemption_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
    OR
    (redeemed_by IS NULL AND revoked_at IS NULL)
    OR
    redeemed_by = (select auth.uid())
  );

CREATE POLICY "Admins can insert redemption codes"
  ON redemption_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update redemption codes"
  ON redemption_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete redemption codes"
  ON redemption_codes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

-- Admin actions policies
DROP POLICY IF EXISTS "Admins can view all admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON admin_actions;

CREATE POLICY "Admins can view all admin actions"
  ON admin_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can insert admin actions"
  ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.is_admin = true
    )
  );

-- Payment history policy
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;

CREATE POLICY "Users can view own payment history"
  ON payment_history
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 3. SECURE MATERIALIZED VIEW
-- =====================================================

REVOKE ALL ON citation_reputation_stats FROM anon, authenticated;

CREATE OR REPLACE VIEW citation_reputation_stats_secure AS
SELECT * FROM citation_reputation_stats
WHERE EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid()
);

GRANT SELECT ON citation_reputation_stats_secure TO authenticated;

-- =====================================================
-- 4. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_scores_page_id;
DROP INDEX IF EXISTS idx_page_data_comparative;
DROP INDEX IF EXISTS idx_competitor_domains_website_id;
DROP INDEX IF EXISTS idx_competitor_domains_domain;
DROP INDEX IF EXISTS idx_competitor_domains_sov;
DROP INDEX IF EXISTS idx_competitor_domains_last_seen;
DROP INDEX IF EXISTS idx_competitor_domains_verified;
DROP INDEX IF EXISTS idx_payment_history_user_id;
DROP INDEX IF EXISTS idx_payment_history_transaction_id;
DROP INDEX IF EXISTS idx_payment_history_subscription_id;
DROP INDEX IF EXISTS idx_payment_history_created_at;
DROP INDEX IF EXISTS idx_websites_user_id;
DROP INDEX IF EXISTS idx_gsc_metrics_website_date;
DROP INDEX IF EXISTS idx_tracked_keywords_website_id;
DROP INDEX IF EXISTS idx_tracked_keywords_parent;
DROP INDEX IF EXISTS idx_tracked_keywords_parent_id;
DROP INDEX IF EXISTS idx_tracked_keywords_intent_category;
DROP INDEX IF EXISTS idx_tracked_keywords_is_fan_out;
DROP INDEX IF EXISTS idx_serp_snapshots_keyword_id;
DROP INDEX IF EXISTS idx_serp_snapshots_date;
DROP INDEX IF EXISTS idx_serp_snapshots_platform;
DROP INDEX IF EXISTS idx_serp_snapshots_sentiment;
DROP INDEX IF EXISTS idx_serp_snapshots_all_cited_domains;
DROP INDEX IF EXISTS idx_serp_snapshots_competitor_leaderboard;
DROP INDEX IF EXISTS idx_platform_scores_page_id;
DROP INDEX IF EXISTS idx_platform_scores_calculated_at;
DROP INDEX IF EXISTS idx_keyword_groups_website_id;
DROP INDEX IF EXISTS idx_keyword_group_members_group_id;
DROP INDEX IF EXISTS idx_keyword_group_members_keyword_id;
DROP INDEX IF EXISTS idx_competitor_benchmarks_page_id;
DROP INDEX IF EXISTS idx_competitor_benchmarks_created;
DROP INDEX IF EXISTS idx_brand_identity_user_id;
DROP INDEX IF EXISTS idx_brand_identity_eeat_score;
DROP INDEX IF EXISTS idx_brand_identity_same_as_links;
DROP INDEX IF EXISTS idx_brand_identity_knows_about;
DROP INDEX IF EXISTS idx_perplexity_analytics_page_id;
DROP INDEX IF EXISTS idx_admin_actions_admin_id;
DROP INDEX IF EXISTS idx_admin_actions_target_user;
DROP INDEX IF EXISTS idx_admin_actions_created_at;
DROP INDEX IF EXISTS idx_admin_actions_action_type;
DROP INDEX IF EXISTS idx_bot_access_page_id;
DROP INDEX IF EXISTS idx_bot_access_page_blocked;
DROP INDEX IF EXISTS idx_users_is_admin;
DROP INDEX IF EXISTS idx_credits_usage_user_id;
DROP INDEX IF EXISTS idx_credits_usage_created_at;
DROP INDEX IF EXISTS idx_credits_usage_user_date;
DROP INDEX IF EXISTS idx_citations_keyword_id;
DROP INDEX IF EXISTS idx_citations_snapshot_id;
DROP INDEX IF EXISTS idx_citations_platform;
DROP INDEX IF EXISTS idx_citations_created_at;
DROP INDEX IF EXISTS idx_citations_sentiment_analyzed;
DROP INDEX IF EXISTS idx_citations_requires_action;
DROP INDEX IF EXISTS idx_citations_unresolved;
DROP INDEX IF EXISTS idx_citations_link_age;
DROP INDEX IF EXISTS idx_citations_reputation_dashboard;
DROP INDEX IF EXISTS idx_citations_cited_domain;
DROP INDEX IF EXISTS idx_citations_is_user_domain;
DROP INDEX IF EXISTS idx_citations_citation_strength;
DROP INDEX IF EXISTS idx_redemption_codes_tier;
DROP INDEX IF EXISTS idx_redemption_codes_unredeemed;
DROP INDEX IF EXISTS idx_redemption_codes_redeemed_by;
DROP INDEX IF EXISTS idx_redemption_codes_is_claimed;

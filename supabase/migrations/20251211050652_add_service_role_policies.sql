/*
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
  USING (true);
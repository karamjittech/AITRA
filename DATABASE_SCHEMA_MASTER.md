# AI SEO Optimization Tool - Complete Database Schema Master Reference

**Last Updated:** December 16, 2025
**Database:** PostgreSQL (Supabase)
**Purpose:** Research-backed AI search visibility optimization platform

---

## Table of Contents

1. [Overview](#overview)
2. [Core Tables](#core-tables)
3. [Analytics Tables](#analytics-tables)
4. [Competitive Intelligence Tables](#competitive-intelligence-tables)
5. [AI Analysis Tables](#ai-analysis-tables)
6. [Platform-Specific Tables](#platform-specific-tables)
7. [Payment & Subscription Tables](#payment--subscription-tables)
8. [Security & Access Control](#security--access-control)
9. [Helper Functions](#helper-functions)
10. [Indexes & Performance](#indexes--performance)
11. [Research Citations](#research-citations)

---

## Overview

This database schema supports a comprehensive AI SEO optimization tool that:

- **Monitors AI citations** across Google AI Overviews, ChatGPT, Claude, Gemini, and Perplexity
- **Analyzes content** for AI-specific readiness signals (structure, schema, E-E-A-T)
- **Provides platform-specific scoring** based on published research
- **Tracks competitive positioning** and Share of Voice (SOV)
- **Generates one-click fixes** for optimization issues
- **Supports tiered subscriptions** with credit-based usage tracking

### Design Principles

1. **Data Integrity First** - No destructive operations, comprehensive RLS policies
2. **Research-Backed** - Every scoring signal references published studies
3. **Platform-Specific** - Each AI model has unique preference profiles
4. **Competitive Intelligence** - Track competitors and market positioning
5. **Scalable Architecture** - Optimized indexes, JSONB for flexibility

---

## Core Tables

### 1. `users`

Extends Supabase `auth.users` with application-specific data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Google Search Console Integration
  gsc_connected BOOLEAN DEFAULT FALSE,
  gsc_property_url TEXT,

  -- Subscription & Billing
  subscription_plan VARCHAR(20) DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  payment_method VARCHAR(20) DEFAULT 'free', -- 'paddle', 'appsumo', 'free'

  -- Paddle Payment Integration
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT,
  paddle_variant_id TEXT,
  next_bill_date TIMESTAMPTZ,

  -- AppSumo Integration
  is_lifetime_deal BOOLEAN DEFAULT FALSE,
  appsumo_invoice_item_uuid TEXT UNIQUE,
  appsumo_plan_id TEXT,
  tier VARCHAR(20) DEFAULT 'free',

  -- Credit System
  credits_total INT DEFAULT 50,
  credits_used INT DEFAULT 0,
  billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
  billing_cycle_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- Usage Limits
  websites_limit INT DEFAULT 1,
  keywords_limit INT DEFAULT 3
);
```

**Tier Specifications:**

| Tier | Credits | Websites | Keywords | Cost |
|------|---------|----------|----------|------|
| FREE | 50 | 1 | 3 | $0 |
| PRO | 500 | 3 | 50 | $29/mo |
| AGENCY | 2500 | 15 | 250 | $99/mo |

**Credit Costs:**
- Page Analysis: 2 credits
- Platform Score: 1 credit
- Competitive Analysis: 3 credits
- Fix Generation: 1 credit
- Sentiment Analysis: 2 credits
- Share of Voice Calculation: 3 credits

---

### 2. `websites`

Websites being tracked for AI visibility.

```sql
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_scraped TIMESTAMPTZ,
  UNIQUE(user_id, url)
);
```

---

### 3. `tracked_keywords`

Keywords monitored for AI Overview citations.

```sql
CREATE TABLE tracked_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(website_id, keyword)
);
```

---

## Analytics Tables

### 4. `serp_snapshots`

Historical tracking of AI Overviews in search results.

```sql
CREATE TABLE serp_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMPTZ DEFAULT NOW(),

  -- AI Overview Detection
  has_ai_overview BOOLEAN DEFAULT FALSE,
  ai_overview_html TEXT,

  -- Citation Tracking
  cited_domains TEXT[] DEFAULT '{}'::TEXT[],
  your_site_cited BOOLEAN DEFAULT FALSE,
  your_site_position INT,
  estimated_traffic_impact FLOAT DEFAULT 0,

  -- Share of Voice Enhancement
  all_cited_domains JSONB DEFAULT '[]'::JSONB, -- [{domain, position, strength}]
  competitor_leaderboard JSONB DEFAULT '{}'::JSONB, -- {domain: {citations, sov_percent}}
  total_citations_count INT DEFAULT 0
);
```

**Research Backing:**
- "40.58% of AI citations come from Google top 10" (SearchAtlas, 2025)
- "Only 15% of AI citations from outside top 10" (Backlinko, 2025)

---

### 5. `page_data`

Scraped content and metadata from website pages.

```sql
CREATE TABLE page_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  url TEXT,

  -- Basic Metadata
  title TEXT,
  meta_description TEXT,

  -- Structure Analysis
  h1_count INT DEFAULT 0,
  h2_count INT DEFAULT 0,
  h3_count INT DEFAULT 0,
  paragraph_count INT DEFAULT 0,
  avg_paragraph_length FLOAT DEFAULT 0,
  has_list_structure BOOLEAN DEFAULT FALSE,

  -- Schema Detection
  has_faq_schema BOOLEAN DEFAULT FALSE,
  has_howto_schema BOOLEAN DEFAULT FALSE,
  has_article_schema BOOLEAN DEFAULT FALSE,
  has_author_schema BOOLEAN DEFAULT FALSE,
  schema_types TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Content Analysis
  word_count INT DEFAULT 0,
  readability_score FLOAT DEFAULT 0,
  external_link_count INT DEFAULT 0,
  internal_link_count INT DEFAULT 0,

  -- Freshness
  last_updated TIMESTAMPTZ,
  content_age_days INT DEFAULT 0,
  last_scraped TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(website_id, url)
);
```

---

### 6. `scores`

AI readiness scores based on 28 research-backed signals.

```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,

  -- Core Component Scores (0-100 scale)
  structure_score FLOAT DEFAULT 0,        -- Max 30 points
  metadata_score FLOAT DEFAULT 0,         -- Max 25 points
  content_score FLOAT DEFAULT 0,          -- Max 25 points
  citation_pattern_score FLOAT DEFAULT 0, -- Max 20 points
  overall_ai_readiness FLOAT DEFAULT 0,   -- 0-100 overall

  calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Scoring Formula:**
```
AI_Readiness = (Structure × 0.30) + (Metadata × 0.25) +
               (Content × 0.25) + (CitationPattern × 0.20)
```

**Research Backing:**
- "Bullet points boost AIO inclusion by 4.72%" (Surfer SEO, 2025)
- "Sequential steps increase citation likelihood by 5.42%" (Surfer SEO, 2025)
- "Government sources 11.75x more likely cited" (Backlinko, 2025)

---

### 7. `gsc_metrics`

Google Search Console performance data.

```sql
CREATE TABLE gsc_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  keyword TEXT,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  avg_position FLOAT DEFAULT 0,
  data_date DATE,
  UNIQUE(website_id, keyword, data_date)
);
```

---

### 8. `fixes_generated`

AI-generated optimization recommendations.

```sql
CREATE TABLE fixes_generated (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,
  fix_type VARCHAR(50), -- 'schema', 'title', 'description', 'structure'
  fix_title TEXT,
  fix_description TEXT,
  impact_score INT, -- Estimated point gain (0-100)
  schema_json JSONB,
  code_snippet TEXT,
  research_citation TEXT,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fix Types:**
1. **Schema Markup** - Generate JSON-LD for FAQ, HowTo, Article, Author
2. **Content Structure** - Break paragraphs, add bullet points
3. **Metadata Optimization** - Rewrite titles/descriptions for AI clarity
4. **E-E-A-T Enhancement** - Add author credentials, trust signals
5. **Citation Improvement** - Suggest external source links

---

## Competitive Intelligence Tables

### 9. `competitor_benchmarks`

Competitor analysis and comparison data.

```sql
CREATE TABLE competitor_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,

  -- Competitor Identity
  competitor_name TEXT NOT NULL,
  competitor_url TEXT,
  competitor_domain TEXT,

  -- Authority Metrics
  domain_rating INT DEFAULT 0, -- Ahrefs-style DR (0-100)
  backlink_count INT DEFAULT 0,

  -- Content Metrics
  content_length INT DEFAULT 0,
  h1_count INT DEFAULT 0,
  h2_count INT DEFAULT 0,
  schema_present BOOLEAN DEFAULT FALSE,
  freshness_days INT DEFAULT 0,

  -- AI Readiness
  overall_score FLOAT DEFAULT 0,
  google_rank INT,
  ai_citation_percentage FLOAT DEFAULT 0,

  -- Share of Voice
  sov_percentage FLOAT DEFAULT 0,
  co_citation_frequency INT DEFAULT 0,
  platforms_cited TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_seen TIMESTAMPTZ,

  -- Data Quality
  is_mock_data BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Research Backing:**
- "Co-citation analysis reveals competitive positioning" (SearchAtlas, 2025)
- "Platform-specific SOV varies by 23% on average" (Adobe LLM Study, 2025)
- "Share of Voice correlates 0.68 with market perception" (Backlinko, 2025)

---

### 10. `competitor_domains`

Persistent tracking of competitor domains across all citations.

```sql
CREATE TABLE competitor_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Domain Identity
  domain TEXT NOT NULL,
  display_name TEXT NOT NULL,

  -- Citation Metrics
  total_citations INT DEFAULT 0,
  sov_percentage FLOAT DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),

  -- Classification
  is_verified BOOLEAN DEFAULT FALSE, -- User-confirmed competitor
  is_noise BOOLEAN DEFAULT FALSE,    -- Wikipedia, news sites, etc.

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(website_id, domain)
);
```

---

### 11. `optimization_roadmap`

Phase-based optimization tracking for user progress.

```sql
CREATE TABLE optimization_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL UNIQUE REFERENCES page_data(id) ON DELETE CASCADE,

  -- Phase Tracking
  current_phase INT NOT NULL DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 3),

  -- Phase Completion
  phase_1_completed BOOLEAN DEFAULT FALSE, -- Content & Schema
  phase_2_completed BOOLEAN DEFAULT FALSE, -- Authority & Freshness
  phase_3_completed BOOLEAN DEFAULT FALSE, -- AI Optimization

  phase_1_completion_date TIMESTAMPTZ,
  phase_2_completion_date TIMESTAMPTZ,
  phase_3_completion_date TIMESTAMPTZ,

  -- Estimation
  estimated_completion_weeks INT DEFAULT 12,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Phase Strategy:**

| Phase | Focus | Timeline | Expected Rank | AI Citation Rate |
|-------|-------|----------|---------------|------------------|
| 1 | Content & Schema | 2-3 weeks | #40-60 | 0% |
| 2 | Authority & Freshness | 4-8 weeks | #20-30 | 2-5% |
| 3 | AI Optimization | 9-12 weeks | #10-15 | 10-15% |

---

## AI Analysis Tables

### 12. `platform_scores`

Platform-specific AI readiness scores (ChatGPT, Claude, Gemini, Perplexity).

```sql
CREATE TABLE platform_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES page_data(id) ON DELETE CASCADE,

  -- Overall Platform Scores (0-100)
  gemini_score FLOAT NOT NULL DEFAULT 0,
  chatgpt_score FLOAT NOT NULL DEFAULT 0,
  claude_score FLOAT NOT NULL DEFAULT 0,
  perplexity_score FLOAT NOT NULL DEFAULT 0,

  -- Gemini Sub-components
  gemini_schema_component FLOAT NOT NULL DEFAULT 0,
  gemini_mobile_component FLOAT NOT NULL DEFAULT 0,

  -- ChatGPT Sub-components
  chatgpt_structure_component FLOAT NOT NULL DEFAULT 0,
  chatgpt_clarity_component FLOAT NOT NULL DEFAULT 0,

  -- Claude Sub-components
  claude_citation_component FLOAT NOT NULL DEFAULT 0,
  claude_nuance_component FLOAT NOT NULL DEFAULT 0,

  -- Perplexity Sub-components
  perplexity_external_links_component FLOAT NOT NULL DEFAULT 0,
  perplexity_data_component FLOAT NOT NULL DEFAULT 0,

  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, calculated_at)
);
```

**Platform Preferences (Research-Backed):**

#### ChatGPT (33.07% citation rate at #1)
- **Preference Profile:** Clarity-first, conversation-friendly
- **Key Signals:**
  - Clear heading structure (H1-H6 hierarchy)
  - Short paragraphs (<80 words)
  - Recent content (76.4% cited content updated in 30 days)
  - Conversational tone

#### Claude
- **Preference Profile:** Academic-style, balanced arguments
- **Key Signals:**
  - Nuanced arguments
  - Fact-based claims
  - Academic citations
  - Transparent methodology

#### Gemini
- **Preference Profile:** Structured-data obsessed
- **Key Signals:**
  - Schema markup (critical)
  - Mobile-friendly
  - Breadcrumb structure
  - Fast site speed

#### Perplexity (16.1% YouTube citations)
- **Preference Profile:** Source-citation focused, multi-reference
- **Key Signals:**
  - Multiple external links (6-10+)
  - Quote-based formatting
  - Topic depth
  - Video content

---

### 13. `citations`

Individual citations from AI platforms.

```sql
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES tracked_keywords(id) ON DELETE CASCADE,

  -- Citation Details
  platform TEXT NOT NULL, -- 'chatgpt', 'claude', 'gemini', 'perplexity'
  cited_url TEXT,
  cited_domain TEXT,
  citation_text TEXT,
  citation_position INT,

  -- Classification
  is_user_domain BOOLEAN DEFAULT FALSE,
  citation_strength TEXT CHECK (citation_strength IN ('primary', 'supporting', 'mention')),

  -- Context
  query_context TEXT,
  citation_date TIMESTAMPTZ DEFAULT NOW(),

  -- Sentiment
  sentiment_score FLOAT, -- -1 (negative) to +1 (positive)
  sentiment_label TEXT, -- 'positive', 'neutral', 'negative'

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Citation Strength Classification:**
- **Primary:** Featured prominently, main answer source
- **Supporting:** Listed as additional reference
- **Mention:** Referenced in passing

---

### 14. `bot_access_logs`

AI bot crawl verification and access tracking.

```sql
CREATE TABLE bot_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Bot Identity
  bot_name TEXT NOT NULL, -- 'GoogleBot', 'GPTBot', 'PerplexityBot', 'ClaudeBot'
  user_agent TEXT,
  ip_address INET,

  -- Access Details
  accessed_url TEXT,
  response_status INT,
  is_verified BOOLEAN DEFAULT FALSE,

  -- Detection Method
  detection_method TEXT, -- 'user_agent', 'ip_range', 'reverse_dns'

  accessed_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Known AI Bots:**
- **GPTBot** (ChatGPT) - User-Agent: `GPTBot`
- **ClaudeBot** (Claude) - User-Agent: `ClaudeBot`
- **Google-Extended** (Gemini) - User-Agent: `Google-Extended`
- **PerplexityBot** (Perplexity) - User-Agent: `PerplexityBot`

---

### 15. `entity_identity`

Brand identity and E-E-A-T signal tracking.

```sql
CREATE TABLE entity_identity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL UNIQUE REFERENCES websites(id) ON DELETE CASCADE,

  -- Entity Information
  entity_name TEXT,
  entity_type TEXT, -- 'Organization', 'Person', 'Product'

  -- E-E-A-T Signals
  has_about_page BOOLEAN DEFAULT FALSE,
  has_author_bios BOOLEAN DEFAULT FALSE,
  has_contact_info BOOLEAN DEFAULT FALSE,
  has_privacy_policy BOOLEAN DEFAULT FALSE,
  has_terms_of_service BOOLEAN DEFAULT FALSE,

  -- Trust Signals
  ssl_enabled BOOLEAN DEFAULT FALSE,
  has_reviews BOOLEAN DEFAULT FALSE,
  review_count INT DEFAULT 0,
  avg_review_rating FLOAT DEFAULT 0,

  -- Social Presence
  social_profiles JSONB DEFAULT '{}'::JSONB, -- {twitter, linkedin, facebook}

  -- Authority Indicators
  wikipedia_page TEXT,
  knowledge_graph_present BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Research Backing:**
- "Top 25% brands get 10x more citations" (Backlinko, 2025)
- "E-E-A-T signals correlate 0.52 with AI citations" (SearchAtlas, 2025)

---

### 16. `trust_signals_checklist`

Comprehensive checklist of trust and authority signals.

```sql
CREATE TABLE trust_signals_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL UNIQUE REFERENCES websites(id) ON DELETE CASCADE,

  -- Content Trust Signals
  has_author_attribution BOOLEAN DEFAULT FALSE,
  has_publication_dates BOOLEAN DEFAULT FALSE,
  has_editorial_policy BOOLEAN DEFAULT FALSE,
  has_fact_checking_disclosure BOOLEAN DEFAULT FALSE,

  -- Technical Trust Signals
  has_secure_connection BOOLEAN DEFAULT FALSE,
  has_valid_ssl_cert BOOLEAN DEFAULT FALSE,
  has_mobile_optimization BOOLEAN DEFAULT FALSE,

  -- Business Trust Signals
  has_physical_address BOOLEAN DEFAULT FALSE,
  has_business_registration BOOLEAN DEFAULT FALSE,
  has_customer_service_info BOOLEAN DEFAULT FALSE,

  -- Social Proof
  has_testimonials BOOLEAN DEFAULT FALSE,
  has_case_studies BOOLEAN DEFAULT FALSE,
  has_media_mentions BOOLEAN DEFAULT FALSE,

  -- Transparency Signals
  has_pricing_transparency BOOLEAN DEFAULT FALSE,
  has_refund_policy BOOLEAN DEFAULT FALSE,
  has_shipping_policy BOOLEAN DEFAULT FALSE,

  completion_percentage FLOAT DEFAULT 0,
  last_checked TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 17. `aeo_analysis`

Answer Engine Optimization (AEO) specific analysis.

```sql
CREATE TABLE aeo_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES page_data(id) ON DELETE CASCADE,

  -- AEO Scores
  answer_density_score FLOAT DEFAULT 0, -- How well content answers questions
  featured_snippet_potential FLOAT DEFAULT 0,
  voice_search_readiness FLOAT DEFAULT 0,

  -- Question Detection
  questions_answered INT DEFAULT 0,
  question_types JSONB DEFAULT '[]'::JSONB, -- ['what', 'how', 'why', 'when']

  -- Answer Format
  has_concise_answers BOOLEAN DEFAULT FALSE,
  avg_answer_length INT DEFAULT 0,
  uses_definition_format BOOLEAN DEFAULT FALSE,
  uses_step_by_step BOOLEAN DEFAULT FALSE,

  calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Payment & Subscription Tables

### 18. `payment_history`

Audit log of all Paddle payment events.

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Paddle Transaction Details
  paddle_transaction_id TEXT NOT NULL,
  paddle_subscription_id TEXT,

  -- Payment Details
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50),

  -- Subscription Details
  tier VARCHAR(20),
  event_type VARCHAR(50), -- 'subscription.created', 'payment.succeeded', etc.
  event_data JSONB, -- Full webhook payload

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 19. `credits_usage`

Historical log of credit consumption for analytics.

```sql
CREATE TABLE credits_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Action Details
  action_type TEXT NOT NULL, -- 'sentiment', 'fan_out', 'sov', 'schema', 'eeat'
  credits_consumed INT NOT NULL,

  -- Context
  metadata JSONB DEFAULT '{}'::JSONB, -- {page_url, keyword, platform}

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 20. `redemption_codes`

AppSumo redemption codes for lifetime deals.

```sql
CREATE TABLE redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  tier VARCHAR(20) NOT NULL,
  max_redemptions INT DEFAULT 1,
  redemption_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Security & Access Control

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following policy patterns:

#### User Data Access Pattern
```sql
-- Users can view own records
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert own records
CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own records
CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own records
CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

#### Hierarchical Access Pattern
For tables like `tracked_keywords`, `page_data`, etc. that reference `websites`:

```sql
CREATE POLICY "Users can access data for own websites"
  ON table_name FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = table_name.website_id
      AND websites.user_id = auth.uid()
    )
  );
```

#### Service Role Access
For webhook handlers and background jobs:

```sql
CREATE POLICY "Service role can manage all data"
  ON table_name FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

---

## Helper Functions

### 1. `get_credits_remaining(p_user_id UUID)`

Returns remaining credits for a user.

```sql
CREATE OR REPLACE FUNCTION get_credits_remaining(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INT;
  v_used INT;
BEGIN
  SELECT credits_total, credits_used
  INTO v_total, v_used
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_total, 0) - COALESCE(v_used, 0);
END;
$$;
```

---

### 2. `deduct_credits(p_user_id UUID, p_credits INT, p_action_type TEXT, p_metadata JSONB)`

Deducts credits and logs usage.

```sql
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_credits INT,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INT;
BEGIN
  v_remaining := get_credits_remaining(p_user_id);

  IF v_remaining < p_credits THEN
    RETURN FALSE;
  END IF;

  UPDATE users
  SET credits_used = credits_used + p_credits
  WHERE id = p_user_id;

  INSERT INTO credits_usage (user_id, action_type, credits_consumed, metadata)
  VALUES (p_user_id, p_action_type, p_credits, p_metadata);

  RETURN TRUE;
END;
$$;
```

---

### 3. `normalize_domain(url TEXT)`

Normalizes URLs to consistent domain format.

```sql
CREATE OR REPLACE FUNCTION normalize_domain(url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  -- Remove protocol (http://, https://)
  normalized := regexp_replace(url, '^https?://', '', 'i');

  -- Remove www. prefix
  normalized := regexp_replace(normalized, '^www\.', '', 'i');

  -- Remove path and query params (keep only domain)
  normalized := regexp_replace(normalized, '/.*$', '');

  -- Convert to lowercase
  normalized := lower(normalized);

  RETURN normalized;
END;
$$;
```

**Example Usage:**
```sql
SELECT normalize_domain('https://www.example.com/blog/post?id=123');
-- Returns: 'example.com'
```

---

### 4. `calculate_share_of_voice(p_website_id UUID, p_platform TEXT)`

Calculates Share of Voice percentage for all competing domains.

```sql
CREATE OR REPLACE FUNCTION calculate_share_of_voice(
  p_website_id UUID,
  p_platform TEXT DEFAULT NULL
)
RETURNS TABLE(
  domain TEXT,
  citation_count BIGINT,
  sov_percentage NUMERIC,
  platforms TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH total_citations AS (
    SELECT COUNT(*) as total
    FROM citations c
    JOIN tracked_keywords tk ON tk.id = c.keyword_id
    WHERE tk.website_id = p_website_id
      AND (p_platform IS NULL OR c.platform = p_platform)
      AND c.cited_domain IS NOT NULL
  ),
  domain_citations AS (
    SELECT
      c.cited_domain as domain,
      COUNT(*) as citations,
      array_agg(DISTINCT c.platform) as platforms
    FROM citations c
    JOIN tracked_keywords tk ON tk.id = c.keyword_id
    WHERE tk.website_id = p_website_id
      AND (p_platform IS NULL OR c.platform = p_platform)
      AND c.cited_domain IS NOT NULL
    GROUP BY c.cited_domain
  )
  SELECT
    dc.domain,
    dc.citations,
    CASE
      WHEN tc.total > 0
      THEN ROUND((dc.citations::NUMERIC / tc.total::NUMERIC * 100), 2)
      ELSE 0
    END as sov_percentage,
    dc.platforms
  FROM domain_citations dc
  CROSS JOIN total_citations tc
  ORDER BY dc.citations DESC;
END;
$$;
```

**Example Usage:**
```sql
-- Get SOV for all platforms
SELECT * FROM calculate_share_of_voice('user-website-id');

-- Get SOV for ChatGPT only
SELECT * FROM calculate_share_of_voice('user-website-id', 'chatgpt');
```

---

## Indexes & Performance

### Primary Indexes

All foreign keys have indexes for fast joins:

```sql
-- Users and websites
CREATE INDEX idx_websites_user_id ON websites(user_id);

-- Keywords and tracking
CREATE INDEX idx_tracked_keywords_website_id ON tracked_keywords(website_id);
CREATE INDEX idx_serp_snapshots_keyword_id ON serp_snapshots(keyword_id);
CREATE INDEX idx_serp_snapshots_date ON serp_snapshots(snapshot_date DESC);

-- Page data and analysis
CREATE INDEX idx_page_data_website_id ON page_data(website_id);
CREATE INDEX idx_scores_page_id ON scores(page_id);
CREATE INDEX idx_platform_scores_page_id ON platform_scores(page_id);

-- Citations
CREATE INDEX idx_citations_keyword_id ON citations(keyword_id);
CREATE INDEX idx_citations_cited_domain ON citations(cited_domain);
CREATE INDEX idx_citations_is_user_domain ON citations(is_user_domain);

-- Competitive intelligence
CREATE INDEX idx_competitor_benchmarks_page_id ON competitor_benchmarks(page_id);
CREATE INDEX idx_competitor_domains_website_id ON competitor_domains(website_id);
CREATE INDEX idx_competitor_domains_sov ON competitor_domains(sov_percentage DESC);

-- Payment and credits
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_credits_usage_user_date ON credits_usage(user_id, created_at DESC);

-- GSC metrics
CREATE INDEX idx_gsc_metrics_website_date ON gsc_metrics(website_id, data_date DESC);
```

### JSONB Indexes

For efficient queries on JSONB columns:

```sql
CREATE INDEX idx_serp_snapshots_all_cited_domains
  ON serp_snapshots USING GIN(all_cited_domains);

CREATE INDEX idx_serp_snapshots_competitor_leaderboard
  ON serp_snapshots USING GIN(competitor_leaderboard);
```

### Composite Indexes

For common query patterns:

```sql
-- Time-series queries
CREATE INDEX idx_citations_platform_date
  ON citations(platform, citation_date DESC);

-- User activity tracking
CREATE INDEX idx_credits_usage_user_action
  ON credits_usage(user_id, action_type, created_at DESC);
```

---

## Research Citations

### Core Research Papers Referenced

1. **Surfer SEO Case Study (August 2025)**
   - "Breaking complex content into sequential steps increased likelihood of being cited by 5.42%"
   - "Formatting paragraphs into bullet points boosted AIO inclusion by another 4.72%"

2. **Passionfruit Research (November 2025)**
   - "Content freshness matters: 76.4% of cited content was updated in the last 30 days"
   - "ChatGPT cites content 25.7% fresher than average"

3. **Backlinko Analysis (2025)**
   - "Government sources are 11.75x more likely to be cited"
   - "LLMs reward contextual relevance and diversity over authority"
   - "Response density (not backlinks) determines prominence"
   - "Top 25% brands get 10x more citations"

4. **SearchAtlas Research (2025)**
   - "Competition intensity = strongest predictor of visibility"
   - "40.58% of AI citations come from Google top 10"
   - "Only 15% of AI citations from outside Google top 10"
   - "E-E-A-T signals correlate 0.52 with AI citations"

5. **Adobe LLM Optimizer (2025)**
   - "Citation frequency matters more than position"
   - "Platform-specific SOV varies by 23% on average"

6. **BrightEdge Study (2025)**
   - "Perplexity shows 16.1% YouTube citations"
   - "Multi-source citations preferred by answer engines"

7. **Ahrefs Analysis (2025)**
   - "Citation correlation = 0.37 with external sources"
   - "Domain authority less predictive than content signals"

---

## Database Statistics

| Metric | Value |
|--------|-------|
| **Total Tables** | 20 |
| **Core Tables** | 3 |
| **Analytics Tables** | 5 |
| **Competitive Tables** | 3 |
| **AI Analysis Tables** | 9 |
| **Total Indexes** | 45+ |
| **Helper Functions** | 4 |
| **RLS Policies** | 80+ |

---

## Migration Strategy

### Applying Migrations

All migrations are already applied in chronological order:

1. `20251210142904_initial_schema.sql` - Core tables
2. `20251211050652_add_service_role_policies.sql` - Service role access
3. `20251211052633_create_demo_user.sql` - Demo user setup
4. `20251211055631_add_list_structure_column.sql` - List detection
5. `20251211062507_add_platform_scores.sql` - Platform-specific scoring
6. `20251211081723_add_competitive_analysis.sql` - Competitor tracking
7. `20251211102037_add_bot_access_verification.sql` - Bot access logs
8. `20251211125114_add_entity_identity_tracking.sql` - Entity & E-E-A-T
9. `20251211130649_add_aeo_fields.sql` - AEO analysis
10. `20251211141840_add_sentiment_citation_tracking.sql` - Sentiment analysis
11. `20251211150106_add_perplexity_optimizer.sql` - Perplexity-specific features
12. `20251212050558_add_fan_out_support.sql` - Content expansion recommendations
13. `20251212054650_add_link_verification_and_alerts.sql` - Broken link detection
14. `20251212102107_add_share_of_voice_enhancements.sql` - SOV engine
15. `20251212105341_add_brand_identity_eeat.sql` - Brand identity tracking
16. `20251212110311_add_trust_signals_checklist.sql` - Trust signals
17. `20251212113341_add_tier_limits_and_credits.sql` - Credit system
18. `20251213035608_optimize_rls_auth_calls.sql` - RLS performance
19. `20251213041142_extend_admin_panel_appsumo_support.sql` - Admin panel + AppSumo
20. `20251213100653_20251213_paddle_integration.sql` - Paddle payments

---

## Maintenance Notes

### Data Retention

- **SERP Snapshots:** Retain 90 days of data
- **Citations:** Indefinite retention for trend analysis
- **Credits Usage:** Retain current billing cycle + 12 months
- **Payment History:** Indefinite retention for compliance

### Backup Strategy

- **Frequency:** Daily automated backups
- **Retention:** 30 days point-in-time recovery
- **Testing:** Monthly restore verification

### Performance Monitoring

Monitor these queries for optimization:

1. Share of Voice calculations (complex aggregations)
2. Platform score calculations (multi-table joins)
3. Competitive leaderboard queries (large JSONB operations)
4. Time-series citation trends (date range scans)

---

## Contact & Support

For database schema questions or optimization suggestions, contact the development team.

**Last Schema Update:** December 16, 2025
**Database Version:** PostgreSQL 15.x (Supabase)
**Total Schema Size:** ~20 tables, 80+ policies, 45+ indexes

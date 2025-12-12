# PROJECT CONTEXT: AITRA (AI-Targeted Readiness Analyzer)

**Last Updated:** December 12, 2024
**Version:** 1.0.0
**Status:** MVP Operational

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Current Implementation Status](#current-implementation-status)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [Scoring System](#scoring-system)
6. [Key Design Decisions](#key-design-decisions)
7. [Development Guidelines](#development-guidelines)
8. [Business Logic](#business-logic)
9. [Recent Changes](#recent-changes)
10. [Known Issues](#known-issues)
11. [Future Roadmap](#future-roadmap)

---

## PROJECT OVERVIEW

### What Problem Does AITRA Solve?

AI search engines (ChatGPT, Claude, Gemini, Perplexity) are changing how people find information. Traditional SEO tools focus on Google rankings, but **citation in AI answers = visibility**. AITRA fills this gap by:

1. Analyzing content for AI model preferences
2. Providing platform-specific optimization recommendations
3. Tracking competitive positioning
4. Generating one-click fixes (schema markup, optimization code)

### Market Opportunity

- ClickRank.ai (reference tool) raised funding + 4.9★ rating on AppSumo
- Zero-click searches rising (AI answers = no clicks to traditional results)
- No existing tools comprehensively track AI citation visibility
- $16-83/month market demand proven

### Target Audience

- SEO agencies managing 5-20 client websites
- Ecommerce brands with 50+ product pages
- Content creators/blogs wanting AI search visibility
- Marketing consultants offering AI SEO services

### Core Value Proposition

**"See Which AI Models Read Your Content"**

- Research-backed analysis (28+ signals)
- Platform-specific scoring (ChatGPT, Claude, Gemini, Perplexity)
- One-click optimization fixes
- Competitive gap analysis
- Free, fast, actionable insights in 60 seconds

---

## CURRENT IMPLEMENTATION STATUS

### ✅ Completed Features (MVP)

#### 1. AI Readiness Audit (CORE FEATURE)
- **Status:** Fully operational
- **Location:** `/app/page.tsx`
- **Flow:** User enters URL → System analyzes → Returns comprehensive score
- **Components:**
  - URL input form with validation
  - Loading state with progress indicators
  - Results display with overall score (0-100)
  - Score breakdown by component
  - Platform-specific scores

#### 2. Platform-Specific Analysis (CORE FEATURE)
- **Status:** Fully operational
- **Platforms Covered:**
  - ChatGPT (clarity + structure focus)
  - Claude (citations + nuance focus)
  - Gemini (schema + mobile focus)
  - Perplexity (external links + data focus)
- **Scoring Components:**
  - Individual platform scores (0-100)
  - Component breakdowns per platform
  - Research-backed recommendations
  - Impact estimation

#### 3. Page Analysis Engine
- **Status:** Fully operational
- **Edge Function:** `analyze-page`
- **Analyzes:**
  - HTML structure (H1, H2, H3 counts)
  - Metadata (title, description)
  - Schema markup (FAQ, HowTo, Article, Author, Organization)
  - Content quality (readability, word count, paragraph length)
  - List structures (UL, OL counts, bullet ratio)
  - External links and citations
  - Entity identity signals
  - AEO (Answer Engine Optimization) factors
  - Comparative content detection
  - Table usage for data presentation

#### 4. Scoring System
- **Status:** Fully operational
- **Formula:**
  ```
  Overall Score = Structure (30%) + Metadata (25%) + Content (25%) + Schema (20%)
  ```
- **Components:**
  - Structure Score (0-30 points)
  - Metadata Score (0-25 points)
  - Content Score (0-25 points)
  - Schema Score (0-20 points)
  - AEO Score (additional metric)
  - Platform-specific adjustments

#### 5. Bot Access Verification
- **Status:** Fully operational (recently fixed)
- **Location:** `components/bot-access-card.tsx`
- **Checks:**
  - GPTBot (OpenAI)
  - CCBot (Common Crawl)
  - Google-Extended (Google Bard/Gemini)
  - FacebookBot (Meta AI)
  - PerplexityBot (Perplexity)
- **Detection:**
  - robots.txt parsing
  - Firewall detection
  - User-agent blocking
- **Features:**
  - Loading state with skeleton loaders
  - Real-time verification
  - Score penalty calculation (-2 points per blocked bot)
  - Detailed blocking reasons

#### 6. Entity Identity Tracking
- **Status:** Fully operational
- **Detects:**
  - Author schema
  - Organization schema
  - Person schema
  - SameAs links (social profiles)
  - Entity type classification
- **Score Impact:** Affects Gemini and Claude platform scores

#### 7. AEO (Answer Engine Optimization)
- **Status:** Fully operational
- **Metrics:**
  - Q&A pairs count
  - Direct answer presence
  - List density
  - TLDR sections
  - Intro fluff vs density
  - Table usage
- **Platform:** Especially important for Perplexity

#### 8. Competitive Analysis
- **Status:** Database schema ready, UI components implemented
- **Features:**
  - Mock competitor data generation
  - Gap analysis (content, authority, schema, freshness)
  - Side-by-side comparison
  - Optimization roadmap
- **Components:**
  - `components/competitive-analysis.tsx`
  - `components/competitive-gap-analysis.tsx`
  - `lib/mock-competitors.ts`

#### 9. Optimization Roadmap
- **Status:** Fully operational
- **Location:** `components/roadmap-visualization.tsx`
- **Features:**
  - 3-phase improvement plan
  - Timeline estimation
  - Monthly milestones
  - Progress tracking
- **Phases:**
  - Phase 1: Content & Schema (Weeks 1-3)
  - Phase 2: Authority & Freshness (Weeks 4-8)
  - Phase 3: AI Optimization (Weeks 9-12)

#### 10. Sentiment & Citation Tracking
- **Status:** Database schema ready, Edge Function implemented
- **Edge Function:** `analyze-sentiment`
- **Tracks:**
  - Sentiment scores over time
  - Citation frequency
  - Position in citations
  - Share of voice metrics

#### 11. Analytics Dashboard
- **Status:** Basic structure in place
- **Location:** `/app/analytics/page.tsx`
- **Features:**
  - Citation timeline charts
  - Sentiment trend visualization
  - Share of voice analysis
  - Platform radar charts

#### 12. Perplexity-Specific Optimizer
- **Status:** Database fields added
- **Features:**
  - Comparative paragraph detection
  - Table recommendation
  - Data density scoring
  - Comparative content samples

### 🚧 In Progress

1. **Google Search Console Integration**
   - Status: Schema ready, API integration pending
   - Table: `gsc_metrics`
   - Need: GSC API authentication flow

2. **Fix Generation (AI-Powered)**
   - Status: Edge Function created (`generate-fix`)
   - Need: Gemini API integration for schema generation
   - Types: Schema, title, description, structure fixes

3. **Keyword Management**
   - Status: Page structure ready (`/app/keywords/page.tsx`)
   - Need: Add keyword tracking functionality
   - Table: `tracked_keywords`

### 📋 Planned (Not Started)

1. **SERP Monitoring**
   - Automatic AI Overview tracking
   - Citation position tracking
   - Competitor monitoring

2. **User Authentication**
   - Supabase Auth integration
   - User dashboards
   - Multi-site management

3. **Citation Timeline Tracking**
   - Historical citation data
   - Trend analysis
   - Alerts for lost citations

4. **Advanced Competitive Analysis**
   - Real competitor data (not mocks)
   - Multi-competitor comparison
   - Industry benchmarking

---

## TECHNICAL ARCHITECTURE

### Tech Stack

#### Frontend
- **Framework:** Next.js 13.5.1 (App Router)
- **UI Library:** React 18.2.0
- **Styling:** Tailwind CSS 3.3.3
- **Component Library:** shadcn/ui (Radix UI primitives)
- **Charts:** Recharts 2.12.7
- **Icons:** Lucide React 0.446.0
- **State Management:** React Hooks (useState, useEffect)
- **Form Handling:** React Hook Form 7.53.0
- **Validation:** Zod 3.23.8
- **Date Handling:** date-fns 3.6.0

#### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (not yet implemented)
- **Serverless Functions:** Supabase Edge Functions (Deno runtime)
- **API Client:** @supabase/supabase-js 2.58.0

#### External Services (Planned)
- **Web Scraping:** Jina.ai Reader API (free 10M tokens)
- **AI Processing:** Google Gemini (sentiment analysis, schema generation)
- **SERP Monitoring:** Google Search Console API (free)

### Project Structure

```
project/
├── app/                              # Next.js app directory
│   ├── layout.tsx                    # Root layout with nav
│   ├── page.tsx                      # Home page (main analysis)
│   ├── analytics/page.tsx            # Analytics dashboard
│   ├── keywords/page.tsx             # Keyword management
│   └── globals.css                   # Global styles
│
├── components/                       # React components
│   ├── ui/                           # shadcn/ui base components (30+ files)
│   ├── url-input.tsx                 # URL submission form
│   ├── loading-state.tsx             # Analysis loading indicator
│   ├── results-display.tsx           # Main results container
│   ├── score-display.tsx             # Overall score visualization
│   ├── platform-cards-section.tsx    # Platform scores grid
│   ├── platform-card.tsx             # Individual platform card
│   ├── bot-access-card.tsx           # Bot verification status
│   ├── entity-identity-card.tsx      # Entity recognition display
│   ├── aeo-score-card.tsx            # AEO metrics card
│   ├── citation-card.tsx             # Citation display
│   ├── competitive-analysis.tsx      # Competitor comparison
│   ├── competitive-gap-analysis.tsx  # Gap analysis details
│   ├── roadmap-visualization.tsx     # Optimization roadmap
│   ├── monthly-milestones.tsx        # Timeline milestones
│   ├── research-recommendations.tsx  # Research-backed suggestions
│   ├── platform-radar-chart.tsx      # Platform comparison chart
│   ├── citation-timeline-chart.tsx   # Citation trends over time
│   ├── sentiment-trend-chart.tsx     # Sentiment analysis chart
│   ├── share-of-voice-chart.tsx      # Competitive metrics chart
│   ├── fix-modal.tsx                 # Fix generation modal
│   ├── add-keyword-modal.tsx         # Keyword addition modal
│   ├── table-conversion-modal.tsx    # Table suggestion modal
│   └── nav-bar.tsx                   # Navigation component
│
├── lib/                              # Utility libraries
│   ├── types.ts                      # TypeScript type definitions
│   ├── utils.ts                      # Helper functions (cn, etc.)
│   ├── bot-verification.ts           # Bot access verification logic
│   ├── mock-competitors.ts           # Sample competitor data
│   └── phase-calculator.ts           # Optimization phase logic
│
├── utils/supabase/                   # Supabase configuration
│   ├── client.ts                     # Client-side Supabase client
│   ├── server.ts                     # Server-side Supabase client
│   └── types.ts                      # Database types (auto-generated)
│
├── supabase/
│   ├── migrations/                   # Database migrations (11 files)
│   │   ├── 20251210142904_initial_schema.sql
│   │   ├── 20251211050652_add_service_role_policies.sql
│   │   ├── 20251211052633_create_demo_user.sql
│   │   ├── 20251211055631_add_list_structure_column.sql
│   │   ├── 20251211062507_add_platform_scores.sql
│   │   ├── 20251211081723_add_competitive_analysis.sql
│   │   ├── 20251211102037_add_bot_access_verification.sql
│   │   ├── 20251211125114_add_entity_identity_tracking.sql
│   │   ├── 20251211130649_add_aeo_fields.sql
│   │   ├── 20251211141840_add_sentiment_citation_tracking.sql
│   │   └── 20251211150106_add_perplexity_optimizer.sql
│   │
│   └── functions/                    # Edge functions
│       ├── analyze-page/index.ts     # Main page analysis
│       ├── generate-fix/index.ts     # AI fix generation
│       ├── analyze-sentiment/index.ts # Sentiment analysis
│       ├── calculate-share-of-voice/index.ts # Competitive metrics
│       └── suggest-fan-out/index.ts  # Content expansion suggestions
│
├── hooks/                            # Custom React hooks
│   └── use-toast.ts                  # Toast notification hook
│
├── package.json                      # Dependencies
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── .env                              # Environment variables (gitignored)
├── README.md                         # Project documentation
├── BOT_ACCESS_CARD_FIXES.md          # Recent fix documentation
└── PROJECT-CONTEXT.md                # This file
```

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For edge functions (managed by Supabase, not in .env)
SUPABASE_SERVICE_ROLE_KEY=managed_by_supabase
```

### Data Flow

```
User Input (URL)
    ↓
Frontend (Next.js)
    ↓
Edge Function: analyze-page
    ↓
[Future: Jina.ai API] → Scrape page content
    ↓
Analysis Engine (Deno)
    ├─ Parse HTML structure
    ├─ Extract metadata
    ├─ Detect schema markup
    ├─ Calculate readability
    ├─ Count elements
    └─ Verify bot access
    ↓
Scoring Engine
    ├─ Structure Score
    ├─ Metadata Score
    ├─ Content Score
    ├─ Schema Score
    └─ Platform Scores
    ↓
Supabase Database
    ├─ websites (store domain)
    ├─ page_data (store analysis)
    ├─ scores (store scores)
    ├─ platform_scores (store platform-specific)
    ├─ bot_access (store verification)
    └─ entity_identity (store entity data)
    ↓
Frontend Results Display
    ├─ Overall Score Card
    ├─ Score Breakdown
    ├─ Platform Cards (4x)
    ├─ Bot Access Card
    ├─ Entity Identity Card
    ├─ AEO Score Card
    ├─ Competitive Analysis
    ├─ Optimization Roadmap
    └─ Monthly Milestones
```

---

## DATABASE SCHEMA

### Core Tables

#### 1. users
```sql
id UUID PRIMARY KEY REFERENCES auth.users
email TEXT UNIQUE
created_at TIMESTAMPTZ DEFAULT NOW()
gsc_connected BOOLEAN DEFAULT FALSE
gsc_property_url TEXT
subscription_plan VARCHAR(20) DEFAULT 'free'
```
**Purpose:** User accounts with GSC integration status
**RLS:** Users can only view/update their own record

#### 2. websites
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id) ON DELETE CASCADE
url TEXT NOT NULL
domain TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
last_scraped TIMESTAMPTZ
UNIQUE(user_id, url)
```
**Purpose:** Websites being tracked by users
**RLS:** Users can only access their own websites

#### 3. page_data
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
website_id UUID REFERENCES websites(id) ON DELETE CASCADE
url TEXT
title TEXT
meta_description TEXT
h1_count INT DEFAULT 0
h2_count INT DEFAULT 0
h3_count INT DEFAULT 0
word_count INT DEFAULT 0
has_faq_schema BOOLEAN DEFAULT FALSE
has_howto_schema BOOLEAN DEFAULT FALSE
has_article_schema BOOLEAN DEFAULT FALSE
has_list_structure BOOLEAN DEFAULT FALSE
readability_score FLOAT DEFAULT 0
external_link_count INT DEFAULT 0
unique_ref_domain_count INT DEFAULT 0
avg_paragraph_words FLOAT DEFAULT 0
bullet_ratio FLOAT DEFAULT 0
data_density_score FLOAT DEFAULT 0
citation_pattern_count INT DEFAULT 0
argument_depth_score FLOAT DEFAULT 0
has_viewport_tag BOOLEAN DEFAULT FALSE
has_author_schema BOOLEAN DEFAULT FALSE
has_organization_schema BOOLEAN DEFAULT FALSE
has_person_schema BOOLEAN DEFAULT FALSE
has_same_as_links BOOLEAN DEFAULT FALSE
same_as_platforms TEXT[] DEFAULT '{}'::TEXT[]
entity_type TEXT
entity_identity_score FLOAT DEFAULT 0
qa_pairs_count INT DEFAULT 0
has_direct_answers BOOLEAN DEFAULT FALSE
list_density FLOAT DEFAULT 0
ul_count INT DEFAULT 0
ol_count INT DEFAULT 0
table_count INT DEFAULT 0
has_tables BOOLEAN DEFAULT FALSE
intro_fluff_score FLOAT DEFAULT 0
intro_density_score FLOAT DEFAULT 0
has_tldr BOOLEAN DEFAULT FALSE
aeo_score FLOAT DEFAULT 0
has_comparative_paragraphs BOOLEAN DEFAULT FALSE
comparative_data_score FLOAT DEFAULT 0
comparative_paragraph_count INT DEFAULT 0
perplexity_table_recommendation BOOLEAN DEFAULT FALSE
last_scraped TIMESTAMPTZ DEFAULT NOW()
UNIQUE(website_id, url)
```
**Purpose:** Scraped content and metadata from pages
**RLS:** Users can only access pages from their websites

#### 4. scores
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
structure_score FLOAT DEFAULT 0
metadata_score FLOAT DEFAULT 0
content_score FLOAT DEFAULT 0
schema_score FLOAT DEFAULT 0
aeo_score FLOAT DEFAULT 0
overall_score FLOAT DEFAULT 0
calculated_at TIMESTAMPTZ DEFAULT NOW()
```
**Purpose:** AI readiness scores for pages
**RLS:** Users can only access scores for their pages

#### 5. platform_scores
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
gemini_score FLOAT DEFAULT 0
chatgpt_score FLOAT DEFAULT 0
claude_score FLOAT DEFAULT 0
perplexity_score FLOAT DEFAULT 0
gemini_schema_component FLOAT DEFAULT 0
gemini_mobile_component FLOAT DEFAULT 0
chatgpt_structure_component FLOAT DEFAULT 0
chatgpt_clarity_component FLOAT DEFAULT 0
claude_citation_component FLOAT DEFAULT 0
claude_nuance_component FLOAT DEFAULT 0
perplexity_external_links_component FLOAT DEFAULT 0
perplexity_data_component FLOAT DEFAULT 0
calculated_at TIMESTAMPTZ DEFAULT NOW()
```
**Purpose:** Platform-specific AI readiness scores
**RLS:** Users can only access scores for their pages

### Analytics Tables

#### 6. tracked_keywords
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
website_id UUID REFERENCES websites(id) ON DELETE CASCADE
keyword TEXT NOT NULL
search_volume INT DEFAULT 0
created_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(website_id, keyword)
```
**Purpose:** Keywords being monitored for AI citations
**RLS:** Users can only access keywords for their websites

#### 7. serp_snapshots
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
keyword_id UUID REFERENCES tracked_keywords(id) ON DELETE CASCADE
snapshot_date TIMESTAMPTZ DEFAULT NOW()
has_ai_overview BOOLEAN DEFAULT FALSE
ai_overview_html TEXT
cited_domains TEXT[] DEFAULT '{}'::TEXT[]
your_site_cited BOOLEAN DEFAULT FALSE
your_site_position INT
estimated_traffic_impact FLOAT DEFAULT 0
```
**Purpose:** AI Overview tracking data over time
**RLS:** Users can only access snapshots for their keywords

#### 8. bot_access
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
bot_name VARCHAR(50) NOT NULL
is_allowed BOOLEAN DEFAULT TRUE
block_reason TEXT
robots_txt_rule TEXT
checked_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(page_id, bot_name)
```
**Purpose:** Bot access verification results
**Bot Names:** GPTBot, CCBot, Google-Extended, FacebookBot, PerplexityBot
**RLS:** Users can only access bot checks for their pages

#### 9. entity_identity
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
entity_type VARCHAR(50)
entity_name TEXT
has_author_schema BOOLEAN DEFAULT FALSE
has_organization_schema BOOLEAN DEFAULT FALSE
has_person_schema BOOLEAN DEFAULT FALSE
has_same_as_links BOOLEAN DEFAULT FALSE
same_as_platforms TEXT[] DEFAULT '{}'::TEXT[]
entity_identity_score FLOAT DEFAULT 0
checked_at TIMESTAMPTZ DEFAULT NOW()
```
**Purpose:** Entity recognition and identity tracking
**RLS:** Users can only access entity data for their pages

#### 10. sentiment_tracking
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
tracking_date TIMESTAMPTZ DEFAULT NOW()
sentiment_score FLOAT DEFAULT 0
sentiment_label VARCHAR(20)
positive_mentions INT DEFAULT 0
negative_mentions INT DEFAULT 0
neutral_mentions INT DEFAULT 0
```
**Purpose:** Sentiment analysis over time
**RLS:** Users can only access sentiment data for their pages

#### 11. citations
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
platform VARCHAR(50) NOT NULL
citation_date TIMESTAMPTZ DEFAULT NOW()
query_text TEXT
position INT
context_snippet TEXT
citation_url TEXT
```
**Purpose:** Citation occurrences in AI responses
**RLS:** Users can only access citations for their pages

### Integration Tables

#### 12. gsc_metrics
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
website_id UUID REFERENCES websites(id) ON DELETE CASCADE
keyword TEXT
impressions INT DEFAULT 0
clicks INT DEFAULT 0
ctr FLOAT DEFAULT 0
avg_position FLOAT DEFAULT 0
data_date DATE
UNIQUE(website_id, keyword, data_date)
```
**Purpose:** Google Search Console performance metrics
**RLS:** Users can only access GSC data for their websites

#### 13. fixes_generated
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
fix_type VARCHAR(50)
schema_json JSONB
applied BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT NOW()
```
**Purpose:** AI-generated optimization recommendations
**Fix Types:** schema, title, description, structure
**RLS:** Users can only access fixes for their pages

#### 14. competitive_analysis
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
competitor_name TEXT NOT NULL
competitor_url TEXT
competitor_domain TEXT
domain_rating INT DEFAULT 0
backlink_count INT DEFAULT 0
content_length INT DEFAULT 0
h1_count INT DEFAULT 0
h2_count INT DEFAULT 0
schema_present BOOLEAN DEFAULT FALSE
freshness_days INT DEFAULT 0
overall_score FLOAT DEFAULT 0
google_rank INT
ai_citation_percentage FLOAT DEFAULT 0
is_mock_data BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ DEFAULT NOW()
```
**Purpose:** Competitor comparison data
**RLS:** Users can only access competitive data for their pages

#### 15. optimization_roadmap
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES page_data(id) ON DELETE CASCADE
current_phase INT DEFAULT 1
phase1_completed BOOLEAN DEFAULT FALSE
phase2_completed BOOLEAN DEFAULT FALSE
phase3_completed BOOLEAN DEFAULT FALSE
phase1_completion_date TIMESTAMPTZ
phase2_completion_date TIMESTAMPTZ
phase3_completion_date TIMESTAMPTZ
estimated_completion_weeks INT DEFAULT 12
created_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(page_id)
```
**Purpose:** Track optimization progress
**RLS:** Users can only access roadmaps for their pages

### Indexes for Performance

```sql
idx_websites_user_id ON websites(user_id)
idx_tracked_keywords_website_id ON tracked_keywords(website_id)
idx_serp_snapshots_keyword_id ON serp_snapshots(keyword_id)
idx_serp_snapshots_date ON serp_snapshots(snapshot_date DESC)
idx_page_data_website_id ON page_data(website_id)
idx_scores_page_id ON scores(page_id)
idx_platform_scores_page_id ON platform_scores(page_id)
idx_bot_access_page_id ON bot_access(page_id)
idx_entity_identity_page_id ON entity_identity(page_id)
idx_gsc_metrics_website_date ON gsc_metrics(website_id, data_date DESC)
idx_fixes_generated_page_id ON fixes_generated(page_id)
idx_competitive_analysis_page_id ON competitive_analysis(page_id)
```

---

## SCORING SYSTEM

### Overall AI Readiness Formula

```
Overall Score (0-100) =
  Structure Score (0-30) × 0.30 +
  Metadata Score (0-25) × 0.25 +
  Content Score (0-25) × 0.25 +
  Schema Score (0-20) × 0.20
```

### Score Components

#### 1. Structure Score (0-30 points)

**Factors:**
- H1 count = 1: +15 points
- H1 count = 0 or >1: 0 points
- H2 count ≥ 3: +15 points
- H2 count = 2: +10 points
- H2 count = 1: +5 points
- H2 count = 0: 0 points

**Research Backing:**
- "Sequential steps increase citation likelihood by 5.42%" (Surfer SEO)
- Clear hierarchy helps AI models parse content

**Why It Matters:**
- AI models prefer clear heading structure
- Single H1 signals clear topic focus
- Multiple H2s indicate comprehensive coverage

#### 2. Metadata Score (0-25 points)

**Factors:**
- Title length 30-60 chars: +12 points
- Title < 30 or > 60 chars: 0 points
- Meta description 120-160 chars: +13 points
- Meta description < 120 or > 160 chars: 0 points

**Research Backing:**
- Optimal lengths match what AI models see in training data
- Google SERP snippets inform AI understanding

**Why It Matters:**
- Clear, concise titles help AI identify topic
- Proper descriptions provide context

#### 3. Content Score (0-25 points)

**Factors:**
- Readability score (Flesch-Kincaid): normalized 0-25
- Word count: implicit in readability calculation
- Average paragraph length: affects readability
- Bullet ratio: bonus for scannable content

**Calculation:**
```
Content Score = (Readability Score / 100) × 25
```

**Research Backing:**
- "Bullet points boost AI inclusion by 4.72%" (Surfer SEO)
- Shorter paragraphs preferred by ChatGPT

**Why It Matters:**
- Content depth signals authority
- Clarity helps AI extract accurate information

#### 4. Schema Score (0-20 points)

**Factors:**
- Has FAQ schema: +10 points
- Has HowTo schema: +10 points
- Has Article schema: +5 points
- Has Author schema: +3 points
- Has Organization schema: +2 points

**Max:** 20 points (can exceed with multiple schemas, capped at 20)

**Research Backing:**
- "Government sources with proper markup 11.75x more likely cited"
- Schema helps AI understand content structure

**Why It Matters:**
- Structured data = easier AI parsing
- FAQ/HowTo schemas signal Q&A format

#### 5. AEO Score (Supplementary)

**Factors:**
- Q&A pairs count: +2 points per pair (max 10)
- Direct answers present: +5 points
- List density > 0.2: +5 points
- Has TLDR: +5 points
- Low intro fluff: +5 points

**Max:** 30 points (supplementary, not in main formula)

**Why It Matters:**
- Answer Engine Optimization
- Perplexity especially values these signals

### Platform-Specific Scoring

#### ChatGPT Score (0-100)

**Formula:**
```
ChatGPT Score =
  Structure Component (40%) +
  Clarity Component (60%)
```

**Structure Component (40 points max):**
- H1 count = 1: +20 points
- H2 count ≥ 3: +20 points
- Normalized: (score / 40) × 40

**Clarity Component (60 points max):**
- Readability score: (readability / 100) × 30
- Avg paragraph < 80 words: +15 points
- Avg paragraph 80-150 words: +10 points
- Avg paragraph > 150 words: +5 points
- Bullet ratio > 0.3: +15 points
- Normalized: (score / 60) × 60

**Preferences:**
- Short paragraphs (< 80 words)
- Clear heading structure
- Conversational tone
- Bullet points and lists
- Recent content

#### Claude Score (0-100)

**Formula:**
```
Claude Score =
  Citation Component (50%) +
  Nuance Component (50%)
```

**Citation Component (50 points max):**
- External links ≥ 5: +25 points
- External links 3-4: +15 points
- External links 1-2: +5 points
- Unique ref domains ≥ 3: +25 points
- Normalized: (score / 50) × 50

**Nuance Component (50 points max):**
- Argument depth score: (depth / 10) × 25
- Word count > 2000: +15 points
- Word count 1000-2000: +10 points
- Has comparative paragraphs: +10 points
- Normalized: (score / 50) × 50

**Preferences:**
- Well-cited arguments
- Multiple sources
- Balanced perspectives
- Academic tone
- Nuanced analysis

#### Gemini Score (0-100)

**Formula:**
```
Gemini Score =
  Schema Component (60%) +
  Mobile Component (40%)
```

**Schema Component (60 points max):**
- Has Article schema: +15 points
- Has Author schema: +15 points
- Has Organization schema: +10 points
- Has FAQ schema: +10 points
- Has HowTo schema: +10 points
- Normalized: (score / 60) × 60

**Mobile Component (40 points max):**
- Has viewport tag: +20 points
- Readability > 60: +10 points
- List density > 0.2: +10 points
- Normalized: (score / 40) × 40

**Preferences:**
- Schema markup (critical)
- Mobile optimization
- Structured data
- Entity recognition
- Fast loading

#### Perplexity Score (0-100)

**Formula:**
```
Perplexity Score =
  External Links Component (40%) +
  Data Component (60%)
```

**External Links Component (40 points max):**
- External links ≥ 8: +20 points
- External links 5-7: +15 points
- External links 3-4: +10 points
- Unique ref domains ≥ 5: +20 points
- Normalized: (score / 40) × 40

**Data Component (60 points max):**
- Has tables: +15 points
- Table count > 2: +10 points
- Data density > 0.7: +15 points
- Has comparative paragraphs: +10 points
- Citation pattern count > 5: +10 points
- Normalized: (score / 60) × 60

**Preferences:**
- Multiple citations
- Data tables
- Statistical evidence
- Comparative content
- Source diversity

### Bot Access Score Penalty

**Penalty Calculation:**
```
Penalty = Number of Blocked Bots × 2 points
Max Penalty = 10 points (all 5 bots blocked)
```

**Blocked Bots Impact:**
- 1 bot blocked: -2 points
- 2 bots blocked: -4 points
- 3 bots blocked: -6 points
- 4 bots blocked: -8 points
- 5 bots blocked: -10 points

**Applied To:**
- Overall AI Readiness Score
- Relevant platform scores (e.g., GPTBot blocked = ChatGPT score penalty)

---

## KEY DESIGN DECISIONS

### 1. Research-Backed Transparency

**Decision:** Every recommendation includes research citation
**Why:** Builds trust, educates users, differentiates from competitors
**Implementation:**
- Research sources cited inline
- Statistical backing shown
- Estimated impact calculated
- Implementation priority indicated

**Example:**
```
❌ Issue: Paragraphs too long (avg 180 words)

📊 Research Backing:
   Source: Surfer SEO Case Study (Aug 2025)
   Stat: "Breaking content into sequential steps
         increased AI citation likelihood by 5.42%"

✅ Fix: Break 4 paragraphs into 12-15 sections < 80 words each
   Impact: +8 points to overall score
   Time: 30-45 minutes
```

### 2. Platform-Specific Scoring

**Decision:** Individual optimization paths for each AI model
**Why:** Different AI models have different preferences
**Implementation:**
- Separate scoring algorithms per platform
- Platform-specific recommendations
- Individual component breakdowns
- Clear action priorities

**ChatGPT Example:**
- Prefers: Clarity, short paragraphs, conversational tone
- Weights: Structure 40%, Clarity 60%
- Action: "Break paragraphs to < 80 words"

**Claude Example:**
- Prefers: Citations, nuanced arguments, balanced content
- Weights: Citations 50%, Nuance 50%
- Action: "Add 5-8 credible external citations"

**Gemini Example:**
- Prefers: Schema markup, mobile optimization
- Weights: Schema 60%, Mobile 40%
- Action: "Implement Article + Author schema"

**Perplexity Example:**
- Prefers: Multiple sources, data tables, citations
- Weights: External Links 40%, Data 60%
- Action: "Add data table with comparisons"

### 3. Competitive Positioning

**Decision:** Show realistic competitive landscape
**Why:** Users need context for their position
**Implementation:**
- Gap analysis vs top competitors
- Realistic timeline projections (3-6 months)
- Phased improvement roadmap
- Monthly milestone tracking

**Example:**
```
Your Site vs #1 Competitor:
├─ Your Score: 62/100
├─ Their Score: 85/100
├─ Content Gap: Need +2,700 words
├─ Authority Gap: Need +1,998 backlinks
├─ Schema Gap: Missing FAQ, HowTo, Author schemas
└─ Timeline: 3-6 months to top 10
```

### 4. Progressive Disclosure

**Decision:** Show only what matters, hide advanced options
**Why:** Prevents analysis paralysis, improves UX
**Implementation:**
- Overall score shown first (big, prominent)
- Score breakdown collapsible
- Platform cards expandable
- Detailed recommendations on demand

**User Flow:**
1. See overall score: 62/100
2. See top 3 critical issues
3. Click "Show Details" for full analysis
4. Click platform card for specific recommendations

### 5. One-Click Fixes Over Education

**Decision:** Provide copy-paste solutions, not long explanations
**Why:** Users are busy, want fast solutions
**Implementation:**
- "Copy Code" buttons
- Pre-generated JSON-LD schema
- HTML snippets ready to use
- Brief "Why this matters" (1-2 sentences)

**Example:**
```
[COPY CODE]
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
</script>
```

### 6. Mock Data for MVP

**Decision:** Use generated competitor data for MVP
**Why:** Real competitor analysis requires SERP scraping (future phase)
**Implementation:**
- `lib/mock-competitors.ts` generates realistic data
- `is_mock_data` flag in database
- Clear indication in UI ("Sample Data")
- Easy to swap for real data later

**Mock Competitors:**
- Ahrefs, SEMrush, Moz, Surfer SEO (for SEO tools)
- Industry-specific competitors based on domain
- Realistic metrics (DR, backlinks, scores)

### 7. Loading States Always Visible

**Decision:** Show loading UI immediately, don't hide cards
**Why:** Prevents layout shifts, sets expectations
**Implementation:**
- Skeleton loaders
- Progress indicators
- Estimated time displays
- Smooth transitions to data

**Example (Bot Access Card):**
```
⏳ Checking AI bot access...
   Verifying which AI crawlers can access your site
   Estimated time: 3-5 seconds

[Skeleton loader 1]
[Skeleton loader 2]
[Skeleton loader 3]
[Skeleton loader 4]
[Skeleton loader 5]
```

### 8. Color-Coded Priority System

**Decision:** Red/Yellow/Green for issue severity
**Why:** Visual hierarchy, immediate understanding
**Implementation:**
- 🔴 Red (Critical): High impact, fix now
- 🟡 Yellow (Medium): Important, fix soon
- 🟢 Green (Good): No action needed

**Score Gradients:**
- 0-40: Red (Poor)
- 40-60: Orange (Fair)
- 60-75: Yellow (Good)
- 75-85: Light Green (Very Good)
- 85-100: Dark Green (Excellent)

### 9. Mobile-First Design

**Decision:** Optimize for mobile viewport
**Why:** Users check sites on mobile, responsive critical
**Implementation:**
- Tailwind responsive breakpoints
- Touch-friendly buttons (min 44x44px)
- Vertical layouts on small screens
- Horizontal scrolling for charts
- Collapsible sections

### 10. NO LLM Querying for Scoring

**Decision:** Don't query ChatGPT/Gemini APIs to check citations
**Why:** Expensive, unreliable, rate-limited
**Implementation:**
- Local HTML analysis only
- Pattern matching for signals
- Research-backed heuristics
- Future: SERP scraping for real citation data

**Cost Comparison:**
- LLM querying: $0.01+ per page × 100s of pages = $$$
- Local analysis: Free, unlimited
- SERP scraping: Free (Google Search Console API)

---

## DEVELOPMENT GUIDELINES

### Code Style

1. **TypeScript Everywhere**
   - Use strict type checking
   - Define interfaces for all data structures
   - No `any` types (use `unknown` if needed)
   - Export types from `lib/types.ts`

2. **Next.js 13 Conventions**
   - Use App Router (not Pages Router)
   - Server Components by default
   - Client Components only when needed (`"use client"`)
   - Avoid client-side hooks in Server Components

3. **Component Organization**
   - One component per file
   - Co-locate related components
   - Extract reusable logic to custom hooks
   - Keep components < 200 lines (guideline, not rule)

4. **Naming Conventions**
   - Components: PascalCase (`ResultsDisplay.tsx`)
   - Files: kebab-case (`results-display.tsx`)
   - Functions: camelCase (`calculateScore`)
   - Constants: UPPER_SNAKE_CASE (`MAX_SCORE`)
   - Database tables: snake_case (`page_data`)

5. **Error Handling**
   - Always handle async errors
   - Use try-catch blocks
   - Show user-friendly error messages
   - Log errors to console (future: error tracking service)

6. **Loading States**
   - Always show loading UI
   - Use skeleton loaders
   - Indicate estimated time
   - Handle empty states

7. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels
   - Ensure keyboard navigation
   - Color contrast ratios (WCAG AA)

### Database Best Practices

1. **Row Level Security (RLS)**
   - ALWAYS enable RLS on new tables
   - Create policies for SELECT, INSERT, UPDATE, DELETE
   - Use `auth.uid()` for user checks
   - Test policies thoroughly

2. **Migrations**
   - One migration per logical change
   - Use descriptive names with timestamps
   - Include detailed comments
   - Use `IF NOT EXISTS` / `IF EXISTS`
   - Never use `DROP` without data backup

3. **Indexes**
   - Add indexes on foreign keys
   - Index frequently queried columns
   - Use composite indexes for multi-column queries
   - Monitor query performance

4. **Data Types**
   - UUID for IDs
   - TIMESTAMPTZ for timestamps
   - JSONB for flexible data
   - TEXT[] for string arrays
   - FLOAT for scores (not INT)

5. **Constraints**
   - UNIQUE constraints to prevent duplicates
   - NOT NULL for required fields
   - DEFAULT values where appropriate
   - Foreign keys with ON DELETE CASCADE

### Edge Function Guidelines

1. **CORS Headers (REQUIRED)**
   ```typescript
   const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
   };
   ```

2. **OPTIONS Handling**
   ```typescript
   if (req.method === "OPTIONS") {
     return new Response(null, { status: 200, headers: corsHeaders });
   }
   ```

3. **Error Handling**
   ```typescript
   try {
     // function logic
   } catch (error) {
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500, headers: corsHeaders }
     );
   }
   ```

4. **Dependencies**
   - Use `npm:` prefix for npm packages
   - Use `jsr:` prefix for JSR packages
   - Specify versions (e.g., `npm:@supabase/supabase-js@2.58.0`)
   - Avoid Deno-specific imports

5. **Environment Variables**
   - Use Deno.env.get() for env vars
   - Never hardcode secrets
   - All Supabase vars pre-populated

### Component Patterns

1. **Loading State Pattern**
   ```typescript
   interface Props {
     data?: DataType;
     loading: boolean;
   }

   if (loading) {
     return <SkeletonLoader />;
   }

   if (!data) {
     return <EmptyState />;
   }

   return <DataDisplay data={data} />;
   ```

2. **Error Boundary Pattern**
   ```typescript
   try {
     const result = await fetchData();
     setData(result);
   } catch (error) {
     setError(error.message);
     console.error('[Component] Error:', error);
   }
   ```

3. **Conditional Rendering Pattern**
   ```typescript
   {showSection && <Section />}
   {condition ? <ComponentA /> : <ComponentB />}
   {items.map((item) => <Item key={item.id} {...item} />)}
   ```

4. **Event Handler Pattern**
   ```typescript
   const handleClick = async () => {
     setLoading(true);
     try {
       await performAction();
     } catch (error) {
       console.error(error);
     } finally {
       setLoading(false);
     }
   };
   ```

---

## BUSINESS LOGIC

### Scoring Philosophy

**Core Principle:** Local HTML analysis, not LLM querying

**Why:**
1. Cost: Free vs $0.01+ per query
2. Speed: Instant vs 2-3 seconds per query
3. Reliability: Deterministic vs variable
4. Scale: Unlimited vs rate-limited

**Approach:**
1. Parse HTML structure locally
2. Extract metadata and content
3. Detect schema markup patterns
4. Calculate readability metrics
5. Apply research-backed scoring formulas
6. Generate platform-specific recommendations

### Platform Preferences (Research-Backed)

#### ChatGPT Preferences
**Source:** OpenAI documentation, Surfer SEO case studies

1. **Structure:**
   - Clear heading hierarchy (H1 → H2 → H3)
   - Short paragraphs (< 80 words)
   - Bullet points and numbered lists

2. **Content:**
   - Conversational tone
   - Direct answers
   - Recent/fresh content (25.7% fresher than average)

3. **Formatting:**
   - Sequential steps (5.42% boost)
   - Scannable sections
   - Bold key points

#### Claude Preferences
**Source:** Anthropic documentation, research papers

1. **Citations:**
   - Multiple external sources (5-10 minimum)
   - Diverse reference domains
   - Academic/authoritative sources

2. **Nuance:**
   - Balanced arguments
   - Multiple perspectives
   - Depth over breadth

3. **Structure:**
   - Logical flow
   - Evidence-based claims
   - Transparent reasoning

#### Gemini Preferences
**Source:** Google documentation, schema.org studies

1. **Schema Markup (Critical):**
   - Article schema
   - Author schema
   - Organization schema
   - FAQ/HowTo schema

2. **Mobile Optimization:**
   - Viewport meta tag
   - Responsive design
   - Fast loading

3. **Entity Recognition:**
   - Clear entity signals
   - SameAs links (social profiles)
   - Knowledge Graph connections

#### Perplexity Preferences
**Source:** Perplexity research, user studies

1. **Citations (Essential):**
   - 8+ external links minimum
   - 5+ unique reference domains
   - Recent sources preferred

2. **Data Presentation:**
   - Tables and charts
   - Statistical evidence
   - Comparative analysis

3. **Answer Format:**
   - Direct answers (Q&A pairs)
   - TLDR sections
   - Clear conclusions

### Competitive Analysis Logic

**Philosophy:** Realistic expectations, phased approach

**Phases:**
1. **Phase 1 (Weeks 1-3):** Content & Schema
   - Expand content
   - Add schema markup
   - Improve structure
   - Goal: Make content competitive

2. **Phase 2 (Weeks 4-8):** Authority & Freshness
   - Build backlinks (10-50)
   - Update content regularly
   - Add E-E-A-T signals
   - Goal: Rank in Google top 20-30

3. **Phase 3 (Weeks 9-12):** AI Optimization
   - Platform-specific tweaks
   - Citation optimization
   - Monitoring and iteration
   - Goal: Rank in Google top 10 + AI citations

**Timeline Estimates:**
- Month 1: Rank #40-60, 0% AI citations
- Month 2: Rank #20-30, 2-5% AI citations
- Month 3: Rank #10-15, 10-15% AI citations
- Month 6: Rank #3-6, 20%+ AI citations

**Gap Analysis Formula:**
```
Content Gap = Competitor Word Count - Your Word Count
Authority Gap = Competitor Backlinks - Your Backlinks
Schema Gap = [Missing Schema Types]
Freshness Gap = Your Last Update - Today (in days)
```

### Bot Access Verification Logic

**Bots Checked:**
1. GPTBot (OpenAI) - ChatGPT training data
2. CCBot (Common Crawl) - Used by multiple AI models
3. Google-Extended (Google) - Bard/Gemini training
4. FacebookBot (Meta) - Meta AI training
5. PerplexityBot (Perplexity) - Direct indexing

**Verification Process:**
1. Fetch robots.txt from domain root
2. Parse user-agent rules
3. Check for `Disallow: /` directives
4. Check for specific path blocks
5. Detect wildcard blocks (`User-agent: *`)
6. Store results in database

**Blocking Reasons:**
- `robots_txt`: Blocked via robots.txt rule
- `firewall`: Site behind aggressive firewall
- `user_agent_block`: User-agent blocking detected
- `null`: Allowed (no blocking)

**Score Impact:**
- Blocked bot: -2 points from overall score
- Blocked bot: -10 points from platform score (if applicable)

### Entity Identity Detection

**Signals:**
1. Author Schema (@type: Person)
2. Organization Schema (@type: Organization)
3. Person Schema (standalone)
4. SameAs Links (social profiles)
   - LinkedIn, Twitter/X, Facebook
   - GitHub, Medium, personal site

**Entity Types:**
- Person (individual author/expert)
- Organization (company/brand)
- Product (specific product page)
- Unknown (no clear entity)

**Identity Score Calculation:**
```
Base: 0 points
+ Has Author Schema: +20 points
+ Has Organization Schema: +15 points
+ Has Person Schema: +10 points
+ Has SameAs Links: +5 points per platform (max 25)
+ Multiple platforms: +10 bonus

Max: 80 points
Normalized to 0-100: (score / 80) × 100
```

### AEO (Answer Engine Optimization)

**Purpose:** Optimize for answer-focused AI models (Perplexity, ChatGPT)

**Metrics:**
1. Q&A Pairs - Detected question-answer patterns
2. Direct Answers - Clear, concise answers at top
3. List Density - Ratio of list items to paragraphs
4. TLDR Sections - Summary at beginning
5. Intro Density - Valuable content in first 100 words

**AEO Score Formula:**
```
Base: 0 points
+ Q&A Pairs: +2 per pair (max 10)
+ Direct Answers: +5 points
+ List Density > 0.2: +5 points
+ Has TLDR: +5 points
+ Low Intro Fluff: +5 points

Max: 30 points
```

**Why It Matters:**
- Answer engines prioritize Q&A format
- Direct answers increase citation likelihood
- Lists are easier to parse and present
- TLDR sections provide quick context

---

## RECENT CHANGES

### December 11, 2024 - Bot Access Card Fix

**Problem:** Bot Access Card wasn't visible despite data existing in database

**Root Cause:** Conditional rendering prevented card from showing during loading phase

**Solution:**
1. Updated `bot-access-card.tsx`:
   - Added `loading` prop
   - Added loading state UI with skeleton loaders
   - Shows "Checking AI bot access..." during fetch

2. Updated `results-display.tsx`:
   - Removed conditional rendering
   - Card now ALWAYS renders (even while loading)
   - Passes `loading={loadingBotData}` prop

**Result:**
- Card appears immediately when results load
- Loading state shows for 3-5 seconds
- Real data replaces loading state smoothly
- No more "missing card" confusion

**Files Changed:**
- `components/bot-access-card.tsx`
- `components/results-display.tsx`
- `BOT_ACCESS_CARD_FIXES.md` (documentation)

### December 11, 2024 - Database Migrations

**11 migrations created:**

1. **20251210142904_initial_schema.sql**
   - Core tables (users, websites, page_data, scores)
   - Analytics tables (serp_snapshots, tracked_keywords)
   - Integration tables (gsc_metrics, fixes_generated)
   - RLS policies for all tables

2. **20251211050652_add_service_role_policies.sql**
   - Service role bypass policies
   - Allows Edge Functions to write data

3. **20251211052633_create_demo_user.sql**
   - Demo user for testing
   - UUID: 00000000-0000-0000-0000-000000000001

4. **20251211055631_add_list_structure_column.sql**
   - Added `has_list_structure` to page_data
   - Tracks UL/OL presence

5. **20251211062507_add_platform_scores.sql**
   - New table: platform_scores
   - Individual scoring per AI model
   - Component breakdowns

6. **20251211081723_add_competitive_analysis.sql**
   - New table: competitive_analysis
   - Competitor comparison data
   - Gap analysis fields
   - New table: optimization_roadmap
   - Phase tracking

7. **20251211102037_add_bot_access_verification.sql**
   - New table: bot_access
   - Tracks 5 AI bots
   - Blocking reasons and rules

8. **20251211125114_add_entity_identity_tracking.sql**
   - New table: entity_identity
   - Entity type classification
   - Schema detection
   - SameAs link tracking

9. **20251211130649_add_aeo_fields.sql**
   - Added AEO fields to page_data
   - Q&A pairs, direct answers, list density
   - TLDR detection, intro scoring

10. **20251211141840_add_sentiment_citation_tracking.sql**
    - New table: sentiment_tracking
    - New table: citations
    - Time-series tracking

11. **20251211150106_add_perplexity_optimizer.sql**
    - Added Perplexity-specific fields
    - Comparative paragraph detection
    - Table recommendation
    - Data density scoring

### November-December 2024 - Initial Development

**Completed:**
- Project setup (Next.js 13, Tailwind, shadcn/ui)
- Database schema design
- Core analysis engine
- Platform-specific scoring
- UI components (20+ components)
- Edge Functions (5 functions)
- Competitive analysis mock data
- Optimization roadmap visualization

---

## KNOWN ISSUES

### 🐛 Bugs

1. **No Real Web Scraping Yet**
   - **Status:** Planned feature
   - **Workaround:** Edge Function currently doesn't scrape; needs Jina.ai integration
   - **Fix Timeline:** Phase 2 (next 2-4 weeks)

2. **Mock Competitor Data Only**
   - **Status:** By design for MVP
   - **Issue:** Not real competitor analysis
   - **Fix Timeline:** Phase 2 (SERP scraping implementation)

3. **No User Authentication**
   - **Status:** Planned feature
   - **Workaround:** Using demo user ID hardcoded
   - **Fix Timeline:** Phase 2

### ⚠️ Limitations

1. **No Historical Data**
   - First version, no time-series data yet
   - Citation tracking needs time to accumulate
   - Sentiment trends need 30+ days of data

2. **Single Page Analysis**
   - Can only analyze one page at a time
   - No bulk analysis
   - No site-wide audit

3. **No GSC Integration**
   - Schema ready, API integration pending
   - Need OAuth flow implementation

4. **No Fix Generation Yet**
   - Edge Function created but not functional
   - Needs Gemini API integration

### 🚀 Performance Considerations

1. **Large Page Analysis**
   - Pages > 10,000 words may timeout
   - Consider chunking for very long content

2. **Database Query Optimization**
   - Some complex queries may need optimization
   - Monitor query performance in production

3. **Edge Function Cold Starts**
   - First request may take 2-3 seconds
   - Subsequent requests < 1 second

---

## FUTURE ROADMAP

### Phase 2 (Next 2-4 Weeks)

#### Priority 1: Web Scraping Integration
- **Task:** Integrate Jina.ai Reader API
- **Why:** Need real page content for analysis
- **Steps:**
  1. Get Jina.ai API key
  2. Add to Edge Function
  3. Parse returned HTML
  4. Handle rate limits

#### Priority 2: User Authentication
- **Task:** Implement Supabase Auth
- **Why:** Multi-user support, data isolation
- **Steps:**
  1. Set up email/password auth
  2. Create login/signup pages
  3. Update RLS policies
  4. Add user dashboard

#### Priority 3: GSC Integration
- **Task:** Connect Google Search Console API
- **Why:** Real keyword data, impressions, clicks
- **Steps:**
  1. OAuth2 flow setup
  2. GSC API authentication
  3. Data import from GSC
  4. Store in gsc_metrics table

#### Priority 4: Fix Generation
- **Task:** Implement AI-powered fix generation
- **Why:** Core value proposition
- **Steps:**
  1. Get Gemini API key
  2. Create prompt templates
  3. Generate schema markup
  4. Generate title/description suggestions
  5. One-click copy functionality

### Phase 3 (1-3 Months)

#### Feature: SERP Monitoring
- **Task:** Automated AI Overview tracking
- **Why:** Real citation data, not estimates
- **Implementation:**
  - Daily SERP checks for tracked keywords
  - Extract AI Overview HTML
  - Detect cited domains
  - Alert on citation changes

#### Feature: Historical Analytics
- **Task:** Time-series data visualization
- **Why:** Track improvement over time
- **Implementation:**
  - Citation timeline charts
  - Score improvement graphs
  - Sentiment trend analysis
  - Competitor position tracking

#### Feature: Bulk Analysis
- **Task:** Analyze multiple pages/sites
- **Why:** Agency use case, scalability
- **Implementation:**
  - CSV upload for URLs
  - Background job processing
  - Batch results export
  - Site-wide audit reports

#### Feature: Real Competitive Analysis
- **Task:** Replace mock data with real SERP data
- **Why:** Accurate competitor insights
- **Implementation:**
  - SERP scraping for target keywords
  - Extract top 10 competitors
  - Analyze competitor pages
  - Real-time gap analysis

### Phase 4 (3-6 Months)

#### Feature: Team Collaboration
- **Task:** Multi-user workspaces
- **Why:** Agency use case
- **Implementation:**
  - Team invites
  - Role-based permissions
  - Shared reports
  - Client portals

#### Feature: White Label
- **Task:** Rebrandable version
- **Why:** Agency reselling
- **Implementation:**
  - Custom branding
  - Custom domains
  - API access
  - Embed widgets

#### Feature: API Access
- **Task:** Developer API for integration
- **Why:** Ecosystem expansion
- **Implementation:**
  - REST API endpoints
  - API keys/authentication
  - Rate limiting
  - Documentation

#### Feature: Advanced Recommendations
- **Task:** AI-powered content suggestions
- **Why:** Deeper insights, more value
- **Implementation:**
  - Content gap identification
  - Keyword opportunity finder
  - Topic cluster suggestions
  - Content brief generation

---

## APPENDIX

### Research Sources

1. **Surfer SEO Case Study (Aug 2025)**
   - "Breaking content into sequential steps increased AI citation likelihood by 5.42%"
   - "Bullet points boost AIO inclusion by 4.72%"

2. **Backlinko Analysis**
   - "LLMs reward contextual relevance and diversity over authority"
   - "Response density (not backlinks) determines prominence"

3. **SearchAtlas Research**
   - "Competition intensity = strongest predictor of visibility"
   - "40.58% of AI citations come from Google top 10"

4. **Passionfruit Research (Nov 2025)**
   - "Content freshness: 76.4% of cited content updated in last 30 days"
   - "ChatGPT cites content 25.7% fresher than average"

5. **ClickRank.ai Insights**
   - "Government sources 11.75x more likely to be cited"
   - Platform-specific preference documentation

### Key Metrics to Track

**User Metrics:**
- Pages analyzed per user
- Return rate (% users who come back)
- Average session duration
- Conversion rate (free → paid)

**Product Metrics:**
- Average analysis time (target: < 15 seconds)
- Score distribution (most users 40-70 range)
- Most common issues found
- Most clicked recommendations

**Technical Metrics:**
- API response time (target: < 2 seconds)
- Database query performance
- Edge Function cold start time
- Error rate (target: < 1%)

### Glossary

**AEO:** Answer Engine Optimization - Optimizing for answer-focused AI models

**AI Overview:** Google's AI-generated answer at top of search results

**Citation:** When AI model references/mentions your content in response

**E-E-A-T:** Experience, Expertise, Authoritativeness, Trustworthiness

**GSC:** Google Search Console - Google's webmaster tool

**RLS:** Row Level Security - Postgres security feature

**Schema Markup:** Structured data using schema.org vocabulary

**SERP:** Search Engine Results Page

**Share of Voice:** % of citations you have vs competitors

**Zero-Click Search:** Search result that answers question without click

---

## CONTACT & SUPPORT

**Project Status:** Active Development
**Version:** 1.0.0 (MVP)
**Last Updated:** December 12, 2024

**For Questions:**
- Review this document first
- Check README.md for setup instructions
- Check BOT_ACCESS_CARD_FIXES.md for recent fixes
- Review migration files for database schema

**Development Environment:**
- Node.js 18.x or higher
- Supabase project (external)
- Next.js 13.5.1
- React 18.2.0

**Build Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm run typecheck    # Type checking
npm run lint         # Linting
```

---

**END OF PROJECT CONTEXT**

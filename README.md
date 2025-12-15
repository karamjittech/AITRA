# AITRA - AI Search Readiness Platform

A research-backed AI SEO optimization tool that analyzes content for AI search visibility across major AI platforms (Google AI Overviews, ChatGPT, Claude, Gemini, and Perplexity).

## Overview

AITRA (AI-Targeted Readiness Analyzer) helps content creators, SEO professionals, and businesses optimize their content for citation in AI-powered search results. The platform analyzes web pages against 28+ research-backed signals that AI models prefer, providing actionable recommendations with one-click fixes.

## Key Features

### Core Features

- **AI Readiness Audit**: Comprehensive analysis of web pages against AI model preferences
- **Platform-Specific Scoring**: Individual scores for ChatGPT, Claude, Gemini, and Perplexity
- **Research-Backed Recommendations**: Every suggestion backed by published research and statistics
- **Competitive Analysis**: Compare your content against competitors ranking in AI search results
- **One-Click Optimization**: Auto-generate schema markup, meta tags, and structured data
- **Perplexity Table Optimizer**: Auto-detect comparative content and convert paragraphs to structured tables optimized for Perplexity citations (3.2x citation rate increase)
- **Citation Tracking**: Monitor when and how your content appears in AI responses
- **SERP Monitoring**: Track AI Overviews in Google search results

### Analytics Features

- **Share of Voice Analysis**: Track competitive positioning in AI citations
- **Sentiment Tracking**: Monitor sentiment trends in AI model responses
- **Citation Timeline**: Visualize citation patterns over time
- **Bot Access Verification**: Ensure AI crawlers can access your content
- **Entity Recognition**: Track how AI models understand your brand identity
- **Comparative Content Detection**: Identify paragraphs with pricing, feature, or metric comparisons suitable for table conversion

### Admin Panel & AppSumo Integration

- **LTD Code Manager**: Bulk upload, search, filter, and revoke AppSumo lifetime deal codes
- **User Manager**: Search users, manually adjust credits, change tiers for support scenarios
- **System Health Monitor**: Track API costs, credit consumption, and usage breakdown by feature
- **Audit Logging**: Complete audit trail of all admin actions with timestamps and details
- **Redemption System**: User-facing code redemption page with automatic tier upgrades and code stacking
- **Security**: Admin-only access via middleware protection and is_admin flag verification

## Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password, Google OAuth, Magic Links)
- **Session Management**: @supabase/ssr
- **Serverless Functions**: Supabase Edge Functions (Deno runtime)
- **API Client**: Supabase JavaScript Client
- **Admin Functions**: PostgreSQL SECURITY DEFINER functions for privileged operations

### External Services
- **Web Scraping**: Jina.ai Reader API (for content extraction)
- **AI Processing**: Google Gemini (for sentiment analysis & schema generation)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or higher
- npm or yarn package manager
- A Supabase account and project
- Jina.ai API key (free tier available)
- Google Gemini API key

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add these for edge functions (managed by Supabase)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup

The database schema is already created via migrations. The schema includes:

**Core Tables:**
- `users` - User accounts with subscription, credits, and admin flags
- `websites` - Tracked websites
- `tracked_keywords` - Keywords being monitored
- `page_data` - Scraped page content and metadata
- `scores` - AI readiness scores
- `redemption_codes` - AppSumo LTD codes with revocation tracking
- `admin_actions` - Audit log of all admin operations

**Analytics Tables:**
- `serp_snapshots` - AI Overview tracking data
- `gsc_metrics` - Google Search Console data
- `platform_scores` - Platform-specific AI readiness scores
- `competitive_analysis` - Competitor comparison data
- `bot_access_checks` - Bot verification results
- `entity_identity` - Entity recognition tracking
- `sentiment_tracking` - Sentiment analysis over time
- `citations` - Citation occurrences in AI responses

**Integration Tables:**
- `fixes_generated` - AI-generated optimization fixes

All tables have Row Level Security (RLS) enabled with proper policies.

### 5. Authentication & Subscription System

The platform includes a complete authentication and tiered subscription system:

**Regular Subscription Tiers:**
- **Free**: 1 website, 3 keywords, 50 AI credits/month
- **Pro** ($39/month): 3 websites, 50 keywords, 500 AI credits/month
- **Agency** ($119/month): 15 websites, 250 keywords, 2,500 AI credits/month

**AppSumo Lifetime Deal Tiers:**
- **Tier 1 - Starter**: 3 websites, 25 keywords, 100 AI credits/month (lifetime)
- **Tier 2 - Professional**: 10 websites, 100 keywords, 250 AI credits/month (lifetime)
- **Tier 3 - Agency**: 50 websites, 500 keywords, 500 AI credits/month (lifetime)
- **Code Stacking**: Users can redeem multiple codes to upgrade tiers (Tier 1 → Tier 2 → Tier 3)

**Authentication Methods:**
- Email/Password authentication
- Google OAuth integration
- Magic Link (passwordless authentication)
- Protected routes with middleware

**Credit System:**
Credits power AI-intensive features with different costs:
- Sentiment Analysis: 5 credits
- Schema Generation: 2 credits
- Fan-Out Analysis: 10 credits
- E-E-A-T Analysis: 15 credits
- Share of Voice: 20 credits

**Feature Gating:**
The system automatically restricts features based on subscription tier and available credits. Premium features show upgrade prompts when accessed by Free users.

**User Profile Fields:**
- `subscription_plan`: free, pro, or agency
- `appsumo_tier`: 0 (free), 1, 2, or 3 for LTD users
- `is_lifetime_deal`: Boolean flag for AppSumo customers
- `is_admin`: Boolean flag for admin panel access
- `codes_redeemed`: Array of redeemed AppSumo codes
- `credits_total`: Monthly credit allocation
- `credits_used`: Credits consumed this cycle
- `websites_limit`: Max websites allowed
- `keywords_limit`: Max keywords allowed
- `billing_cycle_start`: Subscription renewal date
- Stripe integration fields for payment processing

### 6. Deploy Edge Functions

The project includes several Supabase Edge Functions:

```bash
# These are already deployed in supabase/functions/
- analyze-page: Main page analysis function
- generate-fix: AI-powered fix generation
- analyze-sentiment: Sentiment analysis
- calculate-share-of-voice: Competitive metrics
- suggest-fan-out: Content expansion suggestions
```

## Project Structure

```
project/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── analytics/               # Analytics dashboard
│   ├── authority/               # Authority page
│   ├── reputation/              # Reputation page
│   ├── keywords/                # Keyword management
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── pricing/                 # Pricing page
│   ├── redeem/                  # AppSumo code redemption page
│   ├── admin/                   # Admin panel
│   │   ├── layout.tsx           # Admin layout with navigation
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── codes/page.tsx       # LTD Code Manager
│   │   ├── users/page.tsx       # User Manager
│   │   └── system/page.tsx      # System Health Monitor
│   ├── api/                     # API routes
│   │   ├── redeem/route.ts      # Code redemption API
│   │   └── admin/               # Admin API endpoints
│   │       ├── codes/revoke/    # Revoke code API
│   │       └── users/           # User management APIs
│   ├── auth/callback/           # OAuth callback handler
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── aeo-score-card.tsx       # AEO metrics display
│   ├── bot-access-card.tsx      # Bot verification status
│   ├── citation-card.tsx        # Citation display
│   ├── competitive-analysis.tsx # Competitor comparison
│   ├── entity-identity-card.tsx # Entity recognition
│   ├── platform-cards-section.tsx # Platform scores
│   ├── results-display.tsx      # Analysis results
│   ├── roadmap-visualization.tsx # Improvement roadmap
│   ├── table-conversion-modal.tsx # Perplexity table converter
│   ├── upgrade-gate.tsx         # Premium feature lock
│   ├── credit-gate.tsx          # Credit requirement gate
│   ├── limit-reached.tsx        # Limit notification
│   ├── pricing-modal.tsx        # Upgrade modal
│   └── url-input.tsx            # URL submission form
├── lib/                         # Utility libraries
│   ├── types.ts                 # TypeScript type definitions
│   ├── utils.ts                 # Helper functions
│   ├── bot-verification.ts      # Bot access checks
│   ├── mock-competitors.ts      # Sample competitor data
│   ├── phase-calculator.ts      # Optimization phases
│   └── appsumo-tiers.ts         # AppSumo tier definitions & validation
├── utils/supabase/              # Supabase configuration
│   ├── client.ts                # Client-side Supabase client
│   ├── server.ts                # Server-side Supabase client
│   └── types.ts                 # Database types
├── supabase/
│   ├── migrations/              # Database migrations
│   └── functions/               # Edge functions
├── hooks/                       # Custom React hooks
│   ├── use-subscription.ts      # Subscription management
│   ├── use-limit-check.ts       # Feature limit checking
│   ├── use-credit-deduction.ts  # Credit usage tracking
│   └── use-toast.ts             # Toast notifications
├── middleware.ts                # Route protection
├── package.json                 # Dependencies
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## Usage

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Core Workflows

### 1. Analyzing a Web Page

```typescript
// Submit URL for analysis
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com/page' })
});

// The system will:
// 1. Scrape page content via Jina.ai
// 2. Extract metadata, structure, and schema
// 3. Calculate AI readiness scores
// 4. Generate platform-specific recommendations
// 5. Return comprehensive analysis
```

### 2. Viewing Platform-Specific Scores

Each platform has unique preferences:

- **ChatGPT**: Prefers clarity, short paragraphs, conversational tone
- **Claude**: Values nuanced arguments, citations, balanced content
- **Gemini**: Heavily weights schema markup and mobile optimization
- **Perplexity**: Prioritizes multiple sources and citation depth

### 3. Implementing Fixes

```typescript
// Generate schema markup
const fix = await generateFix({
  pageId: 'page-uuid',
  fixType: 'schema',
  contentType: 'article'
});

// Returns JSON-LD schema ready to copy-paste
```

### 4. Competitive Analysis

Track how your content compares to competitors:

```typescript
// Add competitor
await supabase.from('competitive_analysis').insert({
  website_id: 'your-website-id',
  competitor_url: 'competitor.com',
  competitor_score: 85,
  gap_analysis: {...}
});
```

### 5. Managing AppSumo Lifetime Deals

**Code Redemption (End User Flow):**

```typescript
// User visits /redeem page and enters code
// System validates code format (LTD-T1-XXXX, LTD-T2-XXXX, LTD-T3-XXXX)
// API checks if code is valid, unclaimed, and not revoked
// User tier upgraded automatically (or stacked to next tier)
// User redirected to dashboard with new limits applied
```

**Admin Code Management:**

```typescript
// Navigate to /admin/codes
// Bulk upload codes via CSV (code, tier columns)
// Search and filter codes by tier, status, user email
// View claimed/unclaimed count statistics
// Revoke codes for refunds (automatically downgrades user tier)
```

**Admin User Management:**

```typescript
// Navigate to /admin/users
// Search users by email, tier, or lifetime deal status
// Manually adjust credits (positive or negative)
  - Use case: "Make good" for support issues
  - Example: +50 credits for bug compensation
// Change user tier manually
  - Use case: Emergency tier change or migration
  - Automatically updates limits based on new tier
```

**Admin System Monitoring:**

```typescript
// Navigate to /admin/system
// View total API costs (estimated)
// Monitor credit consumption by feature
// Track usage patterns for capacity planning
// Identify potential cost overruns before they happen
```

### 6. Perplexity Table Conversion

Convert comparative text to structured tables for improved Perplexity citations:

**What it does:** Automatically detects comparative content in your paragraphs and converts them to HTML tables optimized for Perplexity's AI parsing.

**When it triggers:** The system detects 2+ paragraphs with comparative data (pricing, features, metrics, performance comparisons).

**How to use:**

1. **Analyze your page** with comparative content
2. **Look for the recommendation**: "Convert Comparative Text to Tables"
3. **Click "Generate Table Conversions"** button
4. **Navigate samples** using Previous/Next buttons to review detected paragraphs
5. **Click "Generate Optimized Table"** for the selected paragraph
6. **Copy the HTML code** using the copy button
7. **Replace the paragraph** in your content with the generated table
8. **Perplexity score improves** by +8-12 points per conversion

**Detection patterns:**
- Comparative language (vs, versus, compared to, while, whereas)
- Pricing comparisons ($99 vs $149)
- Metric comparisons (10GB vs 20GB, 5% vs 10%)
- Feature comparisons (has X but lacks Y)
- Performance benchmarks (2x faster, 50% more)
- Numeric comparisons (direct number vs number)
- Size/scale comparisons (larger than, smaller than)
- Quality comparisons (better, worse, superior)

**Research backing:** Tables are cited 3.2x more frequently by Perplexity than paragraph text.

**Impact:** +8-12 points improvement to Perplexity platform score, 3.2x increase in citation likelihood.

**Example transformation:**

**Before (Paragraph):**
```
Product A costs $99/month and includes 10GB storage, while Product B costs
$149/month but offers 20GB storage and priority support.
```

**After (Generated Table):**
```html
<table class="perplexity-optimized-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Product A</th>
      <th>Product B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Price</td>
      <td>$99/month</td>
      <td>$149/month</td>
    </tr>
    <tr>
      <td>Storage</td>
      <td>10GB</td>
      <td>20GB</td>
    </tr>
    <tr>
      <td>Support</td>
      <td>Standard</td>
      <td>Priority</td>
    </tr>
  </tbody>
</table>
```

## API Endpoints (Edge Functions)

### Analyze Page

**Function**: `analyze-page`
**Method**: POST
**Description**: Analyzes a web page for AI readiness

```typescript
// Request
{
  "url": "https://example.com/page",
  "websiteId": "uuid"
}

// Response
{
  "pageData": {...},
  "scores": {
    "overall": 78,
    "structure": 25,
    "metadata": 20,
    "content": 18,
    "citationPattern": 15
  },
  "recommendations": [...]
}
```

### Generate Fix

**Function**: `generate-fix`
**Method**: POST
**Description**: Generates optimization fixes using AI

```typescript
// Request (Schema Fix)
{
  "pageId": "uuid",
  "fixType": "schema" | "title" | "description" | "structure" | "paragraph-to-table",
  "content": "page content"
}

// Response (Schema Fix)
{
  "fixType": "schema",
  "schemaJson": {...},
  "explanation": "Why this fix helps",
  "estimatedImpact": "+8 points"
}

// Request (Paragraph-to-Table Fix)
{
  "pageId": "uuid",
  "fixType": "paragraph-to-table",
  "currentContent": {
    "paragraphText": "Product A costs $99 while Product B costs $149...",
    "dataType": "pricing"
  }
}

// Response (Paragraph-to-Table Fix)
{
  "fixType": "paragraph-to-table",
  "html": "<table class='perplexity-optimized-table'>...</table>",
  "explanation": "Structured tables improve Perplexity citation rates by 3.2x",
  "estimatedImpact": "+8 points"
}
```

### Analyze Sentiment

**Function**: `analyze-sentiment`
**Method**: POST
**Description**: Analyzes sentiment of content/citations

### Calculate Share of Voice

**Function**: `calculate-share-of-voice`
**Method**: POST
**Description**: Calculates competitive positioning metrics

## Admin API Endpoints

### Revoke Redemption Code

**Endpoint**: `/api/admin/codes/revoke`
**Method**: POST
**Description**: Revokes an AppSumo code and downgrades the user
**Auth**: Requires is_admin = true

```typescript
// Request
{
  "code": "LTD-T1-ABCD1234",
  "reason": "Refund processed"
}

// Response (Success)
{
  "success": true,
  "message": "Code revoked successfully",
  "code": "LTD-T1-ABCD1234",
  "user_email": "user@example.com",
  "old_tier": 1,
  "new_tier": 0
}

// Response (Error)
{
  "success": false,
  "error": "Code not found" | "Code not claimed" | "Unauthorized"
}
```

### Adjust User Credits

**Endpoint**: `/api/admin/users/adjust-credits`
**Method**: POST
**Description**: Manually adjust user's credit balance
**Auth**: Requires is_admin = true

```typescript
// Request
{
  "user_id": "uuid",
  "credit_change": 50,  // Can be positive or negative
  "reason": "Compensation for bug"
}

// Response (Success)
{
  "success": true,
  "message": "Credits adjusted successfully",
  "user_email": "user@example.com",
  "old_total": 100,
  "new_total": 150
}
```

### Change User Tier

**Endpoint**: `/api/admin/users/change-tier`
**Method**: POST
**Description**: Manually change user's tier and limits
**Auth**: Requires is_admin = true

```typescript
// Request
{
  "user_id": "uuid",
  "new_tier": 2,  // 0 (free), 1, 2, or 3
  "reason": "Manual tier migration"
}

// Response (Success)
{
  "success": true,
  "message": "Tier changed successfully",
  "user_email": "user@example.com",
  "old_tier": 1,
  "new_tier": 2,
  "new_limits": {
    "credits": 250,
    "websites": 10,
    "keywords": 100
  }
}
```

## Database Schema

### Core Scoring Formula

```sql
AI_Readiness_Score =
  (structure_score * 0.30) +    -- 0-30 points
  (metadata_score * 0.25) +     -- 0-25 points
  (content_score * 0.25) +      -- 0-25 points
  (citation_pattern_score * 0.20) -- 0-20 points
-- Total: 0-100 points
```

### Structure Score (0-30 points)
- H1 count >= 1: +15 points
- H2 count >= 2: +15 points
- List structure present: +5 points

### Metadata Score (0-25 points)
- Title length 30-60 chars: +12 points
- Meta description 120-160 chars: +13 points

### Content Score (0-25 points)
- Readability (Flesch-Kincaid): normalized 0-25
- Word count, clarity, structure

### Citation Pattern Score (0-20 points)
- FAQ schema present: +10 points
- HowTo schema present: +10 points

## Key Insights from Research

The platform is built on published research findings:

1. **Structure Matters**: Bullet points boost AI inclusion by 4.72% (Surfer SEO)
2. **Sequential Steps**: Increase citation likelihood by 5.42% (Surfer SEO)
3. **Authority Signals**: Government sources 11.75x more likely to be cited
4. **Freshness**: ChatGPT cites content 25.7% fresher than average
5. **Position Correlation**: 40.58% of AI citations come from Google top 10
6. **Structured Data**: Perplexity displays 8-12 sources per query and cites tabular data 3.2x more frequently than paragraph text (Technical Accessibility Research)

## Competitive Advantages

### 1. Research-Backed Transparency
Every recommendation includes:
- Research source citation
- Statistical backing
- Estimated impact
- Implementation priority

### 2. Platform-Specific Analysis
Individual optimization paths for each AI model:
- ChatGPT optimization roadmap
- Claude-specific improvements
- Gemini schema requirements
- Perplexity citation strategies

### 3. Competitive Intelligence
- Gap analysis vs top competitors
- Realistic timeline projections
- Phased improvement roadmap
- Monthly milestone tracking

### 4. Perplexity-Specific Optimization
- First tool to offer automated comparative content detection with 8 pattern types
- AI-powered table generation via Gemini (not just recommendations)
- Multiple sample detection with confidence scoring (0-100 scale)
- One-click implementation with copy-paste HTML
- Research-backed 3.2x citation improvement
- Interactive modal with sample navigation
- Real-time table preview

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow Next.js 13 App Router conventions
- Use server components by default, client components only when needed
- Implement proper error handling
- Add meaningful comments for complex logic

### Component Organization

- Keep components focused and single-purpose
- Use shadcn/ui components for consistency
- Extract reusable logic into custom hooks
- Implement proper loading and error states

### Database Best Practices

- Always use Row Level Security (RLS)
- Create indexes for frequently queried columns
- Use transactions for multi-table operations
- Implement proper error handling
- Never expose sensitive data

## Deployment

### Bolt Hosting (Current Setup)

This project is configured to run on **Bolt.new hosting** with **Supabase** for database and authentication.

**No external hosting setup required.** Bolt handles all hosting infrastructure automatically.

### Environment Variables

The following environment variables are configured in your `.env` file:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for Edge Functions only)

## Monitoring & Analytics

The platform includes built-in analytics:

- Citation frequency tracking
- Score improvement over time
- Competitive position changes
- Bot access verification
- Entity recognition accuracy

## Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are correct

2. **Scraping failures**
   - Check Jina.ai API key
   - Verify target URL is accessible
   - Check for rate limits

3. **Score calculation errors**
   - Ensure page_data is complete
   - Check readability score calculation
   - Verify schema detection logic

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

### Phase 1 (Current)
- AI Readiness Audit
- Platform-specific scoring
- Basic recommendations

### Phase 2 (Next)
- Google Search Console integration
- Advanced competitive analysis
- Citation tracking automation

### Phase 3 (Future)
- Multi-site management
- Team collaboration features
- White-label options
- API access for developers

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team or open an issue in the repository.

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

Research sources:
- Surfer SEO Case Studies
- ClickRank.ai Insights
- Google AI Overview Documentation
- Perplexity Research Papers

---

**Version**: 1.3.0
**Last Updated**: December 13, 2024

**Latest Features**:
- **Admin Panel for AppSumo Launch**: Complete admin interface with LTD code management, user management, and system health monitoring
- AppSumo Lifetime Deal Integration: 3-tier LTD system with code stacking, redemption, and revocation
- Authentication & Tiered Subscription System (Free/Pro/Agency + AppSumo Tiers)
- Credit-based AI feature usage with automatic tracking
- Perplexity Table Conversion Optimizer - Auto-detect and convert comparative content to structured tables with 3.2x citation improvement
- Audit Logging: Complete trail of all admin actions for compliance and debugging

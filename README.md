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
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions (Deno runtime)
- **API Client**: Supabase JavaScript Client

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
- `users` - User accounts with GSC integration
- `websites` - Tracked websites
- `tracked_keywords` - Keywords being monitored
- `page_data` - Scraped page content and metadata
- `scores` - AI readiness scores

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

### 5. Deploy Edge Functions

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
│   ├── keywords/                # Keyword management
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
│   └── url-input.tsx            # URL submission form
├── lib/                         # Utility libraries
│   ├── types.ts                 # TypeScript type definitions
│   ├── utils.ts                 # Helper functions
│   ├── bot-verification.ts      # Bot access checks
│   ├── mock-competitors.ts      # Sample competitor data
│   └── phase-calculator.ts      # Optimization phases
├── utils/supabase/              # Supabase configuration
│   ├── client.ts                # Client-side Supabase client
│   ├── server.ts                # Server-side Supabase client
│   └── types.ts                 # Database types
├── supabase/
│   ├── migrations/              # Database migrations
│   └── functions/               # Edge functions
├── hooks/                       # Custom React hooks
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

### 5. Perplexity Table Conversion

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

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables

Required in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

**Version**: 1.1.0
**Last Updated**: December 12, 2024

**Latest Feature**: Perplexity Table Conversion Optimizer - Auto-detect and convert comparative content to structured tables with 3.2x citation improvement

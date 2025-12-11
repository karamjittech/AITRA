import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzePageRequest {
  url: string;
  userId: string;
}

interface PageAnalysis {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  wordCount: number;
  hasFaqSchema: boolean;
  hasHowtoSchema: boolean;
  hasArticleSchema: boolean;
  hasListStructure: boolean;
  readabilityScore: number;
  externalLinkCount: number;
  uniqueRefDomainCount: number;
  avgParagraphWords: number;
  bulletRatio: number;
  dataDensityScore: number;
  citationPatternCount: number;
  argumentDepthScore: number;
  hasViewportTag: boolean;
  hasAuthorSchema: boolean;
  hasOrganizationSchema: boolean;
  hasPersonSchema: boolean;
  hasSameAsLinks: boolean;
  sameAsPlatforms: string[];
  entityType: string;
  entityIdentityScore: number;
  qaPairsCount: number;
  hasDirectAnswers: boolean;
  listDensity: number;
  ulCount: number;
  olCount: number;
  tableCount: number;
  hasTables: boolean;
  introFluffScore: number;
  introDensityScore: number;
  hasTldr: boolean;
  aeoScore: number;
  hasComparativeParagraphs: boolean;
  comparativeDataScore: number;
  comparativeParagraphCount: number;
  perplexityTableRecommendation: boolean;
  comparativeContentSamples: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
}

interface Scores {
  structureScore: number;
  metadataScore: number;
  contentScore: number;
  schemaScore: number;
  aeoScore: number;
  overallScore: number;
}

interface PlatformScores {
  geminiScore: number;
  chatgptScore: number;
  claudeScore: number;
  perplexityScore: number;
  geminiSchemaComponent: number;
  geminiMobileComponent: number;
  chatgptStructureComponent: number;
  chatgptClarityComponent: number;
  claudeCitationComponent: number;
  claudeNuanceComponent: number;
  perplexityExternalLinksComponent: number;
  perplexityDataComponent: number;
}

type BotName = 'GPTBot' | 'CCBot' | 'Google-Extended' | 'FacebookBot' | 'PerplexityBot';

interface BotVerificationResult {
  botName: BotName;
  isAllowed: boolean;
  blockReason: string | null;
  robotsTxtRule: string | null;
}

interface ParsedRobotsTxt {
  rules: Map<string, { userAgent: string; disallow: string[]; allow: string[] }>;
  hasWildcard: boolean;
}

const BOT_CONFIGS = [
  { name: 'GPTBot' as BotName, userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)' },
  { name: 'CCBot' as BotName, userAgent: 'CCBot/2.0 (https://commoncrawl.org/faq/)' },
  { name: 'Google-Extended' as BotName, userAgent: 'Mozilla/5.0 (compatible; Google-Extended)' },
  { name: 'FacebookBot' as BotName, userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
  { name: 'PerplexityBot' as BotName, userAgent: 'PerplexityBot/1.0 (+https://perplexity.ai/bot)' }
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const jinaApiKey = "jina_2f85acbc6e654ca298a8d8d720c7e07bnGWOAjlZho2vCjt5qvJry-w_yUYp";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Invalid JSON in request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { url, userId }: AnalyzePageRequest = requestBody;

    if (!url || !userId) {
      console.error("Missing required parameters:", { url, userId });
      return new Response(
        JSON.stringify({ error: "URL and userId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      console.error("Invalid URL format:", url, e);
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const domain = urlObj.hostname;

    console.log(`Starting analysis for URL: ${url}, User: ${userId}, Domain: ${domain}`);

    console.log("Fetching content from Jina.ai...");
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const jinaResponse = await fetch(jinaUrl, {
      headers: {
        Authorization: `Bearer ${jinaApiKey}`,
        "X-Return-Format": "html",
      },
    });

    if (!jinaResponse.ok) {
      const errorText = await jinaResponse.text();
      console.error(`Jina.ai API error: ${jinaResponse.status} ${jinaResponse.statusText}`, errorText);
      throw new Error(`Failed to fetch page content: ${jinaResponse.statusText}`);
    }

    const htmlContent = await jinaResponse.text();
    console.log(`Fetched ${htmlContent.length} characters from Jina.ai`);

    console.log("Analyzing HTML content...");
    const analysis = analyzeHTML(htmlContent);
    console.log("Analysis complete:", analysis);

    console.log("Calculating scores...");
    const scores = calculateScores(analysis);
    console.log("Scores calculated:", scores);

    console.log("Calculating platform-specific scores...");
    const platformScores = calculatePlatformScores(analysis);
    console.log("Platform scores calculated:", platformScores);

    console.log("Verifying bot access...");
    const botVerificationResults = await verifyBotAccess(domain, url);
    console.log("Bot verification complete:", botVerificationResults);

    const blockedBotsCount = botVerificationResults.filter(r => !r.isAllowed).length;
    const botPenalty = calculateBotPenalty(blockedBotsCount);
    console.log(`Blocked bots: ${blockedBotsCount}, Penalty: ${botPenalty}`);

    const adjustedOverallScore = Math.max(0, scores.overallScore - botPenalty);
    scores.overallScore = Math.round(adjustedOverallScore * 10) / 10;

    console.log("Checking for existing website record...");
    const websiteRecord = await supabase
      .from("websites")
      .select("id")
      .eq("user_id", userId)
      .eq("url", url)
      .maybeSingle();

    if (websiteRecord.error) {
      console.error("Error checking website record:", websiteRecord.error);
      throw new Error(`Database error (websites check): ${websiteRecord.error.message}`);
    }

    let websiteId: string;

    if (!websiteRecord.data) {
      console.log("Creating new website record...");
      const newWebsite = await supabase
        .from("websites")
        .insert({
          user_id: userId,
          url: url,
          domain: domain,
          last_scraped: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (newWebsite.error) {
        console.error("Error creating website:", newWebsite.error);
        throw new Error(`Failed to create website record: ${newWebsite.error.message}`);
      }
      websiteId = newWebsite.data.id;
      console.log("Website created with ID:", websiteId);
    } else {
      websiteId = websiteRecord.data.id;
      console.log("Using existing website ID:", websiteId);

      const updateResult = await supabase
        .from("websites")
        .update({ last_scraped: new Date().toISOString() })
        .eq("id", websiteId);

      if (updateResult.error) {
        console.error("Error updating website:", updateResult.error);
      }
    }

    console.log("Checking for existing page record...");
    const existingPage = await supabase
      .from("page_data")
      .select("id")
      .eq("website_id", websiteId)
      .eq("url", url)
      .maybeSingle();

    if (existingPage.error) {
      console.error("Error checking page record:", existingPage.error);
      throw new Error(`Database error (page_data check): ${existingPage.error.message}`);
    }

    let pageId: string;

    if (existingPage.data) {
      console.log("Updating existing page record:", existingPage.data.id);
      const updateResult = await supabase
        .from("page_data")
        .update({
          title: analysis.title,
          meta_description: analysis.metaDescription,
          h1_count: analysis.h1Count,
          h2_count: analysis.h2Count,
          has_faq_schema: analysis.hasFaqSchema,
          has_howto_schema: analysis.hasHowtoSchema,
          has_list_structure: analysis.hasListStructure,
          readability_score: analysis.readabilityScore,
          has_organization_schema: analysis.hasOrganizationSchema,
          has_person_schema: analysis.hasPersonSchema,
          has_same_as_links: analysis.hasSameAsLinks,
          same_as_platforms: analysis.sameAsPlatforms,
          entity_type: analysis.entityType,
          entity_identity_score: analysis.entityIdentityScore,
          qa_pairs_count: analysis.qaPairsCount,
          has_direct_answers: analysis.hasDirectAnswers,
          list_density: analysis.listDensity,
          ul_count: analysis.ulCount,
          ol_count: analysis.olCount,
          table_count: analysis.tableCount,
          has_tables: analysis.hasTables,
          intro_fluff_score: analysis.introFluffScore,
          intro_density_score: analysis.introDensityScore,
          has_tldr: analysis.hasTldr,
          aeo_score: analysis.aeoScore,
          has_comparative_paragraphs: analysis.hasComparativeParagraphs,
          comparative_data_score: analysis.comparativeDataScore,
          comparative_paragraph_count: analysis.comparativeParagraphCount,
          perplexity_table_recommendation: analysis.perplexityTableRecommendation,
          comparative_content_samples: analysis.comparativeContentSamples,
          last_scraped: new Date().toISOString(),
        })
        .eq("id", existingPage.data.id);

      if (updateResult.error) {
        console.error("Error updating page:", updateResult.error);
        throw new Error(`Failed to update page data: ${updateResult.error.message}`);
      }

      pageId = existingPage.data.id;
      console.log("Page updated successfully");
    } else {
      console.log("Creating new page record...");
      const newPage = await supabase
        .from("page_data")
        .insert({
          website_id: websiteId,
          url: url,
          title: analysis.title,
          meta_description: analysis.metaDescription,
          h1_count: analysis.h1Count,
          h2_count: analysis.h2Count,
          has_faq_schema: analysis.hasFaqSchema,
          has_howto_schema: analysis.hasHowtoSchema,
          has_list_structure: analysis.hasListStructure,
          readability_score: analysis.readabilityScore,
          has_organization_schema: analysis.hasOrganizationSchema,
          has_person_schema: analysis.hasPersonSchema,
          has_same_as_links: analysis.hasSameAsLinks,
          same_as_platforms: analysis.sameAsPlatforms,
          entity_type: analysis.entityType,
          entity_identity_score: analysis.entityIdentityScore,
          qa_pairs_count: analysis.qaPairsCount,
          has_direct_answers: analysis.hasDirectAnswers,
          list_density: analysis.listDensity,
          ul_count: analysis.ulCount,
          ol_count: analysis.olCount,
          table_count: analysis.tableCount,
          has_tables: analysis.hasTables,
          intro_fluff_score: analysis.introFluffScore,
          intro_density_score: analysis.introDensityScore,
          has_tldr: analysis.hasTldr,
          aeo_score: analysis.aeoScore,
          has_comparative_paragraphs: analysis.hasComparativeParagraphs,
          comparative_data_score: analysis.comparativeDataScore,
          comparative_paragraph_count: analysis.comparativeParagraphCount,
          perplexity_table_recommendation: analysis.perplexityTableRecommendation,
          comparative_content_samples: analysis.comparativeContentSamples,
          last_scraped: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (newPage.error) {
        console.error("Error creating page:", newPage.error);
        throw new Error(`Failed to create page record: ${newPage.error.message}`);
      }
      pageId = newPage.data.id;
      console.log("Page created with ID:", pageId);
    }

    console.log("Storing bot access verification results...");
    for (const botResult of botVerificationResults) {
      const botAccessInsert = await supabase
        .from("bot_access")
        .upsert({
          page_id: pageId,
          bot_name: botResult.botName,
          is_allowed: botResult.isAllowed,
          block_reason: botResult.blockReason,
          robots_txt_rule: botResult.robotsTxtRule,
          checked_at: new Date().toISOString(),
        }, {
          onConflict: 'page_id,bot_name'
        });

      if (botAccessInsert.error) {
        console.error(`Error storing bot access for ${botResult.botName}:`, botAccessInsert.error);
      }
    }
    console.log("Bot access data stored successfully");

    console.log("Inserting score record...");
    const scoreInsert = await supabase
      .from("scores")
      .insert({
        page_id: pageId,
        structure_score: scores.structureScore,
        metadata_score: scores.metadataScore,
        content_score: scores.contentScore,
        citation_pattern_score: scores.schemaScore,
        aeo_score: scores.aeoScore,
        overall_ai_readiness: scores.overallScore,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (scoreInsert.error) {
      console.error("Error inserting score:", scoreInsert.error);
      throw new Error(`Failed to save scores: ${scoreInsert.error.message}`);
    }

    console.log("Inserting platform score record...");
    const platformScoreInsert = await supabase
      .from("platform_scores")
      .insert({
        page_id: pageId,
        gemini_score: platformScores.geminiScore,
        chatgpt_score: platformScores.chatgptScore,
        claude_score: platformScores.claudeScore,
        perplexity_score: platformScores.perplexityScore,
        gemini_schema_component: platformScores.geminiSchemaComponent,
        gemini_mobile_component: platformScores.geminiMobileComponent,
        chatgpt_structure_component: platformScores.chatgptStructureComponent,
        chatgpt_clarity_component: platformScores.chatgptClarityComponent,
        claude_citation_component: platformScores.claudeCitationComponent,
        claude_nuance_component: platformScores.claudeNuanceComponent,
        perplexity_external_links_component: platformScores.perplexityExternalLinksComponent,
        perplexity_data_component: platformScores.perplexityDataComponent,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (platformScoreInsert.error) {
      console.error("Error inserting platform scores:", platformScoreInsert.error);
      throw new Error(`Failed to save platform scores: ${platformScoreInsert.error.message}`);
    }

    console.log("Generating mock competitor data...");
    const competitors = generateMockCompetitors(scores.overallScore, analysis.wordCount);

    console.log("Inserting competitor benchmarks...");
    for (const competitor of competitors) {
      const competitorInsert = await supabase
        .from("competitor_benchmarks")
        .insert({
          page_id: pageId,
          competitor_name: competitor.name,
          competitor_url: competitor.url,
          competitor_domain: competitor.domain,
          domain_rating: competitor.domainRating,
          backlink_count: competitor.backlinkCount,
          content_length: competitor.contentLength,
          h1_count: competitor.h1Count,
          h2_count: competitor.h2Count,
          schema_present: competitor.schemaPresent,
          freshness_days: competitor.freshnessDays,
          overall_score: competitor.overallScore,
          google_rank: competitor.googleRank,
          ai_citation_percentage: competitor.aiCitationPercentage,
          is_mock_data: true,
        });

      if (competitorInsert.error) {
        console.error("Error inserting competitor:", competitorInsert.error);
      }
    }

    console.log("Calculating roadmap phase...");
    const currentPhase = calculateCurrentPhase(scores.overallScore);

    console.log("Checking for existing roadmap...");
    const existingRoadmap = await supabase
      .from("optimization_roadmap")
      .select("id")
      .eq("page_id", pageId)
      .maybeSingle();

    if (existingRoadmap.data) {
      console.log("Updating existing roadmap...");
      const updateRoadmap = await supabase
        .from("optimization_roadmap")
        .update({
          current_phase: currentPhase,
          phase_1_completed: scores.overallScore >= 50,
          phase_2_completed: scores.overallScore >= 75,
          phase_3_completed: scores.overallScore >= 85,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRoadmap.data.id);

      if (updateRoadmap.error) {
        console.error("Error updating roadmap:", updateRoadmap.error);
      }
    } else {
      console.log("Creating new roadmap...");
      const roadmapInsert = await supabase
        .from("optimization_roadmap")
        .insert({
          page_id: pageId,
          current_phase: currentPhase,
          phase_1_completed: scores.overallScore >= 50,
          phase_2_completed: scores.overallScore >= 75,
          phase_3_completed: scores.overallScore >= 85,
          estimated_completion_weeks: estimateWeeksToComplete(scores.overallScore),
        });

      if (roadmapInsert.error) {
        console.error("Error inserting roadmap:", roadmapInsert.error);
      }
    }

    console.log("Analysis complete! Score ID:", scoreInsert.data.id);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        scores: scores,
        platformScores: platformScores,
        pageId: pageId,
        websiteId: websiteId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error analyzing page:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function analyzeHTML(html: string): PageAnalysis {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const metaDescMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
  );
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;

  const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi);
  const h1Count = h1Matches ? h1Matches.length : 0;

  const h2Matches = html.match(/<h2[^>]*>.*?<\/h2>/gi);
  const h2Count = h2Matches ? h2Matches.length : 0;

  const h3Matches = html.match(/<h3[^>]*>.*?<\/h3>/gi);
  const h3Count = h3Matches ? h3Matches.length : 0;

  const textContent = html
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = textContent.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  const hasFaqSchema =
    html.includes('"@type":"FAQPage"') ||
    html.includes('"@type": "FAQPage"') ||
    html.includes("FAQPage");
  const hasHowtoSchema =
    html.includes('"@type":"HowTo"') ||
    html.includes('"@type": "HowTo"') ||
    html.includes("HowTo");
  const hasArticleSchema =
    html.includes('"@type":"Article"') ||
    html.includes('"@type": "Article"') ||
    html.includes("NewsArticle") ||
    html.includes("BlogPosting");
  const hasAuthorSchema =
    html.includes('"@type":"Person"') ||
    html.includes('"author"') ||
    html.includes('"Person"');

  const hasListStructure =
    html.includes("<ul") ||
    html.includes("<ol") ||
    html.includes("<UL") ||
    html.includes("<OL");

  const readabilityScore = calculateReadabilityScore(textContent, wordCount);

  const externalLinkMatches = html.match(/<a[^>]+href=["']https?:\/\/[^"']+["']/gi) || [];
  const externalLinkCount = externalLinkMatches.length;

  const uniqueDomains = new Set<string>();
  externalLinkMatches.forEach((link) => {
    const urlMatch = link.match(/href=["'](https?:\/\/[^"']+)["']/i);
    if (urlMatch) {
      try {
        const domain = new URL(urlMatch[1]).hostname;
        uniqueDomains.add(domain);
      } catch (e) {
      }
    }
  });
  const uniqueRefDomainCount = uniqueDomains.size;

  const paragraphs = html.match(/<p[^>]*>.*?<\/p>/gi) || [];
  let totalParagraphWords = 0;
  paragraphs.forEach((p) => {
    const pText = p.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const pWords = pText.split(/\s+/).filter((w) => w.length > 0);
    totalParagraphWords += pWords.length;
  });
  const avgParagraphWords = paragraphs.length > 0 ? totalParagraphWords / paragraphs.length : 0;

  const listItems = (html.match(/<li[^>]*>/gi) || []).length;
  const totalLines = textContent.split(/\n/).length;
  const bulletRatio = totalLines > 0 ? listItems / totalLines : 0;

  const numberMatches = textContent.match(/\d+%|\d{4}|\d+\.\d+|\$\d+/g) || [];
  const dataDensityScore = wordCount > 0 ? (numberMatches.length / wordCount) * 1000 : 0;

  const citationPatterns = [
    /according to/gi,
    /research shows/gi,
    /study found/gi,
    /published in/gi,
    /source:/gi,
  ];
  let citationPatternCount = 0;
  citationPatterns.forEach((pattern) => {
    const matches = textContent.match(pattern);
    if (matches) citationPatternCount += matches.length;
  });

  const argumentWords = [
    /because/gi,
    /however/gi,
    /on the other hand/gi,
    /although/gi,
    /despite/gi,
    /nevertheless/gi,
  ];
  let argumentDepthScore = 0;
  argumentWords.forEach((pattern) => {
    const matches = textContent.match(pattern);
    if (matches) argumentDepthScore += matches.length;
  });
  argumentDepthScore = wordCount > 0 ? (argumentDepthScore / wordCount) * 1000 : 0;

  const hasViewportTag = html.includes('name="viewport"') || html.includes("name='viewport'");

  const hasOrganizationSchema =
    html.includes('"@type":"Organization"') ||
    html.includes('"@type": "Organization"') ||
    html.includes('"Organization"');

  const hasPersonSchema =
    (html.includes('"@type":"Person"') ||
    html.includes('"@type": "Person"')) &&
    !hasAuthorSchema;

  const sameAsRegex = /"sameAs"\s*:\s*\[([^\]]+)\]|"sameAs"\s*:\s*"([^"]+)"/gi;
  const sameAsMatches = [...html.matchAll(sameAsRegex)];
  const hasSameAsLinks = sameAsMatches.length > 0;

  const sameAsPlatforms: string[] = [];
  if (hasSameAsLinks) {
    sameAsMatches.forEach(match => {
      const urls = match[1] || match[2];
      if (urls) {
        if (urls.includes('wikipedia.org')) sameAsPlatforms.push('Wikipedia');
        if (urls.includes('wikidata.org')) sameAsPlatforms.push('Wikidata');
        if (urls.includes('linkedin.com')) sameAsPlatforms.push('LinkedIn');
        if (urls.includes('twitter.com') || urls.includes('x.com')) sameAsPlatforms.push('Twitter/X');
        if (urls.includes('facebook.com')) sameAsPlatforms.push('Facebook');
        if (urls.includes('instagram.com')) sameAsPlatforms.push('Instagram');
        if (urls.includes('crunchbase.com')) sameAsPlatforms.push('Crunchbase');
      }
    });
  }

  let entityType = 'none';
  if (hasOrganizationSchema && hasPersonSchema) {
    entityType = 'both';
  } else if (hasOrganizationSchema) {
    entityType = 'organization';
  } else if (hasPersonSchema) {
    entityType = 'person';
  }

  let entityIdentityScore = 0;
  if (hasOrganizationSchema) {
    entityIdentityScore += 5;
  }
  if (hasPersonSchema) {
    entityIdentityScore += 3;
  }
  if (hasSameAsLinks) {
    entityIdentityScore += 7;
  }

  const qaPairsCount = detectQAPairs(html);
  const hasDirectAnswers = qaPairsCount > 0;

  const ulCount = (html.match(/<ul[^>]*>/gi) || []).length;
  const olCount = (html.match(/<ol[^>]*>/gi) || []).length;
  const totalListItems = (html.match(/<li[^>]*>/gi) || []).length;
  const listDensity = wordCount > 0 ? (totalListItems / (wordCount / 20)) * 100 : 0;

  const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
  let tableCount = 0;
  tableMatches.forEach(table => {
    const rows = (table.match(/<tr[^>]*>/gi) || []).length;
    const cols = (table.match(/<td[^>]*>/gi) || []).length / (rows || 1);
    if (rows > 2 && cols > 2) {
      tableCount++;
    }
  });
  const hasTables = tableCount > 0;

  const first100Words = words.slice(0, 100).join(' ');
  const introFluffScore = calculateFluffScore(first100Words);
  const introDensityScore = 100 - introFluffScore;

  const hasTldr = /\b(tl;?dr|key takeaways?|summary|in brief|quick summary)\b/i.test(textContent);

  const aeoScore = calculateAEOScore(qaPairsCount, listDensity, tableCount, introFluffScore);

  const comparativeData = detectComparativeData(html, paragraphs);

  return {
    title,
    metaDescription,
    h1Count,
    h2Count,
    h3Count,
    wordCount,
    hasFaqSchema,
    hasHowtoSchema,
    hasArticleSchema,
    hasListStructure,
    readabilityScore,
    externalLinkCount,
    uniqueRefDomainCount,
    avgParagraphWords,
    bulletRatio,
    dataDensityScore,
    citationPatternCount,
    argumentDepthScore,
    hasViewportTag,
    hasAuthorSchema,
    hasOrganizationSchema,
    hasPersonSchema,
    hasSameAsLinks,
    sameAsPlatforms: [...new Set(sameAsPlatforms)],
    entityType,
    entityIdentityScore,
    qaPairsCount,
    hasDirectAnswers,
    listDensity: Math.min(100, listDensity),
    ulCount,
    olCount,
    tableCount,
    hasTables,
    introFluffScore,
    introDensityScore,
    hasTldr,
    aeoScore,
    hasComparativeParagraphs: comparativeData.hasComparativeParagraphs,
    comparativeDataScore: comparativeData.comparativeDataScore,
    comparativeParagraphCount: comparativeData.comparativeParagraphCount,
    perplexityTableRecommendation: comparativeData.perplexityTableRecommendation,
    comparativeContentSamples: comparativeData.comparativeContentSamples,
  };
}

function detectComparativeData(html: string, paragraphs: string[]) {
  const comparativePatterns = [
    /\b(vs\.?|versus|compared to|while|whereas|but|however|in contrast|on the other hand)\b/gi,
    /\$\d+[,\d]*(\.\d{2})?\s*(vs\.?|versus|compared to|while)\s*\$\d+[,\d]*(\.\d{2})?/gi,
    /\b\d+\s*(GB|MB|TB|hours?|minutes?|days?|%|percent)\s*(vs\.?|versus|while|whereas)\s*\d+\s*(GB|MB|TB|hours?|minutes?|days?|%|percent)/gi,
    /\b(option|plan|tier|package|product|model|version)\s+[A-Z0-9]+\s*(vs\.?|versus|compared to)\s*(option|plan|tier|package|product|model|version)\s+[A-Z0-9]+/gi,
    /\b(faster|slower|cheaper|expensive|better|worse|more|less|higher|lower)\s+than\b/gi,
  ];

  const pricingPatterns = [
    /\$\d+[,\d]*(\.\d{2})?/g,
    /\b\d+\s*USD|EUR|GBP\b/gi,
    /\bfree|paid|premium|basic|pro|enterprise\b/gi,
  ];

  const featurePatterns = [
    /\b(includes?|features?|offers?|provides?|supports?|has|comes with)\b/gi,
    /\b(available in|only in|exclusive to|limited to)\b/gi,
  ];

  const comparativeContentSamples: Array<{ text: string; type: string; confidence: number }> = [];
  let totalComparativeScore = 0;
  let comparativeParagraphCount = 0;

  paragraphs.forEach((p) => {
    const pText = p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const pWords = pText.split(/\s+/).filter((w) => w.length > 0);

    if (pWords.length < 20 || pWords.length > 200) return;

    let paragraphScore = 0;
    let matchType = '';

    comparativePatterns.forEach((pattern) => {
      const matches = pText.match(pattern);
      if (matches) {
        paragraphScore += matches.length * 15;
        matchType = 'comparison';
      }
    });

    const priceMatches = pText.match(pricingPatterns[0]);
    if (priceMatches && priceMatches.length >= 2) {
      paragraphScore += 25;
      matchType = matchType || 'pricing';
    }

    const featureMatches = pText.match(featurePatterns[0]);
    if (featureMatches && featureMatches.length >= 2) {
      paragraphScore += 10;
      matchType = matchType || 'features';
    }

    const hasMultipleNumbers = (pText.match(/\b\d+\b/g) || []).length >= 3;
    const hasUnits = /\b(GB|MB|TB|hours?|minutes?|days?|%|percent)\b/gi.test(pText);
    if (hasMultipleNumbers && hasUnits) {
      paragraphScore += 20;
      matchType = matchType || 'metrics';
    }

    if (paragraphScore >= 25) {
      comparativeParagraphCount++;
      totalComparativeScore += paragraphScore;

      if (comparativeContentSamples.length < 5) {
        comparativeContentSamples.push({
          text: pText.substring(0, 250),
          type: matchType,
          confidence: Math.min(100, paragraphScore),
        });
      }
    }
  });

  const hasComparativeParagraphs = comparativeParagraphCount > 0;
  const comparativeDataScore = paragraphs.length > 0
    ? Math.min(100, (totalComparativeScore / paragraphs.length) * 2)
    : 0;

  const perplexityTableRecommendation =
    hasComparativeParagraphs &&
    comparativeParagraphCount >= 2 &&
    comparativeDataScore >= 30;

  return {
    hasComparativeParagraphs,
    comparativeDataScore: Math.round(comparativeDataScore * 10) / 10,
    comparativeParagraphCount,
    perplexityTableRecommendation,
    comparativeContentSamples,
  };
}

function calculateReadabilityScore(text: string, wordCount: number): number {
  if (wordCount === 0) return 0;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  const syllables = countSyllables(text);

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllables / wordCount;

  const fleschScore =
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, fleschScore));
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, "");
    if (cleanWord.length === 0) continue;

    let syllables = 0;
    const vowels = "aeiouy";
    let previousWasVowel = false;

    for (let i = 0; i < cleanWord.length; i++) {
      const isVowel = vowels.includes(cleanWord[i]);
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      previousWasVowel = isVowel;
    }

    if (cleanWord.endsWith("e")) {
      syllables--;
    }

    if (syllables === 0) {
      syllables = 1;
    }

    totalSyllables += syllables;
  }

  return totalSyllables;
}

function detectQAPairs(html: string): number {
  let qaPairCount = 0;

  const headingMatches = html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
  const questionPatterns = /^(what|how|why|when|where|who|which|can|is|are|does|do|will|would|should)\b|\?$/i;

  for (let i = 0; i < headingMatches.length; i++) {
    const headingText = headingMatches[i].replace(/<[^>]+>/g, '').trim();

    if (questionPatterns.test(headingText)) {
      const headingIndex = html.indexOf(headingMatches[i]);
      const nextHeadingIndex = i < headingMatches.length - 1
        ? html.indexOf(headingMatches[i + 1], headingIndex + headingMatches[i].length)
        : html.length;

      const contentBetween = html.substring(headingIndex + headingMatches[i].length, nextHeadingIndex);
      const hasParagraph = /<p[^>]*>.*?<\/p>/i.test(contentBetween);

      if (hasParagraph) {
        qaPairCount++;
      }
    }
  }

  return qaPairCount;
}

function calculateFluffScore(text: string): number {
  const fluffPhrases = [
    /in today's (digital|modern|fast-paced) (world|age|era|landscape)/i,
    /in this article/i,
    /let's explore/i,
    /we will (discuss|explore|examine|look at)/i,
    /it is important to (note|understand|recognize)/i,
    /as (we all know|you (may )?know)/i,
    /have you ever wondered/i,
    /in recent years/i,
    /over the (past|last) (few|several) (years|decades)/i,
    /throughout history/i,
    /without further ado/i,
    /first and foremost/i,
    /at the end of the day/i,
  ];

  let fluffCount = 0;
  const words = text.split(/\s+/).length;

  if (words === 0) return 0;

  fluffPhrases.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      fluffCount += matches[0].split(/\s+/).length;
    }
  });

  const fluffPercentage = (fluffCount / words) * 100;

  return Math.min(100, fluffPercentage * 5);
}

function calculateAEOScore(
  qaPairsCount: number,
  listDensity: number,
  tableCount: number,
  introFluffScore: number
): number {
  let directAnswersScore = 0;
  if (qaPairsCount >= 5) {
    directAnswersScore = 8;
  } else if (qaPairsCount >= 2) {
    directAnswersScore = 5;
  } else if (qaPairsCount >= 1) {
    directAnswersScore = 3;
  }

  let listScore = 0;
  if (listDensity >= 15 && listDensity <= 30) {
    listScore = 7;
  } else if (listDensity >= 5 && listDensity < 15) {
    listScore = 4;
  } else if (listDensity > 0 && listDensity < 5) {
    listScore = 1;
  }

  let tableScore = 0;
  if (tableCount >= 2) {
    tableScore = 6;
  } else if (tableCount === 1) {
    tableScore = 4;
  }

  let introScore = 0;
  if (introFluffScore <= 20) {
    introScore = 4;
  } else if (introFluffScore <= 50) {
    introScore = 2;
  }

  return directAnswersScore + listScore + tableScore + introScore;
}

function calculateScores(analysis: PageAnalysis): Scores {
  let structureScore = 0;
  if (analysis.h1Count === 1) {
    structureScore += 15;
  }
  if (analysis.h2Count >= 2) {
    structureScore += 15;
  }
  if (analysis.hasListStructure) {
    structureScore += 5;
  }

  let metadataScore = 0;
  if (analysis.title) {
    const titleLength = analysis.title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      metadataScore += 12;
    } else if (titleLength > 0) {
      metadataScore += 6;
    }
  }

  if (analysis.metaDescription) {
    const descLength = analysis.metaDescription.length;
    if (descLength >= 120 && descLength <= 160) {
      metadataScore += 13;
    } else if (descLength > 0) {
      metadataScore += 7;
    }
  }

  let contentScore = 0;
  const normalizedReadability = (analysis.readabilityScore / 100) * 15;
  contentScore += normalizedReadability;

  if (analysis.wordCount >= 500) {
    contentScore += 10;
  } else if (analysis.wordCount >= 300) {
    contentScore += 5;
  }

  let schemaScore = 0;
  if (analysis.hasFaqSchema) {
    schemaScore += 10;
  }
  if (analysis.hasHowtoSchema) {
    schemaScore += 10;
  }

  const aeoScore = analysis.aeoScore;

  const overallScore =
    structureScore * 0.25 +
    metadataScore * 0.2 +
    contentScore * 0.2 +
    schemaScore * 0.2 +
    aeoScore * 0.15;

  return {
    structureScore,
    metadataScore,
    contentScore,
    schemaScore,
    aeoScore,
    overallScore: Math.round(overallScore * 10) / 10,
  };
}

function calculatePlatformScores(analysis: PageAnalysis): PlatformScores {
  const geminiSchemaComponent = calculateGeminiSchema(analysis);
  const geminiMobileComponent = calculateGeminiMobile(analysis);
  const geminiScore = Math.min(100, geminiSchemaComponent + geminiMobileComponent);

  const chatgptStructureComponent = calculateChatGPTStructure(analysis);
  const chatgptClarityComponent = calculateChatGPTClarity(analysis);
  const chatgptScore = Math.min(100, chatgptStructureComponent + chatgptClarityComponent);

  const claudeCitationComponent = calculateClaudeCitation(analysis);
  const claudeNuanceComponent = calculateClaudeNuance(analysis);
  const claudeScore = Math.min(100, claudeCitationComponent + claudeNuanceComponent);

  const perplexityExternalLinksComponent = calculatePerplexityExternalLinks(analysis);
  const perplexityDataComponent = calculatePerplexityData(analysis);
  const perplexityScore = Math.min(100, perplexityExternalLinksComponent + perplexityDataComponent);

  return {
    geminiScore: Math.round(geminiScore * 10) / 10,
    chatgptScore: Math.round(chatgptScore * 10) / 10,
    claudeScore: Math.round(claudeScore * 10) / 10,
    perplexityScore: Math.round(perplexityScore * 10) / 10,
    geminiSchemaComponent: Math.round(geminiSchemaComponent * 10) / 10,
    geminiMobileComponent: Math.round(geminiMobileComponent * 10) / 10,
    chatgptStructureComponent: Math.round(chatgptStructureComponent * 10) / 10,
    chatgptClarityComponent: Math.round(chatgptClarityComponent * 10) / 10,
    claudeCitationComponent: Math.round(claudeCitationComponent * 10) / 10,
    claudeNuanceComponent: Math.round(claudeNuanceComponent * 10) / 10,
    perplexityExternalLinksComponent: Math.round(perplexityExternalLinksComponent * 10) / 10,
    perplexityDataComponent: Math.round(perplexityDataComponent * 10) / 10,
  };
}

function calculateGeminiSchema(analysis: PageAnalysis): number {
  let score = 0;

  if (analysis.hasFaqSchema || analysis.hasHowtoSchema || analysis.hasArticleSchema) {
    score += 40;
  }

  if (analysis.hasFaqSchema || analysis.hasHowtoSchema) {
    score += 10;
  }

  if (analysis.hasAuthorSchema) {
    score += 10;
  }

  return Math.min(60, score);
}

function calculateGeminiMobile(analysis: PageAnalysis): number {
  let score = 0;

  if (analysis.avgParagraphWords <= 80) {
    score += 20;
  } else if (analysis.avgParagraphWords <= 120) {
    score += 10;
  }

  if (analysis.bulletRatio >= 0.15) {
    score += 10;
  } else if (analysis.bulletRatio >= 0.08) {
    score += 5;
  }

  if (analysis.hasViewportTag) {
    score += 10;
  }

  return Math.min(40, score);
}

function calculateChatGPTStructure(analysis: PageAnalysis): number {
  let score = 0;

  if (analysis.h1Count === 1) {
    score += 25;
  } else if (analysis.h1Count > 0) {
    score += 10;
  }

  const totalHeadings = analysis.h2Count + analysis.h3Count;
  if (totalHeadings >= 5) {
    score += 15;
  } else if (totalHeadings >= 2) {
    score += 10;
  }

  if (analysis.hasListStructure) {
    score += 10;
  }

  return Math.min(50, score);
}

function calculateChatGPTClarity(analysis: PageAnalysis): number {
  let score = 0;

  if (analysis.readabilityScore >= 60 && analysis.readabilityScore <= 80) {
    score += 20;
  } else if (analysis.readabilityScore >= 50) {
    score += 15;
  } else if (analysis.readabilityScore >= 40) {
    score += 10;
  }

  if (analysis.avgParagraphWords <= 80) {
    score += 15;
  } else if (analysis.avgParagraphWords <= 120) {
    score += 10;
  }

  if (analysis.bulletRatio >= 0.2) {
    score += 15;
  } else if (analysis.bulletRatio >= 0.1) {
    score += 10;
  }

  return Math.min(50, score);
}

function calculateClaudeCitation(analysis: PageAnalysis): number {
  let score = 0;

  if (analysis.uniqueRefDomainCount === 0) {
    score = 0;
  } else if (analysis.uniqueRefDomainCount <= 3) {
    score = 20 + (analysis.uniqueRefDomainCount * 5);
  } else if (analysis.uniqueRefDomainCount <= 10) {
    score = 35 + ((analysis.uniqueRefDomainCount - 3) * 3);
  } else {
    score = 56;
  }

  if (analysis.citationPatternCount > 0) {
    score += Math.min(5, analysis.citationPatternCount);
  }

  return Math.min(60, score);
}

function calculateClaudeNuance(analysis: PageAnalysis): number {
  let score = 0;

  if (analysis.argumentDepthScore > 5) {
    score += 15;
  } else if (analysis.argumentDepthScore > 2) {
    score += 10;
  }

  if (analysis.wordCount > 1500) {
    score += 15;
  } else if (analysis.wordCount > 800) {
    score += 10;
  }

  if (analysis.externalLinkCount >= 5 && analysis.argumentDepthScore > 2) {
    score += 10;
  }

  return Math.min(40, score);
}

function calculatePerplexityExternalLinks(analysis: PageAnalysis): number {
  let score = 0;

  const domainCount = analysis.uniqueRefDomainCount;

  if (domainCount === 0) {
    score = 0;
  } else if (domainCount <= 3) {
    score = 20 + (domainCount * 5);
  } else if (domainCount <= 8) {
    score = 35 + ((domainCount - 3) * 3);
  } else {
    score = 51;
  }

  return Math.min(55, score);
}

function calculatePerplexityData(analysis: PageAnalysis): number {
  let score = 0;

  if (analysis.dataDensityScore < 10) {
    score = 0;
  } else if (analysis.dataDensityScore < 30) {
    score = 15;
  } else if (analysis.dataDensityScore < 60) {
    score = 30;
  } else {
    score = 40;
  }

  if (analysis.hasListStructure && analysis.dataDensityScore > 20) {
    score += 5;
  }

  if (analysis.tableCount >= 2 && analysis.tableCount <= 3) {
    score += 15;
  } else if (analysis.tableCount === 1) {
    score += 10;
  } else if (analysis.tableCount >= 4) {
    score += 12;
  }

  if (analysis.hasComparativeParagraphs && !analysis.hasTables) {
    score -= 8;
  }

  return Math.min(60, Math.max(0, score));
}

function generateMockCompetitors(userScore: number, userWordCount: number) {
  return [
    {
      name: "Industry Leader",
      url: "https://example-leader.com",
      domain: "example-leader.com",
      domainRating: 92,
      backlinkCount: 2000,
      contentLength: Math.floor(userWordCount * 1.5),
      h1Count: 1,
      h2Count: 12,
      schemaPresent: true,
      freshnessDays: 7,
      overallScore: Math.min(userScore + 25, 95),
      googleRank: 1,
      aiCitationPercentage: 30,
    },
    {
      name: "Established Competitor",
      url: "https://example-competitor.com",
      domain: "example-competitor.com",
      domainRating: 78,
      backlinkCount: 850,
      contentLength: Math.floor(userWordCount * 1.2),
      h1Count: 1,
      h2Count: 8,
      schemaPresent: true,
      freshnessDays: 14,
      overallScore: Math.min(userScore + 15, 85),
      googleRank: 2,
      aiCitationPercentage: 22,
    },
    {
      name: "Rising Challenger",
      url: "https://example-challenger.com",
      domain: "example-challenger.com",
      domainRating: 65,
      backlinkCount: 320,
      contentLength: Math.floor(userWordCount * 1.1),
      h1Count: 1,
      h2Count: 6,
      schemaPresent: false,
      freshnessDays: 30,
      overallScore: Math.max(userScore + 5, 60),
      googleRank: 5,
      aiCitationPercentage: 12,
    },
  ];
}

function calculateCurrentPhase(overallScore: number): number {
  if (overallScore < 50) return 1;
  if (overallScore < 75) return 2;
  return 3;
}

function estimateWeeksToComplete(currentScore: number): number {
  const currentPhase = calculateCurrentPhase(currentScore);

  if (currentPhase === 1) {
    return 12;
  } else if (currentPhase === 2) {
    return 9;
  } else {
    return 4;
  }
}

async function verifyBotAccess(domain: string, pageUrl: string): Promise<BotVerificationResult[]> {
  const results: BotVerificationResult[] = [];

  try {
    const robotsTxtUrl = `https://${domain}/robots.txt`;
    console.log(`Fetching robots.txt from ${robotsTxtUrl}`);

    const robotsResponse = await fetch(robotsTxtUrl, {
      signal: AbortSignal.timeout(5000),
    });

    let parsedRobots: ParsedRobotsTxt | null = null;

    if (robotsResponse.ok) {
      const robotsTxtContent = await robotsResponse.text();
      parsedRobots = parseRobotsTxt(robotsTxtContent);
    } else {
      console.log(`No robots.txt found (${robotsResponse.status}), assuming all bots allowed`);
    }

    for (const bot of BOT_CONFIGS) {
      let isAllowed = true;
      let blockReason: string | null = null;
      let robotsTxtRule: string | null = null;

      if (parsedRobots) {
        const robotsCheck = checkBotAllowedInRobotsTxt(bot.name, parsedRobots, new URL(pageUrl).pathname);
        if (!robotsCheck.allowed) {
          isAllowed = false;
          blockReason = 'robots_txt';
          robotsTxtRule = robotsCheck.rule;
        }
      }

      if (isAllowed) {
        try {
          const headResponse = await fetch(pageUrl, {
            method: 'HEAD',
            headers: {
              'User-Agent': bot.userAgent,
            },
            signal: AbortSignal.timeout(3000),
          });

          if (headResponse.status === 403) {
            isAllowed = false;
            blockReason = 'firewall';
          }
        } catch (error) {
          console.log(`HEAD request failed for ${bot.name}, assuming allowed:`, error);
        }
      }

      results.push({
        botName: bot.name,
        isAllowed,
        blockReason,
        robotsTxtRule,
      });
    }
  } catch (error) {
    console.error('Error during bot verification:', error);
    for (const bot of BOT_CONFIGS) {
      results.push({
        botName: bot.name,
        isAllowed: true,
        blockReason: null,
        robotsTxtRule: null,
      });
    }
  }

  return results;
}

function parseRobotsTxt(content: string): ParsedRobotsTxt {
  const rules = new Map<string, { userAgent: string; disallow: string[]; allow: string[] }>();
  const lines = content.split('\n');
  let currentUserAgent: string | null = null;
  let hasWildcard = false;

  for (let line of lines) {
    line = line.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const directive = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();

    if (directive === 'user-agent') {
      currentUserAgent = value.toLowerCase();

      if (currentUserAgent === '*') {
        hasWildcard = true;
      }

      if (!rules.has(currentUserAgent)) {
        rules.set(currentUserAgent, {
          userAgent: currentUserAgent,
          disallow: [],
          allow: []
        });
      }
    } else if (currentUserAgent && (directive === 'disallow' || directive === 'allow')) {
      const rule = rules.get(currentUserAgent);
      if (rule) {
        if (directive === 'disallow' && value) {
          rule.disallow.push(value);
        } else if (directive === 'allow' && value) {
          rule.allow.push(value);
        }
      }
    }
  }

  return { rules, hasWildcard };
}

function checkBotAllowedInRobotsTxt(
  botName: BotName,
  parsedRobots: ParsedRobotsTxt,
  requestedPath: string
): { allowed: boolean; rule: string | null } {
  const botNameLower = botName.toLowerCase();

  const specificRule = parsedRobots.rules.get(botNameLower);

  if (specificRule) {
    const allowed = isPathAllowedInRules(requestedPath, specificRule.disallow, specificRule.allow);
    if (!allowed) {
      const matchingDisallow = specificRule.disallow.find(pattern =>
        pathMatchesPattern(requestedPath, pattern)
      );
      return {
        allowed: false,
        rule: `User-agent: ${botName}\nDisallow: ${matchingDisallow || specificRule.disallow[0]}`
      };
    }
  }

  if (parsedRobots.hasWildcard) {
    const wildcardRule = parsedRobots.rules.get('*');
    if (wildcardRule) {
      const allowed = isPathAllowedInRules(requestedPath, wildcardRule.disallow, wildcardRule.allow);
      if (!allowed) {
        const matchingDisallow = wildcardRule.disallow.find(pattern =>
          pathMatchesPattern(requestedPath, pattern)
        );
        return {
          allowed: false,
          rule: `User-agent: *\nDisallow: ${matchingDisallow || wildcardRule.disallow[0]}`
        };
      }
    }
  }

  return { allowed: true, rule: null };
}

function isPathAllowedInRules(
  path: string,
  disallowRules: string[],
  allowRules: string[]
): boolean {
  for (const allowPattern of allowRules) {
    if (pathMatchesPattern(path, allowPattern)) {
      return true;
    }
  }

  for (const disallowPattern of disallowRules) {
    if (pathMatchesPattern(path, disallowPattern)) {
      return false;
    }
  }

  return true;
}

function pathMatchesPattern(path: string, pattern: string): boolean {
  if (pattern === '/') {
    return true;
  }

  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return path.startsWith(prefix);
  }

  if (pattern.endsWith('$')) {
    const exactPath = pattern.slice(0, -1);
    return path === exactPath;
  }

  return path.startsWith(pattern);
}

function calculateBotPenalty(blockedCount: number): number {
  if (blockedCount === 0) return 0;
  if (blockedCount === 1) return 5;
  if (blockedCount === 2) return 10;
  if (blockedCount === 3) return 15;
  if (blockedCount === 4) return 20;
  return 30;
}

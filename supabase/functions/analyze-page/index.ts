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
  wordCount: number;
  hasFaqSchema: boolean;
  hasHowtoSchema: boolean;
  hasArticleSchema: boolean;
  readabilityScore: number;
}

interface Scores {
  structureScore: number;
  metadataScore: number;
  contentScore: number;
  schemaScore: number;
  overallScore: number;
}

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
          readability_score: analysis.readabilityScore,
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
          readability_score: analysis.readabilityScore,
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

    console.log("Inserting score record...");
    const scoreInsert = await supabase
      .from("scores")
      .insert({
        page_id: pageId,
        structure_score: scores.structureScore,
        metadata_score: scores.metadataScore,
        content_score: scores.contentScore,
        citation_pattern_score: scores.schemaScore,
        overall_ai_readiness: scores.overallScore,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (scoreInsert.error) {
      console.error("Error inserting score:", scoreInsert.error);
      throw new Error(`Failed to save scores: ${scoreInsert.error.message}`);
    }

    console.log("Analysis complete! Score ID:", scoreInsert.data.id);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        scores: scores,
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

  const readabilityScore = calculateReadabilityScore(textContent, wordCount);

  return {
    title,
    metaDescription,
    h1Count,
    h2Count,
    wordCount,
    hasFaqSchema,
    hasHowtoSchema,
    hasArticleSchema,
    readabilityScore,
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

function calculateScores(analysis: PageAnalysis): Scores {
  let structureScore = 0;
  if (analysis.h1Count === 1) {
    structureScore += 15;
  }
  if (analysis.h2Count >= 2) {
    structureScore += 15;
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

  const overallScore =
    structureScore * 0.3 +
    metadataScore * 0.25 +
    contentScore * 0.25 +
    schemaScore * 0.2;

  return {
    structureScore,
    metadataScore,
    contentScore,
    schemaScore,
    overallScore: Math.round(overallScore * 10) / 10,
  };
}
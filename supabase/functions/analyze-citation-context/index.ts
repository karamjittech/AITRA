import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyDBs1KgVq8qk0SfF3L8V-uUd_xSVo-5EBA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

interface AnalyzeCitationRequest {
  citationId: string;
  brandName: string;
  brandDomain: string;
}

interface LinkVerificationResult {
  status: 'live' | 'broken_404' | 'broken_timeout' | 'broken_other' | 'hallucinated';
  redirectDetected?: boolean;
  redirectUrl?: string;
  statusCode?: number;
}

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  contextTag: 'recommendation' | 'list' | 'reference' | 'comparison' | 'evaluative' | 'informational';
  competitorMentions: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("CUSTOM_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { citationId, brandName, brandDomain }: AnalyzeCitationRequest = await req.json();

    if (!citationId || !brandName || !brandDomain) {
      return new Response(
        JSON.stringify({ error: "citationId, brandName, and brandDomain are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Analyzing citation context for: ${citationId}`);

    // Step 1: Fetch citation data
    const { data: citation, error: fetchError } = await supabase
      .from("citations")
      .select("*")
      .eq("id", citationId)
      .single();

    if (fetchError || !citation) {
      console.error("Error fetching citation:", fetchError);
      return new Response(
        JSON.stringify({ error: `Citation not found: ${fetchError?.message}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Citation found: ${citation.platform}`);

    // Step 2: Link verification (if cited_url exists)
    let linkResult: LinkVerificationResult | null = null;
    if (citation.cited_url) {
      console.log(`Verifying link: ${citation.cited_url}`);
      linkResult = await verifyLink(citation.cited_url, brandDomain);
      console.log(`Link status: ${linkResult.status}`);
    }

    // Step 3: Sentiment analysis (if snippet_text exists)
    let sentimentResult: SentimentAnalysisResult | null = null;
    if (citation.snippet_text && citation.snippet_text.trim() !== "") {
      console.log(`Analyzing sentiment for brand: ${brandName}`);
      try {
        sentimentResult = await analyzeSentimentWithGemini(
          citation.snippet_text,
          brandName
        );
        console.log(`Sentiment: ${sentimentResult.sentiment}`);
      } catch (error) {
        console.error("Sentiment analysis failed:", error);
        // Use neutral as fallback
        sentimentResult = {
          sentiment: 'neutral',
          contextTag: 'informational',
          competitorMentions: [],
        };
      }
    }

    // Step 4: Determine if action is required
    const requiresAction = (
      (sentimentResult && sentimentResult.sentiment === 'negative') ||
      (linkResult && ['broken_404', 'broken_timeout', 'broken_other', 'hallucinated'].includes(linkResult.status))
    );

    console.log(`Requires action: ${requiresAction}`);

    // Step 5: Update database
    const updateData: any = {
      sentiment_analyzed: true,
      analyzed_at: new Date().toISOString(),
    };

    if (sentimentResult) {
      updateData.sentiment = sentimentResult.sentiment;
      updateData.context_tag = sentimentResult.contextTag;
      updateData.competitor_mentions = sentimentResult.competitorMentions;
    }

    if (linkResult) {
      updateData.link_status = linkResult.status;
      updateData.link_checked_at = new Date().toISOString();
      if (linkResult.redirectDetected) {
        updateData.redirect_detected = linkResult.redirectDetected;
        updateData.redirect_url = linkResult.redirectUrl;
      }
    }

    updateData.requires_action = requiresAction;

    const { error: updateError } = await supabase
      .from("citations")
      .update(updateData)
      .eq("id", citationId);

    if (updateError) {
      console.error("Error updating citation:", updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update citation: ${updateError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Citation ${citationId} analyzed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        citationId,
        sentiment: sentimentResult?.sentiment,
        contextTag: sentimentResult?.contextTag,
        linkStatus: linkResult?.status,
        requiresAction,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in citation context analysis:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ============================================================================
// LINK VERIFICATION FUNCTION
// ============================================================================

async function verifyLink(
  url: string,
  expectedDomain: string
): Promise<LinkVerificationResult> {
  try {
    // Parse URL to check domain
    const parsedUrl = new URL(url);
    const urlDomain = parsedUrl.hostname;

    // Check if domain matches (allow subdomains)
    const domainMatch = urlDomain.includes(expectedDomain) || expectedDomain.includes(urlDomain);

    // First, check if it's a hallucinated URL (wrong domain)
    if (!domainMatch) {
      console.log(`Domain mismatch: ${urlDomain} vs ${expectedDomain}`);
      return {
        status: 'hallucinated',
      };
    }

    // Perform HEAD request with 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    // Check for redirects
    const redirectDetected = response.url !== url;

    // Check status code
    if (response.status === 200) {
      return {
        status: 'live',
        redirectDetected,
        redirectUrl: redirectDetected ? response.url : undefined,
      };
    } else if (response.status === 404) {
      return {
        status: 'broken_404',
        statusCode: 404,
      };
    } else {
      return {
        status: 'broken_other',
        statusCode: response.status,
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`Link check timeout: ${url}`);
      return {
        status: 'broken_timeout',
      };
    }

    console.error(`Link verification error:`, error);
    // Retry once for network errors
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        return { status: 'live' };
      } else if (response.status === 404) {
        return { status: 'broken_404', statusCode: 404 };
      } else {
        return { status: 'broken_other', statusCode: response.status };
      }
    } catch (retryError) {
      console.error(`Link verification retry failed:`, retryError);
      return { status: 'broken_timeout' };
    }
  }
}

// ============================================================================
// SENTIMENT ANALYSIS FUNCTION (using Gemini)
// ============================================================================

async function analyzeSentimentWithGemini(
  snippetText: string,
  brandName: string
): Promise<SentimentAnalysisResult> {
  const prompt = `Analyze the following text snippet about "${brandName}" and provide:

1. Sentiment: Determine if the mention is Positive, Neutral, or Negative
2. Context Type: Classify as Recommendation, List, Reference, Comparison, Evaluative, or Informational
3. Competitor Mentions: Extract any competing brands/companies mentioned alongside "${brandName}"

Snippet:
"${snippetText}"

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no explanations):
{
  "sentiment": "positive" | "neutral" | "negative",
  "contextTag": "recommendation" | "list" | "reference" | "comparison" | "evaluative" | "informational",
  "competitorMentions": ["competitor1", "competitor2"]
}

Guidelines:
- Positive: Brand is praised, recommended, or shown favorably
- Neutral: Brand is mentioned factually without opinion
- Negative: Brand is criticized or shown unfavorably
- Recommendation: Actively suggesting/recommending the brand
- List: Brand appears in a list of options
- Reference: Brand mentioned as an example or reference
- Comparison: Brand compared to alternatives
- Evaluative: Brand being evaluated/reviewed
- Informational: Brand mentioned in educational context`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 256,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error("No content generated from Gemini");
  }

  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not extract JSON from Gemini response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      sentiment: parsed.sentiment || 'neutral',
      contextTag: parsed.contextTag || 'informational',
      competitorMentions: parsed.competitorMentions || [],
    };
  } catch (e) {
    console.error("Failed to parse JSON:", jsonMatch[0]);
    throw new Error("Invalid JSON generated by Gemini");
  }
}
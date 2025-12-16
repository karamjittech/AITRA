import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set");
}

interface AnalyzeSentimentRequest {
  citationIds?: string[];
  snapshotId?: string;
  brandName: string;
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
    const supabaseUrl = Deno.env.get("CUSTOM_SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("CUSTOM_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: GEMINI_API_KEY not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { citationIds, snapshotId, brandName }: AnalyzeSentimentRequest = await req.json();

    if (!brandName) {
      return new Response(
        JSON.stringify({ error: "brandName is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Analyzing sentiment for brand: ${brandName}`);

    let citationsToAnalyze: any[] = [];

    if (citationIds && citationIds.length > 0) {
      const { data, error } = await supabase
        .from("citations")
        .select("*")
        .in("id", citationIds)
        .eq("sentiment_analyzed", false);

      if (error) {
        console.error("Error fetching citations:", error);
        throw new Error(`Failed to fetch citations: ${error.message}`);
      }

      citationsToAnalyze = data || [];
    } else if (snapshotId) {
      const { data, error } = await supabase
        .from("citations")
        .select("*")
        .eq("snapshot_id", snapshotId)
        .eq("sentiment_analyzed", false);

      if (error) {
        console.error("Error fetching citations by snapshot:", error);
        throw new Error(`Failed to fetch citations: ${error.message}`);
      }

      citationsToAnalyze = data || [];
    } else {
      const { data, error } = await supabase
        .from("citations")
        .select("*")
        .eq("sentiment_analyzed", false)
        .limit(10);

      if (error) {
        console.error("Error fetching unanalyzed citations:", error);
        throw new Error(`Failed to fetch citations: ${error.message}`);
      }

      citationsToAnalyze = data || [];
    }

    if (citationsToAnalyze.length === 0) {
      console.log("No citations to analyze");
      return new Response(
        JSON.stringify({
          success: true,
          analyzed: 0,
          message: "No new citations to analyze",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Analyzing ${citationsToAnalyze.length} citations...`);

    const results = [];

    for (const citation of citationsToAnalyze) {
      if (!citation.snippet_text || citation.snippet_text.trim() === "") {
        console.log(`Skipping citation ${citation.id} - no snippet text`);
        continue;
      }

      try {
        console.log(`Analyzing citation ${citation.id}...`);
        const analysis = await analyzeSentimentWithGemini(
          citation.snippet_text,
          brandName
        );

        const { error: updateError } = await supabase
          .from("citations")
          .update({
            sentiment: analysis.sentiment,
            context_tag: analysis.contextTag,
            competitor_mentions: analysis.competitorMentions,
            sentiment_analyzed: true,
            analyzed_at: new Date().toISOString(),
          })
          .eq("id", citation.id);

        if (updateError) {
          console.error(`Error updating citation ${citation.id}:`, updateError);
        } else {
          results.push({
            citationId: citation.id,
            ...analysis,
          });
          console.log(`Successfully analyzed citation ${citation.id}`);
        }
      } catch (error) {
        console.error(`Error analyzing citation ${citation.id}:`, error);
        results.push({
          citationId: citation.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`Sentiment analysis complete. Analyzed ${results.length} citations`);

    return new Response(
      JSON.stringify({
        success: true,
        analyzed: results.length,
        results: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
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

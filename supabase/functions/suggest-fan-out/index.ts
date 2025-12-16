import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

interface SuggestFanOutRequest {
  mainKeyword: string;
}

interface KeywordSuggestion {
  query: string;
  type: 'Informational' | 'Comparative' | 'Instructional' | 'Brand' | 'Evaluative';
  relevance: number;
}

interface FanOutResponse {
  mainKeyword: string;
  suggestions: KeywordSuggestion[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: GEMINI_API_KEY not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { mainKeyword }: SuggestFanOutRequest = await req.json();

    if (!mainKeyword || mainKeyword.trim() === "") {
      return new Response(
        JSON.stringify({ error: "mainKeyword is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating fan-out keywords for: ${mainKeyword}`);

    const suggestions = await generateFanOutKeywords(mainKeyword);

    const response: FanOutResponse = {
      mainKeyword,
      suggestions,
    };

    console.log(`Generated ${suggestions.length} fan-out keywords`);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating fan-out keywords:", error);
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

async function generateFanOutKeywords(mainKeyword: string): Promise<KeywordSuggestion[]> {
  const prompt = `You are an AI SEO Specialist. LLMs generate 'fan-out' queries to answer complex user questions.

Based on the seed keyword "${mainKeyword}", generate a JSON list of 15-20 relevant sub-queries categorized by these specific intents:

1. **Informational** (3-4 queries): "How does X work?", "What is X?", "Why X?"
   - Seeks understanding, definitions, or explanations
   - Examples: "What is [keyword]", "How does [keyword] work", "Why use [keyword]"

2. **Comparative** (3-4 queries): "X vs Y", "Best X for Y", "Difference between X and Y"
   - Compares options, alternatives, or competitors
   - Examples: "[keyword] vs [alternative]", "Best [keyword] for [use case]", "[keyword] compared to [competitor]"

3. **Instructional** (3-4 queries): "How to X", "Steps to Y", "Guide to Z"
   - Step-by-step guidance or tutorials
   - Examples: "How to use [keyword]", "Steps to set up [keyword]", "[keyword] tutorial"

4. **Brand** (3-4 queries): "X features", "X pricing", "X for Y use case"
   - Product/service specific queries about features, pricing, or capabilities
   - Examples: "[keyword] features", "[keyword] pricing", "[keyword] for [industry/use case]"

5. **Evaluative** (3-4 queries): "Is X good?", "Should I use X?", "X suitable for Y?"
   - Assesses quality, suitability, or value
   - Examples: "Is [keyword] worth it", "Should I use [keyword]", "[keyword] pros and cons"

REQUIREMENTS:
- Generate 15-20 total queries (3-4 per category)
- Each query should be natural and conversational (2-8 words)
- Queries must be realistic searches users would actually type
- Include question words where appropriate (what, how, when, why, which, is, should)
- Ensure queries are distinct and actionable
- Relevance scores should be 75-100 (higher = more relevant to seed keyword)

Respond with ONLY valid JSON (no markdown, no code blocks, no explanatory text):
{
  "suggestions": [
    {
      "query": "what is [keyword]",
      "type": "Informational",
      "relevance": 95
    },
    {
      "query": "[keyword] vs [alternative]",
      "type": "Comparative",
      "relevance": 92
    }
  ]
}

Generate the complete list now.`;

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
      temperature: 0.8,
      maxOutputTokens: 2048,
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

  console.log("Full Gemini API response:", JSON.stringify(data, null, 2));

  if (!data.candidates || data.candidates.length === 0) {
    console.error("No candidates in Gemini response");
    throw new Error("Gemini API returned no candidates. This may be due to safety filters or API issues.");
  }

  const candidate = data.candidates[0];
  const finishReason = candidate.finishReason;

  if (finishReason && finishReason !== "STOP") {
    console.error("Gemini blocked content. Finish reason:", finishReason);
    if (finishReason === "SAFETY") {
      throw new Error("Content was blocked by Gemini safety filters. Try a different keyword.");
    } else if (finishReason === "RECITATION") {
      throw new Error("Content was blocked due to recitation concerns. Try rephrasing.");
    } else {
      throw new Error(`Content generation stopped: ${finishReason}`);
    }
  }

  const generatedText = candidate.content?.parts?.[0]?.text;

  if (!generatedText) {
    console.error("No text in Gemini response. Candidate:", JSON.stringify(candidate, null, 2));
    throw new Error("Gemini did not generate any text content. Please try again.");
  }

  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Could not extract JSON from Gemini response:", generatedText);
    throw new Error("Could not extract JSON from Gemini response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      throw new Error("Invalid suggestions format");
    }
    return parsed.suggestions.map((s: any) => ({
      query: s.query || "",
      type: s.type || "Informational",
      relevance: s.relevance || 80,
    }));
  } catch (e) {
    console.error("Failed to parse JSON:", jsonMatch[0]);
    throw new Error("Invalid JSON generated by Gemini");
  }
}

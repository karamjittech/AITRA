import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyDBs1KgVq8qk0SfF3L8V-uUd_xSVo-5EBA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

interface SuggestFanOutRequest {
  mainKeyword: string;
}

interface KeywordSuggestion {
  query: string;
  type: 'informational' | 'comparative' | 'evaluative' | 'use-case' | 'problem-solution';
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
  const prompt = `Generate 5 AI-search optimized fan-out keyword queries for the main keyword: "${mainKeyword}"

These queries should represent how AI models (ChatGPT, Claude, Gemini, Perplexity) internally process and expand user searches. Include:

1. Informational query (what/why/how) - Seeks understanding or definitions
2. Comparative query (vs/best/top) - Compares options or alternatives
3. Evaluative query (pros/cons/review/worth it) - Assesses quality or value
4. Use-case query (for/to/when to use) - Explores practical applications
5. Problem-solution query (fix/solve/prevent) - Addresses specific problems

Requirements:
- Each query should be 2-6 words
- Use natural, conversational language (as users would type)
- Avoid overly formal or technical phrasing
- Include question words where appropriate (what, how, when, why, which)
- Ensure queries are distinct and cover different search intents

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "suggestions": [
    {
      "query": "query text here",
      "type": "informational",
      "relevance": 95
    },
    {
      "query": "query text here",
      "type": "comparative",
      "relevance": 90
    },
    {
      "query": "query text here",
      "type": "evaluative",
      "relevance": 88
    },
    {
      "query": "query text here",
      "type": "use-case",
      "relevance": 85
    },
    {
      "query": "query text here",
      "type": "problem-solution",
      "relevance": 82
    }
  ]
}

Relevance scores should be 75-100, with more popular/common queries scoring higher.`;

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
      maxOutputTokens: 512,
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
      type: s.type || "informational",
      relevance: s.relevance || 80,
    }));
  } catch (e) {
    console.error("Failed to parse JSON:", jsonMatch[0]);
    throw new Error("Invalid JSON generated by Gemini");
  }
}

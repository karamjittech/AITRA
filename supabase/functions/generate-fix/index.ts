import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyDBs1KgVq8qk0SfF3L8V-uUd_xSVo-5EBA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

interface GenerateFixRequest {
  pageId: string;
  fixType: "faq-schema" | "howto-schema" | "article-schema" | "meta-description" | "title-tag" | "organization-schema" | "person-schema";
  currentContent: {
    title?: string;
    metaDescription?: string;
    content?: string;
    url?: string;
    organizationName?: string;
    personName?: string;
    description?: string;
  };
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

    const { pageId, fixType, currentContent }: GenerateFixRequest = await req.json();

    if (!pageId || !fixType) {
      return new Response(
        JSON.stringify({ error: "pageId and fixType are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating fix: ${fixType} for page ${pageId}`);

    const existingFix = await supabase
      .from("fixes_generated")
      .select("*")
      .eq("page_id", pageId)
      .eq("fix_type", fixType)
      .maybeSingle();

    if (existingFix.error) {
      console.error("Error checking existing fix:", existingFix.error);
    }

    if (existingFix.data) {
      console.log("Returning cached fix");
      return new Response(
        JSON.stringify({
          success: true,
          fix: existingFix.data,
          cached: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Generating new fix with Gemini...");
    const generatedContent = await generateFixWithGemini(fixType, currentContent);

    const newFix = await supabase
      .from("fixes_generated")
      .insert({
        page_id: pageId,
        fix_type: fixType,
        schema_json: generatedContent,
        applied: false,
      })
      .select()
      .single();

    if (newFix.error) {
      console.error("Error saving fix:", newFix.error);
      throw new Error(`Failed to save fix: ${newFix.error.message}`);
    }

    console.log("Fix generated and saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        fix: newFix.data,
        cached: false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating fix:", error);
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

async function generateFixWithGemini(
  fixType: string,
  currentContent: GenerateFixRequest["currentContent"]
): Promise<any> {
  let prompt = "";
  let expectedFormat = "json";

  switch (fixType) {
    case "faq-schema":
      prompt = `Generate a valid JSON-LD FAQ schema for a webpage with the following information:
Title: ${currentContent.title || "N/A"}
Meta Description: ${currentContent.metaDescription || "N/A"}
URL: ${currentContent.url || "N/A"}

Create a FAQPage schema with 5-7 relevant questions and answers that would help this page rank better in AI search results.
The questions should be common queries users might have about this topic.
Return ONLY the JSON-LD schema, no explanations. Make sure it's valid JSON that can be parsed.`;
      break;

    case "howto-schema":
      prompt = `Generate a valid JSON-LD HowTo schema for a webpage with the following information:
Title: ${currentContent.title || "N/A"}
Meta Description: ${currentContent.metaDescription || "N/A"}
URL: ${currentContent.url || "N/A"}

Create a HowTo schema with 5-8 steps that would be relevant to this topic.
Return ONLY the JSON-LD schema, no explanations. Make sure it's valid JSON that can be parsed.`;
      break;

    case "article-schema":
      prompt = `Generate a valid JSON-LD Article schema for a webpage with the following information:
Title: ${currentContent.title || "N/A"}
Meta Description: ${currentContent.metaDescription || "N/A"}
URL: ${currentContent.url || "N/A"}

Create an Article schema (or BlogPosting if more appropriate) with proper author, datePublished, and other relevant fields.
Return ONLY the JSON-LD schema, no explanations. Make sure it's valid JSON that can be parsed.`;
      break;

    case "meta-description":
      prompt = `Write an optimized meta description (120-160 characters) for a webpage with:
Current Title: ${currentContent.title || "N/A"}
Current Description: ${currentContent.metaDescription || "N/A"}

The meta description should:
- Be between 120-160 characters
- Be compelling and encourage clicks
- Be optimized for NLP and AI understanding
- Include relevant keywords naturally
- Have a clear value proposition

Return ONLY the meta description text, no quotes, no explanations.`;
      expectedFormat = "text";
      break;

    case "title-tag":
      prompt = `Write an optimized title tag (30-60 characters) for a webpage with:
Current Title: ${currentContent.title || "N/A"}
Current Description: ${currentContent.metaDescription || "N/A"}
URL: ${currentContent.url || "N/A"}

The title should:
- Be between 30-60 characters
- Be compelling and encourage clicks
- Include primary keyword naturally
- Be clear and descriptive
- Work well for both users and AI models

Return ONLY the title text, no quotes, no explanations.`;
      expectedFormat = "text";
      break;

    case "organization-schema":
      prompt = `Generate a valid JSON-LD Organization schema for a website with the following information:
Organization Name: ${currentContent.organizationName || currentContent.title || "N/A"}
Website URL: ${currentContent.url || "N/A"}
Description: ${currentContent.description || currentContent.metaDescription || "N/A"}

Create an Organization schema that includes:
- @context and @type (Organization)
- name, url, description
- IMPORTANT: Include a "sameAs" array with 3-5 relevant URLs to establish Knowledge Graph identity. Use realistic URLs like:
  * Wikipedia page (if applicable)
  * Wikidata entry (if applicable)
  * LinkedIn company page
  * Twitter/X profile
  * Facebook page
  * Crunchbase profile (for businesses)

The sameAs URLs should help AI models verify the organization's identity in Knowledge Graphs.
Return ONLY the JSON-LD schema, no explanations. Make sure it's valid JSON that can be parsed.`;
      break;

    case "person-schema":
      prompt = `Generate a valid JSON-LD Person schema for an author/expert with the following information:
Person Name: ${currentContent.personName || "N/A"}
Website URL: ${currentContent.url || "N/A"}
Description: ${currentContent.description || currentContent.metaDescription || "N/A"}

Create a Person schema that includes:
- @context and @type (Person)
- name, url, description
- jobTitle (relevant to the content)
- IMPORTANT: Include a "sameAs" array with 3-5 relevant URLs to establish Knowledge Graph identity. Use realistic URLs like:
  * Wikipedia page (if notable)
  * Wikidata entry (if applicable)
  * LinkedIn profile
  * Twitter/X profile
  * Professional website
  * GitHub profile (for developers)

The sameAs URLs should help AI models verify the person's identity and expertise in Knowledge Graphs.
Return ONLY the JSON-LD schema, no explanations. Make sure it's valid JSON that can be parsed.`;
      break;

    default:
      throw new Error(`Unknown fix type: ${fixType}`);
  }

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
      temperature: 0.7,
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
    console.error("Gemini API error response:", errorText);
    console.error("Gemini API status:", response.status, response.statusText);
    throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error("No content generated from Gemini");
  }

  if (expectedFormat === "json") {
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Gemini response");
    }
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON:", jsonMatch[0]);
      throw new Error("Invalid JSON generated by Gemini");
    }
  } else {
    return { text: generatedText.trim() };
  }
}

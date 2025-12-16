import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
const JINA_READER_API = "https://r.jina.ai/";

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set");
}

interface AnalyzeEEATRequest {
  userId: string;
  aboutPageUrl: string;
  brandIdentityId?: string;
}

interface EEATAnalysisResult {
  score: number;
  missing_signals: string[];
  recommendations: Array<{
    signal: string;
    priority: string;
    action: string;
    impact: string;
  }>;
  detected_entities: string[];
  trust_indicators: string[];
  component_scores: {
    authorship: number;
    credentials: number;
    contact_info: number;
    institutional: number;
    transparency: number;
    social_proof: number;
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

    const { userId, aboutPageUrl, brandIdentityId }: AnalyzeEEATRequest = await req.json();

    if (!userId || !aboutPageUrl) {
      return new Response(
        JSON.stringify({ error: "userId and aboutPageUrl are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Analyzing E-E-A-T for: ${aboutPageUrl}`);

    const { data: brandIdentity, error: brandError } = await supabase
      .from("brand_identity")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (brandError) {
      console.error("Error fetching brand identity:", brandError);
    }

    const brandId = brandIdentityId || brandIdentity?.id;

    console.log("Scraping About page with Jina.ai...");
    const jinaResponse = await fetch(`${JINA_READER_API}${aboutPageUrl}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!jinaResponse.ok) {
      throw new Error(`Failed to scrape page: ${jinaResponse.statusText}`);
    }

    const jinaData = await jinaResponse.json();
    const pageContent = jinaData.data?.content || jinaData.content || "";

    if (!pageContent) {
      throw new Error("No content extracted from About page");
    }

    console.log(`Extracted ${pageContent.length} characters. Analyzing with Gemini...`);

    const prompt = `Analyze this 'About Us' page content for Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals specifically for AI credibility.

Content to analyze:
${pageContent.substring(0, 8000)}

Check for these signals:
1. Clear Authorship (0-20 points) - Who runs this organization? Named individuals?
2. Credentials/Expertise (0-20 points) - Why should AI models trust them? Education, experience, certifications?
3. Physical Address/Contact Info (0-15 points) - Is this a real business? Complete address, phone, email?
4. Institutional Connections (0-15 points) - Awards, partnerships, industry recognition, certifications?
5. Transparency & Policies (0-15 points) - Privacy policy, terms, about page quality?
6. Social Proof (0-15 points) - Client testimonials, case studies, media mentions, reviews?

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "score": <0-100 total>,
  "component_scores": {
    "authorship": <0-20>,
    "credentials": <0-20>,
    "contact_info": <0-15>,
    "institutional": <0-15>,
    "transparency": <0-15>,
    "social_proof": <0-15>
  },
  "missing_signals": ["Brief descriptions of missing elements"],
  "recommendations": [
    {
      "signal": "physical_address",
      "priority": "high",
      "action": "Add complete physical address with street, city, state, postal code",
      "impact": "+12 points"
    }
  ],
  "detected_entities": ["Names of people, organizations mentioned"],
  "trust_indicators": ["Specific trust elements found: years in business, client count, etc."]
}`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: GEMINI_API_KEY,
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API failed: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error("No analysis returned from Gemini");
    }

    let analysis: EEATAnalysisResult;
    try {
      const cleanedText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", analysisText);
      throw new Error("Invalid response format from AI analysis");
    }

    console.log(`E-E-A-T Analysis complete. Score: ${analysis.score}/100`);

    if (brandId) {
      const { error: updateError } = await supabase
        .from("brand_identity")
        .update({
          about_page_url: aboutPageUrl,
          eeat_score: analysis.score,
          eeat_analyzed_at: new Date().toISOString(),
          eeat_missing_signals: analysis.missing_signals,
          eeat_recommendations: analysis.recommendations,
        })
        .eq("id", brandId);

      if (updateError) {
        console.error("Error updating brand identity:", updateError);
      } else {
        console.log("Brand identity updated with E-E-A-T data");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        brandIdentityId: brandId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error analyzing E-E-A-T:", error);
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

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

interface GenerateFixRequest {
  pageId: string;
  fixType: "faq-schema" | "howto-schema" | "article-schema" | "meta-description" | "title-tag" | "organization-schema" | "person-schema" | "create-tldr" | "paragraph-to-table" | "organization-schema-eeat" | "local-business-schema" | "person-schema-eeat";
  currentContent: {
    title?: string;
    metaDescription?: string;
    content?: string;
    url?: string;
    organizationName?: string;
    personName?: string;
    description?: string;
    paragraphText?: string;
    dataType?: string;
  };
  brandIdentity?: {
    organization_name?: string;
    organization_type?: string;
    logo_url?: string;
    description?: string;
    website_url?: string;
    same_as_links?: string[];
    knows_about?: string[];
    physical_address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    contact_info?: {
      email?: string;
      phone?: string;
      contactPageUrl?: string;
    };
    founding_date?: string;
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

    const { pageId, fixType, currentContent, brandIdentity }: GenerateFixRequest = await req.json();

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
    const generatedContent = await generateFixWithGemini(fixType, currentContent, brandIdentity);

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
  currentContent: GenerateFixRequest["currentContent"],
  brandIdentity?: GenerateFixRequest["brandIdentity"]
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

    case "create-tldr":
      prompt = `Analyze the following webpage and create a concise TL;DR (Too Long; Didn't Read) summary optimized for AI extraction:

Title: ${currentContent.title || "N/A"}
Meta Description: ${currentContent.metaDescription || "N/A"}
Content Preview: ${currentContent.content ? currentContent.content.substring(0, 2000) : "N/A"}

Create a "Key Takeaways" section with 3-5 bullet points that:
- Summarize the main points of the page
- Use clear, factual language
- Are optimized for AI models (ChatGPT, Claude, Gemini, Perplexity)
- Start each bullet with an action verb or key fact
- Are concise (15-25 words per bullet)
- Avoid generic phrases like "this article covers" or "you will learn"

Format the output as HTML ready to paste at the top of the page:
<div class="tldr-summary">
  <h2>Key Takeaways</h2>
  <ul>
    <li>First key takeaway...</li>
    <li>Second key takeaway...</li>
    <li>Third key takeaway...</li>
  </ul>
</div>

Return ONLY the HTML code, no explanations before or after.`;
      expectedFormat = "html";
      break;

    case "paragraph-to-table":
      prompt = `Convert the following comparative text into a clean, well-structured HTML table optimized for Perplexity AI citations:

Paragraph Text:
${currentContent.paragraphText || "N/A"}

Data Type: ${currentContent.dataType || "comparison"}

Requirements:
- Use semantic HTML: <table>, <thead>, <tbody>, <th>, <td>
- First row should be headers that clearly identify what's being compared
- Data should be clearly organized in columns for easy scanning
- Make it scannable and easy for AI models to parse and extract information
- Add class="perplexity-optimized-table" for styling
- Ensure mobile-responsive structure (use relative widths)
- Include proper column alignment (text-align: left for text, center/right for numbers)
- The table should highlight the comparative aspects (what vs what, feature vs feature, price vs price)

Format the table to maximize AI citation probability. Perplexity displays 8-12 sources and heavily favors structured tabular data.

Return ONLY the HTML table code with inline styles for better rendering, no explanations before or after.`;
      expectedFormat = "html";
      break;

    case "organization-schema-eeat":
      if (!brandIdentity) {
        throw new Error("Brand identity required for organization-schema-eeat");
      }
      prompt = `Generate a comprehensive JSON-LD Organization schema optimized for AI models and E-E-A-T signals with the following brand information:

Organization Name: ${brandIdentity.organization_name}
Type: ${brandIdentity.organization_type || "Organization"}
Website: ${brandIdentity.website_url}
Logo: ${brandIdentity.logo_url || ""}
Description: ${brandIdentity.description || ""}
${brandIdentity.founding_date ? `Founded: ${brandIdentity.founding_date}` : ""}

Authority Links (sameAs): ${brandIdentity.same_as_links?.join(", ") || "None provided"}
Expertise Topics (knowsAbout): ${brandIdentity.knows_about?.join(", ") || "None provided"}

${brandIdentity.physical_address ? `Address:
Street: ${brandIdentity.physical_address.street || ""}
City: ${brandIdentity.physical_address.city || ""}
State: ${brandIdentity.physical_address.state || ""}
Country: ${brandIdentity.physical_address.country || ""}
Postal Code: ${brandIdentity.physical_address.postalCode || ""}` : ""}

${brandIdentity.contact_info ? `Contact:
Email: ${brandIdentity.contact_info.email || ""}
Phone: ${brandIdentity.contact_info.phone || ""}
Contact Page: ${brandIdentity.contact_info.contactPageUrl || ""}` : ""}

Create a complete Organization schema that:
- Includes ALL provided sameAs links (these are CRITICAL for AI trust and Knowledge Graph identity)
- Includes ALL knowsAbout topics (shows expertise to AI models)
- Properly formats the address as PostalAddress if provided
- Includes contactPoint with all contact methods
- Uses proper Schema.org types and structure
- Is optimized for maximum AI visibility and E-E-A-T scoring

IMPORTANT: The sameAs array is critical - research shows it increases AI citations by 45%. Include every provided link.

Return ONLY valid JSON-LD schema, no explanations.`;
      break;

    case "local-business-schema":
      if (!brandIdentity) {
        throw new Error("Brand identity required for local-business-schema");
      }
      prompt = `Generate a comprehensive JSON-LD LocalBusiness schema optimized for AI models and local search with the following information:

Business Name: ${brandIdentity.organization_name}
Website: ${brandIdentity.website_url}
Logo: ${brandIdentity.logo_url || ""}
Description: ${brandIdentity.description || ""}

${brandIdentity.physical_address ? `Address (REQUIRED for LocalBusiness):
Street: ${brandIdentity.physical_address.street}
City: ${brandIdentity.physical_address.city}
State: ${brandIdentity.physical_address.state}
Country: ${brandIdentity.physical_address.country}
Postal Code: ${brandIdentity.physical_address.postalCode}` : "MISSING ADDRESS - Use placeholder"}

${brandIdentity.contact_info ? `Contact Information:
Phone: ${brandIdentity.contact_info.phone || ""}
Email: ${brandIdentity.contact_info.email || ""}` : ""}

Authority Links: ${brandIdentity.same_as_links?.join(", ") || "None"}
Expertise: ${brandIdentity.knows_about?.join(", ") || "None"}

Create a LocalBusiness schema that:
- Uses @type: "LocalBusiness" (or more specific like "Store", "Restaurant", etc. if appropriate)
- Includes complete address as PostalAddress
- Includes geo coordinates (latitude/longitude - estimate based on address)
- Includes telephone, email
- Includes sameAs links for Knowledge Graph identity
- Includes openingHoursSpecification (use typical business hours Mo-Fr 9:00-17:00)
- Includes priceRange (use $$ as default)
- Is optimized for local AI search and Google Business Profile

Return ONLY valid JSON-LD schema, no explanations.`;
      break;

    case "person-schema-eeat":
      if (!brandIdentity) {
        throw new Error("Brand identity required for person-schema-eeat");
      }
      prompt = `Generate a comprehensive JSON-LD Person schema for an author/expert optimized for AI credibility:

Person Name: ${currentContent.personName || brandIdentity.organization_name}
Website: ${brandIdentity.website_url || currentContent.url}
Description/Bio: ${currentContent.description || brandIdentity.description || ""}

Authority Links (sameAs): ${brandIdentity.same_as_links?.join(", ") || "None provided"}
Expertise Areas (knowsAbout): ${brandIdentity.knows_about?.join(", ") || "None provided"}

${brandIdentity.contact_info?.email ? `Email: ${brandIdentity.contact_info.email}` : ""}

Create a Person schema that:
- Includes complete professional identity
- Includes ALL sameAs links (LinkedIn, Twitter, professional profiles, Wikipedia if notable)
- Includes knowsAbout properties showing expertise
- Includes jobTitle (infer from expertise or use "Expert" / "Author" / "Consultant")
- Includes worksFor if it's representing someone at an organization
- Is optimized for author authority and E-E-A-T signals

IMPORTANT: sameAs links are critical for establishing author credibility to AI models.

Return ONLY valid JSON-LD schema, no explanations.`;
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
  } else if (expectedFormat === "html") {
    const htmlMatch = generatedText.match(/<(div|table)[\s\S]*<\/(div|table)>/i);
    if (htmlMatch) {
      return { html: htmlMatch[0].trim() };
    }
    return { html: generatedText.trim() };
  } else {
    return { text: generatedText.trim() };
  }
}

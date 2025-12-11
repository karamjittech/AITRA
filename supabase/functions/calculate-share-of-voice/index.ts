import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ShareOfVoiceRequest {
  keywordGroupId?: string;
  keywordIds?: string[];
  websiteId: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface CompetitorStats {
  name: string;
  citations: number;
  percentage: number;
}

interface ShareOfVoiceResponse {
  yourBrand: {
    name: string;
    citations: number;
    percentage: number;
  };
  competitors: CompetitorStats[];
  totalTests: number;
  dateRange: {
    start: string;
    end: string;
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
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { keywordGroupId, keywordIds, websiteId, dateRange }: ShareOfVoiceRequest = await req.json();

    if (!websiteId) {
      return new Response(
        JSON.stringify({ error: "websiteId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Calculating share of voice for website: ${websiteId}`);

    const { data: websiteData, error: websiteError } = await supabase
      .from("websites")
      .select("domain")
      .eq("id", websiteId)
      .single();

    if (websiteError || !websiteData) {
      throw new Error("Website not found");
    }

    const yourDomain = websiteData.domain;

    let targetKeywordIds: string[] = [];

    if (keywordGroupId) {
      const { data: groupMembers, error: groupError } = await supabase
        .from("keyword_group_members")
        .select("keyword_id")
        .eq("group_id", keywordGroupId);

      if (groupError) {
        throw new Error(`Failed to fetch keyword group: ${groupError.message}`);
      }

      targetKeywordIds = (groupMembers || []).map(m => m.keyword_id);
    } else if (keywordIds && keywordIds.length > 0) {
      targetKeywordIds = keywordIds;
    } else {
      const { data: allKeywords, error: keywordsError } = await supabase
        .from("tracked_keywords")
        .select("id")
        .eq("website_id", websiteId);

      if (keywordsError) {
        throw new Error(`Failed to fetch keywords: ${keywordsError.message}`);
      }

      targetKeywordIds = (allKeywords || []).map(k => k.id);
    }

    if (targetKeywordIds.length === 0) {
      return new Response(
        JSON.stringify({
          yourBrand: {
            name: yourDomain,
            citations: 0,
            percentage: 0,
          },
          competitors: [],
          totalTests: 0,
          dateRange: dateRange || { start: "", end: "" },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end || new Date().toISOString();

    console.log(`Fetching snapshots for ${targetKeywordIds.length} keywords from ${startDate} to ${endDate}`);

    let snapshotsQuery = supabase
      .from("serp_snapshots")
      .select("*")
      .in("keyword_id", targetKeywordIds)
      .gte("snapshot_date", startDate)
      .lte("snapshot_date", endDate);

    const { data: snapshots, error: snapshotsError } = await snapshotsQuery;

    if (snapshotsError) {
      throw new Error(`Failed to fetch snapshots: ${snapshotsError.message}`);
    }

    console.log(`Found ${snapshots?.length || 0} snapshots`);

    let yourCitations = 0;
    const competitorCounts: Map<string, number> = new Map();
    let totalTests = 0;

    for (const snapshot of snapshots || []) {
      if (!snapshot.has_ai_overview) continue;

      totalTests++;

      if (snapshot.your_site_cited) {
        yourCitations++;
      }

      if (snapshot.cited_domains && Array.isArray(snapshot.cited_domains)) {
        for (const domain of snapshot.cited_domains) {
          if (domain && domain !== yourDomain) {
            const count = competitorCounts.get(domain) || 0;
            competitorCounts.set(domain, count + 1);
          }
        }
      }
    }

    const totalCitations = yourCitations + Array.from(competitorCounts.values()).reduce((sum, count) => sum + count, 0);

    const competitors: CompetitorStats[] = Array.from(competitorCounts.entries())
      .map(([name, citations]) => ({
        name,
        citations,
        percentage: totalCitations > 0 ? Math.round((citations / totalCitations) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.citations - a.citations)
      .slice(0, 10);

    const response: ShareOfVoiceResponse = {
      yourBrand: {
        name: yourDomain,
        citations: yourCitations,
        percentage: totalCitations > 0 ? Math.round((yourCitations / totalCitations) * 1000) / 10 : 0,
      },
      competitors,
      totalTests,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };

    console.log(`Share of voice calculated: ${response.yourBrand.percentage}%`);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error calculating share of voice:", error);
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

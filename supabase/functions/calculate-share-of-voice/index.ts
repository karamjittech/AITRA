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
  domain: string;
  citations: number;
  percentage: number;
  platforms: string[];
  coCitationFrequency: number;
  trend?: 'rising' | 'falling' | 'stable';
  lastSeen?: string;
}

interface PlatformBreakdown {
  platform: string;
  yourCitations: number;
  yourPercentage: number;
  totalCitations: number;
  competitors: Array<{
    name: string;
    citations: number;
    percentage: number;
  }>;
}

interface ShareOfVoiceResponse {
  yourBrand: {
    name: string;
    domain: string;
    citations: number;
    percentage: number;
    platforms: string[];
  };
  competitors: CompetitorStats[];
  platformBreakdown: PlatformBreakdown[];
  insights: {
    topCompetitor?: string;
    marketConcentration: number;
    averageCitationsPerTest: number;
    totalUniqueDomains: number;
  };
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

    console.log(`Fetching citations for ${targetKeywordIds.length} keywords from ${startDate} to ${endDate}`);

    const { data: citations, error: citationsError } = await supabase
      .from("citations")
      .select(`
        id,
        keyword_id,
        platform,
        cited_domain,
        is_user_domain,
        citation_strength,
        position,
        created_at
      `)
      .in("keyword_id", targetKeywordIds)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (citationsError) {
      throw new Error(`Failed to fetch citations: ${citationsError.message}`);
    }

    console.log(`Found ${citations?.length || 0} citations`);

    const normalizeDomain = (domain: string): string => {
      if (!domain) return '';
      return domain.toLowerCase().replace(/^www\./i, '').trim();
    };

    const normalizedYourDomain = normalizeDomain(yourDomain);

    let yourCitations = 0;
    const yourPlatforms = new Set<string>();
    const competitorData = new Map<string, {
      citations: number;
      platforms: Set<string>;
      coCitations: number;
      lastSeen: string;
    }>();

    const platformData = new Map<string, {
      yourCitations: number;
      competitorCitations: Map<string, number>;
      totalCitations: number;
    }>();

    const uniqueDomainsSet = new Set<string>();

    for (const citation of citations || []) {
      const platform = citation.platform || 'unknown';
      const domain = normalizeDomain(citation.cited_domain || '');

      if (!domain) continue;
      uniqueDomainsSet.add(domain);

      if (!platformData.has(platform)) {
        platformData.set(platform, {
          yourCitations: 0,
          competitorCitations: new Map(),
          totalCitations: 0,
        });
      }

      const platformStats = platformData.get(platform)!;
      platformStats.totalCitations++;

      if (citation.is_user_domain || domain === normalizedYourDomain) {
        yourCitations++;
        yourPlatforms.add(platform);
        platformStats.yourCitations++;
      } else {
        const existing = competitorData.get(domain) || {
          citations: 0,
          platforms: new Set<string>(),
          coCitations: 0,
          lastSeen: citation.created_at,
        };

        existing.citations++;
        existing.platforms.add(platform);
        existing.lastSeen = citation.created_at;

        competitorData.set(domain, existing);

        const compCount = platformStats.competitorCitations.get(domain) || 0;
        platformStats.competitorCitations.set(domain, compCount + 1);
      }
    }

    const totalCitations = yourCitations + Array.from(competitorData.values())
      .reduce((sum, data) => sum + data.citations, 0);

    const generateDisplayName = (domain: string): string => {
      return domain.split('.')[0]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const competitors: CompetitorStats[] = Array.from(competitorData.entries())
      .map(([domain, data]) => ({
        name: generateDisplayName(domain),
        domain,
        citations: data.citations,
        percentage: totalCitations > 0 ? Math.round((data.citations / totalCitations) * 1000) / 10 : 0,
        platforms: Array.from(data.platforms),
        coCitationFrequency: data.coCitations,
        lastSeen: data.lastSeen,
      }))
      .sort((a, b) => b.citations - a.citations)
      .slice(0, 15);

    const platformBreakdown: PlatformBreakdown[] = Array.from(platformData.entries())
      .map(([platform, data]) => ({
        platform,
        yourCitations: data.yourCitations,
        yourPercentage: data.totalCitations > 0
          ? Math.round((data.yourCitations / data.totalCitations) * 1000) / 10
          : 0,
        totalCitations: data.totalCitations,
        competitors: Array.from(data.competitorCitations.entries())
          .map(([domain, count]) => ({
            name: generateDisplayName(domain),
            citations: count,
            percentage: data.totalCitations > 0
              ? Math.round((count / data.totalCitations) * 1000) / 10
              : 0,
          }))
          .sort((a, b) => b.citations - a.citations)
          .slice(0, 5),
      }))
      .sort((a, b) => b.totalCitations - a.totalCitations);

    const totalTests = new Set(citations?.map(c => c.keyword_id) || []).size;

    const topCompetitor = competitors.length > 0 ? competitors[0].name : undefined;

    const top3Share = competitors.slice(0, 3)
      .reduce((sum, c) => sum + c.percentage, 0);
    const marketConcentration = Math.round(top3Share * 100) / 100;

    const response: ShareOfVoiceResponse = {
      yourBrand: {
        name: generateDisplayName(normalizedYourDomain),
        domain: normalizedYourDomain,
        citations: yourCitations,
        percentage: totalCitations > 0 ? Math.round((yourCitations / totalCitations) * 1000) / 10 : 0,
        platforms: Array.from(yourPlatforms),
      },
      competitors,
      platformBreakdown,
      insights: {
        topCompetitor,
        marketConcentration,
        averageCitationsPerTest: totalTests > 0 ? Math.round((totalCitations / totalTests) * 100) / 100 : 0,
        totalUniqueDomains: uniqueDomainsSet.size,
      },
      totalTests,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };

    console.log(`Share of voice calculated: ${response.yourBrand.percentage}% across ${response.platformBreakdown.length} platforms`);

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

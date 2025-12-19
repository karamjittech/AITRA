"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShareOfVoiceChart } from "@/components/share-of-voice-chart";
import { SentimentTrendChart } from "@/components/sentiment-trend-chart";
import { PlatformRadarChart } from "@/components/platform-radar-chart";
import { CitationTimelineChart } from "@/components/citation-timeline-chart";
import { SOVCompetitorTable } from "@/components/sov-competitor-table";
import { PlatformSOVBreakdown } from "@/components/platform-sov-breakdown";
import { SOVGapInsights } from "@/components/sov-gap-insights";
import { SOVExportButton } from "@/components/sov-export-button";
import { BarChart3, TrendingUp, Target, Clock, AlertCircle, Shield } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { getEdgeFunctionUrl, getSupabaseHeaders } from "@/lib/config";

export const dynamic = 'force-dynamic';

interface SOVData {
  yourBrand: {
    name: string;
    domain: string;
    citations: number;
    percentage: number;
    platforms: string[];
  };
  competitors: Array<{
    name: string;
    domain: string;
    citations: number;
    percentage: number;
    platforms: string[];
    coCitationFrequency: number;
    trend?: 'rising' | 'falling' | 'stable';
    lastSeen?: string;
  }>;
  platformBreakdown: Array<{
    platform: string;
    yourCitations: number;
    yourPercentage: number;
    totalCitations: number;
    competitors: Array<{
      name: string;
      citations: number;
      percentage: number;
    }>;
  }>;
  insights: {
    topCompetitor?: string;
    marketConcentration: number;
    averageCitationsPerTest: number;
    totalUniqueDomains: number;
  };
  totalTests: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [criticalIssues, setCriticalIssues] = useState(0);
  const [sovData, setSOVData] = useState<SOVData | null>(null);
  const [loadingSOV, setLoadingSOV] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCriticalIssues();
    loadSOVData();
  }, [dateRange]);

  const loadCriticalIssues = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: websites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', userData.user.id);

      if (!websites || websites.length === 0) return;

      const websiteId = (websites as { id: string }[])[0].id;

      const { data: citations } = await supabase
        .from('citations')
        .select(`
          id,
          requires_action,
          action_taken,
          tracked_keywords!inner(website_id)
        `)
        .eq('tracked_keywords.website_id', websiteId)
        .eq('requires_action', true)
        .eq('action_taken', false);

      setCriticalIssues(citations?.length || 0);
    } catch (error) {
      console.error('Error loading critical issues:', error);
    }
  };

  const loadSOVData = async () => {
    setLoadingSOV(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: websites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', userData.user.id);

      if (!websites || websites.length === 0) return;

      const websiteId = (websites as { id: string }[])[0].id;

      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await fetch(
        getEdgeFunctionUrl('calculate-share-of-voice'),
        {
          method: 'POST',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({
            websiteId,
            dateRange: {
              start: startDate.toISOString(),
              end: new Date().toISOString(),
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSOVData(data);
      }
    } catch (error) {
      console.error('Error loading SOV data:', error);
    } finally {
      setLoadingSOV(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                <BarChart3 className="h-10 w-10 text-blue-600" />
                AI Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your AI citation performance across platforms
              </p>
            </div>
            <div className="flex gap-2">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                      ? "bg-blue-600 text-white"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  Last {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Citations</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No data available yet
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Share of Voice</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sovData ? `${sovData.yourBrand.percentage.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sovData ? `vs ${sovData.competitors.length} competitors` : 'vs competitors'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Neutral</div>
                <p className="text-xs text-muted-foreground">
                  Across all citations
                </p>
              </CardContent>
            </Card>
            <Card className={criticalIssues > 0 ? "border-red-300 bg-red-50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <AlertCircle className={`h-4 w-4 ${criticalIssues > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${criticalIssues > 0 ? 'text-red-600' : ''}`}>
                  {criticalIssues}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Require immediate attention
                </p>
                {criticalIssues > 0 && (
                  <Button
                    size="sm"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => router.push('/reputation')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    View Issues
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="share-of-voice" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="share-of-voice">Share of Voice</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment Trends</TabsTrigger>
              <TabsTrigger value="platforms">Platform Radar</TabsTrigger>
              <TabsTrigger value="timeline">Citation Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="share-of-voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Share of Voice Analysis</CardTitle>
                  <CardDescription>
                    Your brand visibility compared to competitors in AI citations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ShareOfVoiceChart dateRange={dateRange} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-6">
              {loadingSOV ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading competitive intelligence...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : sovData && sovData.competitors.length > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Competitive Intelligence</h2>
                      <p className="text-muted-foreground">
                        Comprehensive analysis of your AI citation performance
                      </p>
                    </div>
                    <SOVExportButton
                      data={{
                        ...sovData,
                        dateRange: {
                          start: new Date(Date.now() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString(),
                          end: new Date().toISOString(),
                        },
                      }}
                    />
                  </div>

                  <SOVCompetitorTable
                    yourBrand={sovData.yourBrand}
                    competitors={sovData.competitors}
                    totalTests={sovData.totalTests}
                    marketConcentration={sovData.insights.marketConcentration}
                    topCompetitor={sovData.insights.topCompetitor}
                  />

                  {sovData.platformBreakdown.length > 0 && (
                    <PlatformSOVBreakdown
                      platformBreakdown={sovData.platformBreakdown}
                      yourBrandName={sovData.yourBrand.name}
                    />
                  )}

                  {sovData.competitors.length > 0 && (
                    <SOVGapInsights
                      yourSOV={sovData.yourBrand.percentage}
                      topCompetitorSOV={sovData.competitors[0]?.percentage || 0}
                      topCompetitorName={sovData.competitors[0]?.name || 'Unknown'}
                      marketConcentration={sovData.insights.marketConcentration}
                      totalUniqueDomains={sovData.insights.totalUniqueDomains}
                      platformBreakdown={sovData.platformBreakdown}
                    />
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Competitor Data Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start tracking keywords to see competitive intelligence
                      </p>
                      <Button onClick={() => router.push('/keywords')}>
                        Add Keywords
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Trend</CardTitle>
                  <CardDescription>
                    How AI models are mentioning your brand over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SentimentTrendChart dateRange={dateRange} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Visibility</CardTitle>
                  <CardDescription>
                    Your visibility score across different AI models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlatformRadarChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Citation Timeline</CardTitle>
                  <CardDescription>
                    Track citation frequency over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CitationTimelineChart dateRange={dateRange} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

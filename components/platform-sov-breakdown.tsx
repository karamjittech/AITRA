"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Crown, TrendingUp, Award } from "lucide-react";

interface PlatformCompetitor {
  name: string;
  citations: number;
  percentage: number;
}

interface PlatformBreakdownData {
  platform: string;
  yourCitations: number;
  yourPercentage: number;
  totalCitations: number;
  competitors: PlatformCompetitor[];
}

interface PlatformSOVBreakdownProps {
  platformBreakdown: PlatformBreakdownData[];
  yourBrandName: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  'ChatGPT': '🤖',
  'Claude': '🧠',
  'Gemini': '✨',
  'Perplexity': '🔍',
};

const PLATFORM_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'ChatGPT': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'Claude': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  'Gemini': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Perplexity': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
};

export function PlatformSOVBreakdown({
  platformBreakdown,
  yourBrandName,
}: PlatformSOVBreakdownProps) {
  const getPlatformStyle = (platform: string) => {
    return PLATFORM_COLORS[platform] || {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
    };
  };

  const getPerformanceLevel = (percentage: number): {
    label: string;
    color: string;
  } => {
    if (percentage >= 40) return { label: 'Dominant', color: 'text-green-600' };
    if (percentage >= 25) return { label: 'Strong', color: 'text-blue-600' };
    if (percentage >= 15) return { label: 'Competitive', color: 'text-yellow-600' };
    if (percentage >= 5) return { label: 'Emerging', color: 'text-orange-600' };
    return { label: 'Limited', color: 'text-red-600' };
  };

  const sortedPlatforms = [...platformBreakdown].sort(
    (a, b) => b.totalCitations - a.totalCitations
  );

  const topPlatform = sortedPlatforms[0];
  const yourBestPlatform = sortedPlatforms.reduce((best, current) =>
    current.yourPercentage > best.yourPercentage ? current : best
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sortedPlatforms.map((platform) => {
          const style = getPlatformStyle(platform.platform);
          const performance = getPerformanceLevel(platform.yourPercentage);

          return (
            <Card key={platform.platform} className={`${style.border}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{PLATFORM_ICONS[platform.platform] || '🤖'}</span>
                    {platform.platform}
                  </CardTitle>
                  {platform.platform === yourBestPlatform.platform && (
                    <Crown className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Your SOV</span>
                      <span className={`text-2xl font-bold ${style.text}`}>
                        {platform.yourPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={platform.yourPercentage} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Citations</span>
                    <span className="font-medium">
                      {platform.yourCitations}/{platform.totalCitations}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`${performance.color} border-current`}
                  >
                    {performance.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Platform-by-Platform Competitive Analysis
              </CardTitle>
              <CardDescription className="mt-2">
                Detailed breakdown of who's winning on each AI platform
              </CardDescription>
            </div>
            {topPlatform && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Most Active</div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  {PLATFORM_ICONS[topPlatform.platform]}
                  {topPlatform.platform}
                </div>
                <div className="text-xs text-muted-foreground">
                  {topPlatform.totalCitations} citations
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={sortedPlatforms[0]?.platform || 'ChatGPT'} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              {sortedPlatforms.map((platform) => (
                <TabsTrigger key={platform.platform} value={platform.platform}>
                  <span className="mr-1">{PLATFORM_ICONS[platform.platform]}</span>
                  {platform.platform}
                </TabsTrigger>
              ))}
            </TabsList>

            {sortedPlatforms.map((platform) => {
              const style = getPlatformStyle(platform.platform);
              const topCompetitor = platform.competitors[0];

              return (
                <TabsContent
                  key={platform.platform}
                  value={platform.platform}
                  className="space-y-4"
                >
                  <div className={`p-4 rounded-lg border ${style.border} ${style.bg}`}>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Your Position</div>
                        <div className={`text-2xl font-bold ${style.text}`}>
                          {platform.yourPercentage.toFixed(1)}% SOV
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {platform.yourCitations} citations
                        </div>
                      </div>

                      {topCompetitor && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Leader
                          </div>
                          <div className="text-lg font-semibold">{topCompetitor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {topCompetitor.percentage.toFixed(1)}% SOV ({topCompetitor.citations}{' '}
                            citations)
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Gap to Leader</div>
                        {topCompetitor && (
                          <>
                            <div className="text-lg font-semibold">
                              {Math.abs(
                                topCompetitor.percentage - platform.yourPercentage
                              ).toFixed(1)}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {topCompetitor.citations - platform.yourCitations} more citations needed
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-3">
                      Top Competitors on {platform.platform}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Competitor</TableHead>
                          <TableHead className="text-right">Citations</TableHead>
                          <TableHead className="text-right">Share of Voice</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-blue-50">
                          <TableCell className="font-medium">
                            <Crown className="h-4 w-4 text-blue-600" />
                          </TableCell>
                          <TableCell className="font-semibold">
                            {yourBrandName} (You)
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {platform.yourCitations}
                          </TableCell>
                          <TableCell className="text-right font-bold text-blue-700">
                            {platform.yourPercentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>

                        {platform.competitors.slice(0, 5).map((competitor, index) => (
                          <TableRow key={competitor.name}>
                            <TableCell className="text-muted-foreground">
                              #{index + 1}
                            </TableCell>
                            <TableCell>{competitor.name}</TableCell>
                            <TableCell className="text-right">{competitor.citations}</TableCell>
                            <TableCell className="text-right font-medium">
                              {competitor.percentage.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {platform.yourPercentage < 20 && topCompetitor && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="font-medium text-amber-900">Opportunity Identified</p>
                          <p className="text-sm text-amber-700">
                            {topCompetitor.name} dominates {platform.platform} with{' '}
                            {topCompetitor.percentage.toFixed(1)}% SOV. Focus on optimizing content
                            specifically for {platform.platform}'s preferences to close this gap.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Zap,
} from "lucide-react";

interface SOVGapInsightsProps {
  yourSOV: number;
  topCompetitorSOV: number;
  topCompetitorName: string;
  marketConcentration: number;
  totalUniqueDomains: number;
  platformBreakdown: Array<{
    platform: string;
    yourPercentage: number;
    competitors: Array<{
      name: string;
      percentage: number;
    }>;
  }>;
}

export function SOVGapInsights({
  yourSOV,
  topCompetitorSOV,
  topCompetitorName,
  marketConcentration,
  totalUniqueDomains,
  platformBreakdown,
}: SOVGapInsightsProps) {
  const sovGap = topCompetitorSOV - yourSOV;
  const isLeader = yourSOV >= topCompetitorSOV;

  const getOpportunities = () => {
    const opportunities = [];

    const weakPlatforms = platformBreakdown
      .filter((p) => p.yourPercentage < 15)
      .sort((a, b) => a.yourPercentage - b.yourPercentage);

    if (weakPlatforms.length > 0) {
      const weakest = weakPlatforms[0];
      const topCompOnPlatform = weakest.competitors[0];
      opportunities.push({
        type: 'platform',
        priority: 'high',
        title: `Optimize for ${weakest.platform}`,
        description: `You're only capturing ${weakest.yourPercentage.toFixed(
          1
        )}% SOV on ${weakest.platform}. ${topCompOnPlatform?.name || 'The leader'} has ${
          topCompOnPlatform?.percentage.toFixed(1) || 'significantly more'
        }% - focus your next content optimization here.`,
        impact: `+${Math.min(10, topCompOnPlatform?.percentage / 2 || 5).toFixed(1)}% potential SOV gain`,
        icon: <Target className="h-5 w-5 text-blue-600" />,
      });
    }

    if (marketConcentration < 50) {
      opportunities.push({
        type: 'market',
        priority: 'medium',
        title: 'Fragmented Market Opportunity',
        description: `The market is fragmented with ${totalUniqueDomains} competing domains. No single player dominates, creating an opportunity for you to capture significant share.`,
        impact: 'High growth potential in fragmented market',
        icon: <Zap className="h-5 w-5 text-yellow-600" />,
      });
    } else if (marketConcentration > 75) {
      opportunities.push({
        type: 'market',
        priority: 'low',
        title: 'Concentrated Market Challenge',
        description: `Top competitors control ${marketConcentration.toFixed(
          1
        )}% of citations. Focus on niche differentiation and platform-specific optimization to gain foothold.`,
        impact: 'Requires targeted strategy',
        icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      });
    }

    const balancedPlatforms = platformBreakdown.filter(
      (p) => p.yourPercentage >= 20 && p.yourPercentage < 35
    );
    if (balancedPlatforms.length > 0) {
      opportunities.push({
        type: 'leverage',
        priority: 'medium',
        title: 'Leverage Strong Platforms',
        description: `You have competitive presence on ${balancedPlatforms
          .map((p) => p.platform)
          .join(', ')}. Double down on these platforms to establish dominance.`,
        impact: `Potential to reach 30-40% SOV on strong platforms`,
        icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      });
    }

    if (sovGap > 20) {
      opportunities.push({
        type: 'content',
        priority: 'high',
        title: 'Close the Content Gap',
        description: `${topCompetitorName} has ${sovGap.toFixed(
          1
        )}% more SOV. Analyze their cited content patterns, create similar high-quality content, and optimize for all platforms.`,
        impact: `Need ${Math.ceil((sovGap / 100) * 10)} more strategic content pieces`,
        icon: <ArrowUpRight className="h-5 w-5 text-purple-600" />,
      });
    }

    return opportunities;
  };

  const opportunities = getOpportunities();
  const highPriorityCount = opportunities.filter((o) => o.priority === 'high').length;

  const getSOVStatus = () => {
    if (yourSOV >= 40) return { label: 'Market Leader', color: 'text-green-600', variant: 'default' };
    if (yourSOV >= 25) return { label: 'Strong Player', color: 'text-blue-600', variant: 'default' };
    if (yourSOV >= 15) return { label: 'Competitive', color: 'text-yellow-600', variant: 'secondary' };
    if (yourSOV >= 5) return { label: 'Emerging', color: 'text-orange-600', variant: 'secondary' };
    return { label: 'Building Presence', color: 'text-red-600', variant: 'destructive' };
  };

  const status = getSOVStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI SOV Strategic Insights
          </CardTitle>
          <CardDescription>
            Actionable opportunities to increase your AI visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-white">
              <p className="text-sm text-muted-foreground mb-1">Your SOV Status</p>
              <p className={`text-2xl font-bold ${status.color}`}>{yourSOV.toFixed(1)}%</p>
              <Badge variant={status.variant as any} className="mt-2">
                {status.label}
              </Badge>
            </div>

            <div className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-white">
              <p className="text-sm text-muted-foreground mb-1">Leader's SOV</p>
              <p className="text-2xl font-bold text-orange-600">{topCompetitorSOV.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-2">{topCompetitorName}</p>
            </div>

            <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-white">
              <p className="text-sm text-muted-foreground mb-1">Gap to Close</p>
              <p className="text-2xl font-bold text-purple-600">
                {isLeader ? '✓ Leading' : `${sovGap.toFixed(1)}%`}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {isLeader ? "You're ahead!" : 'Points behind leader'}
              </p>
            </div>
          </div>

          {!isLeader && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to Leader</span>
                  <span className="font-medium">
                    {topCompetitorSOV > 0 ? ((yourSOV / topCompetitorSOV) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <Progress
                  value={topCompetitorSOV > 0 ? (yourSOV / topCompetitorSOV) * 100 : 0}
                  className="h-3"
                />
              </div>

              {sovGap > 10 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You're <strong>{sovGap.toFixed(1)}% behind</strong> the market leader. Focus on
                    high-priority opportunities below to close this gap systematically.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {isLeader && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                You're the market leader! Maintain your advantage by continuing to optimize across
                all platforms and monitoring emerging competitors.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Strategic Opportunities
            </span>
            {highPriorityCount > 0 && (
              <Badge variant="destructive">{highPriorityCount} High Priority</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Data-driven recommendations to improve your AI Share of Voice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  opportunity.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : opportunity.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{opportunity.icon}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-900">{opportunity.title}</h4>
                      <Badge
                        variant={
                          opportunity.priority === 'high'
                            ? 'destructive'
                            : opportunity.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                        className="shrink-0"
                      >
                        {opportunity.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{opportunity.description}</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {opportunity.impact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {opportunities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p className="font-medium">You're performing excellently!</p>
                <p className="text-sm mt-1">
                  Continue monitoring and maintaining your competitive position.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommended Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Address High-Priority Gaps</p>
                <p className="text-sm text-gray-600 mt-1">
                  Focus on opportunities marked as "high priority" first - these have the biggest
                  potential impact on your SOV.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Platform-Specific Optimization</p>
                <p className="text-sm text-gray-600 mt-1">
                  Review the platform breakdown to identify where you're underperforming. Tailor
                  content to each platform's preferences.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Monitor & Iterate</p>
                <p className="text-sm text-gray-600 mt-1">
                  Track your SOV weekly, analyze what's working, and continuously refine your
                  strategy based on competitive movements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">Scale What Works</p>
                <p className="text-sm text-gray-600 mt-1">
                  Once you identify successful content patterns that drive citations, create more
                  content following those patterns.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

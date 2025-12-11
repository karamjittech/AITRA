"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Link as LinkIcon,
  FileText,
  Calendar,
  BarChart3,
} from "lucide-react";
import { CompetitorData, PageAnalysis, Scores } from "@/lib/types";

interface CompetitiveGapAnalysisProps {
  competitor: CompetitorData;
  userAnalysis: PageAnalysis;
  userScores: Scores;
  analyzedUrl: string;
}

export function CompetitiveGapAnalysis({
  competitor,
  userAnalysis,
  userScores,
  analyzedUrl,
}: CompetitiveGapAnalysisProps) {
  const gaps = [
    {
      metric: "Content Length",
      yourValue: userAnalysis.wordCount,
      competitorValue: competitor.contentLength,
      unit: "words",
      isHigherBetter: true,
      icon: <FileText className="h-4 w-4" />,
      action: `Add ${competitor.contentLength - userAnalysis.wordCount} more words`,
      impact: "high",
    },
    {
      metric: "Domain Authority",
      yourValue: 45,
      competitorValue: competitor.domainRating,
      unit: "DR",
      isHigherBetter: true,
      icon: <BarChart3 className="h-4 w-4" />,
      action: `Build authority through ${competitor.domainRating - 45} point improvement`,
      impact: "high",
    },
    {
      metric: "Backlinks",
      yourValue: 2,
      competitorValue: competitor.backlinkCount,
      unit: "links",
      isHigherBetter: true,
      icon: <LinkIcon className="h-4 w-4" />,
      action: `Acquire ${Math.min(50, competitor.backlinkCount - 2)} quality backlinks`,
      impact: "high",
    },
    {
      metric: "H2 Subheadings",
      yourValue: userAnalysis.h2Count,
      competitorValue: competitor.h2Count,
      unit: "headings",
      isHigherBetter: true,
      icon: <Target className="h-4 w-4" />,
      action: `Add ${Math.max(0, competitor.h2Count - userAnalysis.h2Count)} more H2 sections`,
      impact: "medium",
    },
    {
      metric: "Content Freshness",
      yourValue: 180,
      competitorValue: competitor.freshnessDays,
      unit: "days old",
      isHigherBetter: false,
      icon: <Calendar className="h-4 w-4" />,
      action: competitor.freshnessDays < 180 ? "Update content monthly" : "Maintain freshness",
      impact: "medium",
    },
    {
      metric: "Schema Present",
      yourValue: (userAnalysis.hasFaqSchema ? 1 : 0) + (userAnalysis.hasHowtoSchema ? 1 : 0),
      competitorValue: competitor.schemaPresent ? 2 : 0,
      unit: "types",
      isHigherBetter: true,
      icon: <Target className="h-4 w-4" />,
      action: competitor.schemaPresent ? "Add FAQ and HowTo schemas" : "Maintain advantage",
      impact: competitor.schemaPresent ? "high" : "low",
    },
  ];

  const calculateGapPercentage = (yourValue: number, competitorValue: number, isHigherBetter: boolean) => {
    if (isHigherBetter) {
      return competitorValue > 0 ? (yourValue / competitorValue) * 100 : 100;
    } else {
      return yourValue > 0 ? (competitorValue / yourValue) * 100 : 100;
    }
  };

  const getGapStatus = (percentage: number) => {
    if (percentage >= 90) return { label: "Competitive", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 70) return { label: "Close Gap", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (percentage >= 50) return { label: "Moderate Gap", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "Large Gap", color: "text-red-600", bg: "bg-red-100" };
  };

  const scoreGap = competitor.overallScore - userScores.overallScore;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Competitive Gap Analysis
          </CardTitle>
          <CardDescription>
            Compare your content against the top-ranking competitor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-white">
              <p className="text-sm text-muted-foreground mb-1">Your Page</p>
              <p className="text-2xl font-bold text-blue-600">{userScores.overallScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">{analyzedUrl}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-white">
              <p className="text-sm text-muted-foreground mb-1">#{competitor.googleRank} Competitor</p>
              <p className="text-2xl font-bold text-orange-600">{competitor.overallScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">{competitor.competitorName}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Score Gap</span>
              <Badge variant={scoreGap > 20 ? "destructive" : scoreGap > 10 ? "default" : "secondary"}>
                {scoreGap > 0 ? `Behind by ${scoreGap.toFixed(1)} points` : `Ahead by ${Math.abs(scoreGap).toFixed(1)} points`}
              </Badge>
            </div>
            <Progress
              value={Math.min(100, (userScores.overallScore / competitor.overallScore) * 100)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You're at {((userScores.overallScore / competitor.overallScore) * 100).toFixed(0)}% of the leader's score
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-4">Metric-by-Metric Comparison</h3>
            <div className="space-y-4">
              {gaps.map((gap, idx) => {
                const percentage = calculateGapPercentage(
                  gap.yourValue,
                  gap.competitorValue,
                  gap.isHigherBetter
                );
                const status = getGapStatus(percentage);
                const isBehind = gap.isHigherBetter
                  ? gap.yourValue < gap.competitorValue
                  : gap.yourValue > gap.competitorValue;

                return (
                  <div key={idx} className="p-4 rounded-lg border bg-white space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {gap.icon}
                        <span className="font-medium text-gray-900">{gap.metric}</span>
                      </div>
                      <Badge className={status.bg + " " + status.color}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Your Value</p>
                        <p className="font-semibold text-lg">
                          {gap.yourValue.toLocaleString()} {gap.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Competitor</p>
                        <p className="font-semibold text-lg">
                          {gap.competitorValue.toLocaleString()} {gap.unit}
                        </p>
                      </div>
                    </div>

                    <Progress value={Math.min(100, percentage)} className="h-2" />

                    {isBehind && (
                      <div className="flex items-start gap-2 bg-blue-50 rounded p-3">
                        {gap.impact === "high" ? (
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">Action Needed</p>
                          <p className="text-xs text-blue-700 mt-1">{gap.action}</p>
                        </div>
                        <Badge variant={gap.impact === "high" ? "default" : "secondary"} className="text-xs">
                          {gap.impact} impact
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Competitive Advantages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gaps
                .filter((gap) =>
                  gap.isHigherBetter
                    ? gap.yourValue >= gap.competitorValue
                    : gap.yourValue <= gap.competitorValue
                )
                .map((gap, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 text-green-900">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium text-sm">{gap.metric}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      You're {gap.isHigherBetter ? "ahead" : "more recent"} - maintain this advantage
                    </p>
                  </div>
                ))}
              {gaps.filter((gap) =>
                gap.isHigherBetter
                  ? gap.yourValue >= gap.competitorValue
                  : gap.yourValue <= gap.competitorValue
              ).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                  Focus on closing gaps to establish competitive advantages
                </p>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Winning Strategy</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">1.</span>
                    <span>
                      <strong>Content & Structure (Weeks 1-3):</strong> Expand to{" "}
                      {competitor.contentLength}+ words, add {Math.max(0, competitor.h2Count - userAnalysis.h2Count)} H2
                      sections, implement schema markup
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">2.</span>
                    <span>
                      <strong>Authority Building (Weeks 4-12):</strong> Build 10-25 quality backlinks from
                      tech blogs, directories, and industry sites
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">3.</span>
                    <span>
                      <strong>AI Optimization (Weeks 9-12):</strong> Fine-tune platform-specific signals, add
                      citations, optimize for freshness
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

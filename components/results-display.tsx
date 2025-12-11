"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OverallScore, ScoreDisplay } from "./score-display";
import { PlatformCardsSection } from "./platform-cards-section";
import { PageAnalysis, Scores, PlatformScores } from "@/lib/types";
import { CheckCircle2, XCircle, AlertCircle, FileText, Hash, Heading1, Heading2, List } from "lucide-react";

interface ResultsDisplayProps {
  analysis: PageAnalysis;
  scores: Scores;
  platformScores: PlatformScores;
  analyzedUrl: string;
}

export function ResultsDisplay({ analysis, scores, platformScores, analyzedUrl }: ResultsDisplayProps) {
  const getScoreColor = (score: number, max: number): "red" | "yellow" | "green" => {
    const percentage = (score / max) * 100;
    if (percentage >= 75) return "green";
    if (percentage >= 50) return "yellow";
    return "red";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Analysis Complete</h2>
        <p className="text-muted-foreground">
          Results for: <span className="font-medium">{analyzedUrl}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OverallScore score={scores.overallScore} />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>
                Individual component scores contributing to your overall AI readiness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreDisplay
                score={scores.structureScore}
                label="Structure Score"
                maxScore={35}
                color={getScoreColor(scores.structureScore, 35)}
              />
              <ScoreDisplay
                score={scores.metadataScore}
                label="Metadata Score"
                maxScore={25}
                color={getScoreColor(scores.metadataScore, 25)}
              />
              <ScoreDisplay
                score={scores.contentScore}
                label="Content Score"
                maxScore={25}
                color={getScoreColor(scores.contentScore, 25)}
              />
              <ScoreDisplay
                score={scores.schemaScore}
                label="Schema Score"
                maxScore={20}
                color={getScoreColor(scores.schemaScore, 20)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Page Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Title</span>
                <span className="text-sm font-medium text-right max-w-[60%]">
                  {analysis.title || "Not found"}
                </span>
              </div>
              {analysis.title && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Length</span>
                  <span className={
                    analysis.title.length >= 30 && analysis.title.length <= 60
                      ? "text-green-600 font-medium"
                      : "text-yellow-600"
                  }>
                    {analysis.title.length} chars {
                      analysis.title.length >= 30 && analysis.title.length <= 60
                        ? "(Optimal)"
                        : "(Should be 30-60)"
                    }
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Meta Description</span>
                <span className="text-sm font-medium text-right max-w-[60%]">
                  {analysis.metaDescription
                    ? `${analysis.metaDescription.substring(0, 50)}...`
                    : "Not found"}
                </span>
              </div>
              {analysis.metaDescription && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Length</span>
                  <span className={
                    analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160
                      ? "text-green-600 font-medium"
                      : "text-yellow-600"
                  }>
                    {analysis.metaDescription.length} chars {
                      analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160
                        ? "(Optimal)"
                        : "(Should be 120-160)"
                    }
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Heading1 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">H1 Tags</p>
                  <p className={`text-lg font-bold ${
                    analysis.h1Count === 1 ? "text-green-600" : "text-red-600"
                  }`}>
                    {analysis.h1Count}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heading2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">H2 Tags</p>
                  <p className={`text-lg font-bold ${
                    analysis.h2Count >= 2 ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {analysis.h2Count}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">List Structure</span>
              </div>
              <Badge variant={analysis.hasListStructure ? "default" : "secondary"}>
                {analysis.hasListStructure ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Detected
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Found
                  </span>
                )}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Word Count</span>
              <Badge variant={analysis.wordCount >= 500 ? "default" : "secondary"}>
                <Hash className="h-3 w-3 mr-1" />
                {analysis.wordCount}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Readability Score</span>
              <Badge variant="outline">
                {analysis.readabilityScore.toFixed(1)}/100
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schema Markup</CardTitle>
            <CardDescription>
              Detected structured data on your page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                {analysis.hasFaqSchema ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">FAQ Schema</span>
              </div>
              <Badge variant={analysis.hasFaqSchema ? "default" : "secondary"}>
                {analysis.hasFaqSchema ? "Detected" : "Missing"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                {analysis.hasHowtoSchema ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">HowTo Schema</span>
              </div>
              <Badge variant={analysis.hasHowtoSchema ? "default" : "secondary"}>
                {analysis.hasHowtoSchema ? "Detected" : "Missing"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                {analysis.hasArticleSchema ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium">Article Schema</span>
              </div>
              <Badge variant={analysis.hasArticleSchema ? "default" : "secondary"}>
                {analysis.hasArticleSchema ? "Detected" : "Not Found"}
              </Badge>
            </div>

            {!analysis.hasFaqSchema && !analysis.hasHowtoSchema && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Adding schema markup can improve your AI readiness score by up to 20 points
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Recommendations</CardTitle>
          <CardDescription>
            Top priority improvements to boost your AI visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.h1Count !== 1 && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Fix H1 Tag Structure</p>
                <p className="text-sm text-red-700 mt-1">
                  Your page has {analysis.h1Count} H1 tag{analysis.h1Count !== 1 ? 's' : ''}.
                  Pages should have exactly one H1 tag for optimal AI parsing.
                </p>
                <Badge className="mt-2" variant="destructive">High Impact: +15 points</Badge>
              </div>
            </div>
          )}

          {analysis.h2Count < 2 && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">Add More H2 Subheadings</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your page has {analysis.h2Count} H2 tag{analysis.h2Count !== 1 ? 's' : ''}.
                  Add at least 2 H2 tags to improve content structure for AI models.
                </p>
                <Badge className="mt-2">Medium Impact: +15 points</Badge>
              </div>
            </div>
          )}

          {!analysis.hasFaqSchema && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Add FAQ Schema Markup</p>
                <p className="text-sm text-blue-700 mt-1">
                  FAQ schema helps AI models understand your content better and increases citation likelihood.
                </p>
                <Badge className="mt-2" variant="outline">High Impact: +10 points</Badge>
              </div>
            </div>
          )}

          {!analysis.hasListStructure && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Add Bullet Points or Lists</p>
                <p className="text-sm text-blue-700 mt-1">
                  Research shows bullet points boost AI inclusion by 4.72%. Break content into scannable lists for better readability.
                </p>
                <Badge className="mt-2" variant="outline">Medium Impact: +5 points</Badge>
              </div>
            </div>
          )}

          {analysis.wordCount < 500 && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Expand Content Length</p>
                <p className="text-sm text-gray-700 mt-1">
                  Your page has {analysis.wordCount} words. Aim for at least 500 words for better AI coverage.
                </p>
                <Badge className="mt-2" variant="secondary">Medium Impact: +10 points</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PlatformCardsSection platformScores={platformScores} analysis={analysis} />
    </div>
  );
}

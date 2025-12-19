"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompetitorData, PageAnalysis, Scores } from "@/lib/types";
import { Trophy, TrendingUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface CompetitiveAnalysisProps {
  competitor: CompetitorData;
  userAnalysis: PageAnalysis;
  userScores: Scores;
  analyzedUrl: string;
}

export function CompetitiveAnalysis({
  competitor,
  userAnalysis,
  userScores,
  analyzedUrl,
}: CompetitiveAnalysisProps) {
  const userDomain = new URL(analyzedUrl).hostname;

  const contentGap = competitor.contentLength - userAnalysis.wordCount;
  const authorityGap = competitor.backlinkCount;
  const schemaGap: string[] = [];

  if (competitor.schemaPresent && !userAnalysis.hasFaqSchema) {
    schemaGap.push("FAQ Schema");
  }
  if (competitor.schemaPresent && !userAnalysis.hasHowtoSchema) {
    schemaGap.push("HowTo Schema");
  }

  const freshnessGap = competitor.freshnessDays;

  const getUserAdvantage = (userValue: number, competitorValue: number) => {
    return userValue >= competitorValue;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold">Competitive Positioning</h3>
        <p className="text-muted-foreground">
          See how your content compares to top-ranking competitors
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> You don't need to beat the #1 competitor today. Focus on
          ranking #7-10 first (typically 3-6 months), then optimize to move up. The data below
          uses mock competitor benchmarks for MVP demonstration.
        </AlertDescription>
      </Alert>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Head-to-Head Comparison</CardTitle>
          <CardDescription>
            Your site vs. {competitor.competitorName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Metric</TableHead>
                  <TableHead className="text-center">Your Site</TableHead>
                  <TableHead className="text-center">
                    {competitor.competitorName}
                  </TableHead>
                  <TableHead className="text-center">Advantage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">AI Readiness Score</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{userScores.overallScore}/100</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{competitor.overallScore}/100</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserAdvantage(userScores.overallScore, competitor.overallScore) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Domain Rating</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">45</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{competitor.domainRating}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserAdvantage(45, competitor.domainRating) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Backlinks</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">~10</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{competitor.backlinkCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserAdvantage(10, competitor.backlinkCount) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Content Length</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{userAnalysis.wordCount} words</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{competitor.contentLength} words</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserAdvantage(userAnalysis.wordCount, competitor.contentLength) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">H1 Structure</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={userAnalysis.h1Count === 1 ? "default" : "destructive"}
                    >
                      {userAnalysis.h1Count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={competitor.h1Count === 1 ? "default" : "destructive"}>
                      {competitor.h1Count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserAdvantage(
                      userAnalysis.h1Count === 1 ? 1 : 0,
                      competitor.h1Count === 1 ? 1 : 0
                    ) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">H2 Tags</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{userAnalysis.h2Count}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{competitor.h2Count}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserAdvantage(userAnalysis.h2Count, competitor.h2Count) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Schema Markup</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        userAnalysis.hasFaqSchema || userAnalysis.hasHowtoSchema
                          ? "default"
                          : "secondary"
                      }
                    >
                      {userAnalysis.hasFaqSchema || userAnalysis.hasHowtoSchema
                        ? "Present"
                        : "Missing"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={competitor.schemaPresent ? "default" : "secondary"}>
                      {competitor.schemaPresent ? "Present" : "Missing"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserAdvantage(
                      userAnalysis.hasFaqSchema || userAnalysis.hasHowtoSchema ? 1 : 0,
                      competitor.schemaPresent ? 1 : 0
                    ) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Google Rank</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">Not ranking</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default">#{competitor.googleRank || "N/A"}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">AI Citations</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">0%</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default">{competitor.aiCitationPercentage}%</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gap Analysis
          </CardTitle>
          <CardDescription>
            Key differences you need to address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentGap > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Content Gap</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Need <strong>+{contentGap} words</strong> to match competitor content length
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">Authority Gap</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Need <strong>+{authorityGap} backlinks</strong> to compete with their domain authority
              </p>
            </div>
          </div>

          {schemaGap.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Schema Gap</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Missing: <strong>{schemaGap.join(", ")}</strong>
                </p>
              </div>
            </div>
          )}

          {freshnessGap > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
              <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Freshness Gap</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Competitor updated <strong>{freshnessGap} days ago</strong> - maintain regular
                  updates
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>Winning Strategy</CardTitle>
          <CardDescription>Your path to competitive positioning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="text-base">
              <strong className="text-foreground">You don't need to beat them today.</strong> Here's
              your realistic timeline:
            </p>

            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <Badge className="shrink-0 mt-1">Goal 1</Badge>
                <p className="text-sm">
                  <strong className="text-foreground">Rank #7-10 on Google</strong> for your target
                  keyword. Once ranked, you'll automatically get ~13-16% chance of AI citations.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="shrink-0 mt-1">Timeline</Badge>
                <p className="text-sm">
                  <strong className="text-foreground">3-6 months</strong> for traditional SEO
                  ranking improvements
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="shrink-0 mt-1">Then</Badge>
                <p className="text-sm">
                  <strong className="text-foreground">Optimize AI signals</strong> to move from 13%
                  → 25% citation rate
                </p>
              </div>
            </div>

            <p className="text-sm mt-4">
              Follow the optimization roadmap in the next tab to systematically close these gaps and
              improve your competitive positioning.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

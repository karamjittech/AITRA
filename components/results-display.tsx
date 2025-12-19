"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverallScore, ScoreDisplay } from "./score-display";
import { PlatformCardsSection } from "./platform-cards-section";
import { FixModal } from "./fix-modal";
import { TableConversionModal } from "./table-conversion-modal";
import { CompetitiveAnalysis } from "./competitive-analysis";
import { CompetitiveGapAnalysis } from "./competitive-gap-analysis";
import { RoadmapVisualization } from "./roadmap-visualization";
import { MonthlyMilestones } from "./monthly-milestones";
import { BotAccessCard } from "./bot-access-card";
import { EntityIdentityCard } from "./entity-identity-card";
import { AEOScoreCard } from "./aeo-score-card";
import { ResearchRecommendations } from "./research-recommendations";
import { PageAnalysis, Scores, PlatformScores, CompetitorData, BotAccessStatus } from "@/lib/types";
import { generateMockCompetitors, selectPrimaryCompetitor } from "@/lib/mock-competitors";
import { generateRoadmapPhases, calculateCurrentPhase } from "@/lib/phase-calculator";
import { calculateBotPenalty } from "@/lib/bot-verification";
import { CheckCircle2, XCircle, AlertCircle, FileText, Hash, Heading1, Heading2, List, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import { getEdgeFunctionUrl, getSupabaseHeaders } from "@/lib/config";

interface ResultsDisplayProps {
  analysis: PageAnalysis;
  scores: Scores;
  platformScores: PlatformScores;
  analyzedUrl: string;
  pageId?: string;
}

export function ResultsDisplay({ analysis, scores, platformScores, analyzedUrl, pageId }: ResultsDisplayProps) {
  const [loadingFix, setLoadingFix] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [currentFix, setCurrentFix] = useState<any>(null);
  const [currentFixType, setCurrentFixType] = useState<string>("");
  const [currentFixImpact, setCurrentFixImpact] = useState<string>("");
  const [botAccessData, setBotAccessData] = useState<BotAccessStatus[]>([]);
  const [loadingBotData, setLoadingBotData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchBotAccessData() {
      if (!pageId) {
        console.log('[Bot Access] No pageId provided, skipping fetch');
        setLoadingBotData(false);
        return;
      }

      console.log('[Bot Access] Fetching data for pageId:', pageId);

      try {
        const { data, error } = await supabase
          .from('bot_access')
          .select('*')
          .eq('page_id', pageId);

        if (error) {
          console.error('[Bot Access] Error fetching data:', error);
        } else if (data) {
          console.log('[Bot Access] Fetched data:', data.length, 'records');
          const transformedData: BotAccessStatus[] = (data as any[]).map((item: any) => ({
            id: item.id,
            pageId: item.page_id,
            botName: item.bot_name,
            isAllowed: item.is_allowed,
            blockReason: item.block_reason,
            robotsTxtRule: item.robots_txt_rule,
            checkedAt: item.checked_at,
          }));
          setBotAccessData(transformedData);
          console.log('[Bot Access] Transformed data:', transformedData);
        }
      } catch (error) {
        console.error('[Bot Access] Exception during fetch:', error);
      } finally {
        setLoadingBotData(false);
        console.log('[Bot Access] Loading complete');
      }
    }

    fetchBotAccessData();
  }, [pageId]);

  const competitors = generateMockCompetitors(
    scores.overallScore,
    analysis.wordCount,
    analyzedUrl
  );
  const primaryCompetitor = selectPrimaryCompetitor(competitors);
  const currentPhase = calculateCurrentPhase(scores.overallScore);
  const roadmapPhases = generateRoadmapPhases(scores.overallScore);

  const getScoreColor = (score: number, max: number): "red" | "yellow" | "green" => {
    const percentage = (score / max) * 100;
    if (percentage >= 75) return "green";
    if (percentage >= 50) return "yellow";
    return "red";
  };

  const handleGenerateFix = async (
    fixType: "faq-schema" | "howto-schema" | "article-schema" | "meta-description" | "title-tag" | "organization-schema" | "person-schema" | "paragraph-to-table",
    impact: string
  ) => {
    if (fixType === "paragraph-to-table") {
      setTableModalOpen(true);
      return;
    }

    setLoadingFix(fixType);

    try {
      const response = await fetch(
        getEdgeFunctionUrl('generate-fix'),
        {
          method: "POST",
          headers: getSupabaseHeaders(),
          body: JSON.stringify({
            pageId: pageId || "00000000-0000-0000-0000-000000000001",
            fixType: fixType,
            currentContent: {
              title: analysis.title,
              metaDescription: analysis.metaDescription,
              url: analyzedUrl,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate fix");
      }

      if (data.success) {
        setCurrentFix(data.fix.schema_json);
        setCurrentFixType(fixType);
        setCurrentFixImpact(impact);
        setModalOpen(true);

        if (data.cached) {
          toast({
            title: "Retrieved cached fix",
            description: "This fix was generated previously",
          });
        } else {
          toast({
            title: "Fix generated successfully",
            description: "Your optimization code is ready to use",
          });
        }
      }
    } catch (error) {
      console.error("Error generating fix:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingFix(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analysis Complete</h2>
        <p className="text-muted-foreground text-base">
          Results for: <span className="font-semibold text-gray-900 dark:text-gray-100">{analyzedUrl}</span>
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OverallScore score={scores.overallScore} />
        </div>

        <div className="lg:col-span-2">
          <Card className="border shadow-sm h-full">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>
                Individual component scores contributing to your overall AI readiness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
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
              <ScoreDisplay
                score={scores.aeoScore}
                label="AEO Score"
                maxScore={25}
                color={getScoreColor(scores.aeoScore, 25)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BotAccessCard
          botAccessData={botAccessData}
          scorePenalty={calculateBotPenalty(botAccessData.filter(b => !b.isAllowed).length)}
          loading={loadingBotData}
        />

        <EntityIdentityCard
          entityType={analysis.entityType}
          entityIdentityScore={analysis.entityIdentityScore}
          hasOrganizationSchema={analysis.hasOrganizationSchema}
          hasPersonSchema={analysis.hasPersonSchema}
          hasSameAsLinks={analysis.hasSameAsLinks}
          sameAsPlatforms={analysis.sameAsPlatforms}
          onDefineEntity={() => {
            if (analysis.entityType === "none") {
              handleGenerateFix("organization-schema", "+5 points");
            } else if (!analysis.hasSameAsLinks) {
              toast({
                title: "Add Knowledge Graph Links",
                description: "Edit your schema markup to include sameAs links to Wikipedia, Wikidata, LinkedIn, etc.",
              });
            }
          }}
        />
      </div>

      <AEOScoreCard analysis={analysis} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
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
                <div className="flex items-center gap-2">
                  {analysis.title && (analysis.title.length < 30 || analysis.title.length > 60) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleGenerateFix("title-tag", "+6 points")}
                      disabled={loadingFix === "title-tag"}
                    >
                      {loadingFix === "title-tag" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Rewrite
                        </>
                      )}
                    </Button>
                  )}
                  <span className="text-sm font-medium text-right max-w-[60%]">
                    {analysis.title || "Not found"}
                  </span>
                </div>
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
                <div className="flex items-center gap-2">
                  {analysis.metaDescription && (analysis.metaDescription.length < 120 || analysis.metaDescription.length > 160) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleGenerateFix("meta-description", "+7 points")}
                      disabled={loadingFix === "meta-description"}
                    >
                      {loadingFix === "meta-description" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Rewrite
                        </>
                      )}
                    </Button>
                  )}
                  <span className="text-sm font-medium text-right max-w-[60%]">
                    {analysis.metaDescription
                      ? `${analysis.metaDescription.substring(0, 50)}...`
                      : "Not found"}
                  </span>
                </div>
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

        <Card className="border shadow-sm">
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
              <div className="flex items-center gap-2">
                {!analysis.hasFaqSchema && (
                  <Button
                    size="sm"
                    onClick={() => handleGenerateFix("faq-schema", "+10 points")}
                    disabled={loadingFix === "faq-schema"}
                  >
                    {loadingFix === "faq-schema" ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
                <Badge variant={analysis.hasFaqSchema ? "default" : "secondary"}>
                  {analysis.hasFaqSchema ? "Detected" : "Missing"}
                </Badge>
              </div>
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
              <div className="flex items-center gap-2">
                {!analysis.hasHowtoSchema && (
                  <Button
                    size="sm"
                    onClick={() => handleGenerateFix("howto-schema", "+10 points")}
                    disabled={loadingFix === "howto-schema"}
                  >
                    {loadingFix === "howto-schema" ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
                <Badge variant={analysis.hasHowtoSchema ? "default" : "secondary"}>
                  {analysis.hasHowtoSchema ? "Detected" : "Missing"}
                </Badge>
              </div>
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
              <div className="flex items-center gap-2">
                {!analysis.hasArticleSchema && (
                  <Button
                    size="sm"
                    onClick={() => handleGenerateFix("article-schema", "+5 points")}
                    disabled={loadingFix === "article-schema"}
                  >
                    {loadingFix === "article-schema" ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
                <Badge variant={analysis.hasArticleSchema ? "default" : "secondary"}>
                  {analysis.hasArticleSchema ? "Detected" : "Not Found"}
                </Badge>
              </div>
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

      <ResearchRecommendations
        analysis={analysis}
        scores={scores}
        onGenerateFix={handleGenerateFix}
        loadingFix={loadingFix}
      />

          <PlatformCardsSection platformScores={platformScores} analysis={analysis} />
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6 mt-6">
          <CompetitiveGapAnalysis
            competitor={primaryCompetitor}
            userAnalysis={analysis}
            userScores={scores}
            analyzedUrl={analyzedUrl}
          />

          <CompetitiveAnalysis
            competitor={primaryCompetitor}
            userAnalysis={analysis}
            userScores={scores}
            analyzedUrl={analyzedUrl}
          />
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6 mt-6">
          <RoadmapVisualization
            phases={roadmapPhases}
            currentPhase={currentPhase}
            overallScore={scores.overallScore}
          />

          <MonthlyMilestones currentScore={scores.overallScore} />
        </TabsContent>
      </Tabs>

      <FixModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        fixType={currentFixType}
        generatedContent={currentFix}
        impact={currentFixImpact}
      />

      <TableConversionModal
        open={tableModalOpen}
        onOpenChange={setTableModalOpen}
        analysis={analysis}
        pageId={pageId || "00000000-0000-0000-0000-000000000001"}
      />
    </div>
  );
}

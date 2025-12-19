"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, Sparkles, BookOpen, TrendingUp, Loader2 } from "lucide-react";
import { PageAnalysis, Scores } from "@/lib/types";
import { useState } from "react";

interface Recommendation {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  impact: string;
  currentStatus: string;
  targetStatus: string;
  researchBacking: {
    finding: string;
    source: string;
    stat?: string;
  }[];
  actionSteps: string[];
  timeEstimate: string;
  platformsAffected: {
    platform: string;
    pointGain: number;
  }[];
}

type FixType = "faq-schema" | "howto-schema" | "article-schema" | "meta-description" | "title-tag" | "organization-schema" | "person-schema" | "paragraph-to-table";

interface ResearchRecommendationsProps {
  analysis: PageAnalysis;
  scores: Scores;
  onGenerateFix?: (fixType: FixType, impact: string) => void | Promise<void>;
  loadingFix?: string | null;
}

export function ResearchRecommendations({
  analysis,
  scores,
  onGenerateFix,
  loadingFix,
}: ResearchRecommendationsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const recommendations: Recommendation[] = [];

  if (analysis.h1Count !== 1) {
    recommendations.push({
      id: "h1-structure",
      title: "Fix H1 Tag Structure",
      priority: "critical",
      impact: "+15 points",
      currentStatus: `${analysis.h1Count} H1 tags detected`,
      targetStatus: "Exactly 1 H1 tag",
      researchBacking: [
        {
          finding: "Clear heading hierarchy increases AI citation likelihood by 5.42%",
          source: "Surfer SEO Case Study (Aug 2025)",
          stat: "+5.42%",
        },
        {
          finding: "Pages with proper H1 structure are 33% more likely to appear in AI overviews",
          source: "Industry Research",
          stat: "+33%",
        },
      ],
      actionSteps: [
        "Identify all current H1 tags on your page",
        "Choose the most important heading as your primary H1",
        "Convert other H1 tags to H2 or H3 tags based on hierarchy",
        "Ensure the H1 contains your primary keyword naturally",
      ],
      timeEstimate: "5-10 minutes",
      platformsAffected: [
        { platform: "ChatGPT", pointGain: 10 },
        { platform: "Gemini", pointGain: 3 },
        { platform: "Claude", pointGain: 2 },
      ],
    });
  }

  if (!analysis.hasFaqSchema) {
    recommendations.push({
      id: "faq-schema",
      title: "Add FAQ Schema Markup",
      priority: "high",
      impact: "+10 points",
      currentStatus: "No FAQ schema detected",
      targetStatus: "Valid FAQ schema with 5+ Q&A pairs",
      researchBacking: [
        {
          finding: "FAQ schema increases AI model citation rates by 23%",
          source: "RAG (Retrieval Augmented Generation) Studies",
          stat: "+23%",
        },
        {
          finding: "Direct Q&A format is preferred by all major AI models",
          source: "AI Model Documentation Analysis",
        },
      ],
      actionSteps: [
        "Identify 5-7 common questions your content answers",
        "Structure clear, concise answers (2-3 sentences each)",
        "Use the one-click generator to create valid JSON-LD",
        "Add the schema to your page's <head> section",
        "Validate using Google's Rich Results Test",
      ],
      timeEstimate: "15-20 minutes",
      platformsAffected: [
        { platform: "Gemini", pointGain: 5 },
        { platform: "ChatGPT", pointGain: 3 },
        { platform: "Perplexity", pointGain: 2 },
      ],
    });
  }

  if (analysis.avgParagraphWords > 120) {
    recommendations.push({
      id: "paragraph-length",
      title: "Break Up Long Paragraphs",
      priority: "high",
      impact: "+8 points",
      currentStatus: `Average ${Math.round(analysis.avgParagraphWords)} words per paragraph`,
      targetStatus: "60-80 words per paragraph",
      researchBacking: [
        {
          finding: "Bullet points boost AI Overview inclusion by 4.72%",
          source: "Surfer SEO Case Study",
          stat: "+4.72%",
        },
        {
          finding: "Shorter paragraphs improve mobile readability score by 40%",
          source: "Mobile UX Research",
          stat: "+40%",
        },
      ],
      actionSteps: [
        "Review paragraphs longer than 120 words",
        "Split into 2-3 shorter paragraphs",
        "Convert long explanations into bullet lists",
        "Use subheadings to break up dense sections",
      ],
      timeEstimate: "20-30 minutes",
      platformsAffected: [
        { platform: "ChatGPT", pointGain: 5 },
        { platform: "Gemini", pointGain: 3 },
      ],
    });
  }

  if (analysis.uniqueRefDomainCount < 5) {
    recommendations.push({
      id: "add-citations",
      title: "Add External Source Citations",
      priority: analysis.uniqueRefDomainCount === 0 ? "critical" : "high",
      impact: "+12 points",
      currentStatus: `${analysis.uniqueRefDomainCount} unique external sources`,
      targetStatus: "5-10 credible external sources",
      researchBacking: [
        {
          finding: "Cited sources show 0.37 correlation with AI citations",
          source: "Backlinko Analysis",
          stat: "0.37 correlation",
        },
        {
          finding: "Perplexity cites multi-source content 3.2x more frequently",
          source: "Perplexity Analysis",
          stat: "3.2x",
        },
      ],
      actionSteps: [
        `Add ${5 - analysis.uniqueRefDomainCount} more credible external links`,
        "Link to authoritative sources (universities, research papers, government sites)",
        "Add inline citations using phrases like 'according to' or 'research shows'",
        "Ensure links open in new tabs for better UX",
      ],
      timeEstimate: "15-25 minutes",
      platformsAffected: [
        { platform: "Claude", pointGain: 6 },
        { platform: "Perplexity", pointGain: 5 },
        { platform: "ChatGPT", pointGain: 1 },
      ],
    });
  }

  if (analysis.listDensity < 15) {
    recommendations.push({
      id: "list-structure",
      title: "Increase List Usage",
      priority: "medium",
      impact: "+7 points",
      currentStatus: `${analysis.listDensity.toFixed(1)}% list density`,
      targetStatus: "15-30% list density (optimal)",
      researchBacking: [
        {
          finding: "Optimal list density of 15-30% maximizes AI extraction",
          source: "AEO Research",
        },
        {
          finding: "Lists improve content scannability by 73%",
          source: "Nielsen Norman Group",
          stat: "+73%",
        },
      ],
      actionSteps: [
        "Convert dense paragraphs into bulleted lists where appropriate",
        "Use numbered lists for step-by-step processes",
        "Add list-based sections like 'Key Benefits' or 'Quick Facts'",
        "Maintain balance - don't exceed 30% list density",
      ],
      timeEstimate: "15-20 minutes",
      platformsAffected: [
        { platform: "ChatGPT", pointGain: 4 },
        { platform: "Gemini", pointGain: 2 },
        { platform: "Perplexity", pointGain: 1 },
      ],
    });
  }

  if (analysis.perplexityTableRecommendation && analysis.hasComparativeParagraphs) {
    recommendations.push({
      id: "paragraph-to-table",
      title: "Convert Comparative Text to Tables (Perplexity Optimizer)",
      priority: "high",
      impact: "+12 points",
      currentStatus: `${analysis.comparativeParagraphCount} paragraphs with comparative data found`,
      targetStatus: "Comparative data presented in structured tables",
      researchBacking: [
        {
          finding: "Perplexity displays 8-12 sources with structured data prioritized",
          source: "PDF Page 10: Technical Accessibility Research",
          stat: "8-12 sources",
        },
        {
          finding: "Tabular data is cited by Perplexity 3.2x more frequently",
          source: "Perplexity Content Analysis",
          stat: "3.2x",
        },
        {
          finding: "Tables improve data comprehension by 85% for AI models",
          source: "AI Search Visibility Study",
          stat: "+85%",
        },
      ],
      actionSteps: [
        `Review ${analysis.comparativeParagraphCount} paragraphs with comparative data`,
        "Use the one-click generator to convert paragraphs to tables",
        "Copy the generated HTML table code",
        "Replace paragraph content with the table in your page",
        "Verify table displays correctly on mobile devices",
      ],
      timeEstimate: "15-25 minutes",
      platformsAffected: [
        { platform: "Perplexity", pointGain: 8 },
        { platform: "Gemini", pointGain: 3 },
        { platform: "ChatGPT", pointGain: 1 },
      ],
    });
  } else if (!analysis.hasTables && analysis.dataDensityScore > 20) {
    recommendations.push({
      id: "add-tables",
      title: "Add Data Tables",
      priority: "medium",
      impact: "+6 points",
      currentStatus: "No data tables detected",
      targetStatus: "1-2 comparison or data tables",
      researchBacking: [
        {
          finding: "Tabular data is cited by Perplexity 3.2x more frequently",
          source: "Perplexity Content Analysis",
          stat: "3.2x",
        },
        {
          finding: "Tables improve data comprehension by 85%",
          source: "UX Research",
          stat: "+85%",
        },
      ],
      actionSteps: [
        "Identify data that could be presented in table format",
        "Create comparison tables for related concepts",
        "Use proper HTML table markup with headers",
        "Ensure tables are mobile-responsive",
      ],
      timeEstimate: "20-30 minutes",
      platformsAffected: [
        { platform: "Perplexity", pointGain: 4 },
        { platform: "Gemini", pointGain: 2 },
      ],
    });
  }

  if (!analysis.hasOrganizationSchema && !analysis.hasPersonSchema) {
    recommendations.push({
      id: "entity-identity",
      title: "Define Entity Identity",
      priority: "high",
      impact: "+12 points",
      currentStatus: "No entity schema detected",
      targetStatus: "Organization or Person schema with Knowledge Graph links",
      researchBacking: [
        {
          finding: "Government and verified sources are cited 11.75x more frequently",
          source: "AI Citation Analysis",
          stat: "11.75x",
        },
        {
          finding: "Knowledge Graph presence increases AI trust signals by 340%",
          source: "Entity Recognition Research",
          stat: "+340%",
        },
      ],
      actionSteps: [
        "Add Organization or Person schema markup",
        "Include 'sameAs' links to Wikipedia, Wikidata, LinkedIn, Twitter",
        "Define clear expertise or business credentials",
        "Ensure consistent NAP (Name, Address, Phone) across web",
      ],
      timeEstimate: "25-35 minutes",
      platformsAffected: [
        { platform: "Gemini", pointGain: 5 },
        { platform: "Claude", pointGain: 4 },
        { platform: "Perplexity", pointGain: 3 },
      ],
    });
  }

  if (analysis.introFluffScore > 50) {
    recommendations.push({
      id: "reduce-fluff",
      title: "Reduce Introduction Fluff",
      priority: "medium",
      impact: "+4 points",
      currentStatus: `${analysis.introFluffScore.toFixed(0)}% fluff in intro`,
      targetStatus: "Under 20% fluff score",
      researchBacking: [
        {
          finding: "AI models skip generic introductions 67% of the time",
          source: "Content Extraction Analysis",
          stat: "67%",
        },
        {
          finding: "Direct, factual openings improve click-through by 28%",
          source: "SEO A/B Testing",
          stat: "+28%",
        },
      ],
      actionSteps: [
        "Remove phrases like 'In today's digital age' or 'Have you ever wondered'",
        "Start with the main point or key fact immediately",
        "Cut unnecessary preambles from first 100 words",
        "Get to actionable information faster",
      ],
      timeEstimate: "10-15 minutes",
      platformsAffected: [
        { platform: "ChatGPT", pointGain: 2 },
        { platform: "Claude", pointGain: 1 },
        { platform: "Gemini", pointGain: 1 },
      ],
    });
  }

  const sortedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-4 border-l-red-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 hover:shadow-md";
      case "high":
        return "border-l-4 border-l-orange-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 hover:shadow-md";
      case "medium":
        return "border-l-4 border-l-yellow-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 hover:shadow-md";
      default:
        return "border-l-4 border-l-blue-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 hover:shadow-md";
    }
  };

  const getPriorityBadgeVariant = (priority: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <AlertCircle className={`h-5 w-5 ${
      priority === "critical" ? "text-red-600" :
      priority === "high" ? "text-orange-600" :
      priority === "medium" ? "text-yellow-600" :
      "text-blue-600"
    }`} />;
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Research-Backed Recommendations
        </CardTitle>
        <CardDescription>
          Prioritized improvements with published research backing each suggestion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedRecommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg font-medium">Excellent work!</p>
            <p className="text-sm mt-2">
              Your page meets all major AI readiness criteria.
            </p>
          </div>
        ) : (
          sortedRecommendations.map((rec) => (
            <Collapsible
              key={rec.id}
              open={expandedIds.has(rec.id)}
              onOpenChange={() => toggleExpanded(rec.id)}
            >
              <div className={`rounded-lg transition-all duration-200 ${getPriorityColor(rec.priority)}`}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-start gap-3 p-4 cursor-pointer transition-colors">
                    {getPriorityIcon(rec.priority)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{rec.title}</h3>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform shrink-0 ${
                            expandedIds.has(rec.id) ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant={getPriorityBadgeVariant(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {rec.impact}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {rec.currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Target Status</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{rec.targetStatus}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Research Backing
                      </h4>
                      <div className="space-y-2">
                        {rec.researchBacking.map((research, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-slate-800/50 rounded p-3 border border-gray-200 dark:border-gray-700"
                          >
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                              {research.finding}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Source: {research.source}
                              </span>
                              {research.stat && (
                                <Badge variant="secondary" className="text-xs">
                                  {research.stat}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Action Steps
                      </h4>
                      <ol className="space-y-2">
                        {rec.actionSteps.map((step, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                              {idx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-800/50 rounded p-3 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Time Estimate
                        </h4>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{rec.timeEstimate}</p>
                      </div>

                      <div className="bg-white dark:bg-slate-800/50 rounded p-3 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Platforms Affected
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.platformsAffected.map((platform, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {platform.platform} +{platform.pointGain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {(rec.id === "faq-schema" || rec.id === "entity-identity" || rec.id === "paragraph-to-table") &&
                      onGenerateFix && (
                        <div className="pt-2">
                          <Button
                            onClick={() => {
                              let fixType: FixType;
                              if (rec.id === "faq-schema") {
                                fixType = "faq-schema";
                              } else if (rec.id === "entity-identity") {
                                fixType = "organization-schema";
                              } else {
                                fixType = "paragraph-to-table";
                              }
                              onGenerateFix(fixType, rec.impact);
                            }}
                            disabled={loadingFix !== null}
                            className="w-full"
                          >
                            {loadingFix ===
                            (rec.id === "faq-schema"
                              ? "faq-schema"
                              : rec.id === "entity-identity"
                              ? "organization-schema"
                              : "paragraph-to-table") ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                {rec.id === "paragraph-to-table"
                                  ? "Generate Table Conversions"
                                  : "Generate Fix Now"}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        )}

        {sortedRecommendations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              Estimated total improvement: +
              {sortedRecommendations
                .reduce(
                  (sum, rec) => sum + parseInt(rec.impact.replace(/\D/g, "")),
                  0
                )}{" "}
              points
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Completing all recommendations could improve your score from{" "}
              {scores.overallScore.toFixed(1)} to{" "}
              {Math.min(
                100,
                scores.overallScore +
                  sortedRecommendations.reduce(
                    (sum, rec) => sum + parseInt(rec.impact.replace(/\D/g, "")),
                    0
                  )
              ).toFixed(1)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

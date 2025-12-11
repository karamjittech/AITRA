"use client";

import { PlatformCard } from "./platform-card";
import { PlatformScores, PageAnalysis } from "@/lib/types";
import { Sparkles, MessageSquare, FileText, Search } from "lucide-react";

interface PlatformCardsSectionProps {
  platformScores: PlatformScores;
  analysis: PageAnalysis;
}

export function PlatformCardsSection({ platformScores, analysis }: PlatformCardsSectionProps) {
  const getComponentStatus = (score: number, maxScore: number): "good" | "needs-work" | "critical" => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return "good";
    if (percentage >= 50) return "needs-work";
    return "critical";
  };

  const geminiComponents = [
    {
      name: "Schema Markup",
      score: platformScores.geminiSchemaComponent,
      maxScore: 60,
      status: getComponentStatus(platformScores.geminiSchemaComponent, 60),
      recommendation: !analysis.hasFaqSchema && !analysis.hasHowtoSchema
        ? "Add FAQ or HowTo schema markup to improve Gemini visibility"
        : undefined,
    },
    {
      name: "Mobile Experience",
      score: platformScores.geminiMobileComponent,
      maxScore: 40,
      status: getComponentStatus(platformScores.geminiMobileComponent, 40),
      recommendation: analysis.avgParagraphWords > 80
        ? "Break paragraphs into smaller chunks (under 80 words)"
        : undefined,
    },
  ];

  const chatgptComponents = [
    {
      name: "Content Structure",
      score: platformScores.chatgptStructureComponent,
      maxScore: 50,
      status: getComponentStatus(platformScores.chatgptStructureComponent, 50),
      recommendation: analysis.h1Count !== 1
        ? "Ensure exactly one H1 tag for optimal structure"
        : (analysis.h2Count + analysis.h3Count) < 5
        ? "Add more subheadings (H2/H3) to improve structure"
        : undefined,
    },
    {
      name: "Clarity & Readability",
      score: platformScores.chatgptClarityComponent,
      maxScore: 50,
      status: getComponentStatus(platformScores.chatgptClarityComponent, 50),
      recommendation: analysis.readabilityScore < 60
        ? "Simplify language to improve readability score"
        : analysis.bulletRatio < 0.2
        ? "Add more bullet points and lists for scanability"
        : undefined,
    },
  ];

  const claudeComponents = [
    {
      name: "Citations & Sources",
      score: platformScores.claudeCitationComponent,
      maxScore: 60,
      status: getComponentStatus(platformScores.claudeCitationComponent, 60),
      recommendation: analysis.uniqueRefDomainCount < 5
        ? `Add ${5 - analysis.uniqueRefDomainCount} more external sources for credibility`
        : undefined,
    },
    {
      name: "Nuance & Depth",
      score: platformScores.claudeNuanceComponent,
      maxScore: 40,
      status: getComponentStatus(platformScores.claudeNuanceComponent, 40),
      recommendation: analysis.wordCount < 1500
        ? "Expand content depth to at least 1,500 words"
        : analysis.argumentDepthScore < 5
        ? "Add contrasting viewpoints and nuanced analysis"
        : undefined,
    },
  ];

  const perplexityComponents = [
    {
      name: "External Links",
      score: platformScores.perplexityExternalLinksComponent,
      maxScore: 55,
      status: getComponentStatus(platformScores.perplexityExternalLinksComponent, 55),
      recommendation: analysis.uniqueRefDomainCount < 4
        ? "Add diverse external sources from multiple domains"
        : undefined,
    },
    {
      name: "Data & Statistics",
      score: platformScores.perplexityDataComponent,
      maxScore: 45,
      status: getComponentStatus(platformScores.perplexityDataComponent, 45),
      recommendation: analysis.dataDensityScore < 30
        ? "Include more data points, statistics, and numbers"
        : undefined,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Platform-Specific Analysis</h2>
        <p className="text-muted-foreground">
          See how your content aligns with each AI model's preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlatformCard
          platformName="Google Gemini"
          platformIcon={<Sparkles className="h-5 w-5 text-blue-600" />}
          overallScore={platformScores.geminiScore}
          preferenceProfile="Structured-data focused, mobile-first optimization"
          components={geminiComponents}
        />

        <PlatformCard
          platformName="ChatGPT"
          platformIcon={<MessageSquare className="h-5 w-5 text-green-600" />}
          overallScore={platformScores.chatgptScore}
          preferenceProfile="Clarity-first, conversation-friendly formatting"
          components={chatgptComponents}
        />

        <PlatformCard
          platformName="Claude"
          platformIcon={<FileText className="h-5 w-5 text-orange-600" />}
          overallScore={platformScores.claudeScore}
          preferenceProfile="Citation-rich, nuanced and balanced arguments"
          components={claudeComponents}
        />

        <PlatformCard
          platformName="Perplexity"
          platformIcon={<Search className="h-5 w-5 text-purple-600" />}
          overallScore={platformScores.perplexityScore}
          preferenceProfile="Multi-source citations, data-driven content"
          components={perplexityComponents}
        />
      </div>
    </div>
  );
}

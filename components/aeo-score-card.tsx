"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Table2, List, HelpCircle, FileText, Sparkles } from "lucide-react";
import { PageAnalysis } from "@/lib/types";

interface AEOScoreCardProps {
  analysis: PageAnalysis;
}

export function AEOScoreCard({ analysis }: AEOScoreCardProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return "bg-green-600";
    if (percentage >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  const directAnswersScore = analysis.qaPairsCount >= 5 ? 8 : analysis.qaPairsCount >= 2 ? 5 : analysis.qaPairsCount >= 1 ? 3 : 0;

  const listScore = analysis.listDensity >= 15 && analysis.listDensity <= 30 ? 7
    : analysis.listDensity >= 5 && analysis.listDensity < 15 ? 4
    : analysis.listDensity > 0 && analysis.listDensity < 5 ? 1
    : 0;

  const tableScore = analysis.tableCount >= 2 ? 6 : analysis.tableCount === 1 ? 4 : 0;

  const introScore = analysis.introFluffScore <= 20 ? 4 : analysis.introFluffScore <= 50 ? 2 : 0;

  const totalAEOScore = analysis.aeoScore;
  const maxAEOScore = 25;
  const aeoPercentage = (totalAEOScore / maxAEOScore) * 100;

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle>Answer Engine Optimization (AEO)</CardTitle>
          </div>
          <Badge
            variant={aeoPercentage >= 75 ? "default" : aeoPercentage >= 50 ? "secondary" : "destructive"}
            className="text-base px-3 py-1 font-semibold"
          >
            {totalAEOScore}/{maxAEOScore}
          </Badge>
        </div>
        <CardDescription>
          How well your content is formatted for AI quick answers in RAG systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall AEO Score</span>
            <span className={`text-sm font-bold ${getScoreColor(totalAEOScore, maxAEOScore)}`}>
              {aeoPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={aeoPercentage} className="h-3" />
        </div>

        <div className="space-y-4">
          <div className="border-l-4 border-l-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 mt-0.5 text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Direct Q&A Format</span>
                  <span className={`font-bold ${getScoreColor(directAnswersScore, 8)}`}>
                    {directAnswersScore}/8
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {analysis.qaPairsCount} question-answer pairs detected
                </p>
                {directAnswersScore < 8 && (
                  <div className="bg-white border border-blue-200 rounded p-2 mt-2">
                    <p className="text-xs font-medium text-blue-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-gray-700">
                      {analysis.qaPairsCount === 0
                        ? "Add Q&A sections with question headings followed by answer paragraphs. Direct Q&A format increases AI citation likelihood by 23%."
                        : `Add ${5 - analysis.qaPairsCount} more Q&A pairs to reach optimal level. ChatGPT and Claude prefer direct question-answer structures.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-l-4 border-l-green-500 pl-4 py-2 bg-green-50 rounded-r">
            <div className="flex items-start gap-3">
              <List className="h-5 w-5 mt-0.5 text-green-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">List Usage</span>
                  <span className={`font-bold ${getScoreColor(listScore, 7)}`}>
                    {listScore}/7
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {analysis.listDensity.toFixed(1)}% list density ({analysis.ulCount} unordered, {analysis.olCount} ordered)
                </p>
                {listScore < 7 && (
                  <div className="bg-white border border-green-200 rounded p-2 mt-2">
                    <p className="text-xs font-medium text-green-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-gray-700">
                      {analysis.listDensity < 5
                        ? "Add more lists to structure your content. Bullet points boost AI Overview inclusion by 4.72%."
                        : analysis.listDensity > 30
                        ? "Your list density is too high. Balance lists with explanatory paragraphs for optimal AI extraction."
                        : "Increase list density to 15-30% range for optimal AI parsing. Lists help Claude and ChatGPT extract key information."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-l-4 border-l-purple-500 pl-4 py-2 bg-purple-50 rounded-r">
            <div className="flex items-start gap-3">
              <Table2 className="h-5 w-5 mt-0.5 text-purple-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Table Presence</span>
                  <span className={`font-bold ${getScoreColor(tableScore, 6)}`}>
                    {tableScore}/6
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {analysis.tableCount} data {analysis.tableCount === 1 ? 'table' : 'tables'} detected
                </p>
                {tableScore < 6 && (
                  <div className="bg-white border border-purple-200 rounded p-2 mt-2">
                    <p className="text-xs font-medium text-purple-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-gray-700">
                      {analysis.tableCount === 0
                        ? "Format data as tables. Perplexity cites tabular data 3.2x more frequently than paragraphs."
                        : "Add one more table to reach optimal level. Tables help AI models extract and present structured information."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-l-4 border-l-orange-500 pl-4 py-2 bg-orange-50 rounded-r">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 mt-0.5 text-orange-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Introduction Quality</span>
                  <span className={`font-bold ${getScoreColor(introScore, 4)}`}>
                    {introScore}/4
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  Fluff score: {analysis.introFluffScore.toFixed(0)}/100 (lower is better)
                  {analysis.hasTldr && <span className="ml-2 text-green-600 font-medium">TL;DR present</span>}
                </p>
                {introScore < 4 && (
                  <div className="bg-white border border-orange-200 rounded p-2 mt-2">
                    <p className="text-xs font-medium text-orange-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-gray-700">
                      {!analysis.hasTldr
                        ? "Add a TL;DR summary at the top with 3-5 key takeaways. ChatGPT prefers content that starts with key facts over generic introductions."
                        : analysis.introFluffScore > 50
                        ? "Reduce generic phrases like 'in today's world' or 'let's explore'. Start with concrete facts and information."
                        : "Continue improving intro quality. Remove filler phrases and lead with actionable information."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-blue-900 mb-1">Why AEO Matters</p>
              <p className="text-xs text-blue-800">
                Answer Engine Optimization formats your content for how RAG (Retrieval Augmented Generation) systems
                extract and present information. Higher AEO scores mean better visibility in AI-powered search results
                from ChatGPT, Claude, Gemini, and Perplexity.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

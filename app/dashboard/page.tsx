"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { URLInput } from "@/components/url-input";
import { LoadingState } from "@/components/loading-state";
import { ResultsDisplay } from "@/components/results-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AnalysisResult, AnalysisError } from "@/lib/types";
import { AlertCircle, BarChart3 } from "lucide-react";

type ViewState = "input" | "loading" | "results" | "error";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const hasAutoTriggered = useRef(false);

  const [viewState, setViewState] = useState<ViewState>("input");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [analyzedUrl, setAnalyzedUrl] = useState<string>("");

  const handleAnalyze = async (url: string) => {
    setViewState("loading");
    setError("");
    setAnalyzedUrl(url);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/analyze-page`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            url: url,
            userId: "00000000-0000-0000-0000-000000000001",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze page");
      }

      if (data.success) {
        setAnalysisResult(data as AnalysisResult);
        setViewState("results");
      } else {
        throw new Error("Analysis failed");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
      setViewState("error");
    }
  };

  const handleReset = () => {
    setViewState("input");
    setAnalysisResult(null);
    setError("");
    setAnalyzedUrl("");
  };

  useEffect(() => {
    const urlParam = searchParams.get("url");

    if (urlParam && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;

      try {
        const decodedUrl = decodeURIComponent(urlParam);
        const urlObj = new URL(decodedUrl);

        if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
          handleAnalyze(decodedUrl);
        }
      } catch (err) {
        console.error("Invalid URL parameter:", err);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {viewState === "input" && (
          <div className="space-y-12 max-w-6xl mx-auto">
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full">
                  <BarChart3 className="h-16 w-16 text-blue-600" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                See Which AI Models
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Read Your Content
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Get your AI visibility score in 60 seconds. See what ChatGPT, Claude, Gemini,
                and Perplexity want from your pages.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-800 font-medium">Free Analysis</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                  <span className="text-blue-800 font-medium">28+ Research-Backed Signals</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                  <span className="text-purple-800 font-medium">One-Click Fixes</span>
                </div>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
              <URLInput onAnalyze={handleAnalyze} isLoading={false} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <div className="text-center p-8 rounded-xl border bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  Platform Scores
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  See how your content ranks for each AI model
                </p>
                <p className="text-xs text-muted-foreground">
                  ChatGPT, Claude, Gemini, Perplexity
                </p>
              </div>
              <div className="text-center p-8 rounded-xl border bg-gradient-to-br from-white to-green-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-3">
                  Gap Analysis
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Compare against top competitors
                </p>
                <p className="text-xs text-muted-foreground">
                  See exactly what you need to improve
                </p>
              </div>
              <div className="text-center p-8 rounded-xl border bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3">
                  Auto Fixes
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Generate schema markup instantly
                </p>
                <p className="text-xs text-muted-foreground">
                  Copy-paste ready optimization code
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto mt-16 p-8 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border">
              <h2 className="text-2xl font-bold text-center mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Paste Your URL</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter any webpage you want to analyze
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Get Your Score</h3>
                    <p className="text-sm text-muted-foreground">
                      See your AI readiness score and platform-specific analysis
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-purple-600 text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Fix Issues</h3>
                    <p className="text-sm text-muted-foreground">
                      Use one-click generators to create optimization code
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewState === "loading" && <LoadingState />}

        {viewState === "results" && analysisResult && (
          <div className="space-y-6">
            <ResultsDisplay
              analysis={analysisResult.analysis}
              scores={analysisResult.scores}
              platformScores={analysisResult.platformScores}
              analyzedUrl={analyzedUrl}
              pageId={analysisResult.pageId}
            />
            <div className="flex justify-center">
              <Button onClick={handleReset} size="lg" variant="outline">
                Analyze Another Page
              </Button>
            </div>
          </div>
        )}

        {viewState === "error" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <strong>Analysis Failed:</strong> {error}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center gap-4">
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t mt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                AI SEO Analyzer
              </h3>
              <p className="text-sm text-muted-foreground">
                Research-backed analysis to help your content get cited by AI models.
                Free, fast, and actionable insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">What We Analyze</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Schema markup presence</li>
                <li>Content structure optimization</li>
                <li>AI model preferences</li>
                <li>Competitive positioning</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">AI Platforms Covered</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>ChatGPT (OpenAI)</li>
                <li>Claude (Anthropic)</li>
                <li>Gemini (Google)</li>
                <li>Perplexity</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              Built with research from Surfer SEO, Backlinko, and industry studies.
              All analysis is based on published findings.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

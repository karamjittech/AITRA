"use client";

import { useState } from "react";
import { URLInput } from "@/components/url-input";
import { LoadingState } from "@/components/loading-state";
import { ResultsDisplay } from "@/components/results-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AnalysisResult, AnalysisError } from "@/lib/types";
import { AlertCircle, BarChart3 } from "lucide-react";

type ViewState = "input" | "loading" | "results" | "error";

export default function Home() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {viewState === "input" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BarChart3 className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Research-Backed AI SEO
                <br />
                <span className="text-primary">Readiness in 60 Seconds</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See exactly what ChatGPT, Claude, Gemini, and Perplexity want from your content
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
              <URLInput onAnalyze={handleAnalyze} isLoading={false} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <div className="text-center p-6 rounded-lg border bg-card">
                <div className="text-3xl font-bold text-primary mb-2">28+</div>
                <p className="text-sm text-muted-foreground">
                  Research-backed signals analyzed
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border bg-card">
                <div className="text-3xl font-bold text-primary mb-2">4</div>
                <p className="text-sm text-muted-foreground">
                  AI platforms evaluated
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border bg-card">
                <div className="text-3xl font-bold text-primary mb-2">10s</div>
                <p className="text-sm text-muted-foreground">
                  Average analysis time
                </p>
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

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            AI SEO Readiness Tool - Analyze your content for optimal AI search visibility
          </p>
        </div>
      </footer>
    </div>
  );
}

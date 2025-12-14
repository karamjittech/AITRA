"use client";

import { PieChart, ThumbsUp, GitBranch, Table } from "lucide-react";

export function LandingFeatures() {
  return (
    <section className="py-20 px-4" id="features">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything You Need to Dominate AI Search
          </h2>
          <p className="text-xl text-muted-foreground">
            Track, analyze, and optimize your brand reputation across all major AI platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div className="lg:col-span-2 lg:row-span-2 rounded-2xl border bg-card relative overflow-hidden group hover:shadow-xl hover:[transform:rotateX(-1deg)] transition-all duration-300 min-h-[400px]">
            <div className="p-6">
              <div className="mb-4">
                <PieChart className="h-10 w-10 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Share of Voice</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track your brand mentions across ChatGPT, Perplexity, Claude, and Gemini. See exactly how often you are cited compared to competitors.
              </p>
            </div>
            <div className="relative h-64 overflow-hidden border-t bg-slate-900 min-h-[256px]">
              <img
                src="/shot-sov.png"
                alt="Share of Voice analytics with pie chart showing brand distribution"
                className="w-full h-full object-cover object-left-top rounded-lg border border-slate-200 dark:border-slate-800"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full bg-gradient-to-br from-violet-900/30 to-slate-900 border border-white/5 flex items-center justify-center rounded-lg"
                style={{ display: "none" }}
              >
                <div className="text-center space-y-2 p-4">
                  <div className="text-lg font-bold text-slate-300">
                    Share of Voice Chart
                  </div>
                  <p className="text-xs text-slate-500">
                    /public/shot-sov.png
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[280px] rounded-2xl border bg-card overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="p-4">
              <ThumbsUp className="h-8 w-8 text-emerald-600 mb-2" />
              <h3 className="text-lg font-bold mb-1">Sentiment Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Monitor positive, neutral, and negative mentions. Get alerts when sentiment shifts.
              </p>
            </div>
            <div className="relative h-32 overflow-hidden border-t bg-slate-900 min-h-[128px]">
              <img
                src="/shot-sentiment.png"
                alt="Citation list showing sentiment indicators"
                className="w-full h-full object-cover object-left-top rounded-lg border border-slate-200 dark:border-slate-800"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full bg-gradient-to-br from-emerald-900/30 via-slate-800/30 to-red-900/30 border border-white/5 flex items-center justify-center rounded-lg"
                style={{ display: "none" }}
              >
                <div className="text-center space-y-1 p-3">
                  <div className="text-sm font-bold text-slate-300">
                    Sentiment Tracking
                  </div>
                  <p className="text-xs text-slate-500">
                    /public/shot-sentiment.png
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[280px] rounded-2xl border bg-card overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="p-4">
              <GitBranch className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="text-lg font-bold mb-1">Fan-Out Technology</h3>
              <p className="text-xs text-muted-foreground">
                Discover related queries and topics where your brand should appear.
              </p>
            </div>
            <div className="relative h-32 overflow-hidden border-t bg-slate-900 min-h-[128px]">
              <img
                src="/shot-fanout.png"
                alt="Keyword expansion list showing related queries"
                className="w-full h-full object-cover object-left-top rounded-lg border border-slate-200 dark:border-slate-800"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full bg-gradient-to-br from-blue-900/30 via-slate-800/30 to-cyan-900/30 border border-white/5 flex items-center justify-center rounded-lg"
                style={{ display: "none" }}
              >
                <div className="text-center space-y-1 p-3">
                  <div className="text-sm font-bold text-slate-300">
                    Query Expansion
                  </div>
                  <p className="text-xs text-slate-500">
                    /public/shot-fanout.png
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden group hover:shadow-lg transition-shadow min-h-[300px]">
            <div className="p-6">
              <Table className="h-10 w-10 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">AEO Workbench</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Transform messy content into structured tables that AI models love to cite. Optimize for Answer Engine Optimization.
              </p>
            </div>
            <div className="relative h-40 overflow-hidden border-t bg-slate-900 min-h-[160px]">
              <img
                src="/shot-aeo.png"
                alt="AEO Workbench showing before and after text optimization"
                className="w-full h-full object-cover object-left-top rounded-lg border border-slate-200 dark:border-slate-800"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full bg-gradient-to-br from-amber-900/30 via-slate-800/30 to-orange-900/30 border border-white/5 flex items-center justify-center rounded-lg"
                style={{ display: "none" }}
              >
                <div className="text-center space-y-1 p-3">
                  <div className="text-sm font-bold text-slate-300">
                    Content Optimizer
                  </div>
                  <p className="text-xs text-slate-500">
                    /public/shot-aeo.png
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

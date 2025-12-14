"use client";

import { Link2, Scan, Lightbulb } from "lucide-react";

export function LandingHowItWorks() {
  return (
    <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            From URL to Intelligence in 30 Seconds
          </h2>
          <p className="text-xl text-muted-foreground">
            See how your brand performs in AI search with just a few clicks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="space-y-4">
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src="/shot-input.png"
                  alt="Enter your website URL"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="w-full h-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center rounded-lg"
                  style={{ display: "none" }}
                >
                  <div className="text-center space-y-2 p-4">
                    <Link2 className="h-12 w-12 mx-auto text-violet-600" />
                    <div className="text-sm font-bold text-muted-foreground">
                      Input Screenshot
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /public/shot-input.png
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Enter URL</h3>
              <p className="text-sm text-muted-foreground">
                Paste your website URL and let our AI analyze your content across all major platforms
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-pink-600" />
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src="/shot-analyze.png"
                  alt="AI analyzing your content"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="w-full h-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center rounded-lg"
                  style={{ display: "none" }}
                >
                  <div className="text-center space-y-2 p-4">
                    <Scan className="h-12 w-12 mx-auto text-fuchsia-600 animate-pulse" />
                    <div className="text-sm font-bold text-muted-foreground">
                      Analyze Screenshot
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /public/shot-analyze.png
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-600 font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">Deep AI Scan</h3>
              <p className="text-sm text-muted-foreground">
                Our system scans citations, sentiment, and visibility across ChatGPT, Claude, Perplexity, and Gemini
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-600 to-emerald-600" />
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src="/shot-recommendations.png"
                  alt="Actionable recommendations"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="w-full h-full bg-gradient-to-br from-pink-500/20 to-emerald-500/20 flex items-center justify-center rounded-lg"
                  style={{ display: "none" }}
                >
                  <div className="text-center space-y-2 p-4">
                    <Lightbulb className="h-12 w-12 mx-auto text-emerald-600" />
                    <div className="text-sm font-bold text-muted-foreground">
                      Results Screenshot
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /public/shot-recommendations.png
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Execute One-Click Fixes</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed insights and one-click fixes to boost your AI search visibility
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

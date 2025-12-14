"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";

export function LandingHero() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleScan = () => {
    if (url) {
      router.push(`/dashboard?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/10">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium">Trusted by forward-thinking SEOs</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Stop Guessing.
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Start Dominating AI Search.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            The first Reputation Engine for ChatGPT, Perplexity, and Claude. Track visibility, analyze sentiment, and fix your reputation in one click.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <Input
              type="url"
              placeholder="Enter your website URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="h-12 text-base"
            />
            <Button
              size="lg"
              onClick={handleScan}
              className="h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-transform duration-200 hover:scale-105"
            >
              Scan Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-sm">Track Citations</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span className="text-sm">Monitor Sentiment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <span className="text-sm">One-Click Fixes</span>
            </div>
          </div>
        </div>

        <div
          className="mt-20 max-w-5xl mx-auto [perspective:1000px] [transform-style:preserve-3d]"
          style={{ perspective: "1000px", perspectiveOrigin: "center center" }}
        >
          <div
            className="relative rounded-xl border border-white/10 bg-slate-900/50 p-3 shadow-2xl transition-all duration-700 hover:scale-[1.02] [transform-style:preserve-3d]"
            style={{
              transform: "perspective(1000px) rotateX(20deg) rotateY(-5deg) translateZ(30px)",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(50px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateX(20deg) rotateY(-5deg) translateZ(30px)";
            }}
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-violet-600/40 via-fuchsia-600/40 to-pink-600/40 blur-[100px] opacity-90 animate-pulse -z-10" />
            <div className="relative rounded-lg overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img
                src="/hero-dashboard.png"
                alt="Dashboard showing AI readiness scores, citations, and analytics"
                className="w-full h-auto"
                style={{ display: "block" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="h-[500px] rounded-lg bg-gradient-to-br from-violet-900/30 via-slate-800/40 to-slate-900 border-2 border-white/10 flex flex-col"
                style={{ display: "none" }}
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 rounded-t-lg border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4 px-4 py-1 bg-slate-900/50 rounded text-xs text-slate-400 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>yourapp.com/dashboard</span>
                  </div>
                </div>
                <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-6">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                    <div className="h-24 rounded-lg bg-violet-500/20 border border-violet-500/30 animate-pulse" />
                    <div className="h-24 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 animate-pulse delay-75" />
                    <div className="h-24 rounded-lg bg-pink-500/20 border border-pink-500/30 animate-pulse delay-150" />
                  </div>
                  <div className="w-full max-w-2xl h-32 rounded-lg bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-white/10" />
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-slate-300">
                      AI Reputation Dashboard
                    </div>
                    <p className="text-sm text-slate-500">
                      Upload /public/hero-dashboard.png to see your screenshot
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

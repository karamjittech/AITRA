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
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />

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
              className="h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
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

        <div className="mt-20 max-w-5xl mx-auto" style={{ perspective: "1000px" }}>
          <div
            className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-card p-3 shadow-2xl"
            style={{
              transform: "rotateX(2deg) rotateY(-2deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20 blur-3xl opacity-50" />
            <div className="relative rounded-lg overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-950">
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
                className="aspect-video rounded-lg bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 flex items-center justify-center"
                style={{ display: "none" }}
              >
                <div className="text-center space-y-4 p-8">
                  <div className="text-4xl font-bold text-muted-foreground">
                    Dashboard Screenshot Here
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Replace /public/hero-dashboard.png with your actual dashboard screenshot
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

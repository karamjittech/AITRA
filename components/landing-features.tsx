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
          <div className="lg:col-span-2 lg:row-span-2 p-8 rounded-2xl border bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
            <div className="relative z-10">
              <div className="mb-4">
                <PieChart className="h-12 w-12 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Share of Voice</h3>
              <p className="text-muted-foreground mb-6">
                Track your brand mentions across ChatGPT, Perplexity, Claude, and Gemini. See exactly how often you are cited compared to competitors.
              </p>
              <div className="mt-8 p-6 rounded-xl bg-background/50 backdrop-blur">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Your Brand</span>
                    <span className="text-2xl font-bold text-violet-600">38%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[38%] bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
            <ThumbsUp className="h-10 w-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Sentiment Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Monitor positive, neutral, and negative mentions. Get alerts when sentiment shifts.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                Positive
              </div>
              <div className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-medium">
                Negative
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
            <GitBranch className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Fan-Out Technology</h3>
            <p className="text-sm text-muted-foreground">
              Discover related queries and topics where your brand should appear.
            </p>
            <div className="mt-4 space-y-2">
              <div className="text-xs px-2 py-1 rounded bg-muted">Best AI tools →</div>
              <div className="text-xs px-2 py-1 rounded bg-muted ml-4">AI content detection →</div>
              <div className="text-xs px-2 py-1 rounded bg-muted ml-4">ChatGPT alternatives →</div>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
            <Table className="h-10 w-10 text-amber-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">AEO Workbench</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Transform messy content into structured tables that AI models love to cite. Optimize for Answer Engine Optimization.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-muted font-medium">Feature</div>
              <div className="p-2 rounded bg-muted font-medium">Before</div>
              <div className="p-2 rounded bg-muted font-medium">After</div>
              <div className="p-2 rounded bg-muted/50">Structure</div>
              <div className="p-2 rounded bg-red-100 dark:bg-red-950/30">Poor</div>
              <div className="p-2 rounded bg-emerald-100 dark:bg-emerald-950/30">Excellent</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

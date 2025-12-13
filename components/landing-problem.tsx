import { ArrowRight, XCircle, CheckCircle } from "lucide-react";

export function LandingProblem() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            The Shift Is Happening Now
          </h2>
          <p className="text-xl text-muted-foreground">
            60% of searches now end without a click. If you are not the answer, you are invisible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="relative p-8 rounded-xl border-2 border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <h3 className="text-2xl font-bold">Google Search</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="text-red-600">→</span>
                Declining click-through rates
              </p>
              <p className="flex items-center gap-2">
                <span className="text-red-600">→</span>
                Users leave without visiting
              </p>
              <p className="flex items-center gap-2">
                <span className="text-red-600">→</span>
                Just a link in a list
              </p>
            </div>
            <div className="mt-6 text-sm font-medium text-red-600">Status: Dying</div>
          </div>

          <div className="relative p-8 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <h3 className="text-2xl font-bold">AI Answer</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="text-emerald-600">→</span>
                Direct user engagement
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-600">→</span>
                Featured as the authority
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-600">→</span>
                You ARE the answer
              </p>
            </div>
            <div className="mt-6 text-sm font-medium text-emerald-600">Status: Growing</div>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium">
            <span>Be the Answer, Not Just a Link</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </section>
  );
}

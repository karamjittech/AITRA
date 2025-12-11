"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const loadingSteps = [
  "Fetching page content...",
  "Analyzing structure...",
  "Checking signals...",
  "Comparing platforms...",
  "Calculating recommendations...",
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary/20" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Analyzing Your Page</h3>
          <p className="text-muted-foreground animate-pulse">
            {loadingSteps[currentStep]}
          </p>
        </div>

        <div className="w-full max-w-xs">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            Estimated time: 10-15 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

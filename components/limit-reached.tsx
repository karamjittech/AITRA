"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface LimitReachedProps {
  limitType: "websites" | "keywords";
  currentCount: number;
  maxCount: number;
  upgradeRequired: "pro" | "agency";
}

const UPGRADE_INFO = {
  websites: {
    pro: { limit: 3, price: "$39" },
    agency: { limit: 15, price: "$119" },
  },
  keywords: {
    pro: { limit: 50, price: "$39" },
    agency: { limit: 250, price: "$119" },
  },
};

export function LimitReached({ limitType, currentCount, maxCount, upgradeRequired }: LimitReachedProps) {
  const router = useRouter();
  const percentage = (currentCount / maxCount) * 100;
  const upgradeInfo = UPGRADE_INFO[limitType][upgradeRequired];
  const limitLabel = limitType === "websites" ? "website" : "keyword";

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {limitLabel.charAt(0).toUpperCase() + limitLabel.slice(1)} limit reached
              </span>
              <span className="text-sm">
                {currentCount} / {maxCount}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                Upgrade to track up to {upgradeInfo.limit} {limitType} for {upgradeInfo.price}/month
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/pricing")}
              className="ml-4"
            >
              Upgrade Plan
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

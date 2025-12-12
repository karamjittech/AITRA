"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Coins, AlertTriangle, ArrowRight } from "lucide-react";

interface CreditGateProps {
  children: ReactNode;
  cost: number;
  action: string;
  onCreditsLow?: () => void;
}

export function CreditGate({ children, cost, action, onCreditsLow }: CreditGateProps) {
  const { subscription, isLoading } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded h-4 w-48" />
        {children}
      </div>
    );
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please log in to use this feature.
          <Button variant="link" onClick={() => router.push("/login")} className="ml-2 p-0 h-auto">
            Sign In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const creditsRemaining = subscription.credits_remaining;
  const creditsPercentage = (creditsRemaining / subscription.credits_total) * 100;
  const isLow = creditsPercentage < 20;
  const isInsufficient = creditsRemaining < cost;

  if (isInsufficient) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {action} requires {cost} credits. You have {creditsRemaining} remaining.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/pricing")}
                className="ml-4"
              >
                Get More Credits
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <div className="opacity-50 pointer-events-none">{children}</div>
      </div>
    );
  }

  if (isLow && onCreditsLow) {
    onCreditsLow();
  }

  return (
    <div className="space-y-2">
      {isLow && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center justify-between">
              <span>
                Running low on credits: {creditsRemaining} / {subscription.credits_total} remaining
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/pricing")}
                className="ml-4"
              >
                Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
}

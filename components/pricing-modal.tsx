"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, X } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightTier?: "pro" | "agency";
}

const TIER_COMPARISON = {
  free: {
    name: "Free",
    price: "$0",
    websites: 1,
    keywords: 3,
    credits: 50,
  },
  pro: {
    name: "Pro",
    price: "$39",
    websites: 3,
    keywords: 50,
    credits: 500,
  },
  agency: {
    name: "Agency",
    price: "$119",
    websites: 15,
    keywords: 250,
    credits: 2500,
  },
};

export function PricingModal({ open, onOpenChange, highlightTier = "pro" }: PricingModalProps) {
  const { subscription } = useSubscription();
  const router = useRouter();

  const currentTier = subscription?.tier || "free";
  const targetTier = TIER_COMPARISON[highlightTier];
  const currentTierInfo = TIER_COMPARISON[currentTier];

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Unlock more features and increase your limits
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="border rounded-lg p-6 bg-slate-50 dark:bg-slate-900">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current Plan</div>
            <div className="text-2xl font-bold mb-4">{currentTierInfo.name}</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Websites</span>
                <span className="font-medium">{currentTierInfo.websites}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Keywords</span>
                <span className="font-medium">{currentTierInfo.keywords}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">AI Credits</span>
                <span className="font-medium">{currentTierInfo.credits}/mo</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Upgrade To</div>
            <div className="text-2xl font-bold mb-1">{targetTier.name}</div>
            <div className="text-3xl font-bold mb-4">
              {targetTier.price}
              <span className="text-base font-normal text-slate-600 dark:text-slate-400">/month</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Websites</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {targetTier.websites}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Keywords</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {targetTier.keywords}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">AI Credits</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {targetTier.credits}/mo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="font-medium">You'll unlock:</div>
          {highlightTier === "pro" && (
            <>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Sentiment analysis for all citations</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Fan-out query discovery</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Schema markup generator</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">AEO workbench tools</span>
              </div>
            </>
          )}
          {highlightTier === "agency" && (
            <>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Share of Voice competitive tracking</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Competitor spy features</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">White label reports (coming soon)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button className="flex-1" onClick={handleUpgrade}>
            Upgrade Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-slate-500">
          Cancel anytime. No long-term contracts.
        </p>
      </DialogContent>
    </Dialog>
  );
}

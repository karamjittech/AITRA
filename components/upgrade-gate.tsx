"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, ArrowRight, Zap, Crown } from "lucide-react";

interface UpgradeGateProps {
  children: ReactNode;
  feature: "sentiment" | "sov" | "fan_out" | "schema";
  requiredTier: "pro" | "agency";
  blur?: boolean;
}

const FEATURE_INFO = {
  sentiment: {
    name: "Sentiment Analysis",
    description: "See how AI models talk about your brand - positive, negative, or neutral",
    icon: Zap,
  },
  sov: {
    name: "Share of Voice",
    description: "Track your competitive positioning across all AI platforms",
    icon: Crown,
  },
  fan_out: {
    name: "Fan-Out Analysis",
    description: "Discover hidden sub-queries and content opportunities",
    icon: Zap,
  },
  schema: {
    name: "Schema Generator",
    description: "Auto-generate perfect schema markup for AI visibility",
    icon: Zap,
  },
};

const TIER_INFO = {
  pro: {
    name: "Pro",
    price: "$39",
    color: "bg-blue-600",
  },
  agency: {
    name: "Agency",
    price: "$119",
    color: "bg-purple-600",
  },
};

export function UpgradeGate({ children, feature, requiredTier, blur = true }: UpgradeGateProps) {
  const { subscription, isLoading } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="relative">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg h-64" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card className="relative p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Sign in to continue</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Please log in to access this feature
        </p>
        <Button onClick={() => router.push("/login")}>
          Sign In
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    );
  }

  const tierHierarchy = { free: 0, pro: 1, agency: 2 };
  const userTierLevel = tierHierarchy[subscription.tier];
  const requiredTierLevel = tierHierarchy[requiredTier];

  if (userTierLevel >= requiredTierLevel) {
    return <>{children}</>;
  }

  const featureInfo = FEATURE_INFO[feature];
  const tierInfo = TIER_INFO[requiredTier];
  const Icon = featureInfo.icon;

  return (
    <div className="relative">
      {blur && (
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none">{children}</div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-slate-900/50 dark:to-slate-900" />
        </div>
      )}

      <Card className={`${blur ? "absolute inset-0 m-auto" : ""} max-w-md p-8 text-center shadow-xl`}>
        <div className="mb-4 flex justify-center">
          <div className={`rounded-full ${tierInfo.color} p-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2">{featureInfo.name}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{featureInfo.description}</p>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold">{tierInfo.price}</span>
            <span className="text-slate-600 dark:text-slate-400">/month</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Available on {tierInfo.name} plan
          </p>
        </div>

        <Button
          size="lg"
          className={`w-full ${tierInfo.color} hover:opacity-90`}
          onClick={() => router.push("/pricing")}
        >
          Upgrade to {tierInfo.name}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-xs text-slate-500 mt-4">
          Cancel anytime. No long-term contracts.
        </p>
      </Card>
    </div>
  );
}

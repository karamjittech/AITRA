import { useSubscription } from "./use-subscription";
import { supabase } from "@/utils/supabase/client";

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: "pro" | "agency";
}

export function useLimitCheck() {
  const { subscription, counts, canAddWebsite, canAddKeyword, hasCredits } = useSubscription();

  const checkWebsiteLimit = (): LimitCheckResult => {
    if (!subscription) {
      return { allowed: false, reason: "Please log in to continue" };
    }

    if (canAddWebsite) {
      return { allowed: true };
    }

    const tier = subscription.tier;
    if (tier === "free") {
      return {
        allowed: false,
        reason: `Free plan allows 1 website. You have ${counts.websites_count}.`,
        upgradeRequired: "pro",
      };
    } else if (tier === "pro") {
      return {
        allowed: false,
        reason: `Pro plan allows 3 websites. You have ${counts.websites_count}.`,
        upgradeRequired: "agency",
      };
    } else {
      return {
        allowed: false,
        reason: `Agency plan allows 15 websites. You have ${counts.websites_count}.`,
      };
    }
  };

  const checkKeywordLimit = (): LimitCheckResult => {
    if (!subscription) {
      return { allowed: false, reason: "Please log in to continue" };
    }

    if (canAddKeyword) {
      return { allowed: true };
    }

    const tier = subscription.tier;
    if (tier === "free") {
      return {
        allowed: false,
        reason: `Free plan allows 3 keywords. You have ${counts.keywords_count}.`,
        upgradeRequired: "pro",
      };
    } else if (tier === "pro") {
      return {
        allowed: false,
        reason: `Pro plan allows 50 keywords. You have ${counts.keywords_count}.`,
        upgradeRequired: "agency",
      };
    } else {
      return {
        allowed: false,
        reason: `Agency plan allows 250 keywords. You have ${counts.keywords_count}.`,
      };
    }
  };

  const checkCreditLimit = (cost: number): LimitCheckResult => {
    if (!subscription) {
      return { allowed: false, reason: "Please log in to continue" };
    }

    if (subscription.credits_remaining >= cost) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `This action requires ${cost} credits. You have ${subscription.credits_remaining} remaining.`,
      upgradeRequired: subscription.tier === "free" ? "pro" : "agency",
    };
  };

  const checkFeatureAccess = (feature: "sentiment" | "sov" | "fan_out" | "schema"): LimitCheckResult => {
    if (!subscription) {
      return { allowed: false, reason: "Please log in to continue" };
    }

    const tier = subscription.tier;

    switch (feature) {
      case "sentiment":
      case "fan_out":
      case "schema":
        if (tier === "free") {
          return {
            allowed: false,
            reason: `${feature} analysis is available on Pro and Agency plans.`,
            upgradeRequired: "pro",
          };
        }
        return { allowed: true };

      case "sov":
        if (tier !== "agency") {
          return {
            allowed: false,
            reason: "Share of Voice analysis is only available on Agency plan.",
            upgradeRequired: "agency",
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  };

  return {
    checkWebsiteLimit,
    checkKeywordLimit,
    checkCreditLimit,
    checkFeatureAccess,
  };
}

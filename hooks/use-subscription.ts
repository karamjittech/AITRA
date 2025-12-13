import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export interface UserSubscription {
  id: string;
  email: string;
  tier: "free" | "pro" | "agency";
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  websites_limit: number;
  keywords_limit: number;
  subscription_status: string;
  billing_cycle_start: string | null;
  billing_cycle_end: string | null;
  paddle_customer_id: string | null;
  paddle_subscription_id: string | null;
  payment_method: string;
  next_bill_date: string | null;
  is_lifetime_deal: boolean;
}

export interface SubscriptionCounts {
  websites_count: number;
  keywords_count: number;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [counts, setCounts] = useState<SubscriptionCounts>({ websites_count: 0, keywords_count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      const userDataAny = userData as any;
      const tier = userDataAny.subscription_plan as "free" | "pro" | "agency";
      const creditsRemaining = (userDataAny.credits_total || 0) - (userDataAny.credits_used || 0);

      setSubscription({
        id: userDataAny.id,
        email: userDataAny.email,
        tier,
        credits_total: userDataAny.credits_total || 0,
        credits_used: userDataAny.credits_used || 0,
        credits_remaining: creditsRemaining,
        websites_limit: userDataAny.websites_limit || 1,
        keywords_limit: userDataAny.keywords_limit || 3,
        subscription_status: userDataAny.subscription_status || "active",
        billing_cycle_start: userDataAny.billing_cycle_start,
        billing_cycle_end: userDataAny.billing_cycle_end,
        paddle_customer_id: userDataAny.paddle_customer_id,
        paddle_subscription_id: userDataAny.paddle_subscription_id,
        payment_method: userDataAny.payment_method || 'free',
        next_bill_date: userDataAny.next_bill_date,
        is_lifetime_deal: userDataAny.is_lifetime_deal || false,
      });

      const { count: websitesCount } = await supabase
        .from("websites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: keywordsCount } = await supabase
        .from("tracked_keywords")
        .select("keyword_id:id", { count: "exact", head: true })
        .in(
          "website_id",
          (await supabase.from("websites").select("id").eq("user_id", user.id)).data?.map((w: any) => w.id) || []
        );

      setCounts({
        websites_count: websitesCount || 0,
        keywords_count: keywordsCount || 0,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const canAddWebsite = subscription ? counts.websites_count < subscription.websites_limit : false;
  const canAddKeyword = subscription ? counts.keywords_count < subscription.keywords_limit : false;
  const canUseSentiment = subscription ? ["pro", "agency"].includes(subscription.tier) : false;
  const canUseSOV = subscription ? subscription.tier === "agency" : false;
  const canUseFanOut = subscription ? ["pro", "agency"].includes(subscription.tier) : false;
  const hasCredits = subscription ? subscription.credits_remaining > 0 : false;

  const refresh = () => {
    fetchSubscription();
  };

  return {
    subscription,
    counts,
    isLoading,
    error,
    canAddWebsite,
    canAddKeyword,
    canUseSentiment,
    canUseSOV,
    canUseFanOut,
    hasCredits,
    refresh,
  };
}

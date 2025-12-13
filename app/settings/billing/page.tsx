"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/use-subscription";
import { usePaddle } from "@/hooks/use-paddle";
import { PADDLE_CONFIG, PLAN_LIMITS } from "@/lib/paddle-config";
import { toast } from "sonner";
import { CreditCard, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/utils/supabase/client";

export default function BillingPage() {
  const { subscription, isLoading } = useSubscription();
  const { openCheckout, openManageSubscription, isReady: paddleReady } = usePaddle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your subscription is now active.');
      router.replace('/settings/billing');
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!subscription || !user) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
            <CardDescription>You need to log in to view billing information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpgrade = async (tier: 'pro' | 'agency') => {
    if (!paddleReady) {
      toast.error('Payment system is loading...');
      return;
    }

    try {
      setIsUpgrading(true);
      const priceId = tier === 'pro' ? PADDLE_CONFIG.priceIds.pro : PADDLE_CONFIG.priceIds.agency;

      await openCheckout({
        priceId,
        userId: subscription.id,
        userEmail: subscription.email,
        tier,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  const subscriptionData = subscription as any;
  const isLTD = subscriptionData?.is_lifetime_deal || false;
  const isPaddleUser = subscription.subscription_status === 'active' &&
    ['pro', 'agency'].includes(subscription.tier) &&
    !isLTD;

  if (subscription.tier === 'free' && !isLTD) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-slate-600">Upgrade to unlock more features</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan: Free</CardTitle>
            <CardDescription>You are on the free tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Websites</span>
                <span className="font-medium">{subscription.websites_limit}</span>
              </div>
              <div className="flex justify-between">
                <span>Keywords</span>
                <span className="font-medium">{subscription.keywords_limit}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Credits</span>
                <span className="font-medium">{subscription.credits_total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle>Pro Plan</CardTitle>
              <div className="text-3xl font-bold">
                $39<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  3 Websites
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  50 Tracked Keywords
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  500 AI Credits/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Sentiment Analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Fan-out Query Discovery
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleUpgrade('pro')}
                disabled={isUpgrading || !paddleReady}
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agency Plan</CardTitle>
              <div className="text-3xl font-bold">
                $119<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  15 Websites
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  250 Tracked Keywords
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  2,500 AI Credits/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Share of Voice Tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  All Pro Features
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleUpgrade('agency')}
                disabled={isUpgrading || !paddleReady}
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Agency'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLTD) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-slate-600">Your subscription details</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lifetime Deal (AppSumo)</CardTitle>
              <Badge variant="default">Active</Badge>
            </div>
            <CardDescription>You have lifetime access to this tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Tier</div>
                <div className="text-lg font-semibold uppercase">{subscription.tier}</div>
              </div>
              <div>
                <div className="text-slate-600">Websites</div>
                <div className="text-lg font-semibold">{subscription.websites_limit}</div>
              </div>
              <div>
                <div className="text-slate-600">Keywords</div>
                <div className="text-lg font-semibold">{subscription.keywords_limit}</div>
              </div>
              <div>
                <div className="text-slate-600">Monthly Credits</div>
                <div className="text-lg font-semibold">{subscription.credits_total}</div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600">
                Your lifetime deal gives you permanent access to all features in your tier.
                No recurring payments required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPaddleUser) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-slate-600">Manage your subscription</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan: {subscription.tier.toUpperCase()}</CardTitle>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Websites</div>
                <div className="text-lg font-semibold">{subscription.websites_limit}</div>
              </div>
              <div>
                <div className="text-slate-600">Keywords</div>
                <div className="text-lg font-semibold">{subscription.keywords_limit}</div>
              </div>
              <div>
                <div className="text-slate-600">Monthly Credits</div>
                <div className="text-lg font-semibold">{subscription.credits_total}</div>
              </div>
              <div>
                <div className="text-slate-600">Credits Remaining</div>
                <div className="text-lg font-semibold">{subscription.credits_remaining}</div>
              </div>
            </div>

            {subscriptionData.next_bill_date && (
              <div className="flex items-center gap-2 text-sm text-slate-600 pt-4 border-t">
                <Calendar className="h-4 w-4" />
                Next billing date: {format(new Date(subscriptionData.next_bill_date), 'MMM dd, yyyy')}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={openManageSubscription}
              disabled={!paddleReady}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

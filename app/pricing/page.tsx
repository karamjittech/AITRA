"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Star, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

export const dynamic = 'force-dynamic';

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out AI SEO optimization",
    icon: Zap,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    features: [
      "1 Website",
      "3 Tracked Keywords",
      "50 AI Credits/month",
      "Basic visibility check",
      "Platform-specific scoring",
    ],
    limitations: [
      "No sentiment analysis",
      "No share of voice tracking",
      "No fan-out analysis",
      "No competitor tracking",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 39,
    period: "month",
    description: "For content creators and solopreneurs",
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    popular: true,
    features: [
      "3 Websites",
      "50 Tracked Keywords",
      "500 AI Credits/month",
      "Sentiment analysis",
      "Schema generator",
      "Fan-out analysis",
      "AEO workbench",
      "Platform-specific optimization",
      "Citation tracking",
      "Competitive gap analysis",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 119,
    period: "month",
    description: "For agencies and growing businesses",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    features: [
      "15 Websites",
      "250 Tracked Keywords",
      "2,500 AI Credits/month",
      "Everything in Pro, plus:",
      "Share of Voice tracking",
      "Competitor spy",
      "White label reports (coming soon)",
      "Priority support",
      "Advanced analytics",
      "Bulk operations",
    ],
  },
];

export default function PricingPage() {
  const { subscription } = useSubscription();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSelectPlan = (planId: string) => {
    if (!subscription) {
      router.push("/signup");
      return;
    }

    if (planId === subscription.tier) {
      router.push("/");
      return;
    }

    console.log("Upgrade to:", planId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Reputation Intelligence Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Cancel anytime, no long-term contracts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription?.tier === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-2 border-blue-500 shadow-xl" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1 inline" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${plan.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-slate-600 dark:text-slate-400">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="border-t pt-4 space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2 opacity-50">
                          <span className="text-sm">✗ {limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? (
                      "Current Plan"
                    ) : plan.id === "free" ? (
                      "Get Started"
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What are AI Credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  AI Credits power advanced features like sentiment analysis, fan-out queries, and share of voice tracking. Different actions consume different amounts of credits. Your credits reset monthly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes! You can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, your new rate starts at the next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I run out of credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  You can still access your data and basic features. Advanced AI-powered features will be temporarily unavailable until your credits reset or you upgrade to a higher plan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied within the first 14 days, contact support for a full refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Need a custom plan for your enterprise?
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}

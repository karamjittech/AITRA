import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from "lucide-react";

export function LandingPricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for testing the waters",
      features: [
        "1 website",
        "3 keywords tracked",
        "10 credits/month",
        "Basic analytics",
        "Share of Voice tracking",
      ],
      cta: "Get Started",
      href: "/dashboard",
      popular: false,
    },
    {
      name: "Pro",
      price: "$39",
      description: "For serious SEO professionals",
      features: [
        "10 websites",
        "50 keywords tracked",
        "500 credits/month",
        "Advanced analytics",
        "Sentiment tracking",
        "Priority support",
        "Export reports",
      ],
      cta: "Start Pro Trial",
      href: "/pricing",
      popular: true,
      icon: Zap,
    },
    {
      name: "Agency",
      price: "$119",
      description: "For agencies managing multiple clients",
      features: [
        "Unlimited websites",
        "Unlimited keywords",
        "2000 credits/month",
        "White-label reports",
        "API access",
        "Dedicated support",
        "Custom integrations",
      ],
      cta: "Start Agency Plan",
      href: "/pricing",
      popular: false,
      icon: Crown,
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30" id="pricing">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isAgency = tier.name === "Agency";
            return (
              <div
                key={tier.name}
                className={`relative p-8 rounded-2xl border-2 bg-card transition-all duration-300 ${
                  tier.popular
                    ? "border-violet-600 shadow-2xl scale-105"
                    : isAgency
                    ? "border-amber-500/50 shadow-2xl shadow-amber-500/30"
                    : "border-border hover:shadow-md"
                }`}
              >
                {isAgency && (
                  <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-2xl -z-10 opacity-70 animate-pulse rounded-2xl" />
                )}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium">
                      Best Value
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  {Icon && (
                    <div className={`inline-flex ${isAgency ? "p-4" : "p-3"} rounded-xl mb-4 ${
                      isAgency
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-2 ring-amber-500/30"
                        : "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
                    }`}>
                      <Icon className={`${isAgency ? "h-10 w-10" : "h-8 w-8"} ${
                        isAgency ? "text-amber-500" : "text-violet-600"
                      }`} />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {tier.price}
                    <span className="text-lg text-muted-foreground font-normal">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full transition-transform duration-200 hover:scale-105 ${
                    tier.popular
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                      : isAgency
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      : ""
                  }`}
                  variant={tier.popular || isAgency ? "default" : "outline"}
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

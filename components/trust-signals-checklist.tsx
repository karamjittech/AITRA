"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrustSignal {
  id: string;
  category: string;
  signal: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  impact: string;
  howToImplement: string;
  checked: boolean;
}

interface TrustSignalsChecklistProps {
  brandIdentityId?: string;
  recommendations?: any[];
  missingSignals?: string[];
}

const DEFAULT_TRUST_SIGNALS: TrustSignal[] = [
  {
    id: "author-bio",
    category: "Authorship",
    signal: "Clear Author Bio",
    description: "Named individuals with credentials listed on About page",
    priority: "critical",
    impact: "+12 points to E-E-A-T",
    howToImplement: "Add team member profiles with photos, titles, and LinkedIn links",
    checked: false,
  },
  {
    id: "credentials",
    category: "Expertise",
    signal: "Professional Credentials",
    description: "Degrees, certifications, years of experience documented",
    priority: "critical",
    impact: "+15 points to E-E-A-T",
    howToImplement: "List education, certifications, and professional experience for key team members",
    checked: false,
  },
  {
    id: "same-as-links",
    category: "Authority",
    signal: "Authority Links (sameAs)",
    description: "Links to Wikipedia, LinkedIn, Crunchbase, etc.",
    priority: "critical",
    impact: "+45% AI citations",
    howToImplement: "Add sameAs links in Brand Identity tab connecting to external profiles",
    checked: false,
  },
  {
    id: "physical-address",
    category: "Contact",
    signal: "Physical Address",
    description: "Complete street address, city, state, zip code",
    priority: "high",
    impact: "+8 points to E-E-A-T",
    howToImplement: "Add full business address to Brand Identity form",
    checked: false,
  },
  {
    id: "phone-email",
    category: "Contact",
    signal: "Phone & Email",
    description: "Working phone number and professional email address",
    priority: "high",
    impact: "+7 points to E-E-A-T",
    howToImplement: "Add contact information to Brand Identity form",
    checked: false,
  },
  {
    id: "awards-recognition",
    category: "Authority",
    signal: "Industry Recognition",
    description: "Awards, certifications, media mentions, partnerships",
    priority: "high",
    impact: "+10 points to E-E-A-T",
    howToImplement: "Document awards and recognition on About page with links to sources",
    checked: false,
  },
  {
    id: "privacy-policy",
    category: "Transparency",
    signal: "Privacy Policy",
    description: "Clear privacy policy accessible from footer",
    priority: "medium",
    impact: "+5 points to E-E-A-T",
    howToImplement: "Create and publish privacy policy, link from website footer",
    checked: false,
  },
  {
    id: "terms-service",
    category: "Transparency",
    signal: "Terms of Service",
    description: "Terms of service or use policy documented",
    priority: "medium",
    impact: "+5 points to E-E-A-T",
    howToImplement: "Create terms of service page and link from footer",
    checked: false,
  },
  {
    id: "client-testimonials",
    category: "Social Proof",
    signal: "Client Testimonials",
    description: "Real client testimonials with names/companies",
    priority: "medium",
    impact: "+8 points to E-E-A-T",
    howToImplement: "Add testimonials section with verified client feedback",
    checked: false,
  },
  {
    id: "case-studies",
    category: "Social Proof",
    signal: "Case Studies",
    description: "Detailed case studies showing real results",
    priority: "medium",
    impact: "+7 points to E-E-A-T",
    howToImplement: "Create case study pages documenting client success stories",
    checked: false,
  },
  {
    id: "social-media",
    category: "Authority",
    signal: "Active Social Presence",
    description: "Active profiles on LinkedIn, Twitter, etc.",
    priority: "low",
    impact: "+3 points to E-E-A-T",
    howToImplement: "Maintain active social media profiles and link from website",
    checked: false,
  },
  {
    id: "about-page-quality",
    category: "Transparency",
    signal: "Comprehensive About Page",
    description: "Detailed About page with mission, values, team",
    priority: "low",
    impact: "+5 points to E-E-A-T",
    howToImplement: "Expand About page with company story, mission, and values",
    checked: false,
  },
];

export function TrustSignalsChecklist({
  brandIdentityId,
  recommendations,
  missingSignals,
}: TrustSignalsChecklistProps) {
  const [signals, setSignals] = useState<TrustSignal[]>(DEFAULT_TRUST_SIGNALS);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (brandIdentityId) {
      loadCheckedState();
    }
  }, [brandIdentityId]);

  const loadCheckedState = async () => {
    if (!brandIdentityId) return;

    try {
      const { data, error } = await supabase
        .from("brand_identity")
        .select("trust_signals_checklist")
        .eq("id", brandIdentityId)
        .maybeSingle();

      if (error) throw error;

      if (data && (data as any).trust_signals_checklist) {
        const checkedState = (data as any).trust_signals_checklist as Record<string, boolean>;
        setSignals((prev) =>
          prev.map((signal) => ({
            ...signal,
            checked: checkedState[signal.id] || false,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading checklist state:", error);
    }
  };

  const handleToggle = async (signalId: string) => {
    const updatedSignals = signals.map((s) =>
      s.id === signalId ? { ...s, checked: !s.checked } : s
    );
    setSignals(updatedSignals);

    if (brandIdentityId) {
      const checkedState = updatedSignals.reduce((acc, signal) => {
        acc[signal.id] = signal.checked;
        return acc;
      }, {} as Record<string, boolean>);

      try {
        // @ts-expect-error - brand_identity table type not yet generated
        const { error } = await supabase.from("brand_identity").update({ trust_signals_checklist: checkedState }).eq("id", brandIdentityId);

        if (error) throw error;
      } catch (error) {
        console.error("Error saving checklist state:", error);
        toast({
          title: "Error",
          description: "Failed to save checklist state",
          variant: "destructive",
        });
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "critical" || priority === "high") {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <TrendingUp className="h-4 w-4" />;
  };

  const filteredSignals = signals.filter(
    (signal) => filterPriority === "all" || signal.priority === filterPriority
  );

  const completedCount = signals.filter((s) => s.checked).length;
  const totalCount = signals.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  const priorityCounts = {
    critical: signals.filter((s) => s.priority === "critical" && !s.checked).length,
    high: signals.filter((s) => s.priority === "high" && !s.checked).length,
    medium: signals.filter((s) => s.priority === "medium" && !s.checked).length,
    low: signals.filter((s) => s.priority === "low" && !s.checked).length,
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Trust Signals Completion</p>
                <p className="text-2xl font-bold text-blue-900">
                  {completedCount} / {totalCount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-900">
                  {Math.round(completionPercentage)}%
                </p>
                <p className="text-sm text-blue-700">Complete</p>
              </div>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trust Signals Checklist</CardTitle>
          <CardDescription>
            Track your progress implementing E-E-A-T signals that AI models evaluate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterPriority === "all" ? "default" : "outline"}
              onClick={() => setFilterPriority("all")}
            >
              All ({totalCount - completedCount})
            </Button>
            <Button
              size="sm"
              variant={filterPriority === "critical" ? "default" : "outline"}
              onClick={() => setFilterPriority("critical")}
              className={filterPriority === "critical" ? "" : "border-red-300"}
            >
              Critical ({priorityCounts.critical})
            </Button>
            <Button
              size="sm"
              variant={filterPriority === "high" ? "default" : "outline"}
              onClick={() => setFilterPriority("high")}
              className={filterPriority === "high" ? "" : "border-orange-300"}
            >
              High ({priorityCounts.high})
            </Button>
            <Button
              size="sm"
              variant={filterPriority === "medium" ? "default" : "outline"}
              onClick={() => setFilterPriority("medium")}
              className={filterPriority === "medium" ? "" : "border-yellow-300"}
            >
              Medium ({priorityCounts.medium})
            </Button>
            <Button
              size="sm"
              variant={filterPriority === "low" ? "default" : "outline"}
              onClick={() => setFilterPriority("low")}
              className={filterPriority === "low" ? "" : "border-blue-300"}
            >
              Low ({priorityCounts.low})
            </Button>
          </div>

          <div className="space-y-3">
            {filteredSignals.map((signal) => (
              <Card
                key={signal.id}
                className={`transition-all ${
                  signal.checked ? "opacity-60 bg-gray-50" : "hover:shadow-md"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id={signal.id}
                      checked={signal.checked}
                      onCheckedChange={() => handleToggle(signal.id)}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label
                            htmlFor={signal.id}
                            className={`font-medium cursor-pointer ${
                              signal.checked ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {signal.signal}
                          </label>
                          <Badge variant="outline" className={getPriorityColor(signal.priority)}>
                            {signal.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {signal.category}
                          </Badge>
                        </div>
                        {signal.checked ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">{signal.description}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-700">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{signal.impact}</span>
                        </div>
                      </div>

                      {!signal.checked && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-900">
                              <strong>How to implement:</strong> {signal.howToImplement}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {priorityCounts.critical > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-red-900">
                  {priorityCounts.critical} Critical Signal{priorityCounts.critical !== 1 ? "s" : ""}{" "}
                  Missing
                </p>
                <p className="text-sm text-red-700">
                  These signals have the highest impact on AI trust. Address them first to see the
                  biggest improvement in your E-E-A-T score and AI citation rate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

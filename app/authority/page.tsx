"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrandIdentityForm } from "@/components/brand-identity-form";
import { EEATScoreGauge } from "@/components/eeat-score-gauge";
import { TrustSignalsChecklist } from "@/components/trust-signals-checklist";
import { EntitySchemaGenerator } from "@/components/entity-schema-generator";
import { Shield, AlertCircle, CheckCircle2, Crown, Target } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const dynamic = 'force-dynamic';

interface BrandIdentity {
  id: string;
  organization_name: string;
  organization_type: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  same_as_links?: string[];
  knows_about?: string[];
  physical_address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contact_info?: {
    email?: string;
    phone?: string;
    contactPageUrl?: string;
  };
  founding_date?: string;
  about_page_url?: string;
  eeat_score?: number;
  eeat_analyzed_at?: string;
  eeat_missing_signals?: string[];
  eeat_recommendations?: Array<{
    signal: string;
    priority: string;
    action: string;
    impact: string;
  }>;
}

export default function AuthorityPage() {
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("identity");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadBrandIdentity();
  }, []);

  const loadBrandIdentity = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("brand_identity")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading brand identity:", error);
        toast({
          title: "Error",
          description: "Failed to load brand identity",
          variant: "destructive",
        });
      } else if (data) {
        setBrandIdentity(data as BrandIdentity);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentityUpdate = (updatedIdentity: Partial<BrandIdentity>) => {
    if (brandIdentity) {
      setBrandIdentity({ ...brandIdentity, ...updatedIdentity });
    }
  };

  const getProgressPercentage = () => {
    if (!brandIdentity) return 0;
    let completed = 0;
    const total = 5;

    if (brandIdentity.organization_name) completed++;
    if (brandIdentity.description) completed++;
    if (brandIdentity.same_as_links && brandIdentity.same_as_links.length > 0) completed++;
    if (brandIdentity.knows_about && brandIdentity.knows_about.length > 0) completed++;
    if (brandIdentity.eeat_score && brandIdentity.eeat_score > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const getStatusColor = () => {
    const progress = getProgressPercentage();
    if (progress >= 80) return "text-green-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your authority profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">AI Authority & Trust</h1>
              </div>
              <p className="text-muted-foreground text-lg mt-2">
                Establish your brand entity identity and boost AI citations by up to 45%
              </p>
            </div>
            {brandIdentity && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Setup Progress</div>
                <div className={`text-3xl font-bold ${getStatusColor()}`}>
                  {getProgressPercentage()}%
                </div>
              </div>
            )}
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Crown className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Research-backed impact:</strong> Adding linked credentials (sameAs) and entity
              identity signals increases AI model citations by 45%. This is your competitive advantage.
            </AlertDescription>
          </Alert>

          {brandIdentity?.eeat_score && brandIdentity.eeat_score >= 70 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Excellent E-E-A-T Score!</strong> Your authority signals are strong. AI models
                can verify your trustworthiness through established identity markers.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identity" className="gap-2">
                <Target className="h-4 w-4" />
                Brand Identity
              </TabsTrigger>
              <TabsTrigger value="eeat" className="gap-2">
                <Shield className="h-4 w-4" />
                E-E-A-T Analysis
              </TabsTrigger>
              <TabsTrigger value="schema" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Schema Generator
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Implementation Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6">
              <BrandIdentityForm
                brandIdentity={brandIdentity}
                onUpdate={handleIdentityUpdate}
                onSave={loadBrandIdentity}
              />
            </TabsContent>

            <TabsContent value="eeat" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <EEATScoreGauge
                  score={brandIdentity?.eeat_score || 0}
                  analyzedAt={brandIdentity?.eeat_analyzed_at}
                  brandIdentityId={brandIdentity?.id}
                  onAnalysisComplete={loadBrandIdentity}
                />
                <TrustSignalsChecklist
                  brandIdentityId={brandIdentity?.id}
                  missingSignals={brandIdentity?.eeat_missing_signals || []}
                  recommendations={brandIdentity?.eeat_recommendations}
                />
              </div>
            </TabsContent>

            <TabsContent value="schema" className="space-y-6">
              <EntitySchemaGenerator brandIdentity={brandIdentity} />
            </TabsContent>

            <TabsContent value="guide" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How to Implement Your Authority Signals</CardTitle>
                  <CardDescription>
                    Step-by-step guide to maximize your AI visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Complete Your Brand Identity</h3>
                        <p className="text-sm text-muted-foreground">
                          Fill out all fields in the Brand Identity tab. Focus on adding authority links
                          (LinkedIn, Wikipedia, Crunchbase) - these are critical for Knowledge Graph
                          connections that AI models use for verification.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Run E-E-A-T Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                          Analyze your About page to identify missing trust signals. Aim for a score above
                          70/100. Fix high-priority issues first - they have the biggest impact.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Generate & Implement Schema</h3>
                        <p className="text-sm text-muted-foreground">
                          Use the Schema Generator to create JSON-LD markup. Copy the code and paste it into
                          your website's &lt;head&gt; section or use a plugin like Yoast SEO or Rank Math.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Verify & Monitor</h3>
                        <p className="text-sm text-muted-foreground">
                          Use Google's Rich Results Test to verify your schema is valid. Monitor your AI
                          citation rates in the Analytics dashboard to track the 45% improvement over time.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Helpful Resources</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Button variant="outline" asChild>
                        <a
                          href="https://search.google.com/test/rich-results"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Google Rich Results Test
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a
                          href="https://schema.org/Organization"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Schema.org Documentation
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a
                          href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Google Structured Data Guide
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a
                          href="https://validator.schema.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Schema Validator
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

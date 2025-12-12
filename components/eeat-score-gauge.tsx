"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Award,
  Users,
  Building2,
  FileText,
  Star,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";

interface EEATScoreGaugeProps {
  score: number;
  analyzedAt?: string | null;
  brandIdentityId?: string;
  onAnalysisComplete: () => void;
}

interface ComponentScores {
  authorship: number;
  credentials: number;
  contact_info: number;
  institutional: number;
  transparency: number;
  social_proof: number;
}

export function EEATScoreGauge({
  score,
  analyzedAt,
  brandIdentityId,
  onAnalysisComplete,
}: EEATScoreGaugeProps) {
  const [aboutPageUrl, setAboutPageUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [componentScores, setComponentScores] = useState<ComponentScores | null>(null);
  const [missingSignals, setMissingSignals] = useState<string[]>([]);
  const { toast } = useToast();

  const getScoreColor = (score: number) => {
    if (score >= 71) return "text-green-600";
    if (score >= 41) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 71) return "bg-green-100 border-green-300";
    if (score >= 41) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return "Strong Authority";
    if (score >= 41) return "Moderate Authority";
    return "Weak Authority";
  };

  const getProgressColor = (score: number) => {
    if (score >= 71) return "bg-green-600";
    if (score >= 41) return "bg-yellow-600";
    return "bg-red-600";
  };

  const handleAnalyze = async () => {
    if (!aboutPageUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter your About page URL",
        variant: "destructive",
      });
      return;
    }

    if (!brandIdentityId) {
      toast({
        title: "Error",
        description: "Brand identity not found. Please save your brand information first.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-eeat`;
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("Not authenticated");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aboutPageUrl,
          brandIdentityId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      const result = await response.json();

      setComponentScores(result.component_scores);
      setMissingSignals(result.missing_signals || []);

      toast({
        title: "Analysis Complete",
        description: `E-E-A-T Score: ${result.score}/100`,
      });

      onAnalysisComplete();
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze page",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const componentIcons = {
    authorship: Award,
    credentials: Star,
    contact_info: MapPin,
    institutional: Building2,
    transparency: FileText,
    social_proof: Users,
  };

  const componentLabels = {
    authorship: "Clear Authorship",
    credentials: "Credentials & Expertise",
    contact_info: "Contact Information",
    institutional: "Institutional Connections",
    transparency: "Transparency & Policies",
    social_proof: "Social Proof",
  };

  const componentMaxScores = {
    authorship: 20,
    credentials: 20,
    contact_info: 15,
    institutional: 15,
    transparency: 15,
    social_proof: 15,
  };

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${getScoreBgColor(score)}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                    {Math.round(score)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">out of 100</div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <div className={`p-3 rounded-full ${getScoreBgColor(score)}`}>
                  <Shield className={`h-6 w-6 ${getScoreColor(score)}`} />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <Badge
                className={`text-lg px-4 py-1 ${
                  score >= 71
                    ? "bg-green-600"
                    : score >= 41
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
              >
                {getScoreLabel(score)}
              </Badge>

              {analyzedAt && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Last analyzed: {new Date(analyzedAt).toLocaleDateString()}
                </p>
              )}

              {!analyzedAt && score === 0 && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Not yet analyzed
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-blue-200 bg-blue-50">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-900">Research-Backed Impact:</strong> Sites with strong
          E-E-A-T signals see up to <strong>45% more AI citations</strong>. Improving your score
          directly impacts AI model trust.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Your About Page</CardTitle>
          <CardDescription>
            AI models heavily evaluate About/Team pages for trust signals. Analyze yours to see
            where you stand.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about_url">About Page URL</Label>
            <div className="flex gap-2">
              <Input
                id="about_url"
                value={aboutPageUrl}
                onChange={(e) => setAboutPageUrl(e.target.value)}
                placeholder="https://example.com/about"
                type="url"
                disabled={analyzing}
              />
              <Button onClick={handleAnalyze} disabled={analyzing || !aboutPageUrl.trim()}>
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Analysis takes 10-15 seconds. We'll evaluate authorship, credentials, contact info,
              and more.
            </p>
          </div>
        </CardContent>
      </Card>

      {componentScores && (
        <Card>
          <CardHeader>
            <CardTitle>Component Breakdown</CardTitle>
            <CardDescription>Detailed analysis of your E-E-A-T signals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(componentScores).map(([key, value]) => {
              const Icon = componentIcons[key as keyof ComponentScores];
              const label = componentLabels[key as keyof ComponentScores];
              const maxScore = componentMaxScores[key as keyof ComponentScores];
              const percentage = (value / maxScore) * 100;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {value}/{maxScore}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={percentage} className="h-2" />
                    <div
                      className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(
                        percentage
                      )}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {missingSignals.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Missing Signals Detected</CardTitle>
            <CardDescription className="text-yellow-700">
              Address these gaps to improve your E-E-A-T score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {missingSignals.map((signal, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-yellow-900">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">What is E-E-A-T?</strong>
            </p>
            <p>
              E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness.
              It's Google's framework for evaluating content quality, and AI models use similar
              signals to determine citation-worthiness.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Experience:</strong> Real-world experience with the topic
              </li>
              <li>
                <strong>Expertise:</strong> Credentials, education, professional background
              </li>
              <li>
                <strong>Authoritativeness:</strong> Industry recognition, awards, media mentions
              </li>
              <li>
                <strong>Trustworthiness:</strong> Transparency, contact info, policies
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

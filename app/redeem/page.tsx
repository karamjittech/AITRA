"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Ticket, Sparkles, Zap, Crown } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const dynamic = 'force-dynamic';

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleRedeem() {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a redemption code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirectTo=/redeem');
        return;
      }

      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to redeem code');
      }

      setSuccess(result);
      toast({
        title: "Success!",
        description: result.message,
      });

      setCode("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 1:
        return <Sparkles className="h-8 w-8 text-blue-600" />;
      case 2:
        return <Zap className="h-8 w-8 text-purple-600" />;
      case 3:
        return <Crown className="h-8 w-8 text-amber-600" />;
      default:
        return <Ticket className="h-8 w-8 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Ticket className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Redeem Your LTD Code
          </h1>
          <p className="text-lg text-slate-600">
            Unlock premium features with your AppSumo lifetime deal code
          </p>
        </div>

        {!success ? (
          <Card>
            <CardHeader>
              <CardTitle>Enter Redemption Code</CardTitle>
              <CardDescription>
                Format: LTD-T1-XXXX, LTD-T2-XXXX, or LTD-T3-XXXX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="LTD-T1-ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRedeem();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleRedeem}
                disabled={loading || !code.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? "Redeeming..." : "Redeem Code"}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-sm text-slate-600 mb-3 font-medium">What you'll get:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Lifetime access to premium features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Monthly credit allocation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Increased website & keyword limits</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Priority support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                {getTierIcon(success.tier)}
              </div>
              <CardTitle className="text-center text-green-900">
                Code Redeemed Successfully!
              </CardTitle>
              <CardDescription className="text-center text-green-700">
                {success.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Your Tier:</span>
                  <Badge className="bg-blue-600">{success.tierName}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Credits:</span>
                  <span className="text-lg font-bold text-slate-900">{success.credits}/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Websites:</span>
                  <span className="font-bold text-slate-900">{success.features.maxWebsites}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Keywords:</span>
                  <span className="font-bold text-slate-900">{success.features.maxKeywords}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Competitors:</span>
                  <span className="font-bold text-slate-900">{success.features.maxCompetitors}</span>
                </div>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Your account has been upgraded! All features are now available.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  Start Using Features
                </Button>
                <Button
                  onClick={() => {
                    setSuccess(null);
                    setCode("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Redeem Another Code
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Need help?{" "}
            <a href="mailto:support@yourapp.com" className="text-blue-600 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

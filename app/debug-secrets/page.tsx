"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function DebugSecretsPage() {
  const [showSecrets, setShowSecrets] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET';

  const hasValidConfig = supabaseUrl !== 'NOT_SET' && supabaseAnonKey !== 'NOT_SET';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="ml-2 text-orange-800">
          <strong>Security Warning:</strong> This is a temporary debug page. Delete this page immediately after copying the secrets!
        </AlertDescription>
      </Alert>

      {hasValidConfig ? (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="ml-2 text-green-800">
            <strong>Configuration Found:</strong> Supabase environment variables are loaded correctly.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="ml-2 text-red-800">
            <strong>Configuration Missing:</strong> Supabase environment variables are NOT loaded. Check your .env file and Bolt secrets.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Supabase Configuration</CardTitle>
          <CardDescription>
            Check if your Supabase environment variables are properly loaded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Secrets
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Secrets
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Browser-Available Variables</h3>
              <p className="text-sm text-blue-700 mb-4">These NEXT_PUBLIC_ variables are available in the browser</p>

              <div className="space-y-3">
            <div className="border rounded-lg p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs">NEXT_PUBLIC_SUPABASE_URL</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supabaseUrl, 'url')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied === 'url' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                {showSecrets ? supabaseUrl : '••••••••••••••••••••••••••••'}
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supabaseAnonKey, 'anon')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied === 'anon' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                {showSecrets ? supabaseAnonKey : '••••••••••••••••••••••••••••'}
              </div>
            </div>

              </div>
            </div>
          </div>

          <Alert className="mt-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-900">
              <strong>How to Fix Missing Variables:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                <li>Check that your .env file contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>In Bolt, go to Settings &gt; Secrets</li>
                <li>Add both variables as secrets</li>
                <li>Rebuild the project (stop and start the dev server)</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

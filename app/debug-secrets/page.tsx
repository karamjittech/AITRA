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
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT_SET';
  const supabaseDbUrl = process.env.SUPABASE_DB_URL || 'NOT_SET';

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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bolt Supabase Secrets</CardTitle>
          <CardDescription>
            Copy these values to create new secrets with NEXT_PUBLIC_ prefix in Bolt Settings &gt; Secrets
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
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-sm">NEXT_PUBLIC_SUPABASE_URL</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supabaseUrl, 'url')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied === 'url' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                {showSecrets ? supabaseUrl : '••••••••••••••••••••••••••••'}
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supabaseAnonKey, 'anon')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied === 'anon' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                {showSecrets ? supabaseAnonKey : '••••••••••••••••••••••••••••'}
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-sm">SUPABASE_SERVICE_ROLE_KEY (Optional)</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supabaseServiceRole, 'service')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied === 'service' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                {showSecrets ? supabaseServiceRole : '••••••••••••••••••••••••••••'}
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-sm">SUPABASE_DB_URL (Optional)</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supabaseDbUrl, 'db')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied === 'db' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                {showSecrets ? supabaseDbUrl : '••••••••••••••••••••••••••••'}
              </div>
            </div>
          </div>

          <Alert className="mt-6">
            <AlertDescription>
              <strong>Next Steps:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                <li>Click "Show Secrets" above to reveal the values</li>
                <li>Copy NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>Go to Bolt Settings &gt; Secrets &gt; Create Secret</li>
                <li>Create NEXT_PUBLIC_SUPABASE_URL with the URL value</li>
                <li>Create NEXT_PUBLIC_SUPABASE_ANON_KEY with the anon key value</li>
                <li>Delete this debug page after copying!</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

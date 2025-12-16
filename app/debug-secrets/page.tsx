"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function DebugSecretsPage() {
  const [showSecrets, setShowSecrets] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const customSupabaseUrl = process.env.CUSTOM_SUPABASE_URL || 'NOT_SET';
  const customSupabaseAnonKey = process.env.CUSTOM_SUPABASE_ANON_KEY || 'NOT_SET';
  const customSupabaseServiceRole = process.env.CUSTOM_SUPABASE_SERVICE_ROLE_KEY || 'NOT_SET';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET';
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT_SET';
  const supabaseDbUrl = process.env.SUPABASE_DB_URL || 'NOT_SET';

  const usingCustomVariables = customSupabaseUrl !== 'NOT_SET';

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

      {usingCustomVariables && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="ml-2 text-green-800">
            <strong>Custom Variables Active:</strong> Your external Supabase database is being used (CUSTOM_SUPABASE_*)
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Supabase Configuration</CardTitle>
          <CardDescription>
            {usingCustomVariables
              ? "Using CUSTOM variables (Bolt-proof) - Your external database is active"
              : "Using standard variables - May be overwritten by Bolt.new"}
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
              <h3 className="font-semibold text-blue-900 mb-2">CUSTOM Variables (Recommended)</h3>
              <p className="text-sm text-blue-700 mb-4">These variables prevent Bolt.new from auto-reverting your external database credentials</p>

              <div className="space-y-3">
                <div className="border rounded-lg p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-xs">CUSTOM_SUPABASE_URL</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(customSupabaseUrl, 'custom-url')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copied === 'custom-url' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                    {showSecrets ? customSupabaseUrl : '••••••••••••••••••••••••••••'}
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-xs">CUSTOM_SUPABASE_ANON_KEY</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(customSupabaseAnonKey, 'custom-anon')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copied === 'custom-anon' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                    {showSecrets ? customSupabaseAnonKey : '••••••••••••••••••••••••••••'}
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-xs">CUSTOM_SUPABASE_SERVICE_ROLE_KEY</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(customSupabaseServiceRole, 'custom-service')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copied === 'custom-service' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                    {showSecrets ? customSupabaseServiceRole : '••••••••••••••••••••••••••••'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Standard Variables (Fallback)</h3>
              <p className="text-sm text-gray-600 mb-4">These may be overwritten by Bolt.new - Use CUSTOM_ variables above instead</p>

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

            <div className="border rounded-lg p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs">SUPABASE_SERVICE_ROLE_KEY</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supabaseServiceRole, 'service')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied === 'service' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                {showSecrets ? supabaseServiceRole : '••••••••••••••••••••••••••••'}
              </div>
            </div>
              </div>
            </div>
          </div>

          <Alert className="mt-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-900">
              <strong>Next Steps (Recommended):</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                <li>Click "Show Secrets" above to reveal the values</li>
                <li>Copy the three CUSTOM_SUPABASE_* values from the blue section</li>
                <li>Go to Bolt Settings &gt; Secrets &gt; Create Secret</li>
                <li>Create CUSTOM_SUPABASE_URL with your external database URL</li>
                <li>Create CUSTOM_SUPABASE_ANON_KEY with your anon key</li>
                <li>Create CUSTOM_SUPABASE_SERVICE_ROLE_KEY with your service role key</li>
                <li>These custom variables won't be overwritten by Bolt.new!</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

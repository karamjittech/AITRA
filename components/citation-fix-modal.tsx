"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface Citation {
  id: string;
  sentiment?: string | null;
  link_status?: string | null;
  cited_url?: string | null;
  snippet_text?: string | null;
}

interface CitationFixModalProps {
  citation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CitationFixModal({ citation, isOpen, onClose }: CitationFixModalProps) {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isMarkingFixed, setIsMarkingFixed] = useState(false);
  const [copiedApache, setCopiedApache] = useState(false);
  const [copiedNginx, setCopiedNginx] = useState(false);

  if (!citation) return null;

  const isNegativeSentiment = citation.sentiment === 'negative';
  const isBrokenLink = citation.link_status && ['broken_404', 'broken_timeout', 'broken_other', 'hallucinated'].includes(citation.link_status);

  const handleCopyCode = (code: string, type: 'apache' | 'nginx') => {
    navigator.clipboard.writeText(code);
    if (type === 'apache') {
      setCopiedApache(true);
      setTimeout(() => setCopiedApache(false), 2000);
    } else {
      setCopiedNginx(true);
      setTimeout(() => setCopiedNginx(false), 2000);
    }
  };

  const handleMarkAsFixed = async () => {
    setIsMarkingFixed(true);
    try {
      const { error } = await supabase
        .from('citations')
        // @ts-expect-error - Types outdated, action_taken field exists in DB
        .update({
          action_taken: true,
          action_taken_at: new Date().toISOString(),
          requires_action: false,
        })
        .eq('id', citation.id);

      if (error) throw error;

      setTimeout(() => {
        setIsMarkingFixed(false);
        onClose();
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error marking as fixed:', error);
      setIsMarkingFixed(false);
    }
  };

  const getOldPath = () => {
    if (!citation.cited_url) return '';
    try {
      const url = new URL(citation.cited_url);
      return url.pathname;
    } catch {
      return '';
    }
  };

  const generateApacheRedirect = () => {
    const oldPath = getOldPath();
    const newPath = redirectUrl ? new URL(redirectUrl).pathname : '/';
    return `Redirect 301 ${oldPath} ${newPath}`;
  };

  const generateNginxRedirect = () => {
    const oldPath = getOldPath();
    const newPath = redirectUrl ? new URL(redirectUrl).pathname : '/';
    return `rewrite ^${oldPath}$ ${newPath} permanent;`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isNegativeSentiment && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Fix Negative Sentiment
              </DialogTitle>
              <DialogDescription>
                Your brand is being mentioned negatively in AI responses. Take action to address these concerns.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Issue Detected:</strong> Your brand is being mentioned with concerns or criticism in AI search results.
                </AlertDescription>
              </Alert>

              {citation.snippet_text && (
                <div>
                  <Label className="text-sm font-medium">Citation Snippet:</Label>
                  <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200 text-sm leading-relaxed">
                    {citation.snippet_text}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold">Recommended Actions:</Label>
                <div className="mt-3 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Address the specific concern</p>
                      <p className="text-sm text-muted-foreground">
                        Create content that directly addresses the issues mentioned in the citation
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Add FAQ schema markup</p>
                      <p className="text-sm text-muted-foreground">
                        Include structured data that preemptively answers common concerns
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Publish case studies and testimonials</p>
                      <p className="text-sm text-muted-foreground">
                        Demonstrate successful outcomes and customer satisfaction
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Improve E-E-A-T signals</p>
                      <p className="text-sm text-muted-foreground">
                        Showcase expertise, authoritativeness, and trustworthiness with credentials and certifications
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleMarkAsFixed} disabled={isMarkingFixed} className="flex-1">
                  {isMarkingFixed ? "Marking..." : "Mark as Fixed"}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Dismiss
                </Button>
              </div>
            </div>
          </>
        )}

        {isBrokenLink && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Fix Broken Link
              </DialogTitle>
              <DialogDescription>
                AI models are citing a broken or inaccessible URL from your site
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Issue Detected:</strong> The cited URL is not accessible or points to the wrong domain
                </AlertDescription>
              </Alert>

              <div>
                <Label className="text-sm font-medium">Broken URL:</Label>
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <a
                    href={citation.cited_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all flex items-center gap-2"
                  >
                    {citation.cited_url}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-1 text-sm text-red-600 font-medium">
                  Status: {citation.link_status === 'broken_404' ? '404 Not Found' :
                           citation.link_status === 'broken_timeout' ? 'Connection Timeout' :
                           citation.link_status === 'hallucinated' ? 'Wrong Domain (Hallucinated)' :
                           'Broken'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Recommended Actions:</Label>
                <div className="mt-3 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Set up a 301 redirect</p>
                      <p className="text-sm text-muted-foreground">
                        Redirect the broken URL to the correct page
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Update your sitemap</p>
                      <p className="text-sm text-muted-foreground">
                        Ensure sitemap.xml reflects current URL structure
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Request re-crawl</p>
                      <p className="text-sm text-muted-foreground">
                        Use Google Search Console to request re-indexing
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="redirect-url">New URL (where to redirect):</Label>
                  <Input
                    id="redirect-url"
                    type="url"
                    placeholder="https://yoursite.com/new-page"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {redirectUrl && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">301 Redirect Code (Apache):</Label>
                      <div className="mt-2 p-3 bg-gray-900 rounded-lg relative">
                        <code className="text-sm text-green-400 font-mono">
                          {generateApacheRedirect()}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={() => handleCopyCode(generateApacheRedirect(), 'apache')}
                        >
                          {copiedApache ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">301 Redirect Code (Nginx):</Label>
                      <div className="mt-2 p-3 bg-gray-900 rounded-lg relative">
                        <code className="text-sm text-green-400 font-mono">
                          {generateNginxRedirect()}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={() => handleCopyCode(generateNginxRedirect(), 'nginx')}
                        >
                          {copiedNginx ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleMarkAsFixed} disabled={isMarkingFixed} className="flex-1">
                  {isMarkingFixed ? "Marking..." : "Mark as Fixed"}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Dismiss
                </Button>
              </div>
            </div>
          </>
        )}

        {!isNegativeSentiment && !isBrokenLink && (
          <>
            <DialogHeader>
              <DialogTitle>Citation Details</DialogTitle>
              <DialogDescription>
                This citation doesn't require immediate action
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This citation appears to be in good standing. No action needed at this time.
              </p>
              <Button onClick={onClose} className="mt-4 w-full">
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

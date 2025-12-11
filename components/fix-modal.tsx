"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Info } from "lucide-react";

interface FixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixType: string;
  generatedContent: any;
  impact: string;
}

export function FixModal({
  open,
  onOpenChange,
  fixType,
  generatedContent,
  impact,
}: FixModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const contentToCopy = typeof generatedContent === "string"
      ? generatedContent
      : JSON.stringify(generatedContent, null, 2);

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFixTitle = () => {
    switch (fixType) {
      case "faq-schema":
        return "FAQ Schema Markup";
      case "howto-schema":
        return "HowTo Schema Markup";
      case "article-schema":
        return "Article Schema Markup";
      case "meta-description":
        return "Optimized Meta Description";
      case "title-tag":
        return "Optimized Title Tag";
      default:
        return "Generated Fix";
    }
  };

  const getInstructions = () => {
    if (fixType.includes("schema")) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to apply:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Copy the JSON-LD code above</li>
              <li>
                Paste it inside a{" "}
                <code className="bg-muted px-1 rounded">
                  &lt;script type="application/ld+json"&gt;
                </code>{" "}
                tag
              </li>
              <li>
                Add the script tag to your HTML <code className="bg-muted px-1 rounded">&lt;head&gt;</code> section
              </li>
              <li>
                Verify with{" "}
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Rich Results Test
                </a>
              </li>
            </ol>
          </AlertDescription>
        </Alert>
      );
    } else if (fixType === "meta-description") {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to apply:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Copy the meta description above</li>
              <li>
                Replace your current{" "}
                <code className="bg-muted px-1 rounded">
                  &lt;meta name="description"&gt;
                </code>{" "}
                tag
              </li>
              <li>Ensure it stays between 120-160 characters</li>
            </ol>
          </AlertDescription>
        </Alert>
      );
    } else if (fixType === "title-tag") {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to apply:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Copy the title text above</li>
              <li>
                Replace your current{" "}
                <code className="bg-muted px-1 rounded">&lt;title&gt;</code> tag
              </li>
              <li>Keep it between 30-60 characters for optimal display</li>
            </ol>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (fixType.includes("schema")) {
      return (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code>{JSON.stringify(generatedContent, null, 2)}</code>
        </pre>
      );
    } else {
      const text = generatedContent?.text || generatedContent;
      return (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">{text}</p>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{getFixTitle()}</DialogTitle>
            <Badge variant="outline">{impact}</Badge>
          </div>
          <DialogDescription>
            AI-generated optimization for better search visibility
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderContent()}

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>

          {getInstructions()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Info, ChevronLeft, ChevronRight, Sparkles, Table as TableIcon, Loader2 } from "lucide-react";
import { PageAnalysis } from "@/lib/types";

interface TableConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: PageAnalysis;
  pageId: string;
}

export function TableConversionModal({
  open,
  onOpenChange,
  analysis,
  pageId,
}: TableConversionModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedTable, setGeneratedTable] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const samples = analysis.comparativeContentSamples || [];
  const currentSample = samples[currentIndex];

  const handleGenerateTable = async () => {
    if (!currentSample) return;

    setIsGenerating(true);
    setGeneratedTable(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-fix`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            pageId: pageId,
            fixType: "paragraph-to-table",
            currentContent: {
              paragraphText: currentSample.text,
              dataType: currentSample.type,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.fix?.schema_json?.html) {
        setGeneratedTable(data.fix.schema_json.html);
      } else {
        throw new Error("Failed to generate table");
      }
    } catch (error) {
      console.error("Error generating table:", error);
      alert("Failed to generate table. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedTable) {
      navigator.clipboard.writeText(generatedTable);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNext = () => {
    if (currentIndex < samples.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setGeneratedTable(null);
      setCopied(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setGeneratedTable(null);
      setCopied(false);
    }
  };

  if (samples.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <TableIcon className="h-6 w-6" />
              Convert to Perplexity-Optimized Table
            </DialogTitle>
            <Badge variant="outline">
              {currentIndex + 1} of {samples.length}
            </Badge>
          </div>
          <DialogDescription>
            Convert comparative text to structured tables that Perplexity prefers for citations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Why this matters:</strong> Perplexity displays 8-12 sources and cites
              tabular data 3.2x more frequently than paragraph text. Converting comparative
              content to tables significantly increases your AI citation probability.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Original Paragraph
                <Badge variant="secondary">{currentSample.type}</Badge>
                <Badge variant="outline">
                  {Math.round(currentSample.confidence)}% confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900 leading-relaxed">
                  {currentSample.text}
                </p>
              </div>
            </CardContent>
          </Card>

          {!generatedTable ? (
            <div className="flex justify-center py-8">
              <Button
                onClick={handleGenerateTable}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Table...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Optimized Table
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Generated Table
                    <Badge className="bg-green-600">Perplexity-Optimized</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto">
                    <div dangerouslySetInnerHTML={{ __html: generatedTable }} />
                  </div>

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
                        Copy HTML Code
                      </>
                    )}
                  </Button>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>How to apply:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                        <li>Copy the HTML code above</li>
                        <li>Replace the original paragraph in your page with this table</li>
                        <li>Verify the table displays correctly on mobile devices</li>
                        <li>Re-analyze your page to see the improved Perplexity score</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-900 font-medium">
                      Estimated Impact: +8 points for Perplexity score
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Tables are cited 3.2x more frequently by Perplexity AI
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === samples.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

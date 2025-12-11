"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface KeywordSuggestion {
  query: string;
  type: string;
  relevance: number;
  selected: boolean;
}

interface AddKeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddKeywordModal({ isOpen, onClose, onSuccess }: AddKeywordModalProps) {
  const [step, setStep] = useState<"input" | "suggestions">("input");
  const [mainKeyword, setMainKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateSuggestions = async () => {
    if (!mainKeyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/suggest-fan-out`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            mainKeyword: mainKeyword.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }

      const suggestionsWithSelection = data.suggestions.map((s: any) => ({
        ...s,
        selected: true,
      }));

      setSuggestions(suggestionsWithSelection);
      setStep("suggestions");
    } catch (err) {
      console.error("Error generating suggestions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate suggestions. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSuggestion = (index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleSaveKeywords = async () => {
    const selectedSuggestions = suggestions.filter((s) => s.selected);

    if (selectedSuggestions.length === 0) {
      setError("Please select at least one keyword");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onSuccess();
      handleReset();
    } catch (err) {
      console.error("Error saving keywords:", err);
      setError("Failed to save keywords. Please try again.");
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setMainKeyword("");
    setSuggestions([]);
    setError("");
    setIsGenerating(false);
    setIsSaving(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Add Keywords with AI Expansion
          </DialogTitle>
          <DialogDescription>
            {step === "input"
              ? "Enter your main keyword and we'll suggest related queries to track"
              : "Select the keywords you want to track for AI citations"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "input" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="main-keyword">Main Keyword</Label>
              <Input
                id="main-keyword"
                placeholder="e.g., AI content detection"
                value={mainKeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGenerateSuggestions();
                  }
                }}
                disabled={isGenerating}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                This will be your primary keyword for tracking
              </p>
            </div>
          </div>
        )}

        {step === "suggestions" && (
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Main Keyword
              </p>
              <p className="text-sm text-blue-700">{mainKeyword}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                AI Topic Expansion ({suggestions.filter((s) => s.selected).length}{" "}
                selected)
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`suggestion-${index}`}
                      checked={suggestion.selected}
                      onCheckedChange={() => handleToggleSuggestion(index)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`suggestion-${index}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {suggestion.query}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Relevance: {suggestion.relevance}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isGenerating || isSaving}>
            Cancel
          </Button>
          {step === "input" ? (
            <Button onClick={handleGenerateSuggestions} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Suggestions
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep("input")}
                disabled={isSaving}
              >
                Back
              </Button>
              <Button onClick={handleSaveKeywords} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Track {suggestions.filter((s) => s.selected).length} Keywords
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

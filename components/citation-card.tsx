"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Target, Users } from "lucide-react";

interface CitationCardProps {
  citation: {
    id: string;
    snippet_text: string;
    platform: string;
    sentiment: "positive" | "neutral" | "negative";
    context_tag: string;
    competitor_mentions: string[];
    position: number;
    created_at: string;
  };
  brandName?: string;
}

export function CitationCard({ citation, brandName = "Your Brand" }: CitationCardProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😟";
      default:
        return "😐";
    }
  };

  const highlightBrandName = (text: string) => {
    if (!text) return "";
    const regex = new RegExp(`(${brandName})`, "gi");
    return text.replace(regex, '<mark class="bg-blue-200 font-semibold">$1</mark>');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {citation.platform}
            </Badge>
            <Badge className={getSentimentColor(citation.sentiment)}>
              {getSentimentIcon(citation.sentiment)} {citation.sentiment}
            </Badge>
          </div>
          <Badge variant="secondary" className="text-xs">
            {citation.context_tag}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: highlightBrandName(citation.snippet_text),
            }}
          />
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {citation.position && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Position #{citation.position}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(citation.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {citation.competitor_mentions && citation.competitor_mentions.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Competitors Mentioned:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {citation.competitor_mentions.map((competitor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {competitor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex gap-2">
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Context
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

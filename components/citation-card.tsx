"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Target, Users, AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface CitationCardProps {
  citation: {
    id: string;
    snippet_text: string;
    platform: string;
    sentiment: "positive" | "neutral" | "negative" | null;
    context_tag: string | null;
    competitor_mentions: string[] | null;
    position: number | null;
    created_at: string;
    cited_url?: string | null;
    link_status?: string | null;
    requires_action?: boolean;
    keyword?: string;
  };
  brandName?: string;
  onFixNow?: (citation: any) => void;
  onViewDetails?: (citation: any) => void;
}

export function CitationCard({ citation, brandName = "Your Brand", onFixNow, onViewDetails }: CitationCardProps) {
  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLinkStatusIcon = () => {
    if (!citation.link_status) return null;

    const config = {
      live: {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        label: "Live",
        color: "text-green-600",
      },
      broken_404: {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        label: "404",
        color: "text-red-600",
      },
      broken_timeout: {
        icon: <Clock className="h-4 w-4 text-orange-600" />,
        label: "Timeout",
        color: "text-orange-600",
      },
      broken_other: {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        label: "Broken",
        color: "text-red-600",
      },
      hallucinated: {
        icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
        label: "Wrong Domain",
        color: "text-yellow-600",
      },
      pending: {
        icon: <Clock className="h-4 w-4 text-gray-400" />,
        label: "Pending",
        color: "text-gray-400",
      },
    };

    const status = config[citation.link_status as keyof typeof config];
    if (!status) return null;

    return (
      <div className={`flex items-center gap-1 ${status.color}`}>
        {status.icon}
        <span className="text-xs font-medium">{status.label}</span>
      </div>
    );
  };

  const highlightBrandName = (text: string) => {
    if (!text) return "";
    const regex = new RegExp(`(${brandName})`, "gi");
    return text.replace(regex, '<mark class="bg-blue-200 font-semibold">$1</mark>');
  };

  const cardBorder = citation.requires_action
    ? "border-red-300 border-2"
    : citation.sentiment === 'positive' && citation.link_status === 'live'
    ? "border-green-200"
    : "border-gray-200";

  const cardBackground = citation.requires_action
    ? "bg-red-50"
    : citation.sentiment === 'positive'
    ? "bg-green-50"
    : "bg-white";

  return (
    <Card className={`${cardBorder} ${cardBackground} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        {citation.requires_action && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-bold text-red-600 uppercase">
              Requires Action
            </span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {citation.platform}
            </Badge>
            {citation.sentiment && (
              <Badge className={getSentimentColor(citation.sentiment)}>
                {citation.sentiment}
              </Badge>
            )}
          </div>
          {citation.context_tag && (
            <Badge variant="secondary" className="text-xs">
              {citation.context_tag}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {citation.cited_url && (
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Cited URL:</span>
              </div>
              {getLinkStatusIcon()}
            </div>
            <a
              href={citation.cited_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              {citation.cited_url}
            </a>
          </div>
        )}

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
          {citation.requires_action && onFixNow && (
            <Button onClick={() => onFixNow(citation)} size="sm" className="bg-red-600 hover:bg-red-700">
              Fix Now
            </Button>
          )}
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={() => onViewDetails(citation)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

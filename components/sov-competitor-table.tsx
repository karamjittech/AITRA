"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Target,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { formatSOVPercentage } from "@/lib/domain-utils";

interface CompetitorSOVData {
  name: string;
  domain: string;
  citations: number;
  percentage: number;
  platforms: string[];
  coCitationFrequency: number;
  trend?: 'rising' | 'falling' | 'stable';
  lastSeen?: string;
}

interface SOVCompetitorTableProps {
  yourBrand: {
    name: string;
    domain: string;
    citations: number;
    percentage: number;
    platforms: string[];
  };
  competitors: CompetitorSOVData[];
  totalTests: number;
  marketConcentration: number;
  topCompetitor?: string;
}

export function SOVCompetitorTable({
  yourBrand,
  competitors,
  totalTests,
  marketConcentration,
  topCompetitor,
}: SOVCompetitorTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'citations' | 'percentage' | 'platforms'>('percentage');

  const displayedCompetitors = expanded ? competitors : competitors.slice(0, 5);

  const sortedCompetitors = [...displayedCompetitors].sort((a, b) => {
    if (sortBy === 'citations') return b.citations - a.citations;
    if (sortBy === 'percentage') return b.percentage - a.percentage;
    if (sortBy === 'platforms') return b.platforms.length - a.platforms.length;
    return 0;
  });

  const getTrendIcon = (trend?: 'rising' | 'falling' | 'stable') => {
    if (trend === 'rising') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'falling') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPlatformBadgeVariant = (platform: string) => {
    const platformColors: Record<string, string> = {
      'ChatGPT': 'bg-green-100 text-green-800 border-green-200',
      'Claude': 'bg-orange-100 text-orange-800 border-orange-200',
      'Gemini': 'bg-blue-100 text-blue-800 border-blue-200',
      'Perplexity': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return platformColors[platform] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSOVColor = (percentage: number) => {
    if (percentage >= 30) return 'text-green-700 font-bold';
    if (percentage >= 20) return 'text-green-600 font-semibold';
    if (percentage >= 10) return 'text-blue-600';
    return 'text-gray-600';
  };

  const yourBrandRow = (
    <TableRow className="bg-blue-50 hover:bg-blue-100">
      <TableCell className="font-bold flex items-center gap-2">
        <Crown className="h-4 w-4 text-yellow-600" />
        {yourBrand.name}
        <Badge variant="outline" className="text-xs">You</Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className={getSOVColor(yourBrand.percentage)}>
          {formatSOVPercentage(yourBrand.percentage)}
        </span>
      </TableCell>
      <TableCell className="text-right">{yourBrand.citations}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1 justify-end">
          {yourBrand.platforms.map((platform) => (
            <Badge
              key={platform}
              variant="outline"
              className={`text-xs ${getPlatformBadgeVariant(platform)}`}
            >
              {platform}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          {getTrendIcon('stable')}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI Share of Voice Leaderboard
            </CardTitle>
            <CardDescription className="mt-2">
              Who's winning AI citations across {totalTests} tracked keywords
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm text-muted-foreground">Market Concentration</div>
            <div className="text-2xl font-bold">{marketConcentration.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {marketConcentration > 75 ? 'Highly concentrated' :
               marketConcentration > 50 ? 'Moderately concentrated' : 'Fragmented'}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCompetitor && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-amber-900">
                  Market Leader: {topCompetitor}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Button
              size="sm"
              variant={sortBy === 'percentage' ? 'default' : 'outline'}
              onClick={() => setSortBy('percentage')}
            >
              Share of Voice
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'citations' ? 'default' : 'outline'}
              onClick={() => setSortBy('citations')}
            >
              Citations
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'platforms' ? 'default' : 'outline'}
              onClick={() => setSortBy('platforms')}
            >
              Platforms
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Competitor</TableHead>
                  <TableHead className="text-right">Share of Voice</TableHead>
                  <TableHead className="text-right">Citations</TableHead>
                  <TableHead className="text-right">Platforms</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yourBrandRow}

                {sortedCompetitors.map((competitor, index) => (
                  <TableRow key={competitor.domain}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <div className="flex flex-col">
                          <span>{competitor.name}</span>
                          <a
                            href={`https://${competitor.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {competitor.domain}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={getSOVColor(competitor.percentage)}>
                        {formatSOVPercentage(competitor.percentage)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{competitor.citations}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {competitor.platforms.slice(0, 4).map((platform) => (
                          <Badge
                            key={platform}
                            variant="outline"
                            className={`text-xs ${getPlatformBadgeVariant(platform)}`}
                          >
                            {platform}
                          </Badge>
                        ))}
                        {competitor.platforms.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{competitor.platforms.length - 4}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(competitor.trend)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {competitors.length > 5 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setExpanded(!expanded)}
                className="gap-2"
              >
                {expanded ? (
                  <>
                    Show Less
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show All {competitors.length} Competitors
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Share of Voice (SOV)</strong> measures your brand's
              visibility compared to competitors across AI platforms.
            </p>
            <p>
              A higher SOV means AI models cite your content more frequently, increasing your brand
              awareness and authority in your industry.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

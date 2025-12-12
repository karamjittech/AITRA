"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet, Loader2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SOVExportData {
  yourBrand: {
    name: string;
    domain: string;
    citations: number;
    percentage: number;
    platforms: string[];
  };
  competitors: Array<{
    name: string;
    domain: string;
    citations: number;
    percentage: number;
    platforms: string[];
  }>;
  platformBreakdown: Array<{
    platform: string;
    yourCitations: number;
    yourPercentage: number;
    totalCitations: number;
  }>;
  insights: {
    topCompetitor?: string;
    marketConcentration: number;
    totalUniqueDomains: number;
  };
  totalTests: number;
  dateRange: {
    start: string;
    end: string;
  };
}

interface SOVExportButtonProps {
  data: SOVExportData;
}

export function SOVExportButton({ data }: SOVExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportAsJSON = () => {
    setExporting(true);
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        reportPeriod: data.dateRange,
        summary: {
          yourBrand: data.yourBrand,
          totalCompetitors: data.competitors.length,
          totalTests: data.totalTests,
          marketConcentration: data.insights.marketConcentration,
          topCompetitor: data.insights.topCompetitor,
        },
        competitors: data.competitors,
        platformBreakdown: data.platformBreakdown,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sov-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'SOV report exported as JSON',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export SOV report',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const exportAsCSV = () => {
    setExporting(true);
    try {
      const csvRows = [
        ['Share of Voice Report'],
        ['Exported:', new Date().toISOString()],
        ['Period:', `${data.dateRange.start} to ${data.dateRange.end}`],
        [''],
        ['Your Brand Performance'],
        ['Metric', 'Value'],
        ['Brand', data.yourBrand.name],
        ['Domain', data.yourBrand.domain],
        ['Citations', data.yourBrand.citations.toString()],
        ['Share of Voice', `${data.yourBrand.percentage.toFixed(2)}%`],
        ['Platforms', data.yourBrand.platforms.join(', ')],
        [''],
        ['Competitor Analysis'],
        ['Rank', 'Name', 'Domain', 'Citations', 'Share of Voice (%)', 'Platforms'],
      ];

      data.competitors.forEach((competitor, index) => {
        csvRows.push([
          (index + 1).toString(),
          competitor.name,
          competitor.domain,
          competitor.citations.toString(),
          competitor.percentage.toFixed(2),
          competitor.platforms.join('; '),
        ]);
      });

      csvRows.push(['']);
      csvRows.push(['Platform Breakdown']);
      csvRows.push(['Platform', 'Your Citations', 'Your SOV (%)', 'Total Citations']);

      data.platformBreakdown.forEach((platform) => {
        csvRows.push([
          platform.platform,
          platform.yourCitations.toString(),
          platform.yourPercentage.toFixed(2),
          platform.totalCitations.toString(),
        ]);
      });

      csvRows.push(['']);
      csvRows.push(['Market Insights']);
      csvRows.push(['Metric', 'Value']);
      csvRows.push(['Top Competitor', data.insights.topCompetitor || 'N/A']);
      csvRows.push(['Market Concentration', `${data.insights.marketConcentration.toFixed(2)}%`]);
      csvRows.push(['Unique Domains', data.insights.totalUniqueDomains.toString()]);
      csvRows.push(['Total Tests', data.totalTests.toString()]);

      const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sov-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'SOV report exported as CSV',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export SOV report',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const copyShareableLink = () => {
    const summary = `My AI Share of Voice: ${data.yourBrand.percentage.toFixed(1)}%\n` +
      `Top Competitor: ${data.insights.topCompetitor || 'N/A'}\n` +
      `Market Position: ${data.competitors.findIndex(c => c.domain === data.yourBrand.domain) + 1 || 'Leader'} of ${data.competitors.length + 1} competitors\n` +
      `Platforms: ${data.yourBrand.platforms.join(', ')}`;

    navigator.clipboard.writeText(summary);

    toast({
      title: 'Copied to Clipboard',
      description: 'SOV summary copied and ready to share',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting} className="gap-2">
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportAsCSV} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="gap-2">
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Share</DropdownMenuLabel>
        <DropdownMenuItem onClick={copyShareableLink} className="gap-2">
          <Share2 className="h-4 w-4" />
          Copy Summary
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

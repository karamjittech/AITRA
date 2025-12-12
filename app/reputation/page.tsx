"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/citation-card";
import { CitationFixModal } from "@/components/citation-fix-modal";
import { AlertCircle, Shield, TrendingUp, Link2 } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

type FilterType = 'all' | 'requires_action' | 'positive' | 'negative' | 'broken_links';

interface Citation {
  id: string;
  snippet_text: string;
  platform: string;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  context_tag: string | null;
  competitor_mentions: string[] | null;
  position: number | null;
  created_at: string;
  cited_url?: string | null;
  link_status?: string | null;
  requires_action?: boolean;
  action_taken?: boolean;
  tracked_keywords: {
    keyword: string;
    website_id: string;
  };
}

export default function ReputationPage() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [filteredCitations, setFilteredCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);

  const stats = {
    total: citations.length,
    positive: citations.filter(c => c.sentiment === 'positive').length,
    negative: citations.filter(c => c.sentiment === 'negative').length,
    brokenLinks: citations.filter(c => c.link_status && ['broken_404', 'broken_timeout', 'broken_other', 'hallucinated'].includes(c.link_status)).length,
    criticalIssues: citations.filter(c => c.requires_action && !c.action_taken).length,
  };

  useEffect(() => {
    loadCitations();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, citations]);

  const loadCitations = async () => {
    try {
      setIsLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('No user found');
        setIsLoading(false);
        return;
      }

      const { data: websites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', userData.user.id);

      if (!websites || websites.length === 0) {
        console.log('No website found for user');
        setIsLoading(false);
        return;
      }

      const websiteId = (websites as { id: string }[])[0].id;

      const { data, error } = await supabase
        .from('citations')
        .select(`
          *,
          tracked_keywords!inner(
            keyword,
            website_id
          )
        `)
        .eq('tracked_keywords.website_id', websiteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading citations:', error);
      } else {
        setCitations(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...citations];

    switch (filter) {
      case 'requires_action':
        filtered = citations.filter(c => c.requires_action === true);
        break;
      case 'positive':
        filtered = citations.filter(c => c.sentiment === 'positive');
        break;
      case 'negative':
        filtered = citations.filter(c => c.sentiment === 'negative');
        break;
      case 'broken_links':
        filtered = citations.filter(c =>
          c.link_status && ['broken_404', 'broken_timeout', 'broken_other', 'hallucinated'].includes(c.link_status)
        );
        break;
      default:
        filtered = citations;
    }

    filtered.sort((a, b) => {
      if (a.requires_action && !b.requires_action) return -1;
      if (!a.requires_action && b.requires_action) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredCitations(filtered);
  };

  const handleFixNow = (citation: Citation) => {
    setSelectedCitation(citation);
    setIsFixModalOpen(true);
  };

  const handleViewDetails = (citation: Citation) => {
    setSelectedCitation(citation);
    setIsFixModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFixModalOpen(false);
    setSelectedCitation(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="animate-pulse text-muted-foreground">Loading reputation data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-10 w-10 text-blue-600" />
              Reputation Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor how AI models are citing your brand across platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Citations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All AI mentions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Positive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.positive}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Negative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.negative}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.criticalIssues}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Citations</CardTitle>
                  <CardDescription>
                    All mentions of your brand in AI search results
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    All ({stats.total})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'requires_action' ? 'default' : 'outline'}
                    onClick={() => setFilter('requires_action')}
                    className={filter === 'requires_action' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Action Needed ({stats.criticalIssues})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'positive' ? 'default' : 'outline'}
                    onClick={() => setFilter('positive')}
                    className={filter === 'positive' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    <TrendingUp className="mr-1 h-4 w-4" />
                    Positive ({stats.positive})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'negative' ? 'default' : 'outline'}
                    onClick={() => setFilter('negative')}
                  >
                    Negative ({stats.negative})
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'broken_links' ? 'default' : 'outline'}
                    onClick={() => setFilter('broken_links')}
                  >
                    <Link2 className="mr-1 h-4 w-4" />
                    Broken ({stats.brokenLinks})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCitations.length === 0 ? (
                <div className="py-12 text-center">
                  <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {filter === 'all' ? 'No Citations Yet' : 'No Citations Match Filter'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {filter === 'all'
                      ? 'Start tracking keywords to see how AI models are citing your brand'
                      : 'Try adjusting your filter to see more results'
                    }
                  </p>
                  {filter !== 'all' && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setFilter('all')}
                    >
                      View All Citations
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCitations.map((citation) => (
                    <CitationCard
                      key={citation.id}
                      citation={{
                        ...citation,
                        keyword: citation.tracked_keywords.keyword,
                      }}
                      onFixNow={handleFixNow}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CitationFixModal
        citation={selectedCitation}
        isOpen={isFixModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

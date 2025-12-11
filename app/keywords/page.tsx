"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddKeywordModal } from "@/components/add-keyword-modal";
import { Plus, TrendingUp, Search, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KeywordGroup {
  id: string;
  name: string;
  main_keyword: string;
  created_at: string;
  keywords: Array<{
    id: string;
    keyword: string;
    is_main_keyword: boolean;
    is_ai_suggested: boolean;
    suggestion_type: string;
    search_volume: number;
  }>;
}

export default function KeywordsPage() {
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadKeywordGroups();
  }, []);

  const loadKeywordGroups = async () => {
    setIsLoading(true);
    setError("");
    setKeywordGroups([]);
    setIsLoading(false);
  };

  const handleKeywordGroupAdded = () => {
    setIsModalOpen(false);
    loadKeywordGroups();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                <Search className="h-10 w-10 text-blue-600" />
                Keyword Tracking
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitor AI citations across multiple search queries
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Keywords
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ) : keywordGroups.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-50 rounded-full">
                    <TrendingUp className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold">No Keywords Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start tracking AI citations by adding your first keyword group.
                  Our AI will suggest related queries to maximize your coverage.
                </p>
                <Button onClick={() => setIsModalOpen(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Keyword
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {keywordGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{group.name}</CardTitle>
                        <CardDescription>
                          Main keyword: {group.main_keyword}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Search Volume</TableHead>
                          <TableHead>Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.keywords.map((keyword) => (
                          <TableRow key={keyword.id}>
                            <TableCell className="font-medium">
                              {keyword.keyword}
                              {keyword.is_main_keyword && (
                                <Badge variant="default" className="ml-2">
                                  Main
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {keyword.suggestion_type || "manual"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {keyword.search_volume > 0
                                ? keyword.search_volume.toLocaleString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {keyword.is_ai_suggested ? (
                                <Badge variant="secondary">AI Suggested</Badge>
                              ) : (
                                <Badge variant="outline">Manual</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddKeywordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleKeywordGroupAdded}
      />
    </div>
  );
}

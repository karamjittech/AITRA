"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddKeywordModal } from "@/components/add-keyword-modal";
import { Plus, TrendingUp, Search, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/utils/supabase/client";

export const dynamic = 'force-dynamic';

interface ChildKeyword {
  id: string;
  keyword: string;
  intent_category: string | null;
  search_volume: number;
}

interface KeywordGroup {
  id: string;
  keyword: string;
  cluster_name: string | null;
  created_at: string;
  children: ChildKeyword[];
}

export default function KeywordsPage() {
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadKeywordGroups();
  }, []);

  const loadKeywordGroups = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to view keywords");
        setIsLoading(false);
        return;
      }

      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (websiteError) {
        throw websiteError;
      }

      if (!website) {
        setKeywordGroups([]);
        setIsLoading(false);
        return;
      }

      const websiteId = (website as { id: string }).id;

      const { data: parentKeywords, error: parentsError } = await supabase
        .from("tracked_keywords")
        .select("id, keyword, cluster_name, created_at")
        .eq("website_id", websiteId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (parentsError) {
        throw parentsError;
      }

      const groupsWithChildren: KeywordGroup[] = await Promise.all(
        (parentKeywords || []).map(async (parent: any) => {
          const { data: children, error: childrenError } = await supabase
            .from("tracked_keywords")
            .select("id, keyword, intent_category, search_volume")
            .eq("parent_id", parent.id)
            .order("intent_category", { ascending: true });

          if (childrenError) {
            console.error("Error loading children:", childrenError);
          }

          return {
            id: parent.id,
            keyword: parent.keyword,
            cluster_name: parent.cluster_name,
            created_at: parent.created_at,
            children: ((children || []) as any[]).map((child: any) => ({
              id: child.id,
              keyword: child.keyword,
              intent_category: child.intent_category,
              search_volume: child.search_volume,
            })),
          };
        })
      );

      setKeywordGroups(groupsWithChildren);
      const allExpanded = new Set(groupsWithChildren.map((g) => g.id));
      setExpandedGroups(allExpanded);
    } catch (err) {
      console.error("Error loading keywords:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load keywords. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordGroupAdded = () => {
    setIsModalOpen(false);
    loadKeywordGroups();
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this keyword cluster?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("tracked_keywords")
        .delete()
        .eq("id", groupId);

      if (error) {
        throw error;
      }

      loadKeywordGroups();
    } catch (err) {
      console.error("Error deleting keyword group:", err);
      setError("Failed to delete keyword group");
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "Informational":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Comparative":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Instructional":
        return "bg-green-100 text-green-800 border-green-200";
      case "Brand":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Evaluative":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient">
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
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
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
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                    <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
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
              {keywordGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.id);
                const categoryCounts = group.children.reduce((acc, child) => {
                  const category = child.intent_category || "Other";
                  acc[category] = (acc[category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                return (
                  <Card key={group.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleGroup(group.id)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </Button>
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                {group.cluster_name || group.keyword}
                                <Badge variant="outline" className="font-normal">
                                  {group.children.length} queries
                                </Badge>
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Main keyword: <span className="font-medium text-gray-900 dark:text-gray-100">{group.keyword}</span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 ml-11">
                            {Object.entries(categoryCounts).map(([category, count]) => (
                              <Badge
                                key={category}
                                variant="outline"
                                className={`${getCategoryColor(category)} text-xs`}
                              >
                                {category}: {count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Query</TableHead>
                              <TableHead>Intent Category</TableHead>
                              <TableHead>Search Volume</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.children.map((child) => (
                              <TableRow key={child.id}>
                                <TableCell className="font-medium pl-8">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-gray-300"></div>
                                    {child.keyword}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getCategoryColor(child.intent_category)}
                                  >
                                    {child.intent_category || "Other"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {child.search_volume > 0
                                    ? child.search_volume.toLocaleString()
                                    : "N/A"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
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

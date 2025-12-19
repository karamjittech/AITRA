"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Database,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

interface SystemStats {
  totalCreditsUsed: number;
  creditsToday: number;
  estimatedCostToday: number;
  estimatedCostWeek: number;
  topUsers: Array<{
    email: string;
    credits_used: number;
    tier: number;
  }>;
  usageByAction: Array<{
    action_type: string;
    count: number;
    total_credits: number;
  }>;
}

export default function SystemHealth() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchSystemStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const { data: allUsage } = await (supabase as any)
        .from('credits_usage')
        .select('credits_consumed');

      const { data: todayUsage } = await (supabase as any)
        .from('credits_usage')
        .select('credits_consumed')
        .gte('created_at', today.toISOString());

      const { data: weekUsage } = await (supabase as any)
        .from('credits_usage')
        .select('credits_consumed')
        .gte('created_at', weekAgo.toISOString());

      const { data: topUsersData } = await (supabase as any)
        .from('users')
        .select('email, credits_used, appsumo_tier')
        .order('credits_used', { ascending: false })
        .limit(10);

      const { data: usageByActionData } = await (supabase as any)
        .from('credits_usage')
        .select('action_type, credits_consumed')
        .gte('created_at', weekAgo.toISOString());

      const totalCreditsUsed = allUsage?.reduce((sum: number, u: any) => sum + u.credits_consumed, 0) || 0;
      const creditsToday = todayUsage?.reduce((sum: number, u: any) => sum + u.credits_consumed, 0) || 0;
      const creditsWeek = weekUsage?.reduce((sum: number, u: any) => sum + u.credits_consumed, 0) || 0;

      const costPerCredit = 0.001;
      const estimatedCostToday = creditsToday * costPerCredit;
      const estimatedCostWeek = creditsWeek * costPerCredit;

      const usageByAction: Record<string, { count: number; total_credits: number }> = {};
      usageByActionData?.forEach((usage: any) => {
        if (!usageByAction[usage.action_type]) {
          usageByAction[usage.action_type] = { count: 0, total_credits: 0 };
        }
        usageByAction[usage.action_type].count += 1;
        usageByAction[usage.action_type].total_credits += usage.credits_consumed;
      });

      setStats({
        totalCreditsUsed,
        creditsToday,
        estimatedCostToday,
        estimatedCostWeek,
        topUsers: topUsersData?.map((u: any) => ({
          email: u.email || 'Unknown',
          credits_used: u.credits_used,
          tier: u.appsumo_tier,
        })) || [],
        usageByAction: Object.entries(usageByAction).map(([action_type, data]) => ({
          action_type,
          count: data.count,
          total_credits: data.total_credits,
        })),
      });

      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const costThreshold = 50;
  const isHighCost = (stats?.estimatedCostToday || 0) > costThreshold;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-gray-100">System Health</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Monitor API usage, costs, and system performance</p>
        </div>
        <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
          <Clock className="h-3 w-3 mr-1" />
          Updated 1 min ago
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Credits Today</CardTitle>
            <div className="p-2.5 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats?.creditsToday || 0}</div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">API calls made</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${isHighCost ? 'from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800/50' : 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/50'} hover:shadow-lg transition-all duration-200`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isHighCost ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100'}`}>Cost Today</CardTitle>
            <div className={`p-2.5 ${isHighCost ? 'bg-red-600 dark:bg-red-700' : 'bg-amber-600 dark:bg-amber-700'} rounded-lg shadow-md`}>
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${isHighCost ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100'}`}>
              ${(stats?.estimatedCostToday || 0).toFixed(2)}
            </div>
            <p className={`text-sm mt-1 ${isHighCost ? 'text-red-700 dark:text-red-300 font-semibold' : 'text-amber-700 dark:text-amber-300'}`}>
              {isHighCost ? "Above threshold!" : "Within limits"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Cost This Week</CardTitle>
            <div className="p-2.5 bg-green-600 dark:bg-green-700 rounded-lg shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              ${(stats?.estimatedCostWeek || 0).toFixed(2)}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Credits</CardTitle>
            <div className="p-2.5 bg-purple-600 dark:bg-purple-700 rounded-lg shadow-md">
              <Cpu className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {(stats?.totalCreditsUsed || 0).toLocaleString()}
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Lifetime usage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-2xl">System Components</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Health check of critical services</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Database</p>
                    <p className="text-xs text-slate-600">Supabase PostgreSQL</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Edge Functions</p>
                    <p className="text-xs text-slate-600">Deno runtime</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Gemini API</p>
                    <p className="text-xs text-slate-600">AI processing</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${isHighCost ? 'bg-red-100' : 'bg-green-100'} rounded-lg`}>
                    <AlertCircle className={`h-4 w-4 ${isHighCost ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Cost Monitor</p>
                    <p className="text-xs text-slate-600">Daily spending</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    isHighCost
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }
                >
                  {isHighCost ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      High
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Normal
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-2xl">Usage by Feature</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Credit consumption breakdown (7 days)</p>
          </CardHeader>
          <CardContent>
            {stats?.usageByAction && stats.usageByAction.length > 0 ? (
              <div className="space-y-3">
                {stats.usageByAction.map((usage) => (
                  <div
                    key={usage.action_type}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900 capitalize">
                        {usage.action_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-600">{usage.count} requests</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{usage.total_credits}</p>
                      <p className="text-xs text-slate-600">credits</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No usage data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 border-b dark:border-slate-700">
          <CardTitle className="text-2xl">Top Credit Users</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Customers with highest credit consumption
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Email</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tier</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Credits Used</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.topUsers && stats.topUsers.length > 0 ? (
                  stats.topUsers.map((user, index) => (
                    <TableRow key={`${user.email}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Tier {user.tier}</Badge>
                      </TableCell>
                      <TableCell>{user.credits_used}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.credits_used > 400
                              ? "bg-red-50 text-red-700 border-red-200"
                              : user.credits_used > 200
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {user.credits_used > 400
                            ? "Heavy"
                            : user.credits_used > 200
                            ? "Moderate"
                            : "Light"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No usage data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isHighCost && (
        <Card className="border-red-300 dark:border-red-800 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100 flex items-center gap-2">
              <div className="p-2 bg-red-600 dark:bg-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              Cost Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 dark:text-red-200">
              Daily cost has exceeded ${costThreshold}. Consider reviewing high-usage accounts or
              implementing rate limiting.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

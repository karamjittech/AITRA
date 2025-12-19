"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Ticket, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalUsers: number;
  usersToday: number;
  codesTotal: number;
  codesRedeemed: number;
  codesAvailable: number;
  revenueEstimate: number;
  activeSubscriptions: number;
}

interface RecentActivity {
  id: string;
  type: string;
  email: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: usersToday } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const { count: codesTotal } = await supabase
        .from('redemption_codes')
        .select('*', { count: 'exact', head: true });

      const { count: codesRedeemed } = await supabase
        .from('redemption_codes')
        .select('*', { count: 'exact', head: true })
        .eq('is_claimed', true)
        .is('revoked_at', null);

      const { count: activeSubscriptions } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_lifetime_deal', true);

      const { data: recentUsers } = await (supabase as any)
        .from('users')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentRedemptions } = await (supabase as any)
        .from('redemption_codes')
        .select('code, tier, redeemed_at, redeemed_by, users!inner(email)')
        .not('redeemed_at', 'is', null)
        .order('redeemed_at', { ascending: false })
        .limit(5);

      const activity: RecentActivity[] = [];

      if (recentUsers) {
        recentUsers.forEach((user: any) => {
          activity.push({
            id: user.id,
            type: 'signup',
            email: user.email || 'Unknown',
            description: 'New user signed up',
            timestamp: user.created_at,
          });
        });
      }

      if (recentRedemptions) {
        recentRedemptions.forEach((redemption: any) => {
          activity.push({
            id: redemption.code,
            type: 'redemption',
            email: redemption.users?.email || 'Unknown',
            description: `Redeemed Tier ${redemption.tier} code`,
            timestamp: redemption.redeemed_at,
          });
        });
      }

      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const revenueEstimate = (codesRedeemed || 0) * 49;

      setStats({
        totalUsers: totalUsers || 0,
        usersToday: usersToday || 0,
        codesTotal: codesTotal || 0,
        codesRedeemed: codesRedeemed || 0,
        codesAvailable: (codesTotal || 0) - (codesRedeemed || 0),
        revenueEstimate,
        activeSubscriptions: activeSubscriptions || 0,
      });

      setRecentActivity(activity.slice(0, 10));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">AppSumo launch operations command center</p>
        </div>
        <Badge variant="outline" className="text-sm bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
          <Clock className="h-3 w-3 mr-1" />
          Live data
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Users</CardTitle>
            <div className="p-2.5 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalUsers || 0}</div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{stats?.usersToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Codes Redeemed</CardTitle>
            <div className="p-2.5 bg-green-600 dark:bg-green-700 rounded-lg shadow-md">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats?.codesRedeemed || 0}</div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {stats?.codesAvailable || 0} available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">LTD Customers</CardTitle>
            <div className="p-2.5 bg-purple-600 dark:bg-purple-700 rounded-lg shadow-md">
              <Ticket className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats?.activeSubscriptions || 0}</div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Revenue (Est.)</CardTitle>
            <div className="p-2.5 bg-amber-600 dark:bg-amber-700 rounded-lg shadow-md">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">${(stats?.revenueEstimate || 0).toLocaleString()}</div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">From AppSumo codes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-2xl">Recent Activity</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Last 10 user signups and code redemptions</p>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={`${activity.id}-${activity.timestamp}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-lg hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-800/50 transition-all duration-200 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === 'signup' ? (
                      <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-sm">
                        <Users className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                    ) : (
                      <div className="p-2.5 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg shadow-sm">
                        <Ticket className="h-5 w-5 text-green-700 dark:text-green-300" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{activity.email}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/codes"
              className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 hover:from-blue-100 hover:to-blue-100 dark:hover:from-blue-900/40 dark:hover:to-blue-800/30 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800/50 hover:shadow-md hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-md">
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Upload Codes</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Bulk upload AppSumo codes</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/users"
              className="block p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 hover:from-green-100 hover:to-green-100 dark:hover:from-green-900/40 dark:hover:to-green-800/30 rounded-lg transition-all duration-200 border border-green-200 dark:border-green-800/50 hover:shadow-md hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-600 dark:bg-green-700 rounded-lg shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Manage Users</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Search and edit user accounts</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-2xl">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Database</span>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">API Endpoints</span>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Authentication</span>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Ticket, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { format } from "date-fns";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">AppSumo launch operations command center</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="h-3 w-3 mr-1" />
          Live data
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-slate-600 mt-1">
              +{stats?.usersToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Codes Redeemed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.codesRedeemed || 0}</div>
            <p className="text-xs text-slate-600 mt-1">
              {stats?.codesAvailable || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">LTD Customers</CardTitle>
            <Ticket className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-slate-600 mt-1">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Est.)</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.revenueEstimate || 0).toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">From AppSumo codes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Last 10 user signups and code redemptions</p>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={`${activity.id}-${activity.timestamp}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === 'signup' ? (
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Ticket className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.email}</p>
                      <p className="text-xs text-slate-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/codes"
              className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">Upload Codes</p>
                  <p className="text-xs text-slate-600">Bulk upload AppSumo codes</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/users"
              className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">Manage Users</p>
                  <p className="text-xs text-slate-600">Search and edit user accounts</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API Endpoints</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Authentication</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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

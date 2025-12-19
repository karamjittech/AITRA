"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Minus, TrendingUp, Coins, User } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  appsumo_tier: number;
  is_lifetime_deal: boolean;
  credits_total: number;
  credits_used: number;
  websites_limit: number;
  keywords_limit: number;
  codes_redeemed: string[];
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [newTier, setNewTier] = useState<string>("");
  const [tierChangeReason, setTierChangeReason] = useState("");
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
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

  function filterUsers() {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
  }

  async function handleCreditAdjustment() {
    if (!selectedUser || !creditAdjustment || !adjustReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide credit amount and reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseInt(creditAdjustment);
      if (isNaN(amount)) {
        throw new Error("Invalid credit amount");
      }

      const response = await fetch('/api/admin/users/adjust-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          creditChange: amount,
          reason: adjustReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      toast({
        title: "Success",
        description: `Credits adjusted: ${amount > 0 ? '+' : ''}${amount}`,
      });

      setShowCreditDialog(false);
      setCreditAdjustment("");
      setAdjustReason("");
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function handleTierChange() {
    if (!selectedUser || !newTier || !tierChangeReason.trim()) {
      toast({
        title: "Error",
        description: "Please select tier and provide reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/users/change-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          newTier: parseInt(newTier),
          reason: tierChangeReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      toast({
        title: "Success",
        description: `User tier changed to Tier ${newTier}`,
      });

      setShowTierDialog(false);
      setNewTier("");
      setTierChangeReason("");
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  function getTierBadge(tier: number, isLTD: boolean) {
    if (!isLTD || tier === 0) {
      return <Badge variant="outline">Free</Badge>;
    }

    const colors = {
      1: "bg-blue-100 text-blue-700 border-blue-200",
      2: "bg-purple-100 text-purple-700 border-purple-200",
      3: "bg-amber-100 text-amber-700 border-amber-200",
    };

    return (
      <Badge className={colors[tier as keyof typeof colors] || "bg-gray-100"}>
        LTD Tier {tier}
      </Badge>
    );
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
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-gray-100">User Manager</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Search, manage, and support customer accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Users</CardTitle>
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">LTD Customers</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {users.filter((u) => u.is_lifetime_deal).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Free Tier</CardTitle>
            <Coins className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {users.filter((u) => !u.is_lifetime_deal).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 border-b dark:border-slate-700">
          <CardTitle className="text-2xl">Search Users</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by email or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Email</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tier</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Credits</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Limits</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Joined</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{getTierBadge(user.appsumo_tier, user.is_lifetime_deal)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-amber-600" />
                          <span className="text-sm">
                            {user.credits_total - user.credits_used}/{user.credits_total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {user.websites_limit} sites / {user.keywords_limit} kw
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowCreditDialog(true);
                            }}
                          >
                            <Coins className="h-3 w-3 mr-1" />
                            Credits
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewTier(user.appsumo_tier.toString());
                              setShowTierDialog(true);
                            }}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Tier
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Credits</DialogTitle>
            <DialogDescription>
              Manual credit adjustment for{" "}
              <strong>{selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Credits
              </label>
              <div className="text-2xl font-bold">
                {selectedUser?.credits_total || 0} total,{" "}
                {(selectedUser?.credits_total || 0) - (selectedUser?.credits_used || 0)} remaining
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Credit Change (use +/- for add/subtract)
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreditAdjustment("+100")}
                  size="sm"
                >
                  +100
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreditAdjustment("+500")}
                  size="sm"
                >
                  +500
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreditAdjustment("-100")}
                  size="sm"
                >
                  -100
                </Button>
              </div>
              <Input
                placeholder="+500 or -100"
                value={creditAdjustment}
                onChange={(e) => setCreditAdjustment(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason (for audit log)
              </label>
              <Input
                placeholder="e.g., Compensation for bug, refund, etc."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreditAdjustment}
              disabled={!creditAdjustment || !adjustReason.trim()}
            >
              Adjust Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Tier</DialogTitle>
            <DialogDescription>
              Manually change tier for <strong>{selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Tier
              </label>
              <div className="text-lg font-bold">
                {selectedUser?.is_lifetime_deal
                  ? `LTD Tier ${selectedUser.appsumo_tier}`
                  : "Free"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">New Tier</label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Free (0)</SelectItem>
                  <SelectItem value="1">LTD Tier 1 - Starter</SelectItem>
                  <SelectItem value="2">LTD Tier 2 - Professional</SelectItem>
                  <SelectItem value="3">LTD Tier 3 - Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason (for audit log)
              </label>
              <Input
                placeholder="e.g., Manual upgrade, support request, etc."
                value={tierChangeReason}
                onChange={(e) => setTierChangeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTierChange}
              disabled={!newTier || !tierChangeReason.trim()}
            >
              Change Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Ticket, Upload, Search, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

interface RedemptionCode {
  id: string;
  code: string;
  tier: number;
  is_claimed: boolean;
  redeemed_by: string | null;
  redeemed_at: string | null;
  created_at: string;
  revoked_at: string | null;
  user_email?: string;
}

export default function CodesManager() {
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<RedemptionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [bulkCodes, setBulkCodes] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [revokeCode, setRevokeCode] = useState<RedemptionCode | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCodes();
  }, []);

  useEffect(() => {
    filterCodes();
  }, [codes, searchTerm, filterStatus, filterTier]);

  async function fetchCodes() {
    try {
      const { data, error } = await supabase
        .from('redemption_codes')
        .select(`
          *,
          users:redeemed_by (email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const codesWithEmail = (data || []).map((code: any) => ({
        ...code,
        user_email: code.users?.email || null,
      }));

      setCodes(codesWithEmail);
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

  function filterCodes() {
    let filtered = [...codes];

    if (searchTerm) {
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      if (filterStatus === "available") {
        filtered = filtered.filter((code) => !code.is_claimed && !code.revoked_at);
      } else if (filterStatus === "claimed") {
        filtered = filtered.filter((code) => code.is_claimed && !code.revoked_at);
      } else if (filterStatus === "revoked") {
        filtered = filtered.filter((code) => code.revoked_at !== null);
      }
    }

    if (filterTier !== "all") {
      filtered = filtered.filter((code) => code.tier === parseInt(filterTier));
    }

    setFilteredCodes(filtered);
  }

  async function handleBulkUpload() {
    if (!bulkCodes.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one code",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const codeList = bulkCodes
        .split("\n")
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code.length > 0);

      const codesToInsert = codeList.map((code) => ({
        code,
        tier: parseInt(selectedTier),
        is_claimed: false,
      }));

      const { data, error } = await (supabase as any)
        .from('redemption_codes')
        .insert(codesToInsert)
        .select();

      if (error) throw error;

      const { data: userData } = await (supabase as any)
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single();

      await (supabase as any).from('admin_actions').insert({
        admin_id: user.id,
        admin_email: userData?.email || 'unknown',
        action_type: 'code_upload',
        details: {
          codes_count: codeList.length,
          tier: parseInt(selectedTier),
        },
      });

      toast({
        title: "Success",
        description: `Uploaded ${codeList.length} codes for Tier ${selectedTier}`,
      });

      setBulkCodes("");
      fetchCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleRevoke() {
    if (!revokeCode || !revokeReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for revocation",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch('/api/admin/codes/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: revokeCode.code,
          reason: revokeReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      toast({
        title: "Success",
        description: result.message,
      });

      setRevokeCode(null);
      setRevokeReason("");
      fetchCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  const stats = {
    total: codes.length,
    available: codes.filter((c) => !c.is_claimed && !c.revoked_at).length,
    claimed: codes.filter((c) => c.is_claimed && !c.revoked_at).length,
    revoked: codes.filter((c) => c.revoked_at !== null).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">LTD Code Manager</h1>
        <p className="text-slate-600 mt-1">Upload, manage, and revoke AppSumo redemption codes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.claimed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Codes</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Paste one code per line. Format: LTD-T1-XXXX, LTD-T2-XXXX, or LTD-T3-XXXX
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Textarea
                placeholder="LTD-T1-ABC123&#10;LTD-T1-DEF456&#10;LTD-T1-GHI789"
                value={bulkCodes}
                onChange={(e) => setBulkCodes(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tier</label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tier 1 - Starter</SelectItem>
                    <SelectItem value="2">Tier 2 - Professional</SelectItem>
                    <SelectItem value="3">Tier 3 - Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleBulkUpload}
                disabled={uploading || !bulkCodes.trim()}
                className="w-full"
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Codes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Codes</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by code or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="1">Tier 1</SelectItem>
                <SelectItem value="2">Tier 2</SelectItem>
                <SelectItem value="3">Tier 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Claimed By</TableHead>
                  <TableHead>Claimed At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono text-sm">{code.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Tier {code.tier}</Badge>
                      </TableCell>
                      <TableCell>
                        {code.revoked_at ? (
                          <Badge variant="destructive">Revoked</Badge>
                        ) : code.is_claimed ? (
                          <Badge className="bg-blue-600">Claimed</Badge>
                        ) : (
                          <Badge className="bg-green-600">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {code.user_email || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {code.redeemed_at
                          ? format(new Date(code.redeemed_at), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {code.is_claimed && !code.revoked_at && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRevokeCode(code)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={revokeCode !== null} onOpenChange={() => setRevokeCode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Code</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke code <strong>{revokeCode?.code}</strong> and downgrade the user{" "}
              <strong>{revokeCode?.user_email}</strong>. This action is logged for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Reason for Revocation</label>
            <Input
              placeholder="e.g., Refund processed, Duplicate code, etc."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRevokeReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700"
              disabled={!revokeReason.trim()}
            >
              Revoke Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

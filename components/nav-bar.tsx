"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Search, TrendingUp, Home, Shield, Award, User, Settings, LogOut, Coins, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/utils/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { subscription, counts, isLoading } = useSubscription();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkAdmin(user.id);
      }
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  async function checkAdmin(userId: string) {
    const { data } = await (supabase as any)
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    setIsAdmin(data?.is_admin || false);
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const links = [
    { href: "/", label: "Analyzer", icon: Home },
    { href: "/keywords", label: "Keywords", icon: Search },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/reputation", label: "Reputation", icon: Shield },
    { href: "/authority", label: "Authority", icon: Award },
  ];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "pro":
        return <Badge className="bg-blue-600"><Zap className="h-3 w-3 mr-1" />Pro</Badge>;
      case "agency":
        return <Badge className="bg-purple-600"><Crown className="h-3 w-3 mr-1" />Agency</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 dark:bg-slate-900/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline">AI SEO Analyzer</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {user && subscription && !isLoading && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-600" />
                  <div className="text-xs">
                    <div className="font-medium">{subscription.credits_remaining}</div>
                    <div className="text-slate-500">credits</div>
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-xs">
                  <div className="font-medium">
                    {counts.websites_count}/{subscription.websites_limit} sites
                  </div>
                  <div className="text-slate-500">
                    {counts.keywords_count}/{subscription.keywords_limit} keywords
                  </div>
                </div>
              </div>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.email}</p>
                      {subscription && (
                        <div className="flex items-center gap-2 mt-1">
                          {getTierBadge(subscription.tier)}
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {subscription && (
                    <>
                      <div className="px-2 py-2">
                        <div className="text-xs font-medium mb-2">Usage This Month</div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-600 dark:text-slate-400">Credits</span>
                              <span>{subscription.credits_remaining} / {subscription.credits_total}</span>
                            </div>
                            <Progress
                              value={(subscription.credits_remaining / subscription.credits_total) * 100}
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/admin")} className="bg-red-50 text-red-700 font-medium">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/pricing")}>
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  Sign In
                </Button>
                <Button onClick={() => router.push("/signup")}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

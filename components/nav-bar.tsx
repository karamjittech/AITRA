"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Search, TrendingUp, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Analyzer", icon: Home },
    { href: "/keywords", label: "Keywords", icon: Search },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline">AI SEO Analyzer</span>
          </Link>

          <div className="flex items-center gap-1">
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

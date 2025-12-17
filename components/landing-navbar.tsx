"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              AI Reputation Engine
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-violet-600 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-violet-600 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-violet-600 transition-colors">
              Login
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button asChild className="hidden md:flex bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
              <Link href="/signup">Get Started</Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="#features"
              className="block py-2 text-sm font-medium hover:text-violet-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block py-2 text-sm font-medium hover:text-violet-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="block py-2 text-sm font-medium hover:text-violet-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Button asChild className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

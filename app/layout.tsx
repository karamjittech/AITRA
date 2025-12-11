import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { NavBar } from '@/components/nav-bar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI SEO Readiness Tool - Analyze Your Content for AI Search',
  description: 'Get instant AI readiness insights for ChatGPT, Claude, Gemini, and Perplexity. Research-backed analysis in 60 seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI SEO & Citation Tracker for ChatGPT, Perplexity & Claude',
  description: 'Track visibility, analyze sentiment, and fix your reputation in AI search. The first Reputation Engine for ChatGPT, Perplexity, and Claude. Optimize your brand for Answer Engines.',
  keywords: 'AI SEO, ChatGPT citations, Perplexity optimization, Claude visibility, AI search optimization, Answer Engine Optimization, AEO',
  openGraph: {
    title: 'AI Reputation Engine - Dominate AI Search',
    description: 'Track citations, analyze sentiment, and optimize for ChatGPT, Perplexity, Claude, and Gemini.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Reputation Engine - Dominate AI Search',
    description: 'Track citations, analyze sentiment, and optimize for AI search engines.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

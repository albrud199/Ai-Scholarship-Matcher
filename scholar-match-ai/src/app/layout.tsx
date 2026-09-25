import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ScholarMatch AI - Scholarship Application Intelligence Platform',
  description: 'Your personal scholarship operating system. Discover, match, and apply to scholarships with AI-powered intelligence.',
  keywords: ['scholarship', 'AI', 'education', 'funding', 'university', 'application'],
  authors: [{ name: 'ScholarMatch AI' }],
  creator: 'ScholarMatch AI',
  openGraph: {
    title: 'ScholarMatch AI - Scholarship Application Intelligence Platform',
    description: 'Your personal scholarship operating system.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const siteUrl = 'https://vordia.ai';
const siteTitle = 'Vordia Duo — Detachable AI Voice Recorder & Wearable';
const siteDescription =
  'Meet Vordia Duo, a detachable AI voice recorder and wearable that captures conversations, creates transcripts and summaries, and builds searchable memory.';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Vordia AI',
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  creator: 'Vordia AI',
  publisher: 'Vordia AI',
  category: 'technology',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: '/',
    siteName: 'Vordia AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Vordia AI — Remember the room. Keep moving.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

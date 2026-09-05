import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vordia.ai'),
  title: 'Vordia AI — Remember the Room. Keep Moving.',
  description:
    'Vordia Duo is a detachable AI voice wearable that turns real-world conversations into transcripts, decisions, actions, and searchable memory.',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Vordia AI — Remember the Room. Keep Moving.',
    description:
      'A detachable AI voice wearable that turns conversation into useful, searchable memory.',
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
    title: 'Vordia AI — Remember the Room. Keep Moving.',
    description:
      'A detachable AI voice wearable that turns conversation into useful, searchable memory.',
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

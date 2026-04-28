import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Echo - Learning that echoes back',
  description: 'AI-powered creative and learning tools for families. Create personalized stories, learn languages, and explore together.',
  keywords: ['children\'s books', 'AI stories', 'personalized books', 'educational content', 'language learning', 'family learning'],
  authors: [{ name: 'Echo Craft Systems' }],
  // Favicon is auto-wired from src/app/icon.svg (Next.js App Router convention).
  manifest: '/api/manifest/home',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Echo',
  },
  openGraph: {
    title: 'Echo - Learning that echoes back',
    description: 'AI-powered creative and learning tools for families',
    type: 'website',
    images: [
      {
        url: '/og/home.png',
        width: 1200,
        height: 630,
        alt: 'Echo - Learning that echoes back',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo - Learning that echoes back',
    description: 'AI-powered creative and learning tools for families',
    images: ['/og/home.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-950`}
      >
        <ServiceWorkerRegister />
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}

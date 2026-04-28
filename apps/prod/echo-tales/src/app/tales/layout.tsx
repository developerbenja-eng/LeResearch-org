export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { BRAND } from '@/lib/brand/constants';
import { EchoAgentButton } from './components/EchoAgentButton';

export const metadata: Metadata = {
  title: BRAND.hubs.tales.name,
  description: BRAND.hubs.tales.tagline,
  manifest: '/api/manifest/tales',
  themeColor: '#9333ea',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: BRAND.hubs.tales.name,
  },
  openGraph: {
    title: BRAND.hubs.tales.name,
    description: BRAND.hubs.tales.tagline,
    images: [{ url: '/og/tales.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tales.png'],
  },
};

export default function TalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <EchoAgentButton />
    </>
  );
}

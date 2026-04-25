import type { Metadata } from 'next';
import { MyceliumBackground } from '@leresearch-org/brand';
import './globals.css';
import TopNav from './TopNav';

export const metadata: Metadata = {
  title: 'LeResearch · A small contribution to the silos\'s fall',
  description:
    'LeResearch is a 501(c)(3) in formation — a small team doing cross-disciplinary research across substrates where inherited frames are part of the problem. Open by default.',
  metadataBase: new URL('https://leresearch.org'),
  openGraph: {
    title: 'LeResearch',
    description: 'A small contribution to the silos\'s fall.',
    type: 'website',
    url: 'https://leresearch.org',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* Shared LeDesign-family mycelium backdrop. Fixed, pointer-events-none, z-0. */}
        <MyceliumBackground intensity={0.6} />
        <TopNav />
        <div className="pt-14 relative z-[1]">{children}</div>
      </body>
    </html>
  );
}

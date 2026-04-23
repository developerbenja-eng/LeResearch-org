import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}

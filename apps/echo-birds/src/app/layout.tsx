import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BirdsLayout } from '@/components/BirdsLayout';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Echo Birds — Tennessee Field Guide',
  description: 'Interactive birding field guide for Tennessee. 87 species, 62 state parks, migration maps, sounds, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <BirdsLayout>{children}</BirdsLayout>
      </body>
    </html>
  );
}

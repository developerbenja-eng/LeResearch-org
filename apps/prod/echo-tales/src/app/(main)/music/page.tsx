import { Suspense } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserAlbums, getMusicStats } from '@/lib/db/music';
import {
  MusicRoomDashboard,
  MusicRoomDashboardSkeleton,
} from './components/MusicRoomDashboard';

export const metadata: Metadata = {
  title: 'Music - Echo Tales',
  description: 'Listen to personalized songs created from your storybooks.',
};

export const dynamic = 'force-dynamic';

async function MusicRoomContent() {
  // Get authenticated user
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso')?.value;

  if (!token) {
    redirect('/login?redirect=/music');
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect('/login?redirect=/music');
  }

  // Fetch albums and stats in parallel
  const [albums, stats] = await Promise.all([
    getUserAlbums(payload.userId),
    getMusicStats(payload.userId),
  ]);

  // Serialize to plain objects for Client Component
  const serializedAlbums = JSON.parse(JSON.stringify(albums));
  const serializedStats = JSON.parse(JSON.stringify(stats));

  return <MusicRoomDashboard initialAlbums={serializedAlbums} stats={serializedStats} />;
}

export default function MusicRoomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/home"
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🎵</span>
                Music Room
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Music Library
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Listen to personalized songs from your storybooks. Each album is a
            soundtrack to your family&apos;s adventures.
          </p>
        </section>

        {/* Dashboard */}
        <Suspense fallback={<MusicRoomDashboardSkeleton />}>
          <MusicRoomContent />
        </Suspense>
      </main>
    </div>
  );
}

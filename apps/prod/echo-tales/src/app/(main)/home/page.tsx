import { Suspense } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { getUniversalDb, queryOne } from '@/lib/db/turso';
import { BRAND } from '@/lib/brand/constants';
import { NavHeader } from './components/NavHeader';
import { RoomsGrid, RoomsGridSkeleton } from './components/RoomsGrid';
import { QuickActions } from './components/QuickActions';

export const metadata: Metadata = {
  title: `Home - ${BRAND.name}`,
  description: BRAND.tagline,
};

// Force dynamic rendering - requires auth check
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Check authentication on the server
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso')?.value;

  let userName: string | null = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      // Extract display name from email (part before @) or use 'Friend'
      userName = payload.email?.split('@')[0] || 'Friend';

      // Redirect hub-specific users to their hub dashboard
      if (payload.userId) {
        const userRow = await queryOne<{ enabled_hubs: string }>(
          getUniversalDb(),
          'SELECT enabled_hubs FROM users WHERE id = ?',
          [payload.userId]
        );
        if (userRow?.enabled_hubs === 'tales') {
          redirect('/tales/home');
        }
        if (userRow?.enabled_hubs === 'learn') {
          redirect('/learn/home');
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation Header */}
      <NavHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Hero Section */}
        <section className="text-center mb-8 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            <span>✨</span>
            {BRAND.tagline}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {userName ? `Welcome Back, ${userName}!` : `Welcome to ${BRAND.name}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {userName
              ? 'Continue your creative and learning journey — explore your hubs below.'
              : 'AI-powered creative and learning tools for families. Explore our two hubs below.'}
          </p>
        </section>

        {/* Rooms Grid with Suspense for parallel data fetching */}
        <Suspense fallback={<RoomsGridSkeleton />}>
          <RoomsGrid />
        </Suspense>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}

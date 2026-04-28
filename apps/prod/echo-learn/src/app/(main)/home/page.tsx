import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { readSsoSession } from '@leresearch-org/identity/server';
import { BRAND } from '@/lib/brand/constants';
import { NavHeader } from './components/NavHeader';
import { RoomsGrid, RoomsGridSkeleton } from './components/RoomsGrid';
import { QuickActions } from './components/QuickActions';

export const metadata: Metadata = {
  title: `Home - ${BRAND.name}`,
  description: BRAND.tagline,
};

export const dynamic = 'force-dynamic';

const APP_ID = process.env.LEDESIGN_APP_ID ?? 'echo-learn';
const AUTH_ORIGIN = process.env.LEDESIGN_AUTH_ORIGIN ?? 'https://auth.ledesign.ai';

export default async function HomePage() {
  const session = await readSsoSession();

  // Unauthenticated — bounce to the central login, return here after.
  if (!session) {
    const url = new URL('/login', AUTH_ORIGIN);
    url.searchParams.set('app', APP_ID);
    url.searchParams.set('redirect', '/home');
    redirect(url.toString());
  }

  // Signed in but not granted this app — nudge to central /register which
  // handles the grant, then sends them back.
  if (!session.apps.includes(APP_ID)) {
    const url = new URL('/register', AUTH_ORIGIN);
    url.searchParams.set('app', APP_ID);
    url.searchParams.set('redirect', '/home');
    redirect(url.toString());
  }

  const userName = session.name || session.email.split('@')[0] || 'Friend';

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

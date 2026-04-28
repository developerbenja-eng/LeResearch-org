import { Suspense } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserStats } from '@/lib/db/stats';
import { getUniversalDb, queryOne } from '@/lib/db/turso';
import { BRAND, ICONS } from '@/lib/brand/constants';
import { TalesNavHeader } from '@/app/(main)/tales/components/TalesNavHeader';
import { RoomCard, RoomCardSkeleton } from '@/app/(main)/home/components/RoomCard';
import { AnimatedSection, StaggerGrid, StaggerItem } from '@/components/ui';
import { QuickActions } from '@/app/(main)/home/components/QuickActions';

export const metadata: Metadata = {
  title: `Dashboard - ${BRAND.hubs.tales.name}`,
  description: 'Your Echo Tales creative dashboard',
};

export const dynamic = 'force-dynamic';

/* ------ Async stat cards ------ */
async function PlayRoomCard({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);
  return (
    <RoomCard
      href="/play"
      iconUrl={ICONS.talesStories}
      title="Play Room"
      description="Create personalized AI-generated storybooks"
      stats={[
        { value: stats.booksCount, label: 'Books' },
        { value: stats.charactersCount, label: 'Characters' },
      ]}
      colorClass={BRAND.tales.stories.gradient}
    />
  );
}

async function MusicRoomCard({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);
  return (
    <RoomCard
      href="/music"
      iconUrl={ICONS.talesMusic}
      title="Music Room"
      description="Generate songs and soundtracks from your stories"
      stats={[
        { value: stats.songsCount, label: 'Songs' },
        { value: stats.albumsCount, label: 'Albums' },
      ]}
      colorClass={BRAND.tales.music.gradient}
    />
  );
}

function ResearchCard() {
  return (
    <RoomCard
      href="/research"
      iconUrl={ICONS.talesResearch}
      title="Parents Playground"
      description="Evidence-based parenting insights & research"
      stats={[
        { value: '1000+', label: 'Topics' },
        { value: 'AI', label: 'Insights' },
      ]}
      colorClass={BRAND.tales.research.gradient}
    />
  );
}

function CraftRoomCard() {
  return (
    <RoomCard
      href="/store"
      iconUrl={ICONS.talesCraft}
      title="Craft Room"
      description="Physical books, coloring pages & more"
      stats={[
        { value: 'Print', label: 'Books' },
        { value: 'Ship', label: 'Worldwide' },
      ]}
      colorClass={BRAND.tales.craft.gradient}
    />
  );
}

export default async function TalesDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso')?.value;

  let userId: string | null = null;
  let userName = 'Friend';

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId || null;
      // Try to get the user's actual name from DB
      const user = await queryOne<{ name: string | null }>(
        getUniversalDb(),
        'SELECT name FROM users WHERE id = ?',
        [payload.userId]
      );
      userName = user?.name || payload.email?.split('@')[0] || 'Friend';
    }
  }

  if (!userId) {
    redirect('/tales/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <TalesNavHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <AnimatedSection>
          <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-500 p-8 sm:p-10 text-white">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <path d="M0,100 Q100,20 200,80 T400,60 T600,90 T800,40 V200 H0 Z" fill="white"/>
                <path d="M0,120 Q150,60 300,100 T600,70 T800,90 V200 H0 Z" fill="white" opacity="0.5"/>
              </svg>
            </div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4">
                <span>✨</span>
                {BRAND.hubs.tales.tagline}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Welcome back, {userName}!
              </h1>
              <p className="text-white/80 max-w-lg mx-auto text-lg">
                Pick a room to continue creating stories, music, and more for your family.
              </p>
            </div>
          </section>
        </AnimatedSection>

        {/* 4 Main Rooms */}
        <StaggerGrid className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto mb-10">
          <StaggerItem className="w-full sm:w-[calc(50%-12px)]">
            <Suspense fallback={<RoomCardSkeleton />}>
              <PlayRoomCard userId={userId!} />
            </Suspense>
          </StaggerItem>

          <StaggerItem className="w-full sm:w-[calc(50%-12px)]">
            <Suspense fallback={<RoomCardSkeleton />}>
              <MusicRoomCard userId={userId!} />
            </Suspense>
          </StaggerItem>

          <StaggerItem className="w-full sm:w-[calc(50%-12px)]">
            <ResearchCard />
          </StaggerItem>

          <StaggerItem className="w-full sm:w-[calc(50%-12px)]">
            <CraftRoomCard />
          </StaggerItem>
        </StaggerGrid>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}

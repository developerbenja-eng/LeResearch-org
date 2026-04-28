import { Suspense } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserStats } from '@/lib/db/stats';
import { BRAND } from '@/lib/brand/constants';
import { TalesNavHeader } from './components/TalesNavHeader';
import { RoomCard, RoomCardSkeleton } from '../(main)/home/components/RoomCard';
import { AnimatedSection, StaggerGrid, StaggerItem } from '@/components/ui';
import {
  TalesHeroSection,
  TransformationShowcase,
  BookExplorer,
  ParentPlayground,
  ScreenFreeSolutions,
  PodcastShowcase,
} from '@/components/landing';

export const metadata: Metadata = {
  title: `${BRAND.hubs.tales.name} - ${BRAND.name}`,
  description: BRAND.hubs.tales.tagline,
};

export const dynamic = 'force-dynamic';

async function TalesStats({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);
  return { booksCount: stats.booksCount, songsCount: stats.songsCount, charactersCount: stats.charactersCount };
}

async function StoriesCard({ userId }: { userId: string | null }) {
  const stats = userId ? await TalesStats({ userId }) : null;

  return (
    <RoomCard
      href="/play"
      iconUrl={BRAND.tales.stories.icon}
      title={BRAND.tales.stories.name}
      description={BRAND.tales.stories.description}
      stats={[
        { value: stats?.booksCount ?? '-', label: 'Books' },
        { value: stats?.charactersCount ?? '-', label: 'Characters' },
      ]}
      colorClass={BRAND.tales.stories.gradient}
    />
  );
}

async function MusicCard({ userId }: { userId: string | null }) {
  const stats = userId ? await TalesStats({ userId }) : null;

  return (
    <RoomCard
      href="/music"
      iconUrl={BRAND.tales.music.icon}
      title={BRAND.tales.music.name}
      description={BRAND.tales.music.description}
      stats={[
        { value: stats?.songsCount ?? '-', label: 'Songs' },
        { value: 'AI', label: 'Generated' },
      ]}
      colorClass={BRAND.tales.music.gradient}
    />
  );
}

function CharactersCard() {
  return (
    <RoomCard
      href="/play?tab=characters"
      iconUrl={BRAND.tales.characters.icon}
      title={BRAND.tales.characters.name}
      description={BRAND.tales.characters.description}
      stats={[
        { value: 'AI', label: 'Generated' },
        { value: 'Custom', label: 'Upload' },
      ]}
      colorClass={BRAND.tales.characters.gradient}
    />
  );
}

function ResearchCard() {
  return (
    <RoomCard
      href="/research"
      iconUrl={BRAND.tales.research.icon}
      title={BRAND.tales.research.name}
      description={BRAND.tales.research.description}
      stats={[
        { value: '1000+', label: 'Topics' },
        { value: 'AI', label: 'Insights' },
      ]}
      colorClass={BRAND.tales.research.gradient}
    />
  );
}

function CommunityCard() {
  return (
    <RoomCard
      href="/community"
      iconUrl={BRAND.tales.community.icon}
      title={BRAND.tales.community.name}
      description={BRAND.tales.community.description}
      stats={[
        { value: 'Share', label: 'Stories' },
        { value: 'Connect', label: 'Families' },
      ]}
      colorClass={BRAND.tales.community.gradient}
    />
  );
}

export default async function TalesHubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso')?.value;
  let userId: string | null = null;
  let userName: string | null = null;

  if (token) {
    const payload = verifyToken(token);
    userId = payload?.userId || null;
    userName = payload?.email?.split('@')[0] || null;
  }

  const isAuthenticated = !!userId;

  return (
    <div className="min-h-screen bg-theme">
      <TalesNavHeader />

      {/* Tales Hero Section */}
      <TalesHeroSection userName={userName} isAuthenticated={isAuthenticated} />

      {/* Features Grid */}
      <section className="relative z-10 -mt-12 pt-16 pb-12 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-sm font-medium px-3 py-1 rounded-full mb-3">
                5 creative tools
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-theme-primary mb-2">
                Choose Your Creative Tool
              </h2>
              <p className="text-theme-secondary max-w-lg mx-auto">
                Bring stories to life with AI-powered creative tools built for families.
              </p>
            </div>
          </AnimatedSection>
          <StaggerGrid className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            <StaggerItem className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <Suspense fallback={<RoomCardSkeleton />}>
                <StoriesCard userId={userId} />
              </Suspense>
            </StaggerItem>

            <StaggerItem className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <Suspense fallback={<RoomCardSkeleton />}>
                <MusicCard userId={userId} />
              </Suspense>
            </StaggerItem>

            <StaggerItem className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"><CharactersCard /></StaggerItem>
            <StaggerItem className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"><ResearchCard /></StaggerItem>
            <StaggerItem className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"><CommunityCard /></StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* Photo to Illustration Transformation */}
      <TransformationShowcase />

      {/* Interactive Book Explorer */}
      <BookExplorer />

      {/* Parent Playground Preview */}
      <ParentPlayground />

      {/* Screen-Free Solutions */}
      <ScreenFreeSolutions />

      {/* Podcast Showcase */}
      <PodcastShowcase />
    </div>
  );
}

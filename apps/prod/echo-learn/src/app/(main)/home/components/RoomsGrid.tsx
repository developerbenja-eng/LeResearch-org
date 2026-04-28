import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserStats } from '@/lib/db/stats';
import { BRAND, ICONS } from '@/lib/brand/constants';
import { RoomCard, RoomCardSkeleton } from './RoomCard';
import { ChevronRight } from 'lucide-react';

// Async component that fetches user stats
async function PlayRoomStats({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);

  return (
    <RoomCard
      href="/play"
      iconUrl={ICONS.playRoom}
      title={BRAND.tales.stories.name}
      description={BRAND.tales.stories.description}
      stats={[
        { value: stats.booksCount, label: 'Books' },
        { value: stats.charactersCount, label: 'Characters' },
      ]}
      colorClass={BRAND.tales.stories.gradient}
    />
  );
}

async function MusicRoomStats({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);

  return (
    <RoomCard
      href="/music"
      iconUrl={ICONS.musicRoom}
      title={BRAND.tales.music.name}
      description={BRAND.tales.music.description}
      stats={[
        { value: stats.songsCount, label: 'Songs' },
        { value: stats.albumsCount, label: 'Albums' },
      ]}
      colorClass={BRAND.tales.music.gradient}
    />
  );
}

// Hub Card Component
interface HubCardProps {
  href: string;
  icon: string;
  name: string;
  tagline: string;
  gradient: string;
  features: string[];
}

function HubCard({ href, icon, name, tagline, gradient, features }: HubCardProps) {
  return (
    <Link href={href} className="group block">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15),0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2),0_16px_48px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}>
        {/* Background pattern with improved styling */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-sm" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white rounded-full blur-sm" />
          <div className="absolute right-1/4 bottom-1/4 w-20 h-20 bg-white rounded-full blur-md" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
              <Image
                src={icon}
                alt={name}
                fill
                className="object-contain p-1 drop-shadow-sm"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight drop-shadow-sm">{name}</h3>
              <p className="text-sm text-white/85 font-medium">{tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {features.map((feature) => (
              <span key={feature} className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                {feature}
              </span>
            ))}
          </div>

          <div className="flex items-center text-sm font-semibold text-white/95 group-hover:text-white">
            Explore {name}
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function RoomsGrid() {
  // Get user from cookie/token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let userId: string | null = null;

  if (token) {
    const payload = verifyToken(token);
    userId = payload?.userId || null;
  }

  return (
    <section className="mb-8">
      {/* Two Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <HubCard
          href="/tales"
          icon={ICONS.playRoom}
          name={BRAND.hubs.tales.name}
          tagline={BRAND.hubs.tales.tagline}
          gradient={BRAND.hubs.tales.gradient}
          features={['Stories', 'Music', 'Characters', 'Research', 'Community']}
        />
        <HubCard
          href="/learn"
          icon={ICONS.reader}
          name={BRAND.hubs.learn.name}
          tagline={BRAND.hubs.learn.tagline}
          gradient={BRAND.hubs.learn.gradient}
          features={['Echo Lingua', 'Echo Reader', 'Sophia', 'Echo Sounds']}
        />
      </div>

      {/* Quick Access Grid */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Play-Room with user stats - wrapped in Suspense */}
        {userId ? (
          <Suspense fallback={<RoomCardSkeleton />}>
            <PlayRoomStats userId={userId} />
          </Suspense>
        ) : (
          <RoomCard
            href="/play"
            iconUrl={ICONS.playRoom}
            title={BRAND.tales.stories.name}
            description={BRAND.tales.stories.description}
            stats={[
              { value: '-', label: 'Books' },
              { value: '-', label: 'Characters' },
            ]}
            colorClass={BRAND.tales.stories.gradient}
          />
        )}

        {/* Music Room with user stats - wrapped in Suspense */}
        {userId ? (
          <Suspense fallback={<RoomCardSkeleton />}>
            <MusicRoomStats userId={userId} />
          </Suspense>
        ) : (
          <RoomCard
            href="/music"
            iconUrl={ICONS.musicRoom}
            title={BRAND.tales.music.name}
            description={BRAND.tales.music.description}
            stats={[
              { value: '-', label: 'Songs' },
              { value: '-', label: 'Albums' },
            ]}
            colorClass={BRAND.tales.music.gradient}
          />
        )}

        {/* Echo Lingua */}
        <RoomCard
          href="/lingua"
          iconUrl={ICONS.lingua}
          title={BRAND.learn.lingua.name}
          description={BRAND.learn.lingua.description}
          stats={[
            { value: 'AI', label: 'Tutor' },
            { value: 'SRS', label: 'Review' },
          ]}
          colorClass={BRAND.learn.lingua.gradient}
        />

        {/* Echo Reader */}
        <RoomCard
          href="/reader/library"
          iconUrl={ICONS.reader}
          title={BRAND.learn.reader.name}
          description={BRAND.learn.reader.description}
          stats={[
            { value: 'PDF', label: 'Upload' },
            { value: 'TTS', label: 'Audio' },
          ]}
          colorClass={BRAND.learn.reader.gradient}
        />

        {/* Research */}
        <RoomCard
          href="/research"
          iconUrl={ICONS.research}
          title={BRAND.tales.research.name}
          description={BRAND.tales.research.description}
          stats={[
            { value: '1000+', label: 'Articles' },
            { value: '24/7', label: 'Access' },
          ]}
          colorClass={BRAND.tales.research.gradient}
        />

        {/* Community */}
        <RoomCard
          href="/community"
          iconUrl={ICONS.research}
          title={BRAND.tales.community.name}
          description={BRAND.tales.community.description}
          stats={[
            { value: 'Share', label: 'Stories' },
            { value: 'Connect', label: 'Families' },
          ]}
          colorClass={BRAND.tales.community.gradient}
        />
      </div>
    </section>
  );
}

// Skeleton grid for loading state
export function RoomsGridSkeleton() {
  return (
    <section className="mb-8">
      {/* Hub Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl animate-shimmer shadow-[0_4px_20px_rgba(0,0,0,0.08)]" />
        <div className="h-48 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl animate-shimmer shadow-[0_4px_20px_rgba(0,0,0,0.08)]" />
      </div>

      <div className="mb-4">
        <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-shimmer mb-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RoomCardSkeleton />
        <RoomCardSkeleton />
        <RoomCardSkeleton />
        <RoomCardSkeleton />
        <RoomCardSkeleton />
        <RoomCardSkeleton />
      </div>
    </section>
  );
}

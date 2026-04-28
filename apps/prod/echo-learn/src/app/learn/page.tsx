import { Metadata } from 'next';
import { BRAND } from '@/lib/brand/constants';
import { NavHeader } from '../(main)/home/components/NavHeader';
import { RoomCard } from '../(main)/home/components/RoomCard';
import { AnimatedSection, StaggerGrid, StaggerItem } from '@/components/ui';
import {
  LearnHeroSection,
  LinguaShowcase,
  ReaderShowcase,
  SophiaShowcase,
  MusicLearningShowcase,
} from '@/components/landing';

export const metadata: Metadata = {
  title: `${BRAND.hubs.learn.name} - ${BRAND.name}`,
  description: BRAND.hubs.learn.tagline,
};

export const dynamic = 'force-dynamic';

function EchoLinguaCard() {
  return (
    <RoomCard
      href="/lingua"
      iconUrl={BRAND.learn.lingua.icon}
      title={BRAND.learn.lingua.name}
      description={BRAND.learn.lingua.description}
      stats={[
        { value: 'AI', label: 'Tutor' },
        { value: 'SRS', label: 'Review' },
      ]}
      colorClass={BRAND.learn.lingua.gradient}
    />
  );
}

function EchoReaderCard() {
  return (
    <RoomCard
      href="/reader/library"
      iconUrl={BRAND.learn.reader.icon}
      title={BRAND.learn.reader.name}
      description={BRAND.learn.reader.description}
      stats={[
        { value: 'PDF', label: 'Upload' },
        { value: 'TTS', label: 'Audio' },
      ]}
      colorClass={BRAND.learn.reader.gradient}
    />
  );
}

function SophiaCard() {
  return (
    <RoomCard
      href="/sophia"
      iconUrl={BRAND.learn.sophia.icon}
      title={BRAND.learn.sophia.name}
      description={BRAND.learn.sophia.description}
      stats={[
        { value: '50+', label: 'Thinkers' },
        { value: 'Video', label: 'Lessons' },
      ]}
      colorClass={BRAND.learn.sophia.gradient}
    />
  );
}

function EchoSoundsCard() {
  return (
    <RoomCard
      href="/learn/music"
      iconUrl={BRAND.learn.sounds.icon}
      title={BRAND.learn.sounds.name}
      description={BRAND.learn.sounds.description}
      stats={[
        { value: 'Visual', label: 'Lessons' },
        { value: 'Piano', label: 'Roll' },
      ]}
      colorClass={BRAND.learn.sounds.gradient}
    />
  );
}

function EchoNourishCard() {
  return (
    <RoomCard
      href="/learn/nutrition"
      iconUrl={BRAND.learn.nourish.icon}
      title={BRAND.learn.nourish.name}
      description={BRAND.learn.nourish.description}
      stats={[
        { value: 'History', label: 'of Science' },
        { value: 'How', label: 'We Know' },
      ]}
      colorClass={BRAND.learn.nourish.gradient}
    />
  );
}

function EchoAlchemyCard() {
  return (
    <RoomCard
      href="/learn/alchemy"
      iconUrl={BRAND.learn.alchemy.icon}
      title={BRAND.learn.alchemy.name}
      description={BRAND.learn.alchemy.description}
      stats={[
        { value: 'Food', label: 'Science' },
        { value: 'Global', label: 'Cuisines' },
      ]}
      colorClass={BRAND.learn.alchemy.gradient}
    />
  );
}

function AnatomyHallCard() {
  return (
    <RoomCard
      href="/learn/anatomy"
      iconUrl={BRAND.learn.anatomy.icon}
      title={BRAND.learn.anatomy.name}
      description={BRAND.learn.anatomy.description}
      stats={[
        { value: '3D', label: 'Interactive' },
        { value: '11', label: 'Systems' },
      ]}
      colorClass={BRAND.learn.anatomy.gradient}
    />
  );
}

function EchoOriginsCard() {
  return (
    <RoomCard
      href="/learn/origins"
      iconUrl={BRAND.learn.origins.icon}
      title={BRAND.learn.origins.name}
      description={BRAND.learn.origins.description}
      stats={[
        { value: '6', label: 'Timelines' },
        { value: '6', label: 'Thinkers' },
      ]}
      colorClass={BRAND.learn.origins.gradient}
    />
  );
}

export default function LearnHubPage() {
  return (
    <div className="min-h-screen bg-theme">
      <NavHeader />

      {/* Learn Hero Section — reads auth from AuthContext */}
      <LearnHeroSection />

      {/* Features Grid */}
      <section className="relative z-10 -mt-12 pt-16 pb-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full mb-3">
                8 learning tools
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-theme-primary mb-2">
                Choose Your Learning Path
              </h2>
              <p className="text-theme-secondary max-w-lg mx-auto">
                Each tool is designed to make learning engaging, personal, and effective.
              </p>
            </div>
          </AnimatedSection>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <StaggerItem><EchoLinguaCard /></StaggerItem>
            <StaggerItem><EchoReaderCard /></StaggerItem>
            <StaggerItem><SophiaCard /></StaggerItem>
            <StaggerItem><EchoSoundsCard /></StaggerItem>
            <StaggerItem><EchoNourishCard /></StaggerItem>
            <StaggerItem><EchoAlchemyCard /></StaggerItem>
            <StaggerItem><AnatomyHallCard /></StaggerItem>
            <StaggerItem><EchoOriginsCard /></StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* Lingua Showcase - Language Learning */}
      <LinguaShowcase />

      {/* Reader Showcase - Academic Papers */}
      <ReaderShowcase />

      {/* Sophia Showcase - Philosophy */}
      <SophiaShowcase />

      {/* Echo Sounds Showcase - Music Learning */}
      <MusicLearningShowcase />
    </div>
  );
}

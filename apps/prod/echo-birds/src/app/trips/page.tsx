import Link from 'next/link';
import { Metadata } from 'next';
import { Plane, Star } from 'lucide-react';
import {
  TN_STATE_PARKS,
  REGION_LABELS,
  type TripGuide,
  type TripRegion,
} from '@/lib/tripGuides';

export const metadata: Metadata = {
  title: 'TN State Parks Trip Guides — Memphis Birds',
  description:
    'Birding trip guides for all 62 Tennessee state parks, organized by region and ecoregion — from the Mississippi Flyway to the Southern Appalachians.',
};

export default function TripsIndexPage() {
  const byRegion: Record<TripRegion, TripGuide[]> = {
    west: TN_STATE_PARKS.filter((p) => p.region === 'west'),
    middle: TN_STATE_PARKS.filter((p) => p.region === 'middle'),
    east: TN_STATE_PARKS.filter((p) => p.region === 'east'),
  };

  // Within each region, sort by priority desc then by name
  for (const r of Object.keys(byRegion) as TripRegion[]) {
    byRegion[r].sort(
      (a, b) => b.priority - a.priority || a.name.localeCompare(b.name),
    );
  }

  const topPicks = TN_STATE_PARKS.filter((p) => p.priority === 5);
  const writtenCount = TN_STATE_PARKS.filter((p) => p.hasGuide).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <Plane className="w-6 h-6 text-violet-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Tennessee State Parks
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Birding trip guides for all 62 TN state parks. Different ecoregions
            across the state host completely different bird communities — from
            Memphis's Mississippi Flyway to Roan Mountain's 6,000-ft spruce-fir.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {writtenCount} of {TN_STATE_PARKS.length} have full guides written.
            Expanding over time.
          </p>
        </div>
      </header>

      {/* Top picks */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
            Top birding picks
          </h2>
          <span className="text-xs text-slate-400">
            ({topPicks.length} must-visit parks)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topPicks
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => (
              <TripCard key={p.slug} trip={p} />
            ))}
        </div>
      </section>

      {/* By region */}
      {(['west', 'middle', 'east'] as const).map((region) => {
        const parks = byRegion[region];
        if (parks.length === 0) return null;
        return (
          <section key={region} className="mb-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">
              {REGION_LABELS[region]}{' '}
              <span className="text-slate-500">({parks.length} parks)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {parks.map((p) => (
                <TripCard key={p.slug} trip={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TripCard({ trip }: { trip: TripGuide }) {
  const stars = '★'.repeat(trip.priority);
  return (
    <Link
      href={trip.hasGuide ? `/trips/${trip.slug}` : '#'}
      aria-disabled={!trip.hasGuide}
      className={`group block p-4 rounded-xl border transition-colors ${
        trip.hasGuide
          ? 'border-slate-800 bg-slate-900/60 hover:border-violet-500/40 hover:bg-slate-900'
          : 'border-slate-800/60 bg-slate-900/30 cursor-default'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3
          className={`text-base font-semibold ${
            trip.hasGuide
              ? 'text-white group-hover:text-violet-300 transition-colors'
              : 'text-slate-300'
          }`}
        >
          {trip.name}
        </h3>
        <span
          className="text-[10px] text-amber-300/80 shrink-0 leading-tight mt-0.5"
          title={`Birding priority ${trip.priority}/5`}
        >
          {stars}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-2">
        {trip.county} County &middot; {trip.acres.toLocaleString()} acres
        &middot; {trip.driveFromMemphis}
      </p>
      <p className="text-xs text-slate-300 leading-snug mb-3 line-clamp-2">
        {trip.tagline}
      </p>
      <div className="flex flex-wrap gap-1">
        {trip.signatureBirds.slice(0, 3).map((b) => (
          <span
            key={b}
            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-300"
          >
            {b}
          </span>
        ))}
      </div>
      {trip.hasGuide && (
        <div className="mt-3 text-[11px] text-violet-300">Guide →</div>
      )}
      {!trip.hasGuide && (
        <div className="mt-3 text-[11px] text-slate-400 italic">
          Guide coming soon
        </div>
      )}
    </Link>
  );
}

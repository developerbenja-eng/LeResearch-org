import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, MapPin, Clock, Mountain } from 'lucide-react';
import {
  TN_STATE_PARKS,
  getTripBySlug,
  REGION_LABELS,
  ECOREGION_LABELS,
} from '@/lib/tripGuides';
import { getHotspotBySlug } from '@/lib/hotspots';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { SpeciesCard } from '@/components/SpeciesCard';
import { HotspotDetailMap } from '@/components/HotspotDetailMap';
import { RecentSightings } from '@/components/RecentSightings';

export async function generateStaticParams() {
  return TN_STATE_PARKS.filter((p) => p.hasGuide).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return { title: 'Trip not found' };
  return {
    title: `${trip.name} — TN State Park Trip Guide`,
    description: trip.tagline,
  };
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip || !trip.hasGuide) notFound();

  // If the trip corresponds to an existing Hotspot (e.g. Montgomery Bell),
  // reuse the hotspot detail data (map + species) for continuity.
  const hotspot = getHotspotBySlug(trip.slug);
  const allSpecies = loadAllSpecies();
  const targetSpecies = hotspot
    ? allSpecies.filter((s) => s.memphisHotspots.includes(hotspot.id))
    : [];

  const priorityLabel =
    trip.priority === 5
      ? 'Must-visit'
      : trip.priority === 4
        ? 'Excellent'
        : trip.priority === 3
          ? 'Good'
          : trip.priority === 2
            ? 'Secondary'
            : 'Historic interest';

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors py-2 pr-2"
        >
          <ArrowLeft className="w-4 h-4" /> All trip guides
        </Link>
      </div>

      {/* Header */}
      <header className="px-4 mt-4 mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-200 border border-violet-500/30">
            {REGION_LABELS[trip.region]}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {ECOREGION_LABELS[trip.ecoregion]}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30"
            title={`Priority ${trip.priority}/5`}
          >
            {'★'.repeat(trip.priority)} {priorityLabel}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{trip.name}</h1>
        <p className="mt-2 md:mt-3 text-slate-300 max-w-3xl leading-relaxed">
          {trip.tagline}
        </p>
      </header>

      {/* Stats */}
      <section className="px-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<MapPin className="w-4 h-4 text-violet-300" />}
          label="County"
          value={trip.county}
        />
        <StatCard
          icon={<Mountain className="w-4 h-4 text-emerald-300" />}
          label="Acreage"
          value={trip.acres.toLocaleString()}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-sky-300" />}
          label="From Memphis"
          value={trip.driveFromMemphis}
        />
        <StatCard label="Habitat" value={trip.habitat.slice(0, 30)} subtitle={trip.habitat} />
      </section>

      {/* Map (if this trip has coords + is big enough) */}
      {hotspot && (
        <div className="px-4 mt-6">
          <HotspotDetailMap hotspot={hotspot} height={360} zoom={11} />
        </div>
      )}

      {/* Two columns: target species + live sightings */}
      <div className="mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {targetSpecies.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300 mb-4">
                Target species
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {targetSpecies.map((s) => (
                  <SpeciesCard key={s.slug} species={s} />
                ))}
              </div>
            </section>
          )}

          {/* Signature-birds chip list (for trips without hotspot species data) */}
          {targetSpecies.length === 0 && trip.signatureBirds.length > 0 && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300 mb-3">
                Signature birds
              </h2>
              <ul className="flex flex-wrap gap-2">
                {trip.signatureBirds.map((b) => (
                  <li
                    key={b}
                    className="text-sm px-3 py-1.5 rounded-full bg-slate-800/60 text-slate-200 border border-slate-700"
                  >
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-400 italic">
                Full guide + per-species profiles coming.
              </p>
            </section>
          )}
        </div>

        {/* Sidebar: live eBird data */}
        <aside>
          <RecentSightings
            lat={trip.coords[1]}
            lng={trip.coords[0]}
            dist={5}
            back={14}
            limit={10}
            title={`Recent at ${trip.name.split(' ').slice(0, 2).join(' ')}`}
          />
        </aside>
      </div>

      {/* Pointer to markdown guide */}
      {trip.hasGuide && (
        <section className="mt-10 mx-4 p-4 rounded-xl border border-violet-500/30 bg-violet-950/20">
          <p className="text-sm text-slate-300">
            <span className="text-violet-300 font-semibold">Full written guide:</span>{' '}
            See{' '}
            <code className="text-amber-300">
              content/trips/{trip.slug}.md
            </code>{' '}
            in the repo for habitat breakdown, trail picks, species-by-species
            reasoning, and April timing notes.
          </p>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-xl border border-slate-800 bg-slate-900/50 p-3"
      title={subtitle}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className="text-base md:text-xl font-bold text-white truncate">
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</div>
      )}
    </div>
  );
}

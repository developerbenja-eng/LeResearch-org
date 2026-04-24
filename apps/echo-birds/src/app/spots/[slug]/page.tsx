import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import {
  HOTSPOTS,
  getHotspotBySlug,
} from '@/lib/hotspots';
import { getSpeciesByIds, loadAllSpecies } from '@/lib/loadSpecies';
import { MONTH_NAMES } from '@/lib/types';
import { currentMonth1Based } from '@/lib/queries';
import { SpeciesCard } from '@/components/SpeciesCard';
import { HotspotDetailMap } from '@/components/HotspotDetailMap';
import { RecentSightings } from '@/components/RecentSightings';
import { HotspotSpecies } from '@/components/HotspotSpecies';

export async function generateStaticParams() {
  return HOTSPOTS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const h = getHotspotBySlug(slug);
  if (!h) return { title: 'Spot not found' };
  return {
    title: `${h.name} — Memphis Birds`,
    description: h.description,
  };
}

export default async function HotspotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotspot = getHotspotBySlug(slug);
  if (!hotspot) notFound();

  const allSpecies = loadAllSpecies();
  const sciNameToSlug: Record<string, string> = {};
  for (const s of allSpecies) {
    sciNameToSlug[s.scientificName] = s.slug;
  }
  const signatureSpecies = getSpeciesByIds(hotspot.signatureSpecies);
  const allAtSpot = allSpecies.filter((s) =>
    s.memphisHotspots.includes(hotspot.id),
  );
  const otherSpecies = allAtSpot.filter(
    (s) => !hotspot.signatureSpecies.includes(s.id),
  );
  const currentMonth = currentMonth1Based();
  const isBestNow = hotspot.bestMonths.includes(currentMonth);
  const isBig5 = hotspot.tier === 'big-5';

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link
          href="/spots"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors py-2 pr-2"
        >
          <ArrowLeft className="w-4 h-4" /> All spots
        </Link>
      </div>

      {/* Header */}
      <header className="px-4 mt-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isBig5
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                : 'bg-sky-500/20 text-sky-200 border border-sky-500/30'
            }`}
          >
            {isBig5 ? 'Big 5' : 'Spot'}
          </span>
          <span className="text-xs text-slate-400">{hotspot.neighborhood}</span>
          {isBestNow && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 ml-auto">
              Good right now
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {hotspot.name}
        </h1>
        <p className="mt-2 md:mt-3 text-slate-300 max-w-3xl leading-relaxed">
          {hotspot.description}
        </p>
      </header>

      {/* Map */}
      <div className="px-4">
        <HotspotDetailMap hotspot={hotspot} height={360} />
      </div>

      {/* Stats row */}
      <section className="px-4 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="w-4 h-4 text-sky-300" />}
          label="Species here"
          value={allAtSpot.length}
        />
        <StatCard
          icon={<Calendar className="w-4 h-4 text-emerald-300" />}
          label="Best months"
          value={hotspot.bestMonths.length}
          subtitle={hotspot.bestMonths.map((m) => MONTH_NAMES[m - 1]).join(' · ')}
        />
        <StatCard
          icon={<MapPin className="w-4 h-4 text-amber-300" />}
          label="Access"
          value={hotspot.access.split('·')[0].trim()}
        />
        <StatCard
          label="Habitat"
          value={hotspot.habitats.length}
          subtitle={hotspot.habitats
            .map((h) => h.replace(/-/g, ' '))
            .join(' · ')}
        />
      </section>

      {/* Two columns: main species + live sightings */}
      <div className="mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          {signatureSpecies.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300 mb-4">
                Signature birds
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {signatureSpecies.map((s) => (
                  <SpeciesCard key={s.slug} species={s} />
                ))}
              </div>
            </section>
          )}

          {otherSpecies.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">
                Also seen here
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {otherSpecies.map((s) => (
                  <SpeciesCard key={s.slug} species={s} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <HotspotSpecies
            lat={hotspot.coords[1]}
            lng={hotspot.coords[0]}
            dist={3}
            back={30}
            sciNameToSlug={sciNameToSlug}
          />

          <RecentSightings
            lat={hotspot.coords[1]}
            lng={hotspot.coords[0]}
            dist={5}
            back={7}
            limit={8}
            title="Spotted this week"
          />

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">
              When to visit
            </h3>
            <div className="grid grid-cols-12 gap-0.5">
              {MONTH_NAMES.map((m, i) => {
                const month = i + 1;
                const isBest = hotspot.bestMonths.includes(month);
                const isNow = month === currentMonth;
                return (
                  <div
                    key={m}
                    className={`flex flex-col items-center py-1.5 rounded ${
                      isNow
                        ? 'bg-amber-500/20 ring-1 ring-amber-400/60'
                        : isBest
                        ? 'bg-emerald-500/30'
                        : 'bg-slate-800/40'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        isNow
                          ? 'text-amber-300'
                          : isBest
                          ? 'text-emerald-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {m}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              {hotspot.access}
            </p>
          </div>
        </aside>
      </div>
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {subtitle && (
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</div>
      )}
    </div>
  );
}


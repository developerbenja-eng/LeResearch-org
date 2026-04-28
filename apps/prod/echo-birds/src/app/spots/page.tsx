import Link from 'next/link';
import { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { HOTSPOTS } from '@/lib/hotspots';
import { getSpeciesByIds } from '@/lib/loadSpecies';
import { MONTH_NAMES } from '@/lib/types';
import { HotspotMap } from '@/components/HotspotMap';

export const metadata: Metadata = {
  title: 'Birding Spots — Memphis Birds',
  description: 'The Big Five hotspots and secondary sites for birding around Memphis.',
};

export default function SpotsPage() {
  const memphisSpots = HOTSPOTS.filter((h) => (h.region ?? 'memphis') === 'memphis');
  const daytrips = HOTSPOTS.filter((h) => h.region === 'day-trip');
  const big5 = memphisSpots.filter((h) => h.tier === 'big-5');
  const secondary = memphisSpots.filter((h) => h.tier === 'secondary');
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <MapPin className="w-6 h-6 text-emerald-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Birding Spots</h1>
          <p className="mt-2 text-slate-400">
            Where to go around Memphis. Start with the Big Five.
          </p>
        </div>
      </header>

      <div className="mb-10">
        <HotspotMap hotspots={memphisSpots} height={440} />
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300" />
            <span>Big 5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-300" />
            <span>Other spots</span>
          </div>
          <span className="ml-auto italic">Tap a pin for details</span>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300 mb-4">
          The Big Five
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {big5.map((h) => (
            <HotspotCard key={h.id} hotspot={h} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">
          Other spots
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {secondary.map((h) => (
            <HotspotCard key={h.id} hotspot={h} />
          ))}
        </div>
      </section>

      {daytrips.length > 0 && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">
              Day trips beyond Memphis
            </h2>
            <span className="text-xs text-slate-400">
              Different ecosystem, different birds
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daytrips.map((h) => (
              <HotspotCard key={h.id} hotspot={h} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function HotspotCard({ hotspot }: { hotspot: (typeof HOTSPOTS)[number] }) {
  const signature = getSpeciesByIds(hotspot.signatureSpecies);
  const bestMonths = hotspot.bestMonths
    .map((m) => MONTH_NAMES[m - 1])
    .join(' · ');
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/40 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
            {hotspot.name}
          </h3>
          <p className="text-xs text-slate-400">
            {hotspot.neighborhood}
            {hotspot.distanceFromMemphis && (
              <span className="text-violet-300/80"> · {hotspot.distanceFromMemphis}</span>
            )}
          </p>
        </div>
        <span className="shrink-0 text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
          {hotspot.access.split('·')[0].trim()}
        </span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-3">
        {hotspot.description}
      </p>
      <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
        Best: <span className="text-slate-300">{bestMonths}</span>
      </div>
      {signature.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {signature.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="text-[11px] px-2 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-200 hover:bg-sky-500/20 transition-colors"
            >
              {s.commonName}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

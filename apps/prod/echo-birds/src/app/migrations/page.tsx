import { Metadata } from 'next';
import { Globe } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { MIGRATION_DATA } from '@/lib/migration';
import { STATUS_LABELS } from '@/lib/types';
import { GlobalMigrationMap } from '@/components/GlobalMigrationMap';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Where They Go — Echo Birds',
  description:
    'Global migration map showing where Tennessee birds travel. From the Arctic to the Amazon.',
};

export default function MigrationsPage() {
  const allSpecies = loadAllSpecies();

  // Build entries with migration data
  const entries = allSpecies
    .filter((s) => MIGRATION_DATA[s.slug])
    .map((s) => ({
      species: s,
      migration: MIGRATION_DATA[s.slug],
    }));

  // Sorted by distance for the ranking
  const ranked = [...entries]
    .filter((e) => e.migration.roundTripMiles)
    .sort((a, b) => (b.migration.roundTripMiles ?? 0) - (a.migration.roundTripMiles ?? 0));

  const topTraveler = ranked[0];
  const totalMiles = ranked.reduce((sum, e) => sum + (e.migration.roundTripMiles ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <Globe className="w-6 h-6 text-violet-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Where They Go</h1>
          <p className="mt-2 text-slate-400">
            {entries.length} species travel from the Arctic to the Amazon — and Memphis is
            on the route.
          </p>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          value={entries.length.toString()}
          label="Migratory species"
          color="text-violet-300"
        />
        <StatCard
          value={`${(totalMiles / 1000000).toFixed(1)}M`}
          label="Combined round-trip miles"
          color="text-amber-300"
        />
        <StatCard
          value={topTraveler?.species.commonName ?? '—'}
          label="Longest traveler"
          color="text-sky-300"
          small
        />
        <StatCard
          value={
            topTraveler?.migration.roundTripMiles
              ? `${topTraveler.migration.roundTripMiles.toLocaleString()} mi`
              : '—'
          }
          label="Longest round trip"
          color="text-emerald-300"
        />
      </div>

      {/* Global map */}
      <GlobalMigrationMap entries={entries} height={520} />

      {/* Travel Distance Ranking */}
      <section className="mt-14">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300 mb-2">
          Travel Distance Ranking
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Who flies the furthest? Annual round-trip distance, ranked.
        </p>

        <div className="space-y-1.5">
          {ranked.map((entry, i) => {
            const miles = entry.migration.roundTripMiles ?? 0;
            const maxMiles = ranked[0]?.migration.roundTripMiles ?? 1;
            const pct = (miles / maxMiles) * 100;
            const medal =
              i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            const statusLabel = STATUS_LABELS[entry.species.status];

            return (
              <Link
                key={entry.species.slug}
                href={`/${entry.species.slug}`}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800/60 transition-colors"
              >
                {/* Rank */}
                <span className="w-8 text-right text-sm font-bold text-slate-500 shrink-0">
                  {medal ?? `#${i + 1}`}
                </span>

                {/* Bar + info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors truncate">
                      {entry.species.commonName}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {miles.toLocaleString()} mi
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          entry.species.status === 'summer-breeder'
                            ? '#fbbf24'
                            : entry.species.status === 'winter-visitor'
                              ? '#38bdf8'
                              : '#a78bfa',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] ${statusLabel.color}`}
                    >
                      {statusLabel.long}
                    </span>
                    {entry.migration.wintersIn && (
                      <span className="text-[10px] text-slate-500 truncate">
                        Winters: {entry.migration.wintersIn}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fun facts */}
      <section className="mt-14 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">
          Migration by the numbers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <span className="text-amber-300 font-bold">Longest single flight:</span>{' '}
            Ruby-throated Hummingbird crosses the Gulf of Mexico — 500+ miles of open
            water, no stopping.
          </div>
          <div>
            <span className="text-sky-300 font-bold">Highest flyer:</span>{' '}
            Sandhill Cranes migrate at 6,000–12,000 feet altitude, sometimes visible
            only as distant specks.
          </div>
          <div>
            <span className="text-emerald-300 font-bold">Fastest migrant:</span>{' '}
            Broad-winged Hawks ride thermals in "kettles" of thousands, covering
            300+ miles/day.
          </div>
          <div>
            <span className="text-violet-300 font-bold">Night travelers:</span>{' '}
            Most warblers migrate at night, navigating by stars. Memphis sits under
            one of the busiest nocturnal flyways.
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
  small,
}: {
  value: string;
  label: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
      <div className={`${small ? 'text-sm' : 'text-2xl'} font-bold ${color}`}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
        {label}
      </div>
    </div>
  );
}

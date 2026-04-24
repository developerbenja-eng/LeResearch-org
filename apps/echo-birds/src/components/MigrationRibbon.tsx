'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Species } from '@/lib/types';
import { MONTH_NAMES, STATUS_LABELS } from '@/lib/types';

type RowStatus = 'summer-breeder' | 'winter-visitor' | 'migrant-pass-through';

const ROW_COLOR: Record<RowStatus, { bar: string; text: string; bg: string }> = {
  'summer-breeder': {
    bar: 'bg-gradient-to-r from-amber-500/70 to-amber-400/70',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
  },
  'winter-visitor': {
    bar: 'bg-gradient-to-r from-sky-500/70 to-sky-400/70',
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
  },
  'migrant-pass-through': {
    bar: 'bg-gradient-to-r from-violet-500/70 to-violet-400/70',
    text: 'text-violet-300',
    bg: 'bg-violet-500/10',
  },
};

export function MigrationRibbon({
  species,
  currentMonth,
}: {
  species: Species[];
  currentMonth: number;
}) {
  const [filter, setFilter] = useState<RowStatus | 'all'>('all');

  const ribbonSpecies = useMemo(() => {
    const filtered = species
      .filter((s) => s.status !== 'year-round' && s.status !== 'rare')
      .filter((s) => (filter === 'all' ? true : s.status === filter));
    // sort by first month they're present
    return filtered.sort((a, b) => {
      const aStart = a.memphisMonths[0] ?? 1;
      const bStart = b.memphisMonths[0] ?? 1;
      if (aStart !== bStart) return aStart - bStart;
      return a.commonName.localeCompare(b.commonName);
    });
  }, [species, filter]);

  return (
    <section className="relative">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            The year in Memphis
          </h2>
          <p className="text-xl font-semibold text-white mt-1">
            Arrivals &amp; departures
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {(['all', 'summer-breeder', 'winter-visitor', 'migrant-pass-through'] as const).map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === f
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'all'
                  ? 'All'
                  : f === 'summer-breeder'
                  ? 'Summer'
                  : f === 'winter-visitor'
                  ? 'Winter'
                  : 'Migrants'}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        {/* Month header */}
        <div className="sticky top-0 z-10 grid grid-cols-[minmax(140px,1fr)_repeat(12,1fr)] gap-0 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Species
          </div>
          {MONTH_NAMES.map((m, i) => {
            const isCurrent = i + 1 === currentMonth;
            return (
              <div
                key={m}
                className={`px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider ${
                  isCurrent ? 'text-amber-300 bg-amber-500/10' : 'text-slate-400'
                }`}
              >
                {m}
              </div>
            );
          })}
        </div>

        {/* Current-month vertical indicator */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none bg-amber-400/10 border-l border-r border-amber-400/30"
          style={{
            left: `calc(${100 / 13}% * ${currentMonth - 1} + ${100 / 13}%)`,
            width: `calc(${100 / 13}%)`,
          }}
        />

        {/* Rows */}
        <div className="relative">
          {ribbonSpecies.map((s) => {
            const color = ROW_COLOR[s.status as RowStatus] ?? ROW_COLOR['migrant-pass-through'];
            return (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="group grid grid-cols-[minmax(140px,1fr)_repeat(12,1fr)] gap-0 border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
              >
                <div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wide shrink-0 ${color.text}`}
                    title={STATUS_LABELS[s.status].long}
                  >
                    {STATUS_LABELS[s.status].short}
                  </span>
                  <span className="text-xs md:text-sm text-slate-200 group-hover:text-white truncate">
                    {s.commonName}
                  </span>
                </div>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const isHere = s.memphisMonths.includes(month);
                  const isPeak = s.peakMonths.includes(month);
                  return (
                    <div key={month} className="px-0.5 py-2 flex items-center">
                      {isHere ? (
                        <div
                          className={`h-2 w-full rounded-full ${color.bar} ${
                            isPeak ? 'h-2.5 ring-1 ring-white/30' : ''
                          }`}
                        />
                      ) : (
                        <div className="h-0.5 w-full bg-slate-800/40 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-slate-400">
        <LegendItem className="bg-amber-500/70" label="Summer" />
        <LegendItem className="bg-sky-500/70" label="Winter" />
        <LegendItem className="bg-violet-500/70" label="Migrant" />
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-full bg-amber-500/70 ring-1 ring-white/30" />
          <span>Peak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 border-l border-r border-amber-400/60 bg-amber-400/10" />
          <span>This month</span>
        </div>
      </div>
    </section>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2 w-4 rounded-full ${className}`} />
      <span>{label}</span>
    </div>
  );
}

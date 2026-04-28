'use client';

import type { Species } from '@/lib/types';
import { useLifelist } from '@/lib/useLifelist';
import { SpeciesCard } from '@/components/SpeciesCard';

export function LifelistClient({ allSpecies }: { allSpecies: Species[] }) {
  const { ids, count } = useLifelist();
  const seen = allSpecies.filter((s) => ids.includes(s.id));
  const total = allSpecies.length;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  if (count === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-slate-700 rounded-2xl">
        <p className="text-slate-400">
          You haven&apos;t added any birds yet. Open a species page and tap{' '}
          <span className="text-white font-medium">I&apos;ve seen this bird</span>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-bold text-white">
            {count} <span className="text-sm font-normal text-slate-400">/ {total}</span>
          </div>
          <div className="text-sm text-slate-400">{pct}% of Memphis cast</div>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-amber-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {seen.map((s) => (
          <SpeciesCard key={s.slug} species={s} />
        ))}
      </div>
    </>
  );
}

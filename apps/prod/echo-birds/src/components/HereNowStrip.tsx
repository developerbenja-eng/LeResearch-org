import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Species } from '@/lib/types';
import { SpeciesCard } from './SpeciesCard';

export function HereNowStrip({
  species,
  monthName,
  limit = 8,
}: {
  species: Species[];
  monthName: string;
  limit?: number;
}) {
  const subset = species.slice(0, limit);
  return (
    <section className="mt-10 md:mt-16">
      <div className="flex items-baseline justify-between mb-4 px-4 md:px-0">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
            Here right now
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-white mt-1">
            {monthName} in Memphis
          </p>
        </div>
        <Link
          href="/here-now"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-300 hover:text-sky-200 shrink-0"
        >
          See all {species.length}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
        {subset.map((s) => (
          <SpeciesCard key={s.slug} species={s} />
        ))}
      </div>
    </section>
  );
}

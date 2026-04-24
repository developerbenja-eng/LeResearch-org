import { Metadata } from 'next';
import { Search } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { FindClient } from './FindClient';
import { SPECIES_COLORS } from '@/lib/colors';
import { getConservationFor } from '@/lib/conservation';

export const metadata: Metadata = {
  title: 'Quick ID — Memphis Birds',
  description: 'Identify a Memphis bird by color, size, habitat, and season.',
};

export default function FindPage() {
  const species = loadAllSpecies();
  // attach colors + conservation to species data
  const enriched = species.map((s) => ({
    ...s,
    colors: SPECIES_COLORS[s.id] ?? [],
    conservation: getConservationFor(s.id),
  }));
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
          <Search className="w-6 h-6 text-sky-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Quick ID</h1>
          <p className="mt-2 text-slate-400">
            Saw a bird? Narrow it down by what you remember.
          </p>
        </div>
      </header>
      <FindClient species={enriched} />
    </div>
  );
}

import { Metadata } from 'next';
import { Laugh } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { FunnyBrowser } from './FunnyBrowser';

export const metadata: Metadata = {
  title: 'Funny Bird Posts — Echo Birds',
  description: 'The funniest things people share about Tennessee birds on Reddit.',
};

export default function FunnyPage() {
  const allSpecies = loadAllSpecies();
  const speciesList = allSpecies.map((s) => ({
    slug: s.slug,
    commonName: s.commonName,
    scientificName: s.scientificName,
    status: s.status,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
          <Laugh className="w-6 h-6 text-orange-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Reddit Says...</h1>
          <p className="mt-2 text-slate-400">
            The funniest, weirdest, and most popular things people share about our birds.
            Powered by Reddit.
          </p>
        </div>
      </header>

      <FunnyBrowser speciesList={speciesList} />
    </div>
  );
}

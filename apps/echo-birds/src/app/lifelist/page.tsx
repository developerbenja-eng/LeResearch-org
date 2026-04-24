import { Metadata } from 'next';
import { CheckSquare } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { LifelistClient } from './LifelistClient';

export const metadata: Metadata = {
  title: 'My Lifelist — Memphis Birds',
  description: 'Birds you\'ve spotted around Memphis.',
};

export default function LifelistPage() {
  const allSpecies = loadAllSpecies();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
          <CheckSquare className="w-6 h-6 text-rose-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">My Lifelist</h1>
          <p className="mt-2 text-slate-400">
            Birds you&apos;ve seen. Saved locally on this device — no account needed.
          </p>
        </div>
      </header>
      <LifelistClient allSpecies={allSpecies} />
    </div>
  );
}

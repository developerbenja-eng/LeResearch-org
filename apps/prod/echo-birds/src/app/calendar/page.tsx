import { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { CalendarClient } from './CalendarClient';

export const metadata: Metadata = {
  title: 'Migration Calendar — Memphis Birds',
  description:
    'When every Memphis bird is here — a month-by-month heatmap of presence and peak.',
};

export default function CalendarPage() {
  const species = loadAllSpecies();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <CalendarDays className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Migration Calendar
          </h1>
          <p className="mt-2 text-slate-400">
            When every Memphis bird is here. Brighter = peak.
          </p>
        </div>
      </header>
      <CalendarClient species={species} />
    </div>
  );
}

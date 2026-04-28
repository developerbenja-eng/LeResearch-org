import { Metadata } from 'next';
import { inMemphisNow, currentMonth1Based } from '@/lib/queries';
import { MONTH_NAMES } from '@/lib/types';
import { SpeciesCard } from '@/components/SpeciesCard';

export const metadata: Metadata = {
  title: 'Here Now — Memphis Birds',
  description: 'Every bird currently in the Memphis area.',
};

export const dynamic = 'force-dynamic';

export default async function HereNowPage() {
  const species = inMemphisNow();
  const monthName = MONTH_NAMES[currentMonth1Based() - 1];
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
          Here Right Now
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-white">
          {monthName} in Memphis
        </h1>
        <p className="mt-2 text-slate-400">
          {species.length} birds you could see outside today.
        </p>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {species.map((s) => (
          <SpeciesCard key={s.slug} species={s} />
        ))}
      </div>
    </div>
  );
}

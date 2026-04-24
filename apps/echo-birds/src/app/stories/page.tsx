import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';

export const metadata: Metadata = {
  title: 'Stories & Folklore — Memphis Birds',
  description: 'Folk names, Delta folklore, Indigenous stories, and weird facts about Memphis birds.',
};

export default function StoriesPage() {
  const species = loadAllSpecies().filter((s) => s.aliases.length > 0);
  // Group by first letter of folk alias
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-violet-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Stories & Folklore</h1>
          <p className="mt-2 text-slate-400">
            Nicknames, Delta folklore, and the deeper histories behind Memphis birds.
          </p>
        </div>
      </header>

      <div className="space-y-3">
        {species.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="block group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-violet-500/40 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                  {s.commonName}
                </h2>
                <div className="mt-1 text-sm text-amber-300/90">
                  {s.aliases.map((a) => `"${a}"`).join('  ·  ')}
                </div>
              </div>
              <span className="text-[11px] italic text-slate-400 shrink-0 hidden sm:block">
                {s.scientificName}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

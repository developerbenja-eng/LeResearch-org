import Link from 'next/link';
import { Metadata } from 'next';
import { Volume2 } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { AudioPlayer } from '@/components/AudioPlayer';
import { StatusChip } from '@/components/StatusChip';

export const metadata: Metadata = {
  title: 'Sounds — Memphis Birds',
  description: 'Learn Memphis birds by ear. Tap any bird to hear its call.',
};

export default async function SoundsPage() {
  const species = loadAllSpecies();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
          <Volume2 className="w-6 h-6 text-sky-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Sounds</h1>
          <p className="mt-2 text-slate-400">
            Tap the play button on any bird to hear its song or call. Learning birds by ear
            is how real birders do it.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {species.map((s) => {
          const audio = s.audioSongUrl ?? s.audioCallUrl;
          const soundMark = s.aliases.length > 0 ? `"${s.aliases[0]}"` : null;
          return (
            <div
              key={s.slug}
              className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3 hover:border-sky-500/40 transition-colors"
            >
              <AudioPlayer
                url={audio}
                label={s.commonName}
                variant="icon"
                scientificName={s.scientificName}
                xcType="song"
              />
              <Link
                href={`/${s.slug}`}
                className="flex-1 min-w-0 hover:text-sky-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="text-sm font-semibold text-white truncate">
                    {s.commonName}
                  </div>
                  <StatusChip status={s.status} />
                </div>
                {soundMark && (
                  <div className="text-xs text-amber-300/80 italic truncate">
                    {soundMark}
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import Link from 'next/link';
import type { Species } from '@/lib/types';
import { AudioPlayer } from './AudioPlayer';
import { StatusChip } from './StatusChip';
import { WikiImage } from './WikiImage';
import { getColorDescription } from '@/lib/colors';

export function SpeciesCard({ species }: { species: Species }) {
  const primaryAlias = species.aliases[0];
  const audioUrl = species.audioSongUrl ?? species.audioCallUrl;
  const colorDesc = getColorDescription(species.id);

  return (
    <Link
      href={`/${species.slug}`}
      title={colorDesc ?? undefined}
      className="group block relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 hover:border-sky-400/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/10"
    >
      {/* Photo or placeholder */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 overflow-hidden">
        {species.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={species.photoUrl}
            alt={species.commonName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <WikiImage
            scientificName={species.scientificName}
            commonName={species.commonName}
            alt={species.commonName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {/* Subtle sky-gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Status chip, top-left */}
        <div className="absolute top-2 left-2">
          <StatusChip status={species.status} />
        </div>

        {/* Audio button, bottom-right (auto-fetches from Xeno-canto when no URL) */}
        <div className="absolute bottom-2 right-2">
          <AudioPlayer
            url={audioUrl}
            label={species.commonName}
            variant="icon"
            scientificName={species.scientificName}
            xcType={species.audioSongUrl ? 'song' : 'call'}
          />
        </div>
      </div>

      {/* Text block */}
      <div className="p-3">
        <div className="text-sm font-semibold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
          {species.commonName}
        </div>
        <div className="text-[11px] italic text-slate-400 truncate">
          {species.scientificName}
        </div>
        {primaryAlias && (
          <div className="text-[11px] text-amber-300/80 truncate mt-0.5">
            &ldquo;{primaryAlias}&rdquo;
          </div>
        )}
      </div>
    </Link>
  );
}

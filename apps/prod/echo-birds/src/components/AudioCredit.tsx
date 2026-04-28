'use client';

import { useXCAudio } from '@/lib/useXCAudio';

/**
 * Small attribution line shown below the audio controls on the species hero.
 * Only fetches once per species/session thanks to module-level cache in useXCAudio.
 */
export function AudioCredit({
  scientificName,
  type = 'song',
}: {
  scientificName: string;
  type?: 'song' | 'call';
}) {
  const { data } = useXCAudio(scientificName, type, true);
  if (!data) return null;
  return (
    <p className="text-[10px] text-slate-400 mt-2">
      {data.type ?? 'recording'} by{' '}
      <span className="text-slate-300">{data.recordist ?? 'XC contributor'}</span>
      {data.location && (
        <>
          {' '}
          in <span className="text-slate-400">{data.location}</span>
        </>
      )}
      {' · '}
      <a
        href={data.pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 hover:text-sky-300 underline underline-offset-2"
      >
        via Xeno-canto
      </a>
    </p>
  );
}

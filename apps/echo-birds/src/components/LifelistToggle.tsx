'use client';

import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useLifelist } from '@/lib/useLifelist';

export function LifelistToggle({
  speciesId,
  commonName,
}: {
  speciesId: string;
  commonName: string;
}) {
  const { isInList, toggle } = useLifelist();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 text-sm">
        <Plus className="w-4 h-4" /> I&apos;ve seen this bird
      </div>
    );
  }
  const seen = isInList(speciesId);
  return (
    <button
      type="button"
      onClick={() => toggle(speciesId)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        seen
          ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
      aria-label={
        seen
          ? `Remove ${commonName} from my lifelist`
          : `Add ${commonName} to my lifelist`
      }
    >
      {seen ? (
        <>
          <Check className="w-4 h-4" /> On my list
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" /> I&apos;ve seen this bird
        </>
      )}
    </button>
  );
}

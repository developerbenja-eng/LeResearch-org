import { SIZE_REFERENCE_INCHES, type SizeReference } from '@/lib/types';

const REFS: Array<{ key: SizeReference; label: string }> = [
  { key: 'hummingbird', label: 'hummingbird' },
  { key: 'sparrow', label: 'sparrow' },
  { key: 'robin', label: 'robin' },
  { key: 'crow', label: 'crow' },
  { key: 'hawk', label: 'hawk' },
  { key: 'goose', label: 'goose' },
];

export function SizeComparison({
  sizeInches,
  sizeReference,
}: {
  sizeInches: number;
  sizeReference: SizeReference;
}) {
  const maxInches = 32;
  const pct = Math.min(100, (sizeInches / maxInches) * 100);
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Size
        </h3>
        <div className="text-sm text-slate-300">
          <span className="font-semibold text-white">{sizeInches}&quot;</span> · like a{' '}
          <span className="text-sky-300">{sizeReference.replace(/-/g, ' ')}</span>
        </div>
      </div>
      <div className="relative h-4 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-amber-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="relative h-4 mt-1">
        {REFS.map((ref) => {
          const refPct = Math.min(100, (SIZE_REFERENCE_INCHES[ref.key] / maxInches) * 100);
          return (
            <div
              key={ref.key}
              className="absolute top-0 -translate-x-1/2 text-[9px] uppercase tracking-wide text-slate-400"
              style={{ left: `${refPct}%` }}
            >
              {ref.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

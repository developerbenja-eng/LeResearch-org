import Link from 'next/link';
import { ArrowDown, ArrowUp, Sparkles } from 'lucide-react';
import type { Species } from '@/lib/types';

/**
 * Shows what's changing in Memphis birding this week:
 * - birds whose memphisMonths *start* this month (just arrived)
 * - birds whose memphisMonths *end* next month (leaving soon)
 * - peak-month highlights
 */
export function WeekHighlights({
  species,
  currentMonth,
}: {
  species: Species[];
  currentMonth: number;
}) {
  const justArrived = species.filter((s) => {
    if (s.status === 'year-round') return false;
    // present this month but not previous
    const prev = currentMonth === 1 ? 12 : currentMonth - 1;
    return s.memphisMonths.includes(currentMonth) && !s.memphisMonths.includes(prev);
  });

  const leavingSoon = species.filter((s) => {
    if (s.status === 'year-round') return false;
    // present this month but not next
    const next = currentMonth === 12 ? 1 : currentMonth + 1;
    return s.memphisMonths.includes(currentMonth) && !s.memphisMonths.includes(next);
  });

  const atPeak = species.filter((s) => s.peakMonths.includes(currentMonth)).slice(0, 5);

  if (justArrived.length + leavingSoon.length + atPeak.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        This month
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <HighlightPanel
          icon={<ArrowDown className="w-4 h-4" />}
          color="text-amber-300 border-amber-500/30 bg-amber-500/5"
          label="Just arrived"
          species={justArrived}
          empty="No arrivals this month"
        />
        <HighlightPanel
          icon={<ArrowUp className="w-4 h-4" />}
          color="text-sky-300 border-sky-500/30 bg-sky-500/5"
          label="Leaving soon"
          species={leavingSoon}
          empty="No departures this month"
        />
        <HighlightPanel
          icon={<Sparkles className="w-4 h-4" />}
          color="text-emerald-300 border-emerald-500/30 bg-emerald-500/5"
          label="At peak"
          species={atPeak}
          empty="No peak birds"
        />
      </div>
    </section>
  );
}

function HighlightPanel({
  icon,
  color,
  label,
  species,
  empty,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  species: Species[];
  empty: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-xs font-bold uppercase tracking-[0.14em]">{label}</h3>
        <span className="ml-auto text-xs opacity-60">{species.length}</span>
      </div>
      {species.length === 0 ? (
        <p className="text-xs text-slate-400 italic">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {species.slice(0, 5).map((s) => (
            <li key={s.slug}>
              <Link
                href={`/${s.slug}`}
                className="text-sm text-slate-200 hover:text-white transition-colors"
              >
                {s.commonName}
              </Link>
            </li>
          ))}
          {species.length > 5 && (
            <li className="text-xs text-slate-400 italic">+{species.length - 5} more</li>
          )}
        </ul>
      )}
    </div>
  );
}

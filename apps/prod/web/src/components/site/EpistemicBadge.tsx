'use client';

import { usePathname } from 'next/navigation';
import { findRoute, type EpistemicStatus } from './route-registry';

/**
 * Maturity chip — temporal sibling of the staleness dot. Tells the
 * reader how settled the writing on this page is.
 *
 *   seedling    → first draft / open question, expect substantial change
 *   developing  → analytic posture in place, some unresolved threads
 *   evergreen   → load-bearing and stable; major changes are unlikely
 */

const STATUS_STYLE: Record<EpistemicStatus, { color: string; ring: string; label: string; meaning: string }> = {
  seedling:   { color: '#22c55e', ring: 'rgba(34,197,94,0.45)',  label: 'seedling',   meaning: 'first draft · open question · expect substantial change' },
  developing: { color: '#f59e0b', ring: 'rgba(245,158,11,0.45)', label: 'developing', meaning: 'analytic posture in place · some unresolved threads' },
  evergreen:  { color: '#a78bfa', ring: 'rgba(167,139,250,0.45)',label: 'evergreen',  meaning: 'load-bearing and stable · major changes unlikely' },
};

interface EpistemicBadgeProps {
  /** If omitted, looks up the current route from usePathname() */
  status?: EpistemicStatus;
  /** Compact 'pill' or full 'card' */
  variant?: 'pill' | 'card';
}

export function EpistemicBadge({ status, variant = 'pill' }: EpistemicBadgeProps) {
  const pathname = usePathname() || '/';
  const resolved = status ?? findRoute(pathname)?.status ?? 'developing';
  const s = STATUS_STYLE[resolved];

  if (variant === 'card') {
    return (
      <div
        className="inline-flex items-start gap-3 rounded-lg border px-4 py-2.5"
        style={{ borderColor: s.ring, backgroundColor: `${s.color}0a` }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: s.color }}
          aria-hidden
        />
        <div>
          <div
            className="text-[10px] font-mono tracking-[0.3em] uppercase"
            style={{ color: s.color }}
          >
            {s.label}
          </div>
          <div className="text-[11px] text-white/55 italic mt-0.5">{s.meaning}</div>
        </div>
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.25em] uppercase border rounded-full px-2.5 py-1"
      style={{ color: s.color, borderColor: s.ring }}
      title={s.meaning}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
      {s.label}
    </span>
  );
}

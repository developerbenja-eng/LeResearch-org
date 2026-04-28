'use client';

import { useState } from 'react';

export type Staleness = 'live' | 'current' | 'stale';

export interface Source {
  url: string;
  publisher: string;
  date?: string;
}

interface ClaimCardProps {
  claim: React.ReactNode;
  receipt: React.ReactNode;
  sources: Source[];
  staleness?: Staleness;
}

const STALENESS_STYLE: Record<Staleness, { dot: string; label: string; tooltip: string }> = {
  live:    { dot: '#22c55e', label: 'live',    tooltip: 'Re-verified within the last 30 days' },
  current: { dot: '#f59e0b', label: 'current', tooltip: 'Re-verified within the last 90 days' },
  stale:   { dot: '#ef4444', label: 'stale',   tooltip: 'Older than 90 days — re-check before citing' },
};

export function ClaimCard({ claim, receipt, sources, staleness = 'current' }: ClaimCardProps) {
  const [open, setOpen] = useState(false);
  const meta = STALENESS_STYLE[staleness];

  return (
    <div
      className="my-4 border-l-2 pl-4 py-2"
      style={{ borderColor: 'rgba(245,158,11,0.45)' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 text-base leading-relaxed text-white/80">{claim}</div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 mt-1 text-[10px] font-mono tracking-[0.2em] uppercase text-white/40 hover:text-white/80 transition-colors flex items-center gap-1.5"
          aria-expanded={open}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.dot }}
            title={meta.tooltip}
            aria-label={meta.tooltip}
          />
          {open ? 'hide' : 'receipt'}
        </button>
      </div>

      {open && (
        <div className="mt-3 pl-0 text-sm text-white/65 leading-relaxed border-t border-white/5 pt-3">
          <div className="mb-3">{receipt}</div>
          <ul className="space-y-1">
            {sources.map((s) => (
              <li key={s.url} className="text-[12px] font-mono">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white underline decoration-dotted underline-offset-2"
                >
                  {s.publisher}
                </a>
                {s.date && <span className="text-white/30 ml-2">{s.date}</span>}
              </li>
            ))}
          </ul>
          <div className="mt-3 text-[10px] font-mono tracking-[0.25em] uppercase text-white/30">
            staleness · {meta.label}
          </div>
        </div>
      )}
    </div>
  );
}

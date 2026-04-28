'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Sparkles,
  Binoculars,
  Plane,
  ChevronRight,
} from 'lucide-react';
import type { Species } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/types';

interface Obs {
  speciesCode: string;
  comName: string;
  sciName: string;
  locName: string;
  obsDt: string;
  howMany?: number;
}

interface EBirdResponse {
  observations?: Obs[];
  error?: string;
}

export interface DailyFlywayReportProps {
  species: Species[];
  currentMonth: number;
  region?: string;
}

/**
 * Daily flyway digest — arrivals, departures, peak birds, recently-reported birds.
 * A single opinionated "what's happening today" panel for the landing page.
 */
export function DailyFlywayReport({
  species,
  currentMonth,
  region = 'US-TN-157',
}: DailyFlywayReportProps) {
  const [liveObs, setLiveObs] = useState<Obs[] | null>(null);
  const [liveStatus, setLiveStatus] = useState<'loading' | 'ok' | 'nokey' | 'error'>(
    'loading',
  );

  useEffect(() => {
    fetch(`/api/ebird/recent?region=${region}&back=3&limit=5`)
      .then((r) => r.json())
      .then((data: EBirdResponse) => {
        if (data.error === 'ebird_key_missing') setLiveStatus('nokey');
        else if (data.error) setLiveStatus('error');
        else {
          setLiveObs(data.observations ?? []);
          setLiveStatus('ok');
        }
      })
      .catch(() => setLiveStatus('error'));
  }, [region]);

  const justArrived = species.filter((s) => {
    if (s.status === 'year-round') return false;
    const prev = currentMonth === 1 ? 12 : currentMonth - 1;
    return s.memphisMonths.includes(currentMonth) && !s.memphisMonths.includes(prev);
  });
  const leavingSoon = species.filter((s) => {
    if (s.status === 'year-round') return false;
    const next = currentMonth === 12 ? 1 : currentMonth + 1;
    return s.memphisMonths.includes(currentMonth) && !s.memphisMonths.includes(next);
  });
  const atPeak = species.filter((s) => s.peakMonths.includes(currentMonth));
  const arrivingNext = species.filter((s) => {
    if (s.status === 'year-round') return false;
    const next = currentMonth === 12 ? 1 : currentMonth + 1;
    return !s.memphisMonths.includes(currentMonth) && s.memphisMonths.includes(next);
  });

  // Count unique species reported in recent eBird obs
  const uniqueReported = liveObs
    ? new Set(liveObs.map((o) => o.speciesCode)).size
    : 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 overflow-hidden">
      {/* Header strip */}
      <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-amber-300" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
              Daily Flyway Report
            </h2>
          </div>
          <p className="text-lg md:text-xl font-semibold text-white mt-0.5">
            {today}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            {MONTH_NAMES[currentMonth - 1]}
          </div>
          <div className="text-sm font-semibold text-white">
            {atPeak.length} at peak
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {/* Arrivals/departures column */}
        <div className="p-5">
          <DigestRow
            icon={<ArrowDown className="w-3.5 h-3.5" />}
            color="text-amber-300"
            label={`Just arrived (${justArrived.length})`}
            species={justArrived}
            empty="No new arrivals this month"
          />
          <DigestRow
            icon={<ArrowUp className="w-3.5 h-3.5" />}
            color="text-sky-300"
            label={`Leaving soon (${leavingSoon.length})`}
            species={leavingSoon}
            empty="Everyone's staying put"
          />
          <DigestRow
            icon={<Sparkles className="w-3.5 h-3.5" />}
            color="text-emerald-300"
            label={`At peak (${atPeak.length})`}
            species={atPeak}
            empty="No peak birds"
            limit={4}
          />
          {arrivingNext.length > 0 && (
            <DigestRow
              icon={<Plane className="w-3.5 h-3.5" />}
              color="text-violet-300"
              label={`Arriving next month (${arrivingNext.length})`}
              species={arrivingNext}
              empty=""
              limit={3}
            />
          )}
        </div>

        {/* Live eBird column */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Binoculars className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              Recently reported in Shelby Co
            </h3>
            <span className="ml-auto text-[10px] uppercase text-slate-400">eBird</span>
          </div>
          {liveStatus === 'loading' && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-slate-800/40 animate-pulse"
                />
              ))}
            </div>
          )}
          {liveStatus === 'nokey' && (
            <div className="text-xs text-slate-400 py-4">
              Set{' '}
              <code className="text-amber-300">EBIRD_API_KEY</code> in{' '}
              <code className="text-amber-300">.env.local</code> to see live sightings.{' '}
              <a
                href="https://ebird.org/api/keygen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-300 underline"
              >
                Get a free key.
              </a>
            </div>
          )}
          {liveStatus === 'ok' && liveObs && (
            <>
              <div className="mb-3 pb-3 border-b border-slate-800/60">
                <div className="text-2xl font-bold text-white">
                  {uniqueReported}{' '}
                  <span className="text-sm font-normal text-slate-400">
                    species in 72h
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-slate-800/50">
                {liveObs.slice(0, 5).map((o, i) => (
                  <li
                    key={`${o.speciesCode}-${i}`}
                    className="py-2 flex items-baseline justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {o.comName}
                        {o.howMany != null && (
                          <span className="ml-1.5 text-[10px] text-slate-400">
                            ×{o.howMany}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {o.locName}
                      </div>
                    </div>
                    <time className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatAgo(o.obsDt)}
                    </time>
                  </li>
                ))}
              </ul>
            </>
          )}
          {liveStatus === 'error' && (
            <div className="text-xs text-rose-300 py-4">
              Couldn&apos;t load live sightings.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-[10px] text-slate-400">
        <span>Updated in real time from eBird &middot; curated from {species.length} Memphis species</span>
        <Link
          href="/here-now"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-300 transition-colors"
        >
          See all here-now <ChevronRight className="w-3 h-3" />
        </Link>
      </footer>
    </section>
  );
}

function DigestRow({
  icon,
  color,
  label,
  species,
  empty,
  limit = 3,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  species: Species[];
  empty: string;
  limit?: number;
}) {
  return (
    <div className="py-2.5 first:pt-0 last:pb-0 border-b border-slate-800/60 last:border-b-0">
      <div className={`flex items-center gap-1.5 mb-1.5 ${color}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      {species.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {species.slice(0, limit).map((s) => (
            <li key={s.slug}>
              <Link
                href={`/${s.slug}`}
                className="inline-flex items-center min-h-6 text-xs text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 px-2 py-1 rounded transition-colors"
              >
                {s.commonName}
              </Link>
            </li>
          ))}
          {species.length > limit && (
            <li className="text-[10px] text-slate-400 self-center">
              +{species.length - limit}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function formatAgo(iso: string): string {
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'now';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

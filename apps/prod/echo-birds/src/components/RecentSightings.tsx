'use client';

import { useEffect, useState } from 'react';
import { Binoculars, ExternalLink } from 'lucide-react';

interface Obs {
  speciesCode: string;
  comName: string;
  sciName: string;
  locName: string;
  obsDt: string;
  howMany?: number;
  lat: number;
  lng: number;
  locId: string;
}

interface Response {
  observations?: Obs[];
  error?: string;
  message?: string;
  fetchedAt?: string;
}

export interface RecentSightingsProps {
  region?: string;
  locId?: string;
  lat?: number;
  lng?: number;
  dist?: number;
  back?: number;
  limit?: number;
  title?: string;
}

/**
 * Live "recent eBird sightings" widget. Pulls from /api/ebird/recent.
 * Gracefully degrades if EBIRD_API_KEY is not configured.
 */
export function RecentSightings({
  region = 'US-TN-157',
  locId,
  lat,
  lng,
  dist = 25,
  back = 7,
  limit = 8,
  title = 'Recent sightings (last 7 days)',
}: RecentSightingsProps) {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (locId) qs.set('locId', locId);
    else if (region) qs.set('region', region);
    if (lat != null && lng != null) {
      qs.set('lat', String(lat));
      qs.set('lng', String(lng));
      qs.set('dist', String(dist));
    }
    qs.set('back', String(back));
    fetch(`/api/ebird/recent?${qs}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch((err) => setData({ error: String(err) }))
      .finally(() => setLoading(false));
  }, [region, locId, lat, lng, dist, back]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Binoculars className="w-4 h-4 animate-pulse" />
          Loading recent sightings…
        </div>
      </div>
    );
  }

  if (data?.error === 'ebird_key_missing') {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <Binoculars className="w-4 h-4" />
          <span className="font-medium text-slate-300">Live sightings</span>
        </div>
        <p className="text-xs">
          Set <code className="text-amber-300">EBIRD_API_KEY</code> in{' '}
          <code className="text-amber-300">.env.local</code> to show live eBird data.
          Get a free key at{' '}
          <a
            href="https://ebird.org/api/keygen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-300 underline"
          >
            ebird.org/api/keygen
          </a>
          .
        </p>
      </div>
    );
  }

  if (data?.error || !data?.observations) {
    return (
      <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 text-xs text-rose-300">
        Couldn&apos;t load recent sightings: {data?.error ?? 'unknown error'}
      </div>
    );
  }

  const obs = data.observations.slice(0, limit);
  if (obs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        No recent sightings in the last {back} days.
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Binoculars className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
          {title}
        </h3>
        <span className="ml-auto text-[10px] uppercase text-slate-400">eBird</span>
      </div>
      <ul className="divide-y divide-slate-800/70">
        {obs.map((o, i) => (
          <li
            key={`${o.speciesCode}-${o.locId}-${i}`}
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
              <div className="text-[11px] text-slate-400 truncate">{o.locName}</div>
            </div>
            <time className="text-[11px] text-slate-400 whitespace-nowrap">
              {formatObsDate(o.obsDt)}
            </time>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>{data.observations.length} total sightings</span>
        <a
          href="https://ebird.org/explore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-slate-300"
        >
          explore eBird <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
}

function formatObsDate(iso: string): string {
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

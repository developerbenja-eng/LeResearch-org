'use client';

import { useEffect, useState } from 'react';
import { Binoculars, ExternalLink } from 'lucide-react';

interface HotspotSpecies {
  speciesCode: string;
  comName: string;
  sciName: string;
  lastSeen: string;
  maxCount: number | null;
}

interface HotspotInfo {
  locId: string;
  locName: string;
  numSpeciesAllTime: number | null;
  ebirdUrl: string;
}

interface Response {
  hotspot?: HotspotInfo;
  recentSpecies?: HotspotSpecies[];
  recentCount?: number;
  windowDays?: number;
  nearbyHotspots?: number;
  error?: string;
  message?: string;
}

/**
 * Displays the all-time + recent (last 30 days) species list for the nearest
 * eBird hotspot to a given lat/lng, with links out to eBird for each species.
 *
 * Only renders meaningful content if EBIRD_API_KEY is set.
 */
export function HotspotSpecies({
  lat,
  lng,
  dist = 3,
  back = 30,
  sciNameToSlug: sciNameToSlugMap = {},
}: {
  lat: number;
  lng: number;
  dist?: number;
  back?: number;
  /** Map of sciName → slug, built from loadAllSpecies() at the parent (server) level */
  sciNameToSlug?: Record<string, string>;
}) {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      dist: String(dist),
      back: String(back),
    });
    fetch(`/api/ebird/hotspot-species?${qs}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch((err) => setData({ error: String(err) }))
      .finally(() => setLoading(false));
  }, [lat, lng, dist, back]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Binoculars className="w-4 h-4 animate-pulse" />
          Loading hotspot records…
        </div>
      </div>
    );
  }

  if (data?.error === 'ebird_key_missing') return null; // stay quiet if no key
  if (data?.error || !data?.hotspot || !data.recentSpecies) return null;

  const { hotspot, recentSpecies, recentCount, windowDays } = data;
  const curatedCount = Object.keys(sciNameToSlugMap).length;
  const recentInGuide = recentSpecies.filter((s) => sciNameToSlugMap[s.sciName]);
  const display = showAll ? recentSpecies : recentSpecies.slice(0, 12);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Binoculars className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
          eBird records
        </h3>
        <a
          href={hotspot.ebirdUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] text-slate-400 hover:text-slate-300 inline-flex items-center gap-1"
        >
          {hotspot.locName} <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Two stats side-by-side */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded bg-slate-950/50 border border-slate-800/60">
          <div className="text-2xl font-bold text-emerald-300">
            {hotspot.numSpeciesAllTime ?? '—'}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Species all-time
          </div>
        </div>
        <div className="p-2.5 rounded bg-slate-950/50 border border-slate-800/60">
          <div className="text-2xl font-bold text-sky-300">{recentCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Last {windowDays}d
          </div>
        </div>
      </div>

      {/* "In guide" coverage */}
      {curatedCount > 0 && (
        <div className="mb-3 pb-3 border-b border-slate-800/60 text-[11px] text-slate-400">
          <span className="text-white font-semibold">
            {recentInGuide.length}
          </span>{' '}
          of these are in our guide
        </div>
      )}

      {/* Recent species list */}
      <ul className="divide-y divide-slate-800/50 max-h-[360px] overflow-y-auto">
        {display.map((s) => {
          const slug = sciNameToSlugMap[s.sciName];
          const inGuide = Boolean(slug);
          return (
            <li
              key={s.speciesCode}
              className="py-1.5 flex items-baseline justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                {inGuide ? (
                  <a
                    href={`/${slug}`}
                    className="text-xs font-medium text-sky-300 hover:text-sky-200 truncate block"
                  >
                    {s.comName}
                  </a>
                ) : (
                  <span className="text-xs text-slate-300 truncate block">
                    {s.comName}
                  </span>
                )}
              </div>
              <time className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                {formatShort(s.lastSeen)}
              </time>
            </li>
          );
        })}
      </ul>

      {recentSpecies.length > 12 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-[11px] text-slate-400 hover:text-slate-200 w-full text-center py-1"
        >
          {showAll ? 'Show less' : `Show all ${recentSpecies.length}`}
        </button>
      )}

      <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
        <a
          href={hotspot.ebirdUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-slate-300"
        >
          open on eBird <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
}

function formatShort(iso: string): string {
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'now';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

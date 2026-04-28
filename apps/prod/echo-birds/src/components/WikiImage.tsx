'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

interface Attribution {
  artist: string | null;
  licenseShortName: string | null;
  licenseUrl: string | null;
  usageTerms?: string | null;
}

interface WikiResponse {
  thumbnail?: string;
  image?: string;
  extract?: string;
  source?: string;
  attribution?: Attribution | null;
}

/**
 * Lazy-loads a species hero image from Wikipedia via our /api/wiki-image route.
 * Shows an attribution badge on hover/focus (required by Wikimedia Commons licenses).
 */
export function WikiImage({
  scientificName,
  commonName,
  alt,
  className = '',
  useThumbnail = true,
  showAttribution = true,
}: {
  scientificName: string;
  commonName: string;
  alt: string;
  className?: string;
  useThumbnail?: boolean;
  showAttribution?: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const titles = [scientificName, commonName].filter(Boolean);
    let cancelled = false;

    async function lookup() {
      for (const t of titles) {
        try {
          const res = await fetch(
            `/api/wiki-image?title=${encodeURIComponent(t)}`,
          );
          if (!res.ok) continue;
          const data: WikiResponse = await res.json();
          const url = useThumbnail ? data.thumbnail : data.image ?? data.thumbnail;
          if (url && !cancelled) {
            setSrc(url);
            setSource(data.source ?? null);
            setAttribution(data.attribution ?? null);
            return;
          }
        } catch {
          // try next
        }
      }
      if (!cancelled) setFailed(true);
    }
    lookup();
    return () => {
      cancelled = true;
    };
  }, [scientificName, commonName, useThumbnail]);

  if (failed || (!src && !failed)) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-slate-600 ${className}`}
      >
        {failed ? (
          <span className="text-5xl opacity-40">🪶</span>
        ) : (
          <span className="w-6 h-6 rounded-full bg-slate-700 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src!}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {showAttribution && src && (
        <AttributionBadge
          attribution={attribution}
          source={source}
        />
      )}
    </>
  );
}

/** Bottom-right credit pill, expanded on hover.
 * Uses buttons (not <a>) because WikiImage may be rendered inside a parent
 * <Link>/<a>, and nested anchors are invalid HTML. Buttons + window.open
 * with stopPropagation give us links without the nesting. */
function AttributionBadge({
  attribution,
  source,
}: {
  attribution: Attribution | null;
  source: string | null;
}) {
  const artist = attribution?.artist;
  const license = attribution?.licenseShortName;
  const openExternal = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div className="absolute bottom-1.5 right-1.5 group/attr z-10">
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/70 backdrop-blur-sm text-[9px] uppercase tracking-wide text-slate-300 hover:bg-slate-950/95 transition-colors">
        <Info className="w-2.5 h-2.5" />
        <span className="hidden group-hover/attr:inline max-w-[200px] truncate normal-case tracking-normal">
          {artist ?? 'Wikipedia'}
          {license ? ` · ${license}` : ''}
        </span>
        <span className="group-hover/attr:hidden">via Wiki</span>
      </div>
      {/* Expanded popover on hover */}
      <div className="absolute bottom-full right-0 mb-1 hidden group-hover/attr:block pointer-events-auto z-20">
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-lg p-2 text-[10px] text-slate-300 min-w-[200px] max-w-[260px] shadow-xl">
          {artist && (
            <div className="truncate">
              <span className="text-slate-400">Photo: </span>
              {artist}
            </div>
          )}
          {license && (
            <div>
              <span className="text-slate-400">License: </span>
              {attribution?.licenseUrl ? (
                <button
                  type="button"
                  onClick={(e) => openExternal(e, attribution.licenseUrl!)}
                  className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
                >
                  {license}
                </button>
              ) : (
                license
              )}
            </div>
          )}
          {source && (
            <button
              type="button"
              onClick={(e) => openExternal(e, source)}
              className="block mt-1 text-sky-300 hover:text-sky-200 underline underline-offset-2 text-left"
            >
              Wikipedia source →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { findRoute, TOPIC_LABEL, TRACK_LABEL, type Topic, type TrackId } from './route-registry';

/**
 * Chip-strip showing the topics and tracks of the current page.
 * Each chip links to /topics/{slug} or /tracks/{slug}.
 *
 * Renders nothing if the current route has no tags.
 */

interface TagAxesProps {
  /** If omitted, looks up the current route from usePathname() */
  href?: string;
  /** Override topics shown */
  topics?: Topic[];
  /** Override tracks shown */
  tracks?: TrackId[];
  className?: string;
}

export function TagAxes({ href, topics, tracks, className = '' }: TagAxesProps) {
  const pathname = usePathname() || '/';
  const target = href ?? pathname;
  const route = findRoute(target);
  const ts = topics ?? route?.topics ?? [];
  const tks = tracks ?? route?.tracks ?? [];

  if (ts.length === 0 && tks.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-2 items-center text-[10px] font-mono tracking-[0.25em] uppercase ${className}`}>
      {ts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-white/30">Topics</span>
          {ts.map((t) => (
            <Link
              key={t}
              href={`/topics/${t}`}
              className="rounded-full border border-white/15 px-2.5 py-0.5 text-white/65 hover:text-white hover:border-white/30 transition-colors"
              title={TOPIC_LABEL[t]}
            >
              {TOPIC_LABEL[t]}
            </Link>
          ))}
        </div>
      )}
      {tks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-white/30">Tracks</span>
          {tks.map((t) => (
            <Link
              key={t}
              href={`/tracks/${t}`}
              className="rounded-full border border-white/15 px-2.5 py-0.5 text-white/65 hover:text-white hover:border-white/30 transition-colors"
              title={TRACK_LABEL[t]}
            >
              {TRACK_LABEL[t]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import {
  findRoute,
  TOPIC_LABEL,
  TRACK_LABEL,
  type EpistemicStatus,
  type Topic,
  type TrackId,
} from './route-registry';

/**
 * Wraps an internal Link with a small hover-card showing the destination
 * route's title, status, and tags. CSS-only (uses :hover + group-hover);
 * disabled on touch devices via `hover:hover` media query and `md:` gating.
 *
 * If the href has no registry entry, renders the Link without a preview.
 */

interface HoverPreviewProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Where to anchor the popover horizontally. Default 'center'. */
  align?: 'start' | 'center' | 'end';
}

const STATUS_META: Record<EpistemicStatus, { dot: string; label: string }> = {
  seedling:   { dot: 'bg-emerald-400', label: 'Seedling' },
  developing: { dot: 'bg-amber-400',   label: 'Developing' },
  evergreen:  { dot: 'bg-sky-400',     label: 'Evergreen' },
};

export function HoverPreview({
  href,
  children,
  className = '',
  align = 'center',
}: HoverPreviewProps) {
  const route = findRoute(href);
  if (!route) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  const status = route.status ?? 'developing';
  const sm = STATUS_META[status];
  const topics = (route.topics ?? []).slice(0, 4) as Topic[];
  const tracks = (route.tracks ?? []) as TrackId[];

  const alignClass =
    align === 'start' ? 'left-0'
    : align === 'end' ? 'right-0'
    : 'left-1/2 -translate-x-1/2';

  return (
    <span className="group/hp relative inline-block align-baseline">
      <Link href={href} className={className}>{children}</Link>
      {/* Popover. Hidden on touch (no hover) via the hidden + md:block split + Tailwind hover-only utilities. */}
      <span
        role="tooltip"
        aria-hidden
        className={[
          'pointer-events-none absolute top-full mt-2 z-50',
          alignClass,
          'w-[18rem] max-w-[calc(100vw-2rem)]',
          'opacity-0 invisible translate-y-1',
          'transition-[opacity,transform,visibility] duration-150',
          'group-hover/hp:opacity-100 group-hover/hp:visible group-hover/hp:translate-y-0',
          'motion-reduce:transition-none',
          'rounded-lg border border-white/15 bg-[var(--bg)]/95 backdrop-blur-md p-3',
          'shadow-2xl shadow-black/50',
          'hidden md:block',
          'whitespace-normal text-left',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 mb-2 text-[10px] font-mono tracking-[0.25em] uppercase">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sm.dot}`} aria-hidden />
          <span className="text-white/55">{sm.label}</span>
          <span className="text-white/25 ml-auto">{route.href}</span>
        </div>
        <div className="text-sm font-light text-white/90 leading-snug mb-1.5">
          {route.title}
        </div>
        {(topics.length > 0 || tracks.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-2 text-[9px] font-mono tracking-[0.2em] uppercase">
            {topics.map((t) => (
              <span key={t} className="rounded-full border border-white/10 px-1.5 py-0.5 text-white/55">
                {TOPIC_LABEL[t]}
              </span>
            ))}
            {tracks.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 px-1.5 py-0.5 text-white/45"
                title={`Track: ${TRACK_LABEL[t]}`}
              >
                ↳ {TRACK_LABEL[t]}
              </span>
            ))}
          </div>
        )}
      </span>
    </span>
  );
}

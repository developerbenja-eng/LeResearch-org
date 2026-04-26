'use client';

import { usePathname } from 'next/navigation';
import { findRelations, type PageRelations, type RelatedLink } from './relations';
import { HoverPreview } from './HoverPreview';

/**
 * Directional cross-references at the bottom of any long page.
 * Three (or four) cards: upstream / downstream / sibling / companion.
 *
 * Reads from relations.ts. If the current pathname has no entry,
 * renders nothing — opt-in by adding to the registry.
 */

const BUCKET_META: Record<keyof PageRelations, { label: string; color: string; hint: string }> = {
  upstream:   { label: 'Upstream',   color: 'rgba(96,165,250,0.85)',  hint: 'what this page depends on' },
  downstream: { label: 'Downstream', color: 'rgba(167,139,250,0.85)', hint: 'what depends on this page' },
  sibling:    { label: 'Sibling',    color: 'rgba(34,211,238,0.85)',  hint: 'peers in the same series' },
  companion:  { label: 'Companion',  color: 'rgba(245,158,11,0.85)',  hint: 'paired page' },
};

interface RelatedRailProps {
  /** If omitted, looks up the current pathname */
  href?: string;
  /** Optional override of the relations data */
  relations?: PageRelations;
}

export function RelatedRail({ href, relations }: RelatedRailProps) {
  const pathname = usePathname() || '/';
  const target = href ?? pathname;
  const r = relations ?? findRelations(target);
  if (!r) return null;

  // Filter to non-empty buckets to render in stable order
  const buckets = (['upstream', 'downstream', 'sibling', 'companion'] as const)
    .map((k) => ({ k, items: r[k] ?? [] }))
    .filter((b) => b.items.length > 0);

  if (buckets.length === 0) return null;

  // Choose grid columns based on bucket count so cards aren't too narrow / too wide
  const gridCols = buckets.length === 1 ? 'md:grid-cols-1'
    : buckets.length === 2 ? 'md:grid-cols-2'
    : buckets.length === 3 ? 'md:grid-cols-3'
    : 'md:grid-cols-4';

  return (
    <section className="not-prose px-6 pt-12 pb-4 border-t border-white/5 mt-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-5">
          See also
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
          {buckets.map(({ k, items }) => {
            const m = BUCKET_META[k];
            return (
              <div key={k} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div
                  className="text-[10px] font-mono tracking-[0.3em] uppercase mb-2"
                  style={{ color: m.color }}
                >
                  {m.label}
                </div>
                <ul className="space-y-2 text-sm">
                  {items.map((it: RelatedLink) => (
                    <li key={it.href}>
                      <HoverPreview
                        href={it.href}
                        align="start"
                        className="text-white/80 hover:text-white inline-block leading-snug"
                      >
                        {it.label} <span className="text-white/30">→</span>
                      </HoverPreview>
                      {it.hint && (
                        <p className="text-[11px] text-white/45 italic mt-0.5 leading-snug">
                          {it.hint}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

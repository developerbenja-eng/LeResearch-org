'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface TOCItem {
  id: string;
  num: string;
  label: string;
  density?: 'text' | 'figure' | 'data' | 'audio';
}

const DENSITY_GLYPH: Record<NonNullable<TOCItem['density']>, string> = {
  text: '¶',
  figure: '◇',
  data: '▤',
  audio: '◐',
};

export function TOCRail({ items }: { items: TOCItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el != null);
    if (headings.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // pick the heading nearest the top of the viewport that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  return (
    <aside
      ref={containerRef}
      className="hidden lg:block sticky top-24 self-start w-56 shrink-0 pr-6"
      aria-label="Section navigation"
    >
      <Link
        href="/ai"
        className="block text-[10px] font-mono tracking-[0.35em] uppercase text-white/30 hover:text-white/60 mb-6 transition-colors"
      >
        ← AI investigation
      </Link>
      <nav className="space-y-1">
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="group flex items-baseline gap-3 py-1 transition-colors"
              style={{ color: isActive ? 'rgba(245,245,247,0.95)' : 'rgba(245,245,247,0.40)' }}
            >
              <span
                className="text-[9px] font-mono shrink-0 w-4 transition-colors"
                style={{ color: isActive ? 'rgba(167,139,250,0.85)' : 'rgba(245,245,247,0.20)' }}
              >
                {it.num}
              </span>
              <span className="text-sm leading-snug">{it.label}</span>
              {it.density && (
                <span
                  aria-hidden
                  className="ml-auto text-[10px] shrink-0 font-mono"
                  style={{ color: isActive ? 'rgba(245,245,247,0.50)' : 'rgba(245,245,247,0.18)' }}
                  title={it.density}
                >
                  {DENSITY_GLYPH[it.density]}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

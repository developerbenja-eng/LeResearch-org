'use client';

import { useEffect, useState } from 'react';
import type { TOCItem } from './TOCRail';

/**
 * Mobile-only sticky TOC. Horizontal scrollable pill bar with the
 * section pills. The active section pill auto-scrolls into view.
 * Hidden on lg+ (where TOCRail takes over).
 */
export function MobileTOC({ items }: { items: TOCItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el != null);
    if (headings.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 },
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  // Auto-scroll active pill into view
  useEffect(() => {
    const el = document.getElementById(`mobile-toc-${active}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [active]);

  return (
    <nav
      aria-label="Section navigation"
      className="lg:hidden sticky top-14 z-30 px-6 py-2 backdrop-blur-md border-b border-white/5"
      style={{ backgroundColor: 'rgba(10, 10, 26, 0.85)' }}
    >
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <a
              key={it.id}
              id={`mobile-toc-${it.id}`}
              href={`#${it.id}`}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors"
              style={{
                borderColor: isActive ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.10)',
                backgroundColor: isActive ? 'rgba(167,139,250,0.10)' : 'transparent',
                color: isActive ? 'rgba(245,245,247,0.95)' : 'rgba(245,245,247,0.55)',
              }}
            >
              <span
                style={{ color: isActive ? 'rgba(167,139,250,0.85)' : 'rgba(245,245,247,0.30)' }}
                className="text-[10px]"
              >
                {it.num}
              </span>
              <span>{it.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

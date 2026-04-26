'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ancestorTrail } from './route-registry';

/**
 * Global breadcrumb under the TopNav. Derives the trail from
 * usePathname() + the route registry.
 *
 * Hidden on the homepage (the TopNav wordmark already serves as the
 * "you are here" affordance there).
 */

export function SiteCrumbs() {
  const pathname = usePathname() || '/';
  if (pathname === '/') return null;

  const trail = ancestorTrail(pathname);
  // Always end with the current page; if it isn't in the registry, show the
  // last URL segment as a fallback so the breadcrumb still makes sense.
  if (!trail.length || trail[trail.length - 1].href !== pathname) {
    const lastSeg = pathname.split('/').filter(Boolean).pop() ?? '';
    trail.push({ href: pathname, short: lastSeg, title: pathname });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-14 z-40 backdrop-blur-md border-b border-white/5"
      style={{ backgroundColor: 'rgba(10, 10, 26, 0.65)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-9 flex items-center overflow-x-auto scrollbar-hide">
        <ol className="flex items-center gap-2 text-[11px] font-mono tracking-wider whitespace-nowrap">
          {trail.map((entry, i) => {
            const isLast = i === trail.length - 1;
            return (
              <li key={entry.href} className="flex items-center gap-2">
                {i > 0 && <span className="text-white/20">/</span>}
                {isLast ? (
                  <span className="text-white/75 uppercase">{entry.short}</span>
                ) : (
                  <Link
                    href={entry.href}
                    className="text-white/40 hover:text-white transition-colors uppercase"
                  >
                    {entry.short}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

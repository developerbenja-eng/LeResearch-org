'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Volume2, MapPin, BookOpen, CheckSquare, Brain, Search, CalendarDays, Plane, Globe, Laugh } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/here-now', label: 'Here Now', icon: Compass },
  { href: '/find', label: 'Quick ID', icon: Search },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/sounds', label: 'Sounds', icon: Volume2 },
  { href: '/spots', label: 'Spots', icon: MapPin },
  { href: '/migrations', label: 'Where They Go', icon: Globe },
  { href: '/trips', label: 'TN Trips', icon: Plane },
  { href: '/funny', label: 'Reddit', icon: Laugh },
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/lifelist', label: 'My List', icon: CheckSquare },
];

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg shrink-0
        ${active
          ? 'text-white bg-birds-surface-light'
          : 'text-birds-dim hover:text-birds-text hover:bg-birds-surface-light/50'
        }
      `}
    >
      {children}
      {active && (
        <motion.div
          layoutId="birds-nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 via-amber-400 to-sky-400"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function BirdsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen bg-birds-bg text-birds-text">
      <style jsx global>{`
        :root {
          --birds-bg: #0b1220;
          --birds-surface: #0f172a;
          --birds-surface-light: #1e293b;
          --birds-text: #f1f5f9;
          --birds-text-dim: #94a3b8;
          --birds-border: rgba(148, 163, 184, 0.15);
          --birds-sky: #38bdf8;
          --birds-amber: #fbbf24;
          --birds-glow: rgba(56, 189, 248, 0.25);
        }

        .bg-birds-bg { background-color: var(--birds-bg); }
        .bg-birds-surface { background-color: var(--birds-surface); }
        .bg-birds-surface-light { background-color: var(--birds-surface-light); }
        .text-birds-text { color: var(--birds-text); }
        .text-birds-dim { color: var(--birds-text-dim); }
        .border-birds { border-color: var(--birds-border); }
        .text-birds-sky { color: var(--birds-sky); }
        .text-birds-amber { color: var(--birds-amber); }

        @keyframes birds-pulse {
          0%, 100% {
            box-shadow: 0 0 20px var(--birds-glow);
          }
          50% {
            box-shadow: 0 0 40px var(--birds-glow), 0 0 60px rgba(251, 191, 36, 0.15);
          }
        }

        .birds-glow {
          animation: birds-pulse 3s ease-in-out infinite;
        }

        /* Subtle sky-gradient wash for depth */
        .birds-sky-wash {
          background-image:
            radial-gradient(ellipse at top, rgba(56, 189, 248, 0.08), transparent 60%),
            radial-gradient(ellipse at bottom, rgba(251, 191, 36, 0.05), transparent 60%);
        }
      `}</style>

      {/* Ambient sky wash */}
      <div className="fixed inset-0 pointer-events-none z-0 birds-sky-wash" />

      {/* Nav */}
      {!isHome && (
        <nav className="sticky top-0 left-0 right-0 z-50 bg-birds-surface/90 backdrop-blur-md border-b border-birds">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-14 gap-1 overflow-x-auto scrollbar-hide">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-birds-dim hover:text-birds-text hover:bg-birds-surface-light transition-colors shrink-0"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Birds</span>
              </Link>
              <div className="w-px h-6 bg-birds-border mx-2 shrink-0" />
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <NavLink key={item.href} href={item.href} active={isActive}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative z-10 ${!isHome ? 'pt-4' : ''}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

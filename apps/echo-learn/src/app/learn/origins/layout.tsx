'use client';

import { useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Users, Lightbulb, Layers, Workflow } from 'lucide-react';

// Floating background icons - primordial/knowledge theme
const ORIGINS_ICONS = ['📜', '🔮', '⚡', '🌍', '🔗', '💡', '⏳', '🧠', '📚', '🏛️', '💼', '📡'];

// Navigation items
const NAV_ITEMS = [
  { href: '/learn/origins/loom', label: 'The Loom', icon: Workflow },
  { href: '/learn/origins/timelines', label: 'Timelines', icon: Clock },
  { href: '/learn/origins/thinkers', label: 'Thinkers', icon: Users },
  { href: '/learn/origins/shifts', label: 'Shifts', icon: Lightbulb },
  { href: '/learn/origins/frameworks', label: 'Frameworks', icon: Layers },
];

function generateFloatingElements(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    icon: ORIGINS_ICONS[i % ORIGINS_ICONS.length],
    left: `${(i * 7.3) % 100}%`,
    top: `${(i * 13.7) % 100}%`,
    delay: i * 0.3,
    duration: 10 + (i % 5),
  }));
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg
        ${active
          ? 'text-white bg-origins-surface-light'
          : 'text-origins-dim hover:text-origins-text hover:bg-origins-surface-light/50'
        }
      `}
    >
      {children}
      {active && (
        <motion.div
          layoutId="origins-nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

export default function OriginsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/learn/origins';
  const floatingElements = useMemo(() => generateFloatingElements(15), []);

  return (
    <div className="min-h-screen bg-origins-bg text-origins-text">
      {/* Global Styles */}
      <style jsx global>{`
        :root {
          --origins-bg: #0c0a09;
          --origins-surface: #1c1917;
          --origins-surface-light: #292524;
          --origins-text: #fafaf9;
          --origins-text-dim: #a8a29e;
          --origins-border: rgba(168, 162, 158, 0.15);
          --origins-accent: #a78bfa;
          --origins-gold: #fbbf24;
          --origins-glow: rgba(167, 139, 250, 0.3);
        }

        .bg-origins-bg { background-color: var(--origins-bg); }
        .bg-origins-surface { background-color: var(--origins-surface); }
        .bg-origins-surface-light { background-color: var(--origins-surface-light); }
        .text-origins-text { color: var(--origins-text); }
        .text-origins-dim { color: var(--origins-text-dim); }
        .border-origins { border-color: var(--origins-border); }
        .text-origins-accent { color: var(--origins-accent); }
        .text-origins-gold { color: var(--origins-gold); }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.06;
          }
          50% {
            transform: translateY(-30px) rotate(10deg);
            opacity: 0.12;
          }
        }

        .animate-float-slow {
          animation: float-slow var(--duration, 10s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        @keyframes origins-pulse {
          0%, 100% {
            box-shadow: 0 0 20px var(--origins-glow);
          }
          50% {
            box-shadow: 0 0 40px var(--origins-glow), 0 0 60px rgba(251, 191, 36, 0.2);
          }
        }

        .origins-glow {
          animation: origins-pulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute text-2xl animate-float-slow select-none"
            style={{
              left: el.left,
              top: el.top,
              ['--delay' as string]: `${el.delay}s`,
              ['--duration' as string]: `${el.duration}s`,
            }}
          >
            {el.icon}
          </div>
        ))}

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/10 via-transparent to-amber-950/10" />
      </div>

      {/* Navigation - show when not on home */}
      {!isHome && (
        <nav className="sticky top-0 left-0 right-0 z-50 bg-origins-surface/90 backdrop-blur-md border-b border-origins">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-14 gap-1 overflow-x-auto scrollbar-hide">
              {/* Home button */}
              <Link
                href="/learn/origins"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-origins-dim hover:text-origins-text hover:bg-origins-surface-light transition-colors shrink-0"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Origins</span>
              </Link>

              {/* Divider */}
              <div className="w-px h-6 bg-origins-border mx-2 shrink-0" />

              {/* Nav items */}
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

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`relative z-10 ${!isHome ? 'pt-4' : ''}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

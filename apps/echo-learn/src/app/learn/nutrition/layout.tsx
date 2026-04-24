'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, Scale, BarChart3, HelpCircle, Users } from 'lucide-react';

// Pre-generate floating elements for background
const NUTRITION_ICONS = ['🥕', '🍎', '🥬', '🍋', '🥩', '🧬', '⚗️', '📊'];
function generateFloatingElements(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 19 + 7) % 100}%`,
    top: `${(i * 11 + 5) % 100}%`,
    delay: `${(i * 0.4) % 6}s`,
    duration: `${5 + (i % 4)}s`,
    fontSize: `${14 + (i % 8)}px`,
    icon: NUTRITION_ICONS[i % NUTRITION_ICONS.length],
  }));
}

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/learn/nutrition';

  // Memoize floating elements
  const floatingElements = useMemo(() => generateFloatingElements(20), []);

  return (
    <div className="min-h-screen bg-nutrition-bg text-nutrition-text">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-nutrition-bg via-nutrition-bg to-nutrition-surface" />
        {/* Floating nutrition icons */}
        <div className="absolute inset-0 opacity-10">
          {floatingElements.map((el) => (
            <div
              key={el.id}
              className="absolute animate-float-slow"
              style={{
                left: el.left,
                top: el.top,
                animationDelay: el.delay,
                animationDuration: el.duration,
                fontSize: el.fontSize,
              }}
            >
              {el.icon}
            </div>
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-green-950/20 to-transparent" />
      </div>

      {/* Navigation */}
      {!isHome && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-nutrition-bg/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/learn/nutrition"
              className="flex items-center gap-3 text-nutrition-text hover:text-white transition-colors"
            >
              <span className="text-2xl">🥗</span>
              <span className="font-serif text-xl tracking-wide">ECHO NOURISH</span>
            </Link>

            <div className="flex items-center gap-4">
              <NavLink href="/learn/nutrition/timeline" active={pathname.startsWith('/learn/nutrition/timeline')}>
                <History className="w-4 h-4 mr-1.5" />
                Timeline
              </NavLink>
              <NavLink href="/learn/nutrition/measurement" active={pathname.startsWith('/learn/nutrition/measurement')}>
                <Scale className="w-4 h-4 mr-1.5" />
                Measurement
              </NavLink>
              <NavLink href="/learn/nutrition/standards" active={pathname.startsWith('/learn/nutrition/standards')}>
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Standards
              </NavLink>
              <NavLink href="/learn/nutrition/mysteries" active={pathname.startsWith('/learn/nutrition/mysteries')}>
                <HelpCircle className="w-4 h-4 mr-1.5" />
                Mysteries
              </NavLink>
              <NavLink href="/learn/nutrition/pioneers" active={pathname.startsWith('/learn/nutrition/pioneers')}>
                <Users className="w-4 h-4 mr-1.5" />
                Pioneers
              </NavLink>
            </div>
          </div>
        </nav>
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`relative z-10 ${!isHome ? 'pt-16' : ''}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Global styles for Nutrition module */}
      <style jsx global>{`
        :root {
          --nutrition-bg: #0f1612;
          --nutrition-surface: #1a2420;
          --nutrition-surface-light: #243530;
          --nutrition-text: #e5ebe8;
          --nutrition-text-dim: #9ca8a3;
          --nutrition-border: rgba(255, 255, 255, 0.1);
          --nutrition-glow: rgba(34, 197, 94, 0.3);
          --nutrition-accent: #22c55e;
          --nutrition-accent-light: #4ade80;
          --nutrition-warm: #f59e0b;
        }

        .bg-nutrition-bg { background-color: var(--nutrition-bg); }
        .bg-nutrition-surface { background-color: var(--nutrition-surface); }
        .bg-nutrition-surface-light { background-color: var(--nutrition-surface-light); }
        .text-nutrition-text { color: var(--nutrition-text); }
        .text-nutrition-dim { color: var(--nutrition-text-dim); }
        .border-nutrition { border-color: var(--nutrition-border); }
        .text-nutrition-accent { color: var(--nutrition-accent); }

        /* Floating animation */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.2; }
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        /* Pulse for interactive elements */
        @keyframes nutrition-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .animate-nutrition-pulse {
          animation: nutrition-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
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
        relative flex items-center px-3 py-2 text-sm font-medium transition-colors
        ${active ? 'text-white' : 'text-nutrition-dim hover:text-nutrition-text'}
      `}
    >
      {children}
      {active && (
        <motion.div
          layoutId="nutrition-nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

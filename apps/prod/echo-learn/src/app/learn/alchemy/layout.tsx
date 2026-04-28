'use client';

import { ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Flame, Thermometer, Atom, TestTube, Home } from 'lucide-react';

interface AlchemyLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: '/learn/alchemy/reactions', label: 'Reactions', icon: FlaskConical },
  { href: '/learn/alchemy/techniques', label: 'Techniques', icon: Flame },
  { href: '/learn/alchemy/temperature', label: 'Temperature', icon: Thermometer },
  { href: '/learn/alchemy/molecules', label: 'Molecules', icon: Atom },
  { href: '/learn/alchemy/lab', label: 'Lab', icon: TestTube },
];

const FLOATING_ICONS = ['🔥', '⚗️', '🧪', '🍳', '🌡️', '🧬', '🥘', '🍯', '🧈', '🌶️', '🧄', '🍞'];

export default function AlchemyLayout({ children }: AlchemyLayoutProps) {
  const pathname = usePathname();
  const isHome = pathname === '/learn/alchemy';

  const floatingElements = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      icon: FLOATING_ICONS[i % FLOATING_ICONS.length],
      left: `${(i * 7.3) % 100}%`,
      top: `${(i * 13.7) % 100}%`,
      delay: i * 0.3,
      duration: 8 + (i % 5),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-alchemy-bg text-alchemy-text">
      <style jsx global>{`
        :root {
          --alchemy-bg: #1a1410;
          --alchemy-surface: #2a1f18;
          --alchemy-surface-light: #3d2e24;
          --alchemy-text: #f5ebe0;
          --alchemy-text-dim: #b8a99a;
          --alchemy-border: rgba(255, 200, 150, 0.15);
          --alchemy-accent: #d97706;
          --alchemy-accent-light: #f59e0b;
          --alchemy-copper: #b45309;
          --alchemy-flame: #dc2626;
          --alchemy-heat: #f97316;
          --alchemy-glow: rgba(217, 119, 6, 0.4);
          --alchemy-flame-glow: rgba(220, 38, 38, 0.3);
        }

        .bg-alchemy-bg { background-color: var(--alchemy-bg); }
        .bg-alchemy-surface { background-color: var(--alchemy-surface); }
        .bg-alchemy-surface-light { background-color: var(--alchemy-surface-light); }
        .text-alchemy-text { color: var(--alchemy-text); }
        .text-alchemy-dim { color: var(--alchemy-text-dim); }
        .text-alchemy-accent { color: var(--alchemy-accent); }
        .border-alchemy { border-color: var(--alchemy-border); }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.08;
          }
          50% {
            transform: translateY(-25px) rotate(8deg);
            opacity: 0.15;
          }
        }

        @keyframes flame-flicker {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1) translateY(0);
          }
          25% {
            opacity: 0.8;
            transform: scale(1.05) translateY(-2px);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.98) translateY(1px);
          }
          75% {
            opacity: 0.9;
            transform: scale(1.02) translateY(-1px);
          }
        }

        @keyframes alchemy-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        .animate-float-slow {
          animation: float-slow var(--duration, 10s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        .animate-flame-flicker {
          animation: flame-flicker 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow,
          .animate-flame-flicker {
            animation: none;
          }
        }
      `}</style>

      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
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
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-950/20" />
      </div>

      {/* Navigation */}
      {!isHome && (
        <nav className="sticky top-0 left-0 right-0 z-50 bg-alchemy-surface/90 backdrop-blur-md border-b border-alchemy">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center h-14 gap-1 overflow-x-auto scrollbar-hide">
              <Link
                href="/learn/alchemy"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-alchemy-dim hover:text-alchemy-text hover:bg-alchemy-surface-light transition-colors shrink-0"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Alchemy</span>
              </Link>

              <div className="w-px h-6 bg-alchemy-border mx-2 shrink-0" />

              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shrink-0 ${
                      isActive
                        ? 'text-alchemy-accent'
                        : 'text-alchemy-dim hover:text-alchemy-text hover:bg-alchemy-surface-light'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="alchemy-nav-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
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
          className="relative z-10"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

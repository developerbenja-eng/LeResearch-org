'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Eye, Gamepad2, Sparkles, Zap, PenTool, Globe, Mic, SlidersHorizontal } from 'lucide-react';

// Pre-generate floating note data to avoid Math.random during render
const MUSIC_NOTES = ['♪', '♫', '♬', '♩'];
function generateFloatingNotes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 5) % 100}%`,
    top: `${(i * 13 + 3) % 100}%`,
    delay: `${(i * 0.3) % 5}s`,
    duration: `${4 + (i % 5)}s`,
    fontSize: `${12 + (i % 9)}px`,
    note: MUSIC_NOTES[i % 4],
  }));
}

export default function MusicHallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/learn/music';

  // Memoize floating notes so they don't regenerate on each render
  const floatingNotes = useMemo(() => generateFloatingNotes(30), []);

  return (
    <div className="min-h-screen bg-music-bg text-music-text">
      {/* Ambient wave background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-music-bg via-music-bg to-music-surface" />
        {/* Musical notes floating effect */}
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          {floatingNotes.map((note) => (
            <div
              key={note.id}
              className="absolute text-cyan-400 animate-float"
              style={{
                left: note.left,
                top: note.top,
                animationDelay: note.delay,
                animationDuration: note.duration,
                fontSize: note.fontSize,
              }}
            >
              {note.note}
            </div>
          ))}
        </div>
        {/* Gradient waves */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cyan-950/20 to-transparent" />
      </div>

      {/* Navigation */}
      {!isHome && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-music-bg/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/learn/music"
              className="flex items-center gap-3 text-music-text hover:text-white transition-colors"
            >
              <span className="text-2xl">🎵</span>
              <span className="font-serif text-xl tracking-wide">MUSIC HALL</span>
            </Link>

            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              <NavLink href="/learn/music/concepts" active={pathname.startsWith('/learn/music/concepts')}>
                <BookOpen className="w-4 h-4 mr-1.5" />
                Concepts
              </NavLink>
              <NavLink href="/learn/music/journeys" active={pathname.startsWith('/learn/music/journeys')}>
                <BookOpen className="w-4 h-4 mr-1.5" />
                Journeys
              </NavLink>
              <NavLink href="/learn/music/visualizer" active={pathname.startsWith('/learn/music/visualizer')}>
                <Eye className="w-4 h-4 mr-1.5" />
                Visualizer
              </NavLink>
              <NavLink href="/learn/music/practice" active={pathname.startsWith('/learn/music/practice')}>
                <Gamepad2 className="w-4 h-4 mr-1.5" />
                Practice
              </NavLink>
              <NavLink href="/learn/music/vocal-studio" active={pathname.startsWith('/learn/music/vocal-studio')}>
                <Mic className="w-4 h-4 mr-1.5" />
                Studio
              </NavLink>
              <NavLink href="/learn/music/decoder" active={pathname.startsWith('/learn/music/decoder')}>
                <Zap className="w-4 h-4 mr-1.5" />
                Decoder
              </NavLink>
              <NavLink href="/learn/music/producer" active={pathname.startsWith('/learn/music/producer')}>
                <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                Producer
              </NavLink>
              <NavLink href="/learn/music/create" active={pathname.startsWith('/learn/music/create')}>
                <PenTool className="w-4 h-4 mr-1.5" />
                Create
              </NavLink>
              <NavLink href="/learn/music/evolution" active={pathname.startsWith('/learn/music/evolution')}>
                <Globe className="w-4 h-4 mr-1.5" />
                Evolution
              </NavLink>
              <NavLink href="/learn/music/personas" active={pathname.startsWith('/learn/music/personas')}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Teachers
              </NavLink>
              <NavLink href="/learn/music/galaxy" active={pathname === '/learn/music/galaxy'}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Galaxy
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

      {/* Global styles for Music Hall */}
      <style jsx global>{`
        :root {
          --music-bg: #0a0f14;
          --music-surface: #111827;
          --music-surface-light: #1f2937;
          --music-text: #e5e7eb;
          --music-text-dim: #9ca3af;
          --music-border: rgba(255, 255, 255, 0.1);
          --music-glow: rgba(6, 182, 212, 0.3);
          --music-accent: #06b6d4;
          --music-accent-light: #22d3ee;

          /* Lens colors */
          --lens-technical: #3b82f6;
          --lens-visual: #22c55e;
          --lens-emotional: #ec4899;
          --lens-historical: #f59e0b;
          --lens-examples: #8b5cf6;

          /* Category colors */
          --category-chord: #22c55e;
          --category-scale: #3b82f6;
          --category-rhythm: #f59e0b;
          --category-progression: #8b5cf6;
          --category-technique: #ec4899;
        }

        .bg-music-bg { background-color: var(--music-bg); }
        .bg-music-surface { background-color: var(--music-surface); }
        .bg-music-surface-light { background-color: var(--music-surface-light); }
        .text-music-text { color: var(--music-text); }
        .text-music-dim { color: var(--music-text-dim); }
        .border-music { border-color: var(--music-border); }
        .text-music-accent { color: var(--music-accent); }

        /* Lens specific classes */
        .lens-technical { --lens-color: var(--lens-technical); }
        .lens-visual { --lens-color: var(--lens-visual); }
        .lens-emotional { --lens-color: var(--lens-emotional); }
        .lens-historical { --lens-color: var(--lens-historical); }
        .lens-examples { --lens-color: var(--lens-examples); }

        .glow-lens {
          box-shadow: 0 0 20px var(--lens-color, var(--music-glow));
        }

        /* Floating animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          75% { transform: translateY(-5px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        /* Pulse for interactive elements */
        @keyframes music-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-music-pulse {
          animation: music-pulse 2s ease-in-out infinite;
        }

        /* Waveform animation */
        @keyframes waveform {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-music-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function NavLink({
  href,
  active,
  disabled,
  children,
}: {
  href: string;
  active: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        className="flex items-center px-3 py-2 text-sm font-medium text-music-text/30 cursor-not-allowed"
        title="Coming soon"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`
        relative flex items-center px-3 py-2 text-sm font-medium transition-colors
        ${active ? 'text-white' : 'text-music-dim hover:text-music-text'}
      `}
    >
      {children}
      {active && (
        <motion.div
          layoutId="music-nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

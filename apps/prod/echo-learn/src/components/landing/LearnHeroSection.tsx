'use client';

import Link from 'next/link';
import { MyceliumBackground } from '@leresearch-org/brand';
import { BRAND } from '@/lib/brand/constants';
import { authUrls, useAuth } from '@/context/AuthContext';

function EchoLearnMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2A7.5 7.5 0 0 0 4.5 9.5C4.5 13 7 14.5 8 16L16 16C17 14.5 19.5 13 19.5 9.5A7.5 7.5 0 0 0 12 2Z" />
      <path d="M9 19L15 19M9.5 21.5L14.5 21.5" />
      <path d="M12 6L12 11M9 8.5L12 11L15 8.5" />
    </svg>
  );
}

export function LearnHeroSection() {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.name ?? null;
  const urls = authUrls();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#0a0a12] text-white">
      <MyceliumBackground intensity={0.85} />

      <div className="relative z-10 text-center max-w-3xl mx-auto py-28">
        {/* Eyebrow pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] mb-8"
          style={{ animation: 'fadeIn 0.8s ease-out forwards' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-cyan-200/70">
            {BRAND.hubs.learn.tagline}
          </span>
        </div>

        {/* Mark + title */}
        <div
          className="flex items-center justify-center gap-4 mb-8"
          style={{ animation: 'slideUp 0.8s ease-out forwards' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <EchoLearnMark className="w-7 h-7 text-cyan-300" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extralight tracking-tight">
            <span
              style={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #a5b4fc 55%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {BRAND.hubs.learn.name}
            </span>
          </h1>
        </div>

        {/* Description */}
        {userName ? (
          <p
            className="text-base sm:text-lg text-white/55 font-light leading-relaxed max-w-xl mx-auto mb-10"
            style={{ animation: 'fadeIn 1s ease-out 0.3s forwards', opacity: 0 }}
          >
            Welcome back, {userName}. Pick up where you left off — the pace, depth, and shape can still follow you.
          </p>
        ) : (
          <div
            className="text-base sm:text-lg text-white/55 font-light leading-relaxed max-w-2xl mx-auto mb-10 space-y-5 text-left sm:text-center"
            style={{ animation: 'fadeIn 1s ease-out 0.3s forwards', opacity: 0 }}
          >
            <p>
              For most of history, learning came in one shape — a fixed pace, a
              single path, a classroom built for someone else. Many of the people
              who didn&apos;t fit were told they couldn&apos;t learn.
            </p>
            <p className="text-white/70">
              We think it was the{' '}
              <em className="not-italic text-cyan-200/90">frontend</em>, not them.
              Echo Learn is our attempt at one that can bend the other way —
              following your pace, your depth, your language, the way you come in.
            </p>
          </div>
        )}

        {/* Pills — what the frontend now adapts across */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-10"
          style={{ animation: 'fadeIn 1s ease-out 0.4s forwards', opacity: 0 }}
        >
          <Pill label="Languages" />
          <Pill label="Research papers" />
          <Pill label="Philosophy" />
          <Pill label="Music theory" />
          <Pill label="Anything else" />
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animation: 'fadeIn 1s ease-out 0.5s forwards', opacity: 0 }}
        >
          {!isAuthenticated && (
            <>
              <a
                href={urls.register}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all hover:-translate-y-[1px]"
              >
                Start Learning Free
              </a>
              <Link
                href="/home?preview=true"
                className="px-8 py-3 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:border-white/20 hover:text-white/80 transition-all"
              >
                Explore Demo
              </Link>
            </>
          )}

          {isAuthenticated && (
            <Link
              href="/lingua"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all hover:-translate-y-[1px]"
            >
              Continue Learning
            </Link>
          )}
        </div>

        {/* Scroll cue */}
        <div
          className="mt-20 flex flex-col items-center gap-2"
          style={{ animation: 'fadeIn 1.5s ease-out 1.5s forwards', opacity: 0 }}
        >
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/15">
            Where the frontend bends
          </span>
          <svg
            className="w-4 h-4 text-white/15"
            style={{ animation: 'float 2.5s ease-in-out infinite' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>

      {/* Smooth fade into the rest of the page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--color-bg,_#ffffff)] dark:to-gray-900 pointer-events-none" />
    </section>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-mono tracking-[0.15em] uppercase px-3 py-1.5 rounded-full bg-white/[0.04] text-white/60 border border-white/[0.08]">
      {label}
    </span>
  );
}

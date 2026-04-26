import Link from 'next/link';

/**
 * Prev / next navigation between the four acts. Goes at the bottom of
 * every act page so a reader who finished one act can step directly
 * into the next without going back to /ai.
 */

const ACTS = [
  { num: 'I',   href: '/ai/definitions',  short: 'What is AI?' },
  { num: 'II',  href: '/ai/environment',  short: 'Environmental footprint' },
  { num: 'III', href: '/ai/tracking',     short: 'Who is watching?' },
  { num: 'IV',  href: '/ai/real-problem', short: 'The real problem' },
] as const;

export function ActPager({ current }: { current: 'I' | 'II' | 'III' | 'IV' }) {
  const i = ACTS.findIndex((a) => a.num === current);
  const prev = i > 0 ? ACTS[i - 1] : null;
  const next = i < ACTS.length - 1 ? ACTS[i + 1] : null;

  return (
    <nav
      className="max-w-3xl mx-auto px-6 my-16 grid grid-cols-2 gap-4"
      aria-label="Act navigation"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
        >
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-1">
            ← Previous · Act {prev.num}
          </div>
          <div className="text-base text-white/85 group-hover:text-white">
            {prev.short}
          </div>
        </Link>
      ) : (
        <Link
          href="/investigations/ai-discourse"
          className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
        >
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-1">
            ← Back to index
          </div>
          <div className="text-base text-white/85 group-hover:text-white">
            All four acts
          </div>
        </Link>
      )}

      {next ? (
        <Link
          href={next.href}
          className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 text-right hover:bg-white/[0.05] hover:border-white/20 transition-colors"
        >
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-1">
            Next · Act {next.num} →
          </div>
          <div className="text-base text-white/85 group-hover:text-white">
            {next.short}
          </div>
        </Link>
      ) : (
        <Link
          href="/investigations/ai-discourse"
          className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 text-right hover:bg-white/[0.05] hover:border-white/20 transition-colors"
        >
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-1">
            Back to index →
          </div>
          <div className="text-base text-white/85 group-hover:text-white">
            All four acts
          </div>
        </Link>
      )}
    </nav>
  );
}

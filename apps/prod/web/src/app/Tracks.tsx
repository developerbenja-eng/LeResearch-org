import { TRACKS, type Track } from '@/lib/content';

const STATUS_BADGE: Record<Track['status'], { label: string; className: string }> = {
  active:  { label: 'Active',  className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  forming: { label: 'Forming', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  target:  { label: 'Target',  className: 'bg-white/5 text-white/50 border-white/10' },
};

export default function Tracks() {
  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
          Research tracks
        </div>
        <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
          Five substrates the silo-collapse thesis is being tested on.
        </h2>
        <p className="text-base leading-relaxed text-white/60 max-w-2xl mb-16">
          Each track is a domain where the inherited frame is part of
          the problem. Tracks can be added, merged, or retired by the
          board when a substrate genuinely fits the thesis. The method
          is the constant; the substrates are not.
        </p>

        <div className="grid gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {TRACKS.map((t) => (
            <article
              key={t.num}
              className="bg-[var(--bg)] px-8 py-10 hover:bg-white/[0.015] transition-colors"
            >
              <header className="flex items-start gap-6 flex-wrap">
                <div className="text-5xl font-extralight text-white/20 leading-none shrink-0 mt-1">
                  {t.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="text-xl font-light text-white/90 leading-tight">
                      {t.name}
                    </h3>
                    <span
                      className={`inline-block text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border ${STATUS_BADGE[t.status].className}`}
                    >
                      {STATUS_BADGE[t.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    {t.blurb}
                  </p>
                </div>
              </header>
              <p className="mt-5 pl-[4.5rem] text-sm leading-relaxed text-white/70">
                {t.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

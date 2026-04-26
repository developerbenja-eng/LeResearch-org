export default function Hero() {
  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center px-6 overflow-hidden">
      <div
        aria-hidden
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)' }}
      />

      <main className="relative text-center max-w-3xl">
        <div
          className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6"
          style={{ animation: 'fadeIn 1s ease-out forwards', opacity: 0 }}
        >
          LeResearch · 501(c)(3) in formation
        </div>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight text-white/90"
          style={{ animation: 'slideUp 0.8s ease-out forwards' }}
        >
          A small contribution
        </h1>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight mt-2"
          style={{
            animation: 'slideUp 0.8s ease-out 0.15s forwards',
            opacity: 0,
            background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          to the silos&apos;s fall.
        </h1>

        <p
          className="mt-10 text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl mx-auto"
          style={{ animation: 'fadeIn 1s ease-out 0.6s forwards', opacity: 0 }}
        >
          A small team doing careful, open, cross-disciplinary research on
          problems where the inherited frame is part of the problem.
          Environmental systems, household nutrition, learning frontends,
          and the epistemic ecology of AI-mediated knowledge — the domain
          is not fixed, the method is.
        </p>

        <div
          className="mt-16 flex flex-col items-center gap-2"
          style={{ animation: 'fadeIn 1.5s ease-out 1.5s forwards', opacity: 0 }}
        >
          <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/30">
            Scroll to explore
          </span>
          <svg
            className="w-5 h-5 text-white/20"
            style={{ animation: 'float 2s ease-in-out infinite' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </main>
    </section>
  );
}

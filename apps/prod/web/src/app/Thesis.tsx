export default function Thesis() {
  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
          Why a separate nonprofit
        </div>
        <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-8">
          Research on epistemic hygiene isn&apos;t a product requirement
          that resolves in eighteen months.
        </h2>
        <div className="space-y-5 text-base leading-relaxed text-white/70">
          <p>
            AI broke the silos open. It also{' '}
            <span className="text-white/90">compressed</span> them into
            one confident-sounding voice, trained on a record weighted by
            whichever paradigm got to decide what deserved to be written.
            The compression layer is commercially governed and silently
            versioned. The answer returned today is not the answer that
            would have been returned last quarter, and the people using
            the model typically do not know.
          </p>
          <p>
            If a society routes its default truth-formation through a
            small number of privately-governed, silently-versioned models,
            the capacity for collective error-correction gets thinner.
            The early sign is not obvious collapse — it&apos;s that
            disagreement starts to feel eccentric rather than ordinary,
            and &ldquo;the AI says&rdquo; replaces &ldquo;science
            says&rdquo; as the argument-ender.
          </p>
          <p>
            LeResearch exists to hold that tension — slow, unresolved,
            across substrates no product roadmap would fund. It is the
            other half of the LeDesign thesis, made legal.
          </p>
        </div>

        <div className="mt-10">
          <a
            href="https://github.com/developerbenja-eng/LeDesign-ai/blob/main/docs/ledesign-philosophy.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-white/50 hover:text-white transition-colors border-b border-white/10 hover:border-white/40 pb-1"
          >
            Full philosophy
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

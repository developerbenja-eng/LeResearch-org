export default function Footer() {
  return (
    <footer className="relative z-10 px-6 py-16 border-t border-white/5">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-1">
            LeResearch
          </div>
          <div className="text-sm text-white/60">
            A small contribution to the silos&apos;s fall.
          </div>
        </div>

        <nav className="flex items-center gap-6 text-[11px] font-mono tracking-wider uppercase text-white/40">
          <a
            href="https://ledesign.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            LeDesign.ai ↗
          </a>
          <a
            href="https://github.com/developerbenja-eng/LeResearch-org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub ↗
          </a>
          <a
            href="mailto:hello@leresearch.org"
            className="hover:text-white transition-colors"
          >
            Email
          </a>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-white/5 text-[10px] font-mono tracking-wider text-white/25">
        © {new Date().getFullYear()} LeResearch (501(c)(3) in formation).
        Content under CC-BY 4.0 unless otherwise noted.
      </div>
    </footer>
  );
}

import Link from 'next/link';

export default function TopNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg)]/70 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-light text-white/90 hover:text-white transition-colors"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}
            aria-hidden
          />
          LeResearch
        </Link>

        <div className="flex items-center gap-4 sm:gap-5 text-[11px] font-mono tracking-wider uppercase text-white/50">
          <Link href="/thesis" className="hover:text-white transition-colors">
            Thesis
          </Link>
          <Link href="/investigations" className="hover:text-white transition-colors">
            Investigations
          </Link>
          <Link href="/initiatives" className="hover:text-white transition-colors hidden sm:inline">
            Initiatives
          </Link>
          <Link href="/tracks" className="hover:text-white transition-colors hidden sm:inline">
            Tracks
          </Link>
          <Link href="/about" className="hover:text-white transition-colors hidden md:inline">
            About
          </Link>
          <a
            href="https://ledesign.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors hidden lg:inline"
          >
            LeDesign ↗
          </a>
          <a
            href="https://github.com/developerbenja-eng/LeResearch-org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors hidden lg:inline"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </nav>
  );
}

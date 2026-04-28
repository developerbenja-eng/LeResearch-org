/**
 * Visual divider + header for each section. Combines:
 *   - Section number (00, 01, ...) and one-line label
 *   - Big section title (h2)
 *   - One-sentence "what this section says" takeaway in semantic color
 *   - A horizontal accent bar in the kind's color
 *
 * Use as the first child of a <section> in long-form pages.
 */

type Kind = 'thesis' | 'doom' | 'displaced' | 'hype' | 'public' | 'risk' | 'program';

interface SectionHeaderProps {
  num: string;
  label: string;
  title: string;
  takeaway: string;
  kind?: Kind;
}

const KIND_ACCENT: Record<Kind, string> = {
  thesis:    'rgba(167,139,250,0.85)', // violet — the integrating
  doom:      'rgba(239,68,68,0.85)',   // red
  displaced: 'rgba(245,158,11,0.85)',  // amber
  hype:      'rgba(239,68,68,0.85)',   // red (same as doom — same mechanism)
  public:    'rgba(96,165,250,0.85)',  // blue — empirical
  risk:      'rgba(245,158,11,0.85)',  // amber
  program:   'rgba(34,197,94,0.85)',   // green — what to do
};

export function SectionHeader({ num, label, title, takeaway, kind = 'thesis' }: SectionHeaderProps) {
  const accent = KIND_ACCENT[kind];
  return (
    <header className="mb-8">
      {/* Number + label row */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-[10px] font-mono tracking-[0.3em] uppercase"
          style={{ color: accent }}
        >
          {num} · {label}
        </span>
        <span
          aria-hidden
          className="flex-1 h-px"
          style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-extralight text-white/90 leading-tight mb-3">
        {title}
      </h2>

      {/* Takeaway */}
      <p
        className="text-sm sm:text-base leading-relaxed border-l-2 pl-3"
        style={{ borderColor: accent, color: 'rgba(245,245,247,0.78)' }}
      >
        {takeaway}
      </p>
    </header>
  );
}

/**
 * The "read in 30 seconds" hero strip.
 * Three side-by-side cards giving the reader the act in one screen,
 * before they scroll into the figure or the prose.
 *
 * Generic — pass `items` per page. Each item picks a `kind` from the
 * shared semantic palette so the color scheme stays consistent across
 * acts.
 */

export type TLDRKind =
  | 'doom' | 'displaced' | 'hype'              // Act IV (real problem)
  | 'small' | 'spectrum' | 'systemic'           // Act II (environment)
  | 'regulatory' | 'academic' | 'critical';     // Act I (definitions)

export interface TLDRItem {
  kind: TLDRKind;
  label: string;
  thesis: string;
  beneficiary?: string;
  example: string;
}

const STYLE: Record<TLDRKind, { ring: string; tint: string; accent: string; glyph: string }> = {
  // discourse pincer (Act IV)
  doom:      { ring: 'rgba(239,68,68,0.45)',  tint: 'rgba(239,68,68,0.05)',  accent: '#ef4444', glyph: '↓' },
  displaced: { ring: 'rgba(245,158,11,0.55)', tint: 'rgba(245,158,11,0.06)', accent: '#f59e0b', glyph: '◎' },
  hype:      { ring: 'rgba(239,68,68,0.45)',  tint: 'rgba(239,68,68,0.05)',  accent: '#ef4444', glyph: '↑' },
  // environment (Act II)
  small:     { ring: 'rgba(34,197,94,0.45)',  tint: 'rgba(34,197,94,0.05)',  accent: '#22c55e', glyph: '·' },  // per-query is small
  spectrum:  { ring: 'rgba(167,139,250,0.55)',tint: 'rgba(167,139,250,0.06)',accent: '#a78bfa', glyph: '⋮' },  // many things
  systemic:  { ring: 'rgba(245,158,11,0.55)', tint: 'rgba(245,158,11,0.06)', accent: '#f59e0b', glyph: '⚠' },  // system-level concern
  // definitions (Act I)
  regulatory:{ ring: 'rgba(96,165,250,0.55)', tint: 'rgba(96,165,250,0.06)', accent: '#60a5fa', glyph: '§' },  // government / standards
  academic:  { ring: 'rgba(167,139,250,0.55)',tint: 'rgba(167,139,250,0.06)',accent: '#a78bfa', glyph: '◊' },  // textbook / labs
  critical:  { ring: 'rgba(245,158,11,0.55)', tint: 'rgba(245,158,11,0.06)', accent: '#f59e0b', glyph: '?' },  // sociotechnical / Tesler
};

export function TLDRStrip({
  items,
  caption,
  heading = 'Read in 30 seconds',
}: {
  items: TLDRItem[];
  caption?: React.ReactNode;
  heading?: string;
}) {
  return (
    <div className="my-10">
      <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">
        {heading}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((it, i) => {
          const s = STYLE[it.kind];
          return (
            <div
              key={`${it.kind}-${i}`}
              className="relative rounded-xl border p-5 flex flex-col"
              style={{ borderColor: s.ring, backgroundColor: s.tint, minHeight: 200 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl leading-none font-mono" style={{ color: s.accent }} aria-hidden>
                  {s.glyph}
                </span>
                <span
                  className="text-[10px] font-mono tracking-[0.3em] uppercase"
                  style={{ color: s.accent }}
                >
                  {it.label}
                </span>
              </div>

              <p className="text-sm text-white/85 leading-snug mb-2">{it.thesis}</p>

              {it.beneficiary ? (
                <p
                  className="text-[11px] font-mono tracking-wider mb-3"
                  style={{ color: s.accent, opacity: 0.85 }}
                >
                  → {it.beneficiary}
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <p className="text-xs text-white/55 leading-relaxed mt-auto italic">
                {it.example}
              </p>
            </div>
          );
        })}
      </div>

      {caption && (
        <p className="text-xs text-white/40 mt-3 italic leading-relaxed">{caption}</p>
      )}
    </div>
  );
}

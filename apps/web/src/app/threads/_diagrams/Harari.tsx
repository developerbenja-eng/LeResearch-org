import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Harari — intersubjective myth at species scale.
 * A central myth-node radiates to thousands of believers; the myth
 * is real because enough people share belief in it. Larger than
 * Dunbar; only humans can sustain it.
 */

export function HarariDiagram() {
  const W = 640;
  const H = 340;

  // Believers — many small dots in a wide ring
  const BELIEVERS: { x: number; y: number }[] = [];
  const CX = W / 2;
  const CY = H / 2 - 20;
  for (let i = 0; i < 160; i++) {
    const angle = (i / 160) * Math.PI * 2;
    const r = 100 + (i % 4) * 18;
    BELIEVERS.push({
      x: CX + r * Math.cos(angle),
      y: CY + r * Math.sin(angle) * 0.65,
    });
  }

  return (
    <FigShell
      title="Intersubjective myth — real because shared"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          A myth — money, the nation, the LLC, human rights, time
          zones — is{' '}
          <em>intersubjective</em>: it exists because enough people
          believe it does, and act accordingly. Not in any one head;
          not in the physical world; in the shared belief. Withdraw the
          belief from enough heads and the myth dissolves. Bigger than
          Dunbar in scale, only humans appear to sustain it.
        </>
      }
    >
      {/* Believer dots */}
      {BELIEVERS.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={1.5}
          fill="rgba(167,139,250,0.55)" />
      ))}

      {/* Belief lines from each believer to the center (only every 6th to avoid clutter) */}
      {BELIEVERS.filter((_, i) => i % 6 === 0).map((b, i) => (
        <line key={`l-${i}`}
          x1={b.x} y1={b.y} x2={CX} y2={CY}
          stroke="rgba(245,158,11,0.10)" strokeWidth={0.5}
        />
      ))}

      {/* Central myth node */}
      <g>
        <circle cx={CX} cy={CY} r={48}
          fill="rgba(245,158,11,0.10)" stroke={COLORS.amber} strokeWidth={1.5} />
        <text x={CX} y={CY - 16} fill={COLORS.amber} fontSize={9} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
          THE MYTH
        </text>
        <text x={CX} y={CY + 2} fill={COLORS.text} fontSize={11} textAnchor="middle">
          money
        </text>
        <text x={CX} y={CY + 18} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          (or nation, LLC,
        </text>
        <text x={CX} y={CY + 30} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          human rights, GMT)
        </text>
      </g>

      {/* Ring labels */}
      <text x={20} y={CY + 4} fill={COLORS.violet} fontSize={10} fontFamily="monospace" letterSpacing={2}>
        ↑ believers
      </text>
      <text x={W - 30} y={CY + 4} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="end">
        scale &gt; Dunbar
      </text>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(245,158,11,0.08)" stroke={COLORS.amber} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.amber} fontSize={10} textAnchor="middle" fontWeight={600}>
          Real because shared. Withdraw the belief from enough heads and the myth dissolves.
        </text>
      </g>
    </FigShell>
  );
}

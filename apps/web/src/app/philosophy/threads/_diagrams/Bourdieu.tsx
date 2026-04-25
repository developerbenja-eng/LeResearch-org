import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Bourdieu — doxa and habitus.
 * The "space of the taken-for-granted" is the inner zone — what
 * is so obvious it doesn't even register as a position. Outside
 * is the field of debate. The political move is moving things in
 * and out of the doxa zone — most powerfully without anyone noticing.
 */

const PROPOSITIONS: { x: number; y: number; label: string; inDoxa: boolean }[] = [
  { x: 200, y: 130, label: 'eight-hour day', inDoxa: true },
  { x: 240, y: 180, label: 'private property', inDoxa: true },
  { x: 280, y: 110, label: 'wage labor', inDoxa: true },
  { x: 175, y: 200, label: 'the nuclear family', inDoxa: true },
  { x: 290, y: 220, label: 'standardized testing', inDoxa: true },
  { x: 470, y: 90,  label: 'universal basic income', inDoxa: false },
  { x: 480, y: 220, label: 'four-day workweek', inDoxa: false },
  { x: 100, y: 90,  label: 'private healthcare', inDoxa: false },
  { x: 100, y: 240, label: 'open borders', inDoxa: false },
  { x: 540, y: 160, label: 'commons-based ownership', inDoxa: false },
];

export function BourdieuDiagram() {
  const W = 640;
  const H = 360;

  const CX = 235;
  const CY = 165;
  const RX = 130;
  const RY = 95;

  return (
    <FigShell
      title="Doxa — the space of the taken-for-granted"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          The inner ellipse is the{' '}
          <strong style={{ color: COLORS.amber }}>doxa</strong> — what
          is so obvious that it doesn&apos;t register as a position.
          Outside is the field of debate. The political work — most
          effective when invisible — is moving propositions{' '}
          <em>across the boundary</em>: things into the doxa become
          natural; things out of it become arguable.
        </>
      }
    >
      {/* Outer "field of debate" zone */}
      <rect x={20} y={50} width={W - 40} height={250} rx={12}
        fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.10)" strokeDasharray="2,4" />
      <text x={W - 30} y={70} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="end" letterSpacing={2}>
        FIELD OF DEBATE
      </text>

      {/* Inner doxa ellipse */}
      <ellipse cx={CX} cy={CY} rx={RX} ry={RY}
        fill="rgba(245,158,11,0.06)" stroke={COLORS.amber} strokeWidth={1.5} />
      <text x={CX} y={CY - RY + 18} fill={COLORS.amber} fontSize={10} fontFamily="monospace" textAnchor="middle" letterSpacing={2}>
        DOXA
      </text>
      <text x={CX} y={CY - RY + 32} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
        "of course"
      </text>

      {/* Propositions — dots with labels */}
      {PROPOSITIONS.map((p, i) => {
        const color = p.inDoxa ? COLORS.amber : COLORS.cyan;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill={color} fillOpacity={0.85} />
            <text x={p.x + 7} y={p.y + 3} fill={COLORS.textSoft} fontSize={9}>
              {p.label}
            </text>
          </g>
        );
      })}

      {/* The arrow — propositions move in/out */}
      <g>
        <path d="M 460 120 C 420 130, 380 140, 360 150" stroke={COLORS.cyan} strokeWidth={1.25} strokeDasharray="3,3" fill="none" />
        <polygon points="358,144 350,151 362,156" fill={COLORS.cyan} />
        <text x={400} y={108} fill={COLORS.cyan} fontSize={9} fontStyle="italic">
          becomes obvious
        </text>

        <path d="M 360 200 C 380 210, 420 220, 460 220" stroke={COLORS.violet} strokeWidth={1.25} strokeDasharray="3,3" fill="none" />
        <polygon points="458,214 470,222 458,228" fill={COLORS.violet} />
        <text x={400} y={245} fill={COLORS.violet} fontSize={9} fontStyle="italic">
          becomes arguable
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(245,158,11,0.08)" stroke={COLORS.amber} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.amber} fontSize={10} textAnchor="middle" fontWeight={600}>
          Power lives in the boundary, not in the propositions.
        </text>
      </g>
    </FigShell>
  );
}

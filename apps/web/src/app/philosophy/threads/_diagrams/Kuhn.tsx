import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Kuhn — the paradigm cycle.
 * Normal science → anomalies accumulate → crisis → revolution →
 * new normal science. The cycle, drawn as a loop with the moments
 * labeled.
 */

const STAGES = [
  { label: 'Normal science',           detail: 'puzzle-solving inside the paradigm' },
  { label: 'Anomalies accumulate',     detail: 'small unexplained results pile up' },
  { label: 'Crisis',                   detail: 'core commitments contested' },
  { label: 'Revolution',               detail: 'incommensurable replacement candidate wins' },
  { label: 'New normal science',       detail: 'the cycle resumes inside the new paradigm' },
];

export function KuhnDiagram() {
  const W = 640;
  const H = 360;

  const CX = W / 2;
  const CY = H / 2 - 10;
  const R = 130;

  return (
    <FigShell
      title="The paradigm cycle"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Kuhn&apos;s structure of revolutions: normal science doesn&apos;t
          march toward truth. It accumulates anomalies until the frame
          breaks, a successor frame replaces it, and the puzzle-solving
          resumes inside the new paradigm. <em>Incommensurable</em> means
          you can&apos;t score one paradigm against another in the
          terms either provides.
        </>
      }
    >
      {/* Cycle arc */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth={1} strokeDasharray="3,4" />

      {STAGES.map((s, i) => {
        const angle = (-Math.PI / 2) + (i * Math.PI * 2) / STAGES.length;
        const x = CX + R * Math.cos(angle);
        const y = CY + R * Math.sin(angle);
        const isCrisis = i === 2;
        const isRevolution = i === 3;
        const accent = isCrisis || isRevolution ? COLORS.red : COLORS.violet;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={6} fill={accent} fillOpacity={0.85} stroke={accent} strokeWidth={1} />
            <text x={x} y={y - 12}
              fill={COLORS.text} fontSize={11} textAnchor="middle" fontWeight={500}>
              {s.label}
            </text>
            <text x={x} y={y + 18}
              fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
              {s.detail}
            </text>
            {/* Arrow to next */}
            {(() => {
              const nextAngle = (-Math.PI / 2) + ((i + 1) * Math.PI * 2) / STAGES.length;
              const nx = CX + R * Math.cos(nextAngle);
              const ny = CY + R * Math.sin(nextAngle);
              const midAngle = (angle + nextAngle) / 2;
              const mx = CX + (R + 6) * Math.cos(midAngle);
              const my = CY + (R + 6) * Math.sin(midAngle);
              return (
                <path
                  d={`M ${x} ${y} Q ${mx} ${my} ${nx} ${ny}`}
                  stroke={`${accent}55`} strokeWidth={1.25} fill="none"
                />
              );
            })()}
          </g>
        );
      })}

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontWeight={600}>
          Crisis and revolution are part of the structure, not failures of it.
        </text>
      </g>
    </FigShell>
  );
}

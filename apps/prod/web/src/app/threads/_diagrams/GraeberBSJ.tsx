import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Graeber, Bullshit Jobs — purpose × cost matrix.
 * 2x2 grid mapping job-types by social purpose (low/high) and
 * compensation/visibility (low/high). The five BSJ types occupy
 * the high-cost, low-purpose quadrant.
 */

const JOBS: { x: number; y: number; label: string; quadrant: 'tl' | 'tr' | 'bl' | 'br' }[] = [
  { x: 0.20, y: 0.78, label: 'nurses · teachers · trash collection', quadrant: 'br' },
  { x: 0.20, y: 0.22, label: 'subsistence farming · care work',     quadrant: 'tr' },
  { x: 0.78, y: 0.78, label: 'bullshit jobs',                       quadrant: 'bl' },
  { x: 0.78, y: 0.22, label: 'creative / craft (under-comp)',       quadrant: 'tl' },
];

const BSJ_TYPES = [
  'flunkies', 'goons', 'duct-tapers', 'box-tickers', 'taskmasters',
];

export function GraeberBSJDiagram() {
  const W = 640;
  const H = 360;
  const PAD = { l: 80, r: 30, t: 50, b: 80 };
  const CHART_W = W - PAD.l - PAD.r;
  const CHART_H = H - PAD.t - PAD.b;

  const sx = (v: number) => PAD.l + v * CHART_W;
  const sy = (v: number) => PAD.t + v * CHART_H;

  return (
    <FigShell
      title="The 2×2 nobody wants drawn"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Compensation/visibility on the X axis; social purpose on the Y
          axis. The conventional story is that pay tracks contribution.
          The empirical map is closer to the inverse:{' '}
          <strong style={{ color: COLORS.amber }}>nurses, teachers, trash
          collection</strong> sit in the high-purpose / low-compensation
          quadrant; <strong style={{ color: COLORS.red }}>flunkies, goons,
          duct-tapers, box-tickers, taskmasters</strong> in the low-purpose
          / high-compensation quadrant. Graeber names this asymmetry as
          structural, not accidental.
        </>
      }
    >
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + CHART_H} stroke="rgba(255,255,255,0.20)" />
      <line x1={PAD.l} y1={PAD.t + CHART_H} x2={PAD.l + CHART_W} y2={PAD.t + CHART_H} stroke="rgba(255,255,255,0.20)" />

      {/* Axis labels */}
      <text x={PAD.l - 8} y={PAD.t - 6} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="end" letterSpacing={1.5}>
        ↑ social purpose
      </text>
      <text x={PAD.l + CHART_W} y={PAD.t + CHART_H + 24} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="end" letterSpacing={1.5}>
        compensation / visibility →
      </text>

      {/* Quadrant guides */}
      <line x1={sx(0.5)} y1={PAD.t} x2={sx(0.5)} y2={PAD.t + CHART_H} stroke="rgba(255,255,255,0.07)" strokeDasharray="2,4" />
      <line x1={PAD.l} y1={sy(0.5)} x2={PAD.l + CHART_W} y2={sy(0.5)} stroke="rgba(255,255,255,0.07)" strokeDasharray="2,4" />

      {/* Quadrant labels (subtle) */}
      <text x={sx(0.25)} y={PAD.t + 18} fill={COLORS.textWhisper} fontSize={9} fontStyle="italic" textAnchor="middle">
        high purpose · low pay
      </text>
      <text x={sx(0.75)} y={PAD.t + 18} fill={COLORS.textWhisper} fontSize={9} fontStyle="italic" textAnchor="middle">
        high purpose · high pay
      </text>
      <text x={sx(0.25)} y={PAD.t + CHART_H - 6} fill={COLORS.textWhisper} fontSize={9} fontStyle="italic" textAnchor="middle">
        low purpose · low pay
      </text>
      <text x={sx(0.75)} y={PAD.t + CHART_H - 6} fill={COLORS.textWhisper} fontSize={9} fontStyle="italic" textAnchor="middle">
        low purpose · high pay
      </text>

      {/* Jobs */}
      {JOBS.map((j, i) => {
        const x = sx(j.x);
        const y = sy(j.y);
        const isBSJ = j.label === 'bullshit jobs';
        const color = isBSJ ? COLORS.red : COLORS.amber;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={isBSJ ? 28 : 18}
              fill={`${color}22`}
              stroke={color} strokeWidth={isBSJ ? 1.5 : 1}
            />
            <text x={x} y={y + 3} fill={isBSJ ? color : COLORS.text} fontSize={isBSJ ? 11 : 10}
              fontWeight={isBSJ ? 600 : 400} textAnchor="middle">
              {isBSJ ? '⚠' : '·'}
            </text>
            <text x={x} y={y + (isBSJ ? -36 : 30)} fill={COLORS.text} fontSize={9.5} textAnchor="middle"
              fontStyle={isBSJ ? 'normal' : 'italic'}
              fontWeight={isBSJ ? 600 : 400}>
              {j.label}
            </text>
          </g>
        );
      })}

      {/* BSJ-types side note */}
      <g transform={`translate(${PAD.l}, ${PAD.t + CHART_H + 38})`}>
        <text x={0} y={0} fill={COLORS.red} fontSize={9} fontFamily="monospace" letterSpacing={1.5}>
          THE FIVE BSJ TYPES:
        </text>
        <text x={140} y={0} fill={COLORS.textSoft} fontSize={9.5}>
          {BSJ_TYPES.join(' · ')}
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(239,68,68,0.08)" stroke={COLORS.red} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.red} fontSize={10} textAnchor="middle" fontWeight={600}>
          Pay does not track contribution. The asymmetry is structural.
        </text>
      </g>
    </FigShell>
  );
}

import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Graeber, Debt — the long arc.
 * Wage labor and modern money are recent forms among many older
 * economic relations. A timeline showing 5,000 years of monetary
 * forms with the modern wage-labor era appearing only at the very end.
 */

const ERAS = [
  { start: -3000, end: -800,  label: 'Mesopotamian credit',      color: COLORS.cyan,   detail: 'temple ledgers, IOUs, no coins' },
  { start: -800,  end: 600,   label: 'Axial age coinage',        color: COLORS.amber,  detail: 'metal money for armies + slaves' },
  { start: 600,   end: 1450,  label: 'Medieval credit',          color: COLORS.violet, detail: 'tally sticks, account-money' },
  { start: 1450,  end: 1971,  label: 'Bullion + early capitalism', color: COLORS.indigo, detail: 'colonial silver flows' },
  { start: 1971,  end: 2025,  label: 'Pure credit / fiat',       color: COLORS.red,    detail: 'gold-standard ends; financialization' },
];

export function GraeberDebtDiagram() {
  const W = 640;
  const H = 320;
  const PAD = { l: 30, r: 30, t: 80, b: 70 };

  const xMin = -3200, xMax = 2050;

  const sx = (y: number) => PAD.l + ((y - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);

  const TRACK_Y = 170;
  const TRACK_H = 30;

  return (
    <FigShell
      title="5,000 years of monetary form"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Graeber&apos;s long arc. Wage labor and modern money are not
          the natural form of economic life — they are the very{' '}
          <em>recent</em> form of it. The graph compresses 5,000 years
          to one line; pure-credit fiat and financialized capitalism
          occupy only the rightmost sliver. Most of human economic
          history was credit and ledger, not cash.
        </>
      }
    >
      {/* Era bars */}
      {ERAS.map((e, i) => {
        const x = sx(e.start);
        const w = sx(e.end) - sx(e.start);
        return (
          <g key={i}>
            <rect x={x} y={TRACK_Y} width={w} height={TRACK_H} rx={3}
              fill={`${e.color}30`} stroke={e.color} strokeWidth={1} />
            {/* Label above (only if wide enough) */}
            {w > 60 && (
              <>
                <text x={x + w / 2} y={TRACK_Y - 14} fill={e.color} fontSize={10} textAnchor="middle">
                  {e.label}
                </text>
                <text x={x + w / 2} y={TRACK_Y - 2} fill={COLORS.textDim} fontSize={8.5} fontStyle="italic" textAnchor="middle">
                  {e.detail}
                </text>
              </>
            )}
            {/* Tiny eras get a side label */}
            {w <= 60 && (
              <g>
                <line x1={x + w / 2} x2={x + w / 2 + 30} y1={TRACK_Y + TRACK_H / 2} y2={TRACK_Y + TRACK_H + 30} stroke={e.color} strokeWidth={0.5} />
                <text x={x + w / 2 + 30} y={TRACK_Y + TRACK_H + 42} fill={e.color} fontSize={9}>
                  {e.label}
                </text>
                <text x={x + w / 2 + 30} y={TRACK_Y + TRACK_H + 54} fill={COLORS.textDim} fontSize={8.5} fontStyle="italic">
                  {e.detail}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Year axis */}
      <line x1={PAD.l} x2={W - PAD.r} y1={TRACK_Y + TRACK_H + 6} y2={TRACK_Y + TRACK_H + 6}
        stroke="rgba(255,255,255,0.15)" />
      {[-3000, -2000, -1000, 0, 1000, 2000].map((y) => (
        <g key={y}>
          <line x1={sx(y)} x2={sx(y)} y1={TRACK_Y + TRACK_H + 4} y2={TRACK_Y + TRACK_H + 10} stroke="rgba(255,255,255,0.30)" />
          <text x={sx(y)} y={TRACK_Y + TRACK_H + 22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="middle">
            {y < 0 ? `${-y} BCE` : y === 0 ? 'CE' : y}
          </text>
        </g>
      ))}

      {/* Header text */}
      <text x={W / 2} y={50} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
        WAGE LABOR + MODERN MONEY
      </text>
      <text x={W / 2} y={66} fill={COLORS.textSoft} fontSize={10} fontStyle="italic" textAnchor="middle">
        appear only in the rightmost sliver
      </text>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(239,68,68,0.08)" stroke={COLORS.red} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.red} fontSize={10} textAnchor="middle" fontWeight={600}>
          Most of economic history was credit and ledger, not cash. The wage form is recent.
        </text>
      </g>
    </FigShell>
  );
}

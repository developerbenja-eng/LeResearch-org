import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Time-series with annotations.
 * One question: how fast is AI capability actually growing on the
 * single most extrapolation-friendly benchmark we have?
 *
 * Answer: METR finds the "task completion time horizon" — how long a
 * task an AI agent can autonomously complete — doubles roughly every
 * 7 months. Plus AISI self-replication 5%→60% in two years. The line
 * is real. The extrapolation past today (dashed) is intentionally
 * labeled as extrapolation.
 */

interface Point {
  /** Decimal year, e.g. 2024.5 */
  year: number;
  /** Task length in minutes (log axis) */
  minutes: number;
  label?: string;
  /** True for the dashed-extrapolation segment */
  projected?: boolean;
}

// METR-style approximations. The original blog has the full series.
const HISTORY: Point[] = [
  { year: 2019.0, minutes: 0.5 },
  { year: 2020.0, minutes: 1.5 },
  { year: 2021.0, minutes: 3.5 },
  { year: 2022.0, minutes: 8,    label: 'GPT-3.5' },
  { year: 2023.3, minutes: 18,   label: 'GPT-4' },
  { year: 2024.5, minutes: 35,   label: 'Claude 3.5 / GPT-4o' },
  { year: 2025.4, minutes: 80,   label: 'o1 / Claude 3.7' },
  { year: 2025.9, minutes: 165,  label: 'o3-class' },
  { year: 2026.3, minutes: 240,  label: 'frontier ~Apr 2026' },
];

const PROJECTION: Point[] = [
  { year: 2027.0, minutes: 480,    projected: true,  label: '8 hr' },
  { year: 2028.0, minutes: 1920,   projected: true,  label: '32 hr ≈ 1 work-week' },
  { year: 2029.0, minutes: 7680,   projected: true },
  { year: 2030.0, minutes: 30720,  projected: true,  label: '~3 work-weeks' },
];

// Annotated discrete benchmarks (right side reference)
const ANCHORS = [
  { y: 60,    label: '1 hour' },
  { y: 480,   label: '1 work-day (8h)' },
  { y: 2400,  label: '1 work-week (40h)' },
  { y: 9600,  label: '1 month FT' },
];

export function CapabilityClimb() {
  const W = 900;
  const H = 520;
  const PAD = { l: 70, r: 220, t: 80, b: 80 };

  const xMin = 2019, xMax = 2030.5;
  const yMin = 0.5,  yMax = 60000;

  const sx = (y: number) => PAD.l + ((y - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);
  const sy = (m: number) => {
    const lyMin = Math.log10(yMin);
    const lyMax = Math.log10(yMax);
    const lm = Math.log10(Math.max(yMin, Math.min(yMax, m)));
    return PAD.t + (1 - (lm - lyMin) / (lyMax - lyMin)) * (H - PAD.t - PAD.b);
  };

  // Year ticks
  const yearTicks = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  // Y ticks (log)
  const yTicks = [1, 10, 60, 480, 2400, 9600];

  // Build the line path for solid (history) + dashed (projection)
  const buildPath = (pts: Point[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.year).toFixed(1)} ${sy(p.minutes).toFixed(1)}`).join(' ');

  const TODAY = 2026.3;

  return (
    <FigShell
      title="Capability climb — task-completion horizon vs time"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          METR finding: the length of task an AI agent can{' '}
          <em>autonomously complete</em> doubles roughly every{' '}
          <strong style={{ color: COLORS.cyan }}>7 months</strong>.
          Solid points are measured; the dashed segment past Apr 2026 is{' '}
          <strong style={{ color: COLORS.amber }}>extrapolation</strong>{' '}
          and is labeled as such — straight-line projection of an
          exponential will overshoot, undershoot, or saturate. Two
          adjacent capability anchors from{' '}
          <strong style={{ color: COLORS.green }}>UK AISI 2025</strong>:
          self-replication eval success went 5%→60% from 2023→2025;
          apprentice-level cyber tasks 9%→50% in two years. The shape of
          the line, more than any single benchmark, is what reasonable
          policy is now being asked to anticipate.
        </>
      }
    >
      {/* Y axis (log) gridlines + labels */}
      {yTicks.map((y) => {
        const py = sy(y);
        const anchor = ANCHORS.find((a) => a.y === y);
        return (
          <g key={y}>
            <line x1={PAD.l} x2={W - PAD.r} y1={py} y2={py} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
            <text
              x={PAD.l - 8} y={py + 3}
              fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="end"
            >
              {y < 60 ? `${y} min` : y < 60 * 24 ? `${(y / 60).toFixed(0)} hr` : `${(y / 60 / 8).toFixed(0)} day`}
            </text>
            {anchor && (
              <text
                x={W - PAD.r + 6} y={py + 3}
                fill={COLORS.textDim} fontSize={9} fontStyle="italic"
              >
                ← {anchor.label}
              </text>
            )}
          </g>
        );
      })}

      {/* X axis ticks */}
      {yearTicks.map((y) => {
        const px = sx(y);
        return (
          <g key={y}>
            <line x1={px} x2={px} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,0.03)" strokeDasharray="1,3" />
            <text
              x={px} y={H - PAD.b + 18}
              fill={COLORS.textDim} fontSize={10} fontFamily="monospace" textAnchor="middle"
            >
              {y}
            </text>
          </g>
        );
      })}

      {/* "Today" line */}
      <line
        x1={sx(TODAY)} x2={sx(TODAY)} y1={PAD.t} y2={H - PAD.b}
        stroke={COLORS.amber} strokeWidth={1} strokeDasharray="3,3" opacity={0.6}
      />
      <text x={sx(TODAY) + 6} y={PAD.t + 12} fill={COLORS.amber} fontSize={9} fontFamily="monospace">
        ↓ today
      </text>

      {/* History line (solid) */}
      <path
        d={buildPath(HISTORY)}
        stroke={COLORS.cyan}
        strokeWidth={2}
        fill="none"
      />

      {/* Projection line (dashed) — connect last history point to first projection */}
      <path
        d={buildPath([HISTORY[HISTORY.length - 1], ...PROJECTION])}
        stroke={COLORS.cyan}
        strokeWidth={2}
        strokeDasharray="6,4"
        fill="none"
        opacity={0.55}
      />

      {/* History dots + labels */}
      {HISTORY.map((p) => (
        <g key={`h-${p.year}`}>
          <circle cx={sx(p.year)} cy={sy(p.minutes)} r={4} fill={COLORS.cyan} />
          {p.label && (
            <text
              x={sx(p.year) + 8} y={sy(p.minutes) + 4}
              fill={COLORS.textSoft} fontSize={9.5} fontFamily="monospace"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}

      {/* Projection dots + labels */}
      {PROJECTION.map((p) => (
        <g key={`p-${p.year}`}>
          <circle cx={sx(p.year)} cy={sy(p.minutes)} r={3.5} fill="none" stroke={COLORS.cyan} strokeWidth={1.5} />
          {p.label && (
            <text
              x={sx(p.year) + 8} y={sy(p.minutes) + 4}
              fill={COLORS.amber} fontSize={9.5} fontFamily="monospace" fontStyle="italic"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}

      {/* Doubling-time annotation */}
      <g transform={`translate(${sx(2024)}, ${sy(8) - 30})`}>
        <text fill={COLORS.cyan} fontSize={10} fontFamily="monospace" letterSpacing={1.5}>
          DOUBLES EVERY ~7 MONTHS
        </text>
      </g>

      {/* Right-side anchor box: AISI capability anchors */}
      <g transform={`translate(${W - PAD.r + 8}, ${PAD.t + 80})`}>
        <rect width={PAD.r - 28} height={120} rx={6}
          fill="rgba(96,165,250,0.05)" stroke="rgba(96,165,250,0.30)" strokeWidth={1} />
        <text x={10} y={20} fill={COLORS.blue} fontSize={9} fontFamily="monospace" letterSpacing={1.5}>
          UK AISI 2025
        </text>
        <text x={10} y={40} fill={COLORS.text} fontSize={11}>
          Self-replication eval
        </text>
        <text x={10} y={56} fill={COLORS.green} fontSize={11} fontFamily="monospace">
          5% → 60%
        </text>
        <text x={10} y={70} fill={COLORS.textDim} fontSize={9}>
          (2023 → 2025)
        </text>
        <text x={10} y={92} fill={COLORS.text} fontSize={11}>
          Apprentice cyber
        </text>
        <text x={10} y={108} fill={COLORS.green} fontSize={11} fontFamily="monospace">
          9% → 50%
        </text>
      </g>

      {/* Stanford HAI anchor */}
      <g transform={`translate(${W - PAD.r + 8}, ${PAD.t + 220})`}>
        <rect width={PAD.r - 28} height={90} rx={6}
          fill="rgba(167,139,250,0.05)" stroke="rgba(167,139,250,0.30)" strokeWidth={1} />
        <text x={10} y={20} fill={COLORS.violet} fontSize={9} fontFamily="monospace" letterSpacing={1.5}>
          STANFORD HAI 2025
        </text>
        <text x={10} y={40} fill={COLORS.text} fontSize={10}>
          Year-over-year jump
        </text>
        <text x={10} y={58} fill={COLORS.violet} fontSize={10} fontFamily="monospace">
          MMMU +18.8 pts
        </text>
        <text x={10} y={72} fill={COLORS.violet} fontSize={10} fontFamily="monospace">
          GPQA +48.9 pts
        </text>
        <text x={10} y={86} fill={COLORS.violet} fontSize={10} fontFamily="monospace">
          SWE-bench +67.3 pts
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 30})`}>
        <rect width={W - 40} height={22} rx={4}
          fill="rgba(34,211,238,0.08)" stroke={COLORS.cyan} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={COLORS.cyan} fontSize={11} textAnchor="middle" fontWeight={600}>
          The line is real. The extrapolation is a hypothesis. Both should inform what gets governed now.
        </text>
      </g>
    </FigShell>
  );
}

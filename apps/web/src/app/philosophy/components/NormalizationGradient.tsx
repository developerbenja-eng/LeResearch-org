import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Comparison + Motion-as-mechanic.
 * One question: why does slow change become invisible while fast change
 * becomes shock?
 *
 * Two curves reach the same magnitude. The slow one drifts under the
 * "perception threshold" — and the threshold itself drifts down to
 * follow it (the shifting-baseline mechanic, animated). The fast one
 * spikes through the threshold, fires sensors, gets the public debate.
 * Both end at the same destination. One is governed; one is absorbed.
 */

// Each (year, magnitude) pair on the slow track
const SLOW: { year: number; mag: number; label?: string }[] = [
  { year: 1975, mag: 0.5,  label: 'starts' },
  { year: 1985, mag: 1.5 },
  { year: 1995, mag: 3.2 },
  { year: 2005, mag: 5.0 },
  { year: 2015, mag: 7.4 },
  { year: 2025, mag: 9.8, label: 'has arrived' },
];

// Fast change — same destination, compressed in time
const FAST: { year: number; mag: number; label?: string }[] = [
  { year: 2022.0, mag: 0.6,  label: 'starts' },
  { year: 2022.6, mag: 2.5 },
  { year: 2023.2, mag: 6.0 },
  { year: 2023.8, mag: 9.0 },
  { year: 2024.4, mag: 9.8, label: 'has arrived' },
];

const SLOW_EXAMPLES = [
  'recommender systems · 2008–2024',
  'extension of workplace monitoring',
  'contraction of professional judgment',
  'eight-hour workday becoming "normal"',
];

const FAST_EXAMPLES = [
  'ChatGPT · Nov 2022',
  'COVID lockdowns · March 2020',
  'a labor strike',
  'a Supreme Court ruling',
];

export function NormalizationGradient() {
  const W = 900;
  const H = 520;
  const PAD = { l: 70, r: 30, t: 60, b: 220 };

  const xMin = 1972, xMax = 2027;
  const yMin = 0,    yMax = 11;

  const sx = (y: number) => PAD.l + ((y - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);
  const sy = (m: number) => PAD.t + (1 - (m - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

  const buildPath = (pts: { year: number; mag: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.year).toFixed(1)} ${sy(p.mag).toFixed(1)}`).join(' ');

  // The "perception threshold" line sits at magnitude THRESHOLD_HIGH
  // initially, then drifts down to THRESHOLD_LOW over the course of the
  // animation — the shifting-baseline mechanic made literal.
  const THRESHOLD_START = 7.4;
  const THRESHOLD_END   = 5.2;

  // X range over which the threshold drifts (matches slow curve's lifespan)
  const X_THRESH_LEFT  = sx(1975);
  const X_THRESH_RIGHT = sx(2025);
  const Y_THRESH_START = sy(THRESHOLD_START);
  const Y_THRESH_END   = sy(THRESHOLD_END);

  return (
    <FigShell
      title="The normalization gradient — slow change is invisible; fast change is shock"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Two trajectories reach the same magnitude. The{' '}
          <strong style={{ color: COLORS.cyan }}>slow gradient</strong> drifts
          under the <strong style={{ color: COLORS.amber }}>perception threshold</strong>,
          and the threshold itself drifts down to follow it — the{' '}
          <em>shifting baseline</em> made literal. The{' '}
          <strong style={{ color: COLORS.red }}>fast gradient</strong> blasts through,
          fires sensors, gets debate. Both arrive at the same destination. The
          political question is{' '}
          <em>who chooses which slope a given change rides</em> — because the
          same actor who would lose a fast public argument can usually win a
          slow private one.
        </>
      }
    >
      {/* ─── Axes ─────────────────────────────────────────────── */}
      {/* Y axis */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="rgba(255,255,255,0.15)" />
      <text
        x={PAD.l - 12} y={PAD.t - 12}
        fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1.5}
      >
        ↑ magnitude of change
      </text>

      {/* X axis */}
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="rgba(255,255,255,0.15)" />
      {[1975, 1985, 1995, 2005, 2015, 2025].map((y) => (
        <g key={y}>
          <line x1={sx(y)} x2={sx(y)} y1={H - PAD.b - 3} y2={H - PAD.b + 3} stroke="rgba(255,255,255,0.25)" />
          <text x={sx(y)} y={H - PAD.b + 16} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" textAnchor="middle">
            {y}
          </text>
        </g>
      ))}
      <text
        x={W - PAD.r} y={H - PAD.b + 32}
        fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="end" letterSpacing={1.5}
      >
        time →
      </text>

      {/* ─── Perception threshold line + drifting band ─────────── */}
      <g>
        {/* The static end-state band (subtle) */}
        <rect
          x={PAD.l} y={Y_THRESH_END - 6}
          width={W - PAD.l - PAD.r} height={12}
          fill="rgba(245,158,11,0.06)"
        />

        {/* The animating threshold line — starts high, drifts down */}
        <line
          x1={PAD.l} x2={W - PAD.r}
          y1={Y_THRESH_START} y2={Y_THRESH_START}
          stroke={COLORS.amber} strokeWidth={1.5} strokeDasharray="6,4"
          opacity={0.9}
        >
          <animate
            attributeName="y1"
            from={Y_THRESH_START} to={Y_THRESH_END}
            dur="6s" begin="1s" fill="freeze"
          />
          <animate
            attributeName="y2"
            from={Y_THRESH_START} to={Y_THRESH_END}
            dur="6s" begin="1s" fill="freeze"
          />
        </line>

        <text
          x={X_THRESH_LEFT + 8} y={Y_THRESH_START - 6}
          fill={COLORS.amber} fontSize={10} fontFamily="monospace" letterSpacing={1.5}
        >
          PERCEPTION THRESHOLD
          <animate
            attributeName="y"
            from={Y_THRESH_START - 6} to={Y_THRESH_END - 6}
            dur="6s" begin="1s" fill="freeze"
          />
        </text>

        {/* "shifting baseline" annotation that fades in mid-anim */}
        <text
          x={W - PAD.r - 8} y={Y_THRESH_END - 6}
          fill={COLORS.amber} fontSize={9} fontStyle="italic" textAnchor="end"
          opacity="0"
        >
          ← the threshold drifts to follow the new normal
          <animate attributeName="opacity" from="0" to="0.85" dur="1.5s" begin="5.5s" fill="freeze" />
        </text>
      </g>

      {/* ─── Slow gradient ─────────────────────────────────────── */}
      <g>
        <path
          d={buildPath(SLOW)}
          stroke={COLORS.cyan} strokeWidth={2.5} fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {SLOW.map((p) => (
          <circle key={`s-${p.year}`} cx={sx(p.year)} cy={sy(p.mag)} r={3.5} fill={COLORS.cyan} />
        ))}
        {/* Slow label */}
        <text
          x={sx(1995)} y={sy(3.2) - 12}
          fill={COLORS.cyan} fontSize={11} fontFamily="monospace" letterSpacing={1.5}
        >
          SLOW GRADIENT
        </text>
        <text
          x={sx(1995)} y={sy(3.2) + 4}
          fill={COLORS.textSoft} fontSize={9.5} fontStyle="italic"
        >
          absorbed as &ldquo;the world&rdquo; · no sensor fires
        </text>

        {/* Slow arrival annotation */}
        <text
          x={sx(2025) - 6} y={sy(9.8) - 16}
          fill={COLORS.cyan} fontSize={10} fontFamily="monospace" textAnchor="end"
        >
          arrives at magnitude 10
        </text>
        <text
          x={sx(2025) - 6} y={sy(9.8) - 4}
          fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="end"
        >
          50 years later · no public debate happened
        </text>
      </g>

      {/* ─── Fast gradient ─────────────────────────────────────── */}
      <g>
        <path
          d={buildPath(FAST)}
          stroke={COLORS.red} strokeWidth={2.5} fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {FAST.map((p) => (
          <circle key={`f-${p.year}`} cx={sx(p.year)} cy={sy(p.mag)} r={3.5} fill={COLORS.red} />
        ))}

        {/* Fast label */}
        <text
          x={sx(2022.3)} y={sy(0.6) + 22}
          fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={1.5}
        >
          FAST GRADIENT
        </text>
        <text
          x={sx(2022.3)} y={sy(0.6) + 36}
          fill={COLORS.textSoft} fontSize={9.5} fontStyle="italic"
        >
          fires sensors · debate · regulation
        </text>

        {/* Threshold breach annotation — the moment the line crosses */}
        <g>
          <circle cx={sx(2023.2)} cy={sy(THRESHOLD_END)} r={9} fill="none" stroke={COLORS.red} strokeWidth={1.5} opacity={0.7}>
            <animate attributeName="r" from="6" to="14" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>

      {/* ─── Lower panel: who steers each gradient ─────────────── */}
      <g transform={`translate(20, ${H - PAD.b + 50})`}>
        <text x={0} y={14} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" letterSpacing={2}>
          THE POLITICAL ASYMMETRY
        </text>

        {/* Slow column */}
        <g transform="translate(0, 32)">
          <rect width={420} height={120} rx={6}
            fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.40)" strokeWidth={1} />
          <text x={14} y={20} fill={COLORS.cyan} fontSize={10} fontFamily="monospace" letterSpacing={1.5}>
            SLOW &mdash; absorbs into infrastructure
          </text>
          {SLOW_EXAMPLES.map((s, i) => (
            <text key={s} x={14} y={42 + i * 18} fill={COLORS.textSoft} fontSize={11}>
              · {s}
            </text>
          ))}
        </g>

        {/* Fast column */}
        <g transform="translate(440, 32)">
          <rect width={420} height={120} rx={6}
            fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.40)" strokeWidth={1} />
          <text x={14} y={20} fill={COLORS.red} fontSize={10} fontFamily="monospace" letterSpacing={1.5}>
            FAST &mdash; produces a cohort moment
          </text>
          {FAST_EXAMPLES.map((s, i) => (
            <text key={s} x={14} y={42 + i * 18} fill={COLORS.textSoft} fontSize={11}>
              · {s}
            </text>
          ))}
        </g>
      </g>

      {/* ─── Takeaway callout ──────────────────────────────────── */}
      <g transform={`translate(20, ${H - 28})`}>
        <rect width={W - 40} height={22} rx={4}
          fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={COLORS.violet} fontSize={11} textAnchor="middle" fontWeight={600}>
          Same destination. Different slopes. Only one of them gets a public debate.
        </text>
      </g>
    </FigShell>
  );
}

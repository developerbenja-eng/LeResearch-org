import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Pauly — shifting baseline syndrome.
 * Each generation reads "normal" off its own first memory of the
 * resource. The baseline drifts with the resource itself. Decline
 * is invisible because no generation can compare to one before its
 * own.
 */

const POPULATION = [
  { year: 1880, value: 95 },
  { year: 1900, value: 88 },
  { year: 1920, value: 78 },
  { year: 1945, value: 60 },
  { year: 1970, value: 40 },
  { year: 1995, value: 22 },
  { year: 2020, value: 12 },
];

const GENERATIONS = [
  { yearAware: 1900, baseline: 88, label: 'born ~1880 · "normal" = abundant' },
  { yearAware: 1955, baseline: 50, label: 'born ~1935 · "normal" = moderate' },
  { yearAware: 2010, baseline: 18, label: 'born ~1990 · "normal" = scarce' },
];

export function PaulyDiagram() {
  const W = 600;
  const H = 360;
  const PAD = { l: 50, r: 30, t: 40, b: 70 };

  const xMin = 1875, xMax = 2025;
  const yMin = 0, yMax = 100;

  const sx = (y: number) => PAD.l + ((y - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);
  const sy = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

  const path = POPULATION.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.year).toFixed(1)} ${sy(p.value).toFixed(1)}`).join(' ');

  return (
    <FigShell
      title="Shifting baseline syndrome"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Each generation calibrates &ldquo;normal&rdquo; off the
          abundance present at the start of its own memory. The
          baseline drifts with the resource. The decline is invisible
          because no generation can compare to one before its own.
        </>
      }
    >
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="rgba(255,255,255,0.15)" />
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="rgba(255,255,255,0.15)" />
      <text x={PAD.l - 8} y={PAD.t - 6} fill={COLORS.textDim} fontSize={9} textAnchor="end" fontFamily="monospace">↑ abundance</text>
      <text x={W - PAD.r} y={H - PAD.b + 24} fill={COLORS.textDim} fontSize={9} textAnchor="end" fontFamily="monospace">time →</text>

      {[1900, 1950, 2000].map((y) => (
        <text key={y} x={sx(y)} y={H - PAD.b + 14} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="middle">{y}</text>
      ))}

      {/* Each generation's baseline (horizontal line at their "normal") */}
      {GENERATIONS.map((g, i) => (
        <g key={i}>
          <line
            x1={sx(g.yearAware - 30)} x2={sx(g.yearAware + 30)}
            y1={sy(g.baseline)} y2={sy(g.baseline)}
            stroke={COLORS.amber} strokeWidth={1} strokeDasharray="3,3"
          />
          <text x={sx(g.yearAware) + 35} y={sy(g.baseline) + 3}
            fill={COLORS.amber} fontSize={8.5} fontStyle="italic">
            {g.label}
          </text>
        </g>
      ))}

      {/* Real decline curve */}
      <path d={path} stroke={COLORS.cyan} strokeWidth={2} fill="none" />
      {POPULATION.map((p) => (
        <circle key={p.year} cx={sx(p.year)} cy={sy(p.value)} r={2.5} fill={COLORS.cyan} />
      ))}

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(34,211,238,0.08)" stroke={COLORS.cyan} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.cyan} fontSize={10} textAnchor="middle" fontWeight={600}>
          The actual line dropped 80%. The remembered baseline dropped with it.
        </text>
      </g>
    </FigShell>
  );
}

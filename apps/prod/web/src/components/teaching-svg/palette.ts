/**
 * Shared palette + helpers for teaching-svg diagrams across LeResearch.
 * Mirrors the API used in LeDesign-ai (apps/poa/.../teaching-svg/) but
 * tuned for LeResearch's darker purple-indigo-blue register.
 *
 * When a third app needs these, extract to packages/teaching-svg/.
 */

export const COLORS = {
  // Semantic — associations build across diagrams
  cyan:  '#22d3ee', // "the thing happening / active"
  green: '#22c55e', // "ground truth / verified / correct"
  amber: '#f59e0b', // "rule / mapping / note / warning"
  red:   '#ef4444', // "failure / critical takeaway"

  // LeResearch accents
  violet:   '#a78bfa',
  blue:     '#60a5fa',
  indigo:   '#818cf8',

  // Neutrals on the dark navy canvas
  bg:       '#0a0a1a',
  bgSoft:   '#0f0f23',
  text:     '#f5f5f7',
  textSoft: 'rgba(245, 245, 247, 0.75)',
  textDim:  'rgba(245, 245, 247, 0.45)',
  textWhisper: 'rgba(245, 245, 247, 0.25)',

  // Geology (when drawing aquifer / earth sections)
  clay: '#8D6E63',
  sand: '#FF9800',
  silt: '#A1887F',
} as const;

/**
 * Deterministic PRNG seeded by an integer.
 * Same seed → same sequence. Useful for log curves, organic shapes,
 * handwritten-looking lines that don't re-jitter between renders.
 */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Build a low-pass-drifting path, useful for things like SP logs,
 * stream levels over time, sensor telemetry traces. Organic-looking
 * but fully deterministic per seed.
 */
export function buildCurvePath(
  x0: number,
  y0: number,
  w: number,
  h: number,
  seed: number,
  points = 60,
): string {
  const rand = seeded(seed);
  const pts: [number, number][] = [];
  let v = 0.5;
  for (let i = 0; i < points; i++) {
    v = v * 0.85 + rand() * 0.15; // low-pass + noise
    pts.push([x0 + v * w, y0 + (i / (points - 1)) * h]);
  }
  return pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
}

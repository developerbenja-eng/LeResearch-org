import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: row-repeater on log scale.
 * One question: how much does "an AI query" actually vary across the
 * model spectrum?
 *
 * Answer: about five orders of magnitude. From a fine-tuned BERT
 * classifier on a laptop (~0.1 mWh) to a frontier reasoning model in
 * the cloud (~7 Wh). "AI energy" treated as one number is a category
 * error.
 */

type Tier = 'specialized' | 'edge' | 'local' | 'cloud-text' | 'cloud-reasoning';

interface Row {
  label: string;
  hardware: string;
  /** Wh per query / per task */
  wh: number;
  tier: Tier;
}

const ROWS: Row[] = [
  // Specialized small models — done in milliwatt-hours
  { label: 'BERT classifier (110M)',          hardware: 'laptop CPU',                wh: 0.0001, tier: 'specialized' },
  { label: 'Whisper Tiny (1 min audio)',      hardware: 'any phone',                 wh: 0.001,  tier: 'specialized' },
  // On-device LLMs
  { label: 'Apple Intelligence (~3B)',        hardware: 'iPhone Neural Engine',      wh: 0.002,  tier: 'edge' },
  { label: 'Llama 3.2 3B',                    hardware: 'Snapdragon X NPU',          wh: 0.004,  tier: 'edge' },
  { label: 'Phi Silica (~3.8B)',              hardware: 'Snapdragon X NPU',          wh: 0.0048, tier: 'edge' },
  // Local workstation
  { label: 'Llama 3.1 8B (Q4)',               hardware: 'M-series Mac',              wh: 0.04,   tier: 'local' },
  { label: 'Llama 3.1 70B (Q4)',              hardware: 'M4 Max MacBook',            wh: 0.24,   tier: 'local' },
  { label: 'Llama 3.1 70B (Q4)',              hardware: 'RTX 4090',                  wh: 0.48,   tier: 'local' },
  // Cloud frontier
  { label: 'Median Gemini text prompt',       hardware: 'Google TPU + DC overhead',  wh: 0.24,   tier: 'cloud-text' },
  { label: 'GPT-4o-class chat query',         hardware: 'cloud GPU',                 wh: 0.30,   tier: 'cloud-text' },
  { label: 'Frontier reasoning (o-class)',    hardware: 'cloud GPU + thinking budget', wh: 7,    tier: 'cloud-reasoning' },
];

const TIER_COLOR: Record<Tier, string> = {
  specialized:      '#22c55e', // green — task-fit, doing what it says
  edge:             '#22d3ee', // cyan — on-device
  local:            '#a78bfa', // violet — local workstation
  'cloud-text':     '#f59e0b', // amber — cloud frontier text
  'cloud-reasoning': '#ef4444', // red — cloud frontier reasoning (most energy)
};

const TIER_LABEL: Record<Tier, string> = {
  specialized:      'Specialized',
  edge:             'On-device',
  local:            'Local workstation',
  'cloud-text':     'Cloud frontier (text)',
  'cloud-reasoning': 'Cloud frontier (reasoning)',
};

// Domain in Wh — span 5 orders of magnitude (0.0001 → 10)
const DOMAIN_MIN = 0.0001;
const DOMAIN_MAX = 10;
const logRange = Math.log10(DOMAIN_MAX) - Math.log10(DOMAIN_MIN);

function logScale(v: number, w: number): number {
  if (v <= 0) return 0;
  const clamped = Math.max(DOMAIN_MIN, Math.min(DOMAIN_MAX, v));
  return ((Math.log10(clamped) - Math.log10(DOMAIN_MIN)) / logRange) * w;
}

function fmt(wh: number): string {
  if (wh >= 1) return `${wh.toFixed(2)} Wh`;
  if (wh >= 0.001) return `${(wh * 1000).toFixed(1)} mWh`;
  return `${(wh * 1000).toFixed(2)} mWh`;
}

export function ModelEnergyMap() {
  // Sort ascending by energy
  const sorted = [...ROWS].sort((a, b) => a.wh - b.wh);

  const W = 900;
  const LABEL_W = 320;
  const BAR_X = LABEL_W + 24;
  const BAR_W = W - BAR_X - 100;
  const ROW_H = 28;
  const TOP = 90;
  const H = TOP + sorted.length * ROW_H + 60;

  const TICKS = [0.0001, 0.001, 0.01, 0.1, 1, 10];

  return (
    <FigShell
      title="The model spectrum — five orders of magnitude per query"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          The same word — &ldquo;AI&rdquo; — covers everything from a{' '}
          <strong style={{ color: TIER_COLOR.specialized }}>110M-parameter BERT classifier on a laptop</strong>{' '}
          (~0.1 mWh) to a{' '}
          <strong style={{ color: TIER_COLOR['cloud-reasoning'] }}>frontier reasoning model with thinking budget</strong>{' '}
          (~7 Wh). That is roughly the energy ratio between{' '}
          <em>switching on an LED for a second</em> and{' '}
          <em>boiling half a kettle</em>. Treating &ldquo;AI energy&rdquo; as
          one number conflates the two.{' '}
          Local 8B-class inference on hardware you already own is ~6× lower
          than a cloud Gemini median query; phone NPU inference is ~100×
          lower. The energy-intensity-per-useful-operation is also{' '}
          collapsing fast — Google reports{' '}
          <strong style={{ color: COLORS.amber }}>33× per-prompt energy reduction in 12 months</strong>{' '}
          (May 2024 → May 2025).
        </>
      }
    >
      {/* Legend */}
      <g>
        {(Object.keys(TIER_LABEL) as Tier[]).map((t, i) => (
          <g key={t} transform={`translate(${20 + i * 175}, 24)`}>
            <rect width={10} height={10} y={-8} fill={TIER_COLOR[t]} rx={2} />
            <text x={16} y={1} fill={COLORS.textSoft} fontSize={9.5} fontFamily="monospace">
              {TIER_LABEL[t]}
            </text>
          </g>
        ))}
      </g>

      {/* Tick lines */}
      {TICKS.map((t) => {
        const x = BAR_X + logScale(t, BAR_W);
        return (
          <g key={t}>
            <line
              x1={x} x2={x} y1={TOP - 8} y2={TOP + sorted.length * ROW_H + 4}
              stroke="rgba(255,255,255,0.05)" strokeDasharray="2,4"
            />
            <text
              x={x} y={TOP - 14}
              fill={COLORS.textWhisper} fontSize={9} fontFamily="monospace" textAnchor="middle"
            >
              {fmt(t)}
            </text>
          </g>
        );
      })}

      {/* Rows */}
      {sorted.map((r, i) => {
        const y = TOP + i * ROW_H;
        const barW = logScale(r.wh, BAR_W);
        const color = TIER_COLOR[r.tier];

        return (
          <g key={`${r.label}-${r.hardware}`}>
            {/* Label */}
            <text
              x={LABEL_W} y={y + 5}
              fill={COLORS.text} fontSize={11} textAnchor="end"
            >
              {r.label}
            </text>
            {/* Hardware (small, dim, italic) */}
            <text
              x={LABEL_W} y={y + 18}
              fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="end"
            >
              on {r.hardware}
            </text>

            {/* Bar */}
            <rect
              x={BAR_X} y={y - 3} width={Math.max(barW, 1)} height={11}
              rx={2}
              fill={color}
              fillOpacity={0.75}
            />

            {/* Value */}
            <text
              x={BAR_X + barW + 8} y={y + 6}
              fill={COLORS.textDim}
              fontSize={10} fontFamily="monospace"
            >
              {fmt(r.wh)}
            </text>
          </g>
        );
      })}

      {/* Takeaway */}
      <g transform={`translate(20, ${TOP + sorted.length * ROW_H + 22})`}>
        <rect width={W - 40} height={26} rx={4}
          fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={17} fill={COLORS.violet} fontSize={11} textAnchor="middle" fontWeight={600}>
          &ldquo;AI energy&rdquo; treated as one number conflates a phone NPU and a cloud reasoning model.
        </text>
      </g>
    </FigShell>
  );
}

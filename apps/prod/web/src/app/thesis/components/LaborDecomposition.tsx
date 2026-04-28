import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Schematic-with-callouts (paired-axis comparison).
 * One question: which AI, reorganizing which labor, at which gradient?
 *
 * Two parallel bands share a single horizontal axis ("gradient" from
 * silent → shock). The asymmetry the prose names — "the visibility
 * curve is inverse to the consequence curve" — becomes the diagonal
 * mismatch between the two bands.
 */

interface AIType {
  id: string;
  label: string;
  /** 0..1 — position on shock axis */
  gradient: number;
  /** 0..1 — actual consequence magnitude */
  consequence: number;
  note: string;
}

interface LaborType {
  id: string;
  label: string;
  /** 0..1 — visibility on shock axis (gets the discourse) */
  visibility: number;
  /** 0..1 — actual consequence */
  consequence: number;
  note: string;
}

const AI_TYPES: AIType[] = [
  { id: 'recsys',  label: 'Recommender systems',     gradient: 0.10, consequence: 0.85, note: 'silently reorganized hiring, lending, news, dating · ~15 yrs · no debate' },
  { id: 'robots',  label: 'Robotics with embedded learning', gradient: 0.22, consequence: 0.70, note: 'warehouses, agriculture, logistics · gradient-invisible to professionals' },
  { id: 'vision',  label: 'Vision / biometric models', gradient: 0.40, consequence: 0.55, note: 'silent except where it hits a sensor (wrongful arrest, named target system)' },
  { id: 'genllm',  label: 'Generative LLMs',          gradient: 0.92, consequence: 0.45, note: 'crossed visibility threshold Nov 2022 — the shock that got the discourse' },
];

const LABOR_TYPES: LaborType[] = [
  { id: 'data',    label: 'Low-status data work',          visibility: 0.08, consequence: 0.90, note: 'human reinforcement at $1.32–2/hr in Kenya · worst conditions, no shock' },
  { id: 'midtier', label: 'Mid-tier credentialed work',    visibility: 0.30, consequence: 0.65, note: 'paralegal, junior creative, customer service · attrition not strikes' },
  { id: 'highsts', label: 'High-status knowledge work',    visibility: 0.85, consequence: 0.35, note: 'visible compression · gets discourse, strikes, magazine covers' },
];

export function LaborDecomposition() {
  const W = 900;
  const H = 580;
  const PAD_L = 280;
  const PAD_R = 30;
  const AXIS_W = W - PAD_L - PAD_R;

  // Vertical layout
  const Y_AI_TOP    = 60;
  const Y_AI_BOT    = 220;
  const Y_AXIS      = 270;
  const Y_LABOR_TOP = 320;
  const Y_LABOR_BOT = 480;

  const sx = (g: number) => PAD_L + g * AXIS_W;

  // Map (gradient×consequence) to (x, y) inside a band
  const aiY = (cons: number, top = Y_AI_TOP, bot = Y_AI_BOT) =>
    top + (1 - cons) * (bot - top);
  const laborY = (cons: number, top = Y_LABOR_TOP, bot = Y_LABOR_BOT) =>
    top + (1 - cons) * (bot - top);

  return (
    <FigShell
      title="The labor decomposition — which AI × which labor × which gradient"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          A shared horizontal axis runs from{' '}
          <strong style={{ color: COLORS.cyan }}>silent / low-gradient</strong>{' '}
          on the left to{' '}
          <strong style={{ color: COLORS.red }}>shock / high-gradient</strong>{' '}
          on the right. Each AI type (top band) and labor type (bottom band)
          is positioned along it; vertical position encodes{' '}
          <em>actual consequence</em>. The mismatch between the two bands
          is the argument: <strong style={{ color: COLORS.amber }}>the visibility
          curve is inverse to the consequence curve</strong>. Recommender
          systems and low-status data work sit at the silent end with the
          biggest consequences. Generative LLMs and high-status knowledge
          work sit at the shock end with relatively smaller ones.
        </>
      }
    >
      {/* Side labels — band purposes */}
      <text x={20} y={Y_AI_TOP + 4} fill={COLORS.violet} fontSize={11} fontFamily="monospace" letterSpacing={2.5}>
        AI TYPE
      </text>
      <text x={20} y={Y_AI_TOP + 20} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic">
        positioned by gradient (silent ↔ shock)
      </text>
      <text x={20} y={Y_AI_TOP + 38} fill={COLORS.textWhisper} fontSize={9} fontFamily="monospace">
        ↑ vertical = actual consequence
      </text>

      <text x={20} y={Y_LABOR_TOP + 4} fill={COLORS.amber} fontSize={11} fontFamily="monospace" letterSpacing={2.5}>
        LABOR TYPE
      </text>
      <text x={20} y={Y_LABOR_TOP + 20} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic">
        positioned by visibility (silent ↔ shock)
      </text>
      <text x={20} y={Y_LABOR_TOP + 38} fill={COLORS.textWhisper} fontSize={9} fontFamily="monospace">
        ↑ vertical = actual consequence
      </text>

      {/* Top band background */}
      <rect x={PAD_L - 6} y={Y_AI_TOP - 4} width={AXIS_W + 12} height={Y_AI_BOT - Y_AI_TOP + 8}
        fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.18)" strokeWidth={1} rx={6} />

      {/* Bottom band background */}
      <rect x={PAD_L - 6} y={Y_LABOR_TOP - 4} width={AXIS_W + 12} height={Y_LABOR_BOT - Y_LABOR_TOP + 8}
        fill="rgba(245,158,11,0.04)" stroke="rgba(245,158,11,0.18)" strokeWidth={1} rx={6} />

      {/* Shared gradient axis */}
      <line x1={PAD_L} x2={W - PAD_R} y1={Y_AXIS} y2={Y_AXIS} stroke="rgba(255,255,255,0.20)" />
      {[
        { g: 0.0,  label: 'silent · low gradient' },
        { g: 0.33, label: 'quiet' },
        { g: 0.66, label: 'visible' },
        { g: 1.0,  label: 'shock · high gradient' },
      ].map((t) => {
        const x = sx(t.g);
        return (
          <g key={t.label}>
            <line x1={x} x2={x} y1={Y_AXIS - 4} y2={Y_AXIS + 4} stroke="rgba(255,255,255,0.30)" />
            <text x={x} y={Y_AXIS + 18} fill={COLORS.textDim} fontSize={9.5} fontFamily="monospace" textAnchor="middle">
              {t.label}
            </text>
            {/* Faint vertical guide through both bands */}
            <line x1={x} x2={x} y1={Y_AI_TOP} y2={Y_LABOR_BOT}
              stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
          </g>
        );
      })}
      <text x={(PAD_L + W - PAD_R) / 2} y={Y_AXIS - 8} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
        SHARED GRADIENT — the §3 axis
      </text>

      {/* AI nodes */}
      {AI_TYPES.map((a) => {
        const x = sx(a.gradient);
        const y = aiY(a.consequence);
        const r = 6 + a.consequence * 6;
        // Drop line from node to axis
        return (
          <g key={a.id}>
            <line x1={x} x2={x} y1={y} y2={Y_AXIS}
              stroke="rgba(167,139,250,0.30)" strokeWidth={1} strokeDasharray="2,3" />
            <circle cx={x} cy={y} r={r}
              fill={COLORS.violet} fillOpacity={0.65}
              stroke={COLORS.violet} strokeWidth={1} />
            <text x={x} y={y - r - 6} fill={COLORS.text} fontSize={11} textAnchor="middle">
              {a.label}
            </text>
          </g>
        );
      })}

      {/* Labor nodes */}
      {LABOR_TYPES.map((l) => {
        const x = sx(l.visibility);
        const y = laborY(l.consequence);
        const r = 6 + l.consequence * 6;
        return (
          <g key={l.id}>
            <line x1={x} x2={x} y1={Y_AXIS} y2={y}
              stroke="rgba(245,158,11,0.30)" strokeWidth={1} strokeDasharray="2,3" />
            <circle cx={x} cy={y} r={r}
              fill={COLORS.amber} fillOpacity={0.65}
              stroke={COLORS.amber} strokeWidth={1} />
            <text x={x} y={y + r + 16} fill={COLORS.text} fontSize={11} textAnchor="middle">
              {l.label}
            </text>
          </g>
        );
      })}

      {/* The diagonal-mismatch arrow — annotation that calls it out */}
      <g>
        {/* Arrow from low-gradient AI (recsys) to low-visibility labor (data work) — the silent diagonal */}
        <path
          d={`M ${sx(AI_TYPES[0].gradient) + 4} ${aiY(AI_TYPES[0].consequence) + 30}
              C ${sx(AI_TYPES[0].gradient) + 40} ${(Y_AI_BOT + Y_LABOR_TOP) / 2 - 10},
                ${sx(LABOR_TYPES[0].visibility) - 40} ${(Y_AI_BOT + Y_LABOR_TOP) / 2 + 10},
                ${sx(LABOR_TYPES[0].visibility) + 4} ${laborY(LABOR_TYPES[0].consequence) - 30}`}
          stroke={COLORS.amber} strokeWidth={1.25} fill="none" strokeDasharray="3,3" opacity={0.55}
        />
        {/* Arrow from high-gradient AI (genllm) to high-visibility labor (highstatus) — the shock diagonal */}
        <path
          d={`M ${sx(AI_TYPES[3].gradient) - 4} ${aiY(AI_TYPES[3].consequence) + 30}
              C ${sx(AI_TYPES[3].gradient) - 40} ${(Y_AI_BOT + Y_LABOR_TOP) / 2 - 10},
                ${sx(LABOR_TYPES[2].visibility) + 40} ${(Y_AI_BOT + Y_LABOR_TOP) / 2 + 10},
                ${sx(LABOR_TYPES[2].visibility) - 4} ${laborY(LABOR_TYPES[2].consequence) - 30}`}
          stroke={COLORS.red} strokeWidth={1.25} fill="none" strokeDasharray="3,3" opacity={0.55}
        />
      </g>

      {/* Bottom note panel */}
      <g transform={`translate(20, ${Y_LABOR_BOT + 30})`}>
        <text x={0} y={0} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" letterSpacing={2}>
          THREE GRADIENTS · THREE POLITICAL RESPONSES
        </text>
        <text x={0} y={20} fill={COLORS.textSoft} fontSize={11} fontStyle="italic">
          Calling all three &ldquo;AI and jobs&rdquo; is the same move as calling everything from a thermostat to ChatGPT
          &ldquo;AI&rdquo; — a refusal to decompose. It is the move that lets the shock layer absorb the public attention
          while the slow layer reorganizes labor without it.
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 28})`}>
        <rect width={W - 40} height={22} rx={4}
          fill="rgba(245,158,11,0.08)" stroke={COLORS.amber} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={COLORS.amber} fontSize={11} textAnchor="middle" fontWeight={600}>
          Visibility curve is inverse to consequence curve. The discourse follows the visible.
        </text>
      </g>
    </FigShell>
  );
}

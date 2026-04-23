import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Row-repeater.
 * One question: what happens when seven things are all called "AI"
 * despite differing on every property that would matter for a
 * rejection or endorsement?
 */

interface AiRow {
  label: string;
  scale: 'xl' | 'l' | 'm' | 's' | 'xs';
  compute: 'data-center' | 'cluster' | 'server' | 'laptop';
  openness: 'closed' | 'partial' | 'open';
  note: string;
}

const ROWS: AiRow[] = [
  {
    label: 'Frontier foundation LLM (GPT-5, Claude, Gemini Ultra)',
    scale: 'xl',
    compute: 'data-center',
    openness: 'closed',
    note: 'trained for months across thousands of GPUs; what the water critique is actually about',
  },
  {
    label: 'Mid-size open LLM (Llama 3, Mistral Large)',
    scale: 'l',
    compute: 'cluster',
    openness: 'partial',
    note: 'weights released; training cost still massive; inference on a single workstation',
  },
  {
    label: 'Vision / multimodal model (CLIP, image-gen)',
    scale: 'l',
    compute: 'cluster',
    openness: 'partial',
    note: 'image training sets carry decades of representational bias, calcified in pixel space',
  },
  {
    label: 'Physics-informed neural net (our PI-GNN)',
    scale: 's',
    compute: 'laptop',
    openness: 'open',
    note: 'millions of params; trains in hours; runs in watts; physics regularizer keeps it honest',
  },
  {
    label: 'Classical ML (random forest, gradient boost)',
    scale: 's',
    compute: 'laptop',
    openness: 'open',
    note: 'existed for decades; unambiguously “AI” in the taxonomic sense; nobody panics',
  },
  {
    label: 'Kriging (geostatistics, 1960s)',
    scale: 'xs',
    compute: 'laptop',
    openness: 'open',
    note: 'the workhorse half of computational hydrology depends on; “AI” by the same taxonomy',
  },
  {
    label: 'The marketing category (“AI-powered”)',
    scale: 'xs',
    compute: 'laptop',
    openness: 'partial',
    note: 'vibes; may be any or none of the above; sold by the label',
  },
];

const SCALE_BAR: Record<AiRow['scale'], number> = {
  xl: 200,
  l: 130,
  m: 80,
  s: 40,
  xs: 18,
};

const COMPUTE_LABEL: Record<AiRow['compute'], string> = {
  'data-center': 'data-center',
  cluster: 'cluster',
  server: 'server',
  laptop: 'laptop',
};

const COMPUTE_COLOR: Record<AiRow['compute'], string> = {
  'data-center': COLORS.red,
  cluster: COLORS.amber,
  server: COLORS.cyan,
  laptop: COLORS.green,
};

const OPENNESS_COLOR: Record<AiRow['openness'], string> = {
  closed: COLORS.red,
  partial: COLORS.amber,
  open: COLORS.green,
};

export function AISemanticBlackBox() {
  const rowH = 52;
  const topMargin = 60;

  return (
    <FigShell
      title='Seven things, all called "AI"'
      viewBox={`0 0 900 ${topMargin + ROWS.length * rowH + 70}`}
      figcaption={
        <>
          Every row is called <em>AI</em>. They differ on every property
          that would matter for a rejection or an endorsement:{' '}
          <strong style={{ color: COLORS.red }}>compute scale</strong>,{' '}
          <strong style={{ color: COLORS.amber }}>training environment</strong>,{' '}
          <strong style={{ color: COLORS.green }}>openness</strong>,
          water footprint, relationship to the public record, whose
          hands are on the governance. Refusing to decompose the
          category lets a blanket veto pass as a considered position —
          and lets a blanket enthusiasm pass as the same. Part of what
          LeResearch exists to do is build the vocabulary that
          separates a mathematical method from the business model
          currently monetizing it.
        </>
      }
    >
      {/* Column headers */}
      <text x={20} y={22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1}>INSTANCE</text>
      <text x={410} y={22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1}>COMPUTE</text>
      <text x={540} y={22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1}>SCALE (RELATIVE)</text>
      <text x={780} y={22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1}>OPENNESS</text>
      <line x1={10} y1={34} x2={890} y2={34} stroke="rgba(255,255,255,0.08)" />

      {ROWS.map((r, i) => {
        const y = topMargin + i * rowH;
        return (
          <g key={r.label}>
            {/* Label */}
            <text x={20} y={y + 4} fill={COLORS.text} fontSize={11}>
              {r.label}
            </text>
            <text x={20} y={y + 18} fill={COLORS.textDim} fontSize={9} fontStyle="italic">
              {r.note}
            </text>

            {/* Compute column */}
            <rect x={405} y={y - 6} width={110} height={18} rx={9} fill={`${COMPUTE_COLOR[r.compute]}14`} stroke={COMPUTE_COLOR[r.compute]} strokeWidth={1} />
            <text x={460} y={y + 5} fill={COMPUTE_COLOR[r.compute]} fontSize={9} fontFamily="monospace" textAnchor="middle">
              {COMPUTE_LABEL[r.compute]}
            </text>

            {/* Scale bar */}
            <rect x={540} y={y - 4} width={220} height={14} rx={2} fill="rgba(255,255,255,0.03)" />
            <rect x={540} y={y - 4} width={SCALE_BAR[r.scale]} height={14} rx={2} fill={COLORS.violet} opacity={0.75} />
            <text x={540 + SCALE_BAR[r.scale] + 6} y={y + 6} fill={COLORS.textDim} fontSize={8} fontFamily="monospace">
              {r.scale}
            </text>

            {/* Openness chip */}
            <rect x={775} y={y - 6} width={90} height={18} rx={9} fill={`${OPENNESS_COLOR[r.openness]}14`} stroke={OPENNESS_COLOR[r.openness]} strokeWidth={1} />
            <text x={820} y={y + 5} fill={OPENNESS_COLOR[r.openness]} fontSize={9} fontFamily="monospace" textAnchor="middle">
              {r.openness}
            </text>

            {/* Row separator */}
            {i < ROWS.length - 1 && (
              <line x1={10} y1={y + 34} x2={890} y2={y + 34} stroke="rgba(255,255,255,0.04)" />
            )}
          </g>
        );
      })}

      {/* Bottom takeaway */}
      <g transform={`translate(20, ${topMargin + ROWS.length * rowH + 20})`}>
        <rect width={860} height={38} rx={6} fill="rgba(239, 68, 68, 0.05)" stroke={COLORS.red} strokeDasharray="4,2" />
        <text x={430} y={16} fill={COLORS.red} fontSize={11} textAnchor="middle" fontWeight={600}>
          &ldquo;We don&apos;t do AI&rdquo; has no referent until a row is named.
        </text>
        <text x={430} y={30} fill={COLORS.textSoft} fontSize={10} textAnchor="middle" fontStyle="italic">
          Most critique of AI is a critique of row 1. Most of LeResearch&apos;s work happens in rows 4 &ndash; 6.
        </text>
      </g>
    </FigShell>
  );
}

import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Schematic-with-callouts.
 * One question: where does the boundary of "AI" actually sit, and
 * does it stay still?
 *
 * Answer: it migrates. Larry Tesler's effect — "intelligence is
 * whatever machines haven't done yet" — operating in real time.
 * Things called AI when invented get reclassified as "just computation"
 * once they work reliably. The visual: each demoted item starts above
 * the line at its inception year, then a line drops it to its demotion
 * year below.
 */

interface Item {
  label: string;
  /** Year first called AI */
  inception: number;
  /** Year it stopped being called AI; undefined = still called AI */
  demoted?: number;
  note?: string;
}

const ITEMS: Item[] = [
  // Demoted (the visual story)
  { label: 'Theorem proving', inception: 1956, demoted: 1975 },
  { label: 'Route planning', inception: 1959, demoted: 1985 },
  { label: 'ELIZA', inception: 1966, demoted: 1985 },
  { label: 'OCR', inception: 1976, demoted: 1995 },
  { label: 'Expert systems', inception: 1980, demoted: 1992 },
  { label: 'Chess engines', inception: 1990, demoted: 1998, note: 'Deep Blue beats Kasparov' },
  { label: 'PageRank / search', inception: 1998, demoted: 2010 },
  { label: 'Spam filtering', inception: 2000, demoted: 2008 },
  { label: 'Recommendation algorithms', inception: 2003, demoted: 2012 },
  { label: 'Statistical translation', inception: 2006, demoted: 2018 },
  { label: 'Speech recognition', inception: 2010, demoted: 2018 },
  { label: 'AlphaGo', inception: 2016, demoted: 2022 },

  // Still called AI in 2026
  { label: 'Large language models', inception: 2020 },
  { label: 'Diffusion image generation', inception: 2022 },
  { label: 'Multimodal models', inception: 2023 },
  { label: 'Reasoning models', inception: 2024 },
  { label: 'Generative video', inception: 2024 },
  { label: 'Autonomous agents', inception: 2025 },
];

export function AIEffectTimeline() {
  const W = 900;
  const H = 480;

  const X_LEFT = 60;
  const X_RIGHT = W - 60;
  const X_RANGE = X_RIGHT - X_LEFT;

  const YEAR_MIN = 1955;
  const YEAR_MAX = 2030;

  const Y_TOP_ZONE = 60;     // top label
  const Y_TOP = 90;          // top zone (still AI items live here)
  const Y_AXIS = 280;        // timeline axis
  const Y_BOT = 320;         // bottom zone (demoted items live here)
  const Y_BOT_END = 440;     // bottom zone end

  const yearToX = (y: number) => X_LEFT + ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * X_RANGE;

  // Stagger labels vertically inside each zone to avoid overlap
  const stagger = (i: number, base: number, step = 20, count = 5) => base + (i % count) * step;

  // Sort demoted by inception so stagger looks intentional
  const demoted = ITEMS.filter((i) => i.demoted !== undefined).sort((a, b) => a.inception - b.inception);
  const stillAI = ITEMS.filter((i) => i.demoted === undefined).sort((a, b) => a.inception - b.inception);

  return (
    <FigShell
      title="The AI effect — the boundary moves"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Larry Tesler:{' '}
          <em style={{ color: COLORS.text }}>&ldquo;intelligence is whatever machines haven&apos;t done yet.&rdquo;</em>{' '}
          Each item enters at its inception year above the line, then{' '}
          <strong style={{ color: COLORS.red }}>drops below</strong> at its
          demotion year — the moment it became reliable enough that the
          public stopped calling it &ldquo;AI&rdquo; and started calling
          it &ldquo;just computation,&rdquo; &ldquo;the algorithm,&rdquo;
          or &ldquo;ML.&rdquo; The items still above the line in 2026
          (LLMs, diffusion, reasoning, agents) are simply the ones that
          haven&apos;t been demoted yet. The methodological consequence:
          the term &ldquo;AI&rdquo; has no stable referent. Any
          definition pinning to &ldquo;what AI does today&rdquo; will be
          obsolete by the next demotion cycle.
        </>
      }
    >
      {/* Zone labels */}
      <text x={20} y={Y_TOP_ZONE - 10} fill={COLORS.green} fontSize={11} fontFamily="monospace" letterSpacing={3.5}>
        STILL CALLED AI IN 2026
      </text>
      <text x={20} y={Y_BOT - 14} fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={3.5}>
        DEMOTED — NOW &ldquo;JUST COMPUTATION&rdquo;
      </text>

      {/* Timeline axis */}
      <line x1={X_LEFT} y1={Y_AXIS} x2={X_RIGHT} y2={Y_AXIS} stroke="rgba(255,255,255,0.20)" />
      {[1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030].map((y) => {
        const x = yearToX(y);
        return (
          <g key={y}>
            <line x1={x} x2={x} y1={Y_AXIS - 4} y2={Y_AXIS + 4} stroke="rgba(255,255,255,0.25)" />
            <text
              x={x} y={Y_AXIS + 18}
              fill={COLORS.textDim} fontSize={10} fontFamily="monospace" textAnchor="middle"
            >
              {y}
            </text>
          </g>
        );
      })}

      {/* Demoted items — line + arrow + label */}
      {demoted.map((it, i) => {
        const x1 = yearToX(it.inception);
        const x2 = yearToX(it.demoted!);
        const yLabel = stagger(i, Y_BOT, 22, 5);

        return (
          <g key={`demoted-${it.label}`}>
            {/* Inception dot above the line */}
            <circle cx={x1} cy={Y_AXIS - 8} r={3} fill={COLORS.green} />
            {/* Demotion dot below the line */}
            <circle cx={x2} cy={Y_AXIS + 8} r={3} fill={COLORS.red} />
            {/* Curved line from inception (above) to demotion (below) */}
            <path
              d={`M ${x1} ${Y_AXIS - 8} C ${x1} ${Y_AXIS}, ${x2} ${Y_AXIS}, ${x2} ${Y_AXIS + 8}`}
              stroke="rgba(239,68,68,0.45)"
              strokeWidth={1}
              fill="none"
              strokeDasharray="3,2"
            />
            {/* Vertical drop line from demotion dot to label */}
            <line
              x1={x2} y1={Y_AXIS + 12} x2={x2} y2={yLabel - 8}
              stroke="rgba(239,68,68,0.30)" strokeWidth={1}
            />
            {/* Label below */}
            <text
              x={x2} y={yLabel}
              fill={COLORS.text} fontSize={10}
              textAnchor="middle"
            >
              {it.label}
            </text>
            <text
              x={x2} y={yLabel + 12}
              fill={COLORS.textDim} fontSize={8} fontFamily="monospace"
              textAnchor="middle"
            >
              {it.inception}→{it.demoted}
            </text>
            {it.note && (
              <text
                x={x2} y={yLabel + 24}
                fill={COLORS.textWhisper} fontSize={8} fontStyle="italic"
                textAnchor="middle"
              >
                {it.note}
              </text>
            )}
          </g>
        );
      })}

      {/* Still-called-AI items — dot + label above the line */}
      {stillAI.map((it, i) => {
        const x = yearToX(it.inception);
        // Stagger upward; newer items get higher placement
        const yLabel = stagger(i, Y_TOP + 10, 28, 5);

        return (
          <g key={`still-${it.label}`}>
            <circle cx={x} cy={Y_AXIS - 8} r={4} fill={COLORS.green} />
            {/* Vertical line up from dot to label */}
            <line
              x1={x} y1={Y_AXIS - 12} x2={x} y2={yLabel + 10}
              stroke="rgba(34,197,94,0.30)" strokeWidth={1}
            />
            <text
              x={x} y={yLabel}
              fill={COLORS.text} fontSize={10.5} fontWeight={500}
              textAnchor="middle"
            >
              {it.label}
            </text>
            <text
              x={x} y={yLabel - 12}
              fill={COLORS.textDim} fontSize={8} fontFamily="monospace"
              textAnchor="middle"
            >
              {it.inception}
            </text>
          </g>
        );
      })}

      {/* Takeaway callout */}
      <g transform={`translate(20, ${H - 28})`}>
        <rect width={W - 40} height={22} rx={4}
          fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={COLORS.violet} fontSize={11} textAnchor="middle" fontWeight={600}>
          Today&apos;s AI is just whatever has not yet been demoted to &ldquo;the algorithm.&rdquo;
        </text>
      </g>
    </FigShell>
  );
}

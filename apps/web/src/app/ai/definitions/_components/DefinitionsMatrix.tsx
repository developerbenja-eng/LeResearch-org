import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Comparison grid.
 * One question: do the major AI definitions agree on which artefacts
 * count as AI?
 *
 * Answer: no — and the disagreement pattern is itself the lesson.
 * Some definitions (Russell & Norvig "rational agent") include almost
 * everything down to a thermostat; some (China CAC, UK AISI) only
 * count generative or frontier systems.
 */

type Verdict = 'yes' | 'partial' | 'no';

interface Row {
  source: string;
  scope: string; // short tag
  cells: Record<string, Verdict>;
}

const ARTEFACTS = [
  { id: 'thermo',    label: 'Thermostat',         note: 'rule-based controller' },
  { id: 'regress',   label: 'Regression model',   note: 'loan-scoring use' },
  { id: 'classify',  label: 'BERT classifier',    note: 'fine-tuned, 110M' },
  { id: 'whisper',   label: 'Whisper',            note: 'speech-to-text' },
  { id: 'diff',      label: 'Diffusion',          note: 'image generation' },
  { id: 'chat',      label: 'LLM chat',           note: 'GPT-4o, Claude' },
  { id: 'reason',    label: 'LLM reasoning',      note: 'o-class, thinking' },
] as const;

const ROWS: Row[] = [
  {
    source: 'EU AI Act, Art. 3(1)',
    scope: 'broad — but autonomy + adaptiveness required',
    cells: { thermo: 'no', regress: 'partial', classify: 'yes', whisper: 'yes', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'OECD (2023)',
    scope: 'broad — "infers… outputs"',
    cells: { thermo: 'no', regress: 'partial', classify: 'yes', whisper: 'yes', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'NIST AI RMF 1.0',
    scope: 'broad — no autonomy gate',
    cells: { thermo: 'no', regress: 'yes', classify: 'yes', whisper: 'yes', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'ISO/IEC 22989:2022',
    scope: 'standards — engineering definition',
    cells: { thermo: 'no', regress: 'yes', classify: 'yes', whisper: 'yes', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'China CAC (Aug 2023)',
    scope: 'narrow — generative services only',
    cells: { thermo: 'no', regress: 'no', classify: 'no', whisper: 'yes', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'UK AI Security Institute',
    scope: 'narrow — frontier models only',
    cells: { thermo: 'no', regress: 'no', classify: 'no', whisper: 'no', diff: 'partial', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'Russell & Norvig (rational agent)',
    scope: 'broadest — anything acting toward best outcome',
    cells: { thermo: 'partial', regress: 'yes', classify: 'yes', whisper: 'yes', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'McCarthy / Dartmouth (1955)',
    scope: 'broadest — "any feature of intelligence"',
    cells: { thermo: 'no', regress: 'yes', classify: 'yes', whisper: 'yes', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
  {
    source: 'OpenAI Charter (AGI)',
    scope: 'narrow — "outperform humans at most economically valuable work"',
    cells: { thermo: 'no', regress: 'no', classify: 'no', whisper: 'no', diff: 'no', chat: 'partial', reason: 'partial' },
  },
  {
    source: 'Bender et al. — Stochastic Parrots',
    scope: 'critical — form, not meaning',
    cells: { thermo: 'no', regress: 'no', classify: 'no', whisper: 'partial', diff: 'yes', chat: 'yes', reason: 'yes' },
  },
];

const VERDICT_STYLE: Record<Verdict, { fill: string; stroke: string; text: string; glyph: string }> = {
  yes:     { fill: 'rgba(34,197,94,0.20)',  stroke: 'rgba(34,197,94,0.60)',  text: '#22c55e', glyph: '✓' },
  partial: { fill: 'rgba(245,158,11,0.20)', stroke: 'rgba(245,158,11,0.60)', text: '#f59e0b', glyph: '~' },
  no:      { fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.10)', text: 'rgba(245,245,247,0.30)', glyph: '·' },
};

export function DefinitionsMatrix() {
  const W = 900;
  const ROW_LABEL_W = 290;
  const CELL_W = (W - ROW_LABEL_W - 30) / ARTEFACTS.length;
  const CELL_H = 40;
  const HEADER_H = 90;
  const TOP = 30;
  const H = TOP + HEADER_H + ROWS.length * CELL_H + 60;

  return (
    <FigShell
      title="Do the definitions agree on what counts as AI?"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          A typical loan-scoring regression is{' '}
          <strong style={{ color: VERDICT_STYLE.yes.text }}>yes</strong> for
          NIST and ISO,{' '}
          <strong style={{ color: VERDICT_STYLE.partial.text }}>partial</strong>{' '}
          for the EU and OECD (depending on autonomy + adaptiveness gating), and{' '}
          <strong style={{ color: VERDICT_STYLE.no.text }}>no</strong> for the
          UK AI Security Institute (not frontier) and China&apos;s generative-AI
          rules (not generative).{' '}
          <span style={{ color: COLORS.text }}>The visible disagreement is the lesson.</span>{' '}
          &ldquo;We don&apos;t do AI&rdquo; and &ldquo;we are an AI company&rdquo;
          have no shared referent until a column is named.
        </>
      }
    >
      {/* Column headers */}
      <g>
        {ARTEFACTS.map((a, i) => {
          const x = ROW_LABEL_W + i * CELL_W;
          return (
            <g key={a.id}>
              <text
                x={x + CELL_W / 2} y={TOP + 28}
                fill={COLORS.text} fontSize={11}
                textAnchor="middle"
              >
                {a.label}
              </text>
              <text
                x={x + CELL_W / 2} y={TOP + 44}
                fill={COLORS.textDim} fontSize={9} fontStyle="italic"
                textAnchor="middle"
              >
                {a.note}
              </text>
            </g>
          );
        })}
      </g>

      {/* Section labels (left side) */}
      <text x={20} y={TOP + 28} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" letterSpacing={2}>
        DEFINITION
      </text>
      <text x={20} y={TOP + 44} fill={COLORS.textWhisper} fontSize={9} fontStyle="italic">
        scope / framing
      </text>

      {/* Header underline */}
      <line x1={20} x2={W - 20} y1={TOP + HEADER_H - 10} y2={TOP + HEADER_H - 10} stroke="rgba(255,255,255,0.10)" />

      {/* Rows */}
      {ROWS.map((r, i) => {
        const y = TOP + HEADER_H + i * CELL_H;
        const isOdd = i % 2 === 1;
        return (
          <g key={r.source}>
            {/* Zebra background */}
            {isOdd && (
              <rect x={20} y={y} width={W - 40} height={CELL_H} fill="rgba(255,255,255,0.015)" />
            )}

            {/* Source label */}
            <text x={20} y={y + 18} fill={COLORS.text} fontSize={11.5} fontWeight={500}>
              {r.source}
            </text>
            <text x={20} y={y + 32} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic">
              {r.scope}
            </text>

            {/* Verdict cells */}
            {ARTEFACTS.map((a, j) => {
              const x = ROW_LABEL_W + j * CELL_W;
              const verdict = r.cells[a.id];
              const s = VERDICT_STYLE[verdict];
              return (
                <g key={a.id}>
                  <rect
                    x={x + 6} y={y + 6} width={CELL_W - 12} height={CELL_H - 12}
                    rx={4}
                    fill={s.fill}
                    stroke={s.stroke}
                    strokeWidth={1}
                  />
                  <text
                    x={x + CELL_W / 2} y={y + CELL_H / 2 + 4}
                    fill={s.text} fontSize={14} fontFamily="monospace" fontWeight={600}
                    textAnchor="middle"
                  >
                    {s.glyph}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Legend + takeaway */}
      <g transform={`translate(20, ${H - 50})`}>
        {(['yes', 'partial', 'no'] as Verdict[]).map((v, i) => {
          const s = VERDICT_STYLE[v];
          return (
            <g key={v} transform={`translate(${i * 90}, 0)`}>
              <rect width={18} height={14} rx={2} fill={s.fill} stroke={s.stroke} y={-10} />
              <text x={26} y={2} fill={s.text} fontSize={10} fontFamily="monospace">
                {s.glyph} {v}
              </text>
            </g>
          );
        })}

        <rect x={310} y={-14} width={W - 350} height={22} rx={4}
          fill="rgba(96,165,250,0.06)" stroke={COLORS.blue} strokeDasharray="4,2" />
        <text x={310 + (W - 350) / 2} y={1} fill={COLORS.blue} fontSize={10.5} textAnchor="middle" fontWeight={600}>
          Same word. Seven artefacts. Ten definitions. No two columns agree.
        </text>
      </g>
    </FigShell>
  );
}

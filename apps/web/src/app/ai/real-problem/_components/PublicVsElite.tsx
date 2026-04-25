import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Comparison.
 * One question: how does what publics fear about AI compare to what
 * elite policy discourse covers?
 *
 * Two horizontal bars per topic — one going left (public concern)
 * and one going right (elite discourse). The X-shaped asymmetry
 * (top half: public >> elite; bottom half: elite >> public) is the
 * visual signature of the displacement thesis.
 */

interface Row {
  topic: string;
  /** Public concern, 0-100. Pew Apr 2025 + Reuters/Ipsos Aug 2025. */
  pub: number;
  /** Elite discourse intensity, 0-100. Qualitative coding of policy
   *  filings, lab safety frameworks, AISI outputs, Bletchley Declaration,
   *  Schumer Insight Forum agendas. Intentionally rough; the asymmetry
   *  is the finding, not the precise value. */
  eli: number;
  /** Optional source tag for the public number */
  pubSrc?: string;
}

const ROWS: Row[] = [
  { topic: 'AI permanently displacing workers',     pub: 71, eli: 10, pubSrc: 'R/I 2025' },
  { topic: 'AI-driven deepfakes / misinformation',  pub: 77, eli: 22, pubSrc: 'R/I 2025' },
  { topic: 'AI replacing human relationships',      pub: 66, eli: 4,  pubSrc: 'R/I 2025' },
  { topic: 'AI energy / environment',               pub: 61, eli: 14, pubSrc: 'R/I 2025' },
  { topic: 'Algorithmic bias / fairness',           pub: 53, eli: 18, pubSrc: 'Pew 2025' },
  { topic: 'Surveillance / privacy',                pub: 50, eli: 12, pubSrc: 'Pew 2025' },
  // Below: where elite discourse dominates
  { topic: 'AI extinction / x-risk',                pub: 12, eli: 78, pubSrc: 'Pew 2025' },
  { topic: 'Alignment / control problem',           pub: 8,  eli: 84 },
  { topic: 'AGI capability timelines',              pub: 14, eli: 72 },
  { topic: 'Frontier compute thresholds',           pub: 3,  eli: 65 },
];

export function PublicVsElite() {
  const W = 900;
  const ROW_H = 42;
  const Y0 = 110;
  const H = Y0 + ROWS.length * ROW_H + 70;

  // Bar geometry
  const CENTER_LEFT  = 340;   // right edge of public bars / left edge of label column
  const CENTER_RIGHT = 560;   // right edge of label column / left edge of elite bars
  const MAX_BAR = 280;        // max bar pixel width
  const scale = (v: number) => (v / 100) * MAX_BAR;

  return (
    <FigShell
      title="Public vs elite — the same word, two different fears"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          On the left,{' '}
          <strong style={{ color: COLORS.blue }}>what publics actually report worrying about</strong>{' '}
          (Pew Research, April 2025; Reuters/Ipsos, August 2025). On the right,{' '}
          <strong style={{ color: COLORS.red }}>what elite AI policy discourse covers</strong>{' '}
          — a qualitative coding of policy filings, lab safety frameworks, the
          Bletchley Declaration, UK/US AISI outputs, and the Schumer AI Insight
          Forum agendas. The top six rows are dominated by the public bar; the
          bottom four by the elite bar. The X-shape is the displacement: the
          fears with empirical receipts and policy traction are not the same
          fears.
        </>
      }
    >
      {/* ─── Section headers ────────────────────────────────────── */}
      <text x={CENTER_LEFT - 8} y={26} fill={COLORS.blue} fontSize={11} fontFamily="monospace" letterSpacing={3} textAnchor="end">
        PUBLIC FEARS
      </text>
      <text x={CENTER_RIGHT + 8} y={26} fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={3}>
        ELITE DISCOURSE
      </text>

      <text x={CENTER_LEFT - 8} y={42} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="end">
        Pew + Reuters/Ipsos polling, 2025
      </text>
      <text x={CENTER_RIGHT + 8} y={42} fill={COLORS.textDim} fontSize={9} fontStyle="italic">
        coded from policy filings + lab frameworks
      </text>

      {/* ─── Axis-tick reference (just at top, subtle) ──────────── */}
      {[25, 50, 75].map((tick) => {
        const wL = scale(tick);
        const wR = scale(tick);
        return (
          <g key={tick}>
            <line
              x1={CENTER_LEFT - wL} y1={Y0 - 8} x2={CENTER_LEFT - wL} y2={Y0 + ROWS.length * ROW_H + 4}
              stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4"
            />
            <line
              x1={CENTER_RIGHT + wR} y1={Y0 - 8} x2={CENTER_RIGHT + wR} y2={Y0 + ROWS.length * ROW_H + 4}
              stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4"
            />
            <text x={CENTER_LEFT - wL} y={Y0 - 14} fill={COLORS.textWhisper} fontSize={8} textAnchor="middle" fontFamily="monospace">{tick}</text>
            <text x={CENTER_RIGHT + wR} y={Y0 - 14} fill={COLORS.textWhisper} fontSize={8} textAnchor="middle" fontFamily="monospace">{tick}</text>
          </g>
        );
      })}

      {/* ─── Rows ────────────────────────────────────────────────── */}
      {ROWS.map((r, i) => {
        const yRow = Y0 + i * ROW_H;
        const barY = yRow + 6;
        const barH = 16;

        const pubW = scale(r.pub);
        const eliW = scale(r.eli);

        // Public side — bar grows leftward from CENTER_LEFT
        const pubX = CENTER_LEFT - pubW;
        // Elite side — bar grows rightward from CENTER_RIGHT
        const eliX = CENTER_RIGHT;

        // Color intensity: louder bars get full color, quieter ones dim
        const pubFill = `rgba(96,165,250,${0.25 + (r.pub / 100) * 0.55})`;
        const eliFill = `rgba(239,68,68,${0.25 + (r.eli / 100) * 0.55})`;

        return (
          <g key={r.topic}>
            {/* Public bar */}
            <rect x={pubX} y={barY} width={pubW} height={barH} rx={2} fill={pubFill} />
            {/* Public number */}
            <text
              x={CENTER_LEFT - 6} y={barY + barH / 2 + 3.5}
              fill={r.pub >= 30 ? COLORS.text : COLORS.textDim}
              fontSize={10}
              fontFamily="monospace"
              textAnchor="end"
            >
              {r.pub}%
            </text>

            {/* Topic label (centered between the two columns) */}
            <text
              x={(CENTER_LEFT + CENTER_RIGHT) / 2} y={barY + barH / 2 + 3.5}
              fill={COLORS.text} fontSize={11} textAnchor="middle"
            >
              {r.topic}
            </text>

            {/* Elite bar */}
            <rect x={eliX} y={barY} width={eliW} height={barH} rx={2} fill={eliFill} />
            {/* Elite number */}
            <text
              x={CENTER_RIGHT + 6} y={barY + barH / 2 + 3.5}
              fill={r.eli >= 30 ? COLORS.text : COLORS.textDim}
              fontSize={10}
              fontFamily="monospace"
              textAnchor="start"
            >
              {r.eli >= 30 ? `${r.eli}%` : `${r.eli}%`}
            </text>

            {/* Optional source pip */}
            {r.pubSrc && (
              <text
                x={pubX - 6} y={barY + barH / 2 + 3.5}
                fill={COLORS.textWhisper} fontSize={8} fontFamily="monospace" textAnchor="end" fontStyle="italic"
              >
                {r.pubSrc}
              </text>
            )}

            {/* Subtle row separator */}
            {i < ROWS.length - 1 && (
              <line
                x1={20} x2={W - 20}
                y1={yRow + ROW_H - 1} y2={yRow + ROW_H - 1}
                stroke="rgba(255,255,255,0.04)"
              />
            )}
          </g>
        );
      })}

      {/* Vertical center axis */}
      <line x1={(CENTER_LEFT + CENTER_RIGHT) / 2} y1={Y0 - 8} x2={(CENTER_LEFT + CENTER_RIGHT) / 2} y2={Y0 + ROWS.length * ROW_H + 4} stroke="rgba(255,255,255,0.10)" />

      {/* ─── Takeaway callout ───────────────────────────────────── */}
      <g transform={`translate(20, ${Y0 + ROWS.length * ROW_H + 22})`}>
        <rect width={W - 40} height={32} rx={6}
          fill="rgba(239, 68, 68, 0.06)" stroke={COLORS.red} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={14} fill={COLORS.red} fontSize={11} textAnchor="middle" fontWeight={600}>
          Two different fears wearing the same word.
        </text>
        <text x={(W - 40) / 2} y={26} fill={COLORS.textSoft} fontSize={9.5} textAnchor="middle" fontStyle="italic">
          The 36-point gap between AI experts and the public on overall concern (Pew 2025) is the same gap, factored across topics.
        </text>
      </g>
    </FigShell>
  );
}

import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Row-repeater.
 * One question: which "truths" are actually contingent decisions whose
 * origins almost nobody remembers?
 */

interface Frame {
  number: string;
  claim: string;
  origin: string;
  originYear: string;
  evidence: string;
}

const FRAMES: Frame[] = [
  {
    number: '8',
    claim: 'glasses of water / day',
    origin: 'misread 1945 FNB note: "1 mL per calorie of food intake" — the original line said most of the water comes from food',
    originYear: '1945',
    evidence: 'Individual needs vary ~1–3 L; no evidence supports a universal "8 × 8"',
  },
  {
    number: '2,000',
    claim: 'daily calorie target',
    origin: 'FDA food-label rounding, 1993 Nutrition Labeling and Education Act',
    originYear: '1993',
    evidence: 'Highly individual — varies with age, sex, build, activity, season',
  },
  {
    number: '3',
    claim: 'meals / day, fixed schedule',
    origin: '19th-century industrial shift structure — breakfast / lunch / dinner synchronized to factory bells',
    originYear: '~1850',
    evidence: 'Pre-industrial societies used 2 or 5; satiety signalling is not clock-driven',
  },
  {
    number: '8',
    claim: 'hours of sleep / night, continuous',
    origin: 'industrial-era consolidation of historically-segmented sleep ("first sleep" + "second sleep")',
    originYear: '~1800',
    evidence: 'Individual needs 6–10 h; segmented sleep is the historical norm',
  },
  {
    number: '9–5',
    claim: 'workday, Mon–Fri',
    origin: 'Ford Motor Company 8-hour day (1914) + mid-20th-century office-work convention',
    originYear: '1914',
    evidence: 'Cognitive productivity does not map uniformly to clock hours',
  },
  {
    number: '30',
    claim: 'students per classroom, age-graded',
    origin: '19th-century Prussian + industrial-US compulsory-education model: one teacher, age-sorted rows, 50-minute periods',
    originYear: '~1850',
    evidence: 'Nothing about learning requires uniform age-cohorts, ratio, or period length',
  },
];

export function CalcifiedFrames() {
  const rowH = 58;
  const topMargin = 50;

  return (
    <FigShell
      title="Infrastructure, or decisions nobody remembers making?"
      viewBox={`0 0 900 ${topMargin + FRAMES.length * rowH + 70}`}
      figcaption={
        <>
          Every row is a number most adults treat as physics. Every row
          was a specific decision by specific people for specific reasons
          — most of which had nothing to do with what the human body or
          mind actually needed. The numbers are not uniformly wrong;
          some are approximately right for some people some of the time.
          The point is not the specific number. The point is that a
          contingent frame is being accepted as a natural law by people
          who would, in other contexts, be the first to ask to see the
          evidence.
        </>
      }
    >
      {/* Column headers */}
      <text x={20} y={22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1}>THE "TRUTH"</text>
      <text x={270} y={22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1}>HOW IT ACTUALLY GOT THERE</text>
      <text x={680} y={22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1}>WHAT THE EVIDENCE SAYS</text>
      <line x1={10} y1={34} x2={890} y2={34} stroke="rgba(255,255,255,0.08)" />

      {FRAMES.map((f, i) => {
        const y = topMargin + i * rowH;
        return (
          <g key={f.claim}>
            {/* Number + claim */}
            <text x={20} y={y + 10} fill={COLORS.violet} fontSize={28} fontFamily="Georgia, serif" fontWeight={300}>
              {f.number}
            </text>
            <text x={20} y={y + 32} fill={COLORS.textSoft} fontSize={11} fontStyle="italic">
              {f.claim}
            </text>

            {/* Origin */}
            <g>
              <text x={270} y={y + 10} fill={COLORS.amber} fontSize={10} fontFamily="monospace" letterSpacing={0.5}>
                {f.originYear}
              </text>
              <text x={270} y={y + 28} fill={COLORS.text} fontSize={10.5} className="max-w-prose">
                <tspan x={270} dy={0}>{f.origin.length > 75 ? f.origin.slice(0, 75) : f.origin}</tspan>
                {f.origin.length > 75 && <tspan x={270} dy={13}>{f.origin.slice(75)}</tspan>}
              </text>
            </g>

            {/* Evidence check */}
            <g>
              <rect x={680} y={y - 5} width={8} height={40} rx={2} fill={`${COLORS.red}22`} />
              <text x={698} y={y + 10} fill={COLORS.red} fontSize={9.5} fontFamily="monospace" letterSpacing={0.3}>
                FAILS ↓
              </text>
              <text x={698} y={y + 25} fill={COLORS.textSoft} fontSize={10}>
                <tspan x={698} dy={0}>{f.evidence.length > 30 ? f.evidence.slice(0, 30) : f.evidence}</tspan>
                {f.evidence.length > 30 && <tspan x={698} dy={13}>{f.evidence.slice(30, 65)}</tspan>}
                {f.evidence.length > 65 && <tspan x={698} dy={13}>{f.evidence.slice(65)}</tspan>}
              </text>
            </g>

            {/* Row separator */}
            {i < FRAMES.length - 1 && (
              <line x1={10} y1={y + rowH - 14} x2={890} y2={y + rowH - 14} stroke="rgba(255,255,255,0.04)" />
            )}
          </g>
        );
      })}

      {/* Takeaway */}
      <g transform={`translate(20, ${topMargin + FRAMES.length * rowH + 16})`}>
        <rect width={860} height={42} rx={6} fill={`${COLORS.violet}10`} stroke={COLORS.violet} strokeDasharray="4,2" />
        <text x={430} y={18} fill={COLORS.violet} fontSize={11} textAnchor="middle" fontWeight={600}>
          The filter hardens into infrastructure. Infrastructure stops being questioned.
        </text>
        <text x={430} y={33} fill={COLORS.textSoft} fontSize={10} textAnchor="middle" fontStyle="italic">
          &quot;Common sense&quot; is often a contingent decision that survived long enough to be mistaken for gravity.
        </text>
      </g>
    </FigShell>
  );
}

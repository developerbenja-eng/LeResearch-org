import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Motion-as-mechanic + Flow.
 * One question: what happens to "truth" when the answer-producing
 * layer is silently versioned under commercial governance?
 */

interface VersionPoint {
  label: string;       // "v4.1" / "Q1 2026" etc
  when: string;        // "Jan"
  update: string;      // "RLHF pass"
  answer: string;      // how it answered the same question
  tone: 'cautious' | 'confident' | 'hedged' | 'refuses';
}

const VERSIONS: VersionPoint[] = [
  {
    label: 'v4.0',
    when: 'Jan',
    update: 'base release',
    answer: '"There is scientific debate. Evidence suggests X, but Y is contested."',
    tone: 'cautious',
  },
  {
    label: 'v4.1',
    when: 'Mar',
    update: 'RLHF pass',
    answer: '"The mainstream position is X. You can read more here."',
    tone: 'confident',
  },
  {
    label: 'v4.2',
    when: 'Jun',
    update: 'safety fine-tune',
    answer: '"This is a sensitive area. I can\'t provide specific guidance."',
    tone: 'refuses',
  },
  {
    label: 'v4.3',
    when: 'Sep',
    update: 'silent A/B',
    answer: '"Depending on context, X or Y may be appropriate. Consult a specialist."',
    tone: 'hedged',
  },
];

const TONE_COLOR: Record<VersionPoint['tone'], string> = {
  cautious: COLORS.cyan,
  confident: COLORS.violet,
  hedged: COLORS.amber,
  refuses: COLORS.red,
};

const TONE_LABEL: Record<VersionPoint['tone'], string> = {
  cautious: 'cautious',
  confident: 'confident',
  hedged: 'hedged',
  refuses: 'refuses',
};

export function SilentVersioning() {
  const timelineY = 90;
  const answerBandY = 140;
  const answerBandH = 70;
  const userY = 260;

  const colWidth = 200;
  const colX = (i: number) => 40 + i * colWidth;

  return (
    <FigShell
      title="The same question asked of the same &quot;AI&quot; across a year"
      viewBox="0 0 860 330"
      figcaption={
        <>
          The question never changes. The model&apos;s name never changes.
          But the answer does — silently, between quarterly RLHF passes,
          safety fine-tunes, and A/B tests that ship without
          announcement. Users see a moving target as a stable one.
          &ldquo;The AI said&rdquo; is a sentence with no fixed referent,
          and <strong style={{ color: COLORS.violet }}>what counts as
          &ldquo;the answer&rdquo; becomes a property of the provider
          rather than the question</strong>. The traveling dot shows the
          default answer moving over time — what most users will have
          quoted at any given moment.
        </>
      }
    >
      <defs>
        <marker id="arrow-drift" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.textDim} />
        </marker>
      </defs>

      {/* Constant-question label at the top-left */}
      <g transform="translate(20, 24)">
        <text x={0} y={0} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" letterSpacing={1.2}>
          THE QUESTION
        </text>
        <text x={0} y={18} fill={COLORS.text} fontSize={12} fontStyle="italic">
          &ldquo;Is X safe / true / recommended?&rdquo;
        </text>
        <text x={0} y={34} fill={COLORS.textDim} fontSize={9}>
          — constant across all four versions —
        </text>
      </g>

      {/* Timeline axis */}
      <line x1={40} y1={timelineY} x2={820} y2={timelineY} stroke="rgba(255,255,255,0.2)" />
      {VERSIONS.map((v, i) => (
        <g key={`t-${v.label}`}>
          <circle cx={colX(i) + 80} cy={timelineY} r={5} fill={TONE_COLOR[v.tone]} />
          <text x={colX(i) + 80} y={timelineY - 12} fill={COLORS.text} fontSize={10} textAnchor="middle" fontFamily="monospace">
            {v.label}
          </text>
          <text x={colX(i) + 80} y={timelineY + 18} fill={COLORS.textDim} fontSize={9} textAnchor="middle" fontFamily="monospace">
            {v.when}
          </text>
          <text x={colX(i) + 80} y={timelineY + 30} fill={COLORS.amber} fontSize={8.5} textAnchor="middle" fontStyle="italic">
            {v.update}
          </text>
        </g>
      ))}

      {/* Version transition dashes */}
      {VERSIONS.slice(0, -1).map((_, i) => (
        <line
          key={`d-${i}`}
          x1={colX(i) + 85}
          y1={timelineY}
          x2={colX(i + 1) + 75}
          y2={timelineY}
          stroke={COLORS.textWhisper}
          strokeDasharray="3,3"
        />
      ))}

      {/* Answer bands — each version's answer to the same question */}
      {VERSIONS.map((v, i) => {
        const color = TONE_COLOR[v.tone];
        return (
          <g key={`a-${v.label}`}>
            <rect
              x={colX(i)}
              y={answerBandY}
              width={colWidth - 20}
              height={answerBandH}
              rx={6}
              fill={`${color}0c`}
              stroke={color}
              strokeWidth={1.2}
              strokeOpacity={0.6}
            />
            <text x={colX(i) + 12} y={answerBandY + 15} fill={color} fontSize={9} fontFamily="monospace" letterSpacing={0.4}>
              {TONE_LABEL[v.tone].toUpperCase()}
            </text>
            {/* Wrapped answer text */}
            {wrap(v.answer, 26).map((line, j) => (
              <text
                key={j}
                x={colX(i) + 12}
                y={answerBandY + 30 + j * 13}
                fill={COLORS.textSoft}
                fontSize={9.5}
                fontStyle="italic"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Traveling dot — the "current default answer" at any moment. */}
      <g>
        <circle r={7} fill={COLORS.violet}>
          <animateMotion
            dur="12s"
            repeatCount="indefinite"
            path={`M ${colX(0) + 80} ${timelineY} L ${colX(1) + 80} ${timelineY} L ${colX(2) + 80} ${timelineY} L ${colX(3) + 80} ${timelineY} L ${colX(0) + 80} ${timelineY}`}
            keyTimes="0;0.25;0.5;0.75;1"
            keyPoints="0;0.33;0.67;1;1"
          />
          <animate attributeName="r" values="7;9;7;9;7;9;7;9;7" dur="12s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* User row at the bottom */}
      <line x1={40} y1={userY - 18} x2={820} y2={userY - 18} stroke="rgba(255,255,255,0.06)" strokeDasharray="2,3" />
      <g transform={`translate(20, ${userY})`}>
        <text x={0} y={0} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" letterSpacing={1.2}>
          WHAT THE USER SEES
        </text>
        <text x={0} y={20} fill={COLORS.text} fontSize={12}>
          &ldquo;The AI says&nbsp;
          <tspan fill={COLORS.violet} fontStyle="italic">[whatever was current the day they asked]</tspan>
          .&rdquo;
        </text>
        <text x={0} y={40} fill={COLORS.textDim} fontSize={10} fontStyle="italic">
          No version indicator. No changelog. No acknowledgement that last quarter&apos;s answer was different.
        </text>
      </g>

      {/* Takeaway */}
      <g transform="translate(20, 295)">
        <rect width={820} height={30} rx={6} fill={`${COLORS.red}0a`} stroke={COLORS.red} strokeDasharray="4,2" />
        <text x={410} y={19} fill={COLORS.red} fontSize={10.5} textAnchor="middle" fontWeight={600}>
          &ldquo;Truth&rdquo; becomes downstream of whoever has the subsidy runway + distribution channel to ship the next update.
        </text>
      </g>
    </FigShell>
  );
}

/** Simple word-wrap for SVG text — breaks a string into lines of at most `max` chars. */
function wrap(s: string, max: number): string[] {
  const words = s.split(' ');
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      if (line) out.push(line.trim());
      line = w;
    } else {
      line = line + ' ' + w;
    }
  }
  if (line.trim()) out.push(line.trim());
  return out;
}

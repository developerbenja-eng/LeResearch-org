import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Symmetric comparison converging on a shared
 * outcome. One question: how do two opposite-seeming positions
 * produce the same governance failure — refusing to decompose the
 * specific instance?
 */

export function MirrorFailure() {
  return (
    <FigShell
      title="Two opposite-seeming positions. Same outcome."
      viewBox="0 0 900 420"
      figcaption={
        <>
          <strong style={{ color: COLORS.amber }}>The excluded person</strong>{' '}
          says &ldquo;this is not for me&rdquo; because the filter they
          met told them so. <strong style={{ color: COLORS.cyan }}>The
          privileged actor</strong> says &ldquo;the people don&apos;t
          like it&rdquo; without having asked the specific question of
          the specific public. The first is a symptom. The second is a
          decision. But the operational effect is identical: the
          category is not decomposed, the specific instance is not
          examined, and the governance choice is made on brand rather
          than substance. Addressing only the first leaves the second
          intact — which is why LeResearch commits to naming both.
        </>
      }
    >
      <defs>
        <marker id="arrow-conv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.red} />
        </marker>
        <linearGradient id="lg-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.25} />
          <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="lg-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.25} />
          <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {/* Center divider */}
      <line x1={450} y1={20} x2={450} y2={300} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

      {/* ─── LEFT COLUMN ─ the excluded ─────────────────────────── */}
      <g>
        <text x={40} y={25} fill={COLORS.amber} fontSize={11} fontFamily="monospace" letterSpacing={1.5}>
          FAILURE MODE 1 · EXCLUDED PERSON
        </text>
        <text x={40} y={40} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={0.5}>
          filtered out · internalizes exclusion · reports the filter
        </text>

        <rect x={30} y={55} width={400} height={200} rx={10} fill="url(#lg-left)" stroke={COLORS.amber} strokeWidth={1} strokeOpacity={0.4} />

        {/* Person */}
        <g transform="translate(70, 100)">
          <circle cx={0} cy={0} r={18} fill={`${COLORS.amber}30`} stroke={COLORS.amber} strokeWidth={1.3} />
          <text x={0} y={4} fill={COLORS.amber} fontSize={14} textAnchor="middle">◯</text>
        </g>
        <text x={70} y={140} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="middle" letterSpacing={0.4}>
          filtered out by
        </text>
        <text x={70} y={152} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="middle" letterSpacing={0.4}>
          a linear frontend
        </text>

        {/* Quote */}
        <g transform="translate(130, 85)">
          <rect width={280} height={60} rx={6} fill={`${COLORS.amber}10`} stroke={COLORS.amber} strokeWidth={1} strokeOpacity={0.5} />
          <text x={140} y={25} fill={COLORS.text} fontSize={14} textAnchor="middle" fontStyle="italic">
            &ldquo;I don&apos;t understand AI.&rdquo;
          </text>
          <text x={140} y={46} fill={COLORS.textDim} fontSize={10} textAnchor="middle" fontStyle="italic">
            &ldquo;Science isn&apos;t for people like me.&rdquo;
          </text>
        </g>

        {/* Mechanism note */}
        <g transform="translate(45, 170)">
          <text x={0} y={0} fill={COLORS.textDim} fontSize={9.5} fontFamily="monospace" letterSpacing={0.3}>MECHANISM</text>
          <text x={0} y={14} fill={COLORS.textSoft} fontSize={10.5}>
            <tspan x={0}>reports the filter that failed them —</tspan>
            <tspan x={0} dy={14}>a symptom, not a choice.</tspan>
            <tspan x={0} dy={14}>the frontend decided they couldn&apos;t</tspan>
            <tspan x={0} dy={14}>understand; they came to believe it.</tspan>
          </text>
        </g>
      </g>

      {/* ─── RIGHT COLUMN ─ the privileged ─────────────────────── */}
      <g>
        <text x={470} y={25} fill={COLORS.cyan} fontSize={11} fontFamily="monospace" letterSpacing={1.5}>
          FAILURE MODE 2 · PRIVILEGED ACTOR
        </text>
        <text x={470} y={40} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={0.5}>
          empowered by the filter · invokes "the people" · avoids analysis
        </text>

        <rect x={470} y={55} width={400} height={200} rx={10} fill="url(#lg-right)" stroke={COLORS.cyan} strokeWidth={1} strokeOpacity={0.4} />

        {/* Person */}
        <g transform="translate(510, 100)">
          <circle cx={0} cy={0} r={22} fill={`${COLORS.cyan}30`} stroke={COLORS.cyan} strokeWidth={1.5} />
          <text x={0} y={5} fill={COLORS.cyan} fontSize={16} textAnchor="middle">◉</text>
        </g>
        <text x={510} y={145} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="middle" letterSpacing={0.4}>
          privileged into
        </text>
        <text x={510} y={157} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="middle" letterSpacing={0.4}>
          a governance role
        </text>

        {/* Quote */}
        <g transform="translate(570, 85)">
          <rect width={280} height={60} rx={6} fill={`${COLORS.cyan}10`} stroke={COLORS.cyan} strokeWidth={1} strokeOpacity={0.5} />
          <text x={140} y={25} fill={COLORS.text} fontSize={13} textAnchor="middle" fontStyle="italic">
            &ldquo;The people don&apos;t like AI.&rdquo;
          </text>
          <text x={140} y={46} fill={COLORS.textDim} fontSize={10} textAnchor="middle" fontStyle="italic">
            &ldquo;We&apos;re respecting what they believe.&rdquo;
          </text>
        </g>

        {/* Mechanism note */}
        <g transform="translate(485, 170)">
          <text x={0} y={0} fill={COLORS.textDim} fontSize={9.5} fontFamily="monospace" letterSpacing={0.3}>MECHANISM</text>
          <text x={0} y={14} fill={COLORS.textSoft} fontSize={10.5}>
            <tspan x={0}>invokes a public they haven&apos;t</tspan>
            <tspan x={0} dy={14}>consulted on this specific question —</tspan>
            <tspan x={0} dy={14}>a decision, not a symptom.</tspan>
            <tspan x={0} dy={14}>performs humility, avoids the analysis.</tspan>
          </text>
        </g>
      </g>

      {/* Convergence arrows */}
      <path
        d="M 230 255 Q 300 310, 435 340"
        stroke={COLORS.red}
        strokeWidth={1.5}
        fill="none"
        strokeOpacity={0.7}
        markerEnd="url(#arrow-conv)"
      />
      <path
        d="M 670 255 Q 600 310, 465 340"
        stroke={COLORS.red}
        strokeWidth={1.5}
        fill="none"
        strokeOpacity={0.7}
        markerEnd="url(#arrow-conv)"
      />

      {/* Shared outcome box */}
      <g transform="translate(250, 335)">
        <rect width={400} height={68} rx={8} fill={`${COLORS.red}10`} stroke={COLORS.red} strokeWidth={1.5} />
        <text x={200} y={20} fill={COLORS.red} fontSize={10} fontFamily="monospace" textAnchor="middle" letterSpacing={1.5}>
          SAME OUTCOME
        </text>
        <text x={200} y={40} fill={COLORS.text} fontSize={12} textAnchor="middle">
          the specific instance is not examined
        </text>
        <text x={200} y={56} fill={COLORS.textSoft} fontSize={10.5} textAnchor="middle" fontStyle="italic">
          the category is not decomposed · governance made on brand, not substance
        </text>
      </g>
    </FigShell>
  );
}

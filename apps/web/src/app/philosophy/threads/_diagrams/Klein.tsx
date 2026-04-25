import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Klein — the shock doctrine.
 * A pre-staged policy package waits in the wings. A shock arrives
 * (crisis, war, disaster). The package passes before deliberation
 * can catch up.
 */

export function KleinDiagram() {
  const W = 640;
  const H = 320;

  return (
    <FigShell
      title="The shock doctrine"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          A policy package is pre-staged. A shock event arrives — a war,
          a hurricane, a financial crisis, a pandemic. While public
          attention is consumed managing the shock, the package passes
          with no deliberation. The shock is the political instrument,
          not the policy.
        </>
      }
    >
      {/* Three columns */}
      {/* Column 1: pre-staged policy */}
      <g transform="translate(40, 60)">
        <rect width={150} height={140} rx={8}
          fill="rgba(167,139,250,0.06)" stroke={COLORS.violet} strokeWidth={1.25} />
        <text x={75} y={20} fill={COLORS.violet} fontSize={10} fontFamily="monospace" letterSpacing={2} textAnchor="middle">
          PRE-STAGED
        </text>
        <text x={75} y={42} fill={COLORS.text} fontSize={11} textAnchor="middle">
          Policy package
        </text>
        <text x={75} y={58} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          drafted in advance
        </text>
        {/* Stack of "drafts" */}
        {[0,1,2,3].map((i) => (
          <rect key={i} x={20 + i * 4} y={80 + i * 4}
            width={100} height={36} rx={3}
            fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.45)" strokeWidth={0.5} />
        ))}
      </g>

      {/* Arrow 1 */}
      <path d={`M 200 130 L 250 130`} stroke={COLORS.red} strokeWidth={1.5} markerEnd="url(#arrow-klein)" />
      <defs>
        <marker id="arrow-klein" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.red} />
        </marker>
      </defs>

      {/* Column 2: shock event */}
      <g transform="translate(260, 60)">
        <rect width={140} height={140} rx={8}
          fill="rgba(239,68,68,0.08)" stroke={COLORS.red} strokeWidth={1.25} />
        <text x={70} y={20} fill={COLORS.red} fontSize={10} fontFamily="monospace" letterSpacing={2} textAnchor="middle">
          SHOCK
        </text>
        <text x={70} y={42} fill={COLORS.text} fontSize={11} textAnchor="middle">
          Crisis event
        </text>
        <text x={70} y={58} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          attention consumed
        </text>
        {/* Lightning bolt */}
        <g transform="translate(70, 90)">
          <path d="M -8 0 L 6 0 L -2 18 L 12 18 L -8 42 L 0 22 L -10 22 Z"
            fill={COLORS.red} fillOpacity={0.7} />
        </g>
      </g>

      {/* Arrow 2 */}
      <path d={`M 410 130 L 460 130`} stroke={COLORS.amber} strokeWidth={1.5} markerEnd="url(#arrow-klein2)" />
      <defs>
        <marker id="arrow-klein2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.amber} />
        </marker>
      </defs>

      {/* Column 3: passed before debate */}
      <g transform="translate(470, 60)">
        <rect width={140} height={140} rx={8}
          fill="rgba(245,158,11,0.06)" stroke={COLORS.amber} strokeWidth={1.25} />
        <text x={70} y={20} fill={COLORS.amber} fontSize={10} fontFamily="monospace" letterSpacing={2} textAnchor="middle">
          PASSES
        </text>
        <text x={70} y={42} fill={COLORS.text} fontSize={11} textAnchor="middle">
          Before deliberation
        </text>
        <text x={70} y={58} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          fast normalization
        </text>
        <text x={70} y={104} fill={COLORS.amber} fontSize={20} textAnchor="middle">✓</text>
        <text x={70} y={124} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          becomes the new floor
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(239,68,68,0.08)" stroke={COLORS.red} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.red} fontSize={10} textAnchor="middle" fontWeight={600}>
          The shock is the instrument. The policy is the goal.
        </text>
      </g>
    </FigShell>
  );
}

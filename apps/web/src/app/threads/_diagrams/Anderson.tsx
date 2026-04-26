import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Anderson — Imagined Communities.
 * Print capitalism scales social cognition past Dunbar by giving
 * strangers a shared morning text. The mechanism: many people read
 * the same words at the same time, become a felt collective despite
 * never meeting.
 */

export function AndersonDiagram() {
  const W = 640;
  const H = 340;

  // Strangers — distributed dots
  const STRANGERS: { x: number; y: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      STRANGERS.push({
        x: 320 + (c - 3) * 38 + ((r % 2) ? 12 : 0),
        y: 90 + r * 36,
      });
    }
  }

  return (
    <FigShell
      title="Print capitalism scales the imagined collective"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Strangers who will never meet read the same morning text at
          roughly the same time. The simultaneity becomes a{' '}
          <em>felt collective</em> — the mechanism by which a group
          larger than Dunbar&apos;s number can experience itself as one
          thing. The newspaper is not the message; the simultaneity is.
        </>
      }
    >
      {/* The press at the left */}
      <g transform="translate(60, 130)">
        <rect x={0} y={0} width={70} height={80} rx={4}
          fill="rgba(96,165,250,0.10)" stroke={COLORS.blue} strokeWidth={1.5} />
        <text x={35} y={28} fill={COLORS.blue} fontSize={9} fontFamily="monospace" letterSpacing={2} textAnchor="middle">
          THE PRESS
        </text>
        <text x={35} y={48} fill={COLORS.text} fontSize={10} textAnchor="middle">
          one morning text
        </text>
        <text x={35} y={64} fill={COLORS.textDim} fontSize={8.5} fontStyle="italic" textAnchor="middle">
          printed in vernacular
        </text>
      </g>

      {/* Connecting beams to each stranger */}
      {STRANGERS.map((p, i) => (
        <line key={`b-${i}`}
          x1={130} y1={170}
          x2={p.x} y2={p.y}
          stroke="rgba(96,165,250,0.10)" strokeWidth={0.6}
        />
      ))}

      {/* Strangers as dots, with a halo on the cluster */}
      <ellipse cx={320} cy={150} rx={150} ry={75}
        fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.30)" strokeWidth={1} strokeDasharray="3,3" />

      {STRANGERS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4}
          fill={COLORS.violet} fillOpacity={0.7} stroke={COLORS.violet} strokeWidth={0.5} />
      ))}

      {/* Label on the cluster */}
      <text x={500} y={120} fill={COLORS.violet} fontSize={10} fontFamily="monospace" letterSpacing={2}>
        STRANGERS
      </text>
      <text x={500} y={138} fill={COLORS.text} fontSize={11}>
        reading at the same hour
      </text>
      <text x={500} y={154} fill={COLORS.textDim} fontSize={9} fontStyle="italic">
        will never meet
      </text>
      <text x={500} y={172} fill={COLORS.textDim} fontSize={9} fontStyle="italic">
        share one frame
      </text>
      <text x={500} y={190} fill={COLORS.amber} fontSize={10} fontFamily="monospace">
        = a felt collective
      </text>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontWeight={600}>
          The newspaper isn&apos;t the message. The simultaneity is.
        </text>
      </g>
    </FigShell>
  );
}

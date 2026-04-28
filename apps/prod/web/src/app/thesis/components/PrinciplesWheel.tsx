import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Schematic-with-callouts (radial constellation).
 * One question: how do the six operational principles relate to each
 * other and to the central commitment?
 *
 * Six principles arrayed around a center labeled "the learner."
 * Each principle is anchored to one of the six axes; the spokes
 * are the linkage. Central position emphasizes that every principle
 * defers to who is on the receiving end.
 */

interface Principle {
  num: string;
  title: string;
  hint: string;
  /** Anchor color */
  color: string;
}

const PRINCIPLES: Principle[] = [
  { num: '9.1', title: 'Frontend defined by learner',          hint: 'depth, language, modality, jargon — chosen on the receiving end',  color: COLORS.violet },
  { num: '9.2', title: 'Silos are our convenience',            hint: 'aquifers ↔ water policy ↔ AI compute ↔ legal history are one story', color: COLORS.cyan },
  { num: '9.3', title: 'Jargon is a frontend choice',          hint: 'every term gets a plain-language companion one tap away',           color: COLORS.green },
  { num: '9.4', title: 'Confidence is structural',             hint: 'every claim travels with source, confidence tag, update timestamp', color: COLORS.amber },
  { num: '9.5', title: 'Open by default',                      hint: 'data, code, hardware, methodology — public good when we can',       color: COLORS.blue },
  { num: '9.6', title: 'Experts augmented, never replaced',    hint: 'teacher, hydrogeologist, lawyer still own the frontend',            color: COLORS.indigo },
];

export function PrinciplesWheel() {
  const W = 900;
  const H = 520;

  const CX = W / 2;
  const CY = H / 2 - 20;
  const R = 160;     // distance from center to each principle node
  const NODE_W = 200;
  const NODE_H = 70;

  // Six positions around the wheel, starting at top, clockwise
  const positions = PRINCIPLES.map((_, i) => {
    const angle = (-Math.PI / 2) + (i * Math.PI * 2) / PRINCIPLES.length;
    return {
      x: CX + R * Math.cos(angle),
      y: CY + R * Math.sin(angle),
      angle,
    };
  });

  return (
    <FigShell
      title="Six operational principles · radial constellation"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          The six principles aren&apos;t a list — they are six axes around
          one commitment:{' '}
          <strong style={{ color: COLORS.text }}>the person on the receiving end defines the frontend</strong>.
          Each principle is a constraint, not an aspiration. Removing any
          one collapses the whole; that is what &ldquo;structural&rdquo;
          means here.
        </>
      }
    >
      {/* Spokes */}
      {positions.map((p, i) => (
        <line
          key={`spoke-${i}`}
          x1={CX} y1={CY}
          x2={p.x} y2={p.y}
          stroke={`${PRINCIPLES[i].color}55`}
          strokeWidth={1}
          strokeDasharray="3,3"
        />
      ))}

      {/* Center hub */}
      <g>
        <circle cx={CX} cy={CY} r={62}
          fill="rgba(167,139,250,0.06)"
          stroke={COLORS.violet}
          strokeWidth={1.5}
        />
        <text x={CX} y={CY - 8}
          fill={COLORS.violet} fontSize={10} fontFamily="monospace" letterSpacing={2.5}
          textAnchor="middle"
        >
          THE LEARNER
        </text>
        <text x={CX} y={CY + 10}
          fill={COLORS.text} fontSize={11}
          textAnchor="middle"
        >
          defines the frontend
        </text>
        <text x={CX} y={CY + 24}
          fill={COLORS.textDim} fontSize={9} fontStyle="italic"
          textAnchor="middle"
        >
          the author does not
        </text>
      </g>

      {/* Principle nodes */}
      {positions.map((p, i) => {
        const pr = PRINCIPLES[i];
        // Position card so it doesn't overlap center
        // Move node out from spoke endpoint along outward direction
        const dx = Math.cos(p.angle) * 44;
        const dy = Math.sin(p.angle) * 30;
        const cx = p.x + dx;
        const cy = p.y + dy;
        return (
          <g key={pr.num}>
            <rect
              x={cx - NODE_W / 2} y={cy - NODE_H / 2}
              width={NODE_W} height={NODE_H}
              rx={8}
              fill={`${pr.color}10`}
              stroke={pr.color}
              strokeWidth={1}
            />
            <text
              x={cx - NODE_W / 2 + 12} y={cy - NODE_H / 2 + 18}
              fill={pr.color} fontSize={10} fontFamily="monospace" letterSpacing={1.5}
            >
              §{pr.num}
            </text>
            <text
              x={cx - NODE_W / 2 + 12} y={cy - NODE_H / 2 + 36}
              fill={COLORS.text} fontSize={11} fontWeight={500}
            >
              {pr.title}
            </text>
            <text
              x={cx - NODE_W / 2 + 12} y={cy - NODE_H / 2 + 54}
              fill={COLORS.textSoft} fontSize={9} fontStyle="italic"
            >
              {pr.hint}
            </text>
          </g>
        );
      })}

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 28})`}>
        <rect width={W - 40} height={22} rx={4}
          fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={COLORS.violet} fontSize={11} textAnchor="middle" fontWeight={600}>
          Constraints, not aspirations. Removing any one collapses the whole.
        </text>
      </g>
    </FigShell>
  );
}

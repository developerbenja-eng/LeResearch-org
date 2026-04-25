import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Castoriadis — instituted vs instituting.
 * The settled forms (instituted) are produced by a creative
 * social capacity (instituting) that can also produce new ones.
 * Conservative politics tells us only the instituted exists.
 * Castoriadis insists the instituting is always still present.
 */

export function CastoriadisDiagram() {
  const W = 600;
  const H = 340;

  return (
    <FigShell
      title="Instituted ↔ instituting"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          The settled forms of a society —{' '}
          <strong style={{ color: COLORS.amber }}>the instituted</strong>{' '}
          — are produced by a creative social capacity —{' '}
          <strong style={{ color: COLORS.violet }}>the instituting</strong>{' '}
          — that can also produce new ones. Treating institutions as
          natural is forgetting the second loop is still operating.
        </>
      }
    >
      {/* Instituting side (left) */}
      <g transform="translate(70, 80)">
        <circle cx={80} cy={90} r={70}
          fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeWidth={1.5} />
        <text x={80} y={62} fill={COLORS.violet} fontSize={10} fontFamily="monospace" letterSpacing={2} textAnchor="middle">
          INSTITUTING
        </text>
        <text x={80} y={86} fill={COLORS.text} fontSize={11} textAnchor="middle">
          creative power
        </text>
        <text x={80} y={102} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          that produces forms
        </text>
        <text x={80} y={120} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          and can produce new ones
        </text>
      </g>

      {/* Instituted side (right) */}
      <g transform="translate(360, 80)">
        <rect x={20} y={30} width={140} height={120}
          fill="rgba(245,158,11,0.06)" stroke={COLORS.amber} strokeWidth={1.5} />
        <text x={90} y={52} fill={COLORS.amber} fontSize={10} fontFamily="monospace" letterSpacing={2} textAnchor="middle">
          INSTITUTED
        </text>
        <text x={90} y={76} fill={COLORS.text} fontSize={11} textAnchor="middle">
          settled forms
        </text>
        <text x={90} y={92} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          laws · markets · families
        </text>
        <text x={90} y={108} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          schools · religions · maps
        </text>
        <text x={90} y={138} fill={COLORS.amber} fontSize={9} fontFamily="monospace" textAnchor="middle">
          treated as natural
        </text>
      </g>

      {/* Two-way arrows */}
      <g transform="translate(0, 170)">
        {/* Top arrow: instituting → instituted (produces) */}
        <path d="M 220 -10 C 260 -50, 320 -50, 360 -10" stroke={COLORS.violet} strokeWidth={1.5} fill="none" />
        <polygon points="356,-15 366,-9 354,-3" fill={COLORS.violet} />
        <text x={295} y={-50} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontStyle="italic">
          produces
        </text>

        {/* Bottom arrow: instituted → instituting (forgets / hides) */}
        <path d="M 360 30 C 320 70, 260 70, 220 30" stroke={COLORS.amber} strokeWidth={1.5} strokeDasharray="3,3" fill="none" />
        <polygon points="224,25 214,31 226,37" fill={COLORS.amber} />
        <text x={295} y={75} fill={COLORS.amber} fontSize={10} textAnchor="middle" fontStyle="italic">
          hides the source
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontWeight={600}>
          The instituting capacity does not vanish — it gets disowned by the institutions it produced.
        </text>
      </g>
    </FigShell>
  );
}

import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Searle — status function via collective intentionality.
 *   X counts as Y in context C.
 * A piece of paper (X) counts as a $20 bill (Y) in the context of
 * the US economy (C). The bill has the function only because we
 * collectively accept it does.
 */

export function SearleDiagram() {
  const W = 640;
  const H = 340;

  return (
    <FigShell
      title='"X counts as Y in context C"'
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Searle&apos;s status-function formula:{' '}
          <strong style={{ color: COLORS.cyan }}>X</strong> (a physical
          object) <em>counts as</em>{' '}
          <strong style={{ color: COLORS.amber }}>Y</strong> (a status
          function) in <strong style={{ color: COLORS.violet }}>C</strong>{' '}
          (a collectively-intended context). Money, marriage, citizenship,
          professorship — all status functions. Take away the collective
          intention and the X is just the X again.
        </>
      }
    >
      {/* X — left object */}
      <g transform="translate(60, 100)">
        <rect width={120} height={80} rx={6}
          fill="rgba(34,211,238,0.08)" stroke={COLORS.cyan} strokeWidth={1.5} />
        <text x={60} y={22} fill={COLORS.cyan} fontSize={11} fontFamily="monospace" letterSpacing={3} textAnchor="middle">
          X
        </text>
        <text x={60} y={42} fill={COLORS.text} fontSize={11} textAnchor="middle">
          a piece of paper
        </text>
        <text x={60} y={58} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          (just a piece of paper)
        </text>
        <text x={60} y={74} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          rectangular, green-ish
        </text>
      </g>

      {/* Arrow X → Y, with C label above */}
      <g transform="translate(180, 140)">
        <path d="M 0 0 L 130 0" stroke={COLORS.violet} strokeWidth={1.5} markerEnd="url(#arr-searle)" />
        <text x={65} y={-30} fill={COLORS.violet} fontSize={10} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
          counts as
        </text>
        <text x={65} y={-14} fill={COLORS.violet} fontSize={9} fontStyle="italic" textAnchor="middle">
          via collective intention
        </text>
        <text x={65} y={20} fill={COLORS.violet} fontSize={9.5} textAnchor="middle">
          in context C
        </text>
        <text x={65} y={34} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          the US economy
        </text>
      </g>

      <defs>
        <marker id="arr-searle" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.violet} />
        </marker>
      </defs>

      {/* Y — right status function */}
      <g transform="translate(330, 100)">
        <rect width={120} height={80} rx={6}
          fill="rgba(245,158,11,0.08)" stroke={COLORS.amber} strokeWidth={1.5} />
        <text x={60} y={22} fill={COLORS.amber} fontSize={11} fontFamily="monospace" letterSpacing={3} textAnchor="middle">
          Y
        </text>
        <text x={60} y={42} fill={COLORS.text} fontSize={11} textAnchor="middle">
          a $20 bill
        </text>
        <text x={60} y={58} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          (a status function)
        </text>
        <text x={60} y={74} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          can buy things
        </text>
      </g>

      {/* What happens if collective intention is withdrawn */}
      <g transform="translate(470, 110)">
        <text x={70} y={0} fill={COLORS.red} fontSize={10} fontFamily="monospace" letterSpacing={2} textAnchor="middle">
          REMOVE C
        </text>
        <text x={70} y={20} fill={COLORS.text} fontSize={11} textAnchor="middle">
          → just paper again
        </text>
        <text x={70} y={36} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          hyperinflation, regime change,
        </text>
        <text x={70} y={48} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          collapse of trust
        </text>
      </g>

      {/* Other examples */}
      <g transform="translate(70, 240)">
        <text x={0} y={0} fill={COLORS.textDim} fontSize={10} fontFamily="monospace" letterSpacing={2}>
          OTHER STATUS FUNCTIONS
        </text>
        <text x={0} y={20} fill={COLORS.textSoft} fontSize={11}>
          marriage · citizenship · ownership · professorship · borders · the LLC · the diploma
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontWeight={600}>
          The Y exists because we collectively intend it to. Withdraw the intention and the Y vanishes.
        </text>
      </g>
    </FigShell>
  );
}

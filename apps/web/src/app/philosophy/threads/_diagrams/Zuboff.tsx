import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Zuboff — surveillance capitalism extraction loop.
 * Behavior is extracted as data, processed into prediction products,
 * sold to behavioral-modification clients. The loop closes by
 * modifying behavior to improve future prediction quality.
 */

const STAGES = [
  { label: 'Behavior',                 detail: 'taps, scrolls, locations, sleep, gait',     color: COLORS.cyan },
  { label: 'Behavioral surplus',       detail: 'extracted as data exhaust',                  color: COLORS.violet },
  { label: 'Prediction products',      detail: 'sold to advertisers, insurers, platforms',   color: COLORS.amber },
  { label: 'Behavioral modification',  detail: 'feedback loop tuned to make us more predictable', color: COLORS.red },
];

export function ZuboffDiagram() {
  const W = 640;
  const H = 360;

  const CX = W / 2;
  const CY = H / 2 - 10;
  const R = 110;

  return (
    <FigShell
      title="The behavioral-surplus extraction loop"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Zuboff&apos;s mechanism: behavior is extracted as data, processed
          into <em>prediction products</em>, sold, and then{' '}
          <strong style={{ color: COLORS.red }}>fed back to modify the
          behavior</strong> in ways that improve next-cycle prediction.
          The loop closes. The product is not what the platform shows
          you; the product is the prediction of you, sold to the next
          buyer.
        </>
      }
    >
      {/* Cycle arc */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth={1} strokeDasharray="3,4" />

      {STAGES.map((s, i) => {
        const angle = (-Math.PI / 2) + (i * Math.PI * 2) / STAGES.length;
        const x = CX + R * Math.cos(angle);
        const y = CY + R * Math.sin(angle);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={8} fill={s.color} fillOpacity={0.85} stroke={s.color} strokeWidth={1.25} />
            <text x={x} y={y - 22} fill={COLORS.text} fontSize={11} textAnchor="middle" fontWeight={500}>
              {s.label}
            </text>
            <text x={x} y={y + 26} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
              {s.detail}
            </text>

            {/* Arrow to next */}
            {(() => {
              const nextAngle = (-Math.PI / 2) + ((i + 1) * Math.PI * 2) / STAGES.length;
              const nx = CX + R * Math.cos(nextAngle);
              const ny = CY + R * Math.sin(nextAngle);
              const midAngle = (angle + nextAngle) / 2;
              const mx = CX + (R + 12) * Math.cos(midAngle);
              const my = CY + (R + 12) * Math.sin(midAngle);
              return (
                <path
                  d={`M ${x} ${y} Q ${mx} ${my} ${nx} ${ny}`}
                  stroke={`${s.color}80`} strokeWidth={1.5} fill="none"
                  markerEnd="url(#arr-zuboff)"
                />
              );
            })()}
          </g>
        );
      })}

      <defs>
        <marker id="arr-zuboff" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(245,245,247,0.50)" />
        </marker>
      </defs>

      {/* Center note */}
      <g>
        <text x={CX} y={CY - 4} fill={COLORS.red} fontSize={10} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
          THE PRODUCT
        </text>
        <text x={CX} y={CY + 14} fill={COLORS.textDim} fontSize={9} fontStyle="italic" textAnchor="middle">
          is the prediction of you
        </text>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(239,68,68,0.08)" stroke={COLORS.red} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.red} fontSize={10} textAnchor="middle" fontWeight={600}>
          You are not the customer. You are not even the product. The product is the prediction of you.
        </text>
      </g>
    </FigShell>
  );
}

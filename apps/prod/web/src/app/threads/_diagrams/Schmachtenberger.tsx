import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Schmachtenberger — the metacrisis.
 * The crises don't queue up — they reinforce each other. A network
 * where edges represent amplification, not causation.
 */

interface Node { id: string; x: number; y: number; label: string; color: string; }

const NODES: Node[] = [
  { id: 'climate',   x: 320, y: 80,  label: 'Climate',                    color: COLORS.green },
  { id: 'ai',        x: 480, y: 130, label: 'AI / compute',               color: COLORS.violet },
  { id: 'geopol',    x: 510, y: 230, label: 'Geopolitics',                color: COLORS.red },
  { id: 'inequal',   x: 410, y: 290, label: 'Inequality',                 color: COLORS.amber },
  { id: 'mental',    x: 230, y: 290, label: 'Mental-health collapse',     color: COLORS.indigo },
  { id: 'epistemic', x: 130, y: 230, label: 'Epistemic collapse',         color: COLORS.cyan },
  { id: 'eco',       x: 160, y: 130, label: 'Ecological breakdown',       color: COLORS.green },
];

// Edges = amplification (every node amplifies every adjacent crisis)
const EDGES: [string, string][] = [
  ['climate', 'eco'], ['climate', 'geopol'], ['climate', 'inequal'],
  ['ai', 'epistemic'], ['ai', 'geopol'], ['ai', 'inequal'], ['ai', 'mental'],
  ['geopol', 'inequal'], ['geopol', 'epistemic'],
  ['inequal', 'mental'], ['inequal', 'eco'],
  ['mental', 'epistemic'],
  ['epistemic', 'climate'], ['epistemic', 'eco'],
  ['eco', 'mental'], ['eco', 'geopol'],
];

export function SchmachtenbergerDiagram() {
  const W = 640;
  const H = 380;

  const findNode = (id: string) => NODES.find((n) => n.id === id)!;

  return (
    <FigShell
      title="The metacrisis — interlocking, not sequential"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          The crises don&apos;t queue. Each amplifies the others. A
          climate response that ignores epistemic collapse loses; an
          AI-governance response that ignores geopolitics loses; etc. The
          generator function is the coordination structure, not any
          single crisis. <em>The metacrisis is the connective tissue.</em>
        </>
      }
    >
      {/* Edges (drawn first, behind nodes) */}
      {EDGES.map(([a, b], i) => {
        const A = findNode(a);
        const B = findNode(b);
        return (
          <line key={i}
            x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke="rgba(245,158,11,0.25)" strokeWidth={1.25}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={28}
            fill={`${n.color}22`} stroke={n.color} strokeWidth={1.5} />
          <text x={n.x} y={n.y + 4}
            fill={COLORS.text} fontSize={10} textAnchor="middle">
            {n.label.length > 14 ? n.label.split(' ').map((w, i) => (
              <tspan key={i} x={n.x} dy={i === 0 ? 0 : 12}>{w}</tspan>
            )) : n.label}
          </text>
        </g>
      ))}

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(245,158,11,0.08)" stroke={COLORS.amber} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.amber} fontSize={10} textAnchor="middle" fontWeight={600}>
          Each edge is amplification. Treating any node alone makes the whole worse.
        </text>
      </g>
    </FigShell>
  );
}

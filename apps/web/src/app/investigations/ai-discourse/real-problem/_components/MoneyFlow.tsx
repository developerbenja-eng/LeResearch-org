import type { ReactNode } from 'react';
import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Generic three-column money-flow diagram. Used for both DoomMoneyFlow
 * and HypeMoneyFlow — the visual parallel is the point of the figure.
 *
 * Layout: three columns (sources / recipients / outcomes) with Bezier
 * ribbons between them. Ribbon stroke-width = flow weight.
 */

export interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  /** 1–10, drives stroke width */
  weight: number;
}

export type FlowAccent = 'red' | 'amber' | 'violet';

const ACCENT: Record<FlowAccent, { hex: string; rgb: string }> = {
  red:    { hex: '#ef4444', rgb: '239,68,68' },
  amber:  { hex: '#f59e0b', rgb: '245,158,11' },
  violet: { hex: '#a78bfa', rgb: '167,139,250' },
};

export interface MoneyFlowProps {
  title: string;
  figcaption: ReactNode;
  columnHeaders: [string, string, string];
  sources: FlowNode[];
  recipients: FlowNode[];
  outcomes: FlowNode[];
  flowsSourceToRecipient: FlowEdge[];
  flowsRecipientToOutcome: FlowEdge[];
  takeaway: string;
  accent?: FlowAccent;
}

export function MoneyFlow({
  title,
  figcaption,
  columnHeaders,
  sources,
  recipients,
  outcomes,
  flowsSourceToRecipient,
  flowsRecipientToOutcome,
  takeaway,
  accent = 'red',
}: MoneyFlowProps) {
  const A = ACCENT[accent];
  const W = 900;
  const H = 560;

  const COL_X = { source: 30, recipient: 365, outcome: 700 };
  const COL_W = 175;
  const NODE_GAP = 14;

  const layoutColumn = (nodes: FlowNode[], yTop = 60, yBot = H - 40) => {
    const total = nodes.length;
    const available = yBot - yTop;
    const nodeH = (available - (total - 1) * NODE_GAP) / total;
    return nodes.map((n, i) => ({
      ...n,
      y: yTop + i * (nodeH + NODE_GAP),
      h: nodeH,
    }));
  };

  const srcs = layoutColumn(sources);
  const recps = layoutColumn(recipients);
  const outs = layoutColumn(outcomes);

  const findNode = <T extends { id: string }>(col: T[], id: string) => col.find((n) => n.id === id);

  // Cubic Bezier from (x1,y1) to (x2,y2)
  const ribbon = (x1: number, y1: number, x2: number, y2: number) => {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  return (
    <FigShell title={title} viewBox={`0 0 ${W} ${H}`} figcaption={figcaption}>
      {/* Column headers */}
      {[
        { x: COL_X.source + COL_W / 2,    label: columnHeaders[0] },
        { x: COL_X.recipient + COL_W / 2, label: columnHeaders[1] },
        { x: COL_X.outcome + COL_W / 2,   label: columnHeaders[2] },
      ].map((h) => (
        <text
          key={h.label}
          x={h.x} y={32} fill={A.hex}
          fontSize={11} fontFamily="monospace" letterSpacing={3.5}
          textAnchor="middle"
        >
          {h.label}
        </text>
      ))}

      {/* Source → Recipient flows */}
      <g>
        {flowsSourceToRecipient.map((f, i) => {
          const a = findNode(srcs, f.from);
          const b = findNode(recps, f.to);
          if (!a || !b) return null;
          const x1 = COL_X.source + COL_W;
          const y1 = a.y + a.h / 2;
          const x2 = COL_X.recipient;
          const y2 = b.y + b.h / 2;
          return (
            <path
              key={`s2r-${i}`}
              d={ribbon(x1, y1, x2, y2)}
              fill="none"
              stroke={A.hex}
              strokeOpacity={0.18}
              strokeWidth={f.weight * 1.2}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* Recipient → Outcome flows */}
      <g>
        {flowsRecipientToOutcome.map((f, i) => {
          const a = findNode(recps, f.from);
          const b = findNode(outs, f.to);
          if (!a || !b) return null;
          const x1 = COL_X.recipient + COL_W;
          const y1 = a.y + a.h / 2;
          const x2 = COL_X.outcome;
          const y2 = b.y + b.h / 2;
          return (
            <path
              key={`r2o-${i}`}
              d={ribbon(x1, y1, x2, y2)}
              fill="none"
              stroke={A.hex}
              strokeOpacity={0.18}
              strokeWidth={f.weight * 1.2}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* Nodes */}
      {([
        { col: srcs,  x: COL_X.source },
        { col: recps, x: COL_X.recipient },
        { col: outs,  x: COL_X.outcome },
      ] as const).map(({ col, x }) =>
        col.map((n) => (
          <g key={n.id}>
            <rect
              x={x} y={n.y} width={COL_W} height={n.h}
              rx={6}
              fill={`rgba(${A.rgb},0.06)`}
              stroke={`rgba(${A.rgb},0.45)`}
              strokeWidth={1}
            />
            <text x={x + 12} y={n.y + 22} fill={COLORS.text} fontSize={11.5} fontWeight={500}>
              {n.label}
            </text>
            {n.sublabel && (
              <text
                x={x + 12} y={n.y + 38}
                fill={COLORS.textDim} fontSize={9.5} fontStyle="italic"
              >
                {n.sublabel}
              </text>
            )}
          </g>
        )),
      )}

      {/* Takeaway callout */}
      <g transform={`translate(20, ${H - 30})`}>
        <rect width={W - 40} height={22} rx={4}
          fill={`rgba(${A.rgb},0.08)`} stroke={A.hex} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={A.hex} fontSize={11} textAnchor="middle" fontWeight={600}>
          {takeaway}
        </text>
      </g>
    </FigShell>
  );
}

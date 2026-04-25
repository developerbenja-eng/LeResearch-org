import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Symmetric comparison.
 * One question: what is LeResearch arguing FOR, given that it is also
 * the org that uses LLMs commercially through LeDesign?
 *
 * Two futures shown side-by-side: monoculture (everyone consults the
 * same 3-4 model funnel) vs plurality (many small models, each
 * source-grounded, each surface-different). LeResearch sits in the
 * middle, not against AI but against the monoculture version.
 */

export function TensionDiagram() {
  const W = 900;
  const H = 480;

  // Population dots — same on both sides
  const POP_LEFT_X = 80;
  const POP_RIGHT_X = W - 80;
  const POP_TOP = 70;
  const POP_BOT = 200;

  // Generate a deterministic grid of "people" dots
  const people: { x: number; y: number; }[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      people.push({ x: c * 14, y: r * 16 });
    }
  }

  // Center stage geometry
  const CX = W / 2;
  const STAGE_TOP = POP_BOT + 30;
  const STAGE_BOT = STAGE_TOP + 140;

  return (
    <FigShell
      title="The tension LeResearch exists to hold"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Not anti-AI as a frontend. LeDesign uses language models
          commercially because they are the first plural-by-construction
          frontends humans have ever had access to. The argument is against{' '}
          <strong style={{ color: COLORS.red }}>monoculture in the frontend layer</strong>{' '}
          — the version of the future where everyone consults the same
          three or four models, governed by three or four companies, and
          our collective ability to say <em>&ldquo;that is wrong, and
          here is why&rdquo;</em> atrophies because we stopped exercising
          it.
        </>
      }
    >
      {/* ─── LEFT panel — monoculture ─────────────────────────── */}
      <g>
        <text x={POP_LEFT_X + 56} y={50} fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={3} textAnchor="middle">
          MONOCULTURE
        </text>
        <text x={POP_LEFT_X + 56} y={64} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic" textAnchor="middle">
          everyone consults the same 3–4 models
        </text>

        {/* People */}
        {people.map((p, i) => (
          <circle
            key={`l-${i}`}
            cx={POP_LEFT_X + p.x} cy={POP_TOP + p.y}
            r={2.5}
            fill="rgba(245,245,247,0.45)"
          />
        ))}

        {/* Many converging arrows into ONE funnel */}
        {people.filter((_, i) => i % 3 === 0).map((p, i) => (
          <path
            key={`la-${i}`}
            d={`M ${POP_LEFT_X + p.x + 50} ${POP_TOP + p.y + 8} Q ${POP_LEFT_X + 80} ${STAGE_TOP - 20}, ${POP_LEFT_X + 90} ${STAGE_TOP + 20}`}
            stroke="rgba(239,68,68,0.18)" strokeWidth={1} fill="none"
          />
        ))}

        {/* Single funnel / model */}
        <rect
          x={POP_LEFT_X + 30} y={STAGE_TOP + 20}
          width={120} height={70}
          rx={8}
          fill="rgba(239,68,68,0.10)"
          stroke={COLORS.red} strokeWidth={1.5}
        />
        <text x={POP_LEFT_X + 90} y={STAGE_TOP + 50} fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
          ONE MODEL
        </text>
        <text x={POP_LEFT_X + 90} y={STAGE_TOP + 66} fill={COLORS.textSoft} fontSize={9.5} textAnchor="middle">
          governed by 3–4 firms
        </text>
        <text x={POP_LEFT_X + 90} y={STAGE_TOP + 80} fill={COLORS.textDim} fontSize={8.5} fontStyle="italic" textAnchor="middle">
          silently versioned
        </text>

        {/* "the AI says" output */}
        <text x={POP_LEFT_X + 90} y={STAGE_BOT + 24} fill={COLORS.textSoft} fontSize={11} textAnchor="middle">
          &ldquo;the AI says&rdquo;
        </text>
        <text x={POP_LEFT_X + 90} y={STAGE_BOT + 40} fill={COLORS.red} fontSize={9.5} fontStyle="italic" textAnchor="middle">
          (= end of conversation)
        </text>
      </g>

      {/* ─── RIGHT panel — plurality ──────────────────────────── */}
      <g>
        <text x={POP_RIGHT_X - 56} y={50} fill={COLORS.green} fontSize={11} fontFamily="monospace" letterSpacing={3} textAnchor="middle">
          PLURALITY
        </text>
        <text x={POP_RIGHT_X - 56} y={64} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic" textAnchor="middle">
          many small models, each grounded in its source
        </text>

        {/* People */}
        {people.map((p, i) => (
          <circle
            key={`r-${i}`}
            cx={POP_RIGHT_X - 112 + p.x} cy={POP_TOP + p.y}
            r={2.5}
            fill="rgba(245,245,247,0.45)"
          />
        ))}

        {/* Many models — small distributed nodes */}
        {[
          { x: -80, y: 0,  hue: COLORS.violet },
          { x: -40, y: 30, hue: COLORS.cyan },
          { x: 0,   y: 0,  hue: COLORS.green },
          { x: 40,  y: 30, hue: COLORS.amber },
          { x: -30, y: 60, hue: COLORS.blue },
          { x: 30,  y: 60, hue: COLORS.indigo },
        ].map((m, i) => {
          const cx = POP_RIGHT_X - 56 + m.x;
          const cy = STAGE_TOP + 25 + m.y;
          return (
            <g key={`m-${i}`}>
              <rect
                x={cx - 18} y={cy - 12} width={36} height={24} rx={5}
                fill={`${m.hue}22`}
                stroke={m.hue} strokeWidth={1}
              />
            </g>
          );
        })}

        {/* Plurality output */}
        <text x={POP_RIGHT_X - 56} y={STAGE_BOT + 24} fill={COLORS.textSoft} fontSize={11} textAnchor="middle">
          &ldquo;these models say X — and here&apos;s why&rdquo;
        </text>
        <text x={POP_RIGHT_X - 56} y={STAGE_BOT + 40} fill={COLORS.green} fontSize={9.5} fontStyle="italic" textAnchor="middle">
          (= conversation continues)
        </text>
      </g>

      {/* ─── Center — what LeResearch is FOR ──────────────────── */}
      <g>
        {/* Vertical separator */}
        <line x1={CX} x2={CX} y1={POP_TOP - 20} y2={STAGE_BOT + 50}
          stroke="rgba(255,255,255,0.10)" strokeDasharray="3,4" />

        {/* The thesis label centered between */}
        <g transform={`translate(${CX}, ${(POP_TOP + STAGE_BOT) / 2})`}>
          <rect
            x={-78} y={-22} width={156} height={44}
            rx={22}
            fill="rgba(167,139,250,0.10)"
            stroke={COLORS.violet} strokeWidth={1.5}
          />
          <text x={0} y={-3} fill={COLORS.violet} fontSize={10} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
            LERESEARCH HOLDS
          </text>
          <text x={0} y={14} fill={COLORS.text} fontSize={11} textAnchor="middle">
            both at once
          </text>
        </g>
      </g>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 28})`}>
        <rect width={W - 40} height={22} rx={4}
          fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={COLORS.violet} fontSize={11} textAnchor="middle" fontWeight={600}>
          The argument is not against AI as frontend. The argument is against monoculture in the frontend layer.
        </text>
      </g>
    </FigShell>
  );
}

import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Schematic-with-callouts.
 * One question: why do "doom" and "hype" — which look opposed — both
 * displace the same set of present-tense, jurisdictionally tractable
 * harms?
 *
 * Visual: two red trapezoidal arrows pressing into a central
 * "displaced harms" box from above (DOOM) and below (HYPE). Both
 * arrows are the SAME color because they do the same work.
 */

const DOOM = {
  label: 'DOOM',
  thesis: 'AI extinction · x-risk · alignment · "shut it all down"',
  funders: [
    'Open Philanthropy (~$336M)',
    'Survival & Flourishing Fund (~$152M)',
    'FLI / Buterin ($665M SHIB donation)',
    'FTX Future Fund (collapsed Nov 2022)',
  ],
  outcome: [
    'Justifies CONSOLIDATION — licensing,',
    'compute thresholds, voluntary RSPs that',
    'bind only smaller competitors.',
  ],
};

const HYPE = {
  label: 'HYPE',
  thesis: 'AGI imminent · transformation · productivity · race against China',
  funders: [
    'NVIDIA · hyperscalers',
    'Sovereign wealth (UAE MGX, Saudi PIF)',
    'BlackRock GAIIP, SoftBank',
    '$680B 2026 capex · $500B Stargate',
  ],
  outcome: [
    'Unlocks CAPITAL + POLICY — FTC',
    'stand-down, EU AI Act delays, chip',
    'exports to authoritarian states.',
  ],
};

const HARMS: { title: string; case: string }[] = [
  { title: 'Data-worker exploitation',     case: '$1.32–2/hr — Sama / OpenAI Kenya' },
  { title: 'Welfare algorithms',           case: 'Robodebt 500K · toeslagenaffaire 26K' },
  { title: 'Surveillance & immigration',   case: 'Palantir ImmigrationOS · Clearview' },
  { title: 'Automated warfare',            case: 'Lavender — 37K Palestinian names' },
  { title: 'Election deepfakes',           case: 'Romania — first EU annulment' },
  { title: 'Non-consensual imagery',       case: 'Swift 47M views · NJ schools' },
  { title: 'Mental-health harms',          case: 'Raine v. OpenAI + 9 active suits' },
  { title: 'Compute concentration',        case: 'Five orgs can train frontier' },
];

export function DiscoursePincer() {
  const W = 900;

  // Vertical layout bands (everything anchored here so changes are easy)
  const Y_DOOM_TOP   = 24;
  const Y_DOOM_BOT   = 240;
  const Y_HARMS_TOP  = 320;
  const Y_HARMS_BOT  = 660;
  const Y_HYPE_TOP   = 740;
  const Y_HYPE_BOT   = 956;
  const H = Y_HYPE_BOT + 28;

  // Trapezoidal arrows. Wide at the funder panel; tapering toward the central box.
  const arrowDoom = `
    M 180 ${Y_DOOM_BOT}
    L 720 ${Y_DOOM_BOT}
    L 580 ${Y_HARMS_TOP - 6}
    L 320 ${Y_HARMS_TOP - 6}
    Z
  `;
  const arrowHype = `
    M 180 ${Y_HYPE_TOP}
    L 720 ${Y_HYPE_TOP}
    L 580 ${Y_HARMS_BOT + 6}
    L 320 ${Y_HARMS_BOT + 6}
    Z
  `;

  // 2-column grid for harms
  const COL_X = [40, 470];
  const COL_W = 390;
  const ROW_H = 70;

  // Helper for stacked text lines
  const renderLines = (
    lines: string[],
    x: number,
    y0: number,
    lineH: number,
    fill: string,
    fontSize = 11,
    fontStyle = 'italic',
  ) =>
    lines.map((line, i) => (
      <text key={i} x={x} y={y0 + i * lineH} fill={fill} fontSize={fontSize} fontStyle={fontStyle}>
        {line}
      </text>
    ));

  // Render a funder/hype panel
  const renderPanel = (
    panel: typeof DOOM,
    yTop: number,
    yBot: number,
  ) => (
    <g>
      <rect
        x={20} y={yTop} width={W - 40} height={yBot - yTop}
        rx={8}
        fill="rgba(239, 68, 68, 0.05)"
        stroke="rgba(239, 68, 68, 0.35)"
        strokeWidth={1}
      />
      <text x={40} y={yTop + 28} fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={4}>
        {panel.label}
      </text>
      <text x={40} y={yTop + 52} fill={COLORS.text} fontSize={13}>
        {panel.thesis}
      </text>
      <text x={40} y={yTop + 80} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1.5}>
        FUNDED BY
      </text>
      {panel.funders.map((f, i) => (
        <text
          key={f}
          x={40 + (i % 2) * 420}
          y={yTop + 100 + Math.floor(i / 2) * 18}
          fill={COLORS.textSoft}
          fontSize={11}
        >
          · {f}
        </text>
      ))}
      <text x={40} y={yTop + 158} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={1.5}>
        OUTCOME
      </text>
      {renderLines(panel.outcome, 40, yTop + 178, 16, COLORS.text, 12, 'italic')}
    </g>
  );

  return (
    <FigShell
      title="The discourse pincer"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Two narratives, opposite in posture, identical in effect.{' '}
          <strong style={{ color: COLORS.red }}>Doom</strong> and{' '}
          <strong style={{ color: COLORS.red }}>hype</strong> are colored
          the same here because they do the same work — they squeeze the{' '}
          <strong style={{ color: COLORS.amber }}>present-tense, jurisdictionally tractable harms</strong>{' '}
          out of the frame. Each harm in the central box has a name, a date,
          a dollar amount, and a victim. The funders of the two outer panels
          are not the same people — but they share an outcome: every
          quarter the buildout proceeds without the harms getting near a
          binding rule.
        </>
      }
    >
      {/* ─── DOOM PANEL ─────────────────────────────────────────── */}
      {renderPanel(DOOM, Y_DOOM_TOP, Y_DOOM_BOT)}

      {/* ─── DOOM ARROW ─────────────────────────────────────────── */}
      <path d={arrowDoom} fill="rgba(239, 68, 68, 0.20)" stroke={COLORS.red} strokeWidth={1.25} />
      <text
        x={W / 2}
        y={Y_DOOM_BOT + (Y_HARMS_TOP - Y_DOOM_BOT) / 2 + 4}
        fill={COLORS.red}
        fontSize={10}
        fontFamily="monospace"
        textAnchor="middle"
        letterSpacing={3}
      >
        ↓ SQUEEZES OUT ↓
      </text>

      {/* ─── HARMS BOX ──────────────────────────────────────────── */}
      <g>
        <rect
          x={20} y={Y_HARMS_TOP} width={W - 40} height={Y_HARMS_BOT - Y_HARMS_TOP}
          rx={10}
          fill="rgba(245, 158, 11, 0.04)"
          stroke="rgba(245, 158, 11, 0.55)"
          strokeWidth={1.5}
        />
        <text
          x={W / 2} y={Y_HARMS_TOP + 30}
          fill={COLORS.amber}
          fontSize={11}
          fontFamily="monospace"
          letterSpacing={3.5}
          textAnchor="middle"
        >
          DISPLACED — PRESENT-TENSE HARMS WITH NAMES, DATES, VICTIMS
        </text>

        {HARMS.map((h, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = COL_X[col];
          const y = Y_HARMS_TOP + 60 + row * ROW_H;
          return (
            <g key={h.title}>
              <rect
                x={x} y={y} width={COL_W} height={56}
                rx={6}
                fill="rgba(245, 158, 11, 0.06)"
                stroke="rgba(245, 158, 11, 0.25)"
                strokeWidth={1}
              />
              <text x={x + 14} y={y + 22} fill={COLORS.text} fontSize={12} fontWeight={500}>
                {h.title}
              </text>
              <text x={x + 14} y={y + 40} fill={COLORS.textDim} fontSize={10.5} fontStyle="italic">
                {h.case}
              </text>
            </g>
          );
        })}
      </g>

      {/* ─── HYPE ARROW ─────────────────────────────────────────── */}
      <path d={arrowHype} fill="rgba(239, 68, 68, 0.20)" stroke={COLORS.red} strokeWidth={1.25} />
      <text
        x={W / 2}
        y={Y_HARMS_BOT + (Y_HYPE_TOP - Y_HARMS_BOT) / 2 + 4}
        fill={COLORS.red}
        fontSize={10}
        fontFamily="monospace"
        textAnchor="middle"
        letterSpacing={3}
      >
        ↑ SQUEEZES OUT ↑
      </text>

      {/* ─── HYPE PANEL ─────────────────────────────────────────── */}
      {renderPanel(HYPE, Y_HYPE_TOP, Y_HYPE_BOT)}

      {/* ─── TAKEAWAY CALLOUT (overlaid on bottom of HYPE panel) ── */}
      <g transform={`translate(20, ${Y_HYPE_BOT + 4})`}>
        <rect
          width={W - 40} height={20}
          rx={4}
          fill="rgba(239, 68, 68, 0.08)"
          stroke={COLORS.red}
          strokeDasharray="4,2"
        />
        <text x={(W - 40) / 2} y={14} fill={COLORS.red} fontSize={11} textAnchor="middle" fontWeight={600}>
          Two narratives. One mechanism. The harms with receipts are the ones not being discussed.
        </text>
      </g>
    </FigShell>
  );
}

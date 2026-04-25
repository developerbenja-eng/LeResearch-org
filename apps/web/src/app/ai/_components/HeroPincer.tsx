import Link from 'next/link';
import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Compact visual abstract for the /ai index — a "trailer" of the Act IV
 * thesis figure (DiscoursePincer). Same red-amber-red language so a
 * reader who scrolls down to Act IV sees the same color story expanded.
 *
 * Sized for the index hero — half the height of the full DiscoursePincer.
 */

const HARMS = [
  'Sama Kenya · $2/hr',
  'Robodebt · 500K wronged',
  'Lavender · 37K names',
  'ImmigrationOS · Palantir',
  'Romania election · annulled',
  'Raine v. OpenAI',
];

export function HeroPincer() {
  const W = 720;
  const Y_DOOM_BOT  = 70;
  const Y_HARMS_TOP = 110;
  const Y_HARMS_BOT = 250;
  const Y_HYPE_TOP  = 290;
  const H = 360;

  const arrowDoom = `
    M 160 ${Y_DOOM_BOT}
    L 560 ${Y_DOOM_BOT}
    L 460 ${Y_HARMS_TOP - 4}
    L 260 ${Y_HARMS_TOP - 4}
    Z
  `;
  const arrowHype = `
    M 160 ${Y_HYPE_TOP}
    L 560 ${Y_HYPE_TOP}
    L 460 ${Y_HARMS_BOT + 4}
    L 260 ${Y_HARMS_BOT + 4}
    Z
  `;

  return (
    <FigShell
      title="The investigation in one image"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Two narratives, opposite in posture, identical in effect.{' '}
          <strong style={{ color: COLORS.red }}>Doom</strong> justifies
          consolidation;{' '}
          <strong style={{ color: COLORS.red }}>hype</strong> justifies
          capital. Both push the{' '}
          <strong style={{ color: COLORS.amber }}>harms with names, dates, and victims</strong>{' '}
          out of the frame. The four acts below build the documentary
          case.{' '}
          <Link
            href="/ai/real-problem"
            className="underline decoration-dotted underline-offset-2 hover:text-white"
          >
            Skip to the full thesis →
          </Link>
        </>
      }
    >
      {/* DOOM strip */}
      <g>
        <rect x={20} y={20} width={W - 40} height={50} rx={6}
          fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.40)" strokeWidth={1} />
        <text x={36} y={42} fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={4}>
          DOOM
        </text>
        <text x={88} y={42} fill={COLORS.text} fontSize={12}>
          extinction · x-risk · alignment
        </text>
        <text x={W - 36} y={42} fill={COLORS.textSoft} fontSize={11} fontStyle="italic" textAnchor="end">
          → consolidation
        </text>
        <text x={36} y={60} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic">
          funded by Open Philanthropy · SFF · FLI · (FTX)
        </text>
      </g>

      {/* DOOM arrow pressing down */}
      <path d={arrowDoom} fill="rgba(239,68,68,0.20)" stroke={COLORS.red} strokeWidth={1.25} />

      {/* HARMS box */}
      <g>
        <rect x={20} y={Y_HARMS_TOP} width={W - 40} height={Y_HARMS_BOT - Y_HARMS_TOP} rx={8}
          fill="rgba(245,158,11,0.04)" stroke="rgba(245,158,11,0.55)" strokeWidth={1.5} />
        <text x={W / 2} y={Y_HARMS_TOP + 24}
          fill={COLORS.amber} fontSize={11} fontFamily="monospace" letterSpacing={3.5}
          textAnchor="middle"
        >
          DISPLACED — HARMS WITH NAMES, DATES, VICTIMS
        </text>
        {HARMS.map((h, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const cellW = (W - 60) / 3;
          const x = 30 + col * cellW;
          const y = Y_HARMS_TOP + 50 + row * 38;
          return (
            <g key={h}>
              <rect x={x} y={y} width={cellW - 10} height={30} rx={5}
                fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.25)" strokeWidth={1} />
              <text x={x + (cellW - 10) / 2} y={y + 19}
                fill={COLORS.text} fontSize={11} textAnchor="middle"
              >
                {h}
              </text>
            </g>
          );
        })}
      </g>

      {/* HYPE arrow pressing up */}
      <path d={arrowHype} fill="rgba(239,68,68,0.20)" stroke={COLORS.red} strokeWidth={1.25} />

      {/* HYPE strip */}
      <g>
        <rect x={20} y={Y_HYPE_TOP} width={W - 40} height={50} rx={6}
          fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.40)" strokeWidth={1} />
        <text x={36} y={Y_HYPE_TOP + 22} fill={COLORS.red} fontSize={11} fontFamily="monospace" letterSpacing={4}>
          HYPE
        </text>
        <text x={88} y={Y_HYPE_TOP + 22} fill={COLORS.text} fontSize={12}>
          AGI · transformation · race
        </text>
        <text x={W - 36} y={Y_HYPE_TOP + 22} fill={COLORS.textSoft} fontSize={11} fontStyle="italic" textAnchor="end">
          → capital + policy
        </text>
        <text x={36} y={Y_HYPE_TOP + 40} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic">
          $680B 2026 capex · $500B Stargate · FTC stand-down
        </text>
      </g>
    </FigShell>
  );
}

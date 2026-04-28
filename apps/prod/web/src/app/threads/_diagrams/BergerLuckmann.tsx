import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Berger & Luckmann — habitualization → typification → institutionalization.
 * Three stages of how a one-off action becomes a thing called "the
 * way it's done."
 */

const STAGES = [
  { label: 'Habit',          detail: 'an action repeated for convenience',                color: COLORS.cyan,   ex: 'someone leaves at 5pm Friday' },
  { label: 'Typification',   detail: 'the action becomes a recognizable type',            color: COLORS.violet, ex: '"that\'s when people leave"' },
  { label: 'Institution',    detail: 'others perform the type with no remembered cause',  color: COLORS.amber,  ex: '"the weekend"' },
];

export function BergerLuckmannDiagram() {
  const W = 640;
  const H = 320;

  return (
    <FigShell
      title="Habit → typification → institution"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Berger &amp; Luckmann&apos;s micro-mechanism for §2 and §3. A
          one-off action gets repeated, becomes a recognizable type,
          then becomes the type — performed by others who never knew
          it had a cause. Most institutions arrived this way. Most
          institutional reform forgets this and tries to argue with
          stage three.
        </>
      }
    >
      {STAGES.map((s, i) => {
        const x = 60 + i * 200;
        return (
          <g key={i}>
            <rect x={x} y={70} width={170} height={130} rx={8}
              fill={`${s.color}10`} stroke={s.color} strokeWidth={1.25} />
            <text x={x + 85} y={92} fill={s.color} fontSize={10} fontFamily="monospace" letterSpacing={2.5} textAnchor="middle">
              STAGE {i + 1}
            </text>
            <text x={x + 85} y={114} fill={COLORS.text} fontSize={13} textAnchor="middle" fontWeight={500}>
              {s.label}
            </text>
            <text x={x + 85} y={134} fill={COLORS.textSoft} fontSize={10} fontStyle="italic" textAnchor="middle">
              {s.detail}
            </text>
            <line x1={x + 20} x2={x + 150} y1={150} y2={150} stroke={`${s.color}40`} />
            <text x={x + 85} y={170} fill={COLORS.textDim} fontSize={9} textAnchor="middle">
              e.g.,
            </text>
            <text x={x + 85} y={186} fill={s.color} fontSize={9.5} fontFamily="monospace" textAnchor="middle">
              {s.ex}
            </text>

            {/* Arrow to next stage */}
            {i < STAGES.length - 1 && (
              <g>
                <path d={`M ${x + 175} 135 L ${x + 195} 135`} stroke={COLORS.textDim} strokeWidth={1.25} markerEnd="url(#arr-bl)" />
              </g>
            )}
          </g>
        );
      })}

      <defs>
        <marker id="arr-bl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(245,245,247,0.45)" />
        </marker>
      </defs>

      <text x={W / 2} y={244} fill={COLORS.textDim} fontSize={10} fontStyle="italic" textAnchor="middle">
        no malice required · the cause is forgotten in the third stage
      </text>

      {/* Takeaway */}
      <g transform={`translate(20, ${H - 24})`}>
        <rect width={W - 40} height={18} rx={3} fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="3,2" />
        <text x={(W - 40) / 2} y={12} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontWeight={600}>
          Most reform argues with stage three, after the cause has been forgotten.
        </text>
      </g>
    </FigShell>
  );
}

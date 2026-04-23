import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Comparison.
 * One question: what changes when the frontend of knowledge stops being
 * one-to-many and starts being chosen by the learner?
 */

interface Learner {
  id: string;
  lang: 'EN' | 'ES';
  depth: 'child' | 'teen' | 'adult' | 'expert';
  mode: 'visual' | 'narrative' | 'text' | 'audio';
}

const LEARNERS: Learner[] = [
  { id: 'a', lang: 'ES', depth: 'child',  mode: 'narrative' },
  { id: 'b', lang: 'EN', depth: 'teen',   mode: 'visual' },
  { id: 'c', lang: 'EN', depth: 'adult',  mode: 'text' },
  { id: 'd', lang: 'ES', depth: 'adult',  mode: 'audio' },
  { id: 'e', lang: 'EN', depth: 'expert', mode: 'text' },
  { id: 'f', lang: 'ES', depth: 'teen',   mode: 'visual' },
];

const DEPTH_Y: Record<Learner['depth'], number> = {
  child: 30,
  teen: 90,
  adult: 150,
  expert: 210,
};

const DEPTH_LABEL: Record<Learner['depth'], string> = {
  child: 'Child',
  teen: 'Teen',
  adult: 'Adult',
  expert: 'Expert',
};

const MODE_SYMBOL: Record<Learner['mode'], string> = {
  visual: '◇',
  narrative: '○',
  text: '□',
  audio: '△',
};

export function LinearVsPluralFrontend() {
  return (
    <FigShell
      title="The filter that failed  vs  the frontend that fits"
      viewBox="0 0 900 340"
      figcaption={
        <>
          Same six people. On the left, a single linear frontend —
          one language, one depth, one modality, one pace. The
          learners who happen to match the configured profile{' '}
          <strong style={{ color: COLORS.green }}>pass through</strong>;
          the others get classified as unable. On the right, a plural
          frontend — the learner picks the depth, the language, and the
          representation. <strong style={{ color: COLORS.violet }}>
          Everyone reaches the same content</strong>, along different
          paths. The distribution of who understands the work changes
          with the frontend, not with who was born smart.
        </>
      }
    >
      <defs>
        <marker id="arrow-filter" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.textDim} />
        </marker>
        <marker id="arrow-violet" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.violet} />
        </marker>
      </defs>

      {/* Divider */}
      <line x1={450} y1={20} x2={450} y2={310} stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />

      {/* ========= LEFT: linear frontend ========= */}
      <text x={20} y={22} fill={COLORS.amber} fontSize={11} fontFamily="monospace" letterSpacing={1.5}>
        LINEAR FRONTEND
      </text>
      <text x={20} y={36} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={0.5}>
        one-to-many · fixed · gated
      </text>

      {/* Learners on the left, all at different positions */}
      {LEARNERS.map((l, i) => {
        const x = 40 + i * 30;
        const y = 80;
        const fits = l.lang === 'EN' && l.depth === 'adult' && l.mode === 'text';
        return (
          <g key={`L-${l.id}`}>
            <circle cx={x} cy={y} r={10} fill={`${fits ? COLORS.green : COLORS.textWhisper}22`} stroke={fits ? COLORS.green : COLORS.textDim} strokeWidth={1.2} />
            <text x={x} y={y + 3.5} fill={fits ? COLORS.green : COLORS.textDim} fontSize={9} textAnchor="middle" fontFamily="monospace">
              {MODE_SYMBOL[l.mode]}
            </text>
            <text x={x} y={y + 24} fill={COLORS.textDim} fontSize={7} textAnchor="middle" fontFamily="monospace">
              {l.lang}
            </text>
          </g>
        );
      })}

      {/* The filter (a single narrow slot) */}
      <g transform="translate(40, 130)">
        <rect width={200} height={50} rx={4} fill="rgba(245,158,11,0.08)" stroke={COLORS.amber} strokeWidth={1.5} />
        <text x={100} y={20} fill={COLORS.amber} fontSize={10} textAnchor="middle" fontFamily="monospace">
          EN · adult · text
        </text>
        <text x={100} y={36} fill={COLORS.textDim} fontSize={8} textAnchor="middle" fontStyle="italic">
          the one shape that &quot;works&quot;
        </text>
      </g>
      {LEARNERS.map((l, i) => {
        const x = 40 + i * 30;
        const fits = l.lang === 'EN' && l.depth === 'adult' && l.mode === 'text';
        return (
          <line
            key={`L-arr-${l.id}`}
            x1={x}
            y1={95}
            x2={140}
            y2={130}
            stroke={fits ? COLORS.green : COLORS.textWhisper}
            strokeWidth={fits ? 1.5 : 0.8}
            strokeOpacity={fits ? 0.9 : 0.35}
            markerEnd={fits ? 'url(#arrow-violet)' : 'url(#arrow-filter)'}
          />
        );
      })}

      {/* Content on the left (only one learner reaches it) */}
      <g transform="translate(60, 210)">
        <rect width={160} height={60} rx={6} fill={`${COLORS.green}11`} stroke={COLORS.green} strokeWidth={1.5} />
        <text x={80} y={22} fill={COLORS.green} fontSize={10} textAnchor="middle" fontFamily="monospace" letterSpacing={0.5}>
          CONTENT
        </text>
        <text x={80} y={40} fill={COLORS.text} fontSize={10} textAnchor="middle">
          (reached by one)
        </text>
        <text x={80} y={52} fill={COLORS.textDim} fontSize={9} textAnchor="middle" fontStyle="italic">
          others &quot;couldn&apos;t understand&quot;
        </text>
      </g>
      <path d="M 140 180 L 140 208" stroke={COLORS.green} strokeWidth={1.8} markerEnd="url(#arrow-violet)" />

      {/* Takeaway */}
      <g transform="translate(20, 292)">
        <text x={225} y={10} fill={COLORS.amber} fontSize={10} textAnchor="middle" fontStyle="italic" opacity={0.85}>
          The filter defined who was smart. The smart ones defined the filter.
        </text>
      </g>

      {/* ========= RIGHT: plural frontend ========= */}
      <text x={470} y={22} fill={COLORS.violet} fontSize={11} fontFamily="monospace" letterSpacing={1.5}>
        PLURAL FRONTEND
      </text>
      <text x={470} y={36} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" letterSpacing={0.5}>
        learner chooses depth · language · modality
      </text>

      {/* Learners on the right */}
      {LEARNERS.map((l, i) => {
        const x = 490 + i * 30;
        const y = 80;
        return (
          <g key={`R-${l.id}`}>
            <circle cx={x} cy={y} r={10} fill={`${COLORS.violet}22`} stroke={COLORS.violet} strokeWidth={1.2} />
            <text x={x} y={y + 3.5} fill={COLORS.violet} fontSize={9} textAnchor="middle" fontFamily="monospace">
              {MODE_SYMBOL[l.mode]}
            </text>
            <text x={x} y={y + 24} fill={COLORS.textDim} fontSize={7} textAnchor="middle" fontFamily="monospace">
              {l.lang}·{DEPTH_LABEL[l.depth][0]}
            </text>
          </g>
        );
      })}

      {/* Depth × language × modality grid */}
      <g transform="translate(490, 130)">
        <rect width={360} height={50} rx={4} fill={`${COLORS.violet}11`} stroke={COLORS.violet} strokeWidth={1.5} />
        <text x={180} y={20} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontFamily="monospace">
          depth × language × modality
        </text>
        <text x={180} y={36} fill={COLORS.textDim} fontSize={8} textAnchor="middle" fontStyle="italic">
          composed per learner
        </text>
      </g>
      {LEARNERS.map((l, i) => {
        const x = 490 + i * 30;
        return (
          <line
            key={`R-arr-${l.id}`}
            x1={x}
            y1={95}
            x2={510 + i * 55}
            y2={130}
            stroke={COLORS.violet}
            strokeWidth={1.2}
            strokeOpacity={0.55}
            markerEnd="url(#arrow-violet)"
          />
        );
      })}

      {/* Content on the right (reached by all) */}
      <g transform="translate(550, 210)">
        <rect width={240} height={60} rx={6} fill={`${COLORS.violet}14`} stroke={COLORS.violet} strokeWidth={1.5} />
        <text x={120} y={22} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontFamily="monospace" letterSpacing={0.5}>
          SAME CONTENT
        </text>
        <text x={120} y={40} fill={COLORS.text} fontSize={10} textAnchor="middle">
          reached by all six
        </text>
        <text x={120} y={52} fill={COLORS.textDim} fontSize={9} textAnchor="middle" fontStyle="italic">
          along different paths
        </text>
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={`down-${i}`}
          x1={510 + i * 55}
          y1={180}
          x2={670}
          y2={208}
          stroke={COLORS.violet}
          strokeWidth={1.1}
          strokeOpacity={0.5}
          markerEnd="url(#arrow-violet)"
        />
      ))}

      {/* Takeaway */}
      <g transform="translate(470, 292)">
        <text x={210} y={10} fill={COLORS.violet} fontSize={10} textAnchor="middle" fontStyle="italic" opacity={0.85}>
          The learner defines the frontend. The distribution of who understands shifts.
        </text>
      </g>

      {/* Mode legend at the very bottom */}
      <g transform="translate(20, 318)" fontSize={8} fontFamily="monospace">
        <text fill={COLORS.textDim} x={0} y={0}>◇ visual   ○ narrative   □ text   △ audio</text>
      </g>
    </FigShell>
  );
}

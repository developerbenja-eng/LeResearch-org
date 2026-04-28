'use client';

import { useEffect, useRef, useState } from 'react';

function useReveal(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Figure({
  label, hint, children, refProp, visible, colorRgb = '167,139,250',
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  refProp?: React.Ref<HTMLDivElement>;
  visible?: boolean;
  colorRgb?: string;
}) {
  return (
    <figure
      ref={refProp}
      className="my-12 rounded-xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8"
      style={{ opacity: visible === undefined ? 1 : visible ? 1 : 0, transition: 'opacity 0.7s ease' }}
    >
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
        <p
          className="text-[10px] font-mono tracking-[0.35em] uppercase"
          style={{ color: `rgba(${colorRgb},0.65)` }}
        >
          {label}
        </p>
        {hint && (
          <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/25">
            {hint}
          </p>
        )}
      </div>
      {children}
    </figure>
  );
}

// ─── 1. Creativity decline (Kim 2011) ────────────────────────────────────────

const KIM_POINTS: { year: number; score: number; label?: string }[] = [
  { year: 1966, score: 94 },
  { year: 1974, score: 100 },
  { year: 1984, score: 104 },
  { year: 1990, score: 108, label: 'peak' },
  { year: 1998, score: 101 },
  { year: 2008, score: 95 },
];

export function CreativityDeclineChart() {
  const { ref, visible } = useReveal(0.25);

  const W = 560;
  const H = 260;
  const pad = { l: 48, r: 20, t: 20, b: 36 };
  const xMin = 1966, xMax = 2008;
  const yMin = 88, yMax = 112;

  const sx = (y: number) => pad.l + ((y - xMin) / (xMax - xMin)) * (W - pad.l - pad.r);
  const sy = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);

  const pathD = KIM_POINTS
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.year).toFixed(1)} ${sy(p.score).toFixed(1)}`)
    .join(' ');

  const peak = KIM_POINTS.find((p) => p.label === 'peak')!;

  return (
    <Figure
      refProp={ref}
      visible={visible}
      label="Diagram · Torrance creativity scores, 1966–2008"
      hint="Kim (2011), N=272,599"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-labelledby="cc-title">
        <title id="cc-title">US creativity scores rose 1966–1990, then declined through 2008</title>
        <defs>
          <linearGradient id="cc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(167,139,250,0.35)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0)" />
          </linearGradient>
        </defs>

        {/* Peak reference line */}
        <line x1={sx(peak.year)} x2={sx(peak.year)} y1={pad.t} y2={H - pad.b}
          stroke="rgba(167,139,250,0.2)" strokeDasharray="3 3" />
        <text x={sx(peak.year) + 6} y={pad.t + 10} fontSize="9" fontFamily="monospace"
          fill="rgba(167,139,250,0.7)">peak 1990</text>

        {/* Filled area under the curve */}
        <path
          d={`${pathD} L ${sx(xMax)} ${H - pad.b} L ${sx(xMin)} ${H - pad.b} Z`}
          fill="url(#cc-area)"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 1s ease 0.3s',
          }}
        />

        {/* Main curve */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(196,181,253,0.95)"
          strokeWidth="1.8"
          style={{
            strokeDasharray: 1200,
            strokeDashoffset: visible ? 0 : 1200,
            transition: 'stroke-dashoffset 1.6s cubic-bezier(0.2,0.6,0.2,1)',
          }}
        />

        {/* Points */}
        {KIM_POINTS.map((p, i) => (
          <g key={p.year}
            style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${0.8 + i * 0.12}s` }}
          >
            <circle cx={sx(p.year)} cy={sy(p.score)} r="3.5"
              fill={p.label === 'peak' ? 'rgba(244,114,182,0.95)' : 'rgba(196,181,253,0.95)'} />
            <text
              x={sx(p.year)}
              y={sy(p.score) - 10}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill="rgba(255,255,255,0.65)"
            >
              {p.score}
            </text>
          </g>
        ))}

        {/* X axis ticks */}
        {KIM_POINTS.map((p) => (
          <text key={`x-${p.year}`} x={sx(p.year)} y={H - pad.b + 18} textAnchor="middle"
            fontSize="10" fontFamily="monospace" fill="rgba(255,255,255,0.4)">
            {p.year}
          </text>
        ))}

        {/* Axes */}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="rgba(255,255,255,0.1)" />
        <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="rgba(255,255,255,0.1)" />

        {/* Y label */}
        <text x={10} y={pad.t + 6} fontSize="9" fontFamily="monospace" fill="rgba(255,255,255,0.4)">
          TTCT score
        </text>
      </svg>
      <p className="text-sm text-white/55 leading-relaxed mt-2">
        Peer-reviewed data (Torrance Tests of Creative Thinking, six national norming samples,
        1966–2008, total N=272,599). Scores rose into 1990, then declined steadily through 2008
        — with the sharpest decline for kindergarten through third grade. The popular 98% → 2%
        figures from Land &amp; Jarman (1992) are a trade-book illustration, not peer-reviewed data.
      </p>
    </Figure>
  );
}

// ─── 2. Thinker triangle ─────────────────────────────────────────────────────

export function ThinkerTriangle() {
  const { ref, visible } = useReveal(0.3);
  const W = 680, H = 420;
  const A = { x: 340, y: 70,  label: 'Sapolsky' };
  const B = { x: 70,  y: 340, label: 'Rogers' };
  const C = { x: 610, y: 340, label: 'Robinson' };
  const center = { x: 340, y: 250 };
  const CENTER_R = 40;
  const NODE_R = 38;
  const LABEL_OFFSET = 62;

  const edges = [
    { from: A, to: B, label: 'environment → growth' },
    { from: B, to: C, label: 'growth blocked by system' },
    { from: C, to: A, label: 'the system IS the environment' },
  ];

  // Compute each edge's label position: start at the midpoint, then push
  // perpendicular *outward* from the triangle center so labels never fight the
  // central "change the conditions" node or each other.
  const layout = edges.map((e) => {
    const mx = (e.from.x + e.to.x) / 2;
    const my = (e.from.y + e.to.y) / 2;
    const dx = mx - center.x;
    const dy = my - center.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    return {
      ...e,
      mx, my,
      lx: mx + ux * LABEL_OFFSET,
      ly: my + uy * LABEL_OFFSET,
    };
  });

  return (
    <Figure refProp={ref} visible={visible} label="Diagram · The synthesis in one shape" colorRgb="167,139,250">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Triangle edges */}
        {layout.map((e, i) => (
          <line
            key={`edge-${i}`}
            x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
            stroke="rgba(167,139,250,0.35)" strokeWidth="1" strokeDasharray="4 4"
            style={{ opacity: visible ? 1 : 0, transition: `opacity 0.6s ease ${0.2 + i * 0.15}s` }}
          />
        ))}

        {/* Center node */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.9s' }}>
          <circle cx={center.x} cy={center.y} r={CENTER_R} fill="rgba(196,181,253,0.1)"
            stroke="rgba(196,181,253,0.6)" strokeWidth="1.2" />
          <text x={center.x} y={center.y} textAnchor="middle" fontSize="11" fontFamily="monospace"
            fill="rgba(255,255,255,0.95)" letterSpacing="1" dy="-0.15em">
            change the
          </text>
          <text x={center.x} y={center.y} textAnchor="middle" fontSize="11" fontFamily="monospace"
            fill="rgba(255,255,255,0.95)" letterSpacing="1" dy="1em">
            conditions
          </text>
        </g>

        {/* Edge labels with leader lines to their midpoints */}
        {layout.map((e, i) => (
          <g key={`label-${i}`} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.6s ease ${0.35 + i * 0.15}s` }}>
            <line x1={e.mx} y1={e.my} x2={e.lx} y2={e.ly}
              stroke="rgba(167,139,250,0.25)" strokeWidth="0.8" />
            <rect x={e.lx - 82} y={e.ly - 11} width="164" height="22" rx="11"
              fill="rgba(10,14,22,0.92)" stroke="rgba(167,139,250,0.3)" />
            <text x={e.lx} y={e.ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="monospace"
              fill="rgba(255,255,255,0.75)">{e.label}</text>
          </g>
        ))}

        {/* Vertices (drawn after edges so they sit on top of line ends) */}
        {[A, B, C].map((v, i) => (
          <g key={`node-${i}`} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${0.4 + i * 0.15}s` }}>
            <circle cx={v.x} cy={v.y} r={NODE_R} fill="rgba(10,14,22,0.95)"
              stroke="rgba(167,139,250,0.6)" strokeWidth="1.2" />
            <text x={v.x} y={v.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontFamily="monospace"
              fill="rgba(255,255,255,0.95)" fontWeight="300">{v.label}</text>
          </g>
        ))}
      </svg>
      <p className="text-sm text-white/55 leading-relaxed mt-2">
        Three thinkers who never collaborated, read as a single logical circuit. Environment shapes
        the brain (Sapolsky). The drive toward growth is innate (Rogers). The system we built
        blocks it (Robinson). The only rational response to a closed loop like that is to change
        what flows through it — the conditions themselves.
      </p>
    </Figure>
  );
}

// ─── 3. Paideia → factory timeline ───────────────────────────────────────────

const TIMELINE = [
  { year: '−400',   label: 'Paideia',       shape: 'circle',   note: 'Complete formation of a person. Mentor + small group.' },
  { year: '1200',   label: 'Scholastic',    shape: 'cloister', note: 'Cloister, canon, disputation.' },
  { year: '1800',   label: 'Prussian',      shape: 'rows',     note: 'Age-graded rows, bells, standardized periods.' },
  { year: '1900',   label: 'Factory model', shape: 'factory',  note: 'Bowles & Gintis: schools mirror the factory floor.' },
  { year: 'Now',    label: '?',             shape: 'question', note: 'The justification has collapsed. The shape has not.' },
];

export function PaideiaFactoryTimeline() {
  const { ref, visible } = useReveal(0.25);
  const W = 620, H = 200;
  const pts = TIMELINE.map((_, i) => 60 + i * ((W - 120) / (TIMELINE.length - 1)));

  const icon = (kind: string, cx: number, cy: number, vis: boolean, delay: number) => {
    const baseStyle = {
      opacity: vis ? 1 : 0,
      transition: `opacity 0.5s ease ${delay}s`,
    };
    switch (kind) {
      case 'circle':
        return (
          <g style={baseStyle}>
            <circle cx={cx} cy={cy} r="2" fill="rgba(196,181,253,0.9)" />
            {[0, 60, 120, 180, 240, 300].map((a) => {
              const rad = (a * Math.PI) / 180;
              return (
                <circle key={a} cx={cx + Math.cos(rad) * 14} cy={cy + Math.sin(rad) * 14} r="2"
                  fill="rgba(167,139,250,0.7)" />
              );
            })}
          </g>
        );
      case 'cloister':
        return (
          <g style={baseStyle}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${cx - 14 + i * 14} ${cy + 8} Q ${cx - 7 + i * 14} ${cy - 6} ${cx + i * 14} ${cy + 8}`}
                fill="none" stroke="rgba(167,139,250,0.75)" strokeWidth="1.2" />
            ))}
          </g>
        );
      case 'rows':
        return (
          <g style={baseStyle}>
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => (
                <rect key={`${r}-${c}`} x={cx - 17 + c * 10} y={cy - 10 + r * 8} width="6" height="5" rx="0.5"
                  fill="rgba(167,139,250,0.55)" />
              )),
            )}
          </g>
        );
      case 'factory':
        return (
          <g style={baseStyle}>
            {/* Rigid grid */}
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3, 4].map((c) => (
                <rect key={`${r}-${c}`} x={cx - 22 + c * 9} y={cy - 10 + r * 8} width="5" height="5" rx="0"
                  fill="rgba(167,139,250,0.55)" />
              )),
            )}
            {/* Smokestacks above — the factory tell */}
            <rect x={cx - 8}  y={cy - 22} width="3" height="8" fill="rgba(167,139,250,0.7)" />
            <rect x={cx + 2}  y={cy - 26} width="3" height="12" fill="rgba(167,139,250,0.7)" />
            <path d={`M ${cx - 8} ${cy - 22} q 2 -3 4 0`} fill="none" stroke="rgba(196,181,253,0.5)" strokeWidth="1" />
            <path d={`M ${cx + 2} ${cy - 26} q 2 -3 4 0`} fill="none" stroke="rgba(196,181,253,0.5)" strokeWidth="1" />
          </g>
        );
      case 'question':
        return (
          <g style={baseStyle}>
            <text x={cx} y={cy + 6} textAnchor="middle" fontSize="22" fontFamily="monospace"
              fill="rgba(244,114,182,0.9)">?</text>
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <Figure refProp={ref} visible={visible} label="Diagram · From paideia to factory — to ?" colorRgb="167,139,250">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Base line */}
        <line x1="60" x2={W - 60} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.12)" />
        {pts.map((x, i) => (
          <g key={i}>
            <line x1={x} x2={x} y1={H / 2 - 3} y2={H / 2 + 3} stroke="rgba(255,255,255,0.18)" />
            {icon(TIMELINE[i].shape, x, H / 2 - 30, visible, 0.2 + i * 0.12)}
            <text x={x} y={H / 2 + 22} textAnchor="middle" fontSize="11" fontFamily="monospace"
              fill="rgba(255,255,255,0.75)">{TIMELINE[i].label}</text>
            <text x={x} y={H / 2 + 36} textAnchor="middle" fontSize="9" fontFamily="monospace"
              fill="rgba(255,255,255,0.35)">{TIMELINE[i].year}</text>
          </g>
        ))}
      </svg>
      <p className="text-sm text-white/55 leading-relaxed mt-2">
        Each era built the shape of learning it could build with the tools and economics of that
        moment. The factory model is not the shape of knowledge — it was the shape of what the
        nineteenth century could afford to do with knowledge at scale. The question mark on the
        right is the current assignment.
      </p>
    </Figure>
  );
}

// ─── 4. Hidden curriculum split ──────────────────────────────────────────────

export function HiddenCurriculumSplit() {
  const { ref, visible } = useReveal(0.25);
  const W = 620, H = 360;
  const mid = W / 2;

  const explicit = ['Mathematics', 'Reading', 'Science', 'History', 'Writing'];
  const hidden = [
    'Show up on time',
    'Follow instructions',
    'Compete for rewards',
    'Defer to authority',
    "Your rank = your merit",
  ];

  // Vertical position of the "student" node — arrows from both columns
  // converge there to show both curricula land on the same body.
  const studentY = H - 50;

  return (
    <Figure refProp={ref} visible={visible} label="Diagram · Two curricula, one student" colorRgb="167,139,250">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Schoolhouse silhouette (roof + body outline) */}
        <path
          d={`M 30 80 L ${mid} 35 L ${W - 30} 80 L ${W - 30} ${H - 30} L 30 ${H - 30} Z`}
          fill="rgba(167,139,250,0.02)"
          stroke="rgba(167,139,250,0.18)"
        />
        {/* Bell tower tick */}
        <line x1={mid} x2={mid} y1="35" y2="22" stroke="rgba(167,139,250,0.35)" strokeWidth="1" />
        <circle cx={mid} cy={20} r="3" fill="rgba(167,139,250,0.45)" />

        {/* Center divider */}
        <line x1={mid} x2={mid} y1="90" y2={studentY - 50} stroke="rgba(167,139,250,0.12)" strokeDasharray="4 4" />

        {/* Column labels */}
        <text x={mid / 2 + 20} y="100" textAnchor="middle" fontSize="10" fontFamily="monospace"
          fill="rgba(167,139,250,0.8)" letterSpacing="2">EXPLICIT</text>
        <text x={mid + mid / 2 - 20} y="100" textAnchor="middle" fontSize="10" fontFamily="monospace"
          fill="rgba(244,114,182,0.85)" letterSpacing="2">HIDDEN</text>
        <text x={mid / 2 + 20} y="114" textAnchor="middle" fontSize="9" fontFamily="monospace"
          fill="rgba(255,255,255,0.35)">what the catalog lists</text>
        <text x={mid + mid / 2 - 20} y="114" textAnchor="middle" fontSize="9" fontFamily="monospace"
          fill="rgba(255,255,255,0.35)">what the structure teaches</text>

        {/* Explicit list + arrows */}
        {explicit.map((item, i) => {
          const y = 140 + i * 26;
          return (
            <g key={item} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${0.2 + i * 0.08}s` }}>
              <text x="55" y={y} fontSize="12" fontFamily="sans-serif" fill="rgba(255,255,255,0.78)">
                {item}
              </text>
              <path
                d={`M ${mid / 2 - 10} ${y - 4} Q ${mid * 0.75} ${studentY - 70} ${mid - 14} ${studentY - 8}`}
                fill="none"
                stroke="rgba(167,139,250,0.28)"
                strokeWidth="0.8"
              />
            </g>
          );
        })}

        {/* Hidden list + arrows */}
        {hidden.map((item, i) => {
          const y = 140 + i * 26;
          return (
            <g key={item} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${0.4 + i * 0.08}s` }}>
              <text x={mid + 35} y={y} fontSize="12" fontFamily="sans-serif" fill="rgba(244,114,182,0.82)">
                {item}
              </text>
              <path
                d={`M ${mid + mid / 2 + 20} ${y - 4} Q ${mid * 1.25} ${studentY - 70} ${mid + 14} ${studentY - 8}`}
                fill="none"
                stroke="rgba(244,114,182,0.28)"
                strokeWidth="0.8"
              />
            </g>
          );
        })}

        {/* Student silhouette (both curricula converge here) */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.9s' }}>
          <circle cx={mid} cy={studentY - 16} r="9"
            fill="rgba(255,255,255,0.15)" stroke="rgba(196,181,253,0.55)" strokeWidth="1" />
          <path d={`M ${mid - 14} ${studentY + 4} Q ${mid} ${studentY - 4} ${mid + 14} ${studentY + 4} L ${mid + 14} ${studentY + 14} L ${mid - 14} ${studentY + 14} Z`}
            fill="rgba(255,255,255,0.12)" stroke="rgba(196,181,253,0.45)" strokeWidth="1" />
          <text x={mid} y={studentY + 30} textAnchor="middle" fontSize="9" fontFamily="monospace"
            fill="rgba(255,255,255,0.55)" letterSpacing="1">the student</text>
        </g>
      </svg>
      <p className="text-sm text-white/55 leading-relaxed mt-2">
        The explicit curriculum is what the course catalog lists. The hidden curriculum is what
        the structure teaches regardless of subject — how to wait, rank, defer, and interpret your
        position as earned. Althusser and Bowles &amp; Gintis argued that, in mature capitalism,
        the second is the more consequential one.
      </p>
    </Figure>
  );
}

// ─── 5. Three levels pyramid ─────────────────────────────────────────────────

export function ThreeLevelsPyramid() {
  const { ref, visible } = useReveal(0.3);
  const W = 520, H = 300;
  const levels = [
    { n: 'Level 1', label: 'Content',  note: 'What tests measure.',                                   scale: 1.0, color: [167,139,250] },
    { n: 'Level 2', label: 'Process',  note: 'Metacognition. Internalized dialogue. ZPD work.',        scale: 0.72, color: [196,181,253] },
    { n: 'Level 3', label: 'Identity', note: "I can figure out how to learn anything. The destination.", scale: 0.46, color: [244,114,182] },
  ];

  return (
    <Figure refProp={ref} visible={visible} label="Diagram · Three levels — the destination, not the vehicle" colorRgb="196,181,253">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {levels.map((l, i) => {
          const w = (W - 60) * l.scale;
          const x = (W - w) / 2;
          const y = 40 + i * 80;
          const [r, g, b] = l.color;
          return (
            <g key={l.n} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.6s ease ${i * 0.18}s` }}>
              <rect x={x} y={y} width={w} height="58" rx="8"
                fill={`rgba(${r},${g},${b},0.08)`}
                stroke={`rgba(${r},${g},${b},0.45)`}
                strokeWidth="1.2" />
              <text x={W / 2} y={y + 22} textAnchor="middle" fontSize="10"
                fontFamily="monospace" fill={`rgba(${r},${g},${b},0.7)`} letterSpacing="2">
                {l.n.toUpperCase()}
              </text>
              <text x={W / 2} y={y + 42} textAnchor="middle" fontSize="15"
                fontFamily="sans-serif" fontWeight="300" fill="rgba(255,255,255,0.95)">
                {l.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="space-y-1 mt-2">
        {levels.map((l) => (
          <p key={l.n} className="text-sm text-white/55 leading-relaxed">
            <span className="text-white/80 font-medium">{l.label}:</span>{' '}
            <span className="text-white/50">{l.note}</span>
          </p>
        ))}
      </div>
    </Figure>
  );
}

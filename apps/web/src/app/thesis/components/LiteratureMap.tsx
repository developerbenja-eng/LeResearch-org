import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Schematic-with-callouts (genealogy / chronological scatter).
 * One question: which intellectual traditions does this document draw on,
 * which sections do they feed, and in what chronological order did the
 * arguments arrive?
 *
 * Visual: 3 horizontal "tracks" by thematic bucket, thinkers plotted on
 * each track by year, each track flowing into the section it informs.
 *
 * Adding a 14th thread is a one-line change to THREADS below.
 */

type Bucket = 'substrate' | 'mechanism' | 'labor';

interface Thread {
  id: string;
  author: string;
  work: string;
  /** Decimal year — for "1972-80" use the midpoint */
  year: number;
  bucket: Bucket;
  /** Side note for placement: 'above' or 'below' the track */
  side?: 'above' | 'below';
}

const THREADS: Thread[] = [
  // SUBSTRATE — the imagined-orders bucket
  { id: 'berger',     author: 'Berger & Luckmann', work: 'Social Construction',     year: 1966,    bucket: 'substrate', side: 'above' },
  { id: 'castoriadis',author: 'Castoriadis',        work: 'L\'institution imaginaire', year: 1975, bucket: 'substrate', side: 'below' },
  { id: 'bourdieu',   author: 'Bourdieu',           work: 'doxa / habitus',          year: 1976,    bucket: 'substrate', side: 'above' },
  { id: 'anderson',   author: 'Anderson',           work: 'Imagined Communities',    year: 1983,    bucket: 'substrate', side: 'below' },
  { id: 'searle',     author: 'Searle',             work: 'Construction of Soc. Reality', year: 1995,bucket: 'substrate', side: 'above' },
  { id: 'harari',     author: 'Harari',             work: 'Sapiens',                 year: 2011,    bucket: 'substrate', side: 'below' },

  // MECHANISM — normalization, gradient, paradigm
  { id: 'kuhn',       author: 'Kuhn',               work: 'Scientific Revolutions',  year: 1962,    bucket: 'mechanism', side: 'above' },
  { id: 'pauly',      author: 'Pauly',              work: 'shifting baseline',       year: 1995,    bucket: 'mechanism', side: 'below' },
  { id: 'klein',      author: 'Klein',              work: 'The Shock Doctrine',      year: 2007,    bucket: 'mechanism', side: 'above' },
  { id: 'schmach',    author: 'Schmachtenberger',   work: 'metacrisis (ongoing)',    year: 2024,    bucket: 'mechanism', side: 'below' },

  // LABOR — contingency of the job
  { id: 'graeber-d',  author: 'Graeber',            work: 'Debt',                    year: 2011,    bucket: 'labor',     side: 'above' },
  { id: 'graeber-b',  author: 'Graeber',            work: 'Bullshit Jobs',           year: 2018,    bucket: 'labor',     side: 'below' },
  { id: 'zuboff',     author: 'Zuboff',             work: 'Surveillance Capitalism', year: 2019,    bucket: 'labor',     side: 'above' },
];

const BUCKET_META: Record<Bucket, { label: string; subtitle: string; color: string; rgb: string; anchor: string; anchorSub: string }> = {
  substrate: {
    label: 'IMAGINED ORDERS',
    subtitle: 'how shared frames become institutional fact',
    color: COLORS.violet, rgb: '167,139,250',
    anchor: '§3 — substrate',
    anchorSub: 'normalization gradient',
  },
  mechanism: {
    label: 'NORMALIZATION · PARADIGM · SHOCK',
    subtitle: 'how change becomes invisible or visible',
    color: COLORS.cyan, rgb: '34,211,238',
    anchor: '§3 — mechanism',
    anchorSub: 'and §6 silent versioning',
  },
  labor: {
    label: 'CONTINGENCY OF "THE JOB"',
    subtitle: 'wage labor as a recent, particular form',
    color: COLORS.amber, rgb: '245,158,11',
    anchor: '§5 — worked example',
    anchorSub: 'AI and labor',
  },
};

export function LiteratureMap() {
  const W = 900;
  const H = 540;

  const PAD = { l: 40, r: 220, t: 70, b: 80 };

  // X axis (year)
  const xMin = 1960, xMax = 2026;
  const sx = (y: number) => PAD.l + ((y - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);

  // Three horizontal bands
  const BAND_H = 110;
  const BAND_Y: Record<Bucket, number> = {
    substrate: PAD.t,
    mechanism: PAD.t + BAND_H + 10,
    labor:     PAD.t + 2 * (BAND_H + 10),
  };
  const trackY = (b: Bucket) => BAND_Y[b] + BAND_H / 2;

  // Anchor box geometry
  const ANCHOR_X = W - PAD.r + 12;
  const ANCHOR_W = PAD.r - 30;
  const ANCHOR_H = 80;
  const anchorY = (b: Bucket) => BAND_Y[b] + (BAND_H - ANCHOR_H) / 2;

  return (
    <FigShell
      title="Literature map — the threads behind this document"
      viewBox={`0 0 ${W} ${H}`}
      figcaption={
        <>
          Thirteen threads, three buckets, six decades. Each track flows into
          the section it informs:{' '}
          <strong style={{ color: BUCKET_META.substrate.color }}>imagined orders</strong>{' '}
          beneath §3,{' '}
          <strong style={{ color: BUCKET_META.mechanism.color }}>normalization &amp; paradigm</strong>{' '}
          inside §3,{' '}
          <strong style={{ color: BUCKET_META.labor.color }}>contingency of the job</strong>{' '}
          beneath §5. Each entry is a thread to be developed in its own
          piece — adding the next one is one line of data.
        </>
      }
    >
      {/* ─── Year axis (top) ─────────────────────────────────────── */}
      <g>
        <line
          x1={PAD.l} x2={W - PAD.r}
          y1={PAD.t - 20} y2={PAD.t - 20}
          stroke="rgba(255,255,255,0.10)"
        />
        {[1960, 1970, 1980, 1990, 2000, 2010, 2020].map((y) => (
          <g key={y}>
            <line x1={sx(y)} x2={sx(y)} y1={PAD.t - 24} y2={H - PAD.b + 4} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
            <text x={sx(y)} y={PAD.t - 28} fill={COLORS.textDim} fontSize={9.5} fontFamily="monospace" textAnchor="middle">
              {y}
            </text>
          </g>
        ))}
      </g>

      {/* ─── Bands ──────────────────────────────────────────────── */}
      {(Object.keys(BAND_Y) as Bucket[]).map((b) => {
        const m = BUCKET_META[b];
        return (
          <g key={b}>
            <rect
              x={PAD.l - 6} y={BAND_Y[b]}
              width={W - PAD.r - PAD.l + 12} height={BAND_H}
              rx={6}
              fill={`rgba(${m.rgb},0.04)`}
              stroke={`rgba(${m.rgb},0.18)`}
              strokeWidth={1}
            />
            <text x={PAD.l + 4} y={BAND_Y[b] + 16} fill={m.color} fontSize={10} fontFamily="monospace" letterSpacing={2}>
              {m.label}
            </text>
            <text x={PAD.l + 4} y={BAND_Y[b] + 30} fill={COLORS.textDim} fontSize={9.5} fontStyle="italic">
              {m.subtitle}
            </text>

            {/* Track (thin horizontal line through this band's center) */}
            <line
              x1={sx(xMin) + 14} x2={sx(xMax) - 14}
              y1={trackY(b)} y2={trackY(b)}
              stroke={`rgba(${m.rgb},0.30)`} strokeDasharray="2,3"
            />
          </g>
        );
      })}

      {/* ─── Threads (nodes on tracks) ──────────────────────────── */}
      {THREADS.map((t) => {
        const m = BUCKET_META[t.bucket];
        const x = sx(t.year);
        const y = trackY(t.bucket);
        const above = (t.side ?? 'above') === 'above';
        const labelY = above ? y - 14 : y + 22;
        const yearY  = above ? y - 26 : y + 36;
        return (
          <g key={t.id}>
            {/* Author + work label */}
            <text
              x={x} y={labelY}
              fill={COLORS.text} fontSize={10.5}
              textAnchor="middle"
            >
              {t.author}
            </text>
            <text
              x={x} y={yearY}
              fill={COLORS.textDim} fontSize={8.5} fontStyle="italic"
              textAnchor="middle"
            >
              {t.work}
            </text>

            {/* Connector tick from node to label */}
            <line
              x1={x} x2={x}
              y1={above ? y - 4 : y + 4}
              y2={above ? labelY + 4 : labelY - 10}
              stroke={`rgba(${m.rgb},0.45)`} strokeWidth={1}
            />

            {/* Node dot */}
            <circle cx={x} cy={y} r={5} fill={m.color} fillOpacity={0.85} stroke={m.color} strokeWidth={1} />
          </g>
        );
      })}

      {/* ─── Anchor flows: each track → its section anchor ──────── */}
      {(Object.keys(BAND_Y) as Bucket[]).map((b) => {
        const m = BUCKET_META[b];
        const xFrom = sx(xMax) - 6;
        const yFrom = trackY(b);
        const xTo = ANCHOR_X - 4;
        const yTo = anchorY(b) + ANCHOR_H / 2;
        const midX = (xFrom + xTo) / 2;
        const d = `M ${xFrom} ${yFrom} C ${midX} ${yFrom}, ${midX} ${yTo}, ${xTo} ${yTo}`;
        return (
          <g key={`flow-${b}`}>
            <path d={d} stroke={`rgba(${m.rgb},0.55)`} strokeWidth={1.25} fill="none" />
            <polygon
              points={`${xTo - 4},${yTo - 3} ${xTo - 4},${yTo + 3} ${xTo},${yTo}`}
              fill={`rgba(${m.rgb},0.65)`}
            />
          </g>
        );
      })}

      {/* ─── Section anchors (right column) ─────────────────────── */}
      {(Object.keys(BAND_Y) as Bucket[]).map((b) => {
        const m = BUCKET_META[b];
        return (
          <g key={`anchor-${b}`}>
            <rect
              x={ANCHOR_X} y={anchorY(b)}
              width={ANCHOR_W} height={ANCHOR_H}
              rx={6}
              fill={`rgba(${m.rgb},0.06)`}
              stroke={`rgba(${m.rgb},0.45)`}
              strokeWidth={1}
            />
            <text x={ANCHOR_X + 10} y={anchorY(b) + 22} fill={m.color} fontSize={10} fontFamily="monospace" letterSpacing={1.5}>
              FEEDS
            </text>
            <text x={ANCHOR_X + 10} y={anchorY(b) + 42} fill={COLORS.text} fontSize={12} fontWeight={500}>
              {m.anchor}
            </text>
            <text x={ANCHOR_X + 10} y={anchorY(b) + 58} fill={COLORS.textSoft} fontSize={10} fontStyle="italic">
              {m.anchorSub}
            </text>
          </g>
        );
      })}

      {/* ─── Takeaway ───────────────────────────────────────────── */}
      <g transform={`translate(20, ${H - 28})`}>
        <rect width={W - 40} height={22} rx={4}
          fill="rgba(167,139,250,0.08)" stroke={COLORS.violet} strokeDasharray="4,2" />
        <text x={(W - 40) / 2} y={15} fill={COLORS.violet} fontSize={11} textAnchor="middle" fontWeight={600}>
          The framework is not original. The synthesis is. Each thread has its own deep dive coming.
        </text>
      </g>
    </FigShell>
  );
}

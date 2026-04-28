'use client';

import { useState } from 'react';
import { COLORS } from '@/components/teaching-svg/palette';
import { FigCaption } from '@/components/teaching-svg/FigShell';
import { WideSvgScroll } from '@/components/teaching-svg/WideSvgScroll';

/**
 * Teaching archetype: row-repeater + interactive.
 * One question: where does AI usage actually sit on the same energy
 * ladder as the rest of a person's daily life?
 *
 * Implementation: log-axis horizontal bars. The "your daily AI usage"
 * bar is driven by a slider so the reader can dial in their own number
 * and watch where it falls on the ladder.
 */

type Category = 'ai' | 'digital' | 'household' | 'transport' | 'food';

interface Row {
  id: string;
  label: string;
  /** kWh — direct or CO2-equivalent */
  kwh: number;
  category: Category;
  source?: string;
  /** If true, the row's kwh is overridden by the live slider */
  dynamic?: boolean;
}

const ROWS: Row[] = [
  { id: 'gem',    label: 'One Gemini / ChatGPT text prompt',    kwh: 0.00024, category: 'ai',         source: 'Google methodology paper, Aug 2025' },
  { id: 'goog',   label: 'One Google search',                   kwh: 0.0003,  category: 'digital',    source: 'Google blog 2009 — likely lower today' },
  { id: 'img',    label: 'One AI-generated image',              kwh: 0.0015,  category: 'ai',         source: 'Hugging Face AI Energy Score 2024' },
  { id: 'you',    label: 'YOUR daily AI usage',                 kwh: 0.007,   category: 'ai',         dynamic: true },
  { id: 'spot',   label: '1 hour Spotify',                      kwh: 0.01,    category: 'digital',    source: 'Greenly 2023' },
  { id: 'phone',  label: 'Smartphone full charge',              kwh: 0.019,   category: 'household',  source: 'EPA' },
  { id: 'kettle', label: 'Boil one kettle (1 mug)',             kwh: 0.019,   category: 'household' },
  { id: 'tik',    label: '1 hour TikTok',                       kwh: 0.04,    category: 'digital',    source: 'Greenspector 2024' },
  { id: 'nflx',   label: '1 hour Netflix HD',                   kwh: 0.077,   category: 'digital',    source: 'IEA 2020 / DIMPACT' },
  { id: 'yt',     label: '1 hour YouTube HD',                   kwh: 0.12,    category: 'digital' },
  { id: 'micro',  label: 'Microwave 10 min',                    kwh: 0.2,     category: 'household' },
  { id: 'ps5',    label: '1 hour PS5 gaming',                   kwh: 0.21,    category: 'digital' },
  { id: 'ev',     label: '1 mile in an EV',                     kwh: 0.35,    category: 'transport',  source: 'DOE 2024 fleet avg' },
  { id: 'ac',     label: '1 hour central AC',                   kwh: 3.5,     category: 'household' },
  { id: 'house',  label: 'Average US household daily total',    kwh: 28.4,    category: 'household',  source: 'EIA 2024' },
  { id: 'beef',   label: '1 kg beef (CO₂-equivalent)',          kwh: 150,     category: 'food',       source: 'Poore & Nemecek 2018' },
  { id: 'flight', label: '1 transatlantic flight (per pax, CO₂-eq)', kwh: 6000, category: 'transport', source: 'myclimate.org' },
];

const CAT_COLOR: Record<Category, string> = {
  ai:        '#a78bfa', // violet — the thing being assessed
  digital:   '#60a5fa', // blue — peer digital activities
  household: 'rgba(245,245,247,0.55)', // neutral
  transport: '#f59e0b', // amber
  food:      '#ef4444', // red
};

const CAT_LABEL: Record<Category, string> = {
  ai:        'AI',
  digital:   'Other digital',
  household: 'Household',
  transport: 'Transport',
  food:      'Food (CO₂-eq)',
};

// Energy per single prompt by mode
const PER_PROMPT_KWH = {
  text:      0.00024, // Google Gemini median text prompt
  image:     0.0015,  // efficient diffusion
  reasoning: 0.007,   // o-class reasoning model (~30× a text prompt)
};

type Mode = keyof typeof PER_PROMPT_KWH;

// Log scale — domain spans 8 orders of magnitude
const DOMAIN_MIN = 0.0001;
const DOMAIN_MAX = 10000;
const logRange = Math.log10(DOMAIN_MAX) - Math.log10(DOMAIN_MIN);

function logScale(v: number, w: number): number {
  if (v <= 0) return 0;
  const clamped = Math.max(DOMAIN_MIN, Math.min(DOMAIN_MAX, v));
  return ((Math.log10(clamped) - Math.log10(DOMAIN_MIN)) / logRange) * w;
}

// Format kWh nicely
function fmt(v: number): string {
  if (v >= 100) return `${v.toFixed(0)} kWh`;
  if (v >= 1) return `${v.toFixed(2)} kWh`;
  if (v >= 0.001) return `${(v * 1000).toFixed(1)} Wh`;
  return `${(v * 1000).toFixed(2)} Wh`;
}

export function ScaleLadder() {
  const [prompts, setPrompts] = useState(30);
  const [mode, setMode] = useState<Mode>('text');

  const userKwh = prompts * PER_PROMPT_KWH[mode];
  const liveRows = ROWS.map((r) => (r.dynamic ? { ...r, kwh: userKwh } : r));

  const W = 900;
  const LABEL_W = 280;
  const BAR_X = LABEL_W + 24;
  const BAR_W = W - BAR_X - 100;
  const ROW_H = 30;
  const TOP = 70;
  const H = TOP + liveRows.length * ROW_H + 60;

  // Ticks for log axis
  const TICKS = [0.001, 0.01, 0.1, 1, 10, 100, 1000];

  return (
    <figure className="bg-white/[0.02] border border-white/10 rounded-xl p-5 my-8">
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 mb-3">
        Your AI footprint vs. everything else (log scale)
      </div>

      {/* ─── Interactive controls ───────────────────────────────── */}
      <div className="rounded-lg border border-white/10 bg-white/[0.015] p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Slider */}
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/45 mb-2">
              Prompts per day
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={prompts}
                onChange={(e) => setPrompts(Number(e.target.value))}
                className="flex-1 accent-[#a78bfa]"
                aria-label="Prompts per day"
              />
              <span className="text-base font-mono text-white/85 w-14 text-right tabular-nums">
                {prompts}
              </span>
            </div>
          </div>

          {/* Mode picker */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/45 mb-2">
              Query type
            </label>
            <div className="flex gap-1">
              {(Object.keys(PER_PROMPT_KWH) as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="text-xs font-mono px-2.5 py-1.5 rounded border transition-colors"
                  style={{
                    borderColor: mode === m ? '#a78bfa' : 'rgba(255,255,255,0.10)',
                    color: mode === m ? '#a78bfa' : 'rgba(245,245,247,0.55)',
                    background: mode === m ? 'rgba(167,139,250,0.10)' : 'transparent',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.25em] uppercase text-white/45 mb-2">
              Presets
            </label>
            <div className="flex gap-1">
              {[
                { label: 'light', n: 5 },
                { label: 'typical', n: 30 },
                { label: 'heavy', n: 200 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPrompts(p.n)}
                  className="text-xs font-mono px-2.5 py-1.5 rounded border border-white/10 text-white/55 hover:text-white hover:border-white/30 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live readout */}
        <div className="mt-4 text-sm text-white/65 leading-relaxed">
          At <span className="font-mono text-white/90">{prompts}</span>{' '}
          {mode} prompts/day you use{' '}
          <span className="font-mono" style={{ color: '#a78bfa' }}>{fmt(userKwh)}</span>{' '}
          per day on AI. Compare with{' '}
          <span className="font-mono text-white/85">{fmt(0.077)}</span> for one Netflix-hour, or{' '}
          <span className="font-mono text-white/85">{fmt(28.4)}</span> for an average US household per day.
        </div>
      </div>

      {/* ─── Legend ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] mb-2">
        {(Object.keys(CAT_LABEL) as Category[]).map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5 text-white/55">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLOR[c] }} />
            {CAT_LABEL[c]}
          </span>
        ))}
      </div>

      {/* ─── Bar chart SVG ─────────────────────────────────────── */}
      <WideSvgScroll>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Tick lines */}
        {TICKS.map((t) => {
          const x = BAR_X + logScale(t, BAR_W);
          return (
            <g key={t}>
              <line
                x1={x} x2={x} y1={TOP - 8} y2={TOP + liveRows.length * ROW_H + 4}
                stroke="rgba(255,255,255,0.05)" strokeDasharray="2,4"
              />
              <text
                x={x} y={TOP - 14}
                fill={COLORS.textWhisper} fontSize={9} fontFamily="monospace" textAnchor="middle"
              >
                {fmt(t)}
              </text>
            </g>
          );
        })}

        {/* Rows */}
        {liveRows.map((r, i) => {
          const y = TOP + i * ROW_H;
          const barW = logScale(r.kwh, BAR_W);
          const color = CAT_COLOR[r.category];
          const isYou = r.dynamic;

          return (
            <g key={r.id}>
              {/* Hover band */}
              <rect
                x={0} y={y - 12} width={W} height={ROW_H - 4}
                fill={isYou ? 'rgba(167,139,250,0.06)' : 'transparent'}
                stroke={isYou ? 'rgba(167,139,250,0.30)' : 'none'}
                strokeWidth={isYou ? 1 : 0}
                rx={isYou ? 4 : 0}
              />

              {/* Activity label */}
              <text
                x={LABEL_W} y={y + 5}
                fill={isYou ? '#a78bfa' : 'rgba(245,245,247,0.78)'}
                fontSize={11}
                fontWeight={isYou ? 600 : 400}
                textAnchor="end"
              >
                {r.label}
              </text>

              {/* Bar */}
              <rect
                x={BAR_X} y={y - 7} width={Math.max(barW, 1)} height={14}
                rx={2}
                fill={color}
                fillOpacity={isYou ? 0.9 : 0.55}
              />

              {/* Value */}
              <text
                x={BAR_X + barW + 8} y={y + 4}
                fill={isYou ? '#a78bfa' : 'rgba(245,245,247,0.55)'}
                fontSize={10}
                fontWeight={isYou ? 600 : 400}
                fontFamily="monospace"
              >
                {fmt(r.kwh)}
              </text>
            </g>
          );
        })}

        {/* Takeaway callout */}
        <g transform={`translate(20, ${TOP + liveRows.length * ROW_H + 22})`}>
          <rect
            width={W - 40} height={26} rx={4}
            fill="rgba(167,139,250,0.08)"
            stroke="#a78bfa" strokeDasharray="4,2"
          />
          <text
            x={(W - 40) / 2} y={17}
            fill="#a78bfa" fontSize={11}
            textAnchor="middle" fontWeight={600}
          >
            For an average chatbot user, AI is roughly the magnitude of a few Google searches per day.
          </text>
        </g>
      </svg>
      </WideSvgScroll>

      <FigCaption>
        Log scale spans 8 orders of magnitude.{' '}
        <strong style={{ color: '#a78bfa' }}>AI bars (violet)</strong> cluster
        in the small end. Even a heavy reasoning-model user (~100 reasoning
        prompts/day = ~0.7 kWh) sits below an hour of central AC.
        Weekly steak ≈{' '}
        <span className="font-mono">~150 kWh CO₂-equivalent</span>; one
        flight ≈ <span className="font-mono">6,000 kWh CO₂-equivalent</span>.
        That said: per-query small does not mean system-level small —
        see the next figure.
      </FigCaption>
    </figure>
  );
}

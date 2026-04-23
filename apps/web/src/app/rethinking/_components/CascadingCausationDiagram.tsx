'use client';

import { useEffect, useRef, useState } from 'react';

const LAYERS = [
  { label: 'Seconds before',  hint: 'Neurons fire. Hormones circulate.' },
  { label: 'Minutes to days', hint: 'Stress, sleep, blood sugar, social contact.' },
  { label: 'Adolescence',     hint: 'Neural pathways prune and crystallize.' },
  { label: 'Childhood',       hint: 'Early nutrition, language, SES, attachment.' },
  { label: 'Prenatal',        hint: 'Maternal stress, hormones, epigenetics.' },
  { label: 'Culture',         hint: 'The water we swim in. Values, norms, institutions.' },
  { label: 'Evolution',       hint: 'Millions of years of selection pressure.' },
];

export function CascadingCausationDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      className="my-12 rounded-xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8"
    >
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/60">
          Diagram · Cascading causation
        </p>
        <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/25">
          Hover a layer
        </p>
      </div>

      <svg viewBox="0 0 560 360" className="w-full h-auto" role="img" aria-labelledby="ccc-title">
        <title id="ccc-title">Nested temporal layers from evolution to the moment of behavior</title>
        <defs>
          <radialGradient id="ccc-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(196,181,253,0.9)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.4)" />
          </radialGradient>
        </defs>

        {/* Concentric rings — outermost = evolution, innermost = the behavior */}
        {LAYERS.map((layer, i) => {
          const total = LAYERS.length;
          const idx = total - 1 - i; // draw outside-in so innermost renders last
          const r = 26 + idx * 22;
          const isHover = hover === idx;
          const baseOpacity = 0.12 + (idx / total) * 0.12;
          return (
            <g
              key={layer.label}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(null)}
            >
              <circle
                cx="280"
                cy="180"
                r={r}
                fill="none"
                stroke={isHover ? 'rgba(196,181,253,0.9)' : `rgba(167,139,250,${baseOpacity})`}
                strokeWidth={isHover ? 1.5 : 1}
                style={{
                  transition: 'all 0.4s ease',
                  strokeDasharray: visible ? '0' : '4 4',
                  opacity: visible ? 1 : 0,
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </g>
          );
        })}

        {/* Innermost dot = the behavior */}
        <circle cx="280" cy="180" r="7" fill="url(#ccc-core)"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
            transitionDelay: `${LAYERS.length * 60}ms`,
          }}
        />
        <text x="280" y="184" textAnchor="middle" fontSize="9" fontFamily="monospace"
          fill="rgba(255,255,255,0.9)" letterSpacing="1"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
            transitionDelay: `${(LAYERS.length + 1) * 60}ms`,
            pointerEvents: 'none',
          }}
        >the moment</text>

        {/* Layer labels on the right */}
        {LAYERS.map((layer, i) => {
          const idx = i; // label order top-to-bottom matches outer→inner
          const r = 26 + (LAYERS.length - 1 - idx) * 22;
          const cy = 180;
          const labelY = 40 + i * 38;
          const isHover = hover === (LAYERS.length - 1 - idx);
          return (
            <g
              key={`label-${layer.label}`}
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s ease',
                transitionDelay: `${i * 80 + 300}ms`,
              }}
              onMouseEnter={() => setHover(LAYERS.length - 1 - idx)}
              onMouseLeave={() => setHover(null)}
              cursor="pointer"
            >
              {/* Connector from label to ring */}
              <line
                x1="420"
                y1={labelY}
                x2={280 + Math.cos(-Math.PI / 2.6) * r}
                y2={cy + Math.sin(-Math.PI / 2.6) * r}
                stroke={isHover ? 'rgba(196,181,253,0.7)' : 'rgba(167,139,250,0.15)'}
                strokeWidth="0.7"
                style={{ transition: 'stroke 0.3s ease' }}
              />
              <text
                x="428"
                y={labelY + 3}
                fontSize="11"
                fontFamily="monospace"
                fill={isHover ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)'}
                letterSpacing="0.5"
                style={{ transition: 'fill 0.3s ease' }}
              >
                {layer.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="min-h-[56px] mt-2">
        <p className="text-sm text-white/70 leading-relaxed">
          {hover !== null ? (
            <>
              <span className="text-white/90 font-medium">{LAYERS[hover].label}.</span>{' '}
              <span className="text-white/55">{LAYERS[hover].hint}</span>
            </>
          ) : (
            <span className="text-white/45">
              Any behavior sits at the centre of every layer at once. Neurons fire because
              of hormones, which reflect adolescence, which reflects childhood, which
              reflects prenatal environment, which reflects culture, which reflects
              evolution. No gaps between the disciplines we invented.
            </span>
          )}
        </p>
      </div>
    </figure>
  );
}

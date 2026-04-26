'use client';

import { useState } from 'react';
import { COLORS } from '@/components/teaching-svg/palette';
import { FigShell } from '@/components/teaching-svg/FigShell';

/**
 * Teaching archetype: Schematic-with-callouts.
 * One question: where, geographically, are the displaced harms
 * actually happening — and at what scale?
 *
 * Implementation: dependency-free equirectangular grid (no continent
 * outlines — pins are the focus). Click a pin to reveal the receipt
 * card below.
 */

interface Pin {
  id: string;
  lat: number;
  lon: number;
  place: string;
  category: 'labor' | 'welfare' | 'surveillance' | 'warfare' | 'biometric' | 'election' | 'environment';
  title: string;
  scale: string;
  receipt: string;
  source: { url: string; publisher: string; date: string };
}

const PINS: Pin[] = [
  {
    id: 'sama',
    lat: -1.3, lon: 36.8, place: 'Nairobi, Kenya',
    category: 'labor',
    title: 'Sama / OpenAI content moderation',
    scale: '$1.32–2/hr · ~50 workers',
    receipt:
      'OpenAI paid Kenyan workers contracted through Sama less than $2/hr to label graphic descriptions of CSAM, suicide, torture, self-harm — to build the safety filter that makes ChatGPT marketable. Workers reported lasting trauma; 150 African content workers voted to unionize in May 2023.',
    source: { url: 'https://time.com/6247678/openai-chatgpt-kenya-workers/', publisher: 'TIME — Hao on OpenAI Kenya', date: '2023-01-18' },
  },
  {
    id: 'robodebt',
    lat: -35.3, lon: 149.1, place: 'Canberra, Australia',
    category: 'welfare',
    title: 'Robodebt',
    scale: '~500K wrongly accused · A$1.7B raised',
    receipt:
      'Australia\'s automated welfare-debt system falsely accused ~500,000 people of fraud 2015–2019, raising A$1.7B before being ruled unlawful. A Royal Commission concluded the program was "a costly failure of public administration."',
    source: { url: 'https://www.context.news/surveillance/australian-robodebt-scandal-shows-the-risk-of-rule-by-algorithm', publisher: 'Context — Robodebt explainer', date: '2023' },
  },
  {
    id: 'toeslagen',
    lat: 52.4, lon: 4.9, place: 'Netherlands',
    category: 'welfare',
    title: 'Toeslagenaffaire',
    scale: '~26K families · cabinet collapsed',
    receipt:
      'Dutch tax authority\'s SyRI/childcare-benefit algorithm wrongly accused ~26,000 families — disproportionately dual-nationals — of fraud, demanding repayment of tens of thousands of euros each. Triggered the resignation of Mark Rutte\'s cabinet in January 2021.',
    source: { url: 'https://en.wikipedia.org/wiki/Dutch_childcare_benefits_scandal', publisher: 'Wikipedia — Dutch childcare benefits scandal', date: '2021' },
  },
  {
    id: 'lavender',
    lat: 31.5, lon: 34.5, place: 'Gaza',
    category: 'warfare',
    title: 'Lavender · Where\'s Daddy?',
    scale: '~37,000 Palestinian names',
    receipt:
      'Israeli IDF AI targeting system generated kill lists of up to 37,000 Palestinians; companion system "Where\'s Daddy?" timed strikes to when targets were home with their families. Six Israeli intelligence sources spoke to +972/Local Call. UN experts denounced AI-enabled "domicide."',
    source: { url: 'https://www.972mag.com/lavender-ai-israeli-army-gaza/', publisher: '+972 Magazine — Lavender', date: '2024-04' },
  },
  {
    id: 'immigrationos',
    lat: 38.9, lon: -77.0, place: 'Washington DC, US',
    category: 'surveillance',
    title: 'ICE × Palantir ImmigrationOS',
    scale: '$30M contract · runs through 2027',
    receipt:
      'ICE awarded Palantir a $30M contract in April 2025 to build ImmigrationOS — pulling passport, SSA, IRS, and license-plate-reader data into a single deportation operating system. Prototype due September 25, 2025. Separate USCIS Palantir contract surfaced December 2025.',
    source: { url: 'https://www.americanimmigrationcouncil.org/blog/ice-immigrationos-palantir-ai-track-immigrants/', publisher: 'American Immigration Council', date: '2025-04' },
  },
  {
    id: 'memphis',
    lat: 35.1, lon: -90.0, place: 'Memphis, TN, US',
    category: 'environment',
    title: 'xAI Colossus · gas turbine pollution',
    scale: '27 unpermitted turbines · 495 MW',
    receipt:
      'NAACP + SELC + Earthjustice sued April 2026 over 27 unpermitted methane turbines (495 MW) at xAI\'s Southaven, MS site near majority-Black communities. Estimated 1,700 tons/yr NOx, 19 tons/yr formaldehyde. Original Colossus 1 ran up to 35 unpermitted turbines.',
    source: { url: 'https://naacp.org/articles/naacp-sues-xai-illegal-pollution-data-center-power-plant', publisher: 'NAACP — xAI Memphis suit', date: '2026-04' },
  },
  {
    id: 'romania',
    lat: 44.4, lon: 26.1, place: 'Bucharest, Romania',
    category: 'election',
    title: 'Romanian presidential election annulled',
    scale: 'Europe\'s first · ~$381K influencer spend',
    receipt:
      'Constitutional Court annulled the December 2024 first round on December 6 after deepfake-amplified TikTok influence on behalf of Călin Georgescu. Pro-Georgescu content shown 4.6–14× more than rivals; ~$381,000 in paid influencer spend.',
    source: { url: 'https://globalwitness.org/en/campaigns/digital-threats/what-happened-on-tiktok-around-the-annulled-romanian-presidential-election-an-investigation-and-poll/', publisher: 'Global Witness investigation', date: '2024-12' },
  },
  {
    id: 'worldcoin-thailand',
    lat: 13.7, lon: 100.5, place: 'Bangkok, Thailand',
    category: 'biometric',
    title: 'Worldcoin halted',
    scale: '>1M users · biometric data deletion ordered',
    receipt:
      'Thai PDPC ordered Worldcoin to halt iris scanning and delete biometric data of >1M users (October 2024). Worldcoin (now World) is co-founded by Sam Altman.',
    source: { url: 'https://idtechwire.com/thailand-orders-worldcoin-to-halt-iris-scans-and-delete-biometric-data/', publisher: 'ID Tech Wire — Thailand Worldcoin halt', date: '2024-10' },
  },
  {
    id: 'worldcoin-colombia',
    lat: 4.7, lon: -74.1, place: 'Bogotá, Colombia',
    category: 'biometric',
    title: 'Worldcoin shutdown',
    scale: 'biometric-data violations',
    receipt:
      'Colombia\'s Superintendence of Industry and Commerce ordered Worldcoin to shut down operations and delete collected biometric data over GDPR-style consent violations (March 2025).',
    source: { url: 'https://cadeproject.org/updates/colombia-orders-worldcoin-shutdown-over-biometric-data-violations/', publisher: 'CADE — Colombia Worldcoin shutdown', date: '2025-03' },
  },
  {
    id: 'worldcoin-philippines',
    lat: 14.6, lon: 121.0, place: 'Manila, Philippines',
    category: 'biometric',
    title: 'Worldcoin halted',
    scale: 'data deletion ordered',
    receipt:
      'National Privacy Commission ordered Worldcoin to halt iris-collection operations and delete data, joining Kenya, Thailand, and Colombia in shutdown actions through 2024–25.',
    source: { url: 'https://idtechwire.com/thailand-orders-worldcoin-to-halt-iris-scans-and-delete-biometric-data/', publisher: 'ID Tech Wire (regional context)', date: '2024' },
  },
  {
    id: 'raine',
    lat: 37.5, lon: -122.3, place: 'California, US',
    category: 'surveillance', // closest fit; actually mental-health but no separate category
    title: 'Raine v. OpenAI + 9 active suicide / mental-health suits',
    scale: '7 deaths · 10 active lawsuits',
    receipt:
      'Adam Raine, 16, died by suicide April 2025 after months of ChatGPT conversations in which (per the complaint) the model offered to draft his suicide note. By late 2025, 10 active lawsuits against OpenAI and Character Technologies covered 6 adults and 4 minors, 7 of whom died by suicide.',
    source: { url: 'https://www.washingtonpost.com/technology/2025/12/27/chatgpt-suicide-openai-raine/', publisher: 'Washington Post — Raine v. OpenAI', date: '2025-12-27' },
  },
];

const CATEGORY_COLOR: Record<Pin['category'], string> = {
  labor:        '#f59e0b', // amber
  welfare:      '#f59e0b',
  surveillance: '#f97316', // orange
  warfare:      '#ef4444', // red — most severe
  biometric:    '#a78bfa', // violet
  election:     '#f97316',
  environment:  '#84cc16', // lime — environmental
};

const CATEGORY_LABEL: Record<Pin['category'], string> = {
  labor:        'Labor',
  welfare:      'Welfare automation',
  surveillance: 'Surveillance',
  warfare:      'Automated warfare',
  biometric:    'Biometric capture',
  election:     'Election manipulation',
  environment:  'Environmental harm',
};

// Equirectangular projection for a 800×400 viewBox
const MAP_W = 800;
const MAP_H = 400;
const project = (lat: number, lon: number) => ({
  x: ((lon + 180) / 360) * MAP_W,
  y: ((90 - lat) / 180) * MAP_H,
});

export function DisplacedHarmsAtlas() {
  const [activeId, setActiveId] = useState<string>(PINS[0].id);
  const active = PINS.find((p) => p.id === activeId) ?? PINS[0];

  const PANEL_H = 240;
  const TOTAL_H = MAP_H + 60 + PANEL_H + 30;

  // Lon/lat gridlines at every 30°
  const lonLines = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  const latLines = [-60, -30, 0, 30, 60];

  return (
    <FigShell
      title="Where the displaced harms are actually happening"
      viewBox={`0 0 ${MAP_W} ${TOTAL_H}`}
      figcaption={
        <>
          Click any pin to see the receipt. Eleven cases, six categories,
          five continents. None of the people involved consented; none of
          these deployments had a meaningful prior public debate. The point
          of the figure is the{' '}
          <strong style={{ color: COLORS.amber }}>geographic distribution</strong>{' '}
          — &ldquo;already happening, everywhere&rdquo; is not rhetoric, it
          is the data.
        </>
      }
    >
      {/* ─── Legend (top) ────────────────────────────────────────── */}
      <g>
        {Object.entries(CATEGORY_LABEL).map(([cat, label], i) => {
          const x = 20 + i * 110;
          const color = CATEGORY_COLOR[cat as Pin['category']];
          return (
            <g key={cat}>
              <circle cx={x + 6} cy={20} r={4} fill={color} />
              <text x={x + 16} y={24} fill={COLORS.textSoft} fontSize={9} fontFamily="monospace">
                {label}
              </text>
            </g>
          );
        })}
      </g>

      {/* ─── Map background grid ───────────────────────────────── */}
      <g transform={`translate(0, 50)`}>
        {/* Map frame */}
        <rect
          x={0} y={0} width={MAP_W} height={MAP_H}
          fill="rgba(255,255,255,0.015)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
          rx={4}
        />

        {/* Longitude lines */}
        {lonLines.map((lon) => {
          const { x } = project(0, lon);
          const isMeridian = lon === 0;
          return (
            <line
              key={`lon-${lon}`}
              x1={x} y1={0} x2={x} y2={MAP_H}
              stroke={isMeridian ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}
              strokeDasharray={isMeridian ? undefined : '2,4'}
            />
          );
        })}

        {/* Latitude lines */}
        {latLines.map((lat) => {
          const { y } = project(lat, 0);
          const isEquator = lat === 0;
          return (
            <line
              key={`lat-${lat}`}
              x1={0} y1={y} x2={MAP_W} y2={y}
              stroke={isEquator ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}
              strokeDasharray={isEquator ? undefined : '2,4'}
            />
          );
        })}

        {/* Equator label */}
        <text x={MAP_W - 10} y={project(0, 0).y - 4} fill={COLORS.textWhisper} fontSize={8} fontFamily="monospace" textAnchor="end">
          equator
        </text>

        {/* ─── Pins ───────────────────────────────────────────── */}
        {PINS.map((p) => {
          const { x, y } = project(p.lat, p.lon);
          const color = CATEGORY_COLOR[p.category];
          const isActive = p.id === activeId;
          return (
            <g key={p.id}>
              {/* Pulse ring for active */}
              {isActive && (
                <circle cx={x} cy={y} r={14} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6}>
                  <animate attributeName="r" from="7" to="18" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Pin button (transparent hit area + visible dot) */}
              <g
                onClick={() => setActiveId(p.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={x} cy={y} r={14} fill="transparent" />
                <circle
                  cx={x} cy={y}
                  r={isActive ? 6 : 5}
                  fill={color}
                  fillOpacity={isActive ? 1 : 0.7}
                  stroke={isActive ? 'white' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={isActive ? 1.5 : 1}
                />
                {/* Place label — only on active to reduce clutter */}
                {isActive && (
                  <text
                    x={x + 10} y={y + 4}
                    fill={COLORS.text} fontSize={10} fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    {p.place}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </g>

      {/* ─── Receipt panel below the map ───────────────────────── */}
      <g transform={`translate(0, ${50 + MAP_H + 16})`}>
        <rect
          x={0} y={0} width={MAP_W} height={PANEL_H}
          rx={8}
          fill="rgba(245,158,11,0.04)"
          stroke="rgba(245,158,11,0.35)"
          strokeWidth={1}
        />

        {/* Category chip + place */}
        <g transform="translate(20, 28)">
          <rect width={140} height={20} rx={10}
            fill={`${CATEGORY_COLOR[active.category]}22`}
            stroke={CATEGORY_COLOR[active.category]}
            strokeWidth={1}
          />
          <text x={70} y={14} fill={CATEGORY_COLOR[active.category]} fontSize={10} fontFamily="monospace" textAnchor="middle">
            {CATEGORY_LABEL[active.category]}
          </text>
          <text x={150} y={14} fill={COLORS.textSoft} fontSize={11} fontFamily="monospace">
            {active.place}
          </text>
        </g>

        {/* Title */}
        <text x={20} y={72} fill={COLORS.text} fontSize={15} fontWeight={500}>
          {active.title}
        </text>
        <text x={20} y={92} fill={COLORS.amber} fontSize={11} fontFamily="monospace" letterSpacing={1.5}>
          {active.scale}
        </text>

        {/* Receipt text via foreignObject so we get word-wrap */}
        <foreignObject x={20} y={104} width={MAP_W - 40} height={PANEL_H - 130}>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(245,245,247,0.78)',
              lineHeight: 1.55,
              fontFamily: 'system-ui, sans-serif',
              fontStyle: 'italic',
            }}
          >
            <div style={{ marginBottom: 8 }}>{active.receipt}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(245,245,247,0.40)', fontFamily: 'monospace', fontStyle: 'normal' }}>
              source ·{' '}
              <a
                href={active.source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(245,245,247,0.55)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              >
                {active.source.publisher}
              </a>
              <span style={{ marginLeft: 8 }}>{active.source.date}</span>
            </div>
          </div>
        </foreignObject>
      </g>

      {/* ─── Hint label below ───────────────────────────────────── */}
      <text
        x={MAP_W / 2} y={TOTAL_H - 6}
        fill={COLORS.textWhisper} fontSize={9} fontFamily="monospace" textAnchor="middle" letterSpacing={2}
      >
        ↑ click any pin
      </text>
    </FigShell>
  );
}

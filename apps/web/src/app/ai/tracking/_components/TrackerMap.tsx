'use client';

import { useState } from 'react';
import { COLORS } from '@/components/teaching-svg/palette';
import { WideSvgScroll } from '@/components/teaching-svg/WideSvgScroll';

/**
 * Teaching archetype: Schematic-with-callouts (interactive scatter).
 * One question: who actually evaluates AI capability and bias, and how
 * independent are they from the labs they evaluate?
 *
 * Y axis = scope (what they track).
 * X axis = independence (who funds them).
 * Node size = approximate operating budget where known.
 */

type Funding = 'lab' | 'industry' | 'government' | 'op-funded' | 'independent';
type Scope = 'capability' | 'safety' | 'bias' | 'labor' | 'all';

interface Tracker {
  id: string;
  name: string;
  who: string;
  scope: Scope;
  funding: Funding;
  /** 1..5 — node size proxy (rough budget) */
  size: number;
  finding: string;
  source?: { url: string; publisher: string };
}

const TRACKERS: Tracker[] = [
  // CAPABILITY
  { id: 'haiindex',  name: 'Stanford HAI AI Index',  who: 'academic + industry steering', scope: 'all',        funding: 'op-funded', size: 5,
    finding: 'Annual ~400-page survey. 2025: scores on MMMU, GPQA, SWE-bench jumped 18.8/48.9/67.3 points within a year of introduction.',
    source: { url: 'https://hai.stanford.edu/ai-index/2025-ai-index-report', publisher: 'Stanford HAI 2025' } },
  { id: 'epoch',     name: 'Epoch AI',               who: 'nonprofit (Open Phil-funded)',  scope: 'capability',  funding: 'op-funded', size: 4,
    finding: '>3,200 ML models tracked since 1950. Frontier training compute grew 5×/year (doubling every 5.2 months) since 2020.',
    source: { url: 'https://epoch.ai/blog/compute-trends', publisher: 'Epoch AI compute trends' } },
  { id: 'metr',      name: 'METR',                   who: 'nonprofit (Open Phil-funded)',  scope: 'capability',  funding: 'op-funded', size: 4,
    finding: '"Task completion time horizon" for AI agents doubles every ~7 months.',
    source: { url: 'https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/', publisher: 'METR — task length' } },
  { id: 'lmsys',     name: 'LMSYS Arena',            who: 'academic (Berkeley) + MBZUAI',  scope: 'capability',  funding: 'industry', size: 3,
    finding: 'Crowdsourced human preference rankings. Increasingly criticized as gameable — labs tune models to "Arena style".',
    source: { url: 'https://lmarena.ai', publisher: 'LMArena' } },
  { id: 'arc',       name: 'ARC Prize',              who: 'foundation (Chollet)',           scope: 'capability', funding: 'independent', size: 3,
    finding: 'Tests fluid abstract reasoning. Top 2025 score 24% on ARC-AGI-2 vs human ~85%.',
    source: { url: 'https://arcprize.org', publisher: 'ARC Prize' } },

  // SAFETY
  { id: 'ukaisi',    name: 'UK AISI',                who: 'government (UK)',                scope: 'safety',     funding: 'government', size: 4,
    finding: '30+ frontier models tested. Self-replication eval success: 5% → 60% (2023→2025). Apprentice cyber tasks: 9% → 50% in 2 years.',
    source: { url: 'https://www.aisi.gov.uk', publisher: 'UK AISI' } },
  { id: 'usaisi',    name: 'US AISI',                who: 'government (NIST)',              scope: 'safety',     funding: 'government', size: 3,
    finding: 'Created via Biden EO; future under current administration uncertain. Standards-focused.',
    source: { url: 'https://www.nist.gov/aisi', publisher: 'US AISI' } },
  { id: 'apollo',    name: 'Apollo Research',        who: 'nonprofit (Open Phil/SFF-funded)', scope: 'safety',  funding: 'op-funded', size: 3,
    finding: "OpenAI's o1 was the only model to scheme in every scenario tested; confessed only ~20% of the time.",
    source: { url: 'https://www.apolloresearch.ai', publisher: 'Apollo Research' } },
  { id: 'redwood',   name: 'Redwood Research',       who: 'nonprofit (~95% Open Phil)',     scope: 'safety',     funding: 'op-funded', size: 2,
    finding: 'With Anthropic, demonstrated "alignment faking" — Claude strategically deceiving its trainers to avoid modification.',
    source: { url: 'https://www.redwoodresearch.org', publisher: 'Redwood Research' } },
  { id: 'rsp',       name: 'Anthropic RSP / OpenAI Preparedness', who: 'frontier labs (self)', scope: 'safety', funding: 'lab',     size: 5,
    finding: 'Voluntary catastrophic-risk frameworks tied to capability thresholds. FAS analysis: "underspecified, insufficiently conservative".',
    source: { url: 'https://www.anthropic.com/responsible-scaling-policy', publisher: 'Anthropic RSP' } },

  // BIAS
  { id: 'helm',      name: 'HELM (Stanford CRFM)',   who: 'academic',                       scope: 'bias',       funding: 'op-funded', size: 3,
    finding: 'Open framework: 42 scenarios × 7 metrics. Raised standardized evaluation coverage from 17.9% → 96% of models.',
    source: { url: 'https://crfm.stanford.edu/helm', publisher: 'HELM' } },
  { id: 'decoding',  name: 'DecodingTrust',          who: 'academic (UIUC + Stanford + MS)', scope: 'bias',      funding: 'op-funded', size: 2,
    finding: 'GPT-4 is *more* vulnerable to jailbreaks than 3.5 — better at following instructions, including malicious ones.',
    source: { url: 'https://decodingtrust.github.io', publisher: 'DecodingTrust' } },
  { id: 'bbq',       name: 'BBQ benchmark',          who: 'academic (NYU)',                 scope: 'bias',       funding: 'op-funded', size: 2,
    finding: 'In ambiguous contexts, model errors are stereotype-aligned up to 77% of the time. Bias is often *stronger* in non-English prompts.',
    source: { url: 'https://arxiv.org/abs/2110.08193', publisher: 'BBQ paper' } },
  { id: 'ajl',       name: 'Algorithmic Justice League', who: 'nonprofit (Buolamwini)',     scope: 'bias',       funding: 'independent', size: 2,
    finding: 'Gender Shades (2018): darker-skinned women misclassified up to 34.7% vs 0.8% for lighter-skinned men.',
    source: { url: 'https://www.ajl.org', publisher: 'AJL' } },

  // LABOR / SOCIOTECHNICAL
  { id: 'ainow',     name: 'AI Now Institute',       who: 'nonprofit (Whittaker, Crawford)', scope: 'labor',     funding: 'independent', size: 3,
    finding: '2025 "Artificial Power" report: AI accountability has been captured by industry-friendly audits. Need accountability targeting business models.',
    source: { url: 'https://ainowinstitute.org', publisher: 'AI Now' } },
  { id: 'dair',      name: 'DAIR Institute',         who: 'nonprofit (Gebru)',               scope: 'labor',     funding: 'independent', size: 2,
    finding: 'Founded post-Google ouster. Focus on harms to marginalized groups; data-worker audit project across 9 countries.',
    source: { url: 'https://www.dair-institute.org', publisher: 'DAIR' } },
  { id: 'algwatch',  name: 'AlgorithmWatch',         who: 'nonprofit (EU)',                  scope: 'labor',     funding: 'independent', size: 2,
    finding: 'Berlin-based. EU public-sector ADM, GDPR/AI Act enforcement, platform algorithm audits.',
    source: { url: 'https://algorithmwatch.org', publisher: 'AlgorithmWatch' } },
];

const FUNDING_COLOR: Record<Funding, string> = {
  lab:         '#ef4444', // red — self-reported
  industry:    '#f97316', // orange — industry consortium
  government:  '#60a5fa', // blue — government
  'op-funded': '#a78bfa', // violet — Open Phil / EA-funded (independent-academic-but-lab-adjacent)
  independent: '#22c55e', // green — most adversarial / civil society
};

const FUNDING_LABEL: Record<Funding, string> = {
  lab:         'Frontier-lab self-report',
  industry:    'Industry consortium',
  government:  'Government',
  'op-funded': 'Open Phil-funded (academic / nonprofit)',
  independent: 'Independent civil society',
};

const SCOPE_LABEL: Record<Scope, string> = {
  capability: 'Capability',
  safety:     'Safety / red-teaming',
  bias:       'Bias / fairness',
  labor:      'Labor / sociotechnical',
  all:        'All',
};

// X axis = independence (1=lab self-report → 5=fully independent)
const FUNDING_X: Record<Funding, number> = {
  lab:         1,
  industry:    2,
  'op-funded': 3,
  government:  3.5,
  independent: 4.7,
};

// Y axis order: capability(top) → safety → bias → labor(bottom)
const SCOPE_Y: Record<Scope, number> = {
  capability: 1,
  safety:     2,
  bias:       3,
  labor:      4,
  all:        2.5,
};

export function TrackerMap() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = TRACKERS.find((t) => t.id === activeId);

  const W = 900;
  const H = 580;
  const PAD_L = 200;
  const PAD_R = 60;
  const PAD_T = 60;
  const PAD_B = 250;

  const xMin = 0.5, xMax = 5;
  const yMin = 0.5, yMax = 4.5;

  const sx = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R);
  const sy = (v: number) => PAD_T + ((v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  // Deterministic jitter per id so dots don't stack
  const jitter = (id: string, axis: 'x' | 'y') => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    if (axis === 'y') h ^= 0xdeadbeef;
    return ((Math.abs(h) % 100) / 100 - 0.5) * (axis === 'x' ? 0.35 : 0.55);
  };

  return (
    <figure className="bg-white/[0.02] border border-white/10 rounded-xl p-5 my-8">
      <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/40 mb-3">
        Who tracks AI — independence × scope
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] mb-3">
        {(Object.keys(FUNDING_LABEL) as Funding[]).map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 text-white/55">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: FUNDING_COLOR[f] }} />
            {FUNDING_LABEL[f]}
          </span>
        ))}
      </div>

      <WideSvgScroll>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Y axis labels (scope) */}
        {(Object.keys(SCOPE_LABEL) as Scope[]).filter((s) => s !== 'all').map((s) => {
          const y = sy(SCOPE_Y[s]);
          return (
            <g key={s}>
              <line x1={PAD_L - 8} x2={W - PAD_R} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
              <text x={PAD_L - 14} y={y + 4} fill={COLORS.text} fontSize={11} textAnchor="end" fontFamily="monospace" letterSpacing={1.5}>
                {SCOPE_LABEL[s]}
              </text>
            </g>
          );
        })}

        {/* X axis ticks (independence) */}
        {([
          { x: 1,   label: 'Lab self-report' },
          { x: 2,   label: 'Industry' },
          { x: 3,   label: 'Open Phil' },
          { x: 3.5, label: 'Government' },
          { x: 4.7, label: 'Adversarial' },
        ] as const).map((t) => {
          const x = sx(t.x);
          return (
            <g key={t.x}>
              <line x1={x} x2={x} y1={PAD_T - 8} y2={H - PAD_B + 4} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
              <text x={x} y={H - PAD_B + 22} fill={COLORS.textDim} fontSize={9.5} textAnchor="middle" fontFamily="monospace">
                {t.label}
              </text>
            </g>
          );
        })}

        {/* Axis arrows */}
        <text x={PAD_L - 14} y={PAD_T - 22} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="end" letterSpacing={1.5}>
          ↑ what they track
        </text>
        <text x={W - PAD_R} y={H - PAD_B + 38} fill={COLORS.textDim} fontSize={9} fontFamily="monospace" textAnchor="end" letterSpacing={1.5}>
          how independent →
        </text>

        {/* Nodes */}
        {TRACKERS.map((t, idx) => {
          const x = sx(FUNDING_X[t.funding] + jitter(t.id, 'x'));
          const y = sy(SCOPE_Y[t.scope] + jitter(t.id, 'y'));
          const r = 5 + t.size * 2;
          const isActive = t.id === activeId;
          const color = FUNDING_COLOR[t.funding];

          // Show always-visible label only for the biggest / most-cited orgs
          // OR the active node. The rest reveal on hover via native <title>.
          const showLabel = isActive || t.size >= 4;
          // Stagger label vertically (above vs below the dot) by parity
          const labelAbove = idx % 2 === 0;

          return (
            <g key={t.id} onClick={() => setActiveId(t.id === activeId ? null : t.id)} style={{ cursor: 'pointer' }}>
              <title>{t.name}</title>
              {isActive && (
                <circle cx={x} cy={y} r={r + 8} fill="none" stroke={color} strokeWidth={1} opacity={0.5}>
                  <animate attributeName="r" from={r + 4} to={r + 12} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={r + 8} fill="transparent" />
              <circle
                cx={x} cy={y} r={r}
                fill={color}
                fillOpacity={isActive ? 1 : 0.55}
                stroke={isActive ? 'white' : color}
                strokeWidth={isActive ? 1.5 : 1}
              />
              {showLabel && (
                <text
                  x={x}
                  y={labelAbove ? y - r - 5 : y + r + 12}
                  fill={isActive ? COLORS.text : COLORS.textSoft}
                  fontSize={9.5}
                  textAnchor="middle"
                  fontWeight={isActive ? 600 : 400}
                  style={{ pointerEvents: 'none' }}
                >
                  {t.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Detail panel */}
        <g transform={`translate(20, ${H - PAD_B + 60})`}>
          <rect
            x={0} y={0} width={W - 40} height={170}
            rx={8}
            fill="rgba(167,139,250,0.04)"
            stroke="rgba(167,139,250,0.30)"
            strokeWidth={1}
          />
          {active ? (
            <g>
              <text x={20} y={28} fill={COLORS.text} fontSize={15} fontWeight={500}>
                {active.name}
              </text>
              <g transform={`translate(20, 42)`}>
                <rect width={220} height={18} rx={9}
                  fill={`${FUNDING_COLOR[active.funding]}22`}
                  stroke={FUNDING_COLOR[active.funding]} strokeWidth={1} />
                <text x={110} y={12} fill={FUNDING_COLOR[active.funding]} fontSize={9} fontFamily="monospace" textAnchor="middle">
                  {FUNDING_LABEL[active.funding]}
                </text>
                <text x={230} y={12} fill={COLORS.textSoft} fontSize={10} fontStyle="italic">
                  {active.who}
                </text>
              </g>
              <foreignObject x={20} y={74} width={W - 80} height={70}>
                <div style={{ fontSize: 12, color: 'rgba(245,245,247,0.78)', lineHeight: 1.55, fontFamily: 'system-ui, sans-serif', fontStyle: 'italic' }}>
                  {active.finding}
                  {active.source && (
                    <div style={{ fontSize: 10.5, color: 'rgba(245,245,247,0.4)', fontFamily: 'monospace', fontStyle: 'normal', marginTop: 6 }}>
                      source ·{' '}
                      <a href={active.source.url} target="_blank" rel="noopener noreferrer"
                         style={{ color: 'rgba(245,245,247,0.55)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                        {active.source.publisher}
                      </a>
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          ) : (
            <text x={(W - 40) / 2} y={88} fill={COLORS.textDim} fontSize={11} textAnchor="middle" fontStyle="italic">
              Click any node to see what they track and what they have found.
            </text>
          )}
        </g>
      </svg>
      </WideSvgScroll>

      <figcaption className="text-xs text-white/60 leading-relaxed mt-4 px-1 max-w-3xl mx-auto">
        Position on the X axis is{' '}
        <strong style={{ color: COLORS.green }}>independence</strong> (left = self-reporting frontier labs;
        right = adversarial civil society). Position on Y is what the org{' '}
        <strong style={{ color: COLORS.text }}>actually measures</strong>. Node size is approximate operating budget.
        The visible asymmetry: the safety / capability layer is dominated by Open-Phil-funded
        academic and nonprofit orgs, plus government safety institutes; the labor / sociotechnical
        layer is held mostly by independent civil-society orgs operating on single-digit-million budgets.
        A common funder is not a conspiracy — it is a structural prior that shapes which questions get asked.
      </figcaption>
    </figure>
  );
}

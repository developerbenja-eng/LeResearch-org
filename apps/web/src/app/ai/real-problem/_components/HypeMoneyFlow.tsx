import { COLORS } from '@/components/teaching-svg/palette';
import { MoneyFlow, type FlowNode, type FlowEdge } from './MoneyFlow';

const SOURCES: FlowNode[] = [
  { id: 'hyperscaler', label: 'Hyperscaler capex',  sublabel: 'MSFT/GOOG/AMZN/META/ORCL · $680B 2026' },
  { id: 'sov',         label: 'Sovereign wealth',   sublabel: 'UAE MGX · Saudi PIF · $200B+ 2025' },
  { id: 'pension',     label: 'Pension / passive',  sublabel: 'Mag 7 = 33.7% of S&P 500' },
  { id: 'vc',          label: 'VC mega-rounds',     sublabel: '~$84B 2025 (a16z, Sequoia, Khosla)' },
];

const RECIPIENTS: FlowNode[] = [
  { id: 'nvidia',    label: 'NVIDIA',                   sublabel: '$215B FY26 revenue' },
  { id: 'openai',    label: 'OpenAI',                   sublabel: '$500B val · $660B compute' },
  { id: 'anthropic', label: 'Anthropic',                sublabel: '$380B val (April 2026)' },
  { id: 'defai',     label: 'Defense AI',               sublabel: 'Anduril $30B · Palantir · Helsing' },
  { id: 'consult',   label: 'Consultancies',            sublabel: 'Accenture $4.1B FY25 gen-AI' },
];

const OUTCOMES: FlowNode[] = [
  { id: 'stargate', label: 'Stargate / data center buildout', sublabel: '$500B White House announcement' },
  { id: 'plan',     label: 'Trump AI Action Plan',            sublabel: 'FTC stand-down · NIST de-fang' },
  { id: 'chips',    label: 'Chip exports unlocked',           sublabel: '500K NVIDIA / yr to UAE; KSA deal' },
  { id: 'eu',       label: 'EU AI Act delays',                sublabel: 'high-risk enforcement → Aug 2026' },
];

const FLOWS_S2R: FlowEdge[] = [
  // Hyperscalers buy chips, fund OpenAI/Anthropic, hire consultancies
  { from: 'hyperscaler', to: 'nvidia',    weight: 10 },
  { from: 'hyperscaler', to: 'openai',    weight: 8 },
  { from: 'hyperscaler', to: 'anthropic', weight: 8 },
  { from: 'hyperscaler', to: 'consult',   weight: 4 },
  // Sovereign wealth → labs + chips
  { from: 'sov',         to: 'openai',    weight: 5 },
  { from: 'sov',         to: 'anthropic', weight: 3 },
  { from: 'sov',         to: 'nvidia',    weight: 4 },
  // Passive pension exposure → NVIDIA + hyperscalers (forced via index weighting)
  { from: 'pension',     to: 'nvidia',    weight: 7 },
  // VC → labs + defense
  { from: 'vc',          to: 'openai',    weight: 4 },
  { from: 'vc',          to: 'anthropic', weight: 5 },
  { from: 'vc',          to: 'defai',     weight: 6 },
];

const FLOWS_R2O: FlowEdge[] = [
  // OpenAI is the operational lead on Stargate; hyperscalers bankroll the data centers
  { from: 'openai',    to: 'stargate', weight: 9 },
  { from: 'nvidia',    to: 'stargate', weight: 6 },
  // Hype + race rhetoric → Trump AI Action Plan deregulation
  { from: 'openai',    to: 'plan',     weight: 7 },
  { from: 'anthropic', to: 'plan',     weight: 4 },
  { from: 'consult',   to: 'plan',     weight: 3 },
  // Race rhetoric → chip exports to authoritarian states (the very thing controls existed to prevent)
  { from: 'nvidia',    to: 'chips',    weight: 8 },
  { from: 'openai',    to: 'chips',    weight: 5 },
  // Mistral-style + hyperscaler lobbying → EU AI Act softening
  { from: 'consult',   to: 'eu',       weight: 4 },
  { from: 'anthropic', to: 'eu',       weight: 3 },
  // Defense AI → policy normalization (Golden Dome etc)
  { from: 'defai',     to: 'plan',     weight: 5 },
];

export function HypeMoneyFlow() {
  return (
    <MoneyFlow
      title="Hype money flow — capital → orgs → policy"
      columnHeaders={['CAPITAL SOURCES', 'RECIPIENTS', 'POLICY OUTCOMES']}
      sources={SOURCES}
      recipients={RECIPIENTS}
      outcomes={OUTCOMES}
      flowsSourceToRecipient={FLOWS_S2R}
      flowsRecipientToOutcome={FLOWS_R2O}
      takeaway="Mirror of the doom flow. Same color, same mechanism — capital + policy alignment, not consolidation."
      figcaption={
        <>
          Compare against the doom diagram above —{' '}
          <strong style={{ color: COLORS.red }}>same color, same shape, same mechanism</strong>.
          The capital is two orders of magnitude larger ($680B 2026
          hyperscaler capex vs ~$1B cumulative doom-donor flow) but the
          structural pattern is identical: a small set of well-named
          actors, a small set of recipients, a small set of policy
          outcomes that materially shape what happens next. The pension /
          passive arrow is the most quietly important — anyone holding an
          S&amp;P 500 index is now structurally long the AI buildout
          regardless of whether they want to be.
        </>
      }
    />
  );
}

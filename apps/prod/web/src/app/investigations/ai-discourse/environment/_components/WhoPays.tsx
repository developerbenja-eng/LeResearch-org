import { COLORS } from '@/components/teaching-svg/palette';
import { MoneyFlow, type FlowNode, type FlowEdge } from '@/app/investigations/ai-discourse/real-problem/_components/MoneyFlow';

const SOURCES: FlowNode[] = [
  { id: 'capex',    label: 'Hyperscaler 2026 capex', sublabel: '~$680B · 75% AI-attributed' },
  { id: 'stargate', label: 'Stargate',                sublabel: '$500B / 10 GW announced' },
  { id: 'sov',      label: 'Sovereign wealth',        sublabel: 'UAE MGX · Saudi PIF · ~$200B+' },
  { id: 'vc',       label: 'VC mega-rounds',          sublabel: '~$84B in 2025' },
];

const RECIPIENTS: FlowNode[] = [
  { id: 'turbines', label: 'Gas turbine backlog',     sublabel: '80 GW to 2029 · 5–7 yr lead' },
  { id: 'nuclear',  label: 'Nuclear PPAs',            sublabel: 'TMI restart · Talen $18B · SMRs' },
  { id: 'grid',     label: 'Grid capacity / PJM',     sublabel: 'auction +833% YoY' },
  { id: 'water',    label: 'Data centers in stressed regions', sublabel: '2/3 of new builds since 2022' },
  { id: 'coal',     label: 'Coal retirements delayed', sublabel: 'GA / IN / WY paused' },
];

const OUTCOMES: FlowNode[] = [
  { id: 'equity',     label: 'Equity holders (first loss)',  sublabel: 'if AI demand undershoots' },
  { id: 'ratepayers', label: 'Ratepayers',                   sublabel: 'VA: +$11.24/mo residential' },
  { id: 'taxpayers',  label: 'Taxpayers',                    sublabel: 'DOE $1B TMI loan · $1.6B/yr abatements' },
  { id: 'pensions',   label: 'Pensioners (passive index)',   sublabel: 'Mag 7 = 33.7% of S&P 500' },
];

const FLOWS_S2R: FlowEdge[] = [
  { from: 'capex',    to: 'turbines', weight: 9 },
  { from: 'capex',    to: 'nuclear',  weight: 7 },
  { from: 'capex',    to: 'grid',     weight: 8 },
  { from: 'capex',    to: 'water',    weight: 7 },
  { from: 'stargate', to: 'turbines', weight: 6 },
  { from: 'stargate', to: 'grid',     weight: 5 },
  { from: 'stargate', to: 'water',    weight: 4 },
  { from: 'sov',      to: 'turbines', weight: 4 },
  { from: 'sov',      to: 'water',    weight: 3 },
  { from: 'vc',       to: 'water',    weight: 2 },
  { from: 'capex',    to: 'coal',     weight: 4 },
];

const FLOWS_R2O: FlowEdge[] = [
  // Equity holds first loss across the board
  { from: 'turbines', to: 'equity',     weight: 6 },
  { from: 'nuclear',  to: 'equity',     weight: 5 },
  { from: 'grid',     to: 'equity',     weight: 4 },
  // Ratepayers absorb grid + nuclear (guaranteed-return regulated utilities pass it on)
  { from: 'grid',     to: 'ratepayers', weight: 9 },
  { from: 'nuclear',  to: 'ratepayers', weight: 6 },
  { from: 'turbines', to: 'ratepayers', weight: 5 },
  // Taxpayers via DOE loans + abatements
  { from: 'nuclear',  to: 'taxpayers',  weight: 6 },
  { from: 'water',    to: 'taxpayers',  weight: 5 },
  { from: 'coal',     to: 'taxpayers',  weight: 4 },
  // Pensioners via index exposure to all of the above (NVIDIA / hyperscaler)
  { from: 'turbines', to: 'pensions',   weight: 4 },
  { from: 'grid',     to: 'pensions',   weight: 3 },
  { from: 'water',    to: 'pensions',   weight: 4 },
];

export function WhoPays() {
  return (
    <MoneyFlow
      title="Who pays — capital → infrastructure → loss surface"
      accent="amber"
      columnHeaders={['CAPITAL POURED IN', 'INFRASTRUCTURE MORTGAGED', 'WHO ABSORBS THE LOSS']}
      sources={SOURCES}
      recipients={RECIPIENTS}
      outcomes={OUTCOMES}
      flowsSourceToRecipient={FLOWS_S2R}
      flowsRecipientToOutcome={FLOWS_R2O}
      takeaway="Equity holders take the first loss. Ratepayers, taxpayers, and pensioners absorb the rest."
      figcaption={
        <>
          The visual structure mirrors the doom and hype money flows
          (Act IV) — same shape, different accent. Where those traced{' '}
          <strong style={{ color: COLORS.red }}>influence</strong>, this
          one traces{' '}
          <strong style={{ color: COLORS.amber }}>physical infrastructure mortgages</strong>{' '}
          and the people on the long-tail end of them. The contracts in
          the middle column run 14 years (Dominion GS-5), 17 years
          (Talen–Amazon Susquehanna), and 20 years (Microsoft–TMI) —
          past the credible visibility horizon for AI demand.
        </>
      }
    />
  );
}

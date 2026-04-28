import { COLORS } from '@/components/teaching-svg/palette';
import { MoneyFlow, type FlowNode, type FlowEdge } from './MoneyFlow';

const SOURCES: FlowNode[] = [
  { id: 'op',  label: 'Open Philanthropy',           sublabel: 'Tuna / Moskovitz · ~$336M' },
  { id: 'sff', label: 'Survival & Flourishing Fund', sublabel: 'Jaan Tallinn · ~$152M' },
  { id: 'fli', label: 'FLI / Buterin',               sublabel: '$665M SHIB · 2021' },
  { id: 'ftx', label: 'FTX Future Fund',             sublabel: 'collapsed Nov 2022' },
];

const RECIPIENTS: FlowNode[] = [
  { id: 'miri',      label: 'MIRI',                       sublabel: 'Yudkowsky' },
  { id: 'cais',      label: 'CAIS',                       sublabel: 'Hendrycks · $6.5M FTX' },
  { id: 'evals',     label: 'METR / Apollo / Redwood',    sublabel: 'evals layer · ~$20M' },
  { id: 'anthropic', label: 'Anthropic',                  sublabel: 'Series A: Tallinn lead' },
  { id: 'eainfra',   label: '80,000 Hours / EA infra',    sublabel: 'talent pipeline' },
];

const OUTCOMES: FlowNode[] = [
  { id: 'caisstate', label: 'CAIS extinction statement', sublabel: 'May 2023 · NYT cover' },
  { id: 'pause',     label: 'FLI "Pause" letter',        sublabel: 'March 2023' },
  { id: 'aisi',      label: 'AISI / Bletchley',          sublabel: 'UK + US + 28 countries' },
  { id: 'rsp',       label: 'Voluntary RSPs',            sublabel: 'Anthropic, OpenAI, GDM' },
];

const FLOWS_S2R: FlowEdge[] = [
  { from: 'op',  to: 'miri',      weight: 6 },
  { from: 'op',  to: 'cais',      weight: 4 },
  { from: 'op',  to: 'evals',     weight: 9 },
  { from: 'op',  to: 'anthropic', weight: 5 },
  { from: 'op',  to: 'eainfra',   weight: 7 },
  { from: 'sff', to: 'miri',      weight: 4 },
  { from: 'sff', to: 'evals',     weight: 4 },
  { from: 'sff', to: 'anthropic', weight: 8 },
  { from: 'fli', to: 'miri',      weight: 3 },
  { from: 'ftx', to: 'cais',      weight: 5 },
  { from: 'ftx', to: 'eainfra',   weight: 6 },
];

const FLOWS_R2O: FlowEdge[] = [
  { from: 'cais',      to: 'caisstate', weight: 9 },
  { from: 'miri',      to: 'pause',     weight: 4 },
  { from: 'cais',      to: 'pause',     weight: 4 },
  { from: 'eainfra',   to: 'aisi',      weight: 7 },
  { from: 'evals',     to: 'aisi',      weight: 6 },
  { from: 'anthropic', to: 'rsp',       weight: 9 },
  { from: 'evals',     to: 'rsp',       weight: 5 },
];

export function DoomMoneyFlow() {
  return (
    <MoneyFlow
      title="Doom money flow — donors → orgs → policy"
      columnHeaders={['DONORS', 'RECIPIENTS', 'POLICY OUTCOMES']}
      sources={SOURCES}
      recipients={RECIPIENTS}
      outcomes={OUTCOMES}
      flowsSourceToRecipient={FLOWS_S2R}
      flowsRecipientToOutcome={FLOWS_R2O}
      takeaway="Four donors. Five orgs. The policy frame the world is now governed by."
      figcaption={
        <>
          A handful of donors, a handful of recipient orgs, a handful of
          policy outcomes. The flows are documented in tax filings (990s),
          bankruptcy filings (FTX), EU transparency disclosures (FLI), and
          published grant databases.{' '}
          <strong style={{ color: COLORS.red }}>The diagram understates concentration</strong>{' '}
          — only the four largest donors are drawn; the long tail
          (Founders Pledge, Center for Emerging Risk Research, Schmidt
          Futures, others) overlaps the same recipients. Several minor
          policy filings are omitted for legibility.
        </>
      }
    />
  );
}

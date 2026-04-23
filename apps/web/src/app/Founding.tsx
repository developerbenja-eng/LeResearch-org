export default function Founding() {
  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
          Founding state
        </div>
        <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-8">
          Where we are right now.
        </h2>

        <div className="space-y-8">
          <StatusRow
            label="Legal formation"
            value="501(c)(3) in formation"
            detail="Charter drafted. Next steps: founding board, incorporation (state TBD), IRS Form 1023, fiscal sponsorship during the determination wait."
          />
          <StatusRow
            label="Sibling entity"
            value="LeDesign LLC (LeDesign.ai)"
            detail="The commercial home for the Le-family products — LeJustice, LeCivil, LeContain, LeMonitor, LePulse. Arms-length, competitively-sourced cross-contracts; principle 3.5 with an accountable address."
          />
          <StatusRow
            label="Openness commitments"
            value="MIT · Apache 2.0 · CC-BY 4.0 · CERN-OHL-S v2 · Open Access"
            detail="Every artifact produced under LeResearch grants ships open-licensed — software, AI components, data, hardware, publications. No paywalled, non-open, or proprietary outputs."
          />
          <StatusRow
            label="Governance"
            value="Small founding board, scientific-fit over fundraising-optics"
            detail="Written policy distinguishes substantive scientific disagreement (welcomed) from risk-averse veto (checked by the charter). Executive authority clearly delegated. Term limits force refresh."
          />
        </div>

        <div className="mt-16 p-6 bg-white/[0.02] border border-white/10 rounded-xl">
          <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-3">
            How to reach us
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            Pre-launch. If you&apos;re a potential collaborator, funder, or
            board candidate whose substantive work overlaps any of the
            tracks above, email{' '}
            <a
              href="mailto:hello@leresearch.org"
              className="text-white hover:text-[var(--accent)] transition-colors border-b border-white/20 hover:border-[var(--accent)] pb-[1px]"
            >
              hello@leresearch.org
            </a>
            . Everything substantive about how this was designed lives in
            public at{' '}
            <a
              href="https://github.com/developerbenja-eng/LeDesign-ai/tree/main/docs/leresearch-setup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[var(--accent)] transition-colors border-b border-white/20 hover:border-[var(--accent)] pb-[1px]"
            >
              the founding docs
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function StatusRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2 sm:gap-8 pb-8 border-b border-white/5 last:border-b-0">
      <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 sm:pt-1">
        {label}
      </div>
      <div>
        <div className="text-white/90 mb-2">{value}</div>
        <div className="text-sm leading-relaxed text-white/60">{detail}</div>
      </div>
    </div>
  );
}

import Link from 'next/link';

interface StalenessFooterProps {
  verifiedOn: string;
  earliestStaleness: string;
  primarySources: string[];
}

export function StalenessFooter({ verifiedOn, earliestStaleness, primarySources }: StalenessFooterProps) {
  return (
    <footer className="mt-24 pt-8 border-t border-white/5 max-w-3xl mx-auto px-6">
      <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">
        Maintenance
      </div>
      <p className="text-sm text-white/50 leading-relaxed mb-3">
        Last verified against{' '}
        {primarySources.map((s, i) => (
          <span key={s}>
            <span className="text-white/70">{s}</span>
            {i < primarySources.length - 2 ? ', ' : i === primarySources.length - 2 ? ', and ' : ''}
          </span>
        ))}{' '}
        on <span className="text-white/70 font-mono text-xs">{verifiedOn}</span>.
      </p>
      <p className="text-sm text-white/50 leading-relaxed">
        Earliest expected staleness: <span className="text-white/70">{earliestStaleness}</span>.
      </p>
      <p className="text-xs text-white/35 leading-relaxed mt-4">
        This investigation is treated as a living document. The claims marked{' '}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          stale
        </span>{' '}
        in the receipt cards above are the ones to re-check first.{' '}
        <Link href="/ai/methodology" className="text-white/55 hover:text-white underline decoration-dotted underline-offset-2">
          How this is maintained →
        </Link>
      </p>
    </footer>
  );
}

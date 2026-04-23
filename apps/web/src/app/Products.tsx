import { PRODUCTS, type Product } from '@/lib/content';

const FAMILY_LABEL: Record<Product['family'], string> = {
  echo: 'Echo-Family',
  rethinking: 'Research framework',
  'partner-gift': 'Partner gift-work',
};

const STATUS_PIP: Record<Product['status'], { label: string; className: string }> = {
  live:      { label: 'Live',      className: 'text-emerald-300' },
  migrating: { label: 'Migrating', className: 'text-amber-300' },
  draft:     { label: 'Draft',     className: 'text-white/40' },
};

export default function Products() {
  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
          Current initiatives
        </div>
        <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/90 mb-4">
          What LeResearch operates today.
        </h2>
        <p className="text-base leading-relaxed text-white/60 max-w-2xl mb-16">
          The Echo-family of narrative-first learning products, the
          Rethinking Education research framework that grounds them, and
          a gift-work platform for Protect Our Aquifer built on public
          data alone. Echo products are currently migrating their legal
          home from LeDesign LLC to LeResearch — URLs will transition as
          the nonprofit is stood up.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {PRODUCTS.map((p) => {
            const body = (
              <div className="bg-white/[0.02] border border-white/5 hover:border-white/15 rounded-xl p-6 h-full transition-colors">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-white/40">
                    {FAMILY_LABEL[p.family]}
                  </span>
                  <span className={`text-[10px] font-mono tracking-wider uppercase ${STATUS_PIP[p.status].className}`}>
                    ● {STATUS_PIP[p.status].label}
                  </span>
                </div>
                <h3 className="text-lg font-light text-white/90 mb-2">{p.name}</h3>
                <p className="text-sm leading-relaxed text-white/60">{p.blurb}</p>
                {p.url && (
                  <div className="mt-4 text-[11px] font-mono tracking-wider uppercase text-white/40 group-hover:text-white/70">
                    Visit ↗
                  </div>
                )}
              </div>
            );
            return p.url ? (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {body}
              </a>
            ) : (
              <div key={p.id}>{body}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

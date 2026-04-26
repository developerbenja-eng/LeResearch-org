import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About · LeResearch',
  description:
    'LeResearch is a 501(c)(3)-in-formation cross-disciplinary research organization. Companion to LeDesign, the commercial half. Open by default.',
  openGraph: {
    title: 'About · LeResearch',
    description: 'A 501(c)(3) in formation. Open by default.',
  },
};

export default function AboutPage() {
  return (
    <div className="px-6 pb-24">
      <header className="max-w-3xl mx-auto pt-24 pb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 hover:text-white mb-6 transition-colors"
        >
          ← LeResearch
        </Link>
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
          About
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
          A 501(c)(3) in formation. Open by default.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70">
          LeResearch is the cross-disciplinary research half of a two-org
          structure. <a href="https://ledesign.ai" target="_blank" rel="noopener noreferrer" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">LeDesign</a>{' '}
          ships the products commercially. LeResearch does the work that
          no product roadmap funds.
        </p>
      </header>

      <article className="max-w-3xl mx-auto space-y-12 text-white/75">
        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Why two organizations</h2>
          <p className="text-base leading-relaxed mb-3">
            The <Link href="/thesis" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">thesis</Link>{' '}
            argues that the frontend of learning and professional work has
            always been the constraint. LeDesign was built to ship those
            frontends commercially, in fields where proprietary silos have
            been pricing people out of their own tools. LeResearch is the
            other half — the research that asks whether the reframing
            holds under evidence, across domains where no product roadmap
            would fund the work.
          </p>
          <p className="text-base leading-relaxed">
            Two corporate forms because the answers we owe a customer and
            the answers we owe the public record are different answers,
            written under different incentives, with different review
            processes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Open by default</h2>
          <ul className="space-y-2 text-base leading-relaxed list-disc pl-6 marker:text-white/30">
            <li>Public data whenever it exists.</li>
            <li>Open-source licenses on software, hardware, content, and methodology.</li>
            <li>When we take nonprofit or foundation funding, the entire artifact stack becomes public good.</li>
            <li>When we work with private clients, the architectural patterns we learn still become public good.</li>
          </ul>
          <p className="text-sm text-white/55 leading-relaxed mt-3 italic">
            This is operational principle §9.5 from the thesis. It is
            also how we pay for the existence of LeResearch as a
            distinct entity from LeDesign.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Governance posture</h2>
          <p className="text-base leading-relaxed mb-3">
            A governance split — board authority vs. executive authority
            vs. research authority — that makes substantive analysis the
            default behavior rather than a thing that has to be insisted
            on under pressure. <Link href="/thesis#mirror-failure" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">§7 of the thesis (the mirror failure)</Link>{' '}
            names the pathology this guards against, including when it
            shows up inside our own organization.
          </p>
          <p className="text-base leading-relaxed">
            The 501(c)(3) is in formation. Board composition, IRS filing,
            and bylaws will be published here when they finalize.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Where to dig in</h2>
          <ul className="space-y-2 text-base leading-relaxed list-none pl-0">
            <li>·{' '}<Link href="/thesis" className="text-white/85 hover:text-white underline decoration-white/30 underline-offset-4">/thesis</Link>{' '}— the substantive 14-section argument</li>
            <li>·{' '}<Link href="/cases" className="text-white/85 hover:text-white underline decoration-white/30 underline-offset-4">/cases</Link>{' '}— documented cases that triangulate the framework against the public record</li>
            <li>·{' '}<Link href="/threads" className="text-white/85 hover:text-white underline decoration-white/30 underline-offset-4">/threads</Link>{' '}— the literature behind each section, opened thread by thread</li>
            <li>·{' '}<Link href="/investigations" className="text-white/85 hover:text-white underline decoration-white/30 underline-offset-4">/investigations</Link>{' '}— multi-act investigations applying the framework to a substrate at depth</li>
            <li>·{' '}<Link href="/initiatives" className="text-white/85 hover:text-white underline decoration-white/30 underline-offset-4">/initiatives</Link>{' '}— the operational portfolio (Echo-family products, POA, the Rethinking framework)</li>
            <li>·{' '}<Link href="/tracks" className="text-white/85 hover:text-white underline decoration-white/30 underline-offset-4">/tracks</Link>{' '}— the five substrates we work on</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-light text-white/90 mb-3">Reach us</h2>
          <p className="text-base leading-relaxed">
            The repository is{' '}
            <a href="https://github.com/developerbenja-eng/LeResearch-org" target="_blank" rel="noopener noreferrer" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">on GitHub</a>{' '}
            (issues are open). LeDesign at{' '}
            <a href="https://ledesign.ai" target="_blank" rel="noopener noreferrer" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">ledesign.ai</a>.
          </p>
        </section>
      </article>
    </div>
  );
}

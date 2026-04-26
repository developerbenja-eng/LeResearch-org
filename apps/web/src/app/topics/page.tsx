import type { Metadata } from 'next';
import Link from 'next/link';
import { allTopics, routesByTopic, TOPIC_LABEL, TOPIC_HINT } from '@/components/site/route-registry';

export const metadata: Metadata = {
  title: 'Topics · LeResearch',
  description:
    'Cross-cutting topics that span the thesis, the investigations, the cases, and the open threads. Browse the back catalog along the conceptual axis instead of the section axis.',
  openGraph: {
    title: 'LeResearch · Topics',
    description: 'Browse the back catalog by concept.',
  },
};

export default function TopicsIndexPage() {
  const topics = allTopics();
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
          Topics · the conceptual axis
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-6">
          Browse by concept, not by section.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70">
          Topics are the cross-cutting concepts the work returns to —{' '}
          <em className="text-white/85 not-italic font-normal">capacity</em>,{' '}
          <em className="text-white/85 not-italic font-normal">labor</em>,{' '}
          <em className="text-white/85 not-italic font-normal">discourse displacement</em>,{' '}
          <em className="text-white/85 not-italic font-normal">surveillance</em>, and so on.
          Each topic page lists every thesis section, thread, case, and
          investigation page that touches it. The other browsing axis is{' '}
          <Link href="/tracks" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
            tracks
          </Link>{' '}
          — the substrates we work on.
        </p>
      </header>

      <section className="max-w-3xl mx-auto">
        <ul className="space-y-3">
          {topics.map((t) => {
            const count = routesByTopic(t).length;
            return (
              <li key={t}>
                <Link
                  href={`/topics/${t}`}
                  className="group block rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <h2 className="text-lg font-light text-white/90 group-hover:text-white">
                      {TOPIC_LABEL[t]}
                    </h2>
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30 shrink-0">
                      {count} {count === 1 ? 'page' : 'pages'}
                    </span>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed italic">{TOPIC_HINT[t]}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

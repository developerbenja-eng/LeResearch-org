import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  allTopics,
  routesByTopic,
  TOPIC_LABEL,
  TOPIC_HINT,
  type Topic,
} from '@/components/site/route-registry';

interface Params { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  return allTopics().map((t) => ({ slug: t }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!allTopics().includes(slug as Topic)) return {};
  const label = TOPIC_LABEL[slug as Topic];
  return {
    title: `${label} · Topics · LeResearch`,
    description: `Every page on leresearch.org tagged with ${label}. ${TOPIC_HINT[slug as Topic]}`,
  };
}

export default async function TopicPage({ params }: Params) {
  const { slug } = await params;
  if (!allTopics().includes(slug as Topic)) notFound();
  const topic = slug as Topic;
  const pages = routesByTopic(topic);

  return (
    <div className="px-6 pb-24">
      <header className="max-w-3xl mx-auto pt-24 pb-10">
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
          <Link href="/" className="hover:text-white transition-colors">LeResearch</Link>
          <span className="text-white/20">/</span>
          <Link href="/topics" className="hover:text-white transition-colors">Topics</Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70">{TOPIC_LABEL[topic]}</span>
        </div>
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
          Topic · the conceptual axis
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-4">
          {TOPIC_LABEL[topic]}
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-white/70 italic">
          {TOPIC_HINT[topic]}
        </p>
      </header>

      <section className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-5">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'} touch this topic
        </div>
        <ul className="space-y-3">
          {pages.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="group block rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-3">
                  <span className="text-base text-white/90 group-hover:text-white leading-snug">
                    {p.title}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30 sm:shrink-0 break-all sm:break-normal">
                    {p.href}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-white/45 leading-relaxed mt-10 italic">
          Pages tag themselves in the route registry. Adding the topic to a
          page&apos;s registry entry makes it appear here automatically.
        </p>
      </section>
    </div>
  );
}

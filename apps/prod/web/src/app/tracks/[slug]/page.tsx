import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  routesByTrack,
  TRACK_LABEL,
  type TrackId,
} from '@/components/site/route-registry';

const TRACK_IDS = Object.keys(TRACK_LABEL) as TrackId[];
const isTrack = (s: string): s is TrackId => (TRACK_IDS as readonly string[]).includes(s);
import { TRACKS } from '@/lib/content';

interface Params { params: Promise<{ slug: string }>; }

/** Map our compact track ids → the existing TRACKS entries from lib/content */
const TRACK_TO_DATA: Record<TrackId, string> = {
  aquifers:    '01',
  food:        '02',
  learning:    '03',
  ai:          '04',
  methodology: '05',
};

export async function generateStaticParams() {
  return TRACK_IDS.map((t) => ({ slug: t }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!isTrack(slug)) return {};
  const label = TRACK_LABEL[slug];
  return {
    title: `${label} · Tracks · LeResearch`,
    description: `Every page on leresearch.org tagged with the ${label} substrate.`,
  };
}

export default async function TrackPage({ params }: Params) {
  const { slug } = await params;
  if (!isTrack(slug)) notFound();
  const track = slug;
  const pages = routesByTrack(track);
  const num = TRACK_TO_DATA[track];
  const data = TRACKS.find((t) => t.num === num);

  return (
    <div className="px-6 pb-24">
      <header className="max-w-3xl mx-auto pt-24 pb-10">
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-6">
          <Link href="/" className="hover:text-white transition-colors">LeResearch</Link>
          <span className="text-white/20">/</span>
          <Link href="/tracks" className="hover:text-white transition-colors">Tracks</Link>
          <span className="text-white/20">/</span>
          <span className="text-white/70">{TRACK_LABEL[track]}</span>
        </div>
        <div className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/40 mb-4">
          Track {num} · the substrate axis
        </div>
        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-white/90 leading-[1.08] mb-4">
          {data?.name ?? TRACK_LABEL[track]}
        </h1>
        {data?.blurb && (
          <p className="text-base sm:text-lg leading-relaxed text-white/70 italic mb-3">
            {data.blurb}
          </p>
        )}
        {data?.detail && (
          <p className="text-sm leading-relaxed text-white/55">
            {data.detail}
          </p>
        )}
      </header>

      <section className="max-w-3xl mx-auto">
        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-5">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'} in this track
        </div>
        {pages.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-sm text-white/55 leading-relaxed italic">
              No pages tagged into this track yet. The track is on the
              roadmap; as work lands, it will appear here automatically.
            </p>
          </div>
        ) : (
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
        )}

        <p className="text-sm text-white/45 leading-relaxed mt-10 italic">
          Browse the conceptual axis at{' '}
          <Link href="/topics" className="text-white/70 hover:text-white underline decoration-dotted underline-offset-2">
            /topics
          </Link>.
        </p>
      </section>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  loadAllSpecies,
  getSpeciesBySlug,
  getSpeciesByIds,
} from '@/lib/loadSpecies';
import { currentMonth1Based } from '@/lib/queries';
import { HOTSPOTS } from '@/lib/hotspots';
import { STATUS_LABELS } from '@/lib/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { StatusChip } from '@/components/StatusChip';
import { SizeComparison } from '@/components/SizeComparison';
import { MonthStrip } from '@/components/MonthStrip';
import { SpeciesCard } from '@/components/SpeciesCard';
import { LifelistToggle } from '@/components/LifelistToggle';
import { WikiImage } from '@/components/WikiImage';
import { RecentSightings } from '@/components/RecentSightings';
import { MigrationMap } from '@/components/MigrationMap';
import { AudioCredit } from '@/components/AudioCredit';
import { getMigrationFor } from '@/lib/migration';
import { getConservationFor, CONSERVATION_LABELS } from '@/lib/conservation';
import { RedditPostsCompact } from '@/components/RedditPosts';

export async function generateStaticParams() {
  return loadAllSpecies().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const species = getSpeciesBySlug(slug);
  if (!species) return { title: 'Bird not found' };
  return {
    title: `${species.commonName} — Memphis Birds`,
    description: `${species.commonName} (${species.scientificName}) — ${STATUS_LABELS[species.status].long} in Memphis.`,
  };
}

export default async function SpeciesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const species = getSpeciesBySlug(slug);
  if (!species) notFound();

  const similar = getSpeciesByIds(species.similarSpecies);
  const currentMonth = currentMonth1Based();
  const hotspots = HOTSPOTS.filter((h) => species.memphisHotspots.includes(h.id));
  const migration = getMigrationFor(species.id);
  const conservation = getConservationFor(species.id);
  const conservationMeta = CONSERVATION_LABELS[conservation];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Back link */}
      <div className="px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors py-2 pr-2"
        >
          <ArrowLeft className="w-4 h-4" /> Birds
        </Link>
      </div>

      {/* Hero */}
      <header className="relative mt-4 mx-4 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 min-h-[280px] md:min-h-[380px]">
        {species.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={species.photoUrl}
            alt={species.commonName}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : (
          <WikiImage
            scientificName={species.scientificName}
            commonName={species.commonName}
            alt={species.commonName}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            useThumbnail={false}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10 min-h-[280px] md:min-h-[380px]">
          <div className="flex items-center gap-2 mb-3">
            <StatusChip status={species.status} size="md" />
            <span className="text-xs uppercase tracking-wider text-slate-400">
              {species.abundance}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            {species.commonName}
          </h1>
          <p className="text-sm md:text-base italic text-slate-300 mt-1">
            {species.scientificName}
          </p>
          {species.aliases.length > 0 && (
            <p className="mt-2 text-sm md:text-base text-amber-300/90">
              {species.aliases.map((a) => `"${a}"`).join('  ·  ')}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <AudioPlayer
              url={species.audioSongUrl}
              label="Song"
              scientificName={species.scientificName}
              xcType="song"
            />
            <AudioPlayer
              url={species.audioCallUrl}
              label="Call"
              scientificName={species.scientificName}
              xcType="call"
            />
          </div>
          <AudioCredit scientificName={species.scientificName} type="song" />
        </div>
      </header>

      {/* Body grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        {/* Main column */}
        <div className="md:col-span-2 space-y-4">
          {/* When */}
          <Panel title="When in Memphis">
            <MonthStrip
              memphisMonths={species.memphisMonths}
              peakMonths={species.peakMonths}
              currentMonth={currentMonth}
            />
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <LegendSwatch className="bg-sky-500/10" label="Present" />
              <LegendSwatch className="bg-sky-500/30" label="Peak" />
              <LegendSwatch className="bg-amber-500/20 ring-1 ring-amber-400/60" label="Now" />
            </div>
          </Panel>

          {/* Migration map (migratory species only) */}
          {migration && (
            <Panel title="Migration">
              <MigrationMap
                migration={migration}
                speciesName={species.commonName}
                status={species.status}
                height={260}
              />
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {migration.wintersIn && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300 mb-0.5">
                      Winters in
                    </div>
                    <div className="text-slate-300">{migration.wintersIn}</div>
                  </div>
                )}
                {migration.breedsIn && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-0.5">
                      Breeds in
                    </div>
                    <div className="text-slate-300">{migration.breedsIn}</div>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Story content */}
          <Panel>
            <div className="birds-prose">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mt-6 mb-3 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300 border-b border-slate-800 pb-2 mt-6 mb-3 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-amber-300 mt-5 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed my-3">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-slate-400">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-5 my-3 space-y-1 text-sm md:text-base text-slate-300">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => <li className="pl-1">{children}</li>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-sky-300 hover:text-sky-200 underline underline-offset-2">
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-amber-400/50 pl-4 my-4 italic text-slate-300">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {species.contentMarkdown}
              </ReactMarkdown>
            </div>
          </Panel>
        </div>

        {/* Side column */}
        <aside className="space-y-4">
          <SizeComparison
            sizeInches={species.sizeInches}
            sizeReference={species.sizeReference}
          />

          {species.habitats.length > 0 && (
            <Panel title="Habitat">
              <div className="flex flex-wrap gap-1.5">
                {species.habitats.map((h) => (
                  <span
                    key={h}
                    className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200"
                  >
                    {h.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </Panel>
          )}

          {hotspots.length > 0 && (
            <Panel title="Where to find it">
              <ul className="space-y-2">
                {hotspots.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/spots/${h.slug}`}
                      className="flex items-start gap-2 text-sm text-slate-300 hover:text-sky-300 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>
                        <div className="font-medium">{h.name}</div>
                        <div className="text-xs text-slate-400">{h.neighborhood}</div>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {species.diet.length > 0 && (
            <Panel title="Eats">
              <p className="text-sm text-slate-300">
                {species.diet.map((d) => d.replace(/-/g, ' ')).join(' · ')}
              </p>
            </Panel>
          )}

          {conservation !== 'stable' && (
            <div
              className={`rounded-xl border p-3 ${conservationMeta.color}`}
              title={conservationMeta.description}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70 mb-0.5">
                Conservation
              </div>
              <div className="text-sm font-semibold">{conservationMeta.label}</div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {conservationMeta.description}
              </div>
            </div>
          )}

          <LifelistToggle speciesId={species.id} commonName={species.commonName} />

          <Panel title="Reddit says...">
            <RedditPostsCompact birdName={species.commonName} limit={4} />
          </Panel>

          <RecentSightings
            region="US-TN-157"
            back={14}
            limit={5}
            title="Spotted nearby"
          />
        </aside>
      </div>

      {/* Similar species */}
      {similar.length > 0 && (
        <section className="mt-10 px-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">
            Similar birds
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {similar.map((s) => (
              <SpeciesCard key={s.slug} species={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      {title && (
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded ${className}`} />
      <span>{label}</span>
    </div>
  );
}

import Link from 'next/link';
import { Metadata } from 'next';
import { Compass, Volume2, MapPin, BookOpen, CheckSquare, Brain, Search, CalendarDays, Globe, Laugh } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { inMemphisNow, currentMonth1Based, getCounts } from '@/lib/queries';
import { MONTH_NAMES } from '@/lib/types';
import { YearWheelResponsive } from '@/components/YearWheelResponsive';
import { HereNowStrip } from '@/components/HereNowStrip';
import { MigrationRibbon } from '@/components/MigrationRibbon';
import { DailyFlywayReport } from '@/components/DailyFlywayReport';

export const metadata: Metadata = {
  title: 'Memphis Birds — Echo',
  description:
    'The Mississippi Flyway from your backyard. Year-wheel, sounds, stories, and spots for every bird of the Memphis region.',
};

export const dynamic = 'force-dynamic';

const EXPLORE_TILES = [
  {
    href: '/here-now',
    label: 'Here Now',
    icon: Compass,
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
  {
    href: '/find',
    label: 'Quick ID',
    icon: Search,
    gradient: 'from-sky-500/20 to-sky-600/5',
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: CalendarDays,
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
  {
    href: '/sounds',
    label: 'Sounds',
    icon: Volume2,
    gradient: 'from-sky-500/20 to-sky-600/5',
  },
  {
    href: '/spots',
    label: 'Spots',
    icon: MapPin,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    href: '/migrations',
    label: 'Where They Go',
    icon: Globe,
    gradient: 'from-violet-500/20 to-violet-600/5',
  },
  {
    href: '/funny',
    label: 'Reddit Says',
    icon: Laugh,
    gradient: 'from-orange-500/20 to-orange-600/5',
  },
  {
    href: '/stories',
    label: 'Stories',
    icon: BookOpen,
    gradient: 'from-violet-500/20 to-violet-600/5',
  },
  {
    href: '/quiz',
    label: 'Quiz',
    icon: Brain,
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
  {
    href: '/lifelist',
    label: 'My List',
    icon: CheckSquare,
    gradient: 'from-rose-500/20 to-rose-600/5',
  },
];

export default async function BirdsLandingPage() {
  const allSpecies = loadAllSpecies();
  const nowSpecies = inMemphisNow();
  const currentMonth = currentMonth1Based();
  const counts = getCounts();

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-14">
      <header className="text-center px-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
          Echo / Learn
        </p>
        <h1 className="mt-2 text-4xl md:text-6xl font-bold text-white">Memphis Birds</h1>
        <p className="mt-3 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          The Mississippi Flyway from your backyard.
        </p>
      </header>

      <div className="mt-10 md:mt-14 flex justify-center px-2">
        <YearWheelResponsive species={allSpecies} currentMonth={currentMonth} />
      </div>

      <section className="mt-10 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto px-4">
        <Stat label="Species" value={counts.total} color="text-sky-300" />
        <Stat label="Year-round" value={counts.yearRound} color="text-emerald-300" />
        <Stat label="Summer" value={counts.summerBreeder} color="text-amber-300" />
        <Stat label="Winter" value={counts.winterVisitor} color="text-sky-300" />
      </section>

      <HereNowStrip
        species={nowSpecies}
        monthName={MONTH_NAMES[currentMonth - 1]}
        limit={8}
      />

      <div className="mt-12 md:mt-16 px-4 md:px-0">
        <DailyFlywayReport species={allSpecies} currentMonth={currentMonth} />
      </div>

      <div className="mt-12 md:mt-16 px-4 md:px-0">
        <MigrationRibbon species={allSpecies} currentMonth={currentMonth} />
      </div>

      <section className="mt-14 md:mt-20 px-4 md:px-0">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">
          Explore
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EXPLORE_TILES.map(({ href, label, icon: Icon, gradient }) => (
            <Link
              key={href}
              href={href}
              className={`group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br ${gradient} p-5 hover:border-slate-500 transition-all hover:-translate-y-0.5`}
            >
              <Icon className="w-6 h-6 text-slate-200 mb-3" />
              <div className="text-base font-semibold text-white">{label}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-20 mb-10 text-center text-sm text-slate-400 px-4">
        Memphis sits on the Mississippi Flyway — one of four great migration corridors of North
        America. Every spring and fall, hundreds of species funnel through.
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

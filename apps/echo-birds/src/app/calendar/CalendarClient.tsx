'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Species, BirdStatus } from '@/lib/types';
import { MONTH_NAMES, STATUS_LABELS } from '@/lib/types';
import {
  getWeekPresence,
  getWeekPeak,
  currentWeekOfYear,
  weekGridMonthLabels,
} from '@/lib/weeks';

type StatusFilter = 'all' | BirdStatus;
type Granularity = 'month' | 'week';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'year-round', label: 'Year-round' },
  { value: 'summer-breeder', label: 'Summer' },
  { value: 'winter-visitor', label: 'Winter' },
  { value: 'migrant-pass-through', label: 'Migrants' },
];

const STATUS_HEAT: Record<BirdStatus, { present: string; peak: string }> = {
  'year-round': {
    present: 'bg-emerald-500/25',
    peak: 'bg-emerald-400/80',
  },
  'summer-breeder': {
    present: 'bg-amber-500/25',
    peak: 'bg-amber-400/80',
  },
  'winter-visitor': {
    present: 'bg-sky-500/25',
    peak: 'bg-sky-400/80',
  },
  'migrant-pass-through': {
    present: 'bg-violet-500/25',
    peak: 'bg-violet-400/80',
  },
  rare: {
    present: 'bg-rose-500/25',
    peak: 'bg-rose-400/80',
  },
};

export function CalendarClient({ species }: { species: Species[] }) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [granularity, setGranularity] = useState<Granularity>('month');
  const currentMonth = new Date().getMonth() + 1;
  const currentWeek = currentWeekOfYear();

  const filtered = useMemo(() => {
    const arr =
      filter === 'all' ? species : species.filter((s) => s.status === filter);
    return arr.slice().sort((a, b) => {
      const aStart = a.memphisMonths[0] ?? 1;
      const bStart = b.memphisMonths[0] ?? 1;
      if (aStart !== bStart) return aStart - bStart;
      return a.commonName.localeCompare(b.commonName);
    });
  }, [species, filter]);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center flex-wrap gap-1 mb-4 text-xs">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === opt.value
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="mx-3 w-px h-4 bg-slate-700" />
        <div className="inline-flex rounded-md border border-slate-700 overflow-hidden">
          {(['month', 'week'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={`px-2.5 py-1 font-medium transition-colors ${
                granularity === g
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {g === 'month' ? 'Monthly' : 'Weekly'}
            </button>
          ))}
        </div>
        <span className="ml-auto text-slate-400">{filtered.length} species</span>
      </div>

      {/* Calendar grid */}
      {granularity === 'month' ? (
        <MonthGrid
          species={filtered}
          currentMonth={currentMonth}
        />
      ) : (
        <WeekGrid
          species={filtered}
          currentWeek={currentWeek}
        />
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] text-slate-400">
        <LegendPair
          label="Year-round"
          peakClass={STATUS_HEAT['year-round'].peak}
          presentClass={STATUS_HEAT['year-round'].present}
        />
        <LegendPair
          label="Summer"
          peakClass={STATUS_HEAT['summer-breeder'].peak}
          presentClass={STATUS_HEAT['summer-breeder'].present}
        />
        <LegendPair
          label="Winter"
          peakClass={STATUS_HEAT['winter-visitor'].peak}
          presentClass={STATUS_HEAT['winter-visitor'].present}
        />
        <LegendPair
          label="Migrants"
          peakClass={STATUS_HEAT['migrant-pass-through'].peak}
          presentClass={STATUS_HEAT['migrant-pass-through'].present}
        />
        <div className="flex items-center gap-1.5 ml-2">
          <span className="w-4 h-4 ring-1 ring-amber-400/60 bg-amber-400/10 rounded-sm" />
          <span>{granularity === 'month' ? 'This month' : 'This week'}</span>
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  species,
  currentMonth,
}: {
  species: Species[];
  currentMonth: number;
}) {
  return (
    <div className="relative overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
          <tr>
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[180px] sticky left-0 bg-slate-900/95 z-20">
              Species
            </th>
            {MONTH_NAMES.map((m, i) => {
              const isCurrent = i + 1 === currentMonth;
              return (
                <th
                  key={m}
                  className={`px-0 py-2 text-center text-[10px] font-bold uppercase tracking-wider min-w-[52px] ${
                    isCurrent ? 'text-amber-300 bg-amber-500/10' : 'text-slate-400'
                  }`}
                >
                  {m}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {species.map((s) => {
            const heat = STATUS_HEAT[s.status];
            return (
              <tr
                key={s.slug}
                className="border-t border-slate-800/60 hover:bg-slate-800/30"
              >
                <td className="px-3 py-1.5 sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10 border-r border-slate-800/60">
                  <Link
                    href={`/${s.slug}`}
                    className="flex items-center gap-2 group"
                  >
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide shrink-0 ${STATUS_LABELS[s.status].color}`}
                      title={STATUS_LABELS[s.status].long}
                    >
                      {STATUS_LABELS[s.status].short}
                    </span>
                    <span className="text-xs text-slate-200 group-hover:text-white truncate">
                      {s.commonName}
                    </span>
                  </Link>
                </td>
                {MONTH_NAMES.map((_, i) => {
                  const month = i + 1;
                  const isPresent = s.memphisMonths.includes(month);
                  const isPeak = s.peakMonths.includes(month);
                  const isCurrent = month === currentMonth;
                  let cellClass = 'bg-slate-950/40';
                  if (isPeak) cellClass = heat.peak;
                  else if (isPresent) cellClass = heat.present;
                  return (
                    <td
                      key={month}
                      className={`relative p-0 h-8 ${cellClass} ${
                        isCurrent ? 'ring-1 ring-inset ring-amber-400/40' : ''
                      }`}
                      title={`${s.commonName} · ${MONTH_NAMES[i]}${
                        isPeak ? ' (peak)' : isPresent ? ' (present)' : ''
                      }`}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WeekGrid({
  species,
  currentWeek,
}: {
  species: Species[];
  currentWeek: number;
}) {
  const monthLabels = weekGridMonthLabels();
  return (
    <div className="relative overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
          <tr>
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[180px] sticky left-0 bg-slate-900/95 z-20">
              Species
            </th>
            {monthLabels.map(({ month, startWeek, endWeek }) => {
              const span = endWeek - startWeek + 1;
              const containsCurrent =
                currentWeek >= startWeek && currentWeek <= endWeek;
              return (
                <th
                  key={month}
                  colSpan={span}
                  className={`px-0 py-2 text-center text-[10px] font-bold uppercase tracking-wider border-l border-slate-800 ${
                    containsCurrent
                      ? 'text-amber-300 bg-amber-500/10'
                      : 'text-slate-400'
                  }`}
                >
                  {MONTH_NAMES[month - 1]}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {species.map((s) => {
            const heat = STATUS_HEAT[s.status];
            const presence = getWeekPresence(s);
            const peak = getWeekPeak(s);
            return (
              <tr
                key={s.slug}
                className="border-t border-slate-800/60 hover:bg-slate-800/30"
              >
                <td className="px-3 py-1.5 sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10 border-r border-slate-800/60 w-[180px] min-w-[180px]">
                  <Link
                    href={`/${s.slug}`}
                    className="flex items-center gap-2 group"
                  >
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide shrink-0 ${STATUS_LABELS[s.status].color}`}
                      title={STATUS_LABELS[s.status].long}
                    >
                      {STATUS_LABELS[s.status].short}
                    </span>
                    <span className="text-xs text-slate-200 group-hover:text-white truncate">
                      {s.commonName}
                    </span>
                  </Link>
                </td>
                {presence.map((present, idx) => {
                  const weekNum = idx + 1;
                  const isPeak = peak[idx];
                  const isCurrent = weekNum === currentWeek;
                  const isMonthStart = monthLabels.some(
                    (m) => m.startWeek === weekNum,
                  );
                  let cellClass = 'bg-slate-950/40';
                  if (isPeak) cellClass = heat.peak;
                  else if (present) cellClass = heat.present;
                  return (
                    <td
                      key={weekNum}
                      className={`p-0 w-[9px] h-7 ${cellClass} ${
                        isCurrent ? 'ring-1 ring-inset ring-amber-400/70' : ''
                      } ${isMonthStart ? 'border-l border-slate-800/60' : ''}`}
                      title={`${s.commonName} · week ${weekNum}${
                        isPeak ? ' (peak)' : present ? ' (present)' : ''
                      }`}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LegendPair({
  label,
  peakClass,
  presentClass,
}: {
  label: string;
  peakClass: string;
  presentClass: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex overflow-hidden rounded-sm">
        <span className={`w-4 h-4 ${presentClass}`} />
        <span className={`w-4 h-4 ${peakClass}`} />
      </div>
      <span>{label}</span>
    </div>
  );
}

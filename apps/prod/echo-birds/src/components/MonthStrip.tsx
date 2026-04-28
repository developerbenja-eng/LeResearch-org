import { MONTH_NAMES } from '@/lib/types';

/** Horizontal 12-month strip showing when a species is in Memphis. */
export function MonthStrip({
  memphisMonths,
  peakMonths = [],
  currentMonth,
}: {
  memphisMonths: number[];
  peakMonths?: number[];
  currentMonth?: number;
}) {
  return (
    <div className="grid grid-cols-12 gap-0.5 md:gap-1">
      {MONTH_NAMES.map((name, i) => {
        const month = i + 1;
        const isHere = memphisMonths.includes(month);
        const isPeak = peakMonths.includes(month);
        const isNow = currentMonth === month;
        return (
          <div
            key={month}
            className={`flex flex-col items-center py-1.5 rounded ${
              isNow
                ? 'bg-amber-500/20 ring-1 ring-amber-400/60'
                : isPeak
                ? 'bg-sky-500/30'
                : isHere
                ? 'bg-sky-500/10'
                : 'bg-slate-800/40'
            }`}
          >
            <span
              className={`text-[10px] font-semibold uppercase ${
                isNow
                  ? 'text-amber-300'
                  : isHere
                  ? 'text-sky-300'
                  : 'text-slate-400'
              }`}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

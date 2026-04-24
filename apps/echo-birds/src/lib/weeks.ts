import type { Species } from './types';

/**
 * Helpers to derive week-level (1-52) presence + peak data for a species
 * from the month-level data in frontmatter, using arrivalWeek/departureWeek
 * where available.
 */

const WEEKS = 52;

/** First week of each month (1-indexed), approximate */
const MONTH_START_WEEK: Record<number, number> = {
  1: 1, 2: 5, 3: 9, 4: 14, 5: 18, 6: 23,
  7: 27, 8: 31, 9: 36, 10: 40, 11: 44, 12: 49,
};
/** Last week of each month (inclusive), approximate */
const MONTH_END_WEEK: Record<number, number> = {
  1: 4, 2: 8, 3: 13, 4: 17, 5: 22, 6: 26,
  7: 30, 8: 35, 9: 39, 10: 43, 11: 48, 12: 52,
};

/** Returns a boolean array of length 52: true where the species is present */
export function getWeekPresence(species: Species): boolean[] {
  const arr = new Array<boolean>(WEEKS).fill(false);

  // If we have arrivalWeek/departureWeek, use them precisely (for migrants / seasonal)
  if (species.arrivalWeek != null && species.departureWeek != null) {
    fillRange(arr, species.arrivalWeek, species.departureWeek);
    return arr;
  }

  // Otherwise derive from memphisMonths
  for (const m of species.memphisMonths) {
    const start = MONTH_START_WEEK[m] ?? 1;
    const end = MONTH_END_WEEK[m] ?? 52;
    for (let w = start; w <= end; w++) arr[w - 1] = true;
  }
  return arr;
}

/** Returns a boolean array of length 52: true where the species is at peak */
export function getWeekPeak(species: Species): boolean[] {
  const arr = new Array<boolean>(WEEKS).fill(false);
  for (const m of species.peakMonths) {
    const start = MONTH_START_WEEK[m] ?? 1;
    const end = MONTH_END_WEEK[m] ?? 52;
    for (let w = start; w <= end; w++) arr[w - 1] = true;
  }
  return arr;
}

/** Current ISO-ish week of the year (1-52), server-safe */
export function currentWeekOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(52, Math.max(1, Math.ceil((dayOfYear + 1) / 7)));
}

/** Month boundaries for drawing month labels on week-grid */
export function weekGridMonthLabels(): Array<{ month: number; startWeek: number; endWeek: number }> {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    startWeek: MONTH_START_WEEK[i + 1],
    endWeek: MONTH_END_WEEK[i + 1],
  }));
}

function fillRange(arr: boolean[], from: number, to: number) {
  // Handle wrap-around (e.g. winter visitor: arrival 42 → departure 17)
  if (from <= to) {
    for (let w = from; w <= to; w++) arr[Math.min(51, Math.max(0, w - 1))] = true;
  } else {
    for (let w = from; w <= WEEKS; w++) arr[w - 1] = true;
    for (let w = 1; w <= to; w++) arr[w - 1] = true;
  }
}

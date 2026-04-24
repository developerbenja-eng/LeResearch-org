import type { Species, BirdStatus, Habitat } from './types';
import { loadAllSpecies } from './loadSpecies';

const ABUNDANCE_ORDER = { abundant: 0, common: 1, uncommon: 2, rare: 3 } as const;

/** Month index (0-11) from a Date, server-safe. */
export function currentMonthIndex(date: Date = new Date()): number {
  return date.getMonth();
}

/** 1-based month (1-12) from a Date. */
export function currentMonth1Based(date: Date = new Date()): number {
  return date.getMonth() + 1;
}

export function inMemphisNow(date: Date = new Date()): Species[] {
  const month = currentMonth1Based(date);
  return loadAllSpecies()
    .filter((s) => s.memphisMonths.includes(month))
    .sort(
      (a, b) =>
        ABUNDANCE_ORDER[a.abundance] - ABUNDANCE_ORDER[b.abundance] ||
        a.commonName.localeCompare(b.commonName),
    );
}

export function inMemphisForMonth(month1Based: number): Species[] {
  return loadAllSpecies()
    .filter((s) => s.memphisMonths.includes(month1Based))
    .sort(
      (a, b) =>
        ABUNDANCE_ORDER[a.abundance] - ABUNDANCE_ORDER[b.abundance] ||
        a.commonName.localeCompare(b.commonName),
    );
}

export function byStatus(status: BirdStatus): Species[] {
  return loadAllSpecies().filter((s) => s.status === status);
}

export function byHabitat(habitat: Habitat): Species[] {
  return loadAllSpecies().filter((s) => s.habitats.includes(habitat));
}

export function byHotspot(hotspotId: string): Species[] {
  return loadAllSpecies().filter((s) => s.memphisHotspots.includes(hotspotId));
}

/** Birds arriving soon: migrant/summer/winter birds whose arrival is within N weeks */
export function arrivingSoon(weeksAhead = 2, date: Date = new Date()): Species[] {
  const currentWeek = getWeekOfYear(date);
  return loadAllSpecies().filter((s) => {
    if (s.arrivalWeek == null) return false;
    const diff = (s.arrivalWeek - currentWeek + 52) % 52;
    return diff > 0 && diff <= weeksAhead;
  });
}

/** Birds leaving soon: whose departure week is within N weeks */
export function departingSoon(weeksAhead = 2, date: Date = new Date()): Species[] {
  const currentWeek = getWeekOfYear(date);
  return loadAllSpecies().filter((s) => {
    if (s.departureWeek == null) return false;
    const diff = (s.departureWeek - currentWeek + 52) % 52;
    return diff >= 0 && diff <= weeksAhead;
  });
}

function getWeekOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.ceil((dayOfYear + start.getDay() + 1) / 7);
}

/** Quick counts for stats display */
export function getCounts() {
  const all = loadAllSpecies();
  return {
    total: all.length,
    yearRound: all.filter((s) => s.status === 'year-round').length,
    summerBreeder: all.filter((s) => s.status === 'summer-breeder').length,
    winterVisitor: all.filter((s) => s.status === 'winter-visitor').length,
    migrant: all.filter((s) => s.status === 'migrant-pass-through').length,
  };
}

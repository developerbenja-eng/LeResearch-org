'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { Species, Habitat, SizeReference } from '@/lib/types';
import {
  ALL_COLORS,
  COLOR_LABELS,
  COLOR_SWATCHES,
  type Color,
} from '@/lib/colors';
import {
  ALL_CONSERVATION_STATUSES,
  CONSERVATION_LABELS,
  type Conservation,
} from '@/lib/conservation';
import { SpeciesCard } from '@/components/SpeciesCard';

type EnrichedSpecies = Species & {
  colors: Color[];
  conservation: Conservation;
};

const SIZE_OPTIONS: { value: SizeReference; label: string; hint: string }[] = [
  { value: 'hummingbird', label: 'Tiny', hint: 'hummingbird-sized' },
  { value: 'sparrow', label: 'Small', hint: 'sparrow-sized' },
  { value: 'sparrow-plus', label: 'Medium-small', hint: 'between sparrow & robin' },
  { value: 'robin', label: 'Medium', hint: 'robin-sized' },
  { value: 'crow', label: 'Large', hint: 'crow-sized' },
  { value: 'hawk', label: 'Very large', hint: 'hawk-sized' },
  { value: 'goose', label: 'Huge', hint: 'goose or bigger' },
];

const HABITAT_OPTIONS: { value: Habitat; label: string }[] = [
  { value: 'feeder', label: 'Backyard/feeder' },
  { value: 'woodland', label: 'Forest' },
  { value: 'bottomland-forest', label: 'Swamp/bottomland' },
  { value: 'wetland', label: 'Wetland/marsh' },
  { value: 'river', label: 'River/water' },
  { value: 'grassland', label: 'Field/grassland' },
  { value: 'urban', label: 'Urban/downtown' },
  { value: 'roadside', label: 'Roadside/open' },
];

const WHEN_OPTIONS = [
  { value: 'any' as const, label: 'Any time' },
  { value: 'now' as const, label: 'Here now' },
  { value: 'summer' as const, label: 'Summer' },
  { value: 'winter' as const, label: 'Winter' },
];

export function FindClient({ species }: { species: EnrichedSpecies[] }) {
  const [selectedColors, setSelectedColors] = useState<Set<Color>>(new Set());
  const [selectedSize, setSelectedSize] = useState<SizeReference | null>(null);
  const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null);
  const [when, setWhen] = useState<'any' | 'now' | 'summer' | 'winter'>('any');
  const [selectedStatus, setSelectedStatus] = useState<Conservation | null>(null);

  const currentMonth = new Date().getMonth() + 1;

  const matches = useMemo(() => {
    return species.filter((s) => {
      if (selectedColors.size > 0) {
        const has = s.colors.some((c) => selectedColors.has(c));
        if (!has) return false;
      }
      if (selectedSize && s.sizeReference !== selectedSize) return false;
      if (selectedHabitat && !s.habitats.includes(selectedHabitat)) return false;
      if (when === 'now' && !s.memphisMonths.includes(currentMonth)) return false;
      if (when === 'summer' && s.status !== 'summer-breeder' && s.status !== 'year-round')
        return false;
      if (when === 'winter' && s.status !== 'winter-visitor' && s.status !== 'year-round')
        return false;
      if (selectedStatus && s.conservation !== selectedStatus) return false;
      return true;
    });
  }, [species, selectedColors, selectedSize, selectedHabitat, when, selectedStatus, currentMonth]);

  const toggleColor = (c: Color) => {
    const next = new Set(selectedColors);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setSelectedColors(next);
  };

  const hasFilters =
    selectedColors.size > 0 ||
    selectedSize ||
    selectedHabitat ||
    when !== 'any' ||
    selectedStatus;

  const clear = () => {
    setSelectedColors(new Set());
    setSelectedSize(null);
    setSelectedHabitat(null);
    setWhen('any');
    setSelectedStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Filter grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Colors */}
        <FilterBlock label="Color">
          <div className="flex flex-wrap gap-1.5">
            {ALL_COLORS.map((c) => {
              const active = selectedColors.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleColor(c)}
                  className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                    active
                      ? 'bg-slate-700 border-slate-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full ${COLOR_SWATCHES[c]} ${
                      c === 'white' ? 'ring-1 ring-slate-600' : ''
                    }`}
                  />
                  {COLOR_LABELS[c]}
                </button>
              );
            })}
          </div>
        </FilterBlock>

        {/* Size */}
        <FilterBlock label="Size">
          <div className="space-y-1">
            {SIZE_OPTIONS.map((s) => {
              const active = selectedSize === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() =>
                    setSelectedSize(active ? null : s.value)
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    active
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="font-medium">{s.label}</span>{' '}
                  <span className="opacity-60">· {s.hint}</span>
                </button>
              );
            })}
          </div>
        </FilterBlock>

        {/* Habitat */}
        <FilterBlock label="Where">
          <div className="space-y-1">
            {HABITAT_OPTIONS.map((h) => {
              const active = selectedHabitat === h.value;
              return (
                <button
                  key={h.value}
                  type="button"
                  onClick={() =>
                    setSelectedHabitat(active ? null : h.value)
                  }
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    active
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </FilterBlock>

        {/* When */}
        <FilterBlock label="When">
          <div className="space-y-1">
            {WHEN_OPTIONS.map((w) => {
              const active = when === w.value;
              return (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => setWhen(w.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    active
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </FilterBlock>
      </div>

      {/* Conservation status — secondary filter row */}
      <div className="pt-4 border-t border-slate-800">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
          Conservation status
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CONSERVATION_STATUSES.map((c) => {
            const cfg = CONSERVATION_LABELS[c];
            const active = selectedStatus === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() =>
                  setSelectedStatus(active ? null : c)
                }
                title={cfg.description}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                  active
                    ? cfg.color
                    : 'text-slate-400 border-slate-800 bg-slate-900 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div>
          <div className="text-2xl font-bold text-white">
            {matches.length}{' '}
            <span className="text-sm font-normal text-slate-400">
              {matches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          {hasFilters && (
            <div className="text-xs text-slate-400 mt-0.5">
              filtering {species.length} species
            </div>
          )}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md border border-slate-700 hover:border-slate-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Results grid */}
      {matches.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-2xl">
          <p className="text-slate-400 mb-2">No matches.</p>
          <p className="text-xs text-slate-400">
            Try loosening your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {matches.map((s) => (
            <SpeciesCard key={s.slug} species={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
        {label}
      </h3>
      {children}
    </div>
  );
}

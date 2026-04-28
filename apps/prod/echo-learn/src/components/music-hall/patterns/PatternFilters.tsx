'use client';

import { Filter, X } from 'lucide-react';

interface PatternFiltersProps {
  genre: string;
  chord: string;
  groove: string;
  bpm: string;
  onGenreChange: (v: string) => void;
  onChordChange: (v: string) => void;
  onGrooveChange: (v: string) => void;
  onBpmChange: (v: string) => void;
  availableGenres: string[];
}

const COMMON_PROGRESSIONS = [
  'I-V-vi-IV',
  'I-IV-V-I',
  'ii-V-I',
  'I-vi-IV-V',
  'vi-IV-I-V',
  'I-IV-vi-V',
  'I-V-IV',
  'i-VII-VI-VII',
];

const GROOVES = ['straight', 'swing', 'shuffle', 'syncopated', 'latin', 'half-time'];
const BPM_BUCKETS = ['slow', 'moderate', 'fast', 'very-fast'];

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg bg-music-surface-light border border-white/10 text-sm text-music-text appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function PatternFilters({
  genre,
  chord,
  groove,
  bpm,
  onGenreChange,
  onChordChange,
  onGrooveChange,
  onBpmChange,
  availableGenres,
}: PatternFiltersProps) {
  const hasFilters = genre || chord || groove || bpm;

  const clearAll = () => {
    onGenreChange('');
    onChordChange('');
    onGrooveChange('');
    onBpmChange('');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="w-4 h-4 text-music-dim" />
      <Select
        value={genre}
        onChange={onGenreChange}
        options={availableGenres}
        placeholder="Genre"
      />
      <Select
        value={chord}
        onChange={onChordChange}
        options={COMMON_PROGRESSIONS}
        placeholder="Chord progression"
      />
      <Select
        value={groove}
        onChange={onGrooveChange}
        options={GROOVES}
        placeholder="Groove"
      />
      <Select
        value={bpm}
        onChange={onBpmChange}
        options={BPM_BUCKETS}
        placeholder="Tempo"
      />
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-music-dim hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}

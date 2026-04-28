'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { RedditPosts } from '@/components/RedditPosts';

interface SpeciesInfo {
  slug: string;
  commonName: string;
  scientificName: string;
  status: string;
}

// Popular birds that tend to have the best Reddit content
const FEATURED_BIRDS = [
  'Northern Cardinal',
  'Blue Jay',
  'American Robin',
  'Bald Eagle',
  'Great Blue Heron',
  'Barred Owl',
  'Ruby-throated Hummingbird',
  'Pileated Woodpecker',
  'Mourning Dove',
  'Red-tailed Hawk',
  'Turkey Vulture',
  'Wood Duck',
  'Eastern Bluebird',
  'Great Horned Owl',
  'Sandhill Crane',
];

export function FunnyBrowser({ speciesList }: { speciesList: SpeciesInfo[] }) {
  const [selectedBird, setSelectedBird] = useState<string>(FEATURED_BIRDS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpecies = searchQuery
    ? speciesList.filter((s) =>
        s.commonName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const showSearch = searchQuery.length > 0;

  return (
    <div className="space-y-6">
      {/* Search + quick picks */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a bird..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
          />
          {showSearch && filteredSpecies.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg max-h-60 overflow-y-auto shadow-xl">
              {filteredSpecies.slice(0, 10).map((s) => (
                <button
                  key={s.slug}
                  onClick={() => {
                    setSelectedBird(s.commonName);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {s.commonName}
                  <span className="text-slate-500 ml-2 italic text-xs">{s.scientificName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured birds quick picks */}
        <div className="flex flex-wrap gap-1.5">
          {FEATURED_BIRDS.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedBird(name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedBird === name
                  ? 'text-amber-200 bg-amber-500/20 ring-1 ring-amber-500/30'
                  : 'text-slate-400 bg-slate-900/50 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected bird posts */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{selectedBird}</h2>
          <span className="text-xs text-slate-500">Top posts from Reddit</span>
        </div>
        <RedditPosts key={selectedBird} birdName={selectedBird} limit={10} />
      </div>
    </div>
  );
}

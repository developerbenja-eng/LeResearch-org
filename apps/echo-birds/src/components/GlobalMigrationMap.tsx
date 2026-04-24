'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MigrationRange } from '@/lib/migration';
import type { Species } from '@/lib/types';
import Link from 'next/link';
import { X, Play, Pause } from 'lucide-react';

const DARK_STYLE = {
  version: 8 as const,
  sources: {
    'carto-dark': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; CARTO &middot; &copy; OpenStreetMap',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster' as const,
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

const MEMPHIS: [number, number] = [-89.9711, 35.1495];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type StatusFilter = 'all' | 'summer-breeder' | 'winter-visitor' | 'migrant-pass-through';

export interface MigrationEntry {
  species: Species;
  migration: MigrationRange;
}

function arc(
  start: [number, number],
  end: [number, number],
  steps = 48,
): [number, number][] {
  const coords: [number, number][] = [];
  const lon1 = (start[0] * Math.PI) / 180;
  const lat1 = (start[1] * Math.PI) / 180;
  const lon2 = (end[0] * Math.PI) / 180;
  const lat2 = (end[1] * Math.PI) / 180;
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
      ),
    );
  if (d === 0) return [start, end];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
    const lon = (Math.atan2(y, x) * 180) / Math.PI;
    coords.push([lon, lat]);
  }
  return coords;
}

/** Interpolate position along the arc based on fraction 0..1 */
function positionOnArc(
  start: [number, number],
  end: [number, number],
  fraction: number,
): [number, number] {
  const coords = arc(start, end, 48);
  const idx = Math.min(Math.floor(fraction * (coords.length - 1)), coords.length - 1);
  return coords[idx];
}

/**
 * Get approximate position of a species for a given month (1-12).
 * Returns [lng, lat] based on the species' migration status and schedule.
 */
function getSeasonalPosition(
  species: Species,
  migration: MigrationRange,
  month: number,
): [number, number] {
  const inMemphis = species.memphisMonths.includes(month);

  if (species.status === 'summer-breeder') {
    // In Memphis during breeding months, wintering grounds otherwise
    if (inMemphis) return MEMPHIS;
    if (migration.wintersAt) {
      // Transition months — show on arc
      const arrivalMonth = species.memphisMonths[0];
      const departureMonth = species.memphisMonths[species.memphisMonths.length - 1];
      if (month === arrivalMonth - 1 || month === 12 && arrivalMonth === 1) {
        return positionOnArc(migration.wintersAt, MEMPHIS, 0.5);
      }
      if (month === departureMonth + 1 || month === 1 && departureMonth === 12) {
        return positionOnArc(MEMPHIS, migration.wintersAt, 0.5);
      }
      return migration.wintersAt;
    }
    return MEMPHIS;
  }

  if (species.status === 'winter-visitor') {
    if (inMemphis) return MEMPHIS;
    if (migration.breedsAt) {
      const arrivalMonth = species.memphisMonths[0];
      const departureMonth = species.memphisMonths[species.memphisMonths.length - 1];
      if (month === arrivalMonth - 1) {
        return positionOnArc(migration.breedsAt, MEMPHIS, 0.5);
      }
      if (month === departureMonth + 1) {
        return positionOnArc(MEMPHIS, migration.breedsAt, 0.5);
      }
      return migration.breedsAt;
    }
    return MEMPHIS;
  }

  // Migrant pass-through: in Memphis briefly, otherwise at breeding or wintering grounds
  if (inMemphis) return MEMPHIS;
  // Spring migration: months 3-5
  if (month >= 3 && month <= 5 && migration.breedsAt) {
    return positionOnArc(MEMPHIS, migration.breedsAt, 0.3);
  }
  // Breeding: months 6-8
  if (month >= 6 && month <= 8 && migration.breedsAt) return migration.breedsAt;
  // Fall migration: months 9-10
  if (month >= 9 && month <= 10 && migration.wintersAt) {
    return positionOnArc(migration.breedsAt ?? MEMPHIS, migration.wintersAt, 0.4);
  }
  // Winter
  if (migration.wintersAt) return migration.wintersAt;
  return MEMPHIS;
}

const STATUS_COLORS: Record<string, string> = {
  'summer-breeder': '#fbbf24',
  'winter-visitor': '#38bdf8',
  'migrant-pass-through': '#a78bfa',
};

/** Small bird photo marker that loads from Wikipedia */
function BirdPhoto({
  scientificName,
  name,
  size = 28,
}: {
  scientificName: string;
  name: string;
  size?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const encoded = encodeURIComponent(scientificName);
    fetch(`/api/wiki-image?title=${encoded}`)
      .then((r) => r.json())
      .then((d) => { if (d.thumbnail) setSrc(d.thumbnail); })
      .catch(() => {});
  }, [scientificName]);

  if (!src) {
    return (
      <div
        className="rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center text-[8px] text-slate-400"
        style={{ width: size, height: size }}
        title={name}
      >
        {name[0]}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      title={name}
      className="rounded-full border-2 border-slate-400 object-cover shadow-lg"
      style={{ width: size, height: size }}
    />
  );
}

export function GlobalMigrationMap({
  entries,
  height = 500,
}: {
  entries: MigrationEntry[];
  height?: number;
}) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [playing, setPlaying] = useState(false);

  // Auto-play through months
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setMonth((m) => (m % 12) + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [playing]);

  const activeSlug = selectedSlug ?? hoveredSlug;

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? entries
        : entries.filter((e) => e.species.status === filter),
    [entries, filter],
  );

  // Arc paths for background (all species) + highlighted species
  const arcData = useMemo(() => {
    const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    for (const { species, migration } of filtered) {
      const color = STATUS_COLORS[species.status] ?? '#94a3b8';
      const isActive = activeSlug === species.slug;
      if (migration.wintersAt) {
        features.push({
          type: 'Feature',
          properties: {
            color,
            slug: species.slug,
            name: species.commonName,
            opacity: isActive ? 0.9 : 0.15,
            width: isActive ? 3 : 0.8,
          },
          geometry: {
            type: 'LineString',
            coordinates: arc(migration.wintersAt, MEMPHIS),
          },
        });
      }
      if (migration.breedsAt && (migration.breedsAt[0] !== MEMPHIS[0] || migration.breedsAt[1] !== MEMPHIS[1])) {
        features.push({
          type: 'Feature',
          properties: {
            color,
            slug: species.slug,
            name: species.commonName,
            opacity: isActive ? 0.9 : 0.15,
            width: isActive ? 3 : 0.8,
          },
          geometry: {
            type: 'LineString',
            coordinates: arc(MEMPHIS, migration.breedsAt),
          },
        });
      }
    }
    return { type: 'FeatureCollection' as const, features };
  }, [filtered, activeSlug]);

  // Selected species info
  const selectedEntry = useMemo(
    () => (activeSlug ? filtered.find((e) => e.species.slug === activeSlug) ?? null : null),
    [filtered, activeSlug],
  );

  // Bird position markers for the current month (show up to 15 to avoid clutter)
  const birdPositions = useMemo(() => {
    const visible = activeSlug
      ? filtered.filter((e) => e.species.slug === activeSlug)
      : filtered.slice(0, 15);
    return visible.map((e) => ({
      ...e,
      position: getSeasonalPosition(e.species, e.migration, month),
    }));
  }, [filtered, month, activeSlug]);

  const handleArcClick = useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (feature?.properties?.slug) {
        setSelectedSlug(feature.properties.slug as string);
      }
    },
    [],
  );

  const filters: { value: StatusFilter; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'text-white' },
    { value: 'summer-breeder', label: 'Summer', color: 'text-amber-300' },
    { value: 'winter-visitor', label: 'Winter', color: 'text-sky-300' },
    { value: 'migrant-pass-through', label: 'Migrants', color: 'text-violet-300' },
  ];

  return (
    <div className="space-y-3">
      {/* Controls row: filters + month slider */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Status filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setSelectedSlug(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f.value
                  ? `${f.color} bg-slate-800 ring-1 ring-slate-600`
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
              }`}
            >
              {f.label}
              <span className="ml-1 text-slate-500">
                {f.value === 'all'
                  ? entries.length
                  : entries.filter((e) => e.species.status === f.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Month timeline */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setPlaying(!playing)}
            className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title={playing ? 'Pause' : 'Play through months'}
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </button>
          <div className="flex items-center gap-0.5">
            {MONTH_NAMES.map((name, i) => {
              const m = i + 1;
              const isActive = month === m;
              return (
                <button
                  key={m}
                  onClick={() => { setMonth(m); setPlaying(false); }}
                  className={`px-1.5 py-1 rounded text-[10px] font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/30 text-amber-200 ring-1 ring-amber-500/40'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title={name}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-slate-800"
        style={{ height }}
      >
        <Map
          initialViewState={{
            longitude: -50,
            latitude: 15,
            zoom: 1.8,
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mapStyle={DARK_STYLE as any}
          interactive={true}
          interactiveLayerIds={['arc-lines']}
          onClick={handleArcClick}
          cursor={selectedSlug ? 'pointer' : 'grab'}
          attributionControl={{ compact: true }}
        >
          <Source id="arcs" type="geojson" data={arcData}>
            <Layer
              id="arc-lines"
              type="line"
              paint={{
                'line-color': ['get', 'color'],
                'line-width': ['get', 'width'],
                'line-opacity': ['get', 'opacity'],
              }}
            />
          </Source>

          {/* Memphis marker */}
          <Marker longitude={MEMPHIS[0]} latitude={MEMPHIS[1]} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-amber-200 shadow-lg shadow-amber-500/50 z-10" />
              <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
              <span className="absolute top-6 whitespace-nowrap text-[10px] font-bold text-amber-300 bg-slate-900/80 px-1.5 py-0.5 rounded z-10">
                MEMPHIS
              </span>
            </div>
          </Marker>

          {/* Bird photo markers at seasonal positions */}
          {birdPositions.map(({ species, position }) => (
            <Marker
              key={species.slug}
              longitude={position[0]}
              latitude={position[1]}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedSlug(species.slug);
              }}
            >
              <div
                className="cursor-pointer transition-transform hover:scale-125"
                style={{ transform: activeSlug === species.slug ? 'scale(1.3)' : 'scale(1)' }}
              >
                <BirdPhoto
                  scientificName={species.scientificName}
                  name={species.commonName}
                  size={activeSlug === species.slug ? 36 : 26}
                />
              </div>
            </Marker>
          ))}

          {/* Selected species endpoints */}
          {selectedEntry?.migration.wintersAt && (
            <Marker
              longitude={selectedEntry.migration.wintersAt[0]}
              latitude={selectedEntry.migration.wintersAt[1]}
              anchor="center"
            >
              <div className="relative flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-sky-500/60 border border-sky-300/60" />
                <span className="absolute top-4 whitespace-nowrap text-[9px] font-bold text-sky-300 bg-slate-900/90 px-1.5 py-0.5 rounded">
                  {selectedEntry.migration.wintersIn ?? 'Winter'}
                </span>
              </div>
            </Marker>
          )}

          {selectedEntry?.migration.breedsAt &&
            (selectedEntry.migration.breedsAt[0] !== MEMPHIS[0] ||
              selectedEntry.migration.breedsAt[1] !== MEMPHIS[1]) && (
              <Marker
                longitude={selectedEntry.migration.breedsAt[0]}
                latitude={selectedEntry.migration.breedsAt[1]}
                anchor="center"
              >
                <div className="relative flex items-center justify-center pointer-events-none">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60 border border-emerald-300/60" />
                  <span className="absolute top-4 whitespace-nowrap text-[9px] font-bold text-emerald-300 bg-slate-900/90 px-1.5 py-0.5 rounded">
                    {selectedEntry.migration.breedsIn ?? 'Breeds'}
                  </span>
                </div>
              </Marker>
            )}
        </Map>

        {/* Month indicator overlay */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="text-2xl font-bold text-white">{MONTH_NAMES[month - 1]}</div>
          <div className="text-[10px] text-slate-400">Where are they now?</div>
        </div>

        {/* Selected species info card */}
        {selectedEntry && (
          <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-sm rounded-lg px-4 py-3 max-w-xs pointer-events-auto">
            <button
              onClick={() => setSelectedSlug(null)}
              className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <Link href={`/${selectedEntry.species.slug}`} className="group">
              <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors pr-6">
                {selectedEntry.species.commonName}
              </h4>
              <p className="text-[11px] text-slate-400 italic">
                {selectedEntry.species.scientificName}
              </p>
            </Link>
            <div className="mt-2 space-y-1 text-[11px]">
              {selectedEntry.migration.wintersIn && (
                <div className="flex items-start gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mt-0.5 shrink-0" />
                  <span className="text-slate-300">
                    <span className="text-sky-300">Winters:</span> {selectedEntry.migration.wintersIn}
                  </span>
                </div>
              )}
              {selectedEntry.migration.breedsIn && (
                <div className="flex items-start gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-slate-300">
                    <span className="text-emerald-300">Breeds:</span> {selectedEntry.migration.breedsIn}
                  </span>
                </div>
              )}
              {selectedEntry.migration.roundTripMiles && (
                <div className="text-slate-400 mt-1">
                  ~{selectedEntry.migration.roundTripMiles.toLocaleString()} miles round trip
                </div>
              )}
            </div>
            <Link
              href={`/${selectedEntry.species.slug}`}
              className="mt-2 inline-block text-[11px] text-amber-300 hover:text-amber-200 font-medium"
            >
              View species profile &rarr;
            </Link>
          </div>
        )}

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-[10px]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-400">Memphis</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-0.5 bg-amber-400" />
              <span className="text-slate-400">Summer</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-0.5 bg-sky-400" />
              <span className="text-slate-400">Winter</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-0.5 bg-violet-400" />
              <span className="text-slate-400">Migrant</span>
            </div>
            <span className="text-slate-500">Click a path or bird photo</span>
          </div>
        </div>

        <style jsx global>{`
          .maplibregl-ctrl-attrib {
            background: rgba(15, 23, 42, 0.75) !important;
            color: rgb(148, 163, 184) !important;
          }
          .maplibregl-ctrl-attrib a {
            color: rgb(148, 163, 184) !important;
          }
        `}</style>
      </div>

      {/* Species list — click/hover to highlight on map */}
      <p className="text-xs text-slate-500">
        Tap a bird to see its route &middot; use the timeline to see where they are each month
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
        {filtered
          .sort((a, b) => (b.migration.roundTripMiles ?? 0) - (a.migration.roundTripMiles ?? 0))
          .map(({ species, migration }) => {
            const color = STATUS_COLORS[species.status] ?? '#94a3b8';
            const isActive = activeSlug === species.slug;
            return (
              <button
                key={species.slug}
                onClick={() => setSelectedSlug(isActive ? null : species.slug)}
                onMouseEnter={() => setHoveredSlug(species.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                  isActive
                    ? 'bg-slate-800 ring-1 ring-slate-600'
                    : 'bg-slate-900/40 hover:bg-slate-800/60'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-300 truncate">{species.commonName}</span>
                {migration.roundTripMiles && (
                  <span className="ml-auto text-slate-500 shrink-0">
                    {(migration.roundTripMiles / 1000).toFixed(1)}k
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}

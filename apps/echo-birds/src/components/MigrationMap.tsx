'use client';

import { useMemo } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import { Plane } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MigrationRange } from '@/lib/migration';

// Reuse the same CARTO dark style from HotspotMap.
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

/** Great-circle arc between two points as a GeoJSON LineString */
function arc(
  start: [number, number],
  end: [number, number],
  steps = 64,
): GeoJSON.Feature<GeoJSON.LineString> {
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
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: coords },
  };
}

function bbox(points: [number, number][]): {
  center: [number, number];
  zoom: number;
} {
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
  const lonRange = maxLon - minLon;
  const latRange = maxLat - minLat;
  const range = Math.max(lonRange, latRange);
  // rough zoom pick — works for typical Americas-spanning migration
  let zoom = 3;
  if (range < 10) zoom = 5;
  else if (range < 30) zoom = 3.5;
  else if (range < 60) zoom = 2.5;
  else zoom = 2;
  return { center, zoom };
}

export function MigrationMap({
  migration,
  speciesName,
  status,
  height = 320,
}: {
  migration: MigrationRange;
  speciesName: string;
  status: string;
  height?: number;
}) {
  const points = useMemo(() => {
    const arr: [number, number][] = [MEMPHIS];
    if (migration.wintersAt) arr.push(migration.wintersAt);
    if (migration.breedsAt) arr.push(migration.breedsAt);
    return arr;
  }, [migration]);

  const view = useMemo(() => bbox(points), [points]);

  // For summer breeders: winter (south) → Memphis
  // For winter visitors: breeds (north) → Memphis
  // For migrants passing through: draw full arc winter → Memphis → breeds
  const arcs: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  if (migration.wintersAt && status !== 'winter-visitor') {
    arcs.push(arc(migration.wintersAt, MEMPHIS));
  }
  if (migration.breedsAt && status !== 'summer-breeder') {
    arcs.push(arc(MEMPHIS, migration.breedsAt));
  }
  if (migration.wintersAt && status === 'summer-breeder') {
    arcs.push(arc(migration.wintersAt, MEMPHIS));
  }
  if (migration.breedsAt && status === 'summer-breeder' && migration.breedsAt[0] !== MEMPHIS[0]) {
    // Memphis is their breeding grounds — no northward arc needed
  }

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-800"
      style={{ height }}
    >
      <Map
        initialViewState={{
          longitude: view.center[0],
          latitude: view.center[1],
          zoom: view.zoom,
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapStyle={DARK_STYLE as any}
        interactive={true}
        attributionControl={{ compact: true }}
      >
        {/* Arc lines */}
        {arcs.map((a, i) => (
          <Source key={i} id={`arc-${i}`} type="geojson" data={a}>
            <Layer
              id={`arc-line-${i}`}
              type="line"
              paint={{
                'line-color': '#fbbf24',
                'line-width': 2,
                'line-opacity': 0.7,
                'line-dasharray': [2, 2],
              }}
            />
          </Source>
        ))}

        {/* Memphis marker */}
        <Marker longitude={MEMPHIS[0]} latitude={MEMPHIS[1]} anchor="center">
          <div className="relative flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-amber-200 shadow-lg shadow-amber-500/50" />
            <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
            <span className="absolute top-6 whitespace-nowrap text-[10px] font-bold text-amber-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
              MEMPHIS
            </span>
          </div>
        </Marker>

        {/* Wintering grounds marker */}
        {migration.wintersAt && (
          <Marker
            longitude={migration.wintersAt[0]}
            latitude={migration.wintersAt[1]}
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-sky-300 shadow-lg shadow-sky-500/40" />
              <span className="absolute top-5 whitespace-nowrap text-[9px] font-bold text-sky-300 bg-slate-900/80 px-1 py-0.5 rounded">
                WINTER
              </span>
            </div>
          </Marker>
        )}

        {/* Breeding grounds marker */}
        {migration.breedsAt &&
          (migration.breedsAt[0] !== MEMPHIS[0] || migration.breedsAt[1] !== MEMPHIS[1]) && (
            <Marker
              longitude={migration.breedsAt[0]}
              latitude={migration.breedsAt[1]}
              anchor="center"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-300 shadow-lg shadow-emerald-500/40" />
                <span className="absolute top-5 whitespace-nowrap text-[9px] font-bold text-emerald-300 bg-slate-900/80 px-1 py-0.5 rounded">
                  BREEDS
                </span>
              </div>
            </Marker>
          )}
      </Map>

      {/* Overlay header */}
      <div className="absolute top-3 left-3 right-3 pointer-events-none flex items-start justify-between gap-2">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Plane className="w-3.5 h-3.5 text-amber-300" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Migration
            </h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            {speciesName} &middot;{' '}
            {migration.roundTripMiles != null && (
              <span className="text-slate-400">
                ~{migration.roundTripMiles.toLocaleString()} mi round-trip
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Overrides */}
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
  );
}

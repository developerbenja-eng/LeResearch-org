'use client';

import { useState } from 'react';
import Link from 'next/link';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin, ChevronRight } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Hotspot } from '@/lib/types';
import { MEMPHIS_CENTER } from '@/lib/hotspots';

// CARTO Dark Matter raster style — no key required, works out of the box.
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
      attribution:
        '&copy; <a href="https://carto.com/attributions">CARTO</a> &middot; &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

export interface HotspotMapProps {
  hotspots: Hotspot[];
  height?: number;
  highlightedId?: string;
}

export function HotspotMap({
  hotspots,
  height = 480,
  highlightedId,
}: HotspotMapProps) {
  const [active, setActive] = useState<Hotspot | null>(
    highlightedId ? hotspots.find((h) => h.id === highlightedId) ?? null : null,
  );

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800"
      style={{ height }}
    >
      <Map
        initialViewState={{
          longitude: MEMPHIS_CENTER[0],
          latitude: MEMPHIS_CENTER[1],
          zoom: 10.2,
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapStyle={DARK_STYLE as any}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {hotspots.map((h) => {
          const isBig5 = h.tier === 'big-5';
          const isHighlighted = h.id === highlightedId;
          return (
            <Marker
              key={h.id}
              longitude={h.coords[0]}
              latitude={h.coords[1]}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setActive(h);
              }}
            >
              <button
                type="button"
                aria-label={h.name}
                className={`group relative cursor-pointer transition-transform hover:scale-110 ${
                  isHighlighted ? 'scale-125' : ''
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isBig5
                      ? 'bg-amber-500/90 border-amber-300 shadow-lg shadow-amber-500/30'
                      : 'bg-sky-500/90 border-sky-300 shadow-lg shadow-sky-500/30'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-white" />
                  {isBig5 && (
                    <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
                  )}
                </div>
              </button>
            </Marker>
          );
        })}

        {active && (
          <Popup
            longitude={active.coords[0]}
            latitude={active.coords[1]}
            anchor="top"
            offset={16}
            onClose={() => setActive(null)}
            closeButton={false}
            closeOnClick={false}
            className="birds-popup"
            maxWidth="320px"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 min-w-[240px] max-w-[300px]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-white text-sm leading-tight">
                  {active.name}
                </h4>
                <span
                  className={`shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    active.tier === 'big-5'
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'bg-sky-500/20 text-sky-200'
                  }`}
                >
                  {active.tier === 'big-5' ? 'Big 5' : 'Spot'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{active.neighborhood}</p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-2">
                {active.description}
              </p>
              <Link
                href={`/spots/${active.slug}`}
                className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200"
              >
                Details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </Popup>
        )}
      </Map>

      {/* Style overrides for MapLibre popup chrome */}
      <style jsx global>{`
        .birds-popup .maplibregl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .birds-popup .maplibregl-popup-tip {
          border-top-color: #1e293b !important;
          border-bottom-color: #1e293b !important;
        }
        .maplibregl-ctrl-attrib {
          background: rgba(15, 23, 42, 0.75) !important;
          color: rgb(148, 163, 184) !important;
        }
        .maplibregl-ctrl-attrib a {
          color: rgb(148, 163, 184) !important;
        }
        .maplibregl-ctrl button {
          background-color: rgba(15, 23, 42, 0.9) !important;
        }
        .maplibregl-ctrl button span {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
}

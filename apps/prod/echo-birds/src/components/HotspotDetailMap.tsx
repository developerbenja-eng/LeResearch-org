'use client';

import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Hotspot } from '@/lib/types';

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

export function HotspotDetailMap({
  hotspot,
  height = 360,
  zoom = 13,
}: {
  hotspot: Hotspot;
  height?: number;
  zoom?: number;
}) {
  const isBig5 = hotspot.tier === 'big-5';
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800"
      style={{ height }}
    >
      <Map
        initialViewState={{
          longitude: hotspot.coords[0],
          latitude: hotspot.coords[1],
          zoom,
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapStyle={DARK_STYLE as any}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Marker
          longitude={hotspot.coords[0]}
          latitude={hotspot.coords[1]}
          anchor="bottom"
        >
          <div className="relative flex items-center justify-center">
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-xl ${
                isBig5
                  ? 'bg-amber-500/95 border-amber-200 shadow-amber-500/50'
                  : 'bg-sky-500/95 border-sky-200 shadow-sky-500/50'
              }`}
            >
              <MapPin className="w-5 h-5 text-white" />
              <span
                className={`absolute inset-0 rounded-full animate-ping ${
                  isBig5 ? 'bg-amber-400/40' : 'bg-sky-400/40'
                }`}
              />
            </div>
          </div>
        </Marker>
      </Map>

      <style jsx global>{`
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

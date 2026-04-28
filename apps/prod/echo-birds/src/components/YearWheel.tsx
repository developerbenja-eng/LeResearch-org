'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import type { Species } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/types';
import { StatusChip } from './StatusChip';
import { AudioPlayer } from './AudioPlayer';

export interface YearWheelProps {
  species: Species[];
  currentMonth: number; // 1-based
  size?: number;
}

/**
 * Year Wheel — signature landing component.
 *
 * Visual: 12-month circular ring. The current month glows amber.
 * Each species is placed on the ring at its primary month
 * (peak month if available, otherwise first month it's present).
 * The viewer can drag-scrub to preview other months.
 */
export function YearWheel({ species, currentMonth, size = 520 }: YearWheelProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [focused, setFocused] = useState<Species | null>(null);

  const centerX = size / 2;
  const centerY = size / 2;
  const outerR = size / 2 - 12;
  const ringR = outerR - 24;
  const birdR = ringR - 36;

  // Distribute species around the wheel by their primary month.
  const placedSpecies = useMemo(() => {
    // Group species by primary month (peak or first).
    const byMonth = new Map<number, Species[]>();
    for (const s of species) {
      const primary = s.peakMonths[0] ?? s.memphisMonths[0] ?? 1;
      if (!byMonth.has(primary)) byMonth.set(primary, []);
      byMonth.get(primary)!.push(s);
    }
    // For each month, fan birds out in a small arc so they don't overlap.
    const placed: Array<{ species: Species; angle: number; r: number }> = [];
    for (const [month, birds] of byMonth.entries()) {
      const monthAngle = monthToAngle(month);
      const spread = Math.min(birds.length * 9, 28); // degrees
      birds.forEach((bird, i) => {
        const offset =
          birds.length === 1 ? 0 : -spread / 2 + (spread / (birds.length - 1)) * i;
        const angleDeg = monthAngle + offset;
        // Stagger radius slightly so dense months breathe
        const rJitter = (i % 2 === 0 ? 0 : -10) + (birds.length > 4 && i >= 4 ? -18 : 0);
        placed.push({
          species: bird,
          angle: angleDeg,
          r: birdR + rJitter,
        });
      });
    }
    return placed;
  }, [species, birdR]);

  const monthAngle = monthToAngle(selectedMonth);

  return (
    <div className="relative inline-block select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_0_40px_rgba(56,189,248,0.15)]"
      >
        {/* Outer ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerR}
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={1}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={ringR}
          fill="none"
          stroke="rgba(148,163,184,0.08)"
          strokeWidth={1}
        />

        {/* 12 month ticks + labels */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
          const angle = monthToAngle(month);
          const rad = (angle * Math.PI) / 180;
          const x1 = round(centerX + Math.cos(rad) * (outerR - 8));
          const y1 = round(centerY + Math.sin(rad) * (outerR - 8));
          const x2 = round(centerX + Math.cos(rad) * outerR);
          const y2 = round(centerY + Math.sin(rad) * outerR);
          const labelX = round(centerX + Math.cos(rad) * (outerR + 18));
          const labelY = round(centerY + Math.sin(rad) * (outerR + 18));
          const isCurrent = month === currentMonth;
          const isSelected = month === selectedMonth;
          return (
            <g key={month}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isCurrent
                    ? 'rgb(251,191,36)'
                    : isSelected
                    ? 'rgb(56,189,248)'
                    : 'rgba(148,163,184,0.3)'
                }
                strokeWidth={isCurrent || isSelected ? 2 : 1}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={isCurrent ? 700 : 500}
                fill={
                  isCurrent
                    ? 'rgb(251,191,36)'
                    : isSelected
                    ? 'rgb(56,189,248)'
                    : 'rgb(148,163,184)'
                }
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedMonth(month)}
              >
                {MONTH_NAMES[month - 1]}
              </text>
            </g>
          );
        })}

        {/* Selected-month pointer arc (sky) */}
        {selectedMonth !== currentMonth && (
          <motion.circle
            key={`sel-${selectedMonth}`}
            cx={round(centerX + Math.cos((monthAngle * Math.PI) / 180) * ringR)}
            cy={round(centerY + Math.sin((monthAngle * Math.PI) / 180) * ringR)}
            r={6}
            fill="rgb(56,189,248)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        )}

        {/* Current-month pulse (amber) */}
        <motion.circle
          cx={round(centerX + Math.cos((monthToAngle(currentMonth) * Math.PI) / 180) * ringR)}
          cy={round(centerY + Math.sin((monthToAngle(currentMonth) * Math.PI) / 180) * ringR)}
          r={8}
          fill="rgb(251,191,36)"
          animate={{
            scale: [1, 1.35, 1],
            opacity: [0.9, 0.5, 0.9],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bird silhouettes placed around the ring */}
        {placedSpecies.map(({ species: s, angle, r }) => {
          const rad = (angle * Math.PI) / 180;
          // Round to avoid SSR/CSR floating-point hydration mismatches
          const x = round(centerX + Math.cos(rad) * r);
          const y = round(centerY + Math.sin(rad) * r);
          const isHere = s.memphisMonths.includes(selectedMonth);
          return (
            <motion.g
              key={s.slug}
              transform={`translate(${x}, ${y})`}
              initial={false}
              animate={{
                opacity: isHere ? 1 : 0.22,
              }}
              transition={{ duration: 0.35 }}
              style={{ cursor: 'pointer' }}
              onClick={() => setFocused(s)}
            >
              <circle
                r={8}
                fill={isHere ? 'rgba(56,189,248,0.18)' : 'rgba(100,116,139,0.12)'}
                stroke={isHere ? 'rgb(56,189,248)' : 'rgba(148,163,184,0.4)'}
                strokeWidth={1}
              />
              {/* Tiny bird glyph */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fill={isHere ? 'rgb(186,230,253)' : 'rgb(100,116,139)'}
              >
                🪶
              </text>
            </motion.g>
          );
        })}

        {/* Center label */}
        <g>
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="rgb(148,163,184)"
            letterSpacing="0.12em"
          >
            MEMPHIS
          </text>
          <text
            x={centerX}
            y={centerY + 18}
            textAnchor="middle"
            fontSize={28}
            fontWeight={700}
            fill={selectedMonth === currentMonth ? 'rgb(251,191,36)' : 'rgb(56,189,248)'}
          >
            {MONTH_NAMES[selectedMonth - 1]}
          </text>
          <text
            x={centerX}
            y={centerY + 38}
            textAnchor="middle"
            fontSize={10}
            fill="rgb(148,163,184)"
          >
            {speciesCountForMonth(species, selectedMonth)} birds
          </text>
        </g>
      </svg>

      {/* Instructions */}
      <p className="text-center text-xs text-slate-400 mt-2">
        Tap a month label to scrub &middot; tap a bird to preview
      </p>

      {/* Focused-bird drawer */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-8 w-[min(420px,calc(100%-2rem))] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setFocused(null)}
              className="absolute top-2 right-2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusChip status={focused.status} />
                </div>
                <h3 className="text-lg font-semibold text-white truncate">
                  {focused.commonName}
                </h3>
                <p className="text-xs italic text-slate-400 truncate">
                  {focused.scientificName}
                </p>
                {focused.aliases[0] && (
                  <p className="text-xs text-amber-300/80 mt-1 truncate">
                    &ldquo;{focused.aliases[0]}&rdquo;
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <AudioPlayer
                url={focused.audioSongUrl ?? focused.audioCallUrl}
                label="Song"
                scientificName={focused.scientificName}
                xcType="song"
              />
              <Link
                href={`/${focused.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-sky-300 hover:text-sky-200 ml-auto"
              >
                Full profile <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Convert month (1-12) to degrees. 12 is at top (-90°), going clockwise.
function monthToAngle(month: number): number {
  return -90 + ((month - 1) / 12) * 360;
}

// Round to 2 decimals — avoids SSR/CSR floating-point hydration mismatches
// from Math.cos/sin differing by 1 ulp between Node and browser engines.
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function speciesCountForMonth(species: Species[], month: number): number {
  return species.filter((s) => s.memphisMonths.includes(month)).length;
}

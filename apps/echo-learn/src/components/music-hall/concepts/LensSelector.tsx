'use client';

import { motion } from 'framer-motion';
import type { LensType } from '@/types/music-hall';
import { LENS_METADATA } from '@/types/music-hall';

interface LensSelectorProps {
  activeLens: LensType;
  onLensChange: (lens: LensType) => void;
}

const LENS_ORDER: LensType[] = ['technical', 'visual', 'emotional', 'historical', 'examples'];

export function LensSelector({ activeLens, onLensChange }: LensSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {LENS_ORDER.map((lens) => {
        const meta = LENS_METADATA[lens];
        const isActive = lens === activeLens;

        return (
          <button
            key={lens}
            onClick={() => onLensChange(lens)}
            className={`
              relative px-4 py-2 rounded-xl font-medium text-sm transition-all
              flex items-center gap-2
              ${isActive
                ? 'text-white'
                : 'text-music-dim hover:text-music-text bg-music-surface border border-white/10 hover:border-white/20'
              }
            `}
            style={{
              backgroundColor: isActive ? meta.color : undefined,
            }}
          >
            <span className="text-base">{meta.emoji}</span>
            <span>{meta.label}</span>

            {isActive && (
              <motion.div
                layoutId="lens-indicator"
                className="absolute inset-0 rounded-xl -z-10"
                style={{ backgroundColor: meta.color }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

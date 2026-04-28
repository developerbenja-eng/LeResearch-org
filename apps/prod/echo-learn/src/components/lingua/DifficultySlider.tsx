'use client';

import React, { useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { useLingua } from '@/context/LinguaContext';
import { useTracking } from './tracking/InteractionTracker';
import { Gauge } from 'lucide-react';

export function DifficultySlider() {
  const { difficultyLevel, setDifficultyLevel, user } = useLingua();
  const { trackDifficultyChange, isTracking } = useTracking();

  // Track previous difficulty level for change tracking
  const previousDifficulty = useRef<number>(difficultyLevel);

  const targetLangName = user?.targetLang === 'en' ? 'English' : 'Spanish';
  const nativeLangName = user?.nativeLang === 'en' ? 'English' : 'Spanish';

  return (
    <Card variant="bordered" padding="sm" className="w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Gauge className="w-5 h-5" />
          <span className="font-medium text-sm">Difficulty</span>
        </div>

        <div className="flex-1 flex items-center gap-3 md:gap-4">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {nativeLangName}
          </span>

          <div className="flex-1 relative py-2">
            <input
              type="range"
              min="0"
              max="100"
              value={difficultyLevel}
              onChange={async (e) => {
                const newDifficulty = parseInt(e.target.value);
                const oldDifficulty = previousDifficulty.current;

                // Track difficulty change
                if (isTracking && newDifficulty !== oldDifficulty) {
                  await trackDifficultyChange(oldDifficulty, newDifficulty, 'conversation');
                }

                // Update state and ref
                setDifficultyLevel(newDifficulty);
                previousDifficulty.current = newDifficulty;
              }}
              className="w-full h-3 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 slider-touch"
              style={{
                WebkitAppearance: 'none',
              }}
            />
            <div className="absolute -top-1 md:-top-6 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full shadow-sm">
              {difficultyLevel}%
            </div>
          </div>

          <span className="text-xs text-gray-500 whitespace-nowrap">
            {targetLangName}
          </span>
        </div>

        <div className="text-xs text-gray-500 text-center md:text-left md:block">
          {difficultyLevel === 0 && 'All words in native language'}
          {difficultyLevel > 0 && difficultyLevel < 50 && 'Mostly native, some target'}
          {difficultyLevel >= 50 && difficultyLevel < 100 && 'Mixed languages'}
          {difficultyLevel === 100 && 'Full immersion'}
        </div>
      </div>
    </Card>
  );
}

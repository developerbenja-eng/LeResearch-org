'use client';

import { useEffect, useState } from 'react';
import type { Species } from '@/lib/types';
import { YearWheel } from './YearWheel';

/** Responsive wrapper — picks wheel size by viewport. */
export function YearWheelResponsive({
  species,
  currentMonth,
}: {
  species: Species[];
  currentMonth: number;
}) {
  const [size, setSize] = useState(520);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 380) setSize(280);
      else if (w < 640) setSize(320);
      else if (w < 1024) setSize(440);
      else setSize(540);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return <YearWheel species={species} currentMonth={currentMonth} size={size} />;
}

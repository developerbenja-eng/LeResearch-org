'use client';

import { useCallback, useRef, useState } from 'react';
import type { ProducerProjectData } from '@/types/producer';

const MAX_HISTORY = 50;

export interface UseUndoRedoReturn {
  pushSnapshot: (data: ProducerProjectData) => void;
  undo: () => ProducerProjectData | null;
  redo: () => ProducerProjectData | null;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export function useUndoRedo(): UseUndoRedoReturn {
  const historyRef = useRef<ProducerProjectData[]>([]);
  const pointerRef = useRef(-1);
  // Force re-render when can-undo/redo changes
  const [, forceUpdate] = useState(0);

  const pushSnapshot = useCallback((data: ProducerProjectData) => {
    // Strip non-serializable / volatile fields before cloning
    const clean: ProducerProjectData = {
      ...data,
      vocalRecordingBarIds: undefined,
    };

    const cloned = structuredClone(clean);

    // Truncate any redo entries ahead of the pointer
    const history = historyRef.current;
    history.length = pointerRef.current + 1;

    // Deduplicate: skip if identical to current top (quick length check)
    if (history.length > 0) {
      const top = history[history.length - 1];
      const topStr = JSON.stringify(top);
      const newStr = JSON.stringify(cloned);
      if (topStr === newStr) return;
    }

    history.push(cloned);

    // Trim oldest if over max
    if (history.length > MAX_HISTORY) {
      history.shift();
    }

    pointerRef.current = history.length - 1;
    forceUpdate((n) => n + 1);
  }, []);

  const undo = useCallback((): ProducerProjectData | null => {
    if (pointerRef.current <= 0) return null;
    pointerRef.current -= 1;
    forceUpdate((n) => n + 1);
    return structuredClone(historyRef.current[pointerRef.current]);
  }, []);

  const redo = useCallback((): ProducerProjectData | null => {
    if (pointerRef.current >= historyRef.current.length - 1) return null;
    pointerRef.current += 1;
    forceUpdate((n) => n + 1);
    return structuredClone(historyRef.current[pointerRef.current]);
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    pointerRef.current = -1;
    forceUpdate((n) => n + 1);
  }, []);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < historyRef.current.length - 1;

  return { pushSnapshot, undo, redo, canUndo, canRedo, clear };
}

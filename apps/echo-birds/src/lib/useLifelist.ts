'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'memphis-birds-lifelist:v1';

export interface LifelistEntry {
  firstSeen: string; // ISO date
}

type Lifelist = Record<string, LifelistEntry>;

function read(): Lifelist {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function write(list: Lifelist) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('memphis-birds-lifelist-change'));
}

export function useLifelist() {
  const [list, setList] = useState<Lifelist>({});

  useEffect(() => {
    setList(read());
    const onChange = () => setList(read());
    window.addEventListener('memphis-birds-lifelist-change', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('memphis-birds-lifelist-change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const add = useCallback((speciesId: string) => {
    const current = read();
    if (current[speciesId]) return;
    current[speciesId] = { firstSeen: new Date().toISOString() };
    write(current);
  }, []);

  const remove = useCallback((speciesId: string) => {
    const current = read();
    delete current[speciesId];
    write(current);
  }, []);

  const toggle = useCallback((speciesId: string) => {
    const current = read();
    if (current[speciesId]) {
      delete current[speciesId];
    } else {
      current[speciesId] = { firstSeen: new Date().toISOString() };
    }
    write(current);
  }, []);

  const isInList = useCallback((speciesId: string) => Boolean(list[speciesId]), [list]);

  return {
    list,
    ids: Object.keys(list),
    count: Object.keys(list).length,
    add,
    remove,
    toggle,
    isInList,
  };
}

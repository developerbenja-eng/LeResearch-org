'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type AppType = 'tales' | 'learn' | 'home';

function getSwConfig(pathname: string): { swPath: string; scope: string; app: AppType } {
  if (
    pathname.startsWith('/tales') ||
    pathname.startsWith('/play') ||
    pathname.startsWith('/music') ||
    pathname.startsWith('/characters') ||
    pathname.startsWith('/community')
  ) {
    return { swPath: '/sw-tales.js', scope: '/tales/', app: 'tales' };
  }
  if (
    pathname.startsWith('/learn') ||
    pathname.startsWith('/lingua') ||
    pathname.startsWith('/reader') ||
    pathname.startsWith('/sophia') ||
    pathname.startsWith('/research')
  ) {
    return { swPath: '/sw-learn.js', scope: '/learn/', app: 'learn' };
  }
  return { swPath: '/sw.js', scope: '/', app: 'home' };
}

export function ServiceWorkerRegister() {
  const pathname = usePathname();
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    const { swPath, scope, app } = getSwConfig(pathname);

    // Skip if already registered for this app
    if (registeredRef.current === app) {
      return;
    }

    navigator.serviceWorker
      .register(swPath, { scope })
      .then((registration) => {
        console.log(`[SW] Registered ${app} service worker:`, registration.scope);
        registeredRef.current = app;

        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error);
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Service Worker updated, reloading...');
      window.location.reload();
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('[SW] Cache updated:', event.data.url);
      }
    });
  }, [pathname]);

  return null;
}

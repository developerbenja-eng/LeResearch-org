'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Thin context wrapping the shared .ledesign.ai SSO cookie. Login + register
 * live at auth.ledesign.ai — this client hook just polls /api/auth/me and
 * exposes redirects for navigation.
 *
 * The old `hasHubAccess('tales' | 'learn')` API is preserved — it now maps
 * onto `apps[]` in the JWT (echo-tales / echo-learn are separate app grants
 * in user_app_access), so the call sites don't need to change.
 */

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin' | 'owner';
  email_verified?: boolean;
}

interface AuthContextType {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAppAccess: boolean;
  apps: string[];
  roles: Record<string, 'user' | 'admin' | 'owner'>;
  goLogin: (opts?: { redirect?: string }) => void;
  goRegister: (opts?: { redirect?: string }) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasHubAccess: (hub: 'tales' | 'learn') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const APP_ID =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_ID) || 'echo-tales';
const AUTH_ORIGIN =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_ORIGIN) ||
  'https://auth.ledesign.ai';

const HUB_APP: Record<'tales' | 'learn', string> = {
  tales: 'echo-tales',
  learn: 'echo-learn',
};

function buildAuthUrl(path: '/login' | '/register', redirect?: string): string {
  const url = new URL(path, AUTH_ORIGIN);
  url.searchParams.set('app', APP_ID);
  const here = redirect ?? (typeof window !== 'undefined' ? window.location.href : '/');
  url.searchParams.set('redirect', here);
  return url.toString();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [apps, setApps] = useState<string[]>([]);
  const [roles, setRoles] = useState<Record<string, 'user' | 'admin' | 'owner'>>({});
  const [hasAppAccess, setHasAppAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) {
        setUser(null);
        setApps([]);
        setRoles({});
        setHasAppAccess(false);
        return;
      }
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setApps(Array.isArray(data.apps) ? data.apps : []);
        setRoles(data.roles ?? {});
        setHasAppAccess(!!data.hasAppAccess);
      } else {
        setUser(null);
        setApps([]);
        setRoles({});
        setHasAppAccess(false);
      }
    } catch {
      // Ignore network blips; keep last known state.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const goLogin = useCallback((opts?: { redirect?: string }) => {
    window.location.href = buildAuthUrl('/login', opts?.redirect);
  }, []);

  const goRegister = useCallback((opts?: { redirect?: string }) => {
    window.location.href = buildAuthUrl('/register', opts?.redirect);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      redirect: 'manual',
    }).catch(() => {});
    setUser(null);
    setApps([]);
    setRoles({});
    setHasAppAccess(false);
    const here = typeof window !== 'undefined' ? window.location.origin : '';
    const back = encodeURIComponent(`${here}/`);
    window.location.href = `${AUTH_ORIGIN}/api/auth/logout?redirect=${back}`;
  }, []);

  const hasHubAccess = useCallback(
    (hub: 'tales' | 'learn') => {
      if (!user) return true; // match old behaviour for unauth (UI shows both hubs)
      return apps.includes(HUB_APP[hub]);
    },
    [user, apps],
  );

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasAppAccess,
    apps,
    roles,
    goLogin,
    goRegister,
    logout,
    refresh,
    hasHubAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function authUrls(redirect?: string) {
  return {
    login: buildAuthUrl('/login', redirect),
    register: buildAuthUrl('/register', redirect),
  };
}

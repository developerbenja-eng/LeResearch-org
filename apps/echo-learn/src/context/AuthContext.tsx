'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * AuthContext is now thin — login/register live on auth.ledesign.ai, and
 * the SSO cookie (.ledesign.ai, HttpOnly) is the source of truth. This
 * context just polls our local /api/auth/me to know who's signed in.
 */

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
}

export type AppRole = 'user' | 'admin' | 'owner';

interface AuthContextType {
  user: PublicUser | null;
  apps: string[];
  roles: Record<string, AppRole>;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAppAccess: boolean;
  /** Redirects the browser to auth.ledesign.ai/register with this app pre-filled. */
  goRegister: (opts?: { redirect?: string }) => void;
  /** Redirects the browser to auth.ledesign.ai/login. */
  goLogin: (opts?: { redirect?: string }) => void;
  /** Clears the shared cookie via auth.ledesign.ai. */
  logout: () => Promise<void>;
  /** Force a re-fetch of /api/auth/me. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const APP_ID =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_ID) ||
  'echo-learn';
const AUTH_ORIGIN =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_ORIGIN) ||
  'https://auth.ledesign.ai';

function buildAuthUrl(path: '/login' | '/register', redirect?: string): string {
  const url = new URL(path, AUTH_ORIGIN);
  url.searchParams.set('app', APP_ID);
  const here =
    redirect ?? (typeof window !== 'undefined' ? window.location.href : '/');
  url.searchParams.set('redirect', here);
  return url.toString();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [apps, setApps] = useState<string[]>([]);
  const [roles, setRoles] = useState<Record<string, AppRole>>({});
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
      // Network blip — keep last known state, don't force-signout.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const goRegister = useCallback((opts?: { redirect?: string }) => {
    window.location.href = buildAuthUrl('/register', opts?.redirect);
  }, []);

  const goLogin = useCallback((opts?: { redirect?: string }) => {
    window.location.href = buildAuthUrl('/login', opts?.redirect);
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
    // Hard nav through auth.ledesign.ai so the shared cookie is cleared at
    // the origin that set it, then come back to our own landing.
    const here = typeof window !== 'undefined' ? window.location.origin : '';
    const back = encodeURIComponent(`${here}/`);
    window.location.href = `${AUTH_ORIGIN}/api/auth/logout?redirect=${back}`;
  }, []);

  const value: AuthContextType = {
    user,
    apps,
    roles,
    isLoading,
    isAuthenticated: !!user,
    hasAppAccess,
    goRegister,
    goLogin,
    logout,
    refresh,
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

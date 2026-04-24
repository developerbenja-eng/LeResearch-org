/**
 * Shared SSO cookie. All *.ledesign.ai subdomains read this cookie and
 * verify the JWT locally — no redirect-and-fetch per app.
 */

export const SSO_COOKIE_NAME = 'ledesign_sso';

export interface CookieEnv {
  /** Root domain for prod — e.g. `.ledesign.ai`. Omit/null for local dev. */
  domain?: string | null;
  /** Defaults to process.env.NODE_ENV !== 'development'. */
  secure?: boolean;
  /** Cookie lifetime in seconds. Defaults 7 days. */
  maxAge?: number;
}

export interface CookieAttrs {
  name: string;
  value: string;
  path: string;
  httpOnly: true;
  sameSite: 'lax';
  secure: boolean;
  maxAge: number;
  domain?: string;
}

const SEVEN_DAYS = 60 * 60 * 24 * 7;

/**
 * Resolve cookie options consistent across all LeDesign apps.
 * In prod: Domain=.ledesign.ai so every subdomain sees the cookie.
 * In dev: no Domain attr so localhost just works.
 */
export function ssoCookieAttrs(value: string, env: CookieEnv = {}): CookieAttrs {
  const secure =
    env.secure ?? (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== undefined);
  const attrs: CookieAttrs = {
    name: SSO_COOKIE_NAME,
    value,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: env.maxAge ?? SEVEN_DAYS,
  };
  const domain = env.domain ?? process.env.SSO_COOKIE_DOMAIN ?? null;
  if (domain) attrs.domain = domain;
  return attrs;
}

export function clearCookieAttrs(env: CookieEnv = {}): CookieAttrs {
  return { ...ssoCookieAttrs('', env), maxAge: 0 };
}

/** Serialize attrs into a Set-Cookie header value (for manual Response use). */
export function serializeCookie(attrs: CookieAttrs): string {
  const parts = [`${attrs.name}=${encodeURIComponent(attrs.value)}`];
  if (attrs.domain) parts.push(`Domain=${attrs.domain}`);
  parts.push(`Path=${attrs.path}`);
  parts.push(`Max-Age=${attrs.maxAge}`);
  parts.push(`SameSite=${attrs.sameSite === 'lax' ? 'Lax' : attrs.sameSite}`);
  if (attrs.httpOnly) parts.push('HttpOnly');
  if (attrs.secure) parts.push('Secure');
  return parts.join('; ');
}

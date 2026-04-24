import { generateToken, verifyToken, type TokenPayload } from '@leresearch-org/auth/jwt';

/**
 * Canonical LeDesign JWT payload. All apps issue + verify this shape.
 * `apps` + `roles` are snapshotted at issue time so the common path is
 * DB-free; the issuer (auth.ledesign.ai) is the single source of truth
 * when regenerating.
 */
export interface IdentityTokenPayload extends TokenPayload {
  userId: string;
  email: string;
  name?: string | null;
  apps: string[];
  roles: Record<string, 'user' | 'admin' | 'owner'>;
  sid: string;
}

export interface IssueIdentityTokenInput {
  userId: string;
  email: string;
  name?: string | null;
  apps: string[];
  roles: Record<string, 'user' | 'admin' | 'owner'>;
  sessionId: string;
  secret: string;
  /** JWT expiry, defaults to 7d — matches the cookie's short-window verify. */
  expiresIn?: string | number;
}

export function issueIdentityToken(input: IssueIdentityTokenInput): string {
  return generateToken(
    {
      userId: input.userId,
      email: input.email,
      name: input.name ?? null,
      apps: input.apps,
      roles: input.roles,
      sid: input.sessionId,
    },
    { secret: input.secret, expiresIn: (input.expiresIn ?? '7d') as unknown as number },
  );
}

export function verifyIdentityToken(token: string, secret: string): IdentityTokenPayload | null {
  const decoded = verifyToken(token, secret);
  if (!decoded) return null;
  if (typeof decoded.userId !== 'string' || typeof decoded.email !== 'string') return null;
  if (!Array.isArray((decoded as IdentityTokenPayload).apps)) return null;
  return decoded as IdentityTokenPayload;
}

export function tokenGrantsApp(payload: IdentityTokenPayload, appId: string): boolean {
  return payload.apps.includes(appId);
}

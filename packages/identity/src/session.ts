import { and, eq, isNull } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { IdentityDb } from './client';
import { sessions, type Session } from './schema';
import { addDaysIso, isExpired, nowIso, randomToken, sha256 } from './crypto';

const DEFAULT_SESSION_DAYS = 30;

export interface CreateSessionInput {
  user_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  /** How many days the session lives. Defaults to 30. */
  days?: number;
}

export interface CreatedSession {
  session: Session;
  /** Opaque token to hand back to the client (cookie value). Server never stores plaintext. */
  plaintext_token: string;
}

export async function createSession(db: IdentityDb, input: CreateSessionInput): Promise<CreatedSession> {
  const plaintext_token = randomToken(32);
  const token_hash = sha256(plaintext_token);
  const id = randomUUID();
  const now = nowIso();
  const expires_at = addDaysIso(input.days ?? DEFAULT_SESSION_DAYS);

  await db.insert(sessions).values({
    id,
    user_id: input.user_id,
    token_hash,
    expires_at,
    ip_address: input.ip_address ?? null,
    user_agent: input.user_agent ?? null,
    created_at: now,
    revoked_at: null,
  });

  return {
    session: {
      id,
      user_id: input.user_id,
      token_hash,
      expires_at,
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
      created_at: now,
      revoked_at: null,
    },
    plaintext_token,
  };
}

/**
 * Resolves a cookie token to its active session row. Returns null when
 * the token is unknown, expired, or revoked.
 */
export async function findActiveSessionByToken(
  db: IdentityDb,
  plaintextToken: string,
): Promise<Session | null> {
  if (!plaintextToken) return null;
  const token_hash = sha256(plaintextToken);
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token_hash, token_hash), isNull(sessions.revoked_at)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (isExpired(row.expires_at)) return null;
  return row;
}

export async function revokeSession(db: IdentityDb, sessionId: string): Promise<void> {
  await db.update(sessions).set({ revoked_at: nowIso() }).where(eq(sessions.id, sessionId));
}

export async function revokeSessionByToken(db: IdentityDb, plaintextToken: string): Promise<void> {
  const token_hash = sha256(plaintextToken);
  await db.update(sessions).set({ revoked_at: nowIso() }).where(eq(sessions.token_hash, token_hash));
}

export async function revokeAllSessionsForUser(db: IdentityDb, userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revoked_at: nowIso() })
    .where(and(eq(sessions.user_id, userId), isNull(sessions.revoked_at)));
}

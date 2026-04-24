import { and, eq, isNull } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { IdentityDb } from './client';
import { verification_tokens, type VerificationType } from './schema';
import { addHoursIso, isExpired, nowIso, randomToken, sha256 } from './crypto';

const DEFAULT_EMAIL_VERIFY_HOURS = 48;
const DEFAULT_PASSWORD_RESET_HOURS = 1;

export interface IssueTokenInput {
  user_id: string;
  type: VerificationType;
  hours?: number;
}

export interface IssuedToken {
  id: string;
  /** Plaintext to email to the user. Server keeps only its hash. */
  plaintext: string;
  expires_at: string;
}

export async function issueVerificationToken(db: IdentityDb, input: IssueTokenInput): Promise<IssuedToken> {
  const hours =
    input.hours ??
    (input.type === 'password_reset' ? DEFAULT_PASSWORD_RESET_HOURS : DEFAULT_EMAIL_VERIFY_HOURS);
  const plaintext = randomToken(32);
  const token_hash = sha256(plaintext);
  const id = randomUUID();
  const expires_at = addHoursIso(hours);

  await db.insert(verification_tokens).values({
    id,
    user_id: input.user_id,
    token_hash,
    type: input.type,
    expires_at,
    consumed_at: null,
    created_at: nowIso(),
  });

  return { id, plaintext, expires_at };
}

/**
 * Atomically consumes a token — returns the user_id on success, null if the
 * token is unknown, expired, or already consumed. Safe to call once; a
 * second call with the same token returns null.
 */
export async function consumeVerificationToken(
  db: IdentityDb,
  plaintextToken: string,
  expectedType: VerificationType,
): Promise<string | null> {
  const token_hash = sha256(plaintextToken);
  const rows = await db
    .select()
    .from(verification_tokens)
    .where(
      and(
        eq(verification_tokens.token_hash, token_hash),
        eq(verification_tokens.type, expectedType),
        isNull(verification_tokens.consumed_at),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (isExpired(row.expires_at)) return null;

  await db
    .update(verification_tokens)
    .set({ consumed_at: nowIso() })
    .where(eq(verification_tokens.id, row.id));

  return row.user_id;
}

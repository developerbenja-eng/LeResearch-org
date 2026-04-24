import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { hashPassword, comparePassword } from '@leresearch-org/auth/password';
import type { IdentityDb } from './client';
import { users, oauth_accounts, toPublicUser, type User, type PublicUser } from './schema';
import { nowIso } from './crypto';

export async function findUserByEmail(db: IdentityDb, email: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return rows[0] ?? null;
}

export async function findUserById(db: IdentityDb, id: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface CreateUserInput {
  email: string;
  password?: string;
  name?: string | null;
  avatar_url?: string | null;
  email_verified?: boolean;
}

/** Creates a user. Caller is responsible for granting app access afterwards. */
export async function createUser(db: IdentityDb, input: CreateUserInput): Promise<User> {
  const email = input.email.toLowerCase().trim();
  const existing = await findUserByEmail(db, email);
  if (existing) throw new Error('A user with this email already exists.');

  const password_hash = input.password ? await hashPassword(input.password) : null;
  const id = randomUUID();
  const now = nowIso();

  await db.insert(users).values({
    id,
    email,
    name: input.name ?? null,
    password_hash,
    avatar_url: input.avatar_url ?? null,
    email_verified: input.email_verified ?? false,
    created_at: now,
    updated_at: now,
  });

  const created = await findUserById(db, id);
  if (!created) throw new Error('User insert succeeded but row not found.');
  return created;
}

/** Verifies email+password, returns the user on success or null on miss. */
export async function verifyPasswordLogin(
  db: IdentityDb,
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByEmail(db, email);
  if (!user || !user.password_hash) return null;
  const ok = await comparePassword(password, user.password_hash);
  return ok ? user : null;
}

export async function updatePassword(db: IdentityDb, userId: string, newPassword: string): Promise<void> {
  const hash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ password_hash: hash, updated_at: nowIso() })
    .where(eq(users.id, userId));
}

export async function markEmailVerified(db: IdentityDb, userId: string): Promise<void> {
  await db
    .update(users)
    .set({ email_verified: true, updated_at: nowIso() })
    .where(eq(users.id, userId));
}

export async function touchLastLogin(db: IdentityDb, userId: string): Promise<void> {
  const now = nowIso();
  await db.update(users).set({ last_login_at: now, updated_at: now }).where(eq(users.id, userId));
}

export async function updateProfile(
  db: IdentityDb,
  userId: string,
  patch: Partial<Pick<User, 'name' | 'avatar_url'>>,
): Promise<void> {
  await db
    .update(users)
    .set({ ...patch, updated_at: nowIso() })
    .where(eq(users.id, userId));
}

/**
 * OAuth upsert — either finds the user linked to (provider, provider_user_id)
 * or creates a new user + link. Email collisions against a password account
 * are resolved by linking the oauth record to the existing user.
 */
export interface OAuthProfile {
  provider: 'google' | 'github';
  provider_user_id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: string | null;
}

export async function upsertOAuthUser(db: IdentityDb, profile: OAuthProfile): Promise<User> {
  const existingLink = await db
    .select()
    .from(oauth_accounts)
    .where(eq(oauth_accounts.provider_user_id, profile.provider_user_id))
    .limit(1);

  if (existingLink[0]) {
    const user = await findUserById(db, existingLink[0].user_id);
    if (user) return user;
  }

  let user = await findUserByEmail(db, profile.email);
  if (!user) {
    user = await createUser(db, {
      email: profile.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
      email_verified: true,
    });
  }

  await db.insert(oauth_accounts).values({
    id: randomUUID(),
    user_id: user.id,
    provider: profile.provider,
    provider_user_id: profile.provider_user_id,
    access_token: profile.access_token ?? null,
    refresh_token: profile.refresh_token ?? null,
    expires_at: profile.expires_at ?? null,
    created_at: nowIso(),
  });

  return user;
}

export { toPublicUser, type PublicUser, type User };

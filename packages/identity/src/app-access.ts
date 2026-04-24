import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { IdentityDb } from './client';
import { user_app_access, type UserAppAccess, type AppId } from './schema';
import { nowIso } from './crypto';

export interface GrantAppAccessInput {
  user_id: string;
  app_id: AppId | string;
  role?: 'user' | 'admin' | 'owner';
  status?: 'active' | 'pending' | 'revoked';
  granted_by?: string | null;
}

/** Idempotent: re-granting an existing row flips it to the new role/status. */
export async function grantAppAccess(db: IdentityDb, input: GrantAppAccessInput): Promise<UserAppAccess> {
  const existing = await findAppAccess(db, input.user_id, input.app_id);
  if (existing) {
    await db
      .update(user_app_access)
      .set({
        role: input.role ?? existing.role,
        status: input.status ?? 'active',
        granted_by: input.granted_by ?? existing.granted_by,
      })
      .where(eq(user_app_access.id, existing.id));
    const refreshed = await findAppAccess(db, input.user_id, input.app_id);
    return refreshed!;
  }

  const row: UserAppAccess = {
    id: randomUUID(),
    user_id: input.user_id,
    app_id: input.app_id,
    role: input.role ?? 'user',
    status: input.status ?? 'active',
    granted_at: nowIso(),
    granted_by: input.granted_by ?? null,
  };
  await db.insert(user_app_access).values(row);
  return row;
}

export async function revokeAppAccess(db: IdentityDb, userId: string, appId: string): Promise<void> {
  await db
    .update(user_app_access)
    .set({ status: 'revoked' })
    .where(and(eq(user_app_access.user_id, userId), eq(user_app_access.app_id, appId)));
}

export async function findAppAccess(
  db: IdentityDb,
  userId: string,
  appId: string,
): Promise<UserAppAccess | null> {
  const rows = await db
    .select()
    .from(user_app_access)
    .where(and(eq(user_app_access.user_id, userId), eq(user_app_access.app_id, appId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listActiveAppsForUser(db: IdentityDb, userId: string): Promise<UserAppAccess[]> {
  const rows = await db
    .select()
    .from(user_app_access)
    .where(and(eq(user_app_access.user_id, userId), eq(user_app_access.status, 'active')));
  return rows;
}

export async function hasActiveAppAccess(db: IdentityDb, userId: string, appId: string): Promise<boolean> {
  const row = await findAppAccess(db, userId, appId);
  return !!row && row.status === 'active';
}

/** Shape embedded into JWT claims so downstream apps need no DB round-trip. */
export interface AppAccessClaim {
  apps: string[];
  roles: Record<string, 'user' | 'admin' | 'owner'>;
}

export function toAppAccessClaim(rows: UserAppAccess[]): AppAccessClaim {
  const apps: string[] = [];
  const roles: Record<string, 'user' | 'admin' | 'owner'> = {};
  for (const r of rows) {
    if (r.status !== 'active') continue;
    apps.push(r.app_id);
    roles[r.app_id] = r.role;
  }
  return { apps, roles };
}

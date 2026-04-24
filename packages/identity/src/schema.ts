import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Canonical set of LeDesign app ids.
 * Kept as a string union rather than a DB enum so new apps can be added
 * without a migration — the `user_app_access.app_id` column is just text
 * and existing rows are never re-typed.
 */
export const APP_IDS = [
  'echo-learn',
  'echo-tales',
  'echo-birds',
  'lecivil',
  'lejustice',
  'lecontain',
  'lemonitor',
  'lenotes',
  'lepulse',
  'poa',
  'web',
] as const;
export type AppId = (typeof APP_IDS)[number];

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  // Nullable for OAuth-only accounts that never set a password.
  password_hash: text('password_hash'),
  avatar_url: text('avatar_url'),
  email_verified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  last_login_at: text('last_login_at'),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  idx_users_email: uniqueIndex('idx_users_email').on(table.email),
}));

export const oauth_accounts = sqliteTable('oauth_accounts', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['google', 'github'] }).notNull(),
  provider_user_id: text('provider_user_id').notNull(),
  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  expires_at: text('expires_at'),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  idx_oauth_provider: uniqueIndex('idx_oauth_provider').on(table.provider, table.provider_user_id),
  idx_oauth_user: index('idx_oauth_user').on(table.user_id),
}));

/**
 * Server-side session record. The JWT itself is the primary credential; a
 * session row is kept per login so we can revoke (logout-everywhere) and
 * audit sign-ins by device.
 */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // SHA-256 hash of the opaque refresh token stored in the cookie.
  // We never keep the plaintext token server-side.
  token_hash: text('token_hash').notNull(),
  expires_at: text('expires_at').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  revoked_at: text('revoked_at'),
}, (table) => ({
  idx_sessions_user: index('idx_sessions_user').on(table.user_id),
  idx_sessions_token: uniqueIndex('idx_sessions_token_hash').on(table.token_hash),
}));

/**
 * Which LeDesign apps a user may access.
 * Missing row = no access. Presence is what grants, `status='active'` is
 * what makes it effective; per-app role is scoped here, not on users.
 */
export const user_app_access = sqliteTable('user_app_access', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  app_id: text('app_id').notNull(),
  role: text('role', { enum: ['user', 'admin', 'owner'] }).notNull().default('user'),
  status: text('status', { enum: ['active', 'pending', 'revoked'] }).notNull().default('active'),
  granted_at: text('granted_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  granted_by: text('granted_by').references(() => users.id),
}, (table) => ({
  idx_uaa_user_app: uniqueIndex('idx_uaa_user_app').on(table.user_id, table.app_id),
  idx_uaa_app: index('idx_uaa_app').on(table.app_id),
}));

/**
 * One-time tokens for email verification + password reset.
 * token_hash is SHA-256 of the plaintext sent to the user's email.
 */
export const verification_tokens = sqliteTable('verification_tokens', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').notNull(),
  type: text('type', { enum: ['email_verify', 'password_reset'] }).notNull(),
  expires_at: text('expires_at').notNull(),
  consumed_at: text('consumed_at'),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  idx_vt_token: uniqueIndex('idx_vt_token_hash').on(table.token_hash),
  idx_vt_user_type: index('idx_vt_user_type').on(table.user_id, table.type),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = Omit<User, 'password_hash'>;
export type OAuthAccount = typeof oauth_accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type UserAppAccess = typeof user_app_access.$inferSelect;
export type VerificationToken = typeof verification_tokens.$inferSelect;
export type VerificationType = VerificationToken['type'];

export function toPublicUser(u: User): PublicUser {
  const { password_hash: _pw, ...rest } = u;
  return rest;
}

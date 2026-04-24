-- 0001_init.sql — initial identity schema for ledesign-identity Turso DB

CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  password_hash   TEXT,
  avatar_url      TEXT,
  email_verified  INTEGER NOT NULL DEFAULT 0,
  last_login_at   TEXT,
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK(provider IN ('google','github')),
  provider_user_id  TEXT NOT NULL,
  access_token      TEXT,
  refresh_token     TEXT,
  expires_at        TEXT,
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider ON oauth_accounts(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_user ON oauth_accounts(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS user_app_access (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id      TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin','owner')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending','revoked')),
  granted_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by  TEXT REFERENCES users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_uaa_user_app ON user_app_access(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_uaa_app ON user_app_access(app_id);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  type         TEXT NOT NULL CHECK(type IN ('email_verify','password_reset')),
  expires_at   TEXT NOT NULL,
  consumed_at  TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vt_token_hash ON verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_vt_user_type ON verification_tokens(user_id, type);

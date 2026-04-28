export type EnabledHubs = 'tales' | 'learn' | 'both';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'superadmin' | 'owner';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  language_preference: 'en' | 'es';
  theme_preference: 'light' | 'dark';
  enabled_hubs: EnabledHubs;
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface CoinAccount {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'spend' | 'reward' | 'refund';
  description: string;
  reference_id: string | null;
  created_at: string;
}

export type PublicUser = Omit<User, 'password_hash'>;

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: User['role'];
  /** Apps the JWT grants — used by withAuth for app-access check. */
  apps: string[];
  /** Per-app roles from the JWT. */
  roles: Record<string, 'user' | 'admin' | 'owner'>;
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

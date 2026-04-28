// Admin Dashboard Types

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'inactive' | 'deleted';
  role: 'user' | 'admin' | 'superadmin' | 'owner';
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  email_verified: boolean;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  two_factor_enabled: boolean;
  marketing_emails: boolean;
  // Usage statistics
  subscription_tier: 'free' | 'pro' | 'premium';
  max_books_per_month: number;
  monthly_budget: number;
  books_this_month: number;
  images_this_month: number;
  cost_this_month: number;
  total_books: number;
  total_images: number;
  total_cost: number;
  // Character statistics
  total_characters: number;
  main_characters: number;
  guest_characters: number;
}

export interface AdminBook {
  id: string;
  user_id: string;
  title: string;
  status: 'draft' | 'generating' | 'completed' | 'published' | 'archived';
  educational_theme: string | null;
  age_range: string | null;
  page_count: number;
  generation_cost: number;
  created_at: string;
  user_name: string;
  user_email: string;
}

export interface AdminCharacter {
  id: string;
  user_id: string;
  character_name: string;
  character_type: 'main' | 'guest';
  is_active: boolean;
  created_at: string;
  user_name: string;
  books_count: number;
}

export interface AdminCoinAccount {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

export interface AdminCoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'spend' | 'reward' | 'refund' | 'admin_grant' | 'admin_revoke';
  description: string;
  reference_id: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
}

export interface CoinStats {
  total_coins_in_circulation: number;
  total_accounts: number;
  total_transactions: number;
  purchases_30_days: number;
  spend_30_days: number;
  rewards_30_days: number;
}

export interface AdminApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  user_name: string;
  user_email: string;
}

export interface ApiKeyStats {
  total_keys: number;
  active_keys: number;
  expired_keys: number;
  keys_used_30_days: number;
}

export interface AdminAIModel {
  id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'replicate' | 'stability' | 'custom';
  model_type: 'text' | 'image' | 'audio' | 'embedding';
  model_id: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  cost_per_1k_tokens: number | null;
  cost_per_image: number | null;
  max_tokens: number | null;
  context_window: number | null;
  capabilities: string[];
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
  usage_count: number;
  total_cost: number;
}

export interface AIModelStats {
  total_models: number;
  active_models: number;
  text_models: number;
  image_models: number;
  total_usage_30_days: number;
  total_cost_30_days: number;
}

export interface DatabaseTable {
  name: string;
  type: 'table' | 'view';
  rowCount: number;
  database: 'universal' | 'books';
}

export interface DatabaseColumn {
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: string | null;
  pk: boolean;
}

export interface DatabaseQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  inactive: number;
  verified: number;
  new_last_7_days: number;
  active_last_7_days: number;
}

export interface BookStats {
  total: number;
  draft: number;
  generating: number;
  completed: number;
  published: number;
  archived: number;
}

export interface CharacterStats {
  total: number;
  active: number;
  main_characters: number;
  guest_characters: number;
}

export interface UsageStats {
  books_this_month: number;
  images_this_month: number;
  cost_this_month: number;
  total_books: number;
  total_images: number;
  total_cost: number;
  by_tier: {
    free: number;
    pro: number;
    premium: number;
  };
}

export interface GenerationStats {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  running_jobs: number;
  avg_duration_seconds: number;
  total_tokens: number;
  total_ai_cost: number;
  success_rate: number;
}

export interface AdminMetrics {
  avg_cost_per_book: number;
  avg_books_per_user: number;
  avg_characters_per_user: number;
  user_growth_rate_7days: number;
  user_activity_rate_7days: number;
}

export interface RegistrationTrendItem {
  date: string;
  count: number;
}

export interface ThemeItem {
  theme: string;
  count: number;
}

export interface RecentActivityItem {
  type: 'book' | 'character';
  name: string;
  timestamp: string;
}

export interface AdminStatistics {
  users: UserStats;
  books: BookStats;
  characters: CharacterStats;
  usage: UsageStats;
  generation: GenerationStats;
  metrics: AdminMetrics;
}

export interface AdminCharts {
  registrationTrend: RegistrationTrendItem[];
  booksByTheme: ThemeItem[];
  recentActivity: RecentActivityItem[];
  topThemes: ThemeItem[];
}

export interface AdminDashboardData {
  statistics: AdminStatistics;
  charts: AdminCharts;
  timestamp: string;
}

// Admin auth roles
export const ADMIN_ROLES = ['admin', 'superadmin', 'owner'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

// Settings types
export type SettingCategory = 'general' | 'security' | 'email' | 'features' | 'limits' | 'integrations';
export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'secret';

export interface AdminSetting {
  id: string;
  key: string;
  value: string;
  type: SettingType;
  category: SettingCategory;
  label: string;
  description: string | null;
  is_sensitive: boolean;
  requires_restart: boolean;
  updated_at: string | null;
  updated_by: string | null;
}

export interface SettingUpdate {
  key: string;
  value: string;
}

export interface SettingsGroup {
  category: SettingCategory;
  label: string;
  description: string;
  settings: AdminSetting[];
}

// App Icons types
export type IconCategory = 'navigation' | 'actions' | 'status' | 'themes' | 'characters' | 'misc';

export interface AdminAppIcon {
  id: string;
  name: string;
  category: IconCategory;
  icon_type: 'emoji' | 'svg' | 'url';
  icon_value: string;
  description: string | null;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface IconStats {
  total_icons: number;
  active_icons: number;
  by_category: Record<IconCategory, number>;
  most_used: { name: string; count: number }[];
}

// Design Editor types
export interface DesignTheme {
  id: string;
  name: string;
  is_active: boolean;
  is_default: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
  created_at: string;
  updated_at: string | null;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text_primary: string;
  text_secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeTypography {
  font_family_heading: string;
  font_family_body: string;
  font_size_base: number;
  line_height_base: number;
  font_weight_normal: number;
  font_weight_bold: number;
}

export interface ThemeSpacing {
  unit: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBorders {
  radius_sm: number;
  radius_md: number;
  radius_lg: number;
  radius_full: number;
  width_default: number;
}

// Marketing types
export type MarketingContentType = 'hero' | 'feature' | 'testimonial' | 'faq' | 'cta' | 'stat';

export interface MarketingContent {
  id: string;
  type: MarketingContentType;
  title: string;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  order_index: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
}

export interface MarketingStats {
  total_content: number;
  active_content: number;
  by_type: Record<MarketingContentType, number>;
}

// Email types
export type EmailTemplateType = 'welcome' | 'password_reset' | 'verification' | 'notification' | 'marketing' | 'transactional';
export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed';

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  html_body: string;
  text_body: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface EmailLog {
  id: string;
  template_id: string | null;
  template_name: string | null;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  status: EmailStatus;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EmailStats {
  total_sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  pending: number;
  open_rate: number;
  click_rate: number;
  sent_24h: number;
  sent_7d: number;
  sent_30d: number;
}

export interface EmailTemplateStats {
  total_templates: number;
  active_templates: number;
  by_type: Record<EmailTemplateType, number>;
}

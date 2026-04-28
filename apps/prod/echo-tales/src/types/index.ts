// User types
export * from './user';

// Book types
export * from './book';

// Character types
export * from './character';

// Song/Music types
export * from './song';

// Podcast types
export * from './podcast';

// Notebook types
export * from './notebook';

// Social types
export * from './social';

// Research types
export * from './research';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Common types
export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

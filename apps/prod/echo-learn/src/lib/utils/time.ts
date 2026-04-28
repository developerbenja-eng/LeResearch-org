/**
 * Shared time formatting utilities.
 * Replaces 20+ duplicate implementations across the codebase.
 */

/** Format seconds to m:ss (e.g. 125 → "2:05") */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Format milliseconds to m:ss (e.g. 125000 → "2:05") */
export function formatTimeMs(ms: number): string {
  return formatTime(ms / 1000);
}

/** Format seconds to human-readable duration (e.g. 3725 → "1h 2m", 125 → "2m") */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Format milliseconds to m:ss for track durations (e.g. 185000 → "3:05") */
export function formatDurationMs(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

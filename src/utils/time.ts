export const MISSION_TOTAL_MINUTES = 105;
export const MISSION_TOTAL_SECONDS = MISSION_TOTAL_MINUTES * 60; // 6300 seconds

/**
 * Calculates remaining mission time based on authoritative start timestamp and paused duration.
 * Both operatives derive the exact same remaining time from this calculation.
 */
export function calculateRemainingSeconds(
  startTime: number | null,
  nowMs: number = Date.now(),
  pausedOffsetSeconds: number = 0,
  durationMinutes: number = MISSION_TOTAL_MINUTES,
  status: string = 'ACTIVE',
  pausedAt: number | null = null
): {
  remainingSeconds: number;
  elapsedSeconds: number;
  isExpired: boolean;
  percentage: number;
} {
  const totalSeconds = durationMinutes * 60;

  if (!startTime || status === 'NOT_STARTED' || status === 'WAITING') {
    return {
      remainingSeconds: totalSeconds,
      elapsedSeconds: 0,
      isExpired: false,
      percentage: 100,
    };
  }

  // If paused, freeze calculation at the pausedAt timestamp
  const effectiveNow = status === 'PAUSED' && pausedAt ? pausedAt : nowMs;

  const elapsedSeconds = Math.max(0, Math.floor((effectiveNow - startTime) / 1000) - pausedOffsetSeconds);
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const isExpired = remainingSeconds <= 0 || status === 'FINISHED';
  const percentage = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  return {
    remainingSeconds,
    elapsedSeconds,
    isExpired,
    percentage,
  };
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatTimeDisplay(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formats a short timestamp into HH:MM:SS UTC
 */
export function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

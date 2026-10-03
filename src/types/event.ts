export type EventStatus = 'NOT_STARTED' | 'WAITING' | 'ACTIVE' | 'PAUSED' | 'FINISHED';

export interface EventConfig {
  eventId: string;
  eventName: string;
  platformName: string;
  status: EventStatus;
  durationMinutes: number; // 105
  startTime: number | null;
  endTime: number | null;
  pausedAt: number | null;
  totalPausedTimeSeconds: number;
  totalLevels: number; // 15
  maxTeams: number; // 125
  teamSize: number; // 2
  speedBonuses: {
    veryFastSeconds: number; // e.g. < 120s => +50
    fastSeconds: number;     // e.g. < 240s => +30
    normalSeconds: number;   // e.g. < 420s => +15
  };
  wrongAttemptPenaltyXP: number; // 10
  aiPenaltySchedule: number[]; // [25, 50, 75, 100]
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  totalScore: number;
  levelsCompleted: number;
  currentLevel: number;
  elapsedSeconds: number;
  status: 'active' | 'finished' | 'disqualified';
  lastSubmissionTime: number;
}

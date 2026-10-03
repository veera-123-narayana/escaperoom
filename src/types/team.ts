import { OperativeRole } from './game';

export type TeamStatus = 'waiting' | 'active' | 'finished' | 'locked';

export interface LevelProgress {
  levelId: string;
  levelNumber: number;
  status: 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';
  completedAt?: number;
  completedByRole?: OperativeRole;
  completedByName?: string;
  timeSpentSeconds: number;
  earnedXP: number;
  hintsUsed: number[]; // e.g. [1, 2]
  wrongAttemptsCount: number;
  aiDeclaredCount: number;
  currentAttempt?: string;
  startedAt?: number;
}

export interface TeamMember {
  uid: string;
  name: string;
  email: string;
  callsign: string;
  role: OperativeRole;
  isOnline: boolean;
  currentLevelNumber: number;
  lastHeartbeat: number;
}

export interface TeamState {
  id: string; // e.g., 'OMEGA-017'
  teamName: string;
  joinCode: string;
  status: TeamStatus;
  totalScore: number;
  currentLevel: number; // Highest unlocked or currently targeted level
  startTime: number | null;
  finishedAt: number | null;
  memberCount: number;
  members: {
    memberA?: TeamMember;
    memberB?: TeamMember;
  };
  levelProgress: Record<string, LevelProgress>;
  hintsCostTotal: number;
  penaltiesTotal: number;
  bonusXpTotal: number;
  createdAt: number;
  updatedAt: number;
}

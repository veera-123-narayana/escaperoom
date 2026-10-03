export type OperativeRole = 'memberA' | 'memberB' | 'admin';

export interface OperativeProfile {
  uid: string;
  name: string;
  email: string;
  teamId: string | null;
  role: OperativeRole;
  callsign: string;
  avatarSeed?: string;
  createdAt: number;
  lastActive: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  operativeCallsign: string;
  operativeRole: OperativeRole;
  type: 'CONNECT' | 'DISCONNECT' | 'LEVEL_START' | 'LEVEL_COMPLETE' | 'HINT_USED' | 'AI_DECLARED' | 'PENALTY_INCURRED' | 'SYSTEM_ALERT';
  message: string;
  deltaXp?: number;
  levelNumber?: number;
}

export type AIPenaltyTier = 0 | 25 | 50 | 75 | 100;

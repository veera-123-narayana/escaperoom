import { create } from 'zustand';
import { EventConfig, EventStatus, LeaderboardEntry } from '../types/event';

interface EventStoreState {
  config: EventConfig;
  status: EventStatus;
  startTime: number | null;
  endTime: number | null;
  pausedAt: number | null;
  totalPausedTimeSeconds: number;
  durationMinutes: number;
  leaderboard: LeaderboardEntry[];
  setEventStatus: (status: EventStatus) => void;
  startEvent: () => void;
  pauseEvent: () => void;
  resumeEvent: () => void;
  extendTime: (additionalMinutes: number) => void;
  finishEvent: () => void;
  resetEvent: () => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
}

const DEFAULT_CONFIG: EventConfig = {
  eventId: 'omega-protocol-2026',
  eventName: 'TECH ESCAPE ROOM: THE OMEGA PROTOCOL',
  platformName: 'SYSTEM OMEGA',
  status: 'ACTIVE',
  durationMinutes: 105,
  startTime: null,
  endTime: null,
  pausedAt: null,
  totalPausedTimeSeconds: 0,
  totalLevels: 15,
  maxTeams: 125,
  teamSize: 2,
  speedBonuses: {
    veryFastSeconds: 120,
    fastSeconds: 240,
    normalSeconds: 420,
  },
  wrongAttemptPenaltyXP: 10,
  aiPenaltySchedule: [25, 50, 75, 100],
};

export const useEventStore = create<EventStoreState>((set, get) => ({
  config: DEFAULT_CONFIG,
  status: 'ACTIVE',
  startTime: Date.now(), // Authoritative tournament start timestamp
  endTime: null,
  pausedAt: null,
  totalPausedTimeSeconds: 0,
  durationMinutes: 105,
  leaderboard: [
    {
      rank: 1,
      teamId: 'OMEGA-017',
      teamName: 'CYBER VANGUARDS',
      totalScore: 0,
      levelsCompleted: 0,
      currentLevel: 1,
      elapsedSeconds: 0,
      status: 'active',
      lastSubmissionTime: Date.now(),
    },
    {
      rank: 2,
      teamId: 'OMEGA-004',
      teamName: 'SYNTAX PHANTOMS',
      totalScore: 0,
      levelsCompleted: 0,
      currentLevel: 1,
      elapsedSeconds: 0,
      status: 'active',
      lastSubmissionTime: Date.now() - 30000,
    },
    {
      rank: 3,
      teamId: 'OMEGA-082',
      teamName: 'QUANTUM SPECTRES',
      totalScore: 0,
      levelsCompleted: 0,
      currentLevel: 1,
      elapsedSeconds: 0,
      status: 'active',
      lastSubmissionTime: Date.now() - 60000,
    },
  ],

  setEventStatus: (status) => set({ status }),

  startEvent: () =>
    set({
      status: 'ACTIVE',
      startTime: Date.now(),
      endTime: null,
      pausedAt: null,
      totalPausedTimeSeconds: 0,
    }),

  pauseEvent: () => {
    const current = get();
    if (current.status !== 'ACTIVE') return;
    set({
      status: 'PAUSED',
      pausedAt: Date.now(),
    });
  },

  resumeEvent: () => {
    const current = get();
    if (current.status !== 'PAUSED') return;
    const additionalPaused = current.pausedAt ? Math.floor((Date.now() - current.pausedAt) / 1000) : 0;
    set({
      status: 'ACTIVE',
      pausedAt: null,
      totalPausedTimeSeconds: current.totalPausedTimeSeconds + additionalPaused,
    });
  },

  extendTime: (additionalMinutes: number) => {
    set((state) => ({
      durationMinutes: state.durationMinutes + additionalMinutes,
      config: {
        ...state.config,
        durationMinutes: state.config.durationMinutes + additionalMinutes,
      },
    }));
  },

  finishEvent: () => set({ status: 'FINISHED', endTime: Date.now() }),

  resetEvent: () =>
    set({
      status: 'WAITING',
      startTime: null,
      endTime: null,
      pausedAt: null,
      totalPausedTimeSeconds: 0,
      durationMinutes: 105,
    }),

  setLeaderboard: (leaderboard) => set({ leaderboard }),
}));

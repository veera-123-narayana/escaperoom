import { create } from 'zustand';
import { OperativeProfile, OperativeRole, ActivityEvent } from '../types/game';
import { TeamState, LevelProgress } from '../types/team';
import { OMEGA_LEVELS } from '../levels/levelsCatalog';
import { omegaAudio } from '../utils/audio';

interface GameStoreState {
  // Operative Profile
  operative: OperativeProfile | null;
  setOperative: (profile: OperativeProfile | null) => void;

  // Active Team State
  team: TeamState | null;
  setTeam: (team: TeamState | null) => void;
  updateTeamScore: (deltaXP: number) => void;
  updateLevelProgress: (levelNumber: number, progress: Partial<LevelProgress>) => void;

  // Active UI Navigation / Selected Level
  activeLevelNumber: number;
  setActiveLevelNumber: (levelNumber: number) => void;

  // Activity Feed
  activityFeed: ActivityEvent[];
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;

  // Audio Controls
  isAudioMuted: boolean;
  audioVolume: number;
  toggleAudioMute: () => void;
  setAudioVolume: (volume: number) => void;

  // Diagnostics & Simulation Helpers for Phase 1 verification
  initializeDefaultSession: () => void;
}

// Generate default level progress map for all 15 levels
export function createInitialLevelProgress(): Record<string, LevelProgress> {
  const map: Record<string, LevelProgress> = {};
  OMEGA_LEVELS.forEach((lvl) => {
    map[`level-${lvl.number.toString().padStart(2, '0')}`] = {
      levelId: lvl.id,
      levelNumber: lvl.number,
      status: lvl.number === 1 ? 'AVAILABLE' : 'LOCKED',
      timeSpentSeconds: 0,
      earnedXP: 0,
      hintsUsed: [],
      wrongAttemptsCount: 0,
      aiDeclaredCount: 0,
    };
  });
  return map;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  operative: null,
  setOperative: (profile) => set({ operative: profile }),

  team: null,
  setTeam: (team) => set({ team }),

  updateTeamScore: (deltaXP) => {
    const currentTeam = get().team;
    if (!currentTeam) return;
    const newScore = Math.max(0, currentTeam.totalScore + deltaXP);
    set({
      team: {
        ...currentTeam,
        totalScore: newScore,
        updatedAt: Date.now(),
      },
    });
  },

  updateLevelProgress: (levelNumber, updates) => {
    const currentTeam = get().team;
    if (!currentTeam) return;
    const key = `level-${levelNumber.toString().padStart(2, '0')}`;
    const existing = currentTeam.levelProgress[key] || {
      levelId: `level-${levelNumber.toString().padStart(2, '0')}`,
      levelNumber,
      status: 'AVAILABLE',
      timeSpentSeconds: 0,
      earnedXP: 0,
      hintsUsed: [],
      wrongAttemptsCount: 0,
      aiDeclaredCount: 0,
    };

    const updatedLevelProgress = {
      ...currentTeam.levelProgress,
      [key]: { ...existing, ...updates },
    };

    set({
      team: {
        ...currentTeam,
        levelProgress: updatedLevelProgress,
        updatedAt: Date.now(),
      },
    });
  },

  activeLevelNumber: 1,
  setActiveLevelNumber: (levelNumber) => {
    omegaAudio.playClick();
    set({ activeLevelNumber: levelNumber });
  },

  activityFeed: [
    {
      id: 'act-0',
      timestamp: Date.now(),
      operativeCallsign: 'SYSTEM',
      operativeRole: 'admin',
      type: 'SYSTEM_ALERT',
      message: 'SYSTEM OMEGA CORE DEFENSE INITIALIZED. 15 SECTORS ISOLATED.',
    },
  ],
  addActivityEvent: (event) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      activityFeed: [newEvent, ...state.activityFeed.slice(0, 49)],
    }));
  },

  isAudioMuted: false,
  audioVolume: 0.4,
  toggleAudioMute: () => {
    const newMute = !get().isAudioMuted;
    omegaAudio.setMuted(newMute);
    if (!newMute) {
      omegaAudio.playClick();
    }
    set({ isAudioMuted: newMute });
  },
  setAudioVolume: (volume) => {
    omegaAudio.setVolume(volume);
    set({ audioVolume: volume });
  },

  initializeDefaultSession: () => {
    const sampleOperative: OperativeProfile = {
      uid: 'op-alpha-001',
      name: 'Operative Vanguard',
      email: 'vanguard@omega.defense',
      teamId: 'OMEGA-017',
      role: 'memberA',
      callsign: 'OMEGA-017-A',
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    const initialProgress = createInitialLevelProgress();

    const sampleTeam: TeamState = {
      id: 'OMEGA-017',
      teamName: 'CYBER VANGUARDS',
      joinCode: 'OMG-9942',
      status: 'active',
      totalScore: 0,
      currentLevel: 1,
      startTime: Date.now(),
      finishedAt: null,
      memberCount: 2,
      members: {
        memberA: {
          uid: 'op-alpha-001',
          name: 'Operative Vanguard',
          email: 'vanguard@omega.defense',
          callsign: 'OMEGA-017-A',
          role: 'memberA',
          isOnline: true,
          currentLevelNumber: 1,
          lastHeartbeat: Date.now(),
        },
        memberB: {
          uid: 'op-beta-002',
          name: 'Operative Cipher',
          email: 'cipher@omega.defense',
          callsign: 'OMEGA-017-B',
          role: 'memberB',
          isOnline: true,
          currentLevelNumber: 1,
          lastHeartbeat: Date.now(),
        },
      },
      levelProgress: initialProgress,
      hintsCostTotal: 0,
      penaltiesTotal: 0,
      bonusXpTotal: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set({
      operative: sampleOperative,
      team: sampleTeam,
      activeLevelNumber: 1,
    });
  },
}));

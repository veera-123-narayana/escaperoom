export type AIPolicy = 'DISCOURAGED' | 'ALLOWED' | 'PROHIBITED';

export type LevelDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type LevelCategory =
  | 'NETWORKING'
  | 'INVESTIGATION'
  | 'CRYPTOGRAPHY'
  | 'AUDIO_SIGNAL'
  | 'AI_REASONING'
  | 'PROGRAMMING'
  | 'DIGITAL_FORENSICS'
  | 'CYBER_DEFENSE'
  | 'LOGIC_CULTURE'
  | 'HARDWARE'
  | 'NETWORK_ALGO'
  | 'DSA_BOSS'
  | 'AI_AGENTS'
  | 'MULTIMODAL_AI'
  | 'OMEGA_CORE';

export interface LevelHint {
  index: number; // 1, 2, 3
  title: string;
  costXP: number; // 25, 50, 75
  content: string;
}

export interface LevelDefinition {
  id: string; // 'level-01'
  number: number; // 1 - 15
  title: string;
  codename: string;
  category: LevelCategory;
  difficulty: LevelDifficulty;
  domain: string;
  baseXP: number;
  aiPolicy: AIPolicy;
  environmentId: string;
  environmentName: string;
  story: string;
  objective: string;
  clue: string;
  hints: LevelHint[];
  estimatedMinutes: number;
  allowsParallelInvestigation: boolean;
}

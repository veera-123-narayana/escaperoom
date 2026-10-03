import { AIPolicy } from '../types/level';

export interface ScoreBreakdown {
  baseXP: number;
  speedBonusXP: number;
  hintsCostXP: number;
  penaltiesXP: number;
  aiPenaltiesXP: number;
  netXP: number;
}

export const SPEED_BONUS_TIERS = {
  VERY_FAST: 50, // under 2 minutes
  FAST: 30,      // under 4 minutes
  NORMAL: 15,    // under 7 minutes
  SLOW: 0,
};

export const WRONG_ATTEMPT_PENALTY = 10;

export const AI_PENALTY_TIERS = [25, 50, 75, 100];

/**
 * Calculates speed bonus based on time taken to solve the level in seconds.
 */
export function calculateSpeedBonus(timeSpentSeconds: number): number {
  if (timeSpentSeconds < 120) return SPEED_BONUS_TIERS.VERY_FAST;
  if (timeSpentSeconds < 240) return SPEED_BONUS_TIERS.FAST;
  if (timeSpentSeconds < 420) return SPEED_BONUS_TIERS.NORMAL;
  return SPEED_BONUS_TIERS.SLOW;
}

/**
 * Computes the penalty for declared AI usage on an AI-discouraged level.
 * 1st declared: -25 XP
 * 2nd declared: -50 XP
 * 3rd declared: -75 XP
 * 4th and later: -100 XP
 */
export function calculateAIPenalty(
  aiUsageCountForTeam: number,
  aiPolicy: AIPolicy
): number {
  if (aiPolicy === 'ALLOWED') return 0;
  if (aiUsageCountForTeam <= 0) return 0;

  const index = Math.min(aiUsageCountForTeam - 1, AI_PENALTY_TIERS.length - 1);
  return AI_PENALTY_TIERS[index];
}

/**
 * Computes hint cost based on hint index (1, 2, 3)
 */
export function getHintCost(hintIndex: number): number {
  switch (hintIndex) {
    case 1:
      return 25;
    case 2:
      return 50;
    case 3:
      return 75;
    default:
      return 25;
  }
}

/**
 * Computes the total net score ensuring it never drops below 0
 */
export function sanitizeScore(score: number): number {
  return Math.max(0, Math.floor(score));
}

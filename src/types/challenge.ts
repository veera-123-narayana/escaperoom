export interface ChallengeSeedContext {
  teamId: string;
  levelNumber: number;
  seed: number;
}

export interface SubmissionPayload {
  teamId: string;
  levelId: string;
  levelNumber: number;
  operativeUid: string;
  operativeName: string;
  answer: string;
  clientTimestamp: number;
}

export interface VerificationResult {
  isCorrect: boolean;
  message: string;
  earnedXP: number;
  speedBonusXP: number;
  penaltyXP: number;
  totalAwardedXP: number;
  nextLevelUnlocked?: number;
  timeSpentSeconds: number;
}

export interface DynamicChallengePayload<T = unknown> {
  levelNumber: number;
  challengeId: string;
  seed: number;
  teamSignature: string;
  interactiveData: T;
  instructions: string[];
}

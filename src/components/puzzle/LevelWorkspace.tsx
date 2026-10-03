import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  Info,
  CheckCircle,
  Lock,
  Unlock,
  ChevronRight,
  Send,
  Bot,
  Zap,
} from 'lucide-react';
import { LevelDefinition } from '../../types/level';
import { OMEGA_LEVELS } from '../../levels/levelsCatalog';
import { useGameStore } from '../../store/gameStore';
import { useEventStore } from '../../store/eventStore';
import { omegaAudio } from '../../utils/audio';
import { logTeamActivity } from '../../services/teamService';

// Standardized verification code lookup for all 15 challenge levels
export const LEVEL_VERIFICATION_KEYS: Record<number, string[]> = {
  1: ['FIX-GATEWAY-192.168.1.1', '192.168.1.1'],
  2: ['AUTH-OSINT-CYPHER99', 'CYPHER99'],
  3: ['RETURN_VALUE_5050', '5050'],
  4: ['MALICIOUS-IP-185.220.101.5', '185.220.101.5'],
  5: ['AKIA-OMEGA-EXFIL-9482'],
  6: ['CYBER_RESILIENCE_CORE'],
  7: ['ESCAPE-CONTAINER-PRV-ROOT'],
  8: ['ADMIN_SECRET_KEY_DB_2026'],
  9: ['OMEGA_OVERRIDE_CODENAME_PHOENIX'],
  10: ['DECRYPT-XOR-KEY-0x9F4C', '0x9F4C'],
  11: ['0x7FFFFFFFE480'],
  12: ['PTR_LEAK_0x00401A20', '0x00401A20'],
  13: ['EMP-8842-MALIK'],
  14: ['CRYPTO-LATTICE-KYBER-1024', 'KYBER-1024'],
  15: ['OMEGA_CORE_CONTAINMENT_RESTORED_2026'],
};

// Import all 15 Interactive level puzzle components
import { Level01NetworkDiagnostics } from './levels/Level01NetworkDiagnostics';
import { Level02OsintForensics } from './levels/Level02OsintForensics';
import { Level03ScriptDebugger } from './levels/Level03ScriptDebugger';
import { Level04PhishingAnalyzer } from './levels/Level04PhishingAnalyzer';
import { Level05CloudBreach } from './levels/Level05CloudBreach';
import { Level06Steganography } from './levels/Level06Steganography';
import { Level07RogueContainer } from './levels/Level07RogueContainer';
import { Level08SqlInjection } from './levels/Level08SqlInjection';
import { Level09AiHallucination } from './levels/Level09AiHallucination';
import { Level10RansomwareIncident } from './levels/Level10RansomwareIncident';
import { Level11ZeroDayResearch } from './levels/Level11ZeroDayResearch';
import { Level12MemoryProfiler } from './levels/Level12MemoryProfiler';
import { Level13InsiderThreatSiem } from './levels/Level13InsiderThreatSiem';
import { Level14QuantumCryptography } from './levels/Level14QuantumCryptography';
import { Level15OmegaCoreReactor } from './levels/Level15OmegaCoreReactor';

interface LevelWorkspaceProps {
  levelNumber: number;
  onClose: () => void;
  onLevelComplete?: (lvlNum: number, earnedXP: number) => void;
}

export const LevelWorkspace: React.FC<LevelWorkspaceProps> = ({
  levelNumber,
  onClose,
  onLevelComplete,
}) => {
  const level = OMEGA_LEVELS.find((l) => l.number === levelNumber) || OMEGA_LEVELS[0];
  const { operative, team, updateTeamScore, updateLevelProgress, addActivityEvent } = useGameStore();
  const { status: eventStatus } = useEventStore();

  const progressKey = `level-${level.number.toString().padStart(2, '0')}`;
  const progress = team?.levelProgress[progressKey];
  const isCompleted = progress?.status === 'COMPLETED';

  // Submission input & cooldown rate-limiter
  const [submissionInput, setSubmissionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Speed bonus elapsed tracker
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Hints state & confirmation modal
  const [unlockedHints, setUnlockedHints] = useState<number[]>(progress?.hintsUsed || []);
  const [confirmingHint, setConfirmingHint] = useState<{ index: number; costXP: number } | null>(null);

  // AI Assistance declaration
  const [aiDeclared, setAiDeclared] = useState(false);

  // Elapsed timer tick
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Cooldown countdown tick
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setTimeout(() => {
      setCooldownRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownRemaining]);

  // Determine speed bonus
  const calculateSpeedBonus = (seconds: number) => {
    if (seconds < 120) return 50; // < 2 min
    if (seconds < 240) return 30; // < 4 min
    if (seconds < 420) return 15; // < 7 min
    return 0;
  };

  const handleUnlockHint = async (hintIndex: number, costXP: number) => {
    omegaAudio.playError();
    updateTeamScore(-costXP);
    setUnlockedHints([...unlockedHints, hintIndex]);
    setConfirmingHint(null);

    const eventPayload = {
      operativeCallsign: operative?.callsign || 'OPERATIVE',
      operativeRole: operative?.role || 'memberA',
      type: 'HINT_USED' as const,
      message: `${operative?.callsign} UNLOCKED HINT ${hintIndex} ON SECTOR ${level.number.toString().padStart(2, '0')} (-${costXP} XP)`,
      deltaXp: -costXP,
      levelNumber: level.number,
    };

    if (team && team.id !== 'OMEGA-017') {
      await logTeamActivity(team.id, eventPayload);
    }
    addActivityEvent(eventPayload);
  };

  const handleSubmitVerification = async (codeValue?: string) => {
    const candidate = (codeValue || submissionInput).trim().toUpperCase();
    if (!candidate || isSubmitting || cooldownRemaining > 0) return;

    if (eventStatus === 'PAUSED' || eventStatus === 'FINISHED') {
      setSubmissionFeedback({
        type: 'error',
        message: 'SUBMISSIONS TEMPORARILY BLOCKED BY EVENT STATUS.',
      });
      omegaAudio.playError();
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);

    // Verify against valid target verification codes
    const targetCodes = LEVEL_VERIFICATION_KEYS[level.number] || [];
    const isCorrect = targetCodes.some((target) => candidate === target.trim().toUpperCase());

    if (isCorrect) {
      omegaAudio.playSuccess();
      const speedBonus = calculateSpeedBonus(elapsedSeconds);
      const totalEarned = level.baseXP + speedBonus;

      updateTeamScore(totalEarned);
      updateLevelProgress(level.number, {
        status: 'COMPLETED',
        earnedXP: totalEarned,
        completedAt: Date.now(),
        completedByName: operative?.callsign,
        completedByRole: operative?.role,
        timeSpentSeconds: elapsedSeconds,
      });

      // Unlock next level
      if (level.number < 15) {
        updateLevelProgress(level.number + 1, { status: 'AVAILABLE' });
      }

      setSubmissionFeedback({
        type: 'success',
        message: `AUTHORIZATION VERIFIED! +${level.baseXP} Base XP ${speedBonus > 0 ? `+${speedBonus} Speed Bonus!` : ''}`,
      });

      const eventPayload = {
        operativeCallsign: operative?.callsign || 'OPERATIVE',
        operativeRole: operative?.role || 'memberA',
        type: 'LEVEL_COMPLETE' as const,
        message: `LEVEL ${level.number.toString().padStart(2, '0')} (${level.title}) SECURED (+${totalEarned} XP)`,
        deltaXp: totalEarned,
        levelNumber: level.number,
      };

      if (team && team.id !== 'OMEGA-017') {
        await logTeamActivity(team.id, eventPayload);
      }
      addActivityEvent(eventPayload);

      if (onLevelComplete) {
        onLevelComplete(level.number, totalEarned);
      }
    } else {
      omegaAudio.playError();
      setCooldownRemaining(5); // 5-second anti-brute-force rate limit
      updateTeamScore(-10); // -10 XP wrong attempt penalty

      setSubmissionFeedback({
        type: 'error',
        message: 'INVALID VERIFICATION CODE. -10 XP PENALTY APPLIED. RATE LIMIT ENGAGED (5s).',
      });

      const eventPayload = {
        operativeCallsign: operative?.callsign || 'OPERATIVE',
        operativeRole: operative?.role || 'memberA',
        type: 'PENALTY_INCURRED' as const,
        message: `FAILED VERIFICATION ON LEVEL ${level.number.toString().padStart(2, '0')} (-10 XP)`,
        deltaXp: -10,
        levelNumber: level.number,
      };

      if (team && team.id !== 'OMEGA-017') {
        await logTeamActivity(team.id, eventPayload);
      }
      addActivityEvent(eventPayload);
    }

    setIsSubmitting(false);
  };

  // Render the level-specific interactive challenge
  const renderInteractivePuzzle = () => {
    switch (level.number) {
      case 1:
        return <Level01NetworkDiagnostics isCompleted={isCompleted} />;
      case 2:
        return <Level02OsintForensics isCompleted={isCompleted} />;
      case 3:
        return <Level03ScriptDebugger />;
      case 4:
        return <Level04PhishingAnalyzer />;
      case 5:
        return <Level05CloudBreach />;
      case 6:
        return <Level06Steganography />;
      case 7:
        return <Level07RogueContainer />;
      case 8:
        return <Level08SqlInjection />;
      case 9:
        return <Level09AiHallucination />;
      case 10:
        return <Level10RansomwareIncident />;
      case 11:
        return <Level11ZeroDayResearch />;
      case 12:
        return <Level12MemoryProfiler />;
      case 13:
        return <Level13InsiderThreatSiem />;
      case 14:
        return <Level14QuantumCryptography />;
      case 15:
        return <Level15OmegaCoreReactor />;
      default:
        return <Level01NetworkDiagnostics isCompleted={isCompleted} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto font-mono">
      <div className="relative w-full max-w-5xl rounded-2xl border border-cyan-500/50 bg-slate-950 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-900/60 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-black text-cyan-400">
              {level.number.toString().padStart(2, '0')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-bold">SECTOR {level.number.toString().padStart(2, '0')}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 uppercase">{level.domain}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">{level.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Bonus Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
              <span className="text-emerald-400 font-bold">+{calculateSpeedBonus(elapsedSeconds)} XP BONUS</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Briefing, Clues, Hints (1 col) */}
          <div className="space-y-4 text-xs">
            {/* Mission Story */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> INCIDENT TELEMETRY
              </div>
              <p className="text-slate-300 leading-relaxed">{level.story}</p>
            </div>

            {/* Objective */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> PRIMARY OBJECTIVE
              </div>
              <p className="text-slate-300 leading-relaxed">{level.objective}</p>
            </div>

            {/* Free Clue */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-900/60 space-y-1 text-cyan-200">
              <div className="font-bold text-cyan-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> FREE SQUAD CLUE:
              </div>
              <p className="text-[11px] leading-relaxed">{level.clue}</p>
            </div>

            {/* Encrypted Hints */}
            <div className="space-y-2">
              <div className="text-slate-400 font-bold flex items-center justify-between">
                <span>ENCRYPTED HINTS:</span>
                <span className="text-[10px] text-rose-400">COSTS TEAM XP</span>
              </div>

              <div className="space-y-2">
                {level.hints.map((hint) => {
                  const isRevealed = unlockedHints.includes(hint.index);
                  return (
                    <div
                      key={hint.index}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300">HINT {hint.index}</span>
                        {isRevealed ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> REVEALED
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmingHint({ index: hint.index, costXP: hint.costXP })}
                            className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold cursor-pointer"
                          >
                            UNLOCK (-{hint.costXP} XP)
                          </button>
                        )}
                      </div>

                      {isRevealed ? (
                        <p className="text-[11px] text-cyan-200 leading-relaxed">{hint.content}</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">
                          Encrypted tactical guidance. Unlocking will deduct {hint.costXP} XP from the shared team score.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Policy */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>AI POLICY: {level.aiPolicy}</span>
              </div>
              {level.aiPolicy === 'ALLOWED' && (
                <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiDeclared}
                    onChange={(e) => setAiDeclared(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>AI Used</span>
                </label>
              )}
            </div>
          </div>

          {/* Center/Right Panel: Interactive Simulation Workbench (2 cols) */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
            <div className="flex-1">{renderInteractivePuzzle()}</div>

            {/* Verification Console */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  MISSION VERIFICATION CODE:
                </span>
                <span className="text-[10px] text-slate-400">
                  BASE: +{level.baseXP} XP | PENALTY: -10 XP / FAILED ATTEMPT
                </span>
              </div>

              {submissionFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                    submissionFeedback.type === 'success'
                      ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950 border border-rose-500/60 text-rose-300'
                  }`}
                >
                  {submissionFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{submissionFeedback.message}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={submissionInput}
                  disabled={isCompleted || cooldownRemaining > 0}
                  onChange={(e) => setSubmissionInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitVerification()}
                  placeholder={isCompleted ? 'LEVEL RESTORED' : 'ENTER VERIFICATION CODE...'}
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold tracking-wider placeholder-slate-500 outline-none focus:border-cyan-400 disabled:opacity-50"
                />

                <button
                  onClick={() => handleSubmitVerification()}
                  disabled={isCompleted || !submissionInput.trim() || isSubmitting || cooldownRemaining > 0}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  {cooldownRemaining > 0 ? (
                    `COOLDOWN (${cooldownRemaining}s)`
                  ) : isCompleted ? (
                    'SOLVED'
                  ) : (
                    <>
                      VERIFY <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hint Confirmation Modal */}
        {confirmingHint && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm p-5 rounded-xl border border-rose-500/60 bg-slate-900 space-y-3 text-center">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">REVEAL ENCRYPTED HINT {confirmingHint.index}?</h3>
              <p className="text-xs text-slate-300">
                This will deduct <strong className="text-rose-400">-{confirmingHint.costXP} XP</strong> from your shared squad pool.
                Both operatives will immediately see the revealed intelligence.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setConfirmingHint(null)}
                  className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleUnlockHint(confirmingHint.index, confirmingHint.costXP)}
                  className="py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                >
                  CONFIRM DEDUCTION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

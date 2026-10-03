import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Terminal,
  Activity,
  Award,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
  Cpu,
  Lock,
  Unlock,
  Clock,
  CheckCircle,
  Radio,
  Send,
  Users,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useEventStore } from '../store/eventStore';
import { OMEGA_LEVELS, TOTAL_BASE_XP } from '../levels/levelsCatalog';
import { omegaAudio } from '../utils/audio';
import { logTeamActivity, subscribeToTeamActivity } from '../services/teamService';
import { OperativeBadge } from '../components/hud/OperativeBadge';
import { ActivityEvent, OperativeRole } from '../types/game';

interface CommandCenterProps {
  onOpenLobby: () => void;
  onLaunchLevel?: (levelNumber: number) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onOpenLobby,
  onLaunchLevel,
}) => {
  const {
    operative,
    team,
    activeLevelNumber,
    setActiveLevelNumber,
    activityFeed,
    addActivityEvent,
    updateTeamScore,
    updateLevelProgress,
  } = useGameStore();

  const { status: eventStatus } = useEventStore();
  const [selectedLevelId, setSelectedLevelId] = useState<string>('level-01');
  const [tacticalMessage, setTacticalMessage] = useState('');
  const [isSendingPing, setIsSendingPing] = useState(false);

  // Subscribe to real-time team activity feed from Firestore if team exists
  useEffect(() => {
    if (!team?.id || team.id === 'OMEGA-017') return;

    const unsubscribe = subscribeToTeamActivity(team.id, (events) => {
      // Merge events into store if any
      events.forEach((ev) => {
        if (!activityFeed.some((existing) => existing.id === ev.id)) {
          addActivityEvent(ev);
        }
      });
    });

    return () => unsubscribe();
  }, [team?.id, activityFeed, addActivityEvent]);

  const selectedLevel = OMEGA_LEVELS.find((lvl) => lvl.id === selectedLevelId) || OMEGA_LEVELS[0];
  const selectedProgress = team?.levelProgress[`level-${selectedLevel.number.toString().padStart(2, '0')}`];

  // Calculate completed sectors count
  const completedCount = team
    ? Object.values(team.levelProgress).filter((lp) => lp.status === 'COMPLETED').length
    : 0;

  const handleLevelSelect = (lvlNum: number) => {
    omegaAudio.playClick();
    setActiveLevelNumber(lvlNum);
    setSelectedLevelId(`level-${lvlNum.toString().padStart(2, '0')}`);
  };

  const handleSendTacticalPing = async (customText?: string) => {
    const text = customText || tacticalMessage;
    if (!text.trim() || !operative || !team) return;

    omegaAudio.playClick();
    setIsSendingPing(true);

    const eventPayload = {
      operativeCallsign: operative.callsign,
      operativeRole: operative.role,
      type: 'CONNECT' as const,
      message: `TACTICAL COMMS: ${text.trim()}`,
    };

    try {
      if (team.id !== 'OMEGA-017') {
        await logTeamActivity(team.id, eventPayload);
      }
      addActivityEvent(eventPayload);
      setTacticalMessage('');
    } catch (err) {
      console.warn('Ping log notice:', err);
    } finally {
      setIsSendingPing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Command Center Telemetry Banner */}
      <section className="p-4 sm:p-5 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
              COMMAND CENTER LIVE
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              DUAL INTERFACE SYNCHRONIZED
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400">
              MISSION TIME: <strong className="text-white">105:00</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            OMEGA COMMAND CENTER
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            SQUAD <strong className="text-cyan-300">{team?.id}</strong> [{team?.teamName}] • 
            BOTH OPERATIVES ARE LINKED TO ONE UNIFIED TIMELINE, XP LEDGER, AND CONTAINMENT MATRIX.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenLobby}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" /> SQUAD LOBBY
          </button>

          <button
            onClick={() => handleSendTacticalPing('READY FOR NEXT SECTOR')}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> TACTICAL PING
          </button>
        </div>
      </section>

      {/* 2. Tactical Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Operative A Status */}
        <OperativeBadge
          member={team?.members.memberA}
          designation="OPERATIVE A"
          isCurrentOperative={operative?.role === 'memberA'}
        />

        {/* Operative B Status */}
        <OperativeBadge
          member={team?.members.memberB}
          designation="OPERATIVE B"
          isCurrentOperative={operative?.role === 'memberB'}
        />

        {/* Team Score Card */}
        <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-950/80 shadow-[0_0_15px_rgba(6,182,212,0.1)] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-cyan-400" /> SHARED XP LEDGER
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
              RANK #01
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-cyan-300 tracking-wider">
              {team?.totalScore ?? 0}{' '}
              <span className="text-xs font-normal text-slate-500">/ {TOTAL_BASE_XP} XP</span>
            </div>
            <span className="text-xs text-emerald-400 font-bold">+0 BONUS</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((team?.totalScore ?? 0) / TOTAL_BASE_XP) * 100)}%` }}
            />
          </div>
        </div>

        {/* Mission Containment Progress */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> MISSION OBJECTIVE
            </span>
            <span className="text-emerald-400 font-bold">{completedCount} / 15 RESTORED</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-xl font-bold text-white">
              {completedCount === 15 ? 'OMEGA CORE ACTIVE' : `SECTOR ${(team?.currentLevel || 1).toString().padStart(2, '0')}`}
            </div>
            <span className="text-xs text-cyan-400 uppercase font-bold">
              {completedCount === 15 ? 'MISSION WON' : 'CONTAINMENT'}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${(completedCount / 15) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. 15-Sector Security Matrix */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wider">
              15-SECTOR CONTAINMENT MATRIX
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-cyan-400 inline-block" /> AVAILABLE
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-400 inline-block" /> COMPLETED
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-slate-600 inline-block" /> LOCKED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {OMEGA_LEVELS.map((lvl) => {
            const key = `level-${lvl.number.toString().padStart(2, '0')}`;
            const progress = team?.levelProgress[key];
            const isAvailable = progress?.status === 'AVAILABLE' || progress?.status === 'COMPLETED' || lvl.number === 1;
            const isCompleted = progress?.status === 'COMPLETED';
            const isSelected = selectedLevelId === lvl.id;

            return (
              <button
                key={lvl.id}
                onClick={() => handleLevelSelect(lvl.number)}
                className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                    : isAvailable
                    ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/50'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-black ${
                      isSelected ? 'text-cyan-300' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    SECTOR {lvl.number.toString().padStart(2, '0')}
                  </span>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : isAvailable ? (
                    <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>

                <div className="text-xs font-bold text-slate-100 truncate mb-1">
                  {lvl.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[75px]">{lvl.category}</span>
                  <span className="font-bold text-cyan-400">+{lvl.baseXP} XP</span>
                </div>

                {lvl.allowsParallelInvestigation && (
                  <div className="mt-1 text-[9px] text-cyan-300/80 font-normal">
                    ⚡ DUAL-SOLVE READY
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Split: Sector Tactical Terminal & Real-Time Telemetry Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Tactical Terminal (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-cyan-900/60 bg-slate-950/85 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400">
                  SECTOR {selectedLevel.number.toString().padStart(2, '0')}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 uppercase">
                  {selectedLevel.domain}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">
                {selectedLevel.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedLevel.aiPolicy === 'ALLOWED'
                    ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                    : selectedLevel.aiPolicy === 'PROHIBITED'
                    ? 'bg-rose-950 border border-rose-500/40 text-rose-300'
                    : 'bg-amber-950 border border-amber-500/40 text-amber-300'
                }`}
              >
                AI: {selectedLevel.aiPolicy}
              </span>

              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                {selectedLevel.difficulty}
              </span>

              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                +{selectedLevel.baseXP} XP
              </span>
            </div>
          </div>

          {/* Story & Incident Objective */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Flame className="w-3.5 h-3.5" /> MISSION INCIDENT
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedLevel.story}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Cpu className="w-3.5 h-3.5" /> OPERATIONAL OBJECTIVE
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedLevel.objective}</p>
            </div>
          </div>

          {/* Intel Clues & Encrypted Hints Structure */}
          <div className="space-y-2 text-xs">
            <div className="text-slate-400 font-bold flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" /> SECURE INTEL & HINTS:
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-cyan-950 text-cyan-200">
              <strong className="text-cyan-400 mr-2">FREE SQUAD CLUE:</strong>
              {selectedLevel.clue}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {selectedLevel.hints.map((hint) => (
                <div
                  key={hint.index}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-300">HINT {hint.index}</span>
                    <span className="text-rose-400 font-bold">-{hint.costXP} XP</span>
                  </div>
                  <span className="text-[10px] text-slate-500 italic">
                    Encrypted. Costs {hint.costXP} XP from shared team pool.
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              3D ENVIRONMENT:{' '}
              <strong className="text-cyan-300">{selectedLevel.environmentName}</strong>
            </div>

            {eventStatus === 'PAUSED' ? (
              <div className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-950/70 border border-amber-500/60 text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 animate-pulse" /> EVENT PAUSED - SUBMISSIONS BLOCKED
              </div>
            ) : eventStatus === 'FINISHED' ? (
              <div className="px-5 py-2.5 rounded-lg text-xs font-bold bg-rose-950/70 border border-rose-500/60 text-rose-300 flex items-center gap-2">
                <Lock className="w-4 h-4" /> MISSION EXPIRED - SCORES LOCKED
              </div>
            ) : (
              <button
                onClick={() => {
                  omegaAudio.playClick();
                  if (onLaunchLevel) {
                    onLaunchLevel(selectedLevel.number);
                  }
                  addActivityEvent({
                    operativeCallsign: operative?.callsign || 'OPERATIVE A',
                    operativeRole: operative?.role || 'memberA',
                    type: 'LEVEL_START',
                    message: `INVESTIGATION ENGAGED: SECTOR ${selectedLevel.number.toString().padStart(2, '0')}`,
                    levelNumber: selectedLevel.number,
                  });
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all cursor-pointer"
              >
                ENGAGE SECTOR {selectedLevel.number.toString().padStart(2, '0')} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Telemetry Feed & Comms (1 col) */}
        <div className="p-4 rounded-2xl border border-cyan-900/60 bg-slate-950/85 backdrop-blur-xl flex flex-col text-xs shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white tracking-wider">LIVE TELEMETRY STREAM</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 animate-pulse font-bold">
              SYNCED
            </span>
          </div>

          {/* Feed List */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] pr-1 mb-3">
            {activityFeed.map((event) => (
              <div
                key={event.id}
                className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-1 transition-all"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-cyan-400 font-bold">{event.operativeCallsign}</span>
                  <span className="text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-tight">{event.message}</p>
                {event.deltaXp !== undefined && (
                  <span
                    className={`inline-block text-[10px] font-bold ${
                      event.deltaXp > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {event.deltaXp > 0 ? `+${event.deltaXp}` : event.deltaXp} XP
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Quick Tactical Radio Comms Bar */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
              <MessageSquare className="w-3 h-3 text-cyan-400" /> SQUAD COMMS CHANNEL:
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tacticalMessage}
                onChange={(e) => setTacticalMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTacticalPing()}
                placeholder="Broadcast encrypted ping..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleSendTacticalPing()}
                disabled={isSendingPing || !tacticalMessage.trim()}
                className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

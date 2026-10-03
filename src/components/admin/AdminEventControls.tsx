import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Clock,
  PlusCircle,
  AlertTriangle,
  Radio,
  CheckCircle,
  XCircle,
  Sliders,
} from 'lucide-react';
import { useEventStore } from '../../store/eventStore';
import { useGameStore } from '../../store/gameStore';
import { updateEventConfigInFirestore } from '../../services/eventService';
import { omegaAudio } from '../../utils/audio';

export const AdminEventControls: React.FC = () => {
  const {
    status,
    startTime,
    pausedAt,
    totalPausedTimeSeconds,
    durationMinutes,
    startEvent,
    pauseEvent,
    resumeEvent,
    extendTime,
    finishEvent,
    resetEvent,
  } = useEventStore();

  const { addActivityEvent } = useGameStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStart = async () => {
    omegaAudio.playSuccess();
    startEvent();
    addActivityEvent({
      operativeCallsign: 'ADMIN_OVERSEER',
      operativeRole: 'admin',
      type: 'SYSTEM_ALERT',
      message: 'TOURNAMENT BROADCAST: 105:00 OMEGA CLOCK STARTED FOR ALL TEAMS.',
    });
    try {
      await updateEventConfigInFirestore('omega-protocol-2026', {
        status: 'ACTIVE',
        startTime: Date.now(),
        pausedAt: null,
        totalPausedTimeSeconds: 0,
      });
    } catch (err) {
      console.warn('Admin remote sync notice:', err);
    }
  };

  const handlePause = async () => {
    omegaAudio.playError();
    pauseEvent();
    addActivityEvent({
      operativeCallsign: 'ADMIN_OVERSEER',
      operativeRole: 'admin',
      type: 'SYSTEM_ALERT',
      message: 'TOURNAMENT NOTICE: MISSION CLOCK PAUSED BY EVENT CONTROL.',
    });
    try {
      await updateEventConfigInFirestore('omega-protocol-2026', {
        status: 'PAUSED',
        pausedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Admin remote sync notice:', err);
    }
  };

  const handleResume = async () => {
    omegaAudio.playSuccess();
    resumeEvent();
    addActivityEvent({
      operativeCallsign: 'ADMIN_OVERSEER',
      operativeRole: 'admin',
      type: 'SYSTEM_ALERT',
      message: 'TOURNAMENT NOTICE: MISSION CLOCK RESUMED. CONTAINMENT PROTOCOL ACTIVE.',
    });
    try {
      await updateEventConfigInFirestore('omega-protocol-2026', {
        status: 'ACTIVE',
        pausedAt: null,
      });
    } catch (err) {
      console.warn('Admin remote sync notice:', err);
    }
  };

  const handleExtendTime = async (minutes: number) => {
    omegaAudio.playSuccess();
    extendTime(minutes);
    addActivityEvent({
      operativeCallsign: 'ADMIN_OVERSEER',
      operativeRole: 'admin',
      type: 'SYSTEM_ALERT',
      message: `MISSION CLOCK EXTENDED BY +${minutes} MINUTES BY EVENT CONTROL.`,
    });
    try {
      await updateEventConfigInFirestore('omega-protocol-2026', {
        durationMinutes: durationMinutes + minutes,
      });
    } catch (err) {
      console.warn('Admin remote sync notice:', err);
    }
  };

  const handleFinishEarly = async () => {
    omegaAudio.playError();
    finishEvent();
    addActivityEvent({
      operativeCallsign: 'ADMIN_OVERSEER',
      operativeRole: 'admin',
      type: 'SYSTEM_ALERT',
      message: 'MISSION TERMINATED BY EVENT OVERSEER. ALL SUBMISSIONS LOCKED.',
    });
    try {
      await updateEventConfigInFirestore('omega-protocol-2026', {
        status: 'FINISHED',
        endTime: Date.now(),
      });
    } catch (err) {
      console.warn('Admin remote sync notice:', err);
    }
  };

  const handleReset = async () => {
    omegaAudio.playClick();
    resetEvent();
    addActivityEvent({
      operativeCallsign: 'ADMIN_OVERSEER',
      operativeRole: 'admin',
      type: 'SYSTEM_ALERT',
      message: 'TOURNAMENT TIMER RESET TO WAITING STATE (105:00).',
    });
    try {
      await updateEventConfigInFirestore('omega-protocol-2026', {
        status: 'WAITING',
        startTime: null,
        endTime: null,
        pausedAt: null,
        totalPausedTimeSeconds: 0,
        durationMinutes: 105,
      });
    } catch (err) {
      console.warn('Admin remote sync notice:', err);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-purple-500/50 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.2)] font-mono space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-purple-950 border border-purple-500/50 text-purple-300">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
              ADMIN EVENT CONTROLLER
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                OVERSEER TIER
              </span>
            </div>
            <div className="text-xs text-slate-400">
              AUTHORITATIVE TIMING & LIFECYCLE MANAGEMENT FOR ALL SQUADS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">CURRENT STATUS:</span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              status === 'ACTIVE'
                ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                : status === 'PAUSED'
                ? 'bg-amber-950 border border-amber-500/40 text-amber-300 animate-pulse'
                : status === 'FINISHED'
                ? 'bg-rose-950 border border-rose-500/40 text-rose-300'
                : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {status === 'ACTIVE' ? (
          <button
            onClick={handlePause}
            className="p-3 rounded-xl border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <Pause className="w-5 h-5 text-amber-400" />
            <span>PAUSE EVENT</span>
          </button>
        ) : (
          <button
            onClick={status === 'PAUSED' ? handleResume : handleStart}
            className="p-3 rounded-xl border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Play className="w-5 h-5 text-emerald-400" />
            <span>{status === 'PAUSED' ? 'RESUME EVENT' : 'START 105:00'}</span>
          </button>
        )}

        <button
          onClick={() => handleExtendTime(5)}
          className="p-3 rounded-xl border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          <PlusCircle className="w-5 h-5 text-cyan-400" />
          <span>EXTEND (+5 MIN)</span>
        </button>

        <button
          onClick={handleFinishEarly}
          disabled={status === 'FINISHED'}
          className="p-3 rounded-xl border border-rose-500/50 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
        >
          <XCircle className="w-5 h-5 text-rose-400" />
          <span>TERMINATE EARLY</span>
        </button>

        <button
          onClick={handleReset}
          className="p-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-slate-400" />
          <span>RESET TO STAGING</span>
        </button>
      </div>

      {/* Rules Notice */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <Radio className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <span>
          <strong>LIFECYCLE RULES:</strong> When Paused, submission buttons freeze and the mission clock stops.
          When Expired (00:00) or Terminated, final scores lock permanently across all participant terminals.
        </span>
      </div>
    </div>
  );
};

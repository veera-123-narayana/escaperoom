import React, { useEffect, useState } from 'react';
import { Timer, AlertTriangle, PauseCircle, PlayCircle, ShieldAlert } from 'lucide-react';
import { calculateRemainingSeconds, formatTimeDisplay } from '../../utils/time';
import { omegaAudio } from '../../utils/audio';
import { EventStatus } from '../../types/event';

interface GlobalTimerProps {
  startTime: number | null;
  status: EventStatus;
  pausedAt?: number | null;
  totalPausedTimeSeconds?: number;
  durationMinutes?: number;
  className?: string;
}

export const GlobalTimer: React.FC<GlobalTimerProps> = ({
  startTime,
  status,
  pausedAt = null,
  totalPausedTimeSeconds = 0,
  durationMinutes = 105,
  className = '',
}) => {
  const [timeInfo, setTimeInfo] = useState(() =>
    calculateRemainingSeconds(
      startTime,
      Date.now(),
      totalPausedTimeSeconds,
      durationMinutes,
      status,
      pausedAt
    )
  );

  useEffect(() => {
    const update = () => {
      const next = calculateRemainingSeconds(
        startTime,
        Date.now(),
        totalPausedTimeSeconds,
        durationMinutes,
        status,
        pausedAt
      );
      setTimeInfo(next);

      // Sound warning on final 10 seconds of active tournament
      if (status === 'ACTIVE' && next.remainingSeconds <= 10 && next.remainingSeconds > 0) {
        omegaAudio.playCountdownBeep(true);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, status, pausedAt, totalPausedTimeSeconds, durationMinutes]);

  const isPaused = status === 'PAUSED';
  const isFinished = status === 'FINISHED' || timeInfo.isExpired;
  const isLowTime = timeInfo.remainingSeconds < 600 && timeInfo.remainingSeconds > 0; // < 10 mins
  const isCritical = timeInfo.remainingSeconds < 120 && timeInfo.remainingSeconds > 0; // < 2 mins

  return (
    <div
      className={`relative inline-flex items-center gap-3 px-4 py-2 rounded-lg border font-mono transition-all duration-300 ${
        isFinished
          ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)]'
          : isPaused
          ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
          : isCritical
          ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
          : isLowTime
          ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
          : 'bg-slate-900/80 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
      } ${className}`}
    >
      {/* Visual Indicator Icon */}
      <div className="flex items-center justify-center">
        {isFinished ? (
          <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
        ) : isPaused ? (
          <PauseCircle className="w-5 h-5 text-amber-400 animate-pulse" />
        ) : isCritical || isLowTime ? (
          <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-rose-400' : 'text-amber-400'} animate-bounce`} />
        ) : (
          <Timer className="w-5 h-5 text-cyan-400" />
        )}
      </div>

      {/* Clock Details */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
          <span>MISSION CLOCK</span>
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block ${
              isFinished
                ? 'bg-rose-500'
                : isPaused
                ? 'bg-amber-400 animate-ping'
                : 'bg-cyan-400 animate-ping'
            }`}
          />
          <span
            className={`font-bold ${
              isFinished
                ? 'text-rose-400'
                : isPaused
                ? 'text-amber-400'
                : 'text-cyan-400'
            }`}
          >
            {isFinished ? 'EXPIRED (LOCKED)' : isPaused ? 'EVENT PAUSED' : status}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-black tracking-widest ${
              isFinished
                ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                : isPaused
                ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                : isCritical
                ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                : isLowTime
                ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
            }`}
          >
            {isFinished ? '00:00' : formatTimeDisplay(timeInfo.remainingSeconds)}
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            / {durationMinutes}:00
          </span>
        </div>
      </div>

      {/* Subtle Progress Bar Underline */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800 rounded-b overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isFinished
              ? 'bg-rose-500'
              : isPaused
              ? 'bg-amber-400'
              : isCritical
              ? 'bg-rose-500'
              : isLowTime
              ? 'bg-amber-400'
              : 'bg-cyan-400'
          }`}
          style={{ width: `${timeInfo.percentage}%` }}
        />
      </div>
    </div>
  );
};

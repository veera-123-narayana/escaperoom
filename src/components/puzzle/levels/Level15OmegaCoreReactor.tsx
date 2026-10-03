import React, { useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level15OmegaCoreReactor: React.FC<PuzzleProps> = () => {
  const [alphaKey, setAlphaKey] = useState('');
  const [betaKey, setBetaKey] = useState('');
  const [armed, setArmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleArmReactor = () => {
    if (
      alphaKey.trim().toUpperCase() === 'OMEGA-ALPHA-CONTAIN-991' &&
      betaKey.trim().toUpperCase() === 'OMEGA-BETA-RESTORE-772'
    ) {
      setArmed(true);
      setErrorMessage(null);
    } else {
      setErrorMessage('INTERLOCK FAILURE: Key mismatch. Verify Operative A and Operative B sector credentials.');
      setArmed(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.2)] space-y-3">
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
            <span className="text-white font-black text-sm tracking-wider">SYSTEM OMEGA: CORE REACTOR CONTAINMENT</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-[10px] font-bold">
            DUAL-OPERATIVE AUTHORIZATION REQUIRED
          </span>
        </div>

        <div className="text-slate-300 leading-relaxed">
          The central Omega AI core reactor is experiencing runaway divergence. To initiate the irreversible containment lockdown,
          both Operative A and Operative B must synchronize their respective authentication keys into the command interlock.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">KEY 1 (OPERATIVE A):</span>
              <span className="text-[10px] text-slate-400">ALPHA SECTOR</span>
            </div>
            <input
              type="text"
              value={alphaKey}
              onChange={(e) => setAlphaKey(e.target.value)}
              placeholder="e.g. OMEGA-ALPHA-CONTAIN-..."
              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-cyan-500/50 text-cyan-300 font-bold outline-none placeholder-slate-600"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold">KEY 2 (OPERATIVE B):</span>
              <span className="text-[10px] text-slate-400">BETA SECTOR</span>
            </div>
            <input
              type="text"
              value={betaKey}
              onChange={(e) => setBetaKey(e.target.value)}
              placeholder="e.g. OMEGA-BETA-RESTORE-..."
              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold outline-none placeholder-slate-600"
            />
          </div>
        </div>

        <button
          onClick={handleArmReactor}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 hover:opacity-90 text-slate-950 font-black tracking-widest cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          ENGAGE DUAL REACTOR LOCKS
        </button>

        {errorMessage && (
          <div className="p-2.5 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300">
            {errorMessage}
          </div>
        )}
      </div>

      {armed && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            CORE DIVERGENCE ARRESTED! FINAL CONTAINMENT SEQUENCE:
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/40 text-center">
            <span className="text-sm font-black text-white tracking-widest select-all">
              OMEGA_CORE_CONTAINMENT_RESTORED_2026
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

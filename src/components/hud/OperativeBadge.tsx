import React from 'react';
import { User, Activity, CheckCircle2 } from 'lucide-react';
import { TeamMember } from '../../types/team';

interface OperativeBadgeProps {
  member?: TeamMember;
  designation: 'OPERATIVE A' | 'OPERATIVE B';
  isCurrentOperative: boolean;
}

export const OperativeBadge: React.FC<OperativeBadgeProps> = ({
  member,
  designation,
  isCurrentOperative,
}) => {
  const isOnline = member?.isOnline ?? false;

  return (
    <div
      className={`relative p-3 rounded-lg border transition-all duration-200 font-mono ${
        isCurrentOperative
          ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
              designation === 'OPERATIVE A'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {designation === 'OPERATIVE A' ? 'A' : 'B'}
          </div>
          <span className="text-xs font-bold tracking-wider text-slate-300">
            {designation}
          </span>
          {isCurrentOperative && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              YOU
            </span>
          )}
        </div>

        {/* Live heartbeat indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className={`text-[10px] ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {member ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-cyan-400" /> Callsign:
            </span>
            <span className="text-cyan-200 font-bold">{member.callsign}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Active Level:
            </span>
            <span className="text-emerald-400 font-bold">
              LVL {member.currentLevelNumber.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-2 text-center text-slate-500 text-xs italic">
          Awaiting Operative Connection...
        </div>
      )}

      {isCurrentOperative && (
        <div className="mt-2 pt-2 border-t border-cyan-900/40 flex items-center justify-between text-[10px] text-cyan-400/80">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> TERMINAL LINK ACTIVE
          </span>
          <span>DEV PORT 3000</span>
        </div>
      )}
    </div>
  );
};

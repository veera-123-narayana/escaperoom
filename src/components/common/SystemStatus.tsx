import React from 'react';
import { Activity, ShieldCheck, Users, Radio } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useEventStore } from '../../store/eventStore';

export const SystemStatus: React.FC = () => {
  const { operative, team } = useGameStore();
  const { status: eventStatus } = useEventStore();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-950/80 border-b border-cyan-950/80 backdrop-blur-md text-xs font-mono">
      {/* Left: Telemetry & Protocol State */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider">
            {eventStatus === 'ACTIVE' ? 'SECURE CHANNEL LIVE' : eventStatus}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>FREQ: 142.85 MHz</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>FIREWALL: CONTAINMENT LVL 15</span>
        </div>
      </div>

      {/* Right: Team & Operative Context */}
      <div className="flex items-center gap-3">
        {team ? (
          <div className="flex items-center gap-2 bg-cyan-950/30 border border-cyan-500/30 px-2.5 py-1 rounded">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-bold">{team.id}</span>
            <span className="text-cyan-400/80 hidden lg:inline">[{team.teamName}]</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded border border-cyan-500/30">
              JOIN CODE: {team.joinCode}
            </span>
          </div>
        ) : (
          <span className="text-amber-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-spin" /> AWAITING TEAM ASSIGNMENT
          </span>
        )}

        {operative && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                operative.role === 'memberA' ? 'bg-cyan-400' : operative.role === 'memberB' ? 'bg-emerald-400' : 'bg-purple-400'
              }`}
            />
            <span className="font-bold text-cyan-300">{operative.callsign}</span>
            <span className="text-[10px] text-slate-400 uppercase">({operative.role})</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level13InsiderThreatSiem: React.FC<PuzzleProps> = () => {
  const [query, setQuery] = useState('index=badge_access action=exfil bytes>10000000');
  const [filtered, setFiltered] = useState(false);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">SIEM SECURITY LOG QUERY CONSOLE</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold">ANOMALY DETECTOR: ACTIVE</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 text-[11px]"
          />
          <button
            onClick={() => setFiltered(true)}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
          >
            EXECUTE SIEM QUERY
          </button>
        </div>

        {filtered && (
          <div className="p-3 bg-slate-900 rounded border border-rose-500/50 space-y-1.5">
            <div className="text-rose-400 font-bold">ALERT: ROGUE INSIDER EXFILTRATION DETECTED</div>
            <div className="text-slate-300">Timestamp: 2026-10-02 03:14:09 UTC (Off-hours access)</div>
            <div className="text-slate-300">Compromised Badge ID: <strong className="text-amber-400 font-bold">EMP-8842-MALIK</strong></div>
            <div className="text-slate-300">Destination: external_vault_exfil.tar.gz (48.2 GB transfer)</div>
            <div className="text-[10px] text-slate-500 pt-1">
              Objective: Submit the identified rogue employee badge ID.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

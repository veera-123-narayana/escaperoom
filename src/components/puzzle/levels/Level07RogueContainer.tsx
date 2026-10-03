import React, { useState } from 'react';
import { Box } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level07RogueContainer: React.FC<PuzzleProps> = () => {
  const [activeInspect, setActiveInspect] = useState<string | null>(null);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">CONTAINER CLUSTER ORCHESTRATION</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold">NODE: worker-omega-01</span>
        </div>

        <div className="space-y-2">
          <div className="text-slate-400">ACTIVE DOCKER CONTAINERS (Click to inspect):</div>
          <div className="space-y-1">
            <div
              onClick={() => setActiveInspect('c-omega-db')}
              className={`p-2.5 rounded cursor-pointer flex justify-between border ${
                activeInspect === 'c-omega-db' ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <span>c-omega-db (postgres:15)</span>
              <span className="text-emerald-400">HEALTHY</span>
            </div>
            <div
              onClick={() => setActiveInspect('c-rogue-miner')}
              className={`p-2.5 rounded cursor-pointer flex justify-between border ${
                activeInspect === 'c-rogue-miner' ? 'bg-slate-800 border-rose-500' : 'bg-slate-900 border-rose-500/50 hover:bg-slate-850'
              }`}
            >
              <span className="text-rose-400 font-bold">c-rogue-miner (alpine:latest)</span>
              <span className="text-rose-400 font-bold">PRIVILEGED ESCAPE</span>
            </div>
          </div>
        </div>

        {activeInspect === 'c-rogue-miner' && (
          <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/50 space-y-2 text-slate-300">
            <div className="text-rose-400 font-bold">CONTAINER INSPECTION (docker inspect c-rogue-miner):</div>
            <pre className="text-[11px] text-cyan-300">
{`"HostConfig": {
  "Privileged": true,
  "Binds": [
    "/var/run/docker.sock:/var/run/docker.sock",
    "/:/host"
  ],
  "SecurityOpt": [
    "apparmor=unconfined"
  ]
}
// ANOMALY: Container holds root access to host daemon via docker.sock
// ESCAPE TOKEN: ESCAPE-CONTAINER-PRV-ROOT`}
            </pre>
          </div>
        )}

        {activeInspect === 'c-omega-db' && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
            Container c-omega-db is operating within isolated non-root namespace. No privilege escalation vectors detected.
          </div>
        )}
      </div>
    </div>
  );
};

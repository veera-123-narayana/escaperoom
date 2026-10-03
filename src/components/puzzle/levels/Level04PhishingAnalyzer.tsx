import React, { useState } from 'react';
import { Mail, AlertTriangle, Search } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level04PhishingAnalyzer: React.FC<PuzzleProps> = () => {
  const [showHeaders, setShowHeaders] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">SUSPICIOUS INCOMING TRANSMISSION</span>
          </div>
          <button
            onClick={() => setShowHeaders(!showHeaders)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 hover:text-white cursor-pointer"
          >
            {showHeaders ? 'HIDE RAW HEADERS' : 'INSPECT RAW HEADERS'}
          </button>
        </div>

        <div className="space-y-1.5 text-slate-300">
          <div><strong className="text-slate-400">FROM:</strong> Global IT Security &lt;security@g00gle-defense.com&gt;</div>
          <div><strong className="text-slate-400">TO:</strong> operative-a@omega.internal</div>
          <div><strong className="text-slate-400">SUBJECT:</strong> [URGENT] Omega System Gateway Authentication Token Expiry</div>
        </div>

        {showHeaders && (
          <div className="p-3 rounded-lg bg-slate-900 border border-rose-900/50 space-y-1 text-slate-400 text-[11px]">
            <div>Received: from mail.attacker-c2.net (IP: [185.220.101.5])</div>
            <div>DKIM-Signature: FAIL (domain key mismatch)</div>
            <div>Authentication-Results: spf=softfail (sender IP 185.220.101.5 is not authorized)</div>
            <div>X-Mailer: Metasploit PhishBot v9.1</div>
            <div>Payload-Host: 185.220.101.5 (Port 443)</div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed">
          "Operative, your System Omega credentials require immediate verification. Click the gateway link below to authenticate your public key before termination:
          <span className="block mt-1 text-rose-400 underline break-all">
            http://185.220.101.5/auth/verify?session=token_9942
          </span>"
        </div>

        <button
          onClick={() => setAnalyzed(true)}
          className="w-full py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold cursor-pointer"
        >
          ANALYZE THREAT INFRASTRUCTURE & EXTRACT MALICIOUS HOST
        </button>

        {analyzed && (
          <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/50 space-y-1 text-slate-300">
            <div className="text-rose-400 font-bold">THREAT ARTIFACT IDENTIFIED:</div>
            <div>Attacker C2 Infrastructure Host IP: <strong className="text-white">185.220.101.5</strong></div>
            <div className="text-[10px] text-slate-400">System Verification: Submit identified C2 IP address (185.220.101.5)</div>
          </div>
        )}
      </div>
    </div>
  );
};

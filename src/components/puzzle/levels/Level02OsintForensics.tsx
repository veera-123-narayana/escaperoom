import React, { useState } from 'react';
import { Eye, GitCommit, Binary } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
  isCompleted?: boolean;
}

export const Level02OsintForensics: React.FC<PuzzleProps> = () => {
  const [activeTab, setActiveTab] = useState<'exif' | 'git'>('exif');
  const [decodedHex, setDecodedHex] = useState<string | null>(null);

  const handleDecodeHex = () => {
    // 0x415554482d4f53494e542d4359504845523939 -> AUTH-OSINT-CYPHER99
    const hex = '415554482d4f53494e542d4359504845523939';
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    setDecodedHex(str);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('exif')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer ${
            activeTab === 'exif' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> EXIF METADATA DUMP
        </button>
        <button
          onClick={() => setActiveTab('git')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer ${
            activeTab === 'git' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" /> REPOSITORY COMMIT LOG
        </button>
      </div>

      {activeTab === 'exif' ? (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-cyan-400 font-bold mb-1">FILE: surveillance_cctv_sector2.jpg</div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>Camera Model:</div>
            <div className="text-white">Omega-Cam X100</div>
            <div>Date/Time Original:</div>
            <div className="text-white">2026-10-02 21:04:12 UTC</div>
            <div>GPS Latitude:</div>
            <div className="text-white">37° 46' 29.8" N</div>
            <div>GPS Longitude:</div>
            <div className="text-white">122° 25' 09.8" W</div>
            <div>Artist / Author:</div>
            <div className="text-amber-400 font-bold">cypher99 (Operative Infiltrator)</div>
            <div>User Comment (Raw Hex):</div>
            <div className="text-cyan-300 break-all font-mono">
              0x415554482d4f53494e542d4359504845523939
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDecodeHex}
              className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Binary className="w-3.5 h-3.5" /> DECODE HEX USER COMMENT
            </button>
          </div>

          {decodedHex && (
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/40 space-y-1">
              <span className="text-slate-400 block text-[10px]">DECODED ASCII STREAM:</span>
              <span className="text-sm font-bold text-emerald-400 tracking-wider">
                {decodedHex}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-cyan-400 font-bold">GIT COMMIT LOG:</div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-amber-400 font-bold">commit e48f912c9a (HEAD -&gt; main)</div>
            <div className="text-slate-400">Author: Alex &lt;cypher99@omega-infiltrate.net&gt;</div>
            <div className="text-slate-400">Date:   Thu Oct 2 20:55:10 2026</div>
            <div className="text-slate-200 mt-1 pl-2 border-l border-slate-700">
              "refactor: scrubbed tracking token from EXIF header. Payload stored as raw hex in user comment field."
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

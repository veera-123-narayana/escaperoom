import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level12MemoryProfiler: React.FC<PuzzleProps> = () => {
  const [profiled, setProfiled] = useState(false);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">HEAP MEMORY LEAK PROFILER</span>
          </div>
          <span className="text-[10px] text-rose-400 font-bold">HEAP PRESSURE: 98.4%</span>
        </div>

        <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
          <div className="text-slate-400">VALGRIND MEMCHECK AUDIT LOG:</div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div>==28491== 4,194,304 bytes in 1,024 blocks are definitely lost in loss record 8 of 8</div>
            <div>==28491==    at 0x4C2DB8F: malloc (in /usr/lib/valgrind/vgpreload_memcheck.so)</div>
            <div className="text-rose-400 font-bold">==28491==    by 0x00401A20: stream_buffer_allocate (stream.c:142)</div>
            <div>==28491==    by 0x004011B8: main (server.c:88)</div>
          </div>
        </div>

        <button
          onClick={() => setProfiled(true)}
          className="w-full py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
        >
          ANALYZE CALL STACK & ISOLATE LEAKING POINTER
        </button>

        {profiled && (
          <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/50 space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold">HEAP DIAGNOSTIC SUMMARY:</div>
            <div>Definite Memory Leak Address: <span className="text-emerald-400 font-bold">0x00401A20</span></div>
            <div className="text-[10px] text-slate-400">System Verification: Submit identified memory pointer address (0x00401A20)</div>
          </div>
        )}
      </div>
    </div>
  );
};

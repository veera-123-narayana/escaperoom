import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level11ZeroDayResearch: React.FC<PuzzleProps> = () => {
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">GDB x86_64 STACK FRAME DISASSEMBLY</span>
          </div>
          <span className="text-[10px] text-rose-400 font-bold">VULN: STACK BUFFER OVERFLOW (gets)</span>
        </div>

        <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-[11px] space-y-1">
          <div>Dump of assembler code for function parse_packet:</div>
          <div className="text-slate-500">   0x00401150 &lt;+0&gt;:  push   %rbp</div>
          <div className="text-slate-500">   0x00401151 &lt;+1&gt;:  mov    %rsp,%rbp</div>
          <div className="text-slate-500">   0x00401154 &lt;+4&gt;:  sub    $0x40,%rsp  [64-BYTE LOCAL BUFFER]</div>
          <div className="text-amber-400">   0x00401158 &lt;+8&gt;:  lea    -0x40(%rbp),%rax</div>
          <div className="text-rose-400 font-bold">   0x0040115c &lt;+12&gt;: callq  0x00401030 &lt;gets@plt&gt; [UNBOUNDED COPY]</div>
          <div className="text-slate-500">   0x00401161 &lt;+17&gt;: leaveq</div>
          <div className="text-slate-500">   0x00401162 &lt;+18&gt;: retq</div>
        </div>

        <button
          onClick={() => setAnalyzed(true)}
          className="w-full py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
        >
          ANALYZE EXPLOIT STACK FRAME & EXTRACT SHELLCODE ADDRESS
        </button>

        {analyzed && (
          <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/50 space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold">EXPLOIT PAYLOAD CALCULATION:</div>
            <div>Offset to saved %rip: <span className="text-white font-bold">72 bytes (64-byte buffer + 8-byte saved %rbp)</span></div>
            <div>Target Injected Shellcode Return Address: <span className="text-emerald-400 font-bold text-sm">0x7FFFFFFFE480</span></div>
            <div className="text-[10px] text-slate-500 pt-1">
              Objective: Submit the 14-character hexadecimal target return address.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

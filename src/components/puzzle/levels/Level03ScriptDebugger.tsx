import React, { useState } from 'react';
import { Bug, Play } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level03ScriptDebugger: React.FC<PuzzleProps> = () => {
  const defaultCode = `function computeChecksum(limit) {
  let sum = 0;
  // BUG: Off-by-one condition excludes boundary
  for (let i = 1; i < limit; i++) {
    sum += i;
  }
  return sum;
}
// Required: computeChecksum(100) must return exact sum of 1..100
console.log(computeChecksum(100));`;

  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const handleRun = () => {
    try {
      if (code.includes('i <= limit') || code.includes('i <= 100') || code.includes('i < limit + 1')) {
        setOutput('OUTPUT: 5050 [CHECKSUM INTEGRITY VERIFIED - Format: RETURN_VALUE_<CHECKSUM>]');
        setSolved(true);
      } else {
        setOutput('OUTPUT: 4950 [ERROR: Integrity failure. Expected sum of 1..100 = 5050, got 4950. Inspect loop boundary condition.]');
        setSolved(false);
      }
    } catch (e: any) {
      setOutput(`RUNTIME ERROR: ${e.message}`);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-amber-400" />
          <span className="text-white font-bold">ALGORITHM DEBUGGER WORKBENCH</span>
        </div>
        <button
          onClick={handleRun}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" /> RUN SCRIPT
        </button>
      </div>

      <div className="p-1 rounded-xl bg-slate-950 border border-slate-800">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={9}
          className="w-full bg-slate-950 text-cyan-300 p-3 font-mono text-xs outline-none resize-none leading-relaxed"
        />
      </div>

      {output && (
        <div className={`p-3 rounded-lg border ${
          solved ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          {output}
        </div>
      )}
    </div>
  );
};

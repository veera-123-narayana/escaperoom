import React, { useState } from 'react';
import { Database } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level08SqlInjection: React.FC<PuzzleProps> = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const handleTestInjection = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.toLowerCase();
    if (u.includes("' or '1'='1") || u.includes("' or 1=1") || u.includes("admin' --") || u.includes("' or ''='")) {
      setResult('QUERY SUCCESS: Authentication bypassed! Extracted record: { id: 1, role: "superadmin", access_token: "ADMIN_SECRET_KEY_DB_2026" }');
      setSolved(true);
    } else {
      setResult('AUTHENTICATION FAILED: Query returned 0 matching records. (Hint: Exploit raw string concatenation without input sanitization)');
      setSolved(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">SQL DATABASE AUTHENTICATION GATEWAY</span>
          </div>
          <span className="text-[10px] text-slate-400">VULNERABILITY: RAW QUERY CONCATENATION</span>
        </div>

        <form onSubmit={handleTestInjection} className="space-y-3">
          <div>
            <label className="text-slate-400 block mb-1">SQL USERNAME INPUT:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or SQL payload..."
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">SQL PASSCODE INPUT:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="text-[11px] text-cyan-400 p-2 bg-slate-900 rounded break-all">
            QUERY: <code>SELECT * FROM accounts WHERE user = '{username}' AND pass = '{password}'</code>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
          >
            EXECUTE RAW SQL QUERY
          </button>
        </form>

        {result && (
          <div className={`p-3 rounded-lg border leading-relaxed ${
            solved ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

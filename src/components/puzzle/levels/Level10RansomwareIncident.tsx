import React, { useState } from 'react';
import { Skull } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level10RansomwareIncident: React.FC<PuzzleProps> = () => {
  const [xorKey, setXorKey] = useState('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const handleDecrypt = () => {
    const k = xorKey.trim().toLowerCase();
    if (k === '0x5a' || k === '5a' || k === '90') {
      setDecryptedText('DECRYPTED MASTER HEADER: SYSTEM DECRYPTOR TOKEN = DECRYPT-XOR-KEY-0x9F4C');
      setSolved(true);
    } else {
      setDecryptedText('MALFORMED PLAINTEXT: High entropy pseudo-random gibberish. (Hint: ASCII space 0x20 XORed with 0x7a yields the 1-byte mask).');
      setSolved(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-rose-400" />
            <span className="text-white font-bold">RANSOMWARE HEURISTIC XOR REVERSE-ENGINEER</span>
          </div>
          <span className="text-[10px] text-rose-400 font-bold">CIPHER: REPETITIVE STREAM XOR</span>
        </div>

        <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-400 space-y-1">
          <div>ENCRYPTED PAYLOAD HEX DUMP:</div>
          <div className="text-cyan-300 break-all text-[11px]">
            1e 1f 19 08 03 0a 0e 7a 13 15 08 7a 11 1f 03 7a 6a 62 6e 66 69 7a 65 67 6e 6f
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-slate-400">XOR KEY MASK:</label>
          <input
            type="text"
            value={xorKey}
            onChange={(e) => setXorKey(e.target.value)}
            placeholder="e.g. 0xXX"
            className="w-28 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 font-bold"
          />
          <button
            onClick={handleDecrypt}
            className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
          >
            RUN XOR DECRYPTOR
          </button>
        </div>

        {decryptedText && (
          <div className={`p-3 rounded-lg border ${
            solved ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {decryptedText}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level06Steganography: React.FC<PuzzleProps> = () => {
  const [channel, setChannel] = useState<'rgb' | 'lsb'>('rgb');
  const [decodedText, setDecodedText] = useState<string | null>(null);

  const handleDecode = () => {
    // Q1lCRVJfUkVTSUxJRU5DRV9DT1JF -> CYBER_RESILIENCE_CORE
    setDecodedText(atob('Q1lCRVJfUkVTSUxJRU5DRV9DT1JF'));
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">STEGANOGRAPHY BIT-PLANE ANALYZER</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => { setChannel('rgb'); setDecodedText(null); }}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                channel === 'rgb' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              RGB PLANES
            </button>
            <button
              onClick={() => setChannel('lsb')}
              className={`px-2.5 py-1 rounded cursor-pointer ${
                channel === 'lsb' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
              }`}
            >
              LSB 0-BIT SLICE
            </button>
          </div>
        </div>

        <div className="h-36 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-4 text-center">
          {channel === 'rgb' ? (
            <div className="text-slate-500">
              [Visual appearance normal. No overt artifacts detected in higher-order RGB color planes.]
            </div>
          ) : (
            <div className="space-y-2 text-cyan-300 font-mono">
              <div className="text-amber-400 font-bold text-[11px]">EMBEDDED BIT-STREAM FROM LEAST SIGNIFICANT BITS:</div>
              <div className="p-2 bg-slate-950 rounded border border-cyan-500/40 text-sm tracking-wider">
                Q1lCRVJfUkVTSUxJRU5DRV9DT1JF
              </div>
            </div>
          )}
        </div>

        {channel === 'lsb' && (
          <button
            onClick={handleDecode}
            className="w-full py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold cursor-pointer"
          >
            DECODE BASE64 ENCODED STRING
          </button>
        )}

        {decodedText && (
          <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/50 space-y-1 text-slate-300">
            <span className="text-slate-400 block text-[10px]">DECODED PAYLOAD STRING:</span>
            <span className="text-sm font-bold text-emerald-400 tracking-wider">
              {decodedText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level14QuantumCryptography: React.FC<PuzzleProps> = () => {
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">POST-QUANTUM CRYPTOGRAPHIC KEY GENERATOR</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold">NIST PQC STANDARDS</span>
        </div>

        <div className="text-slate-300">
          Traditional RSA-4096 and ECC curves are vulnerable to Shor's algorithm polynomial factorization.
          Select the quantum-resilient Module-Lattice Key Encapsulation Mechanism standard:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedStandard('rsa')}
            className={`p-2.5 rounded border text-left cursor-pointer ${
              selectedStandard === 'rsa' ? 'border-rose-500 bg-rose-950/40 text-rose-300' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}
          >
            <div>RSA-4096 (Prime Factorization)</div>
            <div className="text-[10px] text-rose-400">Vulnerable to Quantum Factoring</div>
          </button>

          <button
            onClick={() => setSelectedStandard('kyber')}
            className={`p-2.5 rounded border text-left cursor-pointer ${
              selectedStandard === 'kyber' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}
          >
            <div className="font-bold text-emerald-400">ML-KEM / CRYSTALS-Kyber-1024</div>
            <div className="text-[10px] text-emerald-300">Quantum Lattice Resilient</div>
          </button>
        </div>

        {selectedStandard === 'kyber' && (
          <div className="p-3 bg-slate-900 border border-emerald-500/50 rounded space-y-1 text-slate-300">
            <div className="text-emerald-400 font-bold">POST-QUANTUM RESILIENCE CONFIRMED:</div>
            <div>Algorithm Standard: <span className="text-white font-bold">CRYPTO-LATTICE-KYBER-1024</span></div>
            <div className="text-[10px] text-slate-500">Security Strength: Category 5 (AES-256 equivalent post-quantum security)</div>
          </div>
        )}

        {selectedStandard === 'rsa' && (
          <div className="p-3 bg-slate-900 border border-rose-500/50 rounded text-rose-300">
            WARNING: RSA-4096 is broken by Shor's algorithm on a quantum computer with ~8,000 logical qubits.
          </div>
        )}
      </div>
    </div>
  );
};

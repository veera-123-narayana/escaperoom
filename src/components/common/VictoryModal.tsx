import React from 'react';
import { Trophy, Award, CheckCircle, Flame, Sparkles, X, Share2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { TOTAL_BASE_XP } from '../../levels/levelsCatalog';
import { formatTimeDisplay } from '../../utils/time';

interface VictoryModalProps {
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onClose }) => {
  const { team, operative } = useGameStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl font-mono">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-2xl border border-emerald-400 bg-slate-950 shadow-[0_0_80px_rgba(16,185,129,0.4)] text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="space-y-2">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-bounce">
            <Trophy className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-widest">
            SYSTEM OMEGA SECURED
          </h2>
          <p className="text-xs text-emerald-400 font-bold tracking-wider uppercase">
            CONTAINMENT RESTORED • RUNAWAY AI THREAT NEUTRALIZED
          </p>
        </div>

        {/* Squad Certificate Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">AUTHORIZED SQUAD:</span>
            <span className="text-cyan-300 font-bold">{team?.id} ({team?.teamName})</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-slate-400 block text-[10px]">OPERATIVE A:</span>
              <strong className="text-white">{team?.members.memberA?.callsign || 'OPERATIVE A'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">OPERATIVE B:</span>
              <strong className="text-white">{team?.members.memberB?.callsign || 'OPERATIVE B'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">SECTORS SECURED</span>
              <strong className="text-emerald-400 text-sm">15 / 15</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">FINAL SCORE</span>
              <strong className="text-cyan-300 text-sm">{team?.totalScore} XP</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">STATUS</span>
              <strong className="text-purple-400 text-sm uppercase">VICTORIOUS</strong>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-widest cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
        >
          RETURN TO COMMAND MATRIX
        </button>
      </div>
    </div>
  );
};

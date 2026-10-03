import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { omegaAudio } from '../../utils/audio';

export const AudioController: React.FC = () => {
  const { isAudioMuted, audioVolume, toggleAudioMute, setAudioVolume } = useGameStore();
  const [showSlider, setShowSlider] = useState(false);

  const handleTestSound = (type: 'click' | 'success' | 'error' | 'beep') => {
    switch (type) {
      case 'click':
        omegaAudio.playClick();
        break;
      case 'success':
        omegaAudio.playSuccess();
        break;
      case 'error':
        omegaAudio.playError();
        break;
      case 'beep':
        omegaAudio.playCountdownBeep(true);
        break;
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={() => {
          toggleAudioMute();
          if (isAudioMuted) {
            omegaAudio.startAmbientHum();
          }
        }}
        title={isAudioMuted ? 'Unmute Cyber Audio' : 'Mute Cyber Audio'}
        className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
          isAudioMuted
            ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
            : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:border-cyan-400'
        }`}
      >
        {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Mini Volume Popover Toggle */}
      <button
        onClick={() => setShowSlider(!showSlider)}
        className="px-2 py-1 text-[11px] font-mono text-cyan-400/80 hover:text-cyan-300 border border-cyan-900/60 rounded bg-slate-900/40"
      >
        {isAudioMuted ? 'MUTED' : `${Math.round(audioVolume * 100)}%`}
      </button>

      {showSlider && (
        <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-lg bg-slate-900 border border-cyan-500/40 shadow-2xl z-50 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SYNTH VOL</span>
            <span className="text-cyan-300">{Math.round(audioVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isAudioMuted ? 0 : audioVolume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
          />

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> TEST
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleTestSound('click')}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-800/40"
              >
                Click
              </button>
              <button
                onClick={() => handleTestSound('success')}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-800/40"
              >
                Chime
              </button>
              <button
                onClick={() => handleTestSound('error')}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-800/40"
              >
                Buzzer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

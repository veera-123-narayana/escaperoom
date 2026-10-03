import React from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

interface OmegaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const OmegaLogo: React.FC<OmegaLogoProps> = ({ size = 'md', showTagline = true }) => {
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      title: 'text-lg',
      tagline: 'text-[10px]',
    },
    md: {
      icon: 'w-8 h-8',
      title: 'text-2xl',
      tagline: 'text-xs',
    },
    lg: {
      icon: 'w-12 h-12',
      title: 'text-4xl',
      tagline: 'text-sm tracking-[0.25em]',
    },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        {/* Hexagonal / Diamond Cyber Badge */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-lg" />
        <div className="relative bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/50 p-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.35)]">
          <ShieldAlert className={`${sizeClasses.icon} text-cyan-400`} />
          <Zap className="w-3 h-3 text-cyan-300 absolute -bottom-1 -right-1 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 ${sizeClasses.title}`}>
            SYSTEM <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">OMEGA</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase tracking-wider">
            v2.6
          </span>
        </div>
        {showTagline && (
          <span className={`font-mono text-cyan-400/80 uppercase tracking-widest ${sizeClasses.tagline}`}>
            THE OMEGA PROTOCOL • 15 LEVELS. 105 MIN. 1 MISSION.
          </span>
        )}
      </div>
    </div>
  );
};

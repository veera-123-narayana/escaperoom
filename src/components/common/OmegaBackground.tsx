import React from 'react';

export const OmegaBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-[#f1f5f9] overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Deep Cyber Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-cyan-950/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-blue-950/30 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-emerald-950/10 rounded-full blur-[180px]" />
      </div>

      {/* Cybernetic Perspective Grid */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Scanline CRT overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.6) 2px, rgba(0, 0, 0, 0.6) 4px)',
        }}
      />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,7,18,0.85)_100%)]" />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

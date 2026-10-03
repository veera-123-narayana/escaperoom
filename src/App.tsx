/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Award,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle,
  LogOut,
  LogIn,
  KeyRound,
  Users,
  LayoutGrid,
  Radio,
  Play,
  Activity,
  Sliders,
  AlertTriangle,
  PauseCircle,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import { OmegaBackground } from './components/common/OmegaBackground';
import { OmegaLogo } from './components/common/OmegaLogo';
import { GlobalTimer } from './components/common/GlobalTimer';
import { SystemStatus } from './components/common/SystemStatus';
import { AudioController } from './components/common/AudioController';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Lobby } from './pages/Lobby';
import { CommandCenter } from './pages/CommandCenter';
import { Leaderboard } from './pages/Leaderboard';
import { LevelWorkspace } from './components/puzzle/LevelWorkspace';
import { VictoryModal } from './components/common/VictoryModal';
import { AdminEventControls } from './components/admin/AdminEventControls';
import { useGameStore } from './store/gameStore';
import { useAuthStore } from './store/authStore';
import { useEventStore } from './store/eventStore';
import { omegaAudio } from './utils/audio';
import { initializeAuthListener, logoutUser, quickLoginDemoOperative } from './services/authService';
import { subscribeToEvent } from './services/eventService';
import { useTeam } from './hooks/useTeam';
import { OperativeRole } from './types/game';

export default function App() {
  const {
    operative,
    team,
    addActivityEvent,
    initializeDefaultSession,
  } = useGameStore();

  const { firebaseUser } = useAuthStore();
  const {
    status: eventStatus,
    startTime,
    pausedAt,
    totalPausedTimeSeconds,
    durationMinutes,
    setEventStatus,
  } = useEventStore();

  const [authView, setAuthView] = useState<'login' | 'register' | null>(null);
  const [activeView, setActiveView] = useState<'matrix' | 'lobby' | 'leaderboard'>('matrix');
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [activeLevelWorkspace, setActiveLevelWorkspace] = useState<number | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // Real-time Firestore team synchronization hook
  useTeam(team?.id);

  // Real-time Firestore event lifecycle subscription hook
  useEffect(() => {
    const unsubscribe = subscribeToEvent('omega-protocol-2026', (config) => {
      if (config.status) setEventStatus(config.status);
    });
    return () => unsubscribe();
  }, [setEventStatus]);

  // Initialize Firebase Auth listener and default session on mount
  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    if (!operative && !team) {
      initializeDefaultSession();
    }
    return () => unsubscribe();
  }, [operative, team, initializeDefaultSession]);

  // Check victory condition (all 15 levels completed or level 15 completed)
  useEffect(() => {
    if (team) {
      const completed = Object.values(team.levelProgress).filter((lp) => lp.status === 'COMPLETED').length;
      if (completed >= 15 || team.levelProgress['level-15']?.status === 'COMPLETED') {
        setShowVictoryModal(true);
      }
    }
  }, [team]);

  const handleLogout = async () => {
    omegaAudio.playClick();
    await logoutUser();
  };

  const handleQuickRoleSwitch = (role: OperativeRole) => {
    omegaAudio.playSuccess();
    quickLoginDemoOperative(role);
    if (role === 'admin') {
      setShowAdminControls(true);
    }
    addActivityEvent({
      operativeCallsign: role === 'admin' ? 'OMEGA-OVERSEER' : role === 'memberA' ? 'OMEGA-017-A' : 'OMEGA-017-B',
      operativeRole: role,
      type: 'CONNECT',
      message: `OPERATIVE ROLE SWITCHED TO: ${role.toUpperCase()}`,
    });
  };

  return (
    <OmegaBackground>
      {/* 1. Global Telemetry Bar */}
      <SystemStatus />

      {/* Global Mission State Alert Banners */}
      {eventStatus === 'PAUSED' && (
        <div className="bg-amber-950/90 border-b border-amber-500/60 px-4 py-2 text-center text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-2 tracking-wider animate-pulse sticky top-0 z-50 shadow-lg">
          <PauseCircle className="w-4 h-4 text-amber-400" />
          <span>TOURNAMENT PAUSED BY EVENT CONTROL — ALL MISSION COUNTDOWNS & SUBMISSIONS ARE FROZEN</span>
        </div>
      )}

      {eventStatus === 'FINISHED' && (
        <div className="bg-rose-950/90 border-b border-rose-500/60 px-4 py-2 text-center text-xs font-mono font-bold text-rose-300 flex items-center justify-center gap-2 tracking-wider sticky top-0 z-50 shadow-lg">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>MISSION COUNTDOWN EXPIRED — ALL SUBMISSIONS ARE PERMANENTLY LOCKED — SCORES FINALIZED</span>
        </div>
      )}

      {/* 2. Primary Navigation Header */}
      <header className="border-b border-cyan-900/60 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <OmegaLogo size="md" />

          {/* View Mode Switcher: Matrix vs Lobby vs Leaderboard */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            <button
              onClick={() => {
                omegaAudio.playClick();
                setActiveView('matrix');
              }}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                activeView === 'matrix'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> MATRIX
            </button>

            <button
              onClick={() => {
                omegaAudio.playClick();
                setActiveView('lobby');
              }}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                activeView === 'lobby'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> SQUAD LOBBY
              {team && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                omegaAudio.playClick();
                setActiveView('leaderboard');
              }}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                activeView === 'leaderboard'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> RANKS
            </button>

            {/* Admin Controls Toggle */}
            <button
              onClick={() => {
                omegaAudio.playClick();
                setShowAdminControls(!showAdminControls);
              }}
              className={`px-2.5 py-1.5 rounded flex items-center gap-1 font-bold transition-all cursor-pointer ${
                showAdminControls
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> ADMIN
            </button>
          </div>

          {/* Center: Authoritative Global Mission Timer */}
          <GlobalTimer
            startTime={startTime}
            status={eventStatus}
            pausedAt={pausedAt}
            totalPausedTimeSeconds={totalPausedTimeSeconds}
            durationMinutes={durationMinutes}
          />

          {/* Right Controls: Audio + Auth Badge */}
          <div className="flex items-center gap-3">
            <AudioController />

            {/* Operative Profile Pill */}
            {operative ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex flex-col text-right font-mono hidden sm:block">
                  <span className="text-[10px] text-slate-400">OPERATIVE</span>
                  <span className="text-xs font-bold text-cyan-300">{operative.callsign}</span>
                </div>
                <div
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                    operative.role === 'admin'
                      ? 'bg-purple-950/80 border border-purple-500/50 text-purple-300'
                      : operative.role === 'memberA'
                      ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300'
                      : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {operative.role}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  omegaAudio.playClick();
                  setAuthView('login');
                }}
                className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> AUTHENTICATE
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30">
              <Award className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col text-right font-mono">
                <span className="text-[10px] text-slate-400">TEAM SCORE</span>
                <span className="text-sm font-black text-cyan-300">
                  {team?.totalScore ?? 0} <span className="text-[10px] text-slate-400">XP</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Overseer Drawer / Modal */}
      {showAdminControls && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <AdminEventControls />
        </div>
      )}

      {/* Level Interactive Workspace Modal */}
      {activeLevelWorkspace !== null && (
        <LevelWorkspace
          levelNumber={activeLevelWorkspace}
          onClose={() => setActiveLevelWorkspace(null)}
          onLevelComplete={(lvlNum, earnedXP) => {
            console.log(`Level ${lvlNum} completed with ${earnedXP} XP`);
          }}
        />
      )}

      {/* Victory Modal */}
      {showVictoryModal && (
        <VictoryModal onClose={() => setShowVictoryModal(false)} />
      )}

      {/* Auth Modal Overlay */}
      {authView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => {
                omegaAudio.playClick();
                setAuthView(null);
              }}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold z-10 cursor-pointer shadow-lg"
            >
              ✕
            </button>
            {authView === 'login' ? (
              <Login
                onSuccess={() => setAuthView(null)}
                onSwitchToRegister={() => setAuthView('register')}
              />
            ) : (
              <Register
                onSuccess={() => setAuthView(null)}
                onSwitchToLogin={() => setAuthView('login')}
              />
            )}
          </div>
        </div>
      )}

      {/* 3. Main Operational View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeView === 'lobby' ? (
          <Lobby onEnterCommandCenter={() => setActiveView('matrix')} />
        ) : activeView === 'leaderboard' ? (
          <Leaderboard onBackToMatrix={() => setActiveView('matrix')} />
        ) : (
          <CommandCenter
            onOpenLobby={() => setActiveView('lobby')}
            onLaunchLevel={(lvlNum) => setActiveLevelWorkspace(lvlNum)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-950/80 bg-slate-950/90 py-3 px-4 text-center font-mono text-xs text-slate-500">
        SYSTEM OMEGA v2.6 • TECH ESCAPE ROOM: THE OMEGA PROTOCOL • 15 LEVELS • 105 MINUTES • 1 MISSION
      </footer>
    </OmegaBackground>
  );
}

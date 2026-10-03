import React, { useState } from 'react';
import {
  Users,
  Shield,
  Copy,
  Check,
  UserPlus,
  ArrowRight,
  LogIn,
  AlertCircle,
  Radio,
  Sparkles,
  Play,
  LogOut,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { createTeam, joinTeamByCode, leaveTeam } from '../services/teamService';
import { omegaAudio } from '../utils/audio';
import { OperativeRole } from '../types/game';

interface LobbyProps {
  onEnterCommandCenter: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onEnterCommandCenter }) => {
  const { operative, team, setTeam, setOperative, addActivityEvent } = useGameStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [teamNameInput, setTeamNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operative) {
      setErrorMessage('Operative authentication required before initializing team.');
      omegaAudio.playError();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    omegaAudio.playClick();

    try {
      const newTeam = await createTeam(teamNameInput || 'CYBER VANGUARDS', operative);
      setTeam(newTeam);
      setOperative({
        ...operative,
        teamId: newTeam.id,
        role: 'memberA',
      });
      omegaAudio.playSuccess();
      addActivityEvent({
        operativeCallsign: operative.callsign,
        operativeRole: 'memberA',
        type: 'CONNECT',
        message: `TEAM ${newTeam.id} INITIALIZED. JOIN CODE: ${newTeam.joinCode}`,
      });
    } catch (err: unknown) {
      omegaAudio.playError();
      const msg = err instanceof Error ? err.message : 'Failed to create team';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operative) {
      setErrorMessage('Operative authentication required before joining team.');
      omegaAudio.playError();
      return;
    }

    if (!joinCodeInput.trim()) {
      setErrorMessage('Please enter a valid 6-character Join Code.');
      omegaAudio.playError();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    omegaAudio.playClick();

    try {
      const updatedTeam = await joinTeamByCode(joinCodeInput, operative);
      setTeam(updatedTeam);
      setOperative({
        ...operative,
        teamId: updatedTeam.id,
        role: 'memberB',
      });
      omegaAudio.playSuccess();
      addActivityEvent({
        operativeCallsign: operative.callsign,
        operativeRole: 'memberB',
        type: 'CONNECT',
        message: `JOINED TEAM ${updatedTeam.id} AS OPERATIVE B`,
      });
    } catch (err: unknown) {
      omegaAudio.playError();
      const msg = err instanceof Error ? err.message : 'Failed to join team';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!team?.joinCode) return;
    navigator.clipboard.writeText(team.joinCode);
    setCopiedCode(true);
    omegaAudio.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeaveTeam = async () => {
    if (!team || !operative) return;
    omegaAudio.playClick();
    setIsLoading(true);
    try {
      await leaveTeam(team.id, operative);
      setTeam(null);
      setOperative({
        ...operative,
        teamId: null,
      });
      addActivityEvent({
        operativeCallsign: operative.callsign,
        operativeRole: operative.role,
        type: 'DISCONNECT',
        message: `DEPARTED TEAM LOBBY ${team.id}`,
      });
    } catch (err: unknown) {
      console.error('Leave error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to simulate Teammate joining for single-browser test
  const handleSimulateTeammateJoin = () => {
    if (!team) return;
    omegaAudio.playSuccess();
    const simulatedMemberB = {
      uid: 'sim-op-beta-99',
      name: 'Operative Cipher (Simulated)',
      email: 'cipher@omega.defense',
      callsign: `${team.id}-B`,
      role: 'memberB' as OperativeRole,
      isOnline: true,
      currentLevelNumber: 1,
      lastHeartbeat: Date.now(),
    };

    const updatedTeam = {
      ...team,
      memberCount: 2,
      status: 'active' as const,
      members: {
        ...team.members,
        memberB: simulatedMemberB,
      },
    };

    setTeam(updatedTeam);
    addActivityEvent({
      operativeCallsign: `${team.id}-B`,
      operativeRole: 'memberB',
      type: 'CONNECT',
      message: `SIMULATED OPERATIVE B (${team.id}-B) JOINED TEAM LOBBY`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-mono">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Users className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-widest">
          {team ? 'TEAM STAGING LOBBY' : 'ASSEMBLE OMEGA SQUAD'}
        </h2>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          EACH TEAM CONSISTS OF EXACTLY 2 OPERATIVES CONNECTED TO ONE SHARED TIMELINE, XP POOL, AND MISSION MATRIX.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-500/60 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Case 1: Operative is ALREADY in a Team */}
      {team ? (
        <div className="p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/85 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.2)] space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400">ASSIGNMENT ID:</span>
                <span className="text-base font-black text-white">{team.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  {team.teamName}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>STATUS:</span>
                <span
                  className={`font-bold uppercase ${
                    team.memberCount === 2 ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                  }`}
                >
                  {team.memberCount === 2 ? 'TEAM ASSEMBLED (2/2)' : 'WAITING FOR OPERATIVE B (1/2)'}
                </span>
              </div>
            </div>

            {/* Join Code Card with Copy */}
            <div className="flex items-center gap-3 bg-slate-900 border border-cyan-500/50 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <div>
                <span className="text-[10px] text-slate-400 block">JOIN CODE:</span>
                <span className="text-lg font-black tracking-widest text-cyan-300 font-mono">
                  {team.joinCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                title="Copy Join Code"
                className="p-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2-Operative Staging Pods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slot A: Operative A */}
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 to-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">OPERATIVE A</div>
                    <div className="text-[10px] text-slate-400">Team Initiator / Lead</div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> READY
                </span>
              </div>

              {team.members.memberA ? (
                <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Callsign:</span>
                    <span className="text-cyan-300 font-bold">{team.members.memberA.callsign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{team.members.memberA.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Link Status:</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs italic">
                  Slot Open
                </div>
              )}
            </div>

            {/* Slot B: Operative B */}
            <div
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                team.members.memberB
                  ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-900/60'
                  : 'border-dashed border-slate-700 bg-slate-950/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">OPERATIVE B</div>
                    <div className="text-[10px] text-slate-400">Tactical Specialist</div>
                  </div>
                </div>

                {team.members.memberB ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> READY
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse font-bold">
                    AWAITING JOIN
                  </span>
                )}
              </div>

              {team.members.memberB ? (
                <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Callsign:</span>
                    <span className="text-emerald-300 font-bold">{team.members.memberB.callsign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{team.members.memberB.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Link Status:</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center space-y-2 border border-slate-800/80 rounded-lg bg-slate-900/30">
                  <p className="text-xs text-slate-400">
                    Awaiting teammate to enter Join Code: <strong className="text-cyan-300">{team.joinCode}</strong>
                  </p>
                  <button
                    onClick={handleSimulateTeammateJoin}
                    className="px-2.5 py-1 text-[11px] rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1 mx-auto transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Simulate Operative B Join (Dev Test)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleLeaveTeam}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-mono text-xs border border-rose-900/60 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 bg-rose-950/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> LEAVE SQUAD
            </button>

            <button
              onClick={() => {
                omegaAudio.playSuccess();
                onEnterCommandCenter();
              }}
              className="px-6 py-2.5 rounded-lg font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all cursor-pointer"
            >
              ACCESS OMEGA COMMAND MATRIX <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Case 2: Operative NEEDS to Create or Join a Team */
        <div className="p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/85 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.2)] space-y-6">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => {
                omegaAudio.playClick();
                setActiveTab('create');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> CREATE SQUAD LOBBY
            </button>
            <button
              onClick={() => {
                omegaAudio.playClick();
                setActiveTab('join');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'join'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> JOIN EXISTING SQUAD
            </button>
          </div>

          {activeTab === 'create' ? (
            /* Create Team Tab */
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> SQUAD IDENTIFIER NAME
                </label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. CYBER VANGUARDS, PHANTOM 404"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  A unique 6-character Join Code (e.g. OMG-XXXX) will be generated automatically.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-900/60 text-xs text-slate-300 space-y-1">
                <div className="text-cyan-300 font-bold flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" /> SQUAD FORMATION RULES:
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                  <li>You will be assigned as <strong>OPERATIVE A</strong> (Team Lead).</li>
                  <li>Share the generated code with your partner on their device.</li>
                  <li>Both operatives share the authoritative 105:00 timer, XP, and unlock state.</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'GENERATING SQUAD LOBBY...' : 'INITIALIZE SQUAD LOBBY'}
              </button>
            </form>
          ) : (
            /* Join Team Tab */
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> SQUAD JOIN CODE
                </label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. OMG-9942"
                  required
                  maxLength={12}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-lg font-bold tracking-widest text-cyan-300 placeholder-slate-600 uppercase outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Ask your teammate for their active 6-character Join Code.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'CONNECTING TO SQUAD...' : 'JOIN AS OPERATIVE B'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

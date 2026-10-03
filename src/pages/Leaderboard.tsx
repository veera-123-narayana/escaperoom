import React, { useState } from 'react';
import { Award, Trophy, Users, Clock, ShieldCheck, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useEventStore } from '../store/eventStore';
import { useGameStore } from '../store/gameStore';
import { LeaderboardEntry } from '../types/event';

interface LeaderboardProps {
  onBackToMatrix?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBackToMatrix }) => {
  const { leaderboard } = useEventStore();
  const { team } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamically include current user's team if not present
  const allEntries: LeaderboardEntry[] = [...leaderboard];
  if (team && !allEntries.some((e) => e.teamId === team.id)) {
    const completedCount = Object.values(team.levelProgress).filter((lp) => lp.status === 'COMPLETED').length;
    allEntries.push({
      rank: 1,
      teamId: team.id,
      teamName: team.teamName,
      totalScore: team.totalScore,
      levelsCompleted: completedCount,
      currentLevel: team.currentLevel,
      elapsedSeconds: 0,
      status: team.status === 'finished' ? 'finished' : 'active',
      lastSubmissionTime: Date.now(),
    });
  }

  // Strict tie-breaking rules:
  // Primary: higher totalScore
  // Secondary: earlier lastSubmissionTime
  // Tertiary: faster elapsedSeconds
  allEntries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (a.lastSubmissionTime !== b.lastSubmissionTime) {
      return a.lastSubmissionTime - b.lastSubmissionTime;
    }
    return a.elapsedSeconds - b.elapsedSeconds;
  });

  const rankedEntries = allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const filteredEntries = rankedEntries.filter((e) =>
    e.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.teamId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-cyan-500/40 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                GLOBAL TOURNAMENT STANDINGS
              </span>
              <span className="text-emerald-400 text-[11px] font-bold">LIVE SYNCED</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider">OMEGA PROTOCOL LEADERBOARD</h2>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search squad or ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-cyan-400 text-xs"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
              <th className="py-3 px-4">RANK</th>
              <th className="py-3 px-4">SQUAD</th>
              <th className="py-3 px-4">SECTORS SOLVED</th>
              <th className="py-3 px-4 text-right">TOTAL XP</th>
              <th className="py-3 px-4 text-right">LAST SUBMISSION</th>
              <th className="py-3 px-4 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {filteredEntries.map((row) => {
              const isCurrentTeam = team && team.id === row.teamId;
              return (
                <tr
                  key={row.teamId}
                  className={`transition-all ${
                    isCurrentTeam
                      ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400'
                      : row.rank === 1
                      ? 'bg-amber-950/20'
                      : 'hover:bg-slate-900/40'
                  }`}
                >
                  <td className="py-3.5 px-4 font-black">
                    {row.rank === 1 ? (
                      <span className="text-amber-300 flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-amber-400" /> #1
                      </span>
                    ) : row.rank === 2 ? (
                      <span className="text-slate-200">#2</span>
                    ) : row.rank === 3 ? (
                      <span className="text-amber-600">#3</span>
                    ) : (
                      <span className="text-slate-400">#{row.rank}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{row.teamName}</span>
                      <span className="text-[10px] text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                        {row.teamId}
                      </span>
                      {isCurrentTeam && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold">
                          YOUR SQUAD
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-300">
                    {row.levelsCompleted} / 15 SECTORS
                  </td>

                  <td className="py-3.5 px-4 text-right font-black text-cyan-300 text-sm">
                    {row.totalScore} <span className="text-[10px] text-slate-400">XP</span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                    {new Date(row.lastSubmissionTime).toLocaleTimeString([], { hour12: false })}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : row.status === 'finished'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

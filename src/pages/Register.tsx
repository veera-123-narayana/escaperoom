import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { registerWithEmail } from '../services/authService';
import { OperativeRole } from '../types/game';
import { omegaAudio } from '../utils/audio';

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<OperativeRole>('memberA');
  const [customCallsign, setCustomCallsign] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Please complete all operative registration fields.');
      omegaAudio.playError();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Security passcode confirmation does not match.');
      omegaAudio.playError();
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Passcode must be at least 6 characters for system encryption.');
      omegaAudio.playError();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    omegaAudio.playClick();

    try {
      await registerWithEmail(name, email, password, role, customCallsign);
      omegaAudio.playSuccess();
      onSuccess();
    } catch (err: unknown) {
      omegaAudio.playError();
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('auth/email-already-in-use')) {
        setErrorMessage('Operative email already enrolled. Please login instead.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (selectedRole: OperativeRole) => {
    omegaAudio.playClick();
    setRole(selectedRole);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/85 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.25)] font-mono">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <UserPlus className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-widest">ENROLL OMEGA OPERATIVE</h2>
        <p className="text-xs text-slate-400">
          PROVISION SECURE IDENTITY IN THE OMEGA PROTOCOL DEFENSE DIRECTORY
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-lg bg-rose-950/50 border border-rose-500/60 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name & Callsign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-cyan-400" /> OPERATIVE NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Vance"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> CALLSIGN (OPTIONAL)
            </label>
            <input
              type="text"
              value={customCallsign}
              onChange={(e) => setCustomCallsign(e.target.value)}
              placeholder="e.g. VANGUARD-01"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" /> OPERATIVE EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vance@nbkrist.org"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> PASSCODE KEY
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> CONFIRM PASSCODE
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Tactical Role Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> MISSION ROLE DESIGNATION
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleChange('memberA')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                role === 'memberA'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between mb-1">
                <span>MEMBER A</span>
                {role === 'memberA' && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-400">Team Lead / Primary Operative</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('memberB')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                role === 'memberB'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between mb-1">
                <span>MEMBER B</span>
                {role === 'memberB' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400">Tactical Specialist / Operative 2</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between mb-1">
                <span>ADMIN</span>
                {role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
              </div>
              <div className="text-[10px] text-slate-400">Event Overseer / Control</div>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'ENROLLING IN SYSTEM...' : 'COMPLETE ENROLLMENT & JOIN MISSION'}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <button
          onClick={() => {
            omegaAudio.playClick();
            onSwitchToLogin();
          }}
          className="text-xs text-slate-400 hover:text-cyan-300 transition-all inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Already registered?{' '}
          <span className="text-cyan-400 underline font-bold">Access Terminal Login</span>
        </button>
      </div>
    </div>
  );
};

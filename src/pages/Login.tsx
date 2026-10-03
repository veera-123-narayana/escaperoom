import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  UserCheck,
  AlertCircle,
  LogIn,
  KeyRound,
} from 'lucide-react';
import { loginWithEmail, loginWithGoogle, quickLoginDemoOperative } from '../services/authService';
import { OperativeRole } from '../types/game';
import { omegaAudio } from '../utils/audio';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both operative email and security key.');
      omegaAudio.playError();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    omegaAudio.playClick();

    try {
      await loginWithEmail(email, password);
      omegaAudio.playSuccess();
      onSuccess();
    } catch (err: unknown) {
      omegaAudio.playError();
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
        setErrorMessage('Invalid credentials or unregistered operative ID.');
      } else if (msg.includes('auth/operation-not-supported-in-this-environment')) {
        setErrorMessage('Email/Password provider not active yet in console. Use Google Login or Quick Operative Access below.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    omegaAudio.playClick();
    try {
      await loginWithGoogle('memberA');
      omegaAudio.playSuccess();
      onSuccess();
    } catch (err: unknown) {
      omegaAudio.playError();
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: OperativeRole) => {
    omegaAudio.playSuccess();
    quickLoginDemoOperative(role);
    onSuccess();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/85 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.25)] font-mono">
      {/* Header Badge */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <KeyRound className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-widest">OPERATIVE AUTHENTICATION</h2>
        <p className="text-xs text-slate-400">
          ENTER OMEGA SECURITY CREDENTIALS TO ACCESS MISSION NETWORK
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-lg bg-rose-950/50 border border-rose-500/60 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" /> OPERATIVE EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vanguard@omega.defense"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" /> PASSCODE KEY
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            'AUTHENTICATING...'
          ) : (
            <>
              VERIFY & ACCESS MISSION <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Alternative Login Providers */}
      <div className="mt-5 space-y-3">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest">
            OR VERIFIED SSO
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-cyan-900/70 text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          AUTHENTICATE WITH GOOGLE IDENTITY
        </button>

        {/* Quick Testing Station (Allows instant multi-client role testing) */}
        <div className="pt-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-cyan-400 font-bold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> QUICK ROLE SELECTOR (MULTI-DEVICE TEST)
            </span>
            <span className="text-[9px] text-slate-500">DEV MODE</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('memberA')}
              className="px-2 py-1.5 rounded text-[11px] font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 transition-all cursor-pointer text-center"
            >
              MEMBER A
            </button>
            <button
              onClick={() => handleQuickDemo('memberB')}
              className="px-2 py-1.5 rounded text-[11px] font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 transition-all cursor-pointer text-center"
            >
              MEMBER B
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-1.5 rounded text-[11px] font-bold bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 transition-all cursor-pointer text-center"
            >
              ADMIN
            </button>
          </div>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <button
          onClick={() => {
            omegaAudio.playClick();
            onSwitchToRegister();
          }}
          className="text-xs text-slate-400 hover:text-cyan-300 transition-all inline-flex items-center gap-1 cursor-pointer"
        >
          New Operative? <span className="text-cyan-400 underline font-bold">Register Protocol Credentials</span>{' '}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

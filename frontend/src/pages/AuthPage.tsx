import React, { useState } from 'react';
import { Sparkles, X, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onAuthSuccess,
  onLogout,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await api.register({ email, password, full_name: fullName });
        // Automatically login after register
        const res = await api.login({ email, password });
        onAuthSuccess(res.user);
      } else {
        const res = await api.login({ email, password });
        onAuthSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl">
      <div className="w-full max-w-md bg-[var(--surface-blur)] backdrop-blur-2xl border border-[var(--line-color)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line-color)] flex items-center justify-between bg-[var(--canvas-subtle)]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-[var(--text-vivid)]">FlowMind Identity</span>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-vivid)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile View if logged in */}
        {currentUser && currentUser.email !== 'guest@flowmind.ai' ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] mx-auto flex items-center justify-center text-lg font-bold text-cyan-500">
              {currentUser.full_name?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-vivid)]">
                {currentUser.full_name || 'Strategist'}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{currentUser.email}</p>
            </div>

            <div className="p-3 bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl text-xs text-[var(--text-body)] flex items-center justify-between">
              <span>Scoped AI Memory:</span>
              <span className="text-emerald-500 font-mono">Isolated & Encrypted</span>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors"
            >
              Sign Out of Account
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-base font-semibold text-[var(--text-vivid)]">
                {isRegister ? 'Create FlowMind Account' : 'Welcome to FlowMind'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isRegister
                  ? 'Isolate decision memory and store custom constraints'
                  : 'Access your persistent decision models'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-300 text-center">
                {errorMsg}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Full Name
                </label>
                <div className="flex items-center px-3 py-2 bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-[var(--text-muted)] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-transparent text-[var(--text-vivid)] placeholder-[var(--text-muted)] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                Email Address
              </label>
              <div className="flex items-center px-3 py-2 bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl text-xs">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] mr-2 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-transparent text-[var(--text-vivid)] placeholder-[var(--text-muted)] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                Password
              </label>
              <div className="flex items-center px-3 py-2 bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl text-xs">
                <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] mr-2 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-[var(--text-vivid)] placeholder-[var(--text-muted)] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg(null);
                }}
                className="text-xs text-[var(--text-muted)] hover:text-cyan-500 transition-colors"
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

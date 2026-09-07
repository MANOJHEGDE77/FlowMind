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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-space-900 border border-space-750 rounded-2xl shadow-modal-depth overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-space-950/40">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center text-space-950">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-white">FlowMind Identity</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile View if logged in */}
        {currentUser && currentUser.email !== 'guest@flowmind.ai' ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-space-800 border border-space-700 mx-auto flex items-center justify-center text-lg font-bold text-brand-primary">
              {currentUser.full_name?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {currentUser.full_name || 'Strategist'}
              </h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>

            <div className="p-3 bg-space-950/70 border border-space-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <span>Scoped AI Memory:</span>
              <span className="text-emerald-400 font-mono">Isolated & Encrypted</span>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-space-800 hover:bg-space-750 text-rose-400 hover:text-rose-300 text-xs font-medium border border-space-700 transition-colors"
            >
              Sign Out of Account
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-base font-semibold text-white">
                {isRegister ? 'Create FlowMind Account' : 'Welcome to FlowMind'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRegister
                  ? 'Isolate decision memory and store custom constraints'
                  : 'Access your persistent decision models'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 text-center">
                {errorMsg}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Full Name
                </label>
                <div className="flex items-center px-3 py-2 bg-space-950 border border-space-750 rounded-lg text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-transparent text-white placeholder-slate-600 focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Email Address
              </label>
              <div className="flex items-center px-3 py-2 bg-space-950 border border-space-750 rounded-lg text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-transparent text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                Password
              </label>
              <div className="flex items-center px-3 py-2 bg-space-950 border border-space-750 rounded-lg text-xs">
                <Lock className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-sky-400 text-space-950 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-brand-primary/20 disabled:opacity-50"
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
                className="text-xs text-slate-400 hover:text-brand-primary transition-colors"
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

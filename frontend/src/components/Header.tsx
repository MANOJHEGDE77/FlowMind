import React from 'react';
import { Sparkles, Command, ShieldCheck, History, Plus, Layout, ArrowLeft } from 'lucide-react';
import { User, Decision } from '../types';

interface HeaderProps {
  currentDecision: Decision | null;
  currentUser: User | null;
  activeView: 'workspace' | 'landing' | 'history';
  onNavigate: (view: 'workspace' | 'landing' | 'history') => void;
  onNewDecision: () => void;
  onOpenCommandPalette: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDecision,
  currentUser,
  activeView,
  onNavigate,
  onNewDecision,
  onOpenCommandPalette,
  onOpenAuth,
}) => {
  return (
    <header className="h-14 border-b border-space-800 bg-space-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2 group focus:outline-none"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-accent to-brand-primary flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-space-950" />
          </div>
          <span className="font-semibold text-sm tracking-wide text-white group-hover:text-brand-primary transition-colors">
            FLOWMIND
          </span>
        </button>

        {currentDecision && activeView === 'workspace' && (
          <>
            <span className="text-space-600">/</span>
            <div className="flex items-center space-x-2 max-w-xs md:max-w-md truncate">
              <span className="text-xs text-slate-300 font-medium truncate">
                {currentDecision.title}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                  currentDecision.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : currentDecision.status === 'challenged'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse'
                }`}
              >
                {currentDecision.status}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 bg-space-900 hover:bg-space-850 text-slate-400 hover:text-slate-200 border border-space-800 hover:border-space-700 px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
        >
          <Command className="w-3.5 h-3.5 text-slate-500" />
          <span>Search or trigger action</span>
          <kbd className="bg-space-800 text-[10px] px-1.5 py-0.5 rounded text-slate-400 border border-space-700 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center space-x-2">
        {activeView !== 'workspace' ? (
          <button
            onClick={() => onNavigate('workspace')}
            className="flex items-center space-x-1.5 bg-brand-primary hover:bg-sky-400 text-space-950 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Open Workspace</span>
          </button>
        ) : (
          <button
            onClick={onNewDecision}
            className="flex items-center space-x-1.5 bg-space-850 hover:bg-space-800 text-slate-200 border border-space-700 hover:border-slate-500 px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-brand-primary" />
            <span>New Decision</span>
          </button>
        )}

        <button
          onClick={() => onNavigate(activeView === 'history' ? 'workspace' : 'history')}
          className={`flex items-center space-x-1 p-2 rounded-lg text-xs transition-colors ${
            activeView === 'history'
              ? 'bg-space-800 text-brand-primary'
              : 'text-slate-400 hover:text-slate-200 hover:bg-space-900'
          }`}
          title="Decision History & Outcomes"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2 pl-2 border-l border-space-800 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-space-800 border border-space-700 flex items-center justify-center text-xs font-semibold text-brand-primary">
            {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'A'}
          </div>
        </button>
      </div>
    </header>
  );
};

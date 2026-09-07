import React from 'react';
import {
  Sparkles, Command, Sun, Moon, Compass,
  Layers, BookOpen, Plus, User as UserIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { User, Decision } from '../types';

interface MinimalNavProps {
  activeView: 'home' | 'workspace' | 'library' | 'explore';
  onNavigate: (view: 'home' | 'workspace' | 'library' | 'explore') => void;
  onNewDecision: () => void;
  onOpenCommandPalette: () => void;
  onOpenAuth: () => void;
  currentDecision: Decision | null;
  currentUser: User | null;
}

export const MinimalNav: React.FC<MinimalNavProps> = ({
  activeView,
  onNavigate,
  onNewDecision,
  onOpenCommandPalette,
  onOpenAuth,
  currentDecision,
  currentUser,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Minimal Wordmark & Navigation Links */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-left focus:outline-none group"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-400 to-emerald-400 flex items-center justify-center text-space-950 font-bold shadow-sm group-hover:opacity-90 transition-opacity">
            <span className="text-[10px] font-mono tracking-tighter">FM</span>
          </div>
          <span className="font-semibold text-xs tracking-wider text-[var(--text-primary)] font-mono">
            FLOWMIND
          </span>
        </button>

        {/* Minimal Navigation Pills */}
        <div className="hidden sm:flex items-center space-x-1 text-xs">
          <button
            onClick={() => onNavigate('home')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeView === 'home'
                ? 'text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1.5 ${
              activeView === 'workspace'
                ? 'text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <span>Workspace</span>
            {currentDecision && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => onNavigate('library')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeView === 'library'
                ? 'text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Decisions
          </button>

          <button
            onClick={() => onNavigate('explore')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeView === 'explore'
                ? 'text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Explore
          </button>
        </div>
      </div>

      {/* Center: Active Context Breadcrumb (when on workspace) */}
      {activeView === 'workspace' && currentDecision && (
        <div className="hidden lg:flex items-center space-x-2 text-xs text-[var(--text-muted)] max-w-sm truncate">
          <span>/</span>
          <span className="text-[var(--text-secondary)] font-medium truncate">
            {currentDecision.title}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {currentDecision.confidence_score}%
          </span>
        </div>
      )}

      {/* Right: Actions, Command Trigger, Theme & User */}
      <div className="flex items-center space-x-2">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-md transition-all"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">Command</span>
          <kbd className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] px-1 rounded border border-[var(--border-subtle)]">
            ⌘K
          </kbd>
        </button>

        {/* New Decision Button */}
        <button
          onClick={onNewDecision}
          className="flex items-center space-x-1 text-xs text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-md transition-all font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">New Dilemma</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenAuth}
          className="w-7 h-7 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-mono font-medium text-[var(--text-primary)] hover:border-sky-400 transition-colors"
        >
          {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
        </button>
      </div>
    </nav>
  );
};

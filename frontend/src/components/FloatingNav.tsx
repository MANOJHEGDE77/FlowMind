import React, { useState } from 'react';
import {
  Sparkles, Command, Sun, Moon,
  Compass, Layers, Archive, Plus, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { User, Decision } from '../types';

interface FloatingNavProps {
  activeView: 'home' | 'workspace' | 'archive' | 'explore';
  onNavigate: (view: 'home' | 'workspace' | 'archive' | 'explore') => void;
  onNewDecision: () => void;
  onOpenCommandPalette: () => void;
  onOpenAuth: () => void;
  currentDecision: Decision | null;
  currentUser: User | null;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeView,
  onNavigate,
  onNewDecision,
  onOpenCommandPalette,
  onOpenAuth,
  currentDecision,
  currentUser,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Top Floating Anchors (Completely borderless, non-invasive) */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 py-5 flex items-center justify-between pointer-events-none select-none">
        {/* Top-Left: Ethereal Logo Mark */}
        <div className="pointer-events-auto flex items-center space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-left focus:outline-none group opacity-85 hover:opacity-100 transition-opacity"
          >
            <span className="text-sky-400 font-serif text-sm">✦</span>
            <span className="text-xs font-mono font-bold tracking-widest text-[var(--text-vivid)]">
              FLOWMIND
            </span>
          </button>

          {activeView === 'workspace' && currentDecision && (
            <div className="flex items-center space-x-2 text-[11px] font-mono text-[var(--text-faint)]">
              <span>/</span>
              <span className="text-[var(--text-body)] truncate max-w-xs">
                {currentDecision.title}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                {currentDecision.confidence_score}% SIGNAL
              </span>
            </div>
          )}
        </div>

        {/* Top-Right: Quick Actions */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          {activeView === 'workspace' && (
            <button
              onClick={() => onNavigate('home')}
              className="text-[11px] font-mono text-[var(--text-body)] hover:text-[var(--text-vivid)] bg-[var(--surface-blur)] backdrop-blur-md px-2.5 py-1 rounded-full border border-[var(--line-color)] transition-all flex items-center space-x-1"
            >
              <Plus className="w-3 h-3 text-sky-400" />
              <span>New Dilemma</span>
            </button>
          )}

          <button
            onClick={onOpenCommandPalette}
            className="text-[11px] font-mono text-[var(--text-body)] hover:text-[var(--text-vivid)] bg-[var(--surface-blur)] backdrop-blur-md px-2.5 py-1 rounded-full border border-[var(--line-color)] transition-all flex items-center space-x-1.5"
            title="Open Command Center (⌘K)"
          >
            <Command className="w-3 h-3 text-[var(--text-faint)]" />
            <kbd className="text-[9px] text-[var(--text-faint)]">⌘K</kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full text-[var(--text-faint)] hover:text-[var(--text-vivid)] bg-[var(--surface-blur)] backdrop-blur-md border border-[var(--line-color)] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          <button
            onClick={onOpenAuth}
            className="w-6 h-6 rounded-full bg-[var(--surface-blur)] backdrop-blur-md border border-[var(--line-color)] flex items-center justify-center text-[10px] font-mono font-semibold text-[var(--text-body)] hover:border-sky-400 transition-colors"
          >
            {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
          </button>
        </div>
      </header>

      {/* Floating Bottom Spatial Switcher (Emerges seamlessly) */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none select-none"
      >
        <div className="pointer-events-auto flex items-center space-x-1 p-1 rounded-full bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] shadow-2xl transition-all duration-300">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              activeView === 'home'
                ? 'bg-sky-500/20 text-sky-400 font-semibold'
                : 'text-[var(--text-faint)] hover:text-[var(--text-body)]'
            }`}
          >
            Thinking
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors flex items-center space-x-1.5 ${
              activeView === 'workspace'
                ? 'bg-sky-500/20 text-sky-400 font-semibold'
                : 'text-[var(--text-faint)] hover:text-[var(--text-body)]'
            }`}
          >
            <span>Workspace</span>
            {currentDecision && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => onNavigate('archive')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              activeView === 'archive'
                ? 'bg-sky-500/20 text-sky-400 font-semibold'
                : 'text-[var(--text-faint)] hover:text-[var(--text-body)]'
            }`}
          >
            Archive
          </button>

          <button
            onClick={() => onNavigate('explore')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              activeView === 'explore'
                ? 'bg-sky-500/20 text-sky-400 font-semibold'
                : 'text-[var(--text-faint)] hover:text-[var(--text-body)]'
            }`}
          >
            Explore
          </button>
        </div>
      </div>
    </>
  );
};

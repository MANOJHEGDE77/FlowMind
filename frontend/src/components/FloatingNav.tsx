import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Search, Sun, Moon, Plus,
  Layers, Compass, Archive, ChevronRight, HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { User, Decision } from '../types';

interface FloatingNavProps {
  activeView: 'home' | 'workspace' | 'archive' | 'explore';
  onNavigate: (view: 'home' | 'workspace' | 'archive' | 'explore') => void;
  onNewDecision: () => void;
  onOpenCommandPalette: () => void;
  onOpenHelp?: () => void;
  onOpenAuth: () => void;
  currentDecision: Decision | null;
  currentUser: User | null;
}

const NAV_ITEMS = [
  {
    id: 'home',
    symbol: '✦',
    label: 'Thinking',
    shortcut: '1',
    hint: 'Thinking: Create or refine your active dilemma',
  },
  {
    id: 'workspace',
    symbol: '◉',
    label: 'Workspace',
    shortcut: '2',
    hint: 'Workspace: Explore connected options, risks, and the AI signal',
  },
  {
    id: 'archive',
    symbol: '▱',
    label: 'Decision Memory',
    shortcut: '3',
    hint: 'Decision Memory: Review past choices & calibrate actual outcomes',
  },
  {
    id: 'explore',
    symbol: '⌕',
    label: 'Explore',
    shortcut: '4',
    hint: 'Explore: Discover personal patterns, insights & decision starters',
  },
] as const;

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeView,
  onNavigate,
  onNewDecision,
  onOpenCommandPalette,
  onOpenHelp,
  onOpenAuth,
  currentDecision,
  currentUser,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Keyboard shortcut listener for 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '1') onNavigate('home');
      if (e.key === '2' && currentDecision) onNavigate('workspace');
      if (e.key === '3') onNavigate('archive');
      if (e.key === '4') onNavigate('explore');
      if (e.key === '?') onOpenHelp?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, currentDecision, onOpenHelp]);

  return (
    <>
      {/* Top Floating Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 sm:px-8 py-4 flex items-center justify-between pointer-events-none select-none">
        {/* Top-Left: Refined Logo & Breadcrumb */}
        <div className="pointer-events-auto flex items-center space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2.5 text-left focus:outline-none group opacity-95 hover:opacity-100 transition-opacity"
            title="FlowMind Home"
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-400/30">
              <span className="text-cyan-400 text-xs font-serif group-hover:scale-110 transition-transform">
                ✦
              </span>
            </div>

            <span className="text-xs font-mono font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">
              FLOWMIND
            </span>
          </button>

          {activeView === 'workspace' && currentDecision ? (
            <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-slate-400 pl-3 border-l border-slate-800">
              <span className="text-slate-400 font-normal">Workspace:</span>
              <span className="text-white truncate max-w-xs font-medium">
                {currentDecision.title}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                {currentDecision.confidence_score}% SIGNAL
              </span>
            </div>
          ) : (
            <span className="hidden sm:inline-block text-[9px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded-full border border-slate-800">
              AI DECISION PLATFORM
            </span>
          )}
        </div>

        {/* Top-Right Controls: Clear Search Trigger, Help, Theme, Profile */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          {/* Prominent Search & Command Trigger Bar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-2.5 text-[11px] font-mono text-slate-300 hover:text-white bg-[var(--surface-blur)] backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-[var(--line-color)] hover:border-cyan-400/50 transition-all shadow-md group"
            title="Search FlowMind or ask anything (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-slate-400 group-hover:text-slate-200">
              Search FlowMind...
            </span>
            <kbd className="text-[9px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </motion.button>

          {/* New Dilemma Quick Action (Only in Workspace) */}
          {activeView === 'workspace' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNewDecision}
              className="hidden lg:flex text-[11px] font-mono text-slate-300 hover:text-white bg-[var(--surface-blur)] backdrop-blur-xl px-3 py-1.5 rounded-full border border-[var(--line-color)] hover:border-cyan-500/40 transition-all items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3 h-3 text-cyan-400" />
              <span>New Dilemma</span>
            </motion.button>
          )}

          {/* How It Works Help Button (?) */}
          {onOpenHelp && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenHelp}
              className="w-7 h-7 rounded-full text-slate-400 hover:text-cyan-300 bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] hover:border-cyan-400/40 flex items-center justify-center text-xs font-mono font-bold transition-colors shadow-sm"
              title="How FlowMind Works (?)"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] hover:border-slate-600 transition-colors shadow-sm"
            title="Toggle theme (Light / Dark)"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </motion.button>

          {/* Profile / User */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAuth}
            className="w-7 h-7 rounded-full bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] hover:border-cyan-400 flex items-center justify-center text-[11px] font-mono font-bold text-white shadow-sm"
            title="User Account"
          >
            {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : '✦'}
          </motion.button>
        </div>
      </header>

      {/* Floating Bottom Command Dock */}
      <div className="fixed bottom-6 inset-x-0 z-40 flex flex-col items-center pointer-events-none select-none">
        {/* Contextual Hover Preview Tooltip */}
        {hoveredNav && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="mb-2 px-3.5 py-1 rounded-full bg-[var(--surface-blur)] backdrop-blur-xl border border-cyan-500/30 text-[10px] font-mono text-cyan-200 shadow-xl pointer-events-auto"
          >
            {NAV_ITEMS.find((item) => item.id === hoveredNav)?.hint}
          </motion.div>
        )}

        {/* The Dock */}
        <div className="pointer-events-auto relative flex items-center space-x-1 p-1.5 rounded-full bg-[var(--surface-blur)] backdrop-blur-2xl border border-[var(--line-color)] shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center space-x-1.5 z-10 ${
                  isActive
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Sliding active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeDockIndicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-cyan-500/20 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.25)] -z-10"
                  />
                )}

                <span className="text-[11px] opacity-80">{item.symbol}</span>
                <span>{item.label}</span>

                {item.id === 'workspace' && currentDecision && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                )}

                <kbd className="hidden lg:inline-block text-[9px] font-mono text-slate-500">
                  {item.shortcut}
                </kbd>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

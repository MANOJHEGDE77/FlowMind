import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Search, Sun, Moon, Plus,
  Layers, Compass, Archive, ChevronRight, HelpCircle,
  Volume2, VolumeX
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { soundService } from '../services/sound';
import { User, Decision } from '../types';

interface FloatingNavProps {
  activeView: 'landing' | 'home' | 'workspace' | 'archive' | 'explore';
  onNavigate: (view: 'landing' | 'home' | 'workspace' | 'archive' | 'explore') => void;
  onNewDecision: () => void;
  onOpenCommandPalette: () => void;
  onOpenHelp?: () => void;
  onOpenAskAI?: () => void;
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
    hint: 'Thinking: Create or refine your active dilemma in Thought Composer',
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
  onOpenAskAI,
  onOpenAuth,
  currentDecision,
  currentUser,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Keyboard shortcut listener for 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '0') onNavigate('landing');
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
      {/* Top Minimal Premium Navigation Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 sm:px-10 py-4 flex items-center justify-between pointer-events-none select-none bg-gradient-to-b from-[#030408]/90 via-[#030408]/60 to-transparent backdrop-blur-[12px] border-b border-white/[0.04]">
        {/* Left: Brand Identity */}
        <div className="pointer-events-auto flex items-center space-x-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 text-left focus:outline-none group opacity-95 hover:opacity-100 transition-all"
            title="FlowMind"
          >
            {/* Luminous Neural Node Vector Mark */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-600/20 to-purple-600/20 border border-cyan-400/30 shadow-[0_0_20px_rgba(0,240,255,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="navLogoPrism" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00F0FF" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z" stroke="url(#navLogoPrism)" strokeWidth="2" strokeLinejoin="round" />
                <path d="M16 3V16L28 22.5M16 16L4 22.5M16 16L28 9.5M16 16L4 9.5" stroke="url(#navLogoPrism)" strokeWidth="1.2" strokeOpacity="0.75" />
                <circle cx="16" cy="16" r="2.5" fill="#00F0FF" className="animate-pulse" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-mono font-bold tracking-[0.25em] text-white">
                FLOWMIND
              </span>
              <span className="text-[9px] font-mono tracking-widest text-cyan-400/80 -mt-0.5">
                DECISION INTELLIGENCE
              </span>
            </div>
          </button>

          {/* Active Workspace Dilemma Breadcrumb */}
          {activeView === 'workspace' && currentDecision && (
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono pl-4 border-l border-white/[0.08] text-slate-400">
              <span className="text-slate-500">Workspace:</span>
              <span className="truncate max-w-xs font-medium text-white">
                {currentDecision.title}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentDecision.confidence_score}% SIGNAL</span>
              </span>
            </div>
          )}
        </div>

        {/* Center: Minimal Navigation Links */}
        <nav className="pointer-events-auto hidden md:flex items-center space-x-8 text-xs font-mono tracking-wide text-slate-400">
          <button
            onClick={() => onNavigate('landing')}
            className={`hover:text-white transition-colors ${activeView === 'landing' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            Product
          </button>
          <button
            onClick={() => onOpenHelp?.()}
            className="hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className={`hover:text-white transition-colors ${activeView === 'explore' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            Intelligence
          </button>
          <button
            onClick={() => onNavigate('archive')}
            className={`hover:text-white transition-colors ${activeView === 'archive' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            Research
          </button>
        </nav>

        {/* Right: Sign In & Primary CTA */}
        <div className="pointer-events-auto flex items-center space-x-3.5">
          {/* Search Trigger */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-2 text-[11px] font-mono px-3 py-1.5 rounded-full text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-cyan-400/40 transition-all"
            title="Command Palette (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-slate-500">
              ⌘K
            </kbd>
          </motion.button>

          {/* Sound Synthesizer Mute/Unmute */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const next = soundService.toggleMute();
              setIsMuted(next);
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-cyan-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </motion.button>

          {/* Sign In / Profile */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAuth}
            className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-all"
          >
            {currentUser?.full_name ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{currentUser.full_name.split(' ')[0]}</span>
              </span>
            ) : (
              'Sign In'
            )}
          </motion.button>

          {/* Primary CTA: [ Enter Flow ] */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundService.playSuccess();
              onNavigate('home');
            }}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-violet-500 text-black font-mono font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            <span>Enter Flow</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </header>

      {/* Floating Bottom Command Dock (Hidden on Landing Page, visible in Workspace & Intelligence Views) */}
      {activeView !== 'landing' && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex flex-col items-center pointer-events-none select-none">
        {/* Contextual Hover Preview Tooltip */}
        {hoveredNav && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className={`mb-2.5 px-3.5 py-1 rounded-full text-[10px] font-mono shadow-xl pointer-events-auto border ${
              theme === 'dark'
                ? 'bg-slate-950/80 backdrop-blur-xl border-cyan-500/30 text-cyan-200 shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
                : 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)]'
            }`}
          >
            {NAV_ITEMS.find((item) => item.id === hoveredNav)?.hint}
          </motion.div>
        )}

        {/* The Dock (Linear / macOS Island style - Adapts to Light & Dark) */}
        <div className={`pointer-events-auto relative flex items-center space-x-1 p-1.5 rounded-full backdrop-blur-2xl border transition-colors ${
          theme === 'dark'
            ? 'bg-slate-950/75 border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]'
            : 'bg-white/90 border-slate-200/90 shadow-[0_16px_40px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)]'
        }`}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono transition-all flex items-center space-x-2 z-10 ${
                  isActive
                    ? theme === 'dark' ? 'text-cyan-200 font-bold' : 'text-indigo-700 font-bold'
                    : theme === 'dark' ? 'text-slate-400 hover:text-slate-100' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {/* Sliding active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeDockIndicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className={`absolute inset-0 rounded-full border -z-10 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-cyan-500/25 via-indigo-500/20 to-cyan-500/25 border-cyan-400/40 shadow-[0_0_16px_rgba(0,240,255,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'bg-gradient-to-r from-indigo-500/15 via-sky-500/15 to-indigo-500/15 border-indigo-400/40 shadow-sm'
                    }`}
                  />
                )}

                <span className="text-[11px] opacity-85">{item.symbol}</span>
                <span>{item.label}</span>

                {item.id === 'workspace' && currentDecision && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                )}

                <kbd className={`hidden lg:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  theme === 'dark'
                    ? 'text-slate-500 bg-white/[0.04] border-white/[0.06]'
                    : 'text-slate-400 bg-slate-100 border-slate-200'
                }`}>
                  {item.shortcut}
                </kbd>
              </button>
            );
          })}
        </div>
      </div>
      )}
    </>
  );
};

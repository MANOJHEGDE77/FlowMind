import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Command, Sun, Moon, Plus,
  Layers, Compass, Archive, ChevronRight
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

const NAV_ITEMS = [
  { id: 'home', label: 'Thinking', shortcut: '1', hint: 'Core thought stream & unstructured inputs' },
  { id: 'workspace', label: 'Workspace', shortcut: '2', hint: 'Full-viewport spatial decision canvas' },
  { id: 'archive', label: 'Archive', shortcut: '3', hint: 'Tree timeline of human decisions' },
  { id: 'explore', label: 'Explore', shortcut: '4', hint: 'Curated high-stakes dilemma templates' },
] as const;

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
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Keyboard shortcut listener for 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '1') onNavigate('home');
      if (e.key === '2' && currentDecision) onNavigate('workspace');
      if (e.key === '3') onNavigate('archive');
      if (e.key === '4') onNavigate('explore');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, currentDecision]);

  return (
    <>
      {/* Top Floating Controls (Completely borderless, minimalist) */}
      <header className="fixed top-0 inset-x-0 z-40 px-8 py-5 flex items-center justify-between pointer-events-none select-none">
        {/* Top-Left: Refined Logo Mark */}
        <div className="pointer-events-auto flex items-center space-x-3.5">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2.5 text-left focus:outline-none group opacity-90 hover:opacity-100 transition-opacity"
          >
            {/* Geometric Glowing Emblem */}
            <div className="relative flex items-center justify-center w-5 h-5">
              <span className="text-cyan-400 text-sm font-serif group-hover:scale-110 transition-transform">
                ✦
              </span>
              <div className="absolute inset-0 rounded-full border border-cyan-400/30 group-hover:border-cyan-400/70 transition-colors animate-pulse" />
            </div>

            <span className="text-xs font-mono font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.2)]">
              FLOWMIND
            </span>
          </button>

          <span className="hidden sm:inline-block text-[9px] font-mono text-cyan-400/70 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
            ENGINE v2.4 • LIVE
          </span>

          {activeView === 'workspace' && currentDecision && (
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 pl-2 border-l border-slate-800">
              <span className="text-slate-300 truncate max-w-xs font-medium">
                {currentDecision.title}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                {currentDecision.confidence_score}% SIGNAL
              </span>
            </div>
          )}
        </div>

        {/* Top-Right Controls: Command, Theme, Profile */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          {activeView === 'workspace' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNewDecision}
              className="text-[11px] font-mono text-slate-300 hover:text-white bg-[var(--surface-blur)] backdrop-blur-xl px-3 py-1.5 rounded-full border border-[var(--line-color)] hover:border-cyan-500/40 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3 h-3 text-cyan-400" />
              <span>New Dilemma</span>
            </motion.button>
          )}

          {/* Command Palette Trigger (⌘K) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenCommandPalette}
            className="text-[11px] font-mono text-slate-300 hover:text-white bg-[var(--surface-blur)] backdrop-blur-xl px-3 py-1.5 rounded-full border border-[var(--line-color)] hover:border-cyan-500/40 transition-all flex items-center space-x-2 shadow-sm"
            title="Open Command Layer (⌘K)"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <kbd className="text-[10px] font-mono text-slate-400 font-semibold">⌘K</kbd>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] hover:border-slate-600 transition-colors shadow-sm"
            title="Toggle theme"
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
            className="mb-2 px-3 py-1 rounded-full bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] text-[10px] font-mono text-slate-300 shadow-xl pointer-events-auto"
          >
            {NAV_ITEMS.find((item) => item.id === hoveredNav)?.hint}
          </motion.div>
        )}

        {/* The Dock */}
        <div className="pointer-events-auto relative flex items-center space-x-1 p-1.5 rounded-full bg-[var(--surface-blur)] backdrop-blur-2xl border border-[var(--line-color)] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono transition-colors flex items-center space-x-1.5 z-10 ${
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
                    className="absolute inset-0 rounded-full bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)] -z-10"
                  />
                )}

                <span>{item.label}</span>

                {item.id === 'workspace' && currentDecision && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                )}

                <kbd className="hidden md:inline-block text-[9px] font-mono text-slate-500">
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

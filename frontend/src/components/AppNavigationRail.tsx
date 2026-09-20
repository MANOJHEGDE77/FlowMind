import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, GitGraph, Sparkles, Network, CheckSquare,
  Timer, Library, Settings, User, Volume2, VolumeX
} from 'lucide-react';
import { FlowMindLogo } from './FlowMindLogo';
import { soundService } from '../services/sound';

export type AppView = 'home' | 'flows' | 'ai-think' | 'canvas' | 'tasks' | 'focus' | 'library';

interface AppNavigationRailProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

const NAV_ITEMS: Array<{
  id: AppView;
  label: string;
  icon: React.ElementType;
  shortcut: string;
  color: string;
}> = [
  { id: 'home', label: 'Home', icon: Home, shortcut: '1', color: '#00F0FF' },
  { id: 'flows', label: 'My Flow', icon: GitGraph, shortcut: '2', color: '#6366F1' },
  { id: 'canvas', label: 'Mind Canvas', icon: Network, shortcut: '3', color: '#8B5CF6' },
  { id: 'ai-think', label: 'AI Think', icon: Sparkles, shortcut: '4', color: '#38BDF8' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, shortcut: '5', color: '#10B981' },
  { id: 'focus', label: 'Focus', icon: Timer, shortcut: '6', color: '#F59E0B' },
  { id: 'library', label: 'Library', icon: Library, shortcut: '7', color: '#EC4899' },
];

export const AppNavigationRail: React.FC<AppNavigationRailProps> = ({
  activeView,
  onNavigate,
  onOpenSettings,
  onOpenProfile,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  return (
    <aside className="w-18 md:w-20 h-screen shrink-0 bg-[#060812]/95 border-r border-white/[0.07] backdrop-blur-2xl flex flex-col items-center justify-between py-5 z-40 select-none">
      {/* Top: Brand Logo */}
      <div className="flex flex-col items-center space-y-6">
        <FlowMindLogo
          size="sm"
          showWordmark={false}
          onClick={() => {
            soundService.playChime();
            onNavigate('home');
          }}
        />

        <div className="w-8 h-[1px] bg-white/[0.08]" />

        {/* Primary Navigation Rail */}
        <nav className="flex flex-col items-center space-y-2.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    soundService.playClick();
                    onNavigate(item.id);
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-white/[0.08] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                  aria-label={item.label}
                >
                  {/* Subtle Active Accent Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeRailIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute -left-2.5 top-2.5 bottom-2.5 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_10px_#00F0FF]"
                    />
                  )}

                  <Icon
                    className="w-5 h-5 transition-transform group-hover:scale-110"
                    style={{ color: isActive ? item.color : undefined }}
                  />
                </button>

                {/* Floating Tooltip with Keyboard Shortcut */}
                <AnimatePresence>
                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 8, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-14 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl bg-[#0C1022] border border-white/[0.12] text-xs font-mono text-white shadow-2xl flex items-center space-x-2 whitespace-nowrap pointer-events-none"
                    >
                      <span className="font-medium font-sans">{item.label}</span>
                      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-cyan-400">
                        {item.shortcut}
                      </kbd>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Audio Mute, Settings, User Profile */}
      <div className="flex flex-col items-center space-y-3 pt-4 border-t border-white/[0.08] w-full px-3">
        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            const next = soundService.toggleMute();
            setIsMuted(next);
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04] transition-colors"
          title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenSettings();
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Workspace Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenProfile();
          }}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500/30 to-indigo-600/40 border border-white/[0.15] hover:border-cyan-400 flex items-center justify-center text-xs font-mono font-bold text-white transition-all shadow-md"
          title="Account Profile"
        >
          <span>FM</span>
        </button>
      </div>
    </aside>
  );
};

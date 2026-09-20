import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Bell, Plus, ChevronRight, Cpu } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface AppTopBarProps {
  onOpenCommand: () => void;
  onOpenNotifications: () => void;
  onNewFlow: () => void;
  onOpenAIThink: () => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  onOpenCommand,
  onOpenNotifications,
  onNewFlow,
  onOpenAIThink,
}) => {
  const { activeFlow } = useFlow();

  return (
    <header className="h-14 border-b border-white/[0.07] bg-[#060812]/80 backdrop-blur-xl px-5 flex items-center justify-between z-30 select-none">
      {/* Left: Active Workspace / Flow Name Breadcrumb */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <span className="text-slate-500 uppercase tracking-wider hidden sm:inline">Workspace</span>
        <span className="text-slate-600 hidden sm:inline">/</span>

        <div className="flex items-center space-x-2">
          <span className="text-white font-medium text-xs sm:text-sm font-sans truncate max-w-[200px] sm:max-w-xs">
            {activeFlow?.title || 'FlowMind Workspace'}
          </span>

          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-[10px] font-mono font-bold flex items-center space-x-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>LIVE SYNC</span>
          </span>
        </div>
      </div>

      {/* Center: Global Search & Command Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => {
            soundService.playClick();
            onOpenCommand();
          }}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-400/40 text-slate-400 hover:text-slate-200 transition-all text-xs font-sans group shadow-sm"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-400 font-light truncate">Search thoughts, tasks, ideas...</span>
          </div>

          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 text-slate-400 shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: AI Intelligence Status, New Flow Action & Alerts */}
      <div className="flex items-center space-x-2.5">
        {/* Quick New Flow Trigger */}
        <button
          onClick={() => {
            soundService.playChime();
            onNewFlow();
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-violet-500/15 hover:from-cyan-500/25 hover:to-violet-500/25 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-300 font-mono text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Flow</span>
        </button>

        {/* AI System Status Indicator */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenAIThink();
          }}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-indigo-400/40 text-xs font-mono text-slate-300 transition-all"
          title="FlowMind AI Engine Status"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="hidden lg:inline text-slate-300">Cognitive Core</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenNotifications();
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </button>
      </div>
    </header>
  );
};

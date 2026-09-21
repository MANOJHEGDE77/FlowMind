import React from 'react';
import { Search, Plus, Sparkles, Bell, CheckCircle2, GitBranch } from 'lucide-react';
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
    <header className="h-13 border-b border-white/[0.08] bg-[#08090D]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Workspace Breadcrumb & Active Graph */}
      <div className="flex items-center space-x-2.5 truncate">
        <div className="flex items-center space-x-1.5 text-xs text-[#686E7C]">
          <span className="hidden sm:inline">FlowMind</span>
          <span className="hidden sm:inline text-[#686E7C]/60">/</span>
        </div>
        <div className="flex items-center space-x-2 truncate">
          <div className="w-2 h-2 rounded-full bg-[#5EE7FF] shadow-[0_0_8px_rgba(94,231,255,0.6)] shrink-0" />
          <span className="text-xs font-medium text-white truncate max-w-[200px] sm:max-w-xs">
            {activeFlow?.title || 'Main Workspace'}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger (Linear / Raycast style) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => {
            soundService.playClick();
            onOpenCommand();
          }}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#0F1118] border border-white/[0.08] hover:border-white/[0.16] text-[#A7ACB8] text-xs transition-all shadow-inner group"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search size={14} className="text-[#686E7C] group-hover:text-[#A7ACB8] transition-colors" />
            <span className="truncate font-sans text-[13px]">
              Search thoughts, flows, or ask Copilot...
            </span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono text-[#A7ACB8]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Copilot State, Notifications */}
      <div className="flex items-center space-x-2.5">
        {/* Thought Quick Add Button */}
        <button
          onClick={() => {
            soundService.playChime();
            onNewFlow();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white text-xs font-medium hover:opacity-95 transition-opacity shadow-[0_0_16px_rgba(124,92,255,0.3)]"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Thought</span>
        </button>

        {/* AI Copilot Observer Pill */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenAIThink();
          }}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#151823] border border-[#7C5CFF]/30 text-[#9B84FF] hover:bg-[#7C5CFF]/15 text-xs font-medium transition-colors"
          title="Flow Copilot Intelligence"
        >
          <Sparkles size={13} className="text-[#5EE7FF]" />
          <span>Copilot</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenNotifications();
          }}
          className="p-2 rounded-lg text-[#686E7C] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Activity & Insights"
        >
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Sparkles,
  CheckSquare,
  Home,
  Compass,
  BarChart3,
  BookOpen,
  Layers,
  Settings,
  User,
  Volume2,
  VolumeX,
  Globe,
} from 'lucide-react';
import { FlowMindLogo } from './FlowMindLogo';
import { soundService } from '../services/sound';

export type AppView =
  | 'landing'
  | 'home'
  | 'flows'
  | 'ai-think'
  | 'canvas'
  | 'tasks'
  | 'focus'
  | 'insights'
  | 'library';

interface AppNavigationRailProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  isPrimary?: boolean;
}

const PRIMARY_MODES: NavItem[] = [
  { id: 'canvas', label: 'FLOW', icon: Network, shortcut: '1', isPrimary: true },
  { id: 'ai-think', label: 'THINK', icon: Sparkles, shortcut: '2', isPrimary: true },
  { id: 'tasks', label: 'ACT', icon: CheckSquare, shortcut: '3', isPrimary: true },
];

const SECONDARY_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, shortcut: 'H' },
  { id: 'landing', label: 'Website', icon: Globe, shortcut: '0' },
  { id: 'insights', label: 'Insights', icon: BarChart3, shortcut: 'I' },
  { id: 'library', label: 'Library', icon: BookOpen, shortcut: 'L' },
  { id: 'flows', label: 'History', icon: Layers, shortcut: 'G' },
];

export const AppNavigationRail: React.FC<AppNavigationRailProps> = ({
  activeView,
  onNavigate,
  onOpenSettings,
  onOpenProfile,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  return (
    <aside className="w-16 md:w-20 h-screen shrink-0 bg-[#08090D] border-r border-white/[0.08] flex flex-col items-center justify-between py-4 z-40 select-none">
      {/* Top: Logo & Primary Workspace Modes */}
      <div className="flex flex-col items-center space-y-5 w-full px-2">
        <FlowMindLogo
          size="sm"
          showWordmark={false}
          onClick={() => {
            soundService.playChime();
            onNavigate('home');
          }}
        />

        {/* PRIMARY WORKSPACE MODES (FLOW • THINK • ACT) */}
        <div className="flex flex-col items-center space-y-1.5 w-full">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#686E7C] mb-1">
            Modes
          </span>

          {PRIMARY_MODES.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundService.playClick();
                  onNavigate(item.id);
                }}
                className={`relative w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all group ${
                  isActive
                    ? 'text-white'
                    : 'text-[#686E7C] hover:text-[#A7ACB8] hover:bg-white/[0.04]'
                }`}
                title={`${item.label} Mode [${item.shortcut}]`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeModePill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 shadow-[0_0_12px_rgba(124,92,255,0.25)]"
                  />
                )}
                <Icon
                  size={19}
                  className={`relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[#5EE7FF]' : ''
                  }`}
                />
                <span className="relative z-10 text-[9px] font-semibold tracking-wider mt-1 font-sans">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* DIVIDER */}
        <div className="w-8 h-[1px] bg-white/[0.08]" />

        {/* SECONDARY NAVIGATION (Home, Insights, Library, History) */}
        <div className="flex flex-col items-center space-y-1 w-full">
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundService.playClick();
                  onNavigate(item.id);
                }}
                className={`relative w-full py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all group ${
                  isActive
                    ? 'text-white'
                    : 'text-[#686E7C] hover:text-[#A7ACB8] hover:bg-white/[0.03]'
                }`}
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSecondaryPill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.12]"
                  />
                )}
                <Icon
                  size={16}
                  className={`relative z-10 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-white' : ''
                  }`}
                />
                <span className="relative z-10 text-[9px] font-normal mt-0.5 font-sans">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Settings, Profile & Audio toggle */}
      <div className="flex flex-col items-center space-y-2 w-full px-2 pt-3 border-t border-white/[0.08]">
        <button
          onClick={() => {
            const next = soundService.toggleMute();
            setIsMuted(next);
          }}
          className="p-2 rounded-lg text-[#686E7C] hover:text-white hover:bg-white/[0.04] transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        <button
          onClick={() => {
            soundService.playClick();
            onOpenSettings();
          }}
          className="p-2 rounded-lg text-[#686E7C] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Settings"
        >
          <Settings size={15} />
        </button>

        <button
          onClick={() => {
            soundService.playClick();
            onOpenProfile();
          }}
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#5EE7FF] p-[1px] cursor-pointer hover:opacity-90 transition-opacity"
          title="Account Profile"
        >
          <div className="w-full h-full rounded-full bg-[#0F1118] flex items-center justify-center text-[10px] font-semibold text-white">
            M
          </div>
        </button>
      </div>
    </aside>
  );
};

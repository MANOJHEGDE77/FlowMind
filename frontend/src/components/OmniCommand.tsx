import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Swords, SlidersHorizontal, UploadCloud,
  History, Compass, X, Sparkles, Scale, BookOpen, Sun, Moon,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { DecisionListItem } from '../types';

interface OmniCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onNewDecision: () => void;
  onChallenge: () => void;
  onSimulate: () => void;
  onUploadDoc: () => void;
  onNavigate: (view: 'home' | 'workspace' | 'archive' | 'explore') => void;
  onSelectDecision: (id: number) => void;
  recentDecisions: DecisionListItem[];
  hasActiveDecision: boolean;
}

export const OmniCommand: React.FC<OmniCommandProps> = ({
  isOpen,
  onClose,
  onNewDecision,
  onChallenge,
  onSimulate,
  onUploadDoc,
  onNavigate,
  onSelectDecision,
  recentDecisions,
  hasActiveDecision,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Actions
  const baseActions = [
    {
      id: 'new',
      title: 'Create New Decision',
      subtitle: 'Start structured thinking from free-form thought',
      icon: Plus,
      color: 'text-cyan-400',
      action: () => { onNewDecision(); onClose(); },
    },
    ...(recentDecisions.length > 0
      ? [{
          id: 'resume',
          title: `Resume Thinking: ${recentDecisions[0].title}`,
          subtitle: `${recentDecisions[0].confidence_score}% Signal model`,
          icon: History,
          color: 'text-sky-400',
          action: () => { onSelectDecision(recentDecisions[0].id); onClose(); },
        }]
      : []),
    {
      id: 'archive',
      title: 'Search Decision Archive',
      subtitle: 'View historical decisions & calibrate lived outcomes',
      icon: History,
      color: 'text-slate-400',
      action: () => { onNavigate('archive'); onClose(); },
    },
    ...(hasActiveDecision
      ? [
          {
            id: 'challenge',
            title: 'Challenge Decision (Red Team Mode)',
            subtitle: "Devil's Advocate stress-testing & bias interrogation",
            icon: Swords,
            color: 'text-rose-400',
            action: () => { onChallenge(); onClose(); },
          },
          {
            id: 'simulate',
            title: 'Run What-If Scenario Lab',
            subtitle: 'Dynamic parameter levers & sensitivity analysis',
            icon: SlidersHorizontal,
            color: 'text-amber-400',
            action: () => { onSimulate(); onClose(); },
          },
          {
            id: 'upload',
            title: 'Ingest Evidence / Document',
            subtitle: 'Upload PDF/DOCX to extract grounded citations',
            icon: UploadCloud,
            color: 'text-emerald-400',
            action: () => { onUploadDoc(); onClose(); },
          },
        ]
      : []),
    {
      id: 'explore',
      title: 'Explore Curated Dilemmas',
      subtitle: 'Template libraries for career, investment, and tech stack',
      icon: Compass,
      color: 'text-indigo-400',
      action: () => { onNavigate('explore'); onClose(); },
    },
    {
      id: 'theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Light Paper' : 'Dark Void'})`,
      subtitle: 'Switch visual contrast modes',
      icon: theme === 'dark' ? Sun : Moon,
      color: 'text-amber-300',
      action: () => { toggleTheme(); onClose(); },
    },
  ];

  const filteredActions = baseActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDecisions = recentDecisions.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredActions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-xl select-none animate-in fade-in duration-150">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -5 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-2xl rounded-2xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[var(--line-color)] flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search FlowMind or ask anything..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            className="w-full bg-transparent text-base font-sans text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredActions.map((action, idx) => {
            const Icon = action.icon;
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={action.id}
                onClick={action.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border border-cyan-400/40 text-white'
                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-black/40 ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-medium flex items-center space-x-2">
                      <span>{action.title}</span>
                      {isSelected && (
                        <span className="text-[9px] font-mono text-cyan-400">✦ Trigger</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      {action.subtitle}
                    </div>
                  </div>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-transparent'}`} />
              </div>
            );
          })}

          {/* If there are matched past decisions */}
          {filteredDecisions.length > 0 && query.trim().length > 0 && (
            <div className="pt-2 border-t border-[var(--line-color)] mt-2">
              <span className="px-3 text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-1">
                PAST DECISIONS
              </span>
              {filteredDecisions.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onSelectDecision(d.id);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs font-mono text-slate-300"
                >
                  <span className="truncate">{d.title}</span>
                  <span className="text-cyan-400 text-[10px] shrink-0 ml-2">
                    {d.confidence_score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-[var(--line-color)] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <span>[↑↓] Navigate</span>
            <span>[↵] Execute</span>
            <span>[ESC] Close</span>
          </div>
          <span className="text-cyan-400/80">FLOWMIND COGNITIVE OS</span>
        </div>
      </motion.div>
    </div>
  );
};

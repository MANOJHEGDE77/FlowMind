import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Swords, SlidersHorizontal, UploadCloud,
  History, Compass, X, Sparkles, Scale, BookOpen, Sun, Moon,
  ChevronRight, ArrowRight, FileText, CheckCircle2, Lightbulb
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
  onNavigate: (view: 'landing' | 'home' | 'workspace' | 'archive' | 'explore') => void;
  onSelectDecision: (id: number) => void;
  onOpenAskAI?: (question?: string) => void;
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
  onOpenAskAI,
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

  // Dynamic search items across decisions, evidence topics, and actions
  const q = query.trim().toLowerCase();

  // 1. Quick Actions
  const baseActions = [
    {
      id: 'new',
      type: 'action',
      title: 'Create New Decision',
      subtitle: 'Start structured thinking from a free-form thought',
      icon: Plus,
      color: 'text-cyan-400',
      keywords: 'create new start decision dilemma prompt question',
      action: () => { onNewDecision(); onClose(); },
    },
    ...(recentDecisions.length > 0
      ? [{
          id: 'resume',
          type: 'action',
          title: `Continue Active Dilemma: ${recentDecisions[0].title}`,
          subtitle: `${recentDecisions[0].confidence_score}% Signal model • Continue unfinished analysis`,
          icon: History,
          color: 'text-sky-400',
          keywords: 'resume latest recent unfinished thinking ' + recentDecisions[0].title.toLowerCase(),
          action: () => { onSelectDecision(recentDecisions[0].id); onClose(); },
        }]
      : []),
    {
      id: 'landing',
      type: 'action',
      title: 'Platform Overview & Architecture Showcase',
      subtitle: 'Explore 7-agent council, 1,000-run Monte Carlo & live sandbox',
      icon: Sparkles,
      color: 'text-cyan-400',
      keywords: 'overview landing showcase home intro features architecture council monte carlo sandbox',
      action: () => { onNavigate('landing'); onClose(); },
    },
    {
      id: 'archive',
      type: 'action',
      title: 'Open Decision Memory',
      subtitle: 'Review past decisions, actual outcomes & calibrated accuracy',
      icon: History,
      color: 'text-indigo-400',
      keywords: 'archive memory history past previous decisions log outcomes calibrate',
      action: () => { onNavigate('archive'); onClose(); },
    },
    ...(hasActiveDecision
      ? [
          {
            id: 'challenge',
            type: 'action',
            title: 'Challenge Decision (Red Team Mode)',
            subtitle: "Devil's Advocate bias interrogation & stress-testing",
            icon: Swords,
            color: 'text-rose-400',
            keywords: 'challenge red team devil advocate bias attack stress test',
            action: () => { onChallenge(); onClose(); },
          },
          {
            id: 'simulate',
            type: 'action',
            title: 'Run What-If Scenario Lab',
            subtitle: 'Adjust compensation, remote flexibility & tenure levers',
            icon: SlidersHorizontal,
            color: 'text-amber-400',
            keywords: 'what-if what if simulation levers scenario salary remote tenure parameter',
            action: () => { onSimulate(); onClose(); },
          },
          {
            id: 'upload',
            type: 'action',
            title: 'Ingest Evidence / Document',
            subtitle: 'Upload PDF/DOCX offer letters, contracts & notes for RAG grounding',
            icon: UploadCloud,
            color: 'text-emerald-400',
            keywords: 'evidence document upload pdf docx contract notes rag citations',
            action: () => { onUploadDoc(); onClose(); },
          },
        ]
      : []),
    {
      id: 'explore',
      type: 'action',
      title: 'Explore Patterns & Starter Templates',
      subtitle: 'Personal priority analytics and curated decision starters',
      icon: Compass,
      color: 'text-teal-400',
      keywords: 'explore patterns templates starters career relocation startup fellowship',
      action: () => { onNavigate('explore'); onClose(); },
    },
    {
      id: 'theme',
      type: 'action',
      title: `Toggle Theme (${theme === 'dark' ? 'Light Paper Mode' : 'Dark Void Mode'})`,
      subtitle: 'Switch application color contrast',
      icon: theme === 'dark' ? Sun : Moon,
      color: 'text-amber-300',
      keywords: 'theme dark light mode appearance contrast',
      action: () => { toggleTheme(); onClose(); },
    },
  ];

  // 2. Decision Items
  const decisionItems = recentDecisions.map((d) => ({
    id: `dec-${d.id}`,
    type: 'decision',
    title: d.title,
    subtitle: `${d.confidence_score}% Signal • Recommendation: ${d.recommendation || 'Evaluated'}`,
    icon: Lightbulb,
    color: 'text-cyan-400',
    keywords: `${d.title} ${d.recommendation || ''} decision past`,
    action: () => { onSelectDecision(d.id); onClose(); },
  }));

  // Filter actions & decisions based on query
  const filteredActions = baseActions.filter((a) =>
    q === '' ? true : a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q) || a.keywords.includes(q)
  );

  const filteredDecisions = decisionItems.filter((d) =>
    q === '' ? false : d.title.toLowerCase().includes(q) || d.keywords.toLowerCase().includes(q)
  );

  // AI Question Instant Action (if query is typed)
  const aiActionItem = (query.trim().length > 0 && onOpenAskAI)
    ? [{
        id: 'ai-ask-query',
        type: 'ai',
        title: `✦ Ask AI Model: "${query.trim()}"`,
        subtitle: 'Query Gemini 1.5 Flash or Cognitive Core for instant calibrated strategic answer',
        icon: Sparkles,
        color: 'text-cyan-300',
        keywords: query.toLowerCase(),
        action: () => {
          onOpenAskAI(query.trim());
          onClose();
        },
      }]
    : [];

  // Combined flat list for keyboard arrow navigation
  const allResults = [...aiActionItem, ...filteredDecisions, ...filteredActions];

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-xl select-none animate-in fade-in duration-150">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -5 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-2xl rounded-3xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[var(--line-color)] flex items-center space-x-3 bg-[var(--canvas-subtle)]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search FlowMind or ask anything... (e.g. 'career decisions', 'challenge', 'remote work')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            className="w-full bg-transparent text-sm sm:text-base font-sans text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-faint)] hover:text-[var(--text-vivid)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4 font-mono text-xs">
          {/* AI Strategic Question Action */}
          {aiActionItem.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                ✦ ASK AI MODEL (GEMINI FLASH)
              </span>
              {aiActionItem.map((item) => {
                const isSelected = selectedIndex === 0;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(0)}
                    className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-500/25 border border-cyan-400/60 text-[var(--text-vivid)] shadow-lg'
                        : 'bg-cyan-500/10 text-[var(--text-body)] border border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-vivid)] text-xs">{item.title}</div>
                        <div className="text-[11px] text-[var(--text-body)] font-sans">{item.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-[var(--canvas-subtle)] px-2 py-0.5 rounded border border-cyan-500/30">
                      ↵ Press Enter
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Matched Decisions if searching */}
          {filteredDecisions.length > 0 && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                ✦ MATCHED DECISIONS
              </span>
              {filteredDecisions.map((item, idx) => {
                const itemIdx = aiActionItem.length + idx;
                const isSelected = itemIdx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(itemIdx)}
                    className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-400/50 text-[var(--text-vivid)] shadow-md'
                        : 'text-[var(--text-body)] hover:bg-[var(--canvas-subtle)] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-vivid)] text-xs">{item.title}</div>
                        <div className="text-[11px] text-[var(--text-faint)] font-sans">{item.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-transparent'}`} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions & System Commands */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase tracking-widest text-[var(--text-faint)] font-bold block mb-1">
              {q ? 'ACTIONS & COMMANDS' : 'QUICK ACTIONS'}
            </span>
            {filteredActions.map((action, idx) => {
              const actualIdx = aiActionItem.length + filteredDecisions.length + idx;
              const isSelected = actualIdx === selectedIndex;
              const Icon = action.icon;

              return (
                <div
                  key={action.id}
                  onClick={action.action}
                  onMouseEnter={() => setSelectedIndex(actualIdx)}
                  className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-400/40 text-[var(--text-vivid)] shadow-md'
                      : 'text-[var(--text-body)] hover:bg-[var(--canvas-subtle)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] ${action.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-medium flex items-center space-x-2 text-[var(--text-vivid)]">
                        <span>{action.title}</span>
                        {isSelected && (
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/15 px-1.5 py-0.2 rounded border border-cyan-500/30">
                            ↵ Enter
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-faint)] font-sans">
                        {action.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-transparent'}`} />
                </div>
              );
            })}
          </div>

          {/* If query has no matches */}
          {allResults.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <span className="text-xs font-mono text-[var(--text-faint)] block">
                No matching decisions or commands for "{query}"
              </span>
              <button
                onClick={() => {
                  onNewDecision();
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs font-mono"
              >
                Create a decision about "{query}" →
              </button>
            </div>
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2.5 bg-[var(--canvas-subtle)] border-t border-[var(--line-color)] flex items-center justify-between text-[10px] font-mono text-[var(--text-faint)]">
          <div className="flex items-center space-x-4">
            <span>[↑↓] Navigate</span>
            <span>[↵] Execute</span>
            <span>[ESC] Close</span>
          </div>
          <span className="text-cyan-400/90 font-bold">FLOWMIND COMMAND LAYER</span>
        </div>
      </motion.div>
    </div>
  );
};

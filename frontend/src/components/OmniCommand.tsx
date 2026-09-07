import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Swords, SlidersHorizontal, UploadCloud,
  History, Compass, X, Sparkles, Scale, BookOpen, Sun, Moon
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
  const { theme, toggleTheme } = useTheme();

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

  if (!isOpen) return null;

  const filteredDecisions = recentDecisions.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-space-950/85 backdrop-blur-2xl select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold block">
            ✦ FLOWMIND COMMAND LAYER
          </span>
          <p className="text-xs text-[var(--text-faint)] font-mono">
            Type to trigger actions or explore past thinking
          </p>
        </div>

        {/* Input */}
        <div className="relative border-b border-[var(--line-active)] pb-2 flex items-center">
          <Search className="w-5 h-5 text-[var(--text-faint)] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search, ask, or trigger... (e.g. 'Challenge', 'What-if', 'New')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-xl font-serif text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none"
          />
          <button onClick={onClose} className="text-[var(--text-faint)] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto space-y-1 font-mono text-xs">
          <button
            onClick={() => { onNewDecision(); onClose(); }}
            className="w-full p-3 rounded-2xl hover:bg-[var(--canvas-subtle)] text-left flex items-center justify-between text-[var(--text-body)] hover:text-[var(--text-vivid)] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Create New Dilemma</span>
            </div>
            <kbd className="text-[10px] text-[var(--text-faint)]">[N]</kbd>
          </button>

          {hasActiveDecision && (
            <>
              <button
                onClick={() => { onChallenge(); onClose(); }}
                className="w-full p-3 rounded-2xl hover:bg-[var(--canvas-subtle)] text-left flex items-center justify-between text-[var(--text-body)] hover:text-[var(--text-vivid)] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Swords className="w-4 h-4 text-rose-400" />
                  <span>⚔️ Execute Red Team Challenge Mode</span>
                </div>
                <span className="text-[10px] text-rose-400">Adversary</span>
              </button>

              <button
                onClick={() => { onSimulate(); onClose(); }}
                className="w-full p-3 rounded-2xl hover:bg-[var(--canvas-subtle)] text-left flex items-center justify-between text-[var(--text-body)] hover:text-[var(--text-vivid)] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>Run What-If Assumption Lab</span>
                </div>
                <span className="text-[10px] text-amber-400">Simulation</span>
              </button>

              <button
                onClick={() => { onUploadDoc(); onClose(); }}
                className="w-full p-3 rounded-2xl hover:bg-[var(--canvas-subtle)] text-left flex items-center justify-between text-[var(--text-body)] hover:text-[var(--text-vivid)] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>Ingest Grounded Document (PDF/DOCX)</span>
                </div>
                <span className="text-[10px] text-emerald-400">RAG</span>
              </button>
            </>
          )}

          <button
            onClick={() => { toggleTheme(); onClose(); }}
            className="w-full p-3 rounded-2xl hover:bg-[var(--canvas-subtle)] text-left flex items-center justify-between text-[var(--text-body)] hover:text-[var(--text-vivid)] transition-colors"
          >
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-500" />}
              <span>Toggle Theme ({theme === 'dark' ? 'Light Paper' : 'Dark Void'})</span>
            </div>
            <kbd className="text-[10px] text-[var(--text-faint)]">[T]</kbd>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[var(--line-color)] flex items-center justify-between text-[10px] font-mono text-[var(--text-faint)]">
          <span>Operating System Command Layer</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Swords, SlidersHorizontal, UploadCloud,
  History, Layout, X, Sparkles, Scale, BookOpen, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { DecisionListItem } from '../types';

interface RaycastCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewDecision: () => void;
  onChallenge: () => void;
  onSimulate: () => void;
  onUploadDoc: () => void;
  onCompare: () => void;
  onNavigate: (view: 'home' | 'workspace' | 'library' | 'explore') => void;
  onSelectDecision: (id: number) => void;
  recentDecisions: DecisionListItem[];
  hasActiveDecision: boolean;
}

export const RaycastCommandPalette: React.FC<RaycastCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewDecision,
  onChallenge,
  onSimulate,
  onUploadDoc,
  onCompare,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-space-950/75 backdrop-blur-md px-4 select-none">
      <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)]">
          <Search className="w-4 h-4 text-[var(--text-muted)] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search or ask FlowMind... (e.g. 'Challenge', 'Scenario', 'New')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Groups */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Actions */}
          <div>
            <div className="text-[10px] font-mono text-[var(--text-muted)] px-3 py-1 uppercase tracking-wider">
              Actions
            </div>

            <div className="space-y-0.5">
              <button
                onClick={() => { onNewDecision(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Compose New Dilemma</span>
                </div>
                <kbd className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                  N
                </kbd>
              </button>

              {hasActiveDecision && (
                <>
                  <button
                    onClick={() => { onChallenge(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                        <Swords className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">⚔️ Challenge Recommendation (Devil's Advocate)</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400/90">Stress Test</span>
                  </button>

                  <button
                    onClick={() => { onSimulate(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">Run What-If Scenario Lab</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400/90">Simulation</span>
                  </button>

                  <button
                    onClick={() => { onCompare(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">Open Benchmark Matrix</span>
                    </div>
                  </button>

                  <button
                    onClick={() => { onUploadDoc(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <UploadCloud className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">Ground Evidence Document (PDF/DOCX)</span>
                    </div>
                  </button>
                </>
              )}

              {/* Theme toggle command */}
              <button
                onClick={() => { toggleTheme(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <span className="font-medium">Toggle Theme: Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </div>
                <kbd className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                  T
                </kbd>
              </button>
            </div>
          </div>

          {/* Recent Decisions */}
          {filteredDecisions.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-[var(--text-muted)] px-3 py-1 uppercase tracking-wider">
                Saved Decision Spaces
              </div>
              <div className="space-y-0.5">
                {filteredDecisions.slice(0, 4).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { onSelectDecision(d.id); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="truncate">{d.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                      {d.confidence_score}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
          <span>Navigate with arrows, select with Enter</span>
          <span>ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};

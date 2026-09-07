import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Swords, SlidersHorizontal, UploadCloud,
  History, Layout, X, ShieldAlert, Sparkles, ArrowRight
} from 'lucide-react';
import { DecisionListItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewDecision: () => void;
  onChallenge: () => void;
  onSimulate: () => void;
  onUploadDoc: () => void;
  onNavigateHistory: () => void;
  onSelectDecision: (id: number) => void;
  recentDecisions: DecisionListItem[];
  hasActiveDecision: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewDecision,
  onChallenge,
  onSimulate,
  onUploadDoc,
  onNavigateHistory,
  onSelectDecision,
  recentDecisions,
  hasActiveDecision,
}) => {
  const [query, setQuery] = useState('');

  // Handle ESC and shortcuts
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-space-950/70 backdrop-blur-md px-4">
      <div className="w-full max-w-xl bg-space-900 border border-space-750 rounded-xl shadow-modal-depth overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-space-800">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search decisions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Groups */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div>
            <div className="text-[11px] font-mono text-slate-500 px-3 py-1 uppercase tracking-wider">
              Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => { onNewDecision(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-space-800 hover:text-white transition-colors text-left group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Create New Decision</span>
                </div>
                <kbd className="text-[10px] text-slate-500 font-mono">N</kbd>
              </button>

              {hasActiveDecision && (
                <>
                  <button
                    onClick={() => { onChallenge(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-space-800 hover:text-white transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                        <Swords className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">⚔️ Challenge Current Decision</span>
                    </div>
                    <span className="text-[10px] text-rose-400/80 font-mono">Devil's Advocate</span>
                  </button>

                  <button
                    onClick={() => { onSimulate(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-space-800 hover:text-white transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">Run What-If Scenario Simulator</span>
                    </div>
                    <span className="text-[10px] text-amber-400/80 font-mono">Simulation</span>
                  </button>

                  <button
                    onClick={() => { onUploadDoc(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-space-800 hover:text-white transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                        <UploadCloud className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">Upload Evidence Document (PDF/DOCX)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 font-mono">RAG Ingestion</span>
                  </button>
                </>
              )}

              <button
                onClick={() => { onNavigateHistory(); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-space-800 hover:text-white transition-colors text-left group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Open Decision History & Outcomes</span>
                </div>
                <kbd className="text-[10px] text-slate-500 font-mono">H</kbd>
              </button>
            </div>
          </div>

          {/* Decisions */}
          {filteredDecisions.length > 0 && (
            <div>
              <div className="text-[11px] font-mono text-slate-500 px-3 py-1 uppercase tracking-wider">
                Recent Decisions
              </div>
              <div className="space-y-0.5">
                {filteredDecisions.slice(0, 5).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { onSelectDecision(d.id); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-space-800 hover:text-white transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      <span className="truncate">{d.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {d.recommendation && (
                        <span className="text-[10px] text-slate-400 bg-space-850 px-1.5 py-0.5 rounded border border-space-700">
                          {d.recommendation}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-brand-primary">
                        {d.confidence_score}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-space-800 bg-space-950/50 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with arrows, select with Enter</span>
          <span className="font-mono text-[10px]">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};

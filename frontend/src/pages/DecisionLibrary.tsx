import React, { useState } from 'react';
import {
  Calendar, Star, ChevronRight, Sparkles, Trash2,
  Crown, ArrowRight, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { DecisionListItem } from '../types';
import { api } from '../services/api';

interface DecisionLibraryProps {
  decisions: DecisionListItem[];
  onSelectDecision: (id: number) => void;
  onRefresh: () => void;
}

export const DecisionLibrary: React.FC<DecisionLibraryProps> = ({
  decisions,
  onSelectDecision,
  onRefresh,
}) => {
  const [selectedForOutcome, setSelectedForOutcome] = useState<DecisionListItem | null>(null);
  const [chosenOption, setChosenOption] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [satisfaction, setSatisfaction] = useState(8);
  const [accuracy, setAccuracy] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForOutcome) return;

    try {
      setIsSubmitting(true);
      await api.recordOutcome(selectedForOutcome.id, {
        chosen_option_title: chosenOption || selectedForOutcome.recommendation || 'Selected Path',
        actual_outcome_notes: outcomeNotes,
        satisfaction_score: satisfaction,
        ai_accuracy_rating: accuracy,
      });
      setSuccess(true);
      setTimeout(() => {
        setSelectedForOutcome(null);
        setSuccess(false);
        onRefresh();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to record outcome');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Permanently remove this decision model?')) {
      await api.deleteDecision(id);
      onRefresh();
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 font-semibold tracking-wider mb-1">
            DECISION JOURNAL & OUTCOME REGISTRY
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Strategic Decisions Archive
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Track past dilemmas, review calibrated AI predictions, and log retrospective lived outcomes.
          </p>
        </div>

        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
          {decisions.length} Models Logged
        </span>
      </div>

      {/* Decision Cards Timeline */}
      <div className="space-y-3">
        {decisions.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-8">
            <Sparkles className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Your next decision starts here.
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
              Start by typing your dilemma in the overview composer.
            </p>
          </div>
        ) : (
          decisions.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDecision(d.id)}
              className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-sky-400/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="space-y-1 truncate flex-1">
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-sky-400 transition-colors truncate">
                    {d.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] uppercase">
                    {d.status}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-[var(--text-muted)] font-mono">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </span>
                  <span>•</span>
                  <span>{d.options_count} Options Evaluated</span>
                </div>
              </div>

              {/* Recommendation & Confidence Badge */}
              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <span className="text-[9px] font-mono text-[var(--text-muted)] block uppercase">
                    THE SIGNAL
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 truncate max-w-xs block">
                    {d.recommendation || 'In Progress'}
                  </span>
                </div>

                <div className="text-right pl-3 border-l border-[var(--border-subtle)]">
                  <span className="text-[9px] font-mono text-[var(--text-muted)] block uppercase">
                    CONFIDENCE
                  </span>
                  <span className="text-sm font-mono font-bold text-sky-400">
                    {d.confidence_score}%
                  </span>
                </div>

                <div className="flex items-center space-x-1 pl-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedForOutcome(d);
                      setChosenOption(d.recommendation || '');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs border border-[var(--border-subtle)] transition-colors flex items-center space-x-1"
                    title="Log Real Outcome"
                  >
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="hidden sm:inline text-[11px]">Outcome</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(d.id, e)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                    title="Delete Decision"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Retrospective Outcome Modal */}
      {selectedForOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase">
                  Log Real Outcome Feedback Loop
                </h3>
              </div>
              <button
                onClick={() => setSelectedForOutcome(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Which path did you ultimately choose?
                </label>
                <input
                  type="text"
                  value={chosenOption}
                  onChange={(e) => setChosenOption(e.target.value)}
                  className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">
                  Actual Outcome Notes & Lived Experience
                </label>
                <textarea
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="How did this decision turn out 6-12 months later? Did the risks pointed out by the Skeptic agent materialize?"
                  className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Personal Satisfaction</span>
                    <span className="font-mono text-amber-400">{satisfaction} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={satisfaction}
                    onChange={(e) => setSatisfaction(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">AI Accuracy Rating</span>
                    <span className="font-mono text-sky-400">{accuracy} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={accuracy}
                    onChange={(e) => setAccuracy(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </div>
              </div>

              {success && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Outcome logged into FlowMind's long-term calibration loop!</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-space-950 font-semibold text-xs transition-all disabled:opacity-50 font-mono"
                >
                  {isSubmitting ? 'Recording Outcome...' : 'Save Decision Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

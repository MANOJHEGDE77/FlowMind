import React, { useState } from 'react';
import {
  Calendar, Star, ChevronRight, Sparkles, Trash2,
  Crown, ArrowRight, CheckCircle2
} from 'lucide-react';
import { DecisionListItem } from '../types';
import { api } from '../services/api';

interface DecisionArchiveProps {
  decisions: DecisionListItem[];
  onSelectDecision: (id: number) => void;
  onRefresh: () => void;
}

export const DecisionArchive: React.FC<DecisionArchiveProps> = ({
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
      alert(err.message || 'Outcome logging failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this decision model from archive?')) {
      await api.deleteDecision(id);
      onRefresh();
    }
  };

  return (
    <div className="min-h-screen px-6 py-24 max-w-3xl mx-auto space-y-10 select-none z-10 relative">
      {/* Header */}
      <div className="space-y-1 text-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold block">
          ARCHIVE OF YOUR THINKING
        </span>
        <h1 className="text-3xl font-editorial text-[var(--text-vivid)]">
          Decisions & Retrospective Outcomes
        </h1>
        <p className="text-xs text-[var(--text-faint)] font-mono">
          Compare calibrated AI predictions with actual lived outcomes.
        </p>
      </div>

      {/* Tree Timeline */}
      <div className="relative border-l border-[var(--line-color)] ml-6 pl-8 space-y-8">
        <div className="text-xs font-mono text-[var(--text-faint)] -ml-12 font-bold tracking-widest">
          2026
        </div>

        {decisions.length === 0 ? (
          <div className="text-xs font-mono text-[var(--text-faint)] py-12">
            No decisions logged yet. Start a dilemma from the Thinking tab.
          </div>
        ) : (
          decisions.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDecision(d.id)}
              className="relative group cursor-pointer space-y-1 transition-all"
            >
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[37px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--line-color)] group-hover:bg-sky-400 transition-colors ring-4 ring-[var(--canvas-bg)]" />

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-vivid)] group-hover:text-sky-400 transition-colors">
                  {d.title}
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">
                  {d.confidence_score}% Signal
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono text-[var(--text-faint)]">
                <span>Signal: {d.recommendation || 'In Progress'}</span>
                <span>•</span>
                <span>{new Date(d.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedForOutcome(d);
                    setChosenOption(d.recommendation || '');
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Log Lived Outcome
                </button>
                <span>•</span>
                <button
                  onClick={(e) => handleDelete(d.id, e)}
                  className="text-rose-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Retrospective Outcome Modal */}
      {selectedForOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-space-950/85 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[var(--surface-blur)] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line-color)]">
              <span className="text-amber-400 font-bold uppercase">
                LOG LIVED OUTCOME
              </span>
              <button onClick={() => setSelectedForOutcome(null)} className="text-[var(--text-faint)]">✕</button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="space-y-4">
              <div>
                <label className="text-[10px] text-[var(--text-faint)] block mb-1">
                  WHICH OPTION DID YOU ULTIMATELY CHOOSE?
                </label>
                <input
                  type="text"
                  value={chosenOption}
                  onChange={(e) => setChosenOption(e.target.value)}
                  className="w-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl p-2 text-xs text-[var(--text-vivid)] focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-faint)] block mb-1">
                  RETROSPECTIVE NOTES & SATISFACTION
                </label>
                <textarea
                  rows={2}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="How did this decision turn out? Did Skeptic's risks appear?"
                  className="w-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl p-2 text-xs text-[var(--text-vivid)] focus:outline-none focus:border-amber-400 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-[var(--text-faint)] block">Satisfaction ({satisfaction}/10)</span>
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
                  <span className="text-[10px] text-[var(--text-faint)] block">AI Accuracy ({accuracy}/10)</span>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-space-950 font-bold text-xs"
              >
                {isSubmitting ? 'Recording...' : 'Save Retrospective Outcome'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  History, ArrowRight, CheckCircle2, Star, Plus,
  ChevronRight, Calendar, Sparkles, MessageSquare, Trash2
} from 'lucide-react';
import { DecisionListItem } from '../types';
import { api } from '../services/api';

interface HistoryPageProps {
  decisions: DecisionListItem[];
  onSelectDecision: (id: number) => void;
  onRefresh: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
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
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForOutcome) return;

    try {
      setIsSubmitting(true);
      await api.recordOutcome(selectedForOutcome.id, {
        chosen_option_title: chosenOption || selectedForOutcome.recommendation || 'Accepted Path',
        actual_outcome_notes: outcomeNotes,
        satisfaction_score: satisfaction,
        ai_accuracy_rating: accuracy,
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setSelectedForOutcome(null);
        setFeedbackSuccess(false);
        onRefresh();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to record outcome');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this decision model?')) {
      await api.deleteDecision(id);
      onRefresh();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-space-800">
        <div>
          <div className="flex items-center space-x-2 text-brand-primary font-mono text-xs uppercase mb-1">
            <History className="w-4 h-4" />
            <span>Decision Timeline & Feedback Loop</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Historical Decision Registry
          </h1>
          <p className="text-xs text-slate-400">
            Revisit past decisions and compare AI recommendations with actual lived outcomes.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-space-900 px-3 py-1.5 rounded-lg border border-space-800">
          {decisions.length} Decisions Logged
        </span>
      </div>

      {/* Decisions List */}
      <div className="space-y-3">
        {decisions.length === 0 ? (
          <div className="text-center py-20 bg-space-900/40 border border-space-800 rounded-2xl p-8">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No decisions created yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Start by typing your first dilemma in the workspace.
            </p>
          </div>
        ) : (
          decisions.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDecision(d.id)}
              className="bg-space-900/80 hover:bg-space-850 border border-space-800 hover:border-space-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all group"
            >
              <div className="space-y-1 truncate flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white group-hover:text-brand-primary transition-colors truncate">
                    {d.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-800 text-slate-400 border border-space-700 uppercase">
                    {d.status}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </span>
                  <span>•</span>
                  <span>{d.options_count} Options Evaluated</span>
                </div>
              </div>

              {/* Recommendation & Confidence Badge */}
              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block">AI RECOMMENDATION</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {d.recommendation || 'In Progress'}
                  </span>
                </div>

                <div className="text-right pl-3 border-l border-space-800">
                  <span className="text-[10px] font-mono text-slate-500 block">CONFIDENCE</span>
                  <span className="text-sm font-mono font-bold text-brand-primary">
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
                    className="px-2.5 py-1.5 rounded-lg bg-space-800 hover:bg-space-750 text-slate-300 hover:text-white text-xs border border-space-700 transition-colors flex items-center space-x-1"
                    title="Log Real-World Outcome"
                  >
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="hidden sm:inline">Log Outcome</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(d.id, e)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Decision"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Outcome Recording Modal */}
      {selectedForOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-space-900 border border-amber-500/30 rounded-2xl shadow-modal-depth overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-amber-500/5">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">
                  Log Real-World Decision Outcome
                </h3>
              </div>
              <button
                onClick={() => setSelectedForOutcome(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Which path did you ultimately choose?
                </label>
                <input
                  type="text"
                  value={chosenOption}
                  onChange={(e) => setChosenOption(e.target.value)}
                  className="w-full bg-space-950 border border-space-750 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Actual Outcome Notes & Retrospective
                </label>
                <textarea
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="How did it turn out? Did the risks pointed out by the Skeptic agent materialize?"
                  className="w-full bg-space-950 border border-space-750 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Personal Satisfaction</span>
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
                    <span className="text-slate-400">AI Accuracy Rating</span>
                    <span className="font-mono text-brand-primary">{accuracy} / 10</span>
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

              {feedbackSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Outcome logged into FlowMind's long-term calibration loop!</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-space-950 font-semibold text-xs transition-all disabled:opacity-50"
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

import React, { useState, useMemo } from 'react';
import {
  Calendar, Star, ChevronRight, Sparkles, Trash2,
  Crown, ArrowRight, CheckCircle2, Search, Filter,
  Check, History, ArrowUpRight, TrendingUp, AlertTriangle, X
} from 'lucide-react';
import { DecisionListItem } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'career' | 'finance' | 'resolved' | 'active'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'confidence' | 'title'>('recent');

  const [selectedForOutcome, setSelectedForOutcome] = useState<DecisionListItem | null>(null);
  const [decisionToDelete, setDecisionToDelete] = useState<DecisionListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chosenOption, setChosenOption] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [whatWentRight, setWhatWentRight] = useState('');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [incorrectAssumptions, setIncorrectAssumptions] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [satisfaction, setSatisfaction] = useState(8);
  const [accuracy, setAccuracy] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const avgConfidence = useMemo(() => {
    if (decisions.length === 0) return 0;
    const sum = decisions.reduce((acc, d) => acc + (d.confidence_score || 0), 0);
    return Math.round(sum / decisions.length);
  }, [decisions]);

  const resolvedCount = useMemo(() => {
    return decisions.filter((d) => d.status === 'resolved').length;
  }, [decisions]);

  // Filtering and Sorting
  const filteredDecisions = useMemo(() => {
    return decisions
      .filter((d) => {
        const matchesSearch =
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.recommendation && d.recommendation.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'career') return d.title.toLowerCase().includes('job') || d.title.toLowerCase().includes('career') || d.title.toLowerCase().includes('startup') || d.title.toLowerCase().includes('offer');
        if (selectedFilter === 'finance') return d.title.toLowerCase().includes('seed') || d.title.toLowerCase().includes('invest') || d.title.toLowerCase().includes('capital') || d.title.toLowerCase().includes('equity');
        if (selectedFilter === 'resolved') return d.status === 'resolved';
        if (selectedFilter === 'active') return d.status !== 'resolved';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'confidence') return b.confidence_score - a.confidence_score;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [decisions, searchQuery, selectedFilter, sortBy]);

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForOutcome) return;

    try {
      setIsSubmitting(true);
      await api.recordOutcome(selectedForOutcome.id, {
        chosen_option_title: chosenOption || selectedForOutcome.recommendation || 'Selected Path',
        actual_outcome_notes: outcomeNotes,
        expected_outcome: expectedOutcome || undefined,
        what_went_right: whatWentRight ? whatWentRight.split('\n').filter(Boolean) : [],
        what_went_wrong: whatWentWrong ? whatWentWrong.split('\n').filter(Boolean) : [],
        incorrect_assumptions: incorrectAssumptions ? incorrectAssumptions.split('\n').filter(Boolean) : [],
        lessons_learned: lessonsLearned || undefined,
        satisfaction_score: satisfaction,
        ai_accuracy_rating: accuracy,
      });
      setSuccess(true);
      showToast('Outcome recorded! Decision memory calibrated.', 'success');
      setTimeout(() => {
        setSelectedForOutcome(null);
        setSuccess(false);
        setExpectedOutcome('');
        setWhatWentRight('');
        setWhatWentWrong('');
        setIncorrectAssumptions('');
        setLessonsLearned('');
        onRefresh();
      }, 900);
    } catch (err: any) {
      showToast(err.message || 'Outcome logging failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (d: DecisionListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDecisionToDelete(d);
  };

  const handleConfirmDelete = async () => {
    if (!decisionToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteDecision(decisionToDelete.id);
      showToast(`Decision "${decisionToDelete.title}" deleted from memory.`, 'info');
      setDecisionToDelete(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete decision', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen px-6 pt-24 pb-36 max-w-4xl mx-auto space-y-8 select-none z-10 relative">
      {/* Header */}
      <div className="space-y-2 text-center">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold block">
          DECISION MEMORY // PERSONAL INTELLIGENCE TIMELINE
        </span>
        <h1 className="text-3xl sm:text-5xl font-editorial text-[var(--text-vivid)] tracking-tight">
          What Survives Reality
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-lg mx-auto leading-relaxed">
          Compare past dilemmas, expected outcomes, and actual lived results. Calibrate what was correct, what was wrong, and what was learned.
        </p>
      </div>

      {/* Real Intelligence Calibration Insight Banner */}
      {decisions.length > 0 && (
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start space-x-3 text-xs font-sans text-[var(--text-body)]">
          <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase text-cyan-400 block tracking-wider">
              REAL-TIME MEMORY METRICS
            </span>
            <p className="text-xs text-[var(--text-body)] leading-relaxed">
              You have evaluated <strong className="text-[var(--text-vivid)]">{decisions.length} live decision{decisions.length === 1 ? '' : 's'}</strong> with a mean AI model confidence of <strong className="text-cyan-400">{avgConfidence}%</strong> across {resolvedCount} resolved and {decisions.length - resolvedCount} active dilemma workspaces.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[var(--text-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'career', 'finance', 'active', 'resolved'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-full text-[11px] capitalize transition-all ${
                selectedFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 font-semibold shadow-sm'
                  : 'bg-[var(--canvas-subtle)] text-[var(--text-faint)] border border-[var(--line-color)] hover:text-[var(--text-vivid)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-[var(--line-color)] ml-6 pl-8 space-y-6">
        <div className="text-xs font-mono text-cyan-400 -ml-12 font-bold tracking-widest flex items-center space-x-2">
          <span>2026</span>
          <span className="text-[10px] text-[var(--text-faint)] font-normal">({filteredDecisions.length} Decisions)</span>
        </div>

        {filteredDecisions.length === 0 ? (
          <div className="text-xs font-mono text-[var(--text-faint)] py-12">
            No decisions match your filter. Create a decision in the Thinking tab.
          </div>
        ) : (
          filteredDecisions.map((d) => {
            const isResolved = d.status === 'resolved';

            return (
              <div
                key={d.id}
                onClick={() => onSelectDecision(d.id)}
                className="relative group p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 shadow-sm hover:shadow-md"
              >
                {/* Timeline Bullet Node */}
                <div className="absolute -left-[37px] top-5 w-2.5 h-2.5 rounded-full bg-[var(--line-color)] group-hover:bg-cyan-400 transition-colors ring-4 ring-[var(--canvas-bg)]" />

                {/* Top Row: Title, Signal Score & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-mono text-[var(--text-faint)] uppercase tracking-wider">
                        DECISION #{d.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.2 rounded-full border ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {isResolved ? 'Resolved & Calibrated' : 'Active Model'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-vivid)] group-hover:text-cyan-400 transition-colors">
                      {d.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {d.confidence_score}% Signal
                    </span>
                    <button
                      onClick={(e) => handleDeleteClick(d, e)}
                      className="p-1 rounded text-[var(--text-faint)] hover:text-rose-400 transition-colors"
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Recommendation & Option summary */}
                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--text-faint)] pt-1 border-t border-[var(--line-color)]">
                  <div className="flex items-center space-x-2 truncate max-w-md">
                    <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-[var(--text-body)] truncate">
                      AI Signal: {d.recommendation || 'Evaluated pathways'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 pt-1 sm:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedForOutcome(d);
                      }}
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isResolved ? 'Edit Outcome' : 'Log Lived Outcome'}</span>
                    </button>
                    <span className="text-[var(--text-faint)]">•</span>
                    <span className="text-[var(--text-body)] flex items-center space-x-0.5">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Retrospective Outcome Modal */}
      {selectedForOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl select-none animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--surface-blur)] border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line-color)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                  ✦ CALIBRATE OUTCOME
                </span>
                <h3 className="text-base font-bold text-[var(--text-vivid)] mt-0.5">
                  Did FlowMind Get It Right?
                </h3>
              </div>
              <button
                onClick={() => setSelectedForOutcome(null)}
                className="text-[var(--text-faint)] hover:text-[var(--text-vivid)] p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-[var(--text-faint)] block">
                  Decision Under Evaluation
                </label>
                <div className="p-3 rounded-xl bg-[var(--canvas-subtle)] text-[var(--text-body)] text-xs font-sans border border-[var(--line-color)]">
                  "{selectedForOutcome.title}"
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-[var(--text-faint)] block">
                  Your Final Choice / Pathway Taken
                </label>
                <input
                  type="text"
                  placeholder={selectedForOutcome.recommendation || 'e.g. Accepted Startup Lead Offer'}
                  value={chosenOption}
                  onChange={(e) => setChosenOption(e.target.value)}
                  className="w-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl p-2.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Expected Outcome vs Actual Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[var(--text-faint)] block">
                    Expected Outcome At Time of Decision
                  </label>
                  <input
                    type="text"
                    placeholder="What did you anticipate would happen?"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    className="w-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl p-2.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[var(--text-faint)] block">
                    Actual Lived Outcome Notes
                  </label>
                  <input
                    type="text"
                    placeholder="What actually took place?"
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    className="w-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl p-2.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
              </div>

              {/* What Went Right vs What Went Wrong */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-emerald-400 block">
                    ✦ What Went Right (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Learning speed exceeded targets&#10;Equity granted on schedule"
                    value={whatWentRight}
                    onChange={(e) => setWhatWentRight(e.target.value)}
                    className="w-full bg-[var(--canvas-subtle)] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-emerald-400 resize-none font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-rose-400 block">
                    ⚠️ What Went Wrong (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Higher operational friction&#10;Unexpected travel load"
                    value={whatWentWrong}
                    onChange={(e) => setWhatWentWrong(e.target.value)}
                    className="w-full bg-[var(--canvas-subtle)] border border-rose-500/30 rounded-xl p-2.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-rose-400 resize-none font-sans"
                  />
                </div>
              </div>

              {/* Incorrect Assumptions & Lessons Learned */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-amber-400 block">
                    🔍 Assumptions That Were Incorrect
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Which initial beliefs proved false?"
                    value={incorrectAssumptions}
                    onChange={(e) => setIncorrectAssumptions(e.target.value)}
                    className="w-full bg-[var(--canvas-subtle)] border border-amber-500/30 rounded-xl p-2.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-cyan-400 block">
                    💡 Lessons Learned for Next Dilemma
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Core takeaway for future calibration"
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    className="w-full bg-[var(--canvas-subtle)] border border-cyan-500/30 rounded-xl p-2.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-cyan-400 resize-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[var(--text-faint)]">
                    <span>Satisfaction</span>
                    <span className="text-cyan-400 font-bold">{satisfaction} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={satisfaction}
                    onChange={(e) => setSatisfaction(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[var(--text-faint)]">
                    <span>AI Calibration Rating</span>
                    <span className="text-emerald-400 font-bold">{accuracy} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={accuracy}
                    onChange={(e) => setAccuracy(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedForOutcome(null)}
                  className="px-4 py-2 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-[var(--text-faint)] hover:text-[var(--text-vivid)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition-colors flex items-center space-x-1.5"
                >
                  {success ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Decision Memory</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Deletion Confirmation Modal */}
      {decisionToDelete && (
        <div
          onClick={() => setDecisionToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl select-none animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[var(--surface-blur)] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 font-sans"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-vivid)]">
                  Remove Decision Model?
                </h3>
                <p className="text-xs text-[var(--text-faint)] font-mono">
                  Irreversible action
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-body)] leading-relaxed font-sans bg-[var(--canvas-subtle)] p-3.5 rounded-2xl border border-[var(--line-color)]">
              Permanently remove <strong className="text-[var(--text-vivid)]">"{decisionToDelete.title}"</strong> and all its agent deliberations, stress-test logs, and grounded evidence?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDecisionToDelete(null)}
                className="px-4 py-2 rounded-full bg-[var(--canvas-subtle)] hover:bg-[var(--line-color)] text-[var(--text-body)] text-xs font-mono transition-colors border border-[var(--line-color)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs font-mono transition-colors shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

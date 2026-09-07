import React, { useState, useMemo } from 'react';
import {
  Calendar, Star, ChevronRight, Sparkles, Trash2,
  Crown, ArrowRight, CheckCircle2, Search, Filter,
  Check, History, ArrowUpRight, TrendingUp
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'career' | 'finance' | 'resolved' | 'active'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'confidence' | 'title'>('recent');

  const [selectedForOutcome, setSelectedForOutcome] = useState<DecisionListItem | null>(null);
  const [chosenOption, setChosenOption] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [satisfaction, setSatisfaction] = useState(8);
  const [accuracy, setAccuracy] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
        satisfaction_score: satisfaction,
        ai_accuracy_rating: accuracy,
      });
      setSuccess(true);
      setTimeout(() => {
        setSelectedForOutcome(null);
        setSuccess(false);
        onRefresh();
      }, 900);
    } catch (err: any) {
      alert(err.message || 'Outcome logging failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Permanently remove this decision model from memory?')) {
      await api.deleteDecision(id);
      onRefresh();
    }
  };

  return (
    <div className="min-h-screen px-6 pt-24 pb-36 max-w-4xl mx-auto space-y-8 select-none z-10 relative">
      {/* Header */}
      <div className="space-y-1.5 text-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
          ✦ DECISION MEMORY
        </span>
        <h1 className="text-3xl sm:text-4xl font-editorial text-[var(--text-vivid)]">
          Everything You've Thought Through
        </h1>
        <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
          Compare calibrated AI recommendations with actual lived outcomes to improve your decision intuition.
        </p>
      </div>

      {/* Intelligence Calibration Insight Banner */}
      {decisions.length > 0 && (
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start space-x-3 text-xs font-sans text-slate-300">
          <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase text-cyan-300 block tracking-wider">
              DECISION CALIBRATION INSIGHT
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have evaluated <strong className="text-white">{decisions.length} high-stakes decisions</strong>. Models with prioritized Learning Velocity & Autonomy exhibit highest long-term satisfaction.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
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
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-semibold'
                  : 'bg-[var(--canvas-subtle)] text-slate-400 border border-[var(--line-color)] hover:text-white'
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
          <span className="text-[10px] text-slate-500 font-normal">({filteredDecisions.length} Decisions)</span>
        </div>

        {filteredDecisions.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 py-12">
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
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        DECISION #{d.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.2 rounded-full border ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {isResolved ? 'Resolved & Calibrated' : 'Active Model'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {d.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {d.confidence_score}% Signal
                    </span>
                    <button
                      onClick={(e) => handleDelete(d.id, e)}
                      className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Recommendation & Option summary */}
                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <div className="flex items-center space-x-2 truncate max-w-md">
                    <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-slate-300 truncate">
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
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center space-x-0.5">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--surface-blur)] border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line-color)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                  ✦ CALIBRATE OUTCOME
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Did FlowMind Get It Right?
                </h3>
              </div>
              <button
                onClick={() => setSelectedForOutcome(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 block">
                  Decision Under Evaluation
                </label>
                <div className="p-3 rounded-xl bg-black/40 text-slate-200 text-xs font-sans">
                  "{selectedForOutcome.title}"
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 block">
                  Your Final Choice / Pathway Taken
                </label>
                <input
                  type="text"
                  placeholder={selectedForOutcome.recommendation || 'e.g. Accepted Startup Lead Offer'}
                  value={chosenOption}
                  onChange={(e) => setChosenOption(e.target.value)}
                  className="w-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 block">
                  Actual Lived Outcome Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="How did reality compare to expectations? (e.g. Learning exceeded expectations, equity dilution was minimal...)"
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
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
                  <div className="flex justify-between text-slate-400">
                    <span>AI Accuracy</span>
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
                  className="px-4 py-2 rounded-full bg-black/40 text-slate-400 hover:text-white"
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
    </div>
  );
};

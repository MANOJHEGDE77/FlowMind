import React from 'react';
import {
  Crown, Swords, SlidersHorizontal, BookOpen,
  ArrowRight, X, Sparkles, TrendingUp, ShieldAlert
} from 'lucide-react';
import { Decision } from '../types';

interface SignalMomentProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onChallenge: () => void;
  onSimulate: () => void;
  onOpenEvidence: () => void;
  onOpenWhy: () => void;
}

export const SignalMoment: React.FC<SignalMomentProps> = ({
  decision,
  isOpen,
  onClose,
  onChallenge,
  onSimulate,
  onOpenEvidence,
  onOpenWhy,
}) => {
  if (!isOpen) return null;

  const winner = decision.options.find(o => o.is_recommended) || decision.options[0];
  const scores = winner?.alignment_scores || {
    goal: 92,
    growth: 88,
    flexibility: 82,
    risk: 36,
    cost: 74,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-space-950/90 backdrop-blur-2xl select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl text-center space-y-6">
        {/* Close trigger */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-[var(--text-faint)] hover:text-[var(--text-vivid)] text-xs font-mono"
        >
          [ESC to dismiss]
        </button>

        {/* Ethereal Climax Title */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
            ✦ THE SIGNAL
          </span>
          <h1 className="text-3xl sm:text-5xl font-editorial text-[var(--text-vivid)] tracking-tight">
            {decision.recommendation || winner?.title}
          </h1>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-1">
            <span>{decision.confidence_score}% CALIBRATED CONFIDENCE</span>
          </div>
        </div>

        {/* Why this signal? Dimensional Bars (Minimalist, borderless) */}
        <div className="space-y-2.5 max-w-md mx-auto pt-4 text-left font-mono text-xs">
          <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider block text-center mb-2">
            WHY THIS SIGNAL?
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-body)]">Goal Alignment</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-[var(--canvas-subtle)] rounded-full h-1 overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: `${scores.goal || 90}%` }} />
                </div>
                <span className="text-sky-400 text-[10px] w-8 text-right">{scores.goal || 90}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-body)]">Learning Velocity</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-[var(--canvas-subtle)] rounded-full h-1 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${scores.growth || 85}%` }} />
                </div>
                <span className="text-emerald-400 text-[10px] w-8 text-right">{scores.growth || 85}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-body)]">Strategic Flexibility</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-[var(--canvas-subtle)] rounded-full h-1 overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${scores.flexibility || 80}%` }} />
                </div>
                <span className="text-indigo-400 text-[10px] w-8 text-right">{scores.flexibility || 80}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-body)]">Downside Exposure</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-[var(--canvas-subtle)] rounded-full h-1 overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${scores.risk || 35}%` }} />
                </div>
                <span className="text-rose-400 text-[10px] w-8 text-right">{scores.risk || 35}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-xs text-[var(--text-body)] leading-relaxed max-w-lg mx-auto font-sans pt-2">
          {decision.reasoning_summary}
        </p>

        {/* Interactive Spatial Action Triggers */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => { onClose(); onOpenWhy(); }}
            className="px-4 py-2 rounded-full bg-[var(--canvas-subtle)] hover:bg-[var(--line-color)] text-xs font-mono text-[var(--text-vivid)] border border-[var(--line-color)] transition-all"
          >
            Inspect Reasoning →
          </button>

          <button
            onClick={() => { onClose(); onChallenge(); }}
            className="px-4 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-mono border border-rose-500/30 transition-all flex items-center space-x-1.5"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>⚔️ Red Team Mode</span>
          </button>

          <button
            onClick={() => { onClose(); onSimulate(); }}
            className="px-4 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-mono border border-amber-500/30 transition-all flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>What-If Lab</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenEvidence(); }}
            className="px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-mono border border-emerald-500/30 transition-all flex items-center space-x-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Evidence</span>
          </button>
        </div>
      </div>
    </div>
  );
};

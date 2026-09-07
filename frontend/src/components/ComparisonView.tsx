import React from 'react';
import {
  Scale, X, Crown, CheckCircle2, TrendingUp, ShieldAlert,
  Zap, Layers, ArrowRight
} from 'lucide-react';
import { Decision, DecisionOption } from '../types';

interface ComparisonViewProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: DecisionOption) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  decision,
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  const options = decision.options;
  const metrics = [
    { key: 'goal', label: 'Goal Alignment', desc: 'Alignment with overarching ambitions' },
    { key: 'growth', label: 'Learning & Growth', desc: 'Velocity of professional mastery' },
    { key: 'flexibility', label: 'Strategic Flexibility', desc: 'Optionality & reversibility' },
    { key: 'cost', label: 'Financial Advantage', desc: 'Compensation & liquidity strength' },
    { key: 'risk', label: 'Risk Exposure', desc: 'Operational & psychological vulnerability' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-space-900 border border-space-750 rounded-2xl shadow-modal-depth overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-space-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Multi-Criteria Option Comparison Space
              </h3>
              <p className="text-xs text-slate-400">
                Visual matrix benchmarking options across critical strategic dimensions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-space-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Options Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((opt) => (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border text-center transition-all ${
                  opt.is_recommended
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-space-950/60 border-space-800'
                }`}
              >
                {opt.is_recommended && (
                  <div className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full mb-1.5">
                    <Crown className="w-3 h-3" />
                    <span>AI RECOMMENDED</span>
                  </div>
                )}
                <h4 className="text-sm font-semibold text-white">{opt.title}</h4>
                <div className="mt-2 text-2xl font-mono font-bold text-slate-100">
                  {opt.score}
                  <span className="text-xs text-slate-500 font-normal"> / 100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dimension Breakdown Bars */}
          <div className="space-y-5 bg-space-950/60 border border-space-800 p-5 rounded-xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Dimensional Benchmark
            </h4>

            {metrics.map((metric) => (
              <div key={metric.key} className="space-y-2 border-b border-space-850 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{metric.label}</span>
                  <span className="text-[11px] text-slate-500">{metric.desc}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {options.map((opt) => {
                    const val = opt.alignment_scores?.[metric.key] || 75;
                    const isWinner = options.every(
                      other => (other.alignment_scores?.[metric.key] || 75) <= val
                    );

                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 truncate">{opt.title}</span>
                          <span className={`font-mono font-semibold ${isWinner ? 'text-brand-primary' : 'text-slate-400'}`}>
                            {val}%
                          </span>
                        </div>
                        <div className="w-full bg-space-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isWinner ? 'bg-brand-primary' : 'bg-slate-600'
                            }`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Trade-offs & Summary */}
          <div className="bg-space-850/50 border border-space-800 p-4 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div>
              <strong className="text-white block mb-0.5">Synthesis Verdict:</strong>
              {decision.reasoning_summary?.slice(0, 180)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

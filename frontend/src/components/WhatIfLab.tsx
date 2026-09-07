import React, { useState } from 'react';
import {
  SlidersHorizontal, X, ArrowRight, Sparkles, RefreshCw,
  Clock, DollarSign, Laptop, CheckCircle2, TrendingUp
} from 'lucide-react';
import { Decision, SimulationResult } from '../types';
import { api } from '../services/api';

interface WhatIfLabProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Decision) => void;
}

export const WhatIfLab: React.FC<WhatIfLabProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [scenarioTitle, setScenarioTitle] = useState('+25% Compensation Counteroffer');
  const [salaryPct, setSalaryPct] = useState<number>(25);
  const [remotePriority, setRemotePriority] = useState<boolean>(true);
  const [horizonYears, setHorizonYears] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    try {
      setIsLoading(true);
      const res = await api.simulateWhatIf(decision.id, {
        scenario_title: scenarioTitle,
        modifications: {
          salary_change_pct: salaryPct,
          prioritize_remote: remotePriority,
          tenure_horizon_years: horizonYears,
        },
      });
      setResult(res);
      const fresh = await api.getDecision(decision.id);
      onSuccess(fresh);
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
                What-If Scenario Simulator
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Stress-test assumption shifts and observe real-time differential graph re-weighting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Preset Levers */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
              QUICK SCENARIOS
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { title: 'Counteroffer: +25% Salary', sal: 25, rem: false, yr: 3 },
                { title: 'Remove Remote Flexibility', sal: 0, rem: false, yr: 3 },
                { title: 'Short 2-Year Horizon', sal: 10, rem: true, yr: 2 },
                { title: 'Long-Term 5-Year Compounding', sal: 0, rem: true, yr: 5 },
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setScenarioTitle(p.title);
                    setSalaryPct(p.sal);
                    setRemotePriority(p.rem);
                    setHorizonYears(p.yr);
                  }}
                  className="text-xs bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-4">
            {/* Compensation Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--text-primary)] font-medium flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compensation Lever</span>
                </span>
                <span className="font-mono text-amber-400 font-semibold">
                  {salaryPct >= 0 ? `+${salaryPct}%` : `${salaryPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={salaryPct}
                onChange={(e) => setSalaryPct(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Time Horizon Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--text-primary)] font-medium flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Time Horizon Lever</span>
                </span>
                <span className="font-mono text-sky-400 font-semibold">
                  {horizonYears} Years
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Remote Work Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
              <label className="flex items-center space-x-2 text-xs text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remotePriority}
                  onChange={(e) => setRemotePriority(e.target.checked)}
                  className="rounded bg-[var(--bg-surface)] border-[var(--border-subtle)] text-amber-400"
                />
                <span className="flex items-center space-x-1">
                  <Laptop className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Prioritize Remote Work</span>
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-space-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 font-mono"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Recalculating Decision Topology...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Scenario Delta</span>
              </>
            )}
          </button>

          {/* Results Comparison */}
          {result && (
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">
                    BEFORE
                  </span>
                  <strong className="text-[var(--text-secondary)] font-medium">
                    {result.recommended_option_before}
                  </strong>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                    {result.confidence_before}% conf
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-amber-400" />

                <div className="text-right">
                  <span className="text-[10px] font-mono text-amber-400 block uppercase">
                    SIMULATED WINNER
                  </span>
                  <strong className="text-amber-400 font-semibold">
                    {result.recommended_option_after}
                  </strong>
                  <span className="text-[10px] font-mono text-amber-300 block">
                    {result.confidence_after}% conf
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed font-sans">
                {result.diff_explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

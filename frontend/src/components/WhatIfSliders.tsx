import React, { useState } from 'react';
import {
  SlidersHorizontal, X, ArrowRight, RefreshCw,
  DollarSign, Clock, Laptop, Sparkles
} from 'lucide-react';
import { Decision, SimulationResult } from '../types';
import { api } from '../services/api';

interface WhatIfSlidersProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Decision) => void;
}

export const WhatIfSliders: React.FC<WhatIfSlidersProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [salaryShift, setSalaryShift] = useState<number>(20);
  const [remoteMode, setRemoteMode] = useState<boolean>(true);
  const [timeHorizon, setTimeHorizon] = useState<number>(3);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    try {
      setIsSimulating(true);
      const res = await api.simulateWhatIf(decision.id, {
        scenario_title: `Salary ${salaryShift >= 0 ? '+' : ''}${salaryShift}%, Remote: ${remoteMode ? 'Yes' : 'No'}`,
        modifications: {
          salary_change_pct: salaryShift,
          prioritize_remote: remoteMode,
          tenure_horizon_years: timeHorizon,
        },
      });
      setResult(res);
      const fresh = await api.getDecision(decision.id);
      onSuccess(fresh);
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-space-950/85 backdrop-blur-xl select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[var(--surface-blur)] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line-color)]">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              WHAT-IF ASSUMPTION LEVERS
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-faint)] hover:text-[var(--text-vivid)] p-1 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Levers */}
        <div className="space-y-5 font-mono text-xs">
          {/* Lever 1: Salary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[var(--text-body)]">
              <span>COMPENSATION LEVER</span>
              <span className="text-amber-400 font-bold">
                {salaryShift >= 0 ? `+${salaryShift}%` : `${salaryShift}%`}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] text-[var(--text-faint)]">
              <span>-20%</span>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={salaryShift}
                onChange={(e) => setSalaryShift(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span>+50%</span>
            </div>
          </div>

          {/* Lever 2: Time Horizon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[var(--text-body)]">
              <span>TIME HORIZON LEVER</span>
              <span className="text-sky-400 font-bold">{timeHorizon} Years</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] text-[var(--text-faint)]">
              <span>1 Year</span>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span>7 Years</span>
            </div>
          </div>

          {/* Lever 3: Remote Priority Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--line-color)]">
            <span className="text-[var(--text-body)]">REMOTE WORK PREFERENCE</span>
            <button
              onClick={() => setRemoteMode(!remoteMode)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                remoteMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-[var(--canvas-subtle)] text-[var(--text-faint)]'
              }`}
            >
              {remoteMode ? '● ACTIVE' : '○ OFF'}
            </button>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="w-full py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-space-950 font-mono font-semibold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Recalculating Decision Topology...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Topological Shift</span>
            </>
          )}
        </button>

        {/* Result Diff */}
        {result && (
          <div className="pt-3 border-t border-[var(--line-color)] space-y-2.5 font-mono text-xs animate-in fade-in">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
              <div>
                <span className="text-[9px] text-[var(--text-faint)] uppercase block">PREVIOUS</span>
                <span className="text-[var(--text-body)] font-semibold truncate max-w-[150px] block">
                  {result.recommended_option_before}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <span className="text-[9px] text-amber-400 uppercase block">NEW SIMULATED SIGNAL</span>
                <span className="text-amber-400 font-bold truncate max-w-[150px] block">
                  {result.recommended_option_after}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-body)] leading-relaxed font-sans">
              {result.diff_explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  SlidersHorizontal, X, ArrowRight, Sparkles, RefreshCw,
  CheckCircle2, TrendingUp, DollarSign, Clock, Laptop
} from 'lucide-react';
import { Decision, SimulationResult } from '../types';
import { api } from '../services/api';

interface WhatIfSimulatorProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDecision: Decision) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [scenarioTitle, setScenarioTitle] = useState('20% Comp Bump & Full Remote Flexibility');
  const [salaryChangePct, setSalaryChangePct] = useState<number>(20);
  const [prioritizeRemote, setPrioritizeRemote] = useState<boolean>(true);
  const [tenureHorizonYears, setTenureHorizonYears] = useState<number>(3);
  const [excludeFinancial, setExcludeFinancial] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    try {
      setIsLoading(true);
      const res = await api.simulateWhatIf(decision.id, {
        scenario_title: scenarioTitle,
        modifications: {
          salary_change_pct: salaryChangePct,
          prioritize_remote: prioritizeRemote,
          tenure_horizon_years: tenureHorizonYears,
          exclude_financial: excludeFinancial,
        },
      });
      setSimulationResult(res);
      // Fetch fresh decision to reflect simulated state
      const fresh = await api.getDecision(decision.id);
      onSuccess(fresh);
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-space-900 border border-amber-500/30 rounded-2xl shadow-modal-depth overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                What-If Scenario Simulator
              </h3>
              <p className="text-xs text-amber-300/80">
                Dynamically tweak assumptions and recalculate outcomes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Preset Chips */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Quick Scenarios
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Counteroffer: +25% Salary', salary: 25, remote: false, years: 3 },
                { label: 'Prioritize Full Remote', salary: 0, remote: true, years: 3 },
                { label: '2-Year Short Horizon', salary: 10, remote: true, years: 2 },
                { label: 'Long-Term 5-Year Incubation', salary: 0, remote: false, years: 5 },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setScenarioTitle(preset.label);
                    setSalaryChangePct(preset.salary);
                    setPrioritizeRemote(preset.remote);
                    setTenureHorizonYears(preset.years);
                  }}
                  className="text-xs bg-space-850 hover:bg-space-800 border border-space-750 px-2.5 py-1.5 rounded-lg text-slate-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders & Switches */}
          <div className="bg-space-950/60 border border-space-800 p-4 rounded-xl space-y-4">
            {/* Scenario Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Scenario Title
              </label>
              <input
                type="text"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                className="w-full bg-space-900 border border-space-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Salary Change Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compensation Adjustment</span>
                </span>
                <span className="font-mono text-amber-400 font-semibold">
                  {salaryChangePct >= 0 ? `+${salaryChangePct}%` : `${salaryChangePct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={salaryChangePct}
                onChange={(e) => setSalaryChangePct(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Time Horizon Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Time Horizon</span>
                </span>
                <span className="font-mono text-indigo-400 font-semibold">
                  {tenureHorizonYears} Years
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={tenureHorizonYears}
                onChange={(e) => setTenureHorizonYears(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* Toggle Switches */}
            <div className="flex items-center justify-between pt-2 border-t border-space-800">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prioritizeRemote}
                  onChange={(e) => setPrioritizeRemote(e.target.checked)}
                  className="rounded bg-space-900 border-space-700 text-amber-500 focus:ring-0"
                />
                <span className="flex items-center space-x-1">
                  <Laptop className="w-3 h-3 text-slate-400" />
                  <span>Prioritize Remote Work</span>
                </span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeFinancial}
                  onChange={(e) => setExcludeFinancial(e.target.checked)}
                  className="rounded bg-space-900 border-space-700 text-amber-500 focus:ring-0"
                />
                <span>Exclude Pure Financial Weight</span>
              </label>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleSimulate}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-space-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Differential Model...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run What-If Recalculation</span>
              </>
            )}
          </button>

          {/* Results Diff View */}
          {simulationResult && (
            <div className="mt-4 pt-4 border-t border-space-800 space-y-3 animate-in fade-in">
              <div className="bg-space-950/80 border border-space-800 p-4 rounded-xl">
                <div className="text-[11px] font-mono text-slate-400 uppercase mb-2">
                  Decision Shift: Before vs After
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-left">
                    <span className="text-slate-500 block text-[10px]">BEFORE</span>
                    <strong className="text-slate-300">{simulationResult.recommended_option_before}</strong>
                    <span className="text-slate-400 block font-mono text-[10px]">
                      {simulationResult.confidence_before}% conf
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">AFTER SIMULATION</span>
                    <strong className="text-amber-400">{simulationResult.recommended_option_after}</strong>
                    <span className="text-amber-300 block font-mono text-[10px]">
                      {simulationResult.confidence_after}% conf
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200/90 leading-relaxed">
                {simulationResult.diff_explanation}
              </div>

              {/* Option Scores */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Updated Option Scores
                </div>
                {Object.entries(simulationResult.updated_option_scores).map(([optName, score]) => (
                  <div
                    key={optName}
                    className="flex items-center justify-between p-2 rounded-lg bg-space-850/60 border border-space-800 text-xs"
                  >
                    <span className="text-slate-200">{optName}</span>
                    <span className="font-mono text-amber-400 font-semibold">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

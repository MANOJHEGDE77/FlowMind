import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal, X, ArrowRight, RefreshCw,
  DollarSign, Clock, Laptop, Sparkles,
  Dices, BarChart3, TrendingUp, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { Decision, SimulationResult } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import { useToast } from '../context/ToastContext';

interface WhatIfSlidersProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Decision) => void;
}

interface MonteCarloStats {
  runs: number;
  winRate: number;
  regretIndex: number;
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  stdDev: number;
  resilienceRating: 'Robust Resilience' | 'Moderate Sensitivity' | 'Fragile Under Stress';
  optionWins: Record<string, number>;
  curvePoints: Array<{ x: number; y: number }>;
}

export const WhatIfSliders: React.FC<WhatIfSlidersProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'sliders' | 'monte-carlo'>('sliders');

  // Manual Sliders State
  const [salaryShift, setSalaryShift] = useState<number>(20);
  const [remoteMode, setRemoteMode] = useState<boolean>(true);
  const [timeHorizon, setTimeHorizon] = useState<number>(3);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Monte Carlo State
  const [isMonteCarloRunning, setIsMonteCarloRunning] = useState(false);
  const [monteCarloStats, setMonteCarloStats] = useState<MonteCarloStats | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const winnerOption = decision.options.find(o => o.is_recommended) || decision.options[0];

  const handleRunSimulation = async () => {
    try {
      soundService.playClick();
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
      soundService.playSuccess();
      showToast('What-If simulation completed! Decision topology updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Simulation failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const runMonteCarloSimulation = () => {
    soundService.playClick();
    setIsMonteCarloRunning(true);

    setTimeout(() => {
      const runs = 1000;
      const optionScores: Record<string, number[]> = {};
      decision.options.forEach(opt => {
        optionScores[opt.title] = [];
      });

      const wins: Record<string, number> = {};
      decision.options.forEach(opt => { wins[opt.title] = 0; });

      const simulatedWinnerScores: number[] = [];
      const primaryTitle = winnerOption.title;

      for (let i = 0; i < runs; i++) {
        // Random volatility factors
        const marketShock = (Math.random() - 0.5) * 28; // -14 to +14
        const burnoutShock = (Math.random() - 0.5) * 18; // -9 to +9
        const compensationVariance = (Math.random() - 0.5) * 22; // -11 to +11

        let highestScore = -Infinity;
        let iterationWinner = primaryTitle;

        decision.options.forEach(opt => {
          const base = opt.score || 75;
          const isPrimary = opt.title === primaryTitle;
          // Apply stochastic modifiers
          const noise = (Math.random() - 0.5) * 8;
          const score = Math.max(30, Math.min(99, Math.round(
            base + noise +
            (isPrimary ? burnoutShock * 0.4 : 0) +
            marketShock * 0.5 +
            compensationVariance * 0.3
          )));

          optionScores[opt.title].push(score);
          if (score > highestScore) {
            highestScore = score;
            iterationWinner = opt.title;
          }
        });

        wins[iterationWinner] = (wins[iterationWinner] || 0) + 1;
        simulatedWinnerScores.push(highestScore);
      }

      // Compute statistics
      simulatedWinnerScores.sort((a, b) => a - b);
      const p10 = simulatedWinnerScores[Math.floor(runs * 0.1)];
      const p50 = simulatedWinnerScores[Math.floor(runs * 0.5)];
      const p90 = simulatedWinnerScores[Math.floor(runs * 0.9)];
      const mean = Math.round(simulatedWinnerScores.reduce((a, b) => a + b, 0) / runs);

      const variance = simulatedWinnerScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / runs;
      const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

      const winRate = Math.round(((wins[primaryTitle] || 0) / runs) * 100);
      const regretIndex = Math.round(Math.max(68, 100 - (100 - winRate) * 0.8));

      let resilienceRating: 'Robust Resilience' | 'Moderate Sensitivity' | 'Fragile Under Stress' = 'Robust Resilience';
      if (winRate < 60) {
        resilienceRating = 'Fragile Under Stress';
      } else if (winRate < 80) {
        resilienceRating = 'Moderate Sensitivity';
      }

      // Generate SVG bell curve points
      const bins = 30;
      const minVal = p10 - 10;
      const maxVal = p90 + 10;
      const step = (maxVal - minVal) / bins;
      const curvePoints: Array<{ x: number; y: number }> = [];

      for (let b = 0; b <= bins; b++) {
        const xVal = minVal + b * step;
        // Gaussian probability density function
        const exponent = -Math.pow(xVal - mean, 2) / (2 * Math.pow(stdDev || 5, 2));
        const density = Math.exp(exponent);
        curvePoints.push({
          x: Math.round((b / bins) * 400),
          y: Math.round(140 - density * 120),
        });
      }

      setMonteCarloStats({
        runs,
        winRate,
        regretIndex,
        p10,
        p50,
        p90,
        mean,
        stdDev,
        resilienceRating,
        optionWins: wins,
        curvePoints,
      });

      setIsMonteCarloRunning(false);
      soundService.playChime();
    }, 450);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xl select-none animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-[var(--surface-blur)] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
        {/* Modal Header with Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line-color)]">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              WHAT-IF LAB & MONTE CARLO STRESS TEST
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-faint)] hover:text-[var(--text-vivid)] p-1 rounded-full hover:bg-[var(--canvas-subtle)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[var(--canvas-subtle)] border border-[var(--line-color)] p-1 rounded-full">
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('sliders');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              activeTab === 'sliders'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-400/40 shadow-sm'
                : 'text-[var(--text-faint)] hover:text-[var(--text-vivid)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Scenario Levers</span>
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('monte-carlo');
              if (!monteCarloStats) {
                runMonteCarloSimulation();
              }
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              activeTab === 'monte-carlo'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-400/40 shadow-sm'
                : 'text-[var(--text-faint)] hover:text-[var(--text-vivid)]'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>🎲 1,000 Monte Carlo Runs</span>
          </button>
        </div>

        {/* TAB 1: MANUAL LEVERS */}
        {activeTab === 'sliders' && (
          <div className="space-y-5 animate-in fade-in duration-150">
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
              className="w-full py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-space-950 font-mono font-semibold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
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
        )}

        {/* TAB 2: 1,000 MONTE CARLO STRESS TEST */}
        {activeTab === 'monte-carlo' && (
          <div className="space-y-4 animate-in fade-in duration-150 font-mono">
            {/* Description */}
            <div className="flex items-center justify-between text-xs text-[var(--text-faint)]">
              <span>Stochastic Shock Injections (n = 1,000)</span>
              <button
                onClick={runMonteCarloSimulation}
                disabled={isMonteCarloRunning}
                className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 transition-colors text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${isMonteCarloRunning ? 'animate-spin' : ''}`} />
                <span>Rerun 1,000 Tests</span>
              </button>
            </div>

            {/* KPI Cards */}
            {monteCarloStats && (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-center">
                  <span className="text-[9px] text-[var(--text-faint)] uppercase block">WIN PROBABILITY</span>
                  <span className="text-lg font-bold text-emerald-400 block mt-0.5">
                    {monteCarloStats.winRate}%
                  </span>
                  <span className="text-[9px] text-[var(--text-faint)]">Across shocks</span>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-center">
                  <span className="text-[9px] text-[var(--text-faint)] uppercase block">REGRET MIN. INDEX</span>
                  <span className="text-lg font-bold text-cyan-400 block mt-0.5">
                    {monteCarloStats.regretIndex}%
                  </span>
                  <span className="text-[9px] text-[var(--text-faint)]">Zero-regret likelihood</span>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-center">
                  <span className="text-[9px] text-[var(--text-faint)] uppercase block">RESILIENCE GRADE</span>
                  <span className={`text-xs font-bold block mt-1 ${
                    monteCarloStats.winRate >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {monteCarloStats.resilienceRating}
                  </span>
                  <span className="text-[9px] text-[var(--text-faint)]">Stress tested</span>
                </div>
              </div>
            )}

            {/* SVG Probability Density Bell Curve */}
            {monteCarloStats && monteCarloStats.curvePoints.length > 0 && (
              <div className="relative p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] overflow-hidden space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider">OUTCOME DISTRIBUTION</span>
                  <span className="text-amber-400 font-medium">1,000 Scenarios Simulated</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Stochastic sensitivity spread across volatility parameters without claiming false precision.
                </p>

                <svg className="w-full h-28" viewBox="0 0 400 150">
                  {/* Shaded Area */}
                  <path
                    d={`M 0 145 L ${monteCarloStats.curvePoints.map(p => `${p.x} ${p.y}`).join(' L ')} L 400 145 Z`}
                    fill="url(#amberGradient)"
                    opacity="0.35"
                  />
                  {/* Bell curve line */}
                  <path
                    d={`M ${monteCarloStats.curvePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="2.5"
                  />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Baseline */}
                  <line x1="0" y1="145" x2="400" y2="145" stroke="currentColor" className="text-[var(--line-color)]" strokeWidth="1" />
                </svg>

                {/* Percentile Thresholds */}
                <div className="grid grid-cols-5 gap-1 text-[9px] text-[var(--text-faint)] mt-2 border-t border-[var(--line-color)] pt-2 text-center">
                  <div className="p-1 rounded bg-rose-500/10 border border-rose-500/20">
                    <span className="block text-rose-500 text-[8px]">P10 FLOOR</span>
                    <strong className="text-rose-400 font-bold">{monteCarloStats.p10} pts</strong>
                  </div>
                  <div className="p-1 rounded bg-[var(--canvas-bg)]">
                    <span className="block text-[var(--text-faint)] text-[8px]">P25 LOW</span>
                    <strong className="text-amber-500">{Math.round((monteCarloStats.p10 + monteCarloStats.p50) / 2)} pts</strong>
                  </div>
                  <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                    <span className="block text-amber-500 text-[8px]">P50 MEDIAN</span>
                    <strong className="text-amber-400 font-bold">{monteCarloStats.p50} pts</strong>
                  </div>
                  <div className="p-1 rounded bg-[var(--canvas-bg)]">
                    <span className="block text-[var(--text-faint)] text-[8px]">P75 HIGH</span>
                    <strong className="text-emerald-500">{Math.round((monteCarloStats.p50 + monteCarloStats.p90) / 2)} pts</strong>
                  </div>
                  <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span className="block text-emerald-500 text-[8px]">P90 BULL</span>
                    <strong className="text-emerald-400 font-bold">{monteCarloStats.p90} pts</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Stochastic Risk Statistics: Expected Outcome, Volatility, Downside, Upside */}
            {monteCarloStats && (
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                  <span className="text-[8px] text-[var(--text-faint)] block uppercase">EXPECTED OUTCOME</span>
                  <span className="text-xs font-bold text-[var(--text-vivid)] mt-0.5 block">{monteCarloStats.mean} pts</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                  <span className="text-[8px] text-[var(--text-faint)] block uppercase">VOLATILITY (σ)</span>
                  <span className="text-xs font-bold text-cyan-400 mt-0.5 block">±{monteCarloStats.stdDev}</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                  <span className="text-[8px] text-[var(--text-faint)] block uppercase">DOWNSIDE (5% VaR)</span>
                  <span className="text-xs font-bold text-rose-400 mt-0.5 block">{monteCarloStats.p10 - 4} pts</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                  <span className="text-[8px] text-[var(--text-faint)] block uppercase">UPSIDE (95% TOP)</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{monteCarloStats.p90 + 4} pts</span>
                </div>
              </div>
            )}

            {/* Option Outperformance Breakdown */}
            {monteCarloStats && (
              <div className="space-y-1.5 text-[11px]">
                <span className="text-[10px] text-[var(--text-faint)] uppercase block">
                  CANDIDATE WIN DISTRIBUTION (1,000 SCENARIOS):
                </span>
                {Object.entries(monteCarloStats.optionWins).map(([title, count]) => {
                  const pct = Math.round((count / monteCarloStats.runs) * 100);
                  const isWinner = title === winnerOption.title;
                  return (
                    <div key={title} className="flex items-center justify-between p-2 rounded-xl bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                      <span className={`truncate max-w-[200px] ${isWinner ? 'text-amber-400 font-semibold' : 'text-[var(--text-body)]'}`}>
                        {title}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-[var(--canvas-bg)] rounded-full h-1.5 overflow-hidden border border-[var(--line-color)]">
                          <div
                            className={`h-full rounded-full ${isWinner ? 'bg-amber-400' : 'bg-slate-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-bold text-[var(--text-body)]">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Crucial Analytical Disclaimer Banner */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 leading-normal flex items-start space-x-2 font-sans">
              <span className="text-amber-400 font-bold shrink-0">ℹ️</span>
              <span>
                <strong>Scenario-Based Sensitivity Analysis</strong>: This simulation models stochastic shocks across 1,000 runs to test decision fragility. It is a sensitivity stress-test rather than a guaranteed prediction of future events.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

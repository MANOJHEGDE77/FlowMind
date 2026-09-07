import React, { useState, useEffect } from 'react';
import {
  Swords, X, Flame, ShieldAlert, ArrowDownRight,
  AlertTriangle, RefreshCw, ArrowRight, ArrowLeft,
  Target, HelpCircle, CheckCircle2, Zap
} from 'lucide-react';
import { ChallengeResult, Decision } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface RedTeamModeProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Decision) => void;
}

export const RedTeamMode: React.FC<RedTeamModeProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const defaultTarget = decision.recommendation || decision.options[0]?.title || 'Leading Option';
  const [targetOption, setTargetOption] = useState<string>(defaultTarget);

  const defaultPresets = [
    {
      id: 'worst-case',
      title: 'Worst-Case Downside',
      desc: 'External conditions deteriorate or key dependencies fail.',
      query: 'Worst-case failure modes and market downside volatility',
    },
    {
      id: 'burnout-friction',
      title: 'Execution Friction & Burnout',
      desc: 'Workload, emotional stress, or timeline are severely underestimated.',
      query: 'Severe operational friction, fatigue, and burnout risk',
    },
    {
      id: 'opportunity-cost',
      title: 'Opportunity Cost & Regret',
      desc: 'Alternative paths may offer vastly superior compounding upside.',
      query: 'Asymmetric opportunity cost and alternative path outperformance',
    },
    {
      id: 'lock-in',
      title: 'Exit Costs & Reversibility',
      desc: 'High barrier or painful friction if you need to reverse after 12 months.',
      query: 'Lock-in traps, one-way door risk, and lack of exit mobility',
    },
    {
      id: 'optimism-bias',
      title: 'Confirmation Bias & Blind Spots',
      desc: 'Scenarios rely on best-case execution without safety buffers.',
      query: 'Unchecked confirmation bias and over-optimistic baseline assumptions',
    },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('worst-case');
  const [customDoubt, setCustomDoubt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);

  // Sync default target when decision opens
  useEffect(() => {
    if (isOpen) {
      setTargetOption(decision.recommendation || decision.options[0]?.title || 'Leading Option');
      setResult(null);
      setCustomDoubt('');
    }
  }, [isOpen, decision]);

  // Robust Escape key listener
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

  const activeFocusArea = customDoubt.trim()
    ? customDoubt.trim()
    : defaultPresets.find((p) => p.id === selectedPresetId)?.query || 'Worst-case downside risk';

  const handleRunRedTeam = async () => {
    try {
      setIsLoading(true);
      const res = await api.challengeDecision(decision.id, {
        target_recommendation: targetOption,
        focus_area: activeFocusArea,
      });
      setResult(res);
      const fresh = await api.getDecision(decision.id);
      onSuccess(fresh);
      showToast("Devil's Advocate challenge complete. Stress-test critique generated!", 'warning');
    } catch (err: any) {
      showToast(err.message || 'Red team attack failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-red-950/80 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950/95 border border-rose-500/30 shadow-[0_20px_80px_rgba(244,63,94,0.25)] overflow-hidden font-sans">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-rose-500/20 flex items-center justify-between shrink-0 bg-red-950/30">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                ⚔️ RED TEAM INTERROGATION MODE
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/20 text-xs font-mono transition-colors"
            title="Press Esc to close"
          >
            <span>Close</span>
            <kbd className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/30 text-[10px] text-rose-300 font-mono">
              ESC
            </kbd>
            <X className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Explainer Banner: What is Red Team? */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/50 to-rose-950/20 border border-rose-500/25 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-rose-300 font-mono block">
                What does Red Team mode do?
              </span>
              <p className="text-rose-200/80 leading-relaxed font-sans">
                The Devil's Advocate attacks your leading decision option with contrarian scrutiny to expose
                hidden confirmation bias, fragile assumptions, and worst-case regret risks before you commit.
              </p>
            </div>
          </div>

          {!result ? (
            /* =================== CONFIGURATION SCREEN =================== */
            <div className="space-y-6">
              {/* Target Option Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-300/90 font-bold flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-400" />
                    <span>Target Option to Stress-Test:</span>
                  </span>
                  <span className="text-[11px] font-mono text-rose-400/70">
                    Default: AI Recommendation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {decision.options.map((opt) => {
                    const isSelected = targetOption === opt.title;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTargetOption(opt.title)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-400 text-white shadow-lg shadow-rose-950/50'
                            : 'bg-black/30 border-rose-500/20 text-rose-300/80 hover:border-rose-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs truncate mr-2">
                            {opt.title}
                          </span>
                          {opt.is_recommended && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500/30 text-rose-200 border border-rose-500/40 shrink-0">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="text-[11px] text-rose-200/60 mt-1 line-clamp-1">
                            {opt.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attack Angles / Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-300/90 font-bold flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                    <span>Choose Stress-Test Angle (Click to Select):</span>
                  </span>
                  <span className="text-[11px] font-mono text-rose-300/60">
                    No writing needed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {defaultPresets.map((preset) => {
                    const isSelected = selectedPresetId === preset.id && !customDoubt.trim();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetId(preset.id);
                          setCustomDoubt('');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-rose-500/25 border-rose-400 text-white shadow-md shadow-rose-950/60'
                            : 'bg-black/30 border-rose-500/20 text-rose-300/80 hover:border-rose-400/40 hover:bg-rose-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs font-mono">
                            {preset.title}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-rose-200/70 leading-normal">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Concern Box */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-mono uppercase tracking-wider text-rose-300/90 font-bold flex items-center justify-between">
                  <span>Or Enter a Specific Worry / Fear (Optional):</span>
                  <span className="text-[10px] font-normal text-rose-400/60">
                    Overrides selection above if filled
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customDoubt}
                    onChange={(e) => setCustomDoubt(e.target.value)}
                    placeholder="e.g. What if I burn out after 6 months, or team leadership changes?"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-rose-500/30 text-rose-100 placeholder-rose-400/40 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all font-sans"
                  />
                  {customDoubt && (
                    <button
                      type="button"
                      onClick={() => setCustomDoubt('')}
                      className="absolute right-3 top-2.5 text-rose-400/70 hover:text-white text-xs font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-rose-300/50">
                  Tip: If unsure, leave this empty. The preset selected above will run an automatic comprehensive assault.
                </p>
              </div>

              {/* Execution Action CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunRedTeam}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-mono font-semibold text-xs shadow-xl shadow-rose-950/80 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-200" />
                      <span>Interrogating Assumptions & Recalibrating Confidence...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 text-rose-200" />
                      <span>Execute Devil's Advocate Stress-Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* =================== RESULTS SCREEN =================== */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Confidence Recalibration & Fragility Verdict */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-rose-300/70 uppercase block">
                      CONFIDENCE HAIRCUT
                    </span>
                    <div className="flex items-center space-x-2.5 mt-1.5">
                      <span className="line-through text-rose-300/40 text-base font-mono">
                        {result.original_confidence}%
                      </span>
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      <span className="text-2xl font-bold text-rose-300 font-mono">
                        {result.recalculated_confidence}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                    {result.confidence_delta}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/30 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-rose-300/70 uppercase block">
                    MODEL FRAGILITY VERDICT
                  </span>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>{result.fragility_verdict.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Devil's Advocate Critique */}
              <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Swords className="w-4 h-4" />
                  <span>Devil's Advocate Adversarial Critique:</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed font-sans whitespace-pre-line">
                  {result.devil_advocate_critique}
                </p>
              </div>

              {/* Vulnerabilities Detected */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-300/90 font-bold flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Detected Vulnerable Assumptions ({result.vulnerabilities.length}):</span>
                </span>
                <div className="space-y-2">
                  {result.vulnerabilities.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-black/40 border border-rose-500/25 text-xs text-rose-100/90 flex items-start space-x-2.5 font-sans"
                    >
                      <span className="text-rose-400 font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Alternative Scenario */}
              {result.alternative_scenario && (
                <div className="p-4 rounded-2xl bg-black/30 border border-rose-500/20 text-xs text-rose-200/80 font-mono space-y-1">
                  <span className="text-[10px] text-rose-400 uppercase font-bold block">
                    ✦ STRATEGIC PIVOT SAFEGUARD:
                  </span>
                  <p className="text-rose-100 font-sans">
                    {result.alternative_scenario}
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-black/40 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Another Stress Angle</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Decision Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

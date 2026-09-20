import React, { useState, useEffect } from 'react';
import {
  Swords, X, Flame, ShieldAlert, ArrowDownRight,
  AlertTriangle, RefreshCw, ArrowRight, ArrowLeft,
  Target, HelpCircle, CheckCircle2, Zap
} from 'lucide-react';
import { ChallengeResult, Decision } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
      soundService.playResonance();
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200 ${
        isLight ? 'bg-slate-900/50' : 'bg-red-950/80 backdrop-blur-2xl'
      }`}
    >
      <div className={`relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border overflow-hidden font-sans shadow-2xl ${
        isLight
          ? 'bg-white/95 border-rose-300 shadow-[0_20px_80px_rgba(244,63,94,0.18)] text-slate-900'
          : 'bg-zinc-950/95 border-rose-500/30 shadow-[0_20px_80px_rgba(244,63,94,0.25)] text-white'
      }`}>
        {/* Top Header Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-rose-50/80 border-rose-200' : 'bg-red-950/30 border-rose-500/20'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
                isLight
                  ? 'bg-rose-100/80 text-rose-700 border-rose-200 hover:bg-rose-200/80'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className={`text-xs font-mono uppercase tracking-widest font-bold ${
                isLight ? 'text-rose-600' : 'text-rose-400'
              }`}>
                ⚔️ RED TEAM INTERROGATION MODE
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
              isLight
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                : 'bg-black/40 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/20'
            }`}
            title="Press Esc to close"
          >
            <span>Close</span>
            <kbd className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${
              isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
            }`}>
              ESC
            </kbd>
            <X className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ASSUMPTION UNDER ATTACK FRAMEWORK BANNER */}
          <div className="p-5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#13070A] via-[#0B0507] to-[#060305] space-y-3">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-xs font-bold text-red-400 tracking-wider">
                  RED TEAM MODE // ASSUMPTION UNDER ATTACK
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/90 font-medium">
                ADVERSARIAL STRESS-TEST
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                <span className="text-[9px] text-slate-400 font-bold block">01 // SUCCESS PREMISE</span>
                <p className="text-[11px] text-slate-200 font-editorial italic">
                  "What would have to be true for this decision to succeed?"
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                <span className="text-[9px] text-red-400 font-bold block">02 // INVALIDATION VECTOR</span>
                <p className="text-[11px] text-slate-200 font-editorial italic">
                  "What could invalidate it?"
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                <span className="text-[9px] text-amber-400 font-bold block">03 // UNVERIFIED BELIEF</span>
                <p className="text-[11px] text-slate-200 font-editorial italic">
                  "What are you assuming without evidence?"
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                <span className="text-[9px] text-rose-400 font-bold block">04 // WORST-CASE IMPACT</span>
                <p className="text-[11px] text-slate-200 font-editorial italic">
                  "What happens if your biggest assumption is wrong?"
                </p>
              </div>
            </div>
          </div>

          {!result ? (
            /* =================== CONFIGURATION SCREEN =================== */
            <div className="space-y-6">
              {/* Target Option Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-1.5 ${
                    isLight ? 'text-slate-800' : 'text-rose-300/90'
                  }`}>
                    <Target className="w-3.5 h-3.5 text-rose-500" />
                    <span>Target Option to Stress-Test:</span>
                  </span>
                  <span className={`text-[11px] font-mono ${
                    isLight ? 'text-slate-500' : 'text-rose-400/70'
                  }`}>
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
                            ? isLight
                              ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm ring-1 ring-rose-400/50'
                              : 'bg-rose-500/20 border-rose-400 text-white shadow-lg shadow-rose-950/50'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300'
                            : 'bg-black/30 border-rose-500/20 text-rose-300/80 hover:border-rose-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs truncate mr-2">
                            {opt.title}
                          </span>
                          {opt.is_recommended && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border shrink-0 ${
                              isLight
                                ? 'bg-rose-100 text-rose-700 border-rose-300 font-bold'
                                : 'bg-rose-500/30 text-rose-200 border-rose-500/40'
                            }`}>
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className={`text-[11px] mt-1 line-clamp-1 ${
                            isLight ? 'text-slate-500' : 'text-rose-200/60'
                          }`}>
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
                  <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-1.5 ${
                    isLight ? 'text-slate-800' : 'text-rose-300/90'
                  }`}>
                    <Zap className="w-3.5 h-3.5 text-rose-500" />
                    <span>Choose Stress-Test Angle (Click to Select):</span>
                  </span>
                  <span className={`text-[11px] font-mono ${
                    isLight ? 'text-slate-500' : 'text-rose-300/60'
                  }`}>
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
                            ? isLight
                              ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm ring-1 ring-rose-400/50'
                              : 'bg-rose-500/25 border-rose-400 text-white shadow-md shadow-rose-950/60'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/40'
                            : 'bg-black/30 border-rose-500/20 text-rose-300/80 hover:border-rose-400/40 hover:bg-rose-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs font-mono">
                            {preset.title}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          )}
                        </div>
                        <p className={`text-[11px] leading-normal ${
                          isLight ? 'text-slate-600' : 'text-rose-200/70'
                        }`}>
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Concern Box */}
              <div className="space-y-1.5 pt-1">
                <label className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-between ${
                  isLight ? 'text-slate-800' : 'text-rose-300/90'
                }`}>
                  <span>Or Enter a Specific Worry / Fear (Optional):</span>
                  <span className={`text-[10px] font-normal ${
                    isLight ? 'text-slate-400' : 'text-rose-400/60'
                  }`}>
                    Overrides selection above if filled
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customDoubt}
                    onChange={(e) => setCustomDoubt(e.target.value)}
                    placeholder="e.g. What if I burn out after 6 months, or team leadership changes?"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 transition-all font-sans ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:ring-rose-400'
                        : 'bg-black/40 border-rose-500/30 text-rose-100 placeholder-rose-400/40 focus:border-rose-400 focus:ring-rose-400'
                    }`}
                  />
                  {customDoubt && (
                    <button
                      type="button"
                      onClick={() => setCustomDoubt('')}
                      className="absolute right-3 top-2.5 text-rose-500 hover:text-rose-700 text-xs font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-rose-300/50'
                }`}>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-black/50 border-rose-500/30'
                }`}>
                  <div>
                    <span className={`text-[10px] font-mono uppercase block ${
                      isLight ? 'text-rose-700' : 'text-rose-300/70'
                    }`}>
                      CONFIDENCE HAIRCUT
                    </span>
                    <div className="flex items-center space-x-2.5 mt-1.5">
                      <span className={`line-through text-base font-mono ${
                        isLight ? 'text-slate-400' : 'text-rose-300/40'
                      }`}>
                        {result.original_confidence}%
                      </span>
                      <ArrowDownRight className="w-4 h-4 text-rose-500" />
                      <span className={`text-2xl font-bold font-mono ${
                        isLight ? 'text-rose-600' : 'text-rose-300'
                      }`}>
                        {result.recalculated_confidence}%
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded border font-bold ${
                    isLight ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {result.confidence_delta}%
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-black/50 border-rose-500/30'
                }`}>
                  <span className={`text-[10px] font-mono uppercase block ${
                    isLight ? 'text-rose-700' : 'text-rose-300/70'
                  }`}>
                    MODEL FRAGILITY VERDICT
                  </span>
                  <div className="mt-1.5">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      isLight
                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>{result.fragility_verdict.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-black/50 border-rose-500/30'
                }`}>
                  <span className={`text-[10px] font-mono uppercase block ${
                    isLight ? 'text-rose-700' : 'text-rose-300/70'
                  }`}>
                    TARGET OPTION UNDER ATTACK
                  </span>
                  <div className="mt-1.5 truncate">
                    <span className={`text-xs font-mono font-bold truncate block ${
                      isLight ? 'text-slate-900' : 'text-rose-200'
                    }`}>
                      {result.attackedOption || targetOption}
                    </span>
                    <span className={`text-[10px] font-mono ${
                      isLight ? 'text-rose-600' : 'text-rose-400/80'
                    }`}>
                      Stress Vector: {result.attack_vector}
                    </span>
                  </div>
                </div>
              </div>

              {/* Devil's Advocate Critique */}
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-rose-50/80 border-rose-200' : 'bg-rose-950/30 border-rose-500/30'
              }`}>
                <div className="flex items-center space-x-2 text-rose-500 font-mono text-xs font-bold uppercase tracking-wider">
                  <Swords className="w-4 h-4" />
                  <span>Devil's Advocate Adversarial Critique:</span>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-line ${
                  isLight ? 'text-slate-800' : 'text-rose-100/90'
                }`}>
                  {result.devil_advocate_critique}
                </p>
                {result.counterArguments && result.counterArguments.length > 0 && (
                  <div className={`pt-2 border-t space-y-1.5 ${
                    isLight ? 'border-rose-200' : 'border-rose-500/20'
                  }`}>
                    <span className={`text-[10px] font-mono uppercase font-bold block ${
                      isLight ? 'text-rose-700' : 'text-rose-300/80'
                    }`}>
                      Contrarian Counter-Arguments:
                    </span>
                    {result.counterArguments.map((ca, i) => (
                      <p key={i} className={`text-xs leading-relaxed font-sans ${
                        isLight ? 'text-slate-700' : 'text-rose-200/90'
                      }`}>
                        • {ca}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* 2-Column Grid: Critical Assumptions & Failure Scenarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Critical Assumptions Under Attack */}
                <div className="space-y-2">
                  <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-1.5 ${
                    isLight ? 'text-slate-800' : 'text-rose-300/90'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span>Critical Assumptions Under Fire:</span>
                  </span>
                  <div className="space-y-2">
                    {(result.criticalAssumptions || result.vulnerabilities).map((v, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs flex items-start space-x-2 font-sans ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-black/40 border-rose-500/25 text-rose-100/90'
                        }`}
                      >
                        <span className="text-rose-500 font-bold mt-0.5 shrink-0">⚠️</span>
                        <span className="leading-relaxed">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific Failure Scenarios */}
                <div className="space-y-2">
                  <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-1.5 ${
                    isLight ? 'text-slate-800' : 'text-rose-300/90'
                  }`}>
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>Downside Failure Scenarios:</span>
                  </span>
                  <div className="space-y-2">
                    {(result.failureScenarios && result.failureScenarios.length > 0
                      ? result.failureScenarios
                      : [
                          `Lock-In Trap: Switching costs escalate if unexpected friction arises within 12 months.`,
                          `Opportunity Cost: Alternative path outperforms while energy is tied down.`
                        ]
                    ).map((fs, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs flex items-start space-x-2 font-sans ${
                          isLight
                            ? 'bg-rose-50/50 border-rose-200 text-slate-800'
                            : 'bg-rose-950/20 border-rose-500/25 text-rose-100/90'
                        }`}
                      >
                        <span className="text-rose-500 font-bold mt-0.5 shrink-0">⚡</span>
                        <span className="leading-relaxed">{fs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation Questions to Interrogate */}
              {result.questionsToValidate && result.questionsToValidate.length > 0 && (
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-rose-500/25'
                }`}>
                  <span className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-1.5 ${
                    isLight ? 'text-slate-800' : 'text-rose-300'
                  }`}>
                    <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Interrogation Questions Before You Commit:</span>
                  </span>
                  <div className="space-y-1.5">
                    {result.questionsToValidate.map((q, i) => (
                      <p key={i} className={`text-xs font-sans leading-relaxed ${
                        isLight ? 'text-slate-700' : 'text-rose-200/90'
                      }`}>
                        <span className="text-rose-500 font-mono font-bold mr-1.5">Q{i + 1}:</span>
                        {q}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Alternative Scenario */}
              {result.alternative_scenario && (
                <div className={`p-4 rounded-2xl border text-xs font-mono space-y-1 ${
                  isLight ? 'bg-rose-50/70 border-rose-200 text-slate-800' : 'bg-black/30 border-rose-500/20 text-rose-200/80'
                }`}>
                  <span className="text-[10px] text-rose-500 uppercase font-bold block">
                    ✦ STRATEGIC PIVOT SAFEGUARD:
                  </span>
                  <p className={`font-sans ${
                    isLight ? 'text-slate-800' : 'text-rose-100'
                  }`}>
                    {result.alternative_scenario}
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-full border text-xs font-mono transition-colors flex items-center justify-center space-x-2 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-black/40 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Another Stress Angle</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white border border-rose-400 text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/20"
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

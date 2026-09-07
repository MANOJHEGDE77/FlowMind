import React, { useState } from 'react';
import {
  Swords, X, Flame, ShieldAlert, ArrowDownRight,
  AlertTriangle, RefreshCw, CheckCircle2, ArrowRight
} from 'lucide-react';
import { ChallengeResult, Decision } from '../types';
import { api } from '../services/api';

interface ChallengeWorkspaceProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Decision) => void;
}

export const ChallengeWorkspace: React.FC<ChallengeWorkspaceProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [focusArea, setFocusArea] = useState<string>('untested career assumptions');
  const [isLoading, setIsLoading] = useState(false);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);

  if (!isOpen) return null;

  const handleRunChallenge = async () => {
    try {
      setIsLoading(true);
      const res = await api.challengeDecision(decision.id, {
        target_recommendation: decision.recommendation,
        focus_area: focusArea,
      });
      setChallengeResult(res);
      const fresh = await api.getDecision(decision.id);
      onSuccess(fresh);
    } catch (err: any) {
      alert(err.message || 'Challenge failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl bg-[var(--bg-surface)] border border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Adversarial Banner */}
        <div className="px-6 py-4 border-b border-rose-500/20 bg-rose-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
                ⚔️ Adversarial Stress-Test Engine
              </h3>
              <p className="text-[11px] text-rose-300/80">
                Devil's Advocate is actively attempting to disprove the leading recommendation
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

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {!challengeResult ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
                Targeting recommendation:{' '}
                <strong className="text-[var(--text-primary)] font-medium">"{decision.recommendation}"</strong>.
                FlowMind will search for confirmation bias, hidden liabilities, and stress-test whether your stated priorities actually match this path.
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-2">
                  Select Attack Vector Focus
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    'untested career assumptions',
                    'hidden liabilities & burnout friction',
                    'reversibility & lock-in traps',
                    'financial discount rate fragility'
                  ].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setFocusArea(area)}
                      className={`p-3 rounded-xl border text-xs text-left capitalize transition-all ${
                        focusArea === area
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-medium ring-1 ring-rose-500/30'
                          : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-active)]'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRunChallenge}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50 font-mono"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Attacking Assumptions & Re-evaluating Evidence...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4" />
                      <span>Execute Adversarial Challenge</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Confidence Recalibration Delta */}
              <div className="bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    CONFIDENCE RECALIBRATION
                  </div>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className="text-xl font-mono text-[var(--text-muted)] line-through">
                      {challengeResult.original_confidence}%
                    </span>
                    <ArrowDownRight className="w-5 h-5 text-rose-400" />
                    <span className="text-2xl font-mono font-bold text-rose-400">
                      {challengeResult.recalculated_confidence}%
                    </span>
                    <span className="text-xs font-mono text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/20">
                      {challengeResult.confidence_delta}% haircut
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    FRAGILITY VERDICT
                  </div>
                  <span className="inline-block mt-1 text-xs font-mono font-medium px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {challengeResult.fragility_verdict}
                  </span>
                </div>
              </div>

              {/* Devil's Advocate Confrontation */}
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold font-mono">
                  <Flame className="w-4 h-4" />
                  <span>COUNTER-ARGUMENT & CONFIRMATION BIAS ATTACK</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                  {challengeResult.devil_advocate_critique}
                </p>
              </div>

              {/* Surface Vulnerabilities */}
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>ASSUMPTIONS DETECTED UNDER SCRUTINY</span>
                </div>
                <div className="space-y-1.5">
                  {challengeResult.vulnerabilities.map((vuln, i) => (
                    <div
                      key={i}
                      className="bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] p-3 rounded-xl text-xs text-[var(--text-secondary)] flex items-start space-x-2"
                    >
                      <span className="text-rose-400 font-bold shrink-0">•</span>
                      <span>{vuln}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Counter-Scenario */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)] block mb-1">
                  Contrarian Pivot Condition:
                </strong>
                {challengeResult.alternative_scenario}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border-subtle)] transition-colors"
                >
                  Return to Decision Space
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

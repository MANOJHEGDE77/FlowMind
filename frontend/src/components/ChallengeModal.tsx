import React, { useState } from 'react';
import {
  Swords, X, Flame, ShieldAlert, ArrowDownRight,
  CheckCircle2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { ChallengeResult, Decision } from '../types';
import { api } from '../services/api';

interface ChallengeModalProps {
  decision: Decision;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDecision: Decision) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [focusArea, setFocusArea] = useState<string>('untested assumptions');
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
      // Fetch fresh decision to update canvas
      const fresh = await api.getDecision(decision.id);
      onSuccess(fresh);
    } catch (err: any) {
      alert(err.message || 'Failed to challenge decision');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-space-900 border border-rose-500/30 rounded-2xl shadow-modal-depth overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-rose-500/5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                ⚔️ Challenge My Decision
              </h3>
              <p className="text-xs text-rose-300/80">
                Devil's Advocate Adversarial Stress-Test Engine
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

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {!challengeResult ? (
            <div className="space-y-4">
              <div className="bg-space-950/60 border border-space-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
                The Devil's Advocate agent will actively attack your current recommendation:{' '}
                <strong className="text-white font-medium">"{decision.recommendation}"</strong>.
                It searches for fragile assumptions, confirmation bias, hidden liabilities, and stress-tests your confidence rating.
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Select Attack Vector Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'untested assumptions',
                    'hidden liabilities & burnout',
                    'career stagnation traps',
                    'financial discount risk'
                  ].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setFocusArea(area)}
                      className={`p-2.5 rounded-lg border text-xs text-left capitalize transition-all ${
                        focusArea === area
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                          : 'bg-space-850/60 border-space-800 text-slate-400 hover:border-space-700'
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
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Simulating Adversarial Attack...</span>
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
              {/* Confidence Recalibration Delta Card */}
              <div className="bg-space-950/80 border border-space-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                    Confidence Recalibration
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xl font-mono text-slate-400 line-through">
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
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Model Fragility
                  </div>
                  <span className="inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {challengeResult.fragility_verdict}
                  </span>
                </div>
              </div>

              {/* Devil's Advocate Critique */}
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-rose-400 mb-2">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                    Devil's Advocate Confrontation
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {challengeResult.devil_advocate_critique}
                </p>
              </div>

              {/* Surface Vulnerabilities */}
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Uncovered Vulnerabilities & Blindspots</span>
                </div>
                <div className="space-y-1.5">
                  {challengeResult.vulnerabilities.map((vuln, i) => (
                    <div
                      key={i}
                      className="bg-space-950/60 border border-space-800 p-2.5 rounded-lg text-xs text-slate-300 flex items-start space-x-2"
                    >
                      <span className="text-rose-400 font-bold shrink-0">•</span>
                      <span>{vuln}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Counter-Scenario */}
              <div className="bg-space-850/60 border border-space-800 p-3.5 rounded-xl text-xs text-slate-300">
                <strong className="text-slate-200 block mb-1">
                  Contrarian Pivot Condition:
                </strong>
                {challengeResult.alternative_scenario}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-space-800 hover:bg-space-700 text-white text-xs font-medium transition-colors"
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

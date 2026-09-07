import React, { useState } from 'react';
import {
  Swords, X, Flame, ShieldAlert, ArrowDownRight,
  AlertTriangle, RefreshCw, ArrowRight
} from 'lucide-react';
import { ChallengeResult, Decision } from '../types';
import { api } from '../services/api';

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
  const [focusArea, setFocusArea] = useState<string>('salary vs growth weighting');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);

  if (!isOpen) return null;

  const handleRunRedTeam = async () => {
    try {
      setIsLoading(true);
      const res = await api.challengeDecision(decision.id, {
        target_recommendation: decision.recommendation,
        focus_area: focusArea,
      });
      setResult(res);
      const fresh = await api.getDecision(decision.id);
      onSuccess(fresh);
    } catch (err: any) {
      alert(err.message || 'Red team attack failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-red-950/70 backdrop-blur-2xl select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl space-y-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-rose-400/80 hover:text-white text-xs font-mono"
        >
          [ESC to exit red team mode]
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold tracking-widest uppercase">
            <Swords className="w-3.5 h-3.5" />
            <span>RED TEAM INTERROGATION MODE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
            Stress-Testing: "{decision.recommendation}"
          </h1>
          <p className="text-xs text-rose-200/70 max-w-lg mx-auto font-sans">
            The Devil's Advocate is systematically testing vulnerabilities to ensure your conviction isn't confirmation bias.
          </p>
        </div>

        {!result ? (
          <div className="space-y-4 max-w-lg mx-auto pt-2">
            <div className="text-xs font-mono text-rose-300/80 uppercase tracking-wider text-left">
              SELECT ATTACK FOCUS:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                'salary vs growth weighting',
                'burnout & operational friction',
                'team leadership attrition',
                'discount rate & opportunity cost'
              ].map((area) => (
                <button
                  key={area}
                  onClick={() => setFocusArea(area)}
                  className={`p-2.5 rounded-xl border text-xs font-mono text-left transition-all ${
                    focusArea === area
                      ? 'bg-rose-500/30 border-rose-400 text-white shadow-lg'
                      : 'bg-black/30 border-rose-500/20 text-rose-300/80 hover:border-rose-400/50'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunRedTeam}
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-mono font-semibold text-xs shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Attacking Prevailing Assumptions...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5" />
                  <span>Execute Red Team Adversarial Attack</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Red Team Outcome: Linear Argument Chain */
          <div className="space-y-4 max-w-xl mx-auto pt-2 text-left font-mono text-xs animate-in fade-in">
            {/* Recalibration */}
            <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-300/60 uppercase block">
                  CONFIDENCE HAIRCUT
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="line-through text-rose-300/50 text-base">
                    {result.original_confidence}%
                  </span>
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span className="text-xl font-bold text-rose-300">
                    {result.recalculated_confidence}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-rose-300/60 uppercase block">
                  MODEL FRAGILITY
                </span>
                <span className="text-xs font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 inline-block mt-1">
                  {result.fragility_verdict}
                </span>
              </div>
            </div>

            {/* Counter-Argument */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1.5 font-sans">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                DEVIL'S ADVOCATE COUNTER-ARGUMENT:
              </span>
              <p className="text-xs text-rose-100/90 leading-relaxed">
                {result.devil_advocate_critique}
              </p>
            </div>

            {/* Uncovered Vulnerabilities */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase text-rose-400 font-bold block">
                DETECTED VULNERABLE ASSUMPTIONS:
              </span>
              {result.vulnerabilities.map((v, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-black/30 border border-rose-500/20 text-xs text-rose-200/90 flex items-start space-x-2 font-sans">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 font-mono text-xs transition-colors"
              >
                Return to Decision Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

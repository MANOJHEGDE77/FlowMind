import React, { useState } from 'react';
import {
  Sparkles, ArrowRight, Plus, Target, Shield,
  Layers, UploadCloud, X, Check, RefreshCw
} from 'lucide-react';

interface ConversationalComposerProps {
  onSubmit: (data: {
    title: string;
    context: string;
    options: Array<{ title: string; description?: string }>;
    goals?: Array<{ description: string; priority: string; weight: number }>;
    constraints?: Array<{ description: string; severity: string }>;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const ConversationalComposer: React.FC<ConversationalComposerProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [step, setStep] = useState<number>(1);
  const [dilemma, setDilemma] = useState('');
  const [priorities, setPriorities] = useState<string[]>([
    'Compounding career growth & learning velocity',
    'High long-term equity / financial upside',
  ]);
  const [newPriority, setNewPriority] = useState('');
  const [options, setOptions] = useState<string[]>([
    'Option A: High-Growth Startup Lead',
    'Option B: BigTech Staff Track',
  ]);
  const [newOption, setNewOption] = useState('');
  const [constraints, setConstraints] = useState<string[]>([
    'Decision required within 14 days',
    'Must maintain work-life health sustainability',
  ]);
  const [newConstraint, setNewConstraint] = useState('');

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleFinalSubmit = async () => {
    if (!dilemma.trim()) return;

    await onSubmit({
      title: dilemma.slice(0, 75) + (dilemma.length > 75 ? '...' : ''),
      context: dilemma,
      options: options.map(opt => ({ title: opt, description: `Evaluation pathway for ${opt}` })),
      goals: priorities.map(p => ({ description: p, priority: 'high', weight: 1.2 })),
      constraints: constraints.map(c => ({ description: c, severity: 'hard' })),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto select-none">
      <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl transition-all">
        {/* Step Progress Dots */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold tracking-wider">
              COGNITIVE COMPOSER • STEP {step} OF 4
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`w-5 h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'bg-sky-400 w-8'
                    : s < step
                    ? 'bg-emerald-400/80'
                    : 'bg-[var(--border-subtle)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: What are you deciding? */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                What are you trying to figure out?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Begin with a thought, offer, dilemma, or question in your own words.
              </p>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={dilemma}
                onChange={(e) => setDilemma(e.target.value)}
                placeholder="e.g. 'Should I accept the Senior Offer at the Series B startup, continue leading the engineering team at BigTech, or start a self-funded venture?'"
                className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-sky-400/70 rounded-xl p-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none leading-relaxed transition-all"
                autoFocus
              />
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-[var(--text-muted)] self-center mr-1">
                PROMPTS:
              </span>
              {[
                'Startup Offer vs BigTech Principal vs MBA',
                'Relocate to SF Bay Area vs Stay Remote in NY',
                'Bootstrap SaaS vs Raise Seed Round from VC',
              ].map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDilemma(example)}
                  className="text-xs bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Press next to define what matters most
              </span>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!dilemma.trim()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-space-950 font-medium text-xs shadow-md transition-all disabled:opacity-40"
              >
                <span>Define Priorities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: What matters most? */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                What matters most in this choice?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                State your goals, non-negotiables, or success criteria so the agents weight options accurately.
              </p>
            </div>

            <div className="space-y-2">
              {priorities.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                >
                  <span className="flex items-center space-x-2 truncate">
                    <Target className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{p}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPriorities(priorities.filter((_, idx) => idx !== i))}
                    className="text-[var(--text-muted)] hover:text-rose-400 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add custom priority */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Add another goal (e.g. 'Preserve autonomy and low bureaucracy')..."
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPriority.trim()) {
                      e.preventDefault();
                      setPriorities([...priorities, newPriority.trim()]);
                      setNewPriority('');
                    }
                  }}
                  className="flex-1 bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-400/60"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPriority.trim()) {
                      setPriorities([...priorities, newPriority.trim()]);
                      setNewPriority('');
                    }
                  }}
                  className="px-3 py-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg text-xs font-medium border border-[var(--border-subtle)]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Back to dilemma
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-space-950 font-medium text-xs shadow-md transition-all"
              >
                <span>Specify Options</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Competing Options */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                What options are on the table?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                List each competing pathway or alternative you want the AI council to benchmark.
              </p>
            </div>

            <div className="space-y-2">
              {options.map((opt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                >
                  <span className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-medium truncate">{opt}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                    className="text-[var(--text-muted)] hover:text-rose-400 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Add another option (e.g. 'Option C: Self-Funded Bootstrapped Venture')..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newOption.trim()) {
                      e.preventDefault();
                      setOptions([...options, newOption.trim()]);
                      setNewOption('');
                    }
                  }}
                  className="flex-1 bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-400/60"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newOption.trim()) {
                      setOptions([...options, newOption.trim()]);
                      setNewOption('');
                    }
                  }}
                  className="px-3 py-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg text-xs font-medium border border-[var(--border-subtle)]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Back to priorities
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={options.length < 2}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-space-950 font-medium text-xs shadow-md transition-all disabled:opacity-40"
              >
                <span>Constraints & Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Constraints & Review */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                Any hard constraints or unstated risks?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Deadlines, family considerations, or boundaries the Devil's Advocate should respect.
              </p>
            </div>

            <div className="space-y-2">
              {constraints.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]"
                >
                  <span className="flex items-center space-x-2 truncate">
                    <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{c}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setConstraints(constraints.filter((_, idx) => idx !== i))}
                    className="text-[var(--text-muted)] hover:text-rose-400 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Add constraint (e.g. 'Must avoid relocate outside NY')..."
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newConstraint.trim()) {
                      e.preventDefault();
                      setConstraints([...constraints, newConstraint.trim()]);
                      setNewConstraint('');
                    }
                  }}
                  className="flex-1 bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-400/60"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newConstraint.trim()) {
                      setConstraints([...constraints, newConstraint.trim()]);
                      setNewConstraint('');
                    }
                  }}
                  className="px-3 py-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg text-xs font-medium border border-[var(--border-subtle)]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Launch AI Council Button */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Back to options
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-space-950 font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Convening AI Council...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Synthesize Decision Space</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowRight, Plus, Target, Shield,
  Layers, UploadCloud, X, RefreshCw, Sparkles
} from 'lucide-react';
import { DecisionListItem } from '../types';

interface ThoughtComposerProps {
  onSubmit: (data: {
    title: string;
    context: string;
    options: Array<{ title: string; description?: string }>;
    goals?: Array<{ description: string; priority: string; weight: number }>;
    constraints?: Array<{ description: string; severity: string }>;
  }) => Promise<void>;
  isAnalyzing: boolean;
  onInputChange: (text: string) => void;
  recentDecisions: DecisionListItem[];
  onSelectDecision: (id: number) => void;
}

export const ThoughtComposer: React.FC<ThoughtComposerProps> = ({
  onSubmit,
  isAnalyzing,
  onInputChange,
  recentDecisions,
  onSelectDecision,
}) => {
  const [dilemma, setDilemma] = useState('');
  const [stage, setStage] = useState<'prompt' | 'priorities' | 'options' | 'constraints'>('prompt');

  // Interactive floating priorities
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Career Velocity & Learning',
    'Long-Term Equity / Financial Upside',
  ]);
  const availablePriorities = [
    'Career Velocity & Learning',
    'Long-Term Equity / Financial Upside',
    'Autonomy & Cultural Agency',
    'Preserve Work-Life Sustainability',
    'Exit Optionality & Mobility',
    'Team Quality & Mentorship',
  ];

  // Interactive floating options
  const [options, setOptions] = useState<string[]>([
    'Series B High-Growth Startup Lead',
    'BigTech Principal Track',
  ]);
  const [customOptionInput, setCustomOptionInput] = useState('');

  // Constraints
  const [constraints, setConstraints] = useState<string[]>([
    'Decision required within 14 days',
  ]);
  const [customConstraintInput, setCustomConstraintInput] = useState('');

  const handleDilemmaChange = (val: string) => {
    setDilemma(val);
    onInputChange(val);
  };

  const togglePriority = (p: string) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(selectedPriorities.filter(item => item !== p));
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handleAddOption = () => {
    if (customOptionInput.trim()) {
      setOptions([...options, customOptionInput.trim()]);
      setCustomOptionInput('');
    }
  };

  const handleLaunchSynthesis = async () => {
    if (!dilemma.trim()) return;

    await onSubmit({
      title: dilemma.slice(0, 80) + (dilemma.length > 80 ? '...' : ''),
      context: dilemma,
      options: options.map(o => ({ title: o, description: `Evaluation path for ${o}` })),
      goals: selectedPriorities.map(p => ({ description: p, priority: 'high', weight: 1.2 })),
      constraints: constraints.map(c => ({ description: c, severity: 'hard' })),
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 z-10 select-none">
      {/* Background Ambient Floating Thinking Prompts (Spatially positioned, borderless) */}
      <div className="absolute top-28 left-8 hidden lg:block opacity-40 hover:opacity-90 transition-opacity">
        <span className="text-[10px] font-mono text-[var(--text-faint)] uppercase block tracking-wider mb-1">
          Recent Observation
        </span>
        <p className="text-xs text-[var(--text-body)] max-w-xs font-serif italic">
          "The fastest route to asymmetric upside is through high-learning velocity roles."
        </p>
      </div>

      <div className="absolute top-36 right-10 hidden lg:block opacity-40 hover:opacity-90 transition-opacity text-right">
        <span className="text-[10px] font-mono text-[var(--text-faint)] uppercase block tracking-wider mb-1">
          Active Reasoning Signal
        </span>
        <p className="text-xs text-[var(--text-body)] max-w-xs font-mono">
          7 Agents awaiting unstructured thought input...
        </p>
      </div>

      {/* Centerpiece: Borderless Living Thought Composer */}
      <div className="w-full max-w-2xl text-center space-y-6">
        {/* Stage 1: The Core Dilemma */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold block">
            {stage === 'prompt' ? "WHAT'S ON YOUR MIND?" : 'THINKING ABOUT'}
          </span>

          {stage === 'prompt' ? (
            <div className="space-y-4">
              <textarea
                rows={2}
                value={dilemma}
                onChange={(e) => handleDilemmaChange(e.target.value)}
                placeholder="Tell FlowMind what you're trying to figure out..."
                className="w-full bg-transparent text-xl sm:text-3xl font-serif text-[var(--text-vivid)] placeholder-[var(--text-faint)] placeholder:font-serif focus:outline-none resize-none leading-relaxed text-center tracking-tight border-b border-transparent focus:border-[var(--line-active)] pb-2 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && dilemma.trim()) {
                    e.preventDefault();
                    setStage('priorities');
                  }
                }}
              />

              {/* Action triggers below input */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-[var(--text-body)]">
                <button
                  type="button"
                  onClick={() => setStage('priorities')}
                  disabled={!dilemma.trim()}
                  className="px-4 py-2 rounded-full bg-sky-400 hover:bg-sky-300 text-space-950 font-semibold shadow-lg shadow-sky-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-30"
                >
                  <span>Start thinking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2 text-[11px] text-[var(--text-faint)]">
                  <span className="cursor-pointer hover:text-[var(--text-vivid)]" onClick={() => setStage('priorities')}>
                    + priorities
                  </span>
                  <span>•</span>
                  <span className="cursor-pointer hover:text-[var(--text-vivid)]" onClick={() => setStage('options')}>
                    + options
                  </span>
                  <span>•</span>
                  <span className="cursor-pointer hover:text-[var(--text-vivid)]" onClick={() => setStage('constraints')}>
                    + constraints
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl font-serif text-[var(--text-vivid)] max-w-xl mx-auto italic">
              "{dilemma}"
            </h1>
          )}
        </div>

        {/* Stage 2: What matters most? (Appears conversationally) */}
        {stage === 'priorities' && (
          <div className="pt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-mono uppercase text-[var(--text-faint)] tracking-wider block">
              WHAT MATTERS MOST TO YOU?
            </span>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {availablePriorities.map((p) => {
                const isSelected = selectedPriorities.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-400/50 shadow-sm'
                        : 'bg-[var(--canvas-subtle)] text-[var(--text-body)] border border-[var(--line-color)] hover:border-[var(--line-active)]'
                    }`}
                  >
                    {isSelected ? `✓ ${p}` : `+ ${p}`}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 flex justify-center space-x-3">
              <button
                onClick={() => setStage('options')}
                className="px-4 py-1.5 rounded-full bg-[var(--canvas-subtle)] hover:bg-sky-400 hover:text-space-950 text-xs font-mono text-[var(--text-body)] border border-[var(--line-color)] transition-all flex items-center space-x-1.5"
              >
                <span>Define Options</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Competing Pathways */}
        {stage === 'options' && (
          <div className="pt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-mono uppercase text-[var(--text-faint)] tracking-wider block">
              COMPETING PATHWAYS UNDER EVALUATION
            </span>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {options.map((opt, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-xs font-mono text-[var(--text-vivid)] flex items-center space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{opt}</span>
                  <button
                    onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                    className="text-[var(--text-faint)] hover:text-rose-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-2 max-w-md mx-auto pt-1">
              <input
                type="text"
                placeholder="Add another option..."
                value={customOptionInput}
                onChange={(e) => setCustomOptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                className="bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-full px-3 py-1.5 text-xs text-[var(--text-vivid)] placeholder-[var(--text-faint)] focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={handleAddOption}
                className="px-3 py-1.5 bg-sky-400 text-space-950 font-semibold rounded-full text-xs font-mono"
              >
                Add
              </button>
            </div>

            <div className="pt-3 flex justify-center space-x-3">
              <button
                onClick={() => setStage('constraints')}
                className="px-4 py-1.5 rounded-full bg-[var(--canvas-subtle)] hover:bg-sky-400 hover:text-space-950 text-xs font-mono text-[var(--text-body)] border border-[var(--line-color)] transition-all flex items-center space-x-1.5"
              >
                <span>Add Constraints & Launch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Constraints & Launch */}
        {stage === 'constraints' && (
          <div className="pt-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-mono uppercase text-[var(--text-faint)] tracking-wider block">
              NON-NEGOTIABLES & DEADLINES
            </span>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {constraints.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-xs font-mono text-[var(--text-body)] flex items-center space-x-1.5"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>{c}</span>
                </span>
              ))}
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleLaunchSynthesis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-space-950 font-semibold text-xs font-mono shadow-xl shadow-sky-400/20 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Orchestrating 7 Agents in Debate...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Convene AI Council & Synthesize Space</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Suggested Thinking Seeds if on prompt */}
        {stage === 'prompt' && (
          <div className="pt-6 space-y-2">
            <span className="text-[10px] font-mono text-[var(--text-faint)] tracking-wider uppercase block">
              OR EXPLORE AN UNRESOLVED DILEMMA
            </span>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {[
                'Startup Lead vs BigTech Staff vs Bootstrapped Venture',
                'Relocate to San Francisco vs Stay in New York Remote',
                'Accept Promotion vs Pivot to Frontier AI Research',
              ].map((seed, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDilemmaChange(seed)}
                  className="text-[11px] font-mono text-[var(--text-faint)] hover:text-[var(--text-vivid)] transition-colors underline underline-offset-4 decoration-[var(--line-color)] hover:decoration-sky-400"
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle Spatially Positioned Unresolved Decisions at bottom */}
      {recentDecisions.length > 0 && (
        <div className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center space-x-4 px-4 py-2 rounded-full bg-[var(--surface-blur)] backdrop-blur-md border border-[var(--line-color)] text-[11px] font-mono text-[var(--text-faint)]">
            <span>RESUME THINKING:</span>
            {recentDecisions.slice(0, 2).map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDecision(d.id)}
                className="hover:text-sky-400 transition-colors truncate max-w-[200px]"
              >
                {d.title} ({d.confidence_score}%)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

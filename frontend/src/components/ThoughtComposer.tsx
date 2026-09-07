import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Plus, Shield, Sparkles, RefreshCw, X, History, ChevronRight, Wand2
} from 'lucide-react';
import { DecisionListItem } from '../types';
import { api } from '../services/api';

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
  onFocusChange?: (focused: boolean) => void;
  onPrioritiesChange?: (priorities: string[]) => void;
  recentDecisions: DecisionListItem[];
  onSelectDecision: (id: number) => void;
}

const AVAILABLE_PRIORITIES = [
  'Career Velocity & Learning',
  'Long-Term Equity / Financial Upside',
  'Autonomy & Cultural Agency',
  'Work-Life Sustainability',
  'Exit Optionality & Mobility',
  'Mentorship & Team Density',
];

export const ThoughtComposer: React.FC<ThoughtComposerProps> = ({
  onSubmit,
  isAnalyzing,
  onInputChange,
  onFocusChange,
  onPrioritiesChange,
  recentDecisions,
  onSelectDecision,
}) => {
  const [dilemma, setDilemma] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [stage, setStage] = useState<'prompt' | 'priorities' | 'options' | 'constraints'>('prompt');

  // Interactive floating priorities (clean slate: user chooses)
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  // Real Options (clean slate: no fake pre-seeded offers)
  const [options, setOptions] = useState<string[]>([]);
  const [customOption, setCustomOption] = useState('');

  // Real Constraints (clean slate: no fake 14-day limit)
  const [constraints, setConstraints] = useState<string[]>([]);
  const [customConstraint, setCustomConstraint] = useState('');

  // Hovered memory fragment
  const [hoveredMemory, setHoveredMemory] = useState<DecisionListItem | null>(null);

  // Sync priorities with parent for constellation reaction
  useEffect(() => {
    onPrioritiesChange?.(selectedPriorities);
  }, [selectedPriorities, onPrioritiesChange]);

  // Real-time automatic extraction from typed dilemma
  const autoExtractedOptions = useMemo(() => {
    if (!dilemma.trim()) return [];
    const cleaned = dilemma
      .replace(/^(should i|shall i|what if i|i need to decide between|deciding between|help me decide between)\s+/i, '')
      .replace(/\?+$/, '')
      .trim();
    const parts = cleaned
      .split(/\s+vs\.?\s+|\s+versus\s+|\s+or\s+|,\s*/i)
      .map(s => s.trim())
      .filter(s => s.length > 1 && !['accept', 'choose', 'between', 'the', 'and', 'my', 'to', 'a', 'an'].includes(s.toLowerCase()));

    if (parts.length >= 2) return parts.slice(0, 4);
    if (parts.length === 1 && parts[0].length > 3) return [parts[0], 'Maintain Current Trajectory'];
    return [];
  }, [dilemma]);

  const effectiveOptions = useMemo(() => {
    if (options.length > 0) return options;
    if (autoExtractedOptions.length > 0) return autoExtractedOptions;
    return [];
  }, [options, autoExtractedOptions]);

  const handleTextChange = (text: string) => {
    setDilemma(text);
    onInputChange(text);
  };

  const togglePriority = (p: string) => {
    let next: string[];
    if (selectedPriorities.includes(p)) {
      next = selectedPriorities.filter(item => item !== p);
    } else {
      next = [...selectedPriorities, p];
    }
    setSelectedPriorities(next);
  };

  const handleAddOption = () => {
    if (customOption.trim()) {
      setOptions([...options, customOption.trim()]);
      setCustomOption('');
    }
  };

  const handleAddConstraint = () => {
    if (customConstraint.trim()) {
      setConstraints([...constraints, customConstraint.trim()]);
      setCustomConstraint('');
    }
  };

  const [isSuggestingOptions, setIsSuggestingOptions] = useState(false);
  const [suggestedOptionsList, setSuggestedOptionsList] = useState<Array<{ title: string; description: string }>>([]);

  const handleFetchSuggestedOptions = async () => {
    if (!dilemma.trim()) return;
    try {
      setIsSuggestingOptions(true);
      const res = await api.suggestOptions(dilemma);
      if (res.options && res.options.length > 0) {
        setSuggestedOptionsList(res.options);
        const titles = res.options.map(o => o.title);
        setOptions(titles);
        if (res.goals && res.goals.length > 0 && selectedPriorities.length === 0) {
          setSelectedPriorities(res.goals.map(g => g.description));
        }
        setStage('options');
      }
    } catch (e: any) {
      console.error('Failed to suggest options:', e);
    } finally {
      setIsSuggestingOptions(false);
    }
  };

  const handleLaunchSynthesis = async () => {
    if (!dilemma.trim()) return;

    await onSubmit({
      title: dilemma.slice(0, 80) + (dilemma.length > 80 ? '...' : ''),
      context: dilemma,
      options: effectiveOptions.map(o => ({ title: o, description: `Pathway evaluating ${o}` })),
      goals: selectedPriorities.map(p => ({ description: p, priority: 'high', weight: 1.2 })),
      constraints: constraints.map(c => ({ description: c, severity: 'hard' })),
    });
  };

  // Dynamic concept extraction from typed thought
  const extractedConcepts = dilemma
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['should', 'about', 'what', 'which', 'with', 'from', 'this', 'that', 'have'].includes(w))
    .slice(0, 4);

  const latestMemory = recentDecisions.length > 0 ? recentDecisions[0] : null;

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 z-20 select-none">
      {/* Radial soft illumination behind central thought */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[600px] h-[450px] rounded-full transition-opacity duration-1000 ${
            isFocused ? 'opacity-90' : 'opacity-40'
          } thinking-halo`}
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl text-center space-y-7 relative z-10">
        {/* System Hierarchy Header */}
        <div className="space-y-1.5">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2"
          >
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              ✦ {dilemma ? 'THINKING ABOUT' : 'START A DECISION'}
            </span>
          </motion.div>

          {!dilemma && (
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              Describe what you're trying to figure out in plain language. FlowMind will deconstruct it into a structured decision model.
            </p>
          )}

          {/* Central User Thought (Stylized Glassmorphic Cognitive Capsule) */}
          <div className="relative pt-2">
            {stage === 'prompt' ? (
              <div className="relative flex flex-col items-center w-full">
                {/* Stylized Glassmorphic Thought Capsule */}
                <div
                  className={`w-full max-w-xl mx-auto rounded-3xl p-5 sm:p-6 bg-slate-950/40 backdrop-blur-2xl border transition-all duration-300 relative group shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
                    isFocused
                      ? 'border-cyan-400/40 shadow-[0_0_35px_rgba(0,240,255,0.12)] ring-1 ring-cyan-400/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <textarea
                    rows={2}
                    value={dilemma}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onFocus={() => {
                      setIsFocused(true);
                      onFocusChange?.(true);
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                      onFocusChange?.(false);
                    }}
                    placeholder="What are you looking to decide?"
                    className="w-full bg-transparent text-base sm:text-xl font-sans font-normal text-white placeholder-slate-500/80 not-italic placeholder:not-italic focus:outline-none resize-none leading-relaxed text-center tracking-tight pb-1 transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && dilemma.trim()) {
                        e.preventDefault();
                        setStage('priorities');
                      }
                    }}
                  />

                  {/* Micro Helper Bar inside capsule */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Natural Language Decision Modeler</span>
                    </span>
                    {dilemma ? (
                      <span className="text-cyan-400/80">Press ↵ to structure</span>
                    ) : (
                      <span className="text-slate-500">Describe any ambition or choice</span>
                    )}
                  </div>
                </div>

                {/* Quick Inspiration Pills when empty */}
                {!dilemma && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] font-mono">
                    <span className="text-slate-500 text-[10px] mr-1">TRY:</span>
                    {[
                      'I want to become an AI engineer',
                      'Startup Offer vs BigTech Principal',
                      'Bootstrap SaaS vs Raise Seed Capital',
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTextChange(sample)}
                        className="px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all cursor-pointer text-[10px]"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dynamic concept extraction floating badges */}
                {extractedConcepts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center space-x-2 pt-2"
                  >
                    {extractedConcepts.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-300/80"
                      >
                        ✦ {kw}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Action triggers below input */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-5 text-xs font-mono text-slate-400">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStage('priorities')}
                    disabled={!dilemma.trim()}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Begin Structuring</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleFetchSuggestedOptions}
                    disabled={!dilemma.trim() || isSuggestingOptions}
                    className="px-4 py-2.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 transition-all flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Let FlowMind AI deconstruct your ambition into competing pathways"
                  >
                    {isSuggestingOptions ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                        <span>Mapping Pathways...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>✨ Suggest Pathways with AI</span>
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span
                      className="cursor-pointer hover:text-cyan-300 transition-colors"
                      onClick={() => setStage('priorities')}
                    >
                      + priorities
                    </span>
                    <span>•</span>
                    <span
                      className="cursor-pointer hover:text-cyan-300 transition-colors"
                      onClick={() => setStage('options')}
                    >
                      + options
                    </span>
                    <span>•</span>
                    <span
                      className="cursor-pointer hover:text-cyan-300 transition-colors"
                      onClick={() => setStage('constraints')}
                    >
                      + constraints
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <h1 className="text-2xl sm:text-3xl font-sans font-medium text-white max-w-xl mx-auto not-italic leading-snug drop-shadow-sm">
                  "{dilemma}"
                </h1>
                <button
                  onClick={() => setStage('prompt')}
                  className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline underline-offset-4 decoration-slate-700"
                >
                  Edit thought
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stage 2: What matters most? (Pill-shaped priorities with spring animation) */}
        {stage === 'priorities' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 space-y-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-widest font-semibold block">
                WHAT MATTERS MOST TO YOU?
              </span>
              <p className="text-[11px] font-mono text-slate-400">
                Selected priorities will form topological axes in your decision space
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {AVAILABLE_PRIORITIES.map((p) => {
                const isSelected = selectedPriorities.includes(p);
                return (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => togglePriority(p)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-medium'
                        : 'bg-[var(--canvas-subtle)] text-slate-400 border border-[var(--line-color)] hover:border-slate-500'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{p}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-3 flex justify-center space-x-3">
              <button
                onClick={() => setStage('options')}
                className="px-4 py-1.5 rounded-full bg-[var(--canvas-subtle)] hover:bg-cyan-400 hover:text-slate-950 text-xs font-mono text-slate-300 border border-[var(--line-color)] transition-all flex items-center space-x-1.5"
              >
                <span>Define Options</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Competing Pathways Under Evaluation */}
        {stage === 'options' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 space-y-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-widest font-semibold block">
                COMPETING PATHWAYS UNDER EVALUATION
              </span>
              <p className="text-[11px] font-mono text-slate-400">
                Identify or select candidate paths for multi-agent stress testing
              </p>
            </div>

            {/* Smart AI Option Suggester Banner */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left max-w-lg mx-auto">
              <div className="flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-cyan-200 block">
                    Unsure what pathways to define?
                  </span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    FlowMind can automatically propose realistic, competing routes for your ambition.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFetchSuggestedOptions}
                disabled={isSuggestingOptions}
                className="px-3.5 py-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                {isSuggestingOptions ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                <span>{isSuggestingOptions ? 'Mapping...' : '✨ Suggest Pathways'}</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 max-w-lg mx-auto w-full">
              {options.length > 0 ? (
                options.map((opt, i) => {
                  const desc = suggestedOptionsList.find((s) => s.title === opt)?.description;
                  return (
                    <div
                      key={i}
                      className="px-4 py-2 rounded-xl bg-[var(--canvas-subtle)] border border-cyan-500/30 text-xs font-mono text-white flex flex-col items-start space-y-1 shadow-sm text-left w-full"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="font-semibold text-xs text-white">{opt}</span>
                        </div>
                        <button
                          onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-400 text-sm ml-2"
                          title="Remove option"
                        >
                          ×
                        </button>
                      </div>
                      {desc && (
                        <p className="text-[11px] text-slate-400 font-sans pl-4 leading-relaxed">
                          {desc}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : autoExtractedOptions.length > 0 ? (
                <div className="space-y-2 w-full text-center">
                  <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider block">
                    ⚡ Auto-detected from your dilemma:
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {autoExtractedOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setOptions([...options, opt])}
                        className="px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/30 text-xs font-mono text-cyan-200 flex items-center space-x-2 transition-colors cursor-pointer"
                        title="Click to add as confirmed option"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{opt}</span>
                        <span className="text-cyan-400 font-bold">+</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] font-mono text-slate-500 py-1">
                  Click '✨ Suggest Pathways' above, or type custom pathways below.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center space-x-2 max-w-md mx-auto pt-1 w-full">
              <input
                type="text"
                placeholder="Or type a custom pathway..."
                value={customOption}
                onChange={(e) => setCustomOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                className="bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-full px-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors flex-1 font-mono"
              />
              <button
                onClick={handleAddOption}
                className="px-3.5 py-1.5 bg-cyan-400 text-slate-950 font-semibold rounded-full text-xs font-mono cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="pt-3 flex justify-center space-x-3">
              <button
                onClick={() => setStage('constraints')}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>Add Constraints & Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Stage 4: Non-Negotiables & Deadlines */}
        {stage === 'constraints' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 space-y-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-widest font-semibold block">
                NON-NEGOTIABLES & DEADLINES (OPTIONAL)
              </span>
              <p className="text-[11px] font-mono text-slate-400">
                Any hard constraints, budget limits, or deadlines that must not be violated
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {constraints.length > 0 ? (
                constraints.map((c, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-full bg-[var(--canvas-subtle)] border border-amber-500/30 text-xs font-mono text-slate-200 flex items-center space-x-1.5"
                  >
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>{c}</span>
                    <button
                      onClick={() => setConstraints(constraints.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-[11px] font-mono text-slate-500 py-1">
                  No constraints set. If your decision has no hard limits, proceed directly to synthesize.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center space-x-2 max-w-md mx-auto pt-1">
              <input
                type="text"
                placeholder="Add constraint (e.g. Must decide by Friday, Budget ceiling $10k)..."
                value={customConstraint}
                onChange={(e) => setCustomConstraint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddConstraint();
                  }
                }}
                className="bg-[var(--canvas-subtle)] border border-[var(--line-color)] rounded-full px-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors flex-1"
              />
              <button
                onClick={handleAddConstraint}
                className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-semibold rounded-full text-xs font-mono"
              >
                Add
              </button>
            </div>

            {/* Launch Synthesis Button */}
            <div className="pt-4 flex justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLaunchSynthesis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-semibold text-xs font-mono shadow-xl shadow-cyan-400/20 transition-all flex items-center space-x-2 disabled:opacity-50"
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
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Suggested Inspiration Dilemmas (Subtle inline prompts) */}
        {stage === 'prompt' && (
          <div className="pt-4 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase block">
              ✦ EXPLORE AN UNRESOLVED DILEMMA
            </span>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {[
                'Startup Lead vs BigTech Staff vs Bootstrapped Venture',
                'Relocate to San Francisco vs Stay in New York Remote',
                'Accept Principal Track vs Pivot to Frontier AI Research',
              ].map((seed, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTextChange(seed)}
                  className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors underline underline-offset-4 decoration-slate-800 hover:decoration-cyan-400"
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spatially Positioned Floating Memory Fragment: "RESUME THINKING" */}
      {latestMemory && (
        <div className="absolute bottom-20 inset-x-0 flex justify-center pointer-events-none">
          <div
            onMouseEnter={() => setHoveredMemory(latestMemory)}
            onMouseLeave={() => setHoveredMemory(null)}
            className="pointer-events-auto relative group"
          >
            <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] hover:border-cyan-500/40 text-[11px] font-mono text-slate-400 hover:text-white transition-all cursor-pointer shadow-lg shadow-black/40">
              <span className="text-cyan-400 flex items-center space-x-1 font-bold">
                <History className="w-3 h-3" />
                <span>RESUME THINKING:</span>
              </span>
              <span className="truncate max-w-[220px] text-slate-300">
                {latestMemory.title}
              </span>
              <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 text-[10px] font-bold">
                {latestMemory.confidence_score}%
              </span>
            </div>

            {/* Hover preview card: Memory Fragment details */}
            <AnimatePresence>
              {hoveredMemory && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: -8, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-4 rounded-2xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-cyan-500/30 shadow-2xl space-y-3 pointer-events-auto"
                >
                  <div className="flex items-center justify-between border-b border-[var(--line-color)] pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      ✦ MEMORY FRAGMENT
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {latestMemory.confidence_score}% Signal
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">
                      Last Dilemma
                    </span>
                    <p className="text-xs font-sans text-white not-italic">
                      "{latestMemory.title}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {latestMemory.options_count} Pathways Evaluated
                    </span>
                    <button
                      onClick={() => onSelectDecision(latestMemory.id)}
                      className="px-3 py-1 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-mono font-bold hover:bg-cyan-300 transition-colors flex items-center space-x-1"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

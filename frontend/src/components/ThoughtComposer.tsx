import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Plus, Shield, Sparkles, RefreshCw, X, History, ChevronRight, Wand2,
  Compass, Zap, Rocket, Cpu, Globe, TrendingUp
} from 'lucide-react';
import { DecisionListItem } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import { useTheme } from '../context/ThemeContext';

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

const STRATEGIC_TEMPLATES = [
  {
    icon: '🚀',
    label: 'Startup CTO vs BigTech Staff',
    tag: 'Career Architecture',
    dilemma: 'Should I join early-stage AI startup as founding CTO (high equity, high volatility) or accept BigTech Staff Engineer offer ($450k liquid comp, stability)?',
    options: ['Join Early-Stage AI Startup as Founding CTO', 'Accept BigTech Staff Engineer Offer', 'Negotiate Partial Advisory Role at Startup while at BigTech'],
    priorities: ['Long-Term Equity / Financial Upside', 'Autonomy & Cultural Agency', 'Career Velocity & Learning'],
    constraints: ['Must achieve financial breakeven within 18 months', 'Cannot exceed 65 hours/week sustainably']
  },
  {
    icon: '🤖',
    label: 'Proprietary AI vs Cloud APIs',
    tag: 'Technical Strategy',
    dilemma: 'Should our team train and host proprietary fine-tuned open-weight models on private GPU clusters, or build directly on top of commercial LLM APIs?',
    options: ['Host Proprietary Fine-Tuned Models on Private Cloud', 'Orchestrate Hybrid Commercial APIs (Anthropic/Gemini/OpenAI)', 'Multi-Model Fallback Gateway Architecture'],
    priorities: ['Autonomy & Cultural Agency', 'Long-Term Equity / Financial Upside', 'Career Velocity & Learning'],
    constraints: ['Strict zero data-retention security requirements', 'Engineering budget capped at $25k/month initially']
  },
  {
    icon: '🌍',
    label: 'SF Hub vs Remote Scaling',
    tag: 'Organizational Design',
    dilemma: 'Should our core leadership relocate to San Francisco to tap into local founder/investor density, or scale a 100% distributed remote global talent footprint?',
    options: ['Full Core Team Relocation to San Francisco Hub', 'Maintain 100% Distributed Remote-First Footprint', 'Quarterly High-Intensity SF Residencies & Remote Hybrid'],
    priorities: ['Mentorship & Team Density', 'Autonomy & Cultural Agency', 'Work-Life Sustainability'],
    constraints: ['Family relocation timeline constraints', 'Operating burn rate cannot increase by more than 35%']
  },
  {
    icon: '📈',
    label: 'Series A vs Bootstrapped Profit',
    tag: 'Venture & Capital',
    dilemma: 'Should we raise a $6M Series A round at a 20% dilution to accelerate enterprise sales, or remain profitable and grow organically from customer revenue?',
    options: ['Raise $6M Series A to Accelerate Market Capture', 'Bootstrap Organically Reinvesting 100% of Free Cashflow', 'Non-Dilutive Revenue-Based Financing Facility'],
    priorities: ['Long-Term Equity / Financial Upside', 'Exit Optionality & Mobility', 'Autonomy & Cultural Agency'],
    constraints: ['Retain absolute founder voting control', 'Runway must never drop below 12 months']
  }
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
  const { theme } = useTheme();
  const isLight = theme === 'light';

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

  const handleApplyTemplate = (tmpl: typeof STRATEGIC_TEMPLATES[0]) => {
    soundService.playChime();
    setDilemma(tmpl.dilemma);
    onInputChange(tmpl.dilemma);
    setOptions(tmpl.options);
    setSelectedPriorities(tmpl.priorities);
    setConstraints(tmpl.constraints);
    setStage('options');
  };

  const handleLaunchSynthesis = async () => {
    if (!dilemma.trim()) return;
    soundService.playSuccess();

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
            <span className={`text-[10px] font-mono tracking-widest font-bold uppercase ${
              isLight ? 'text-indigo-600' : 'text-cyan-400'
            }`}>
              ✦ {dilemma ? 'THINKING ABOUT' : 'START A DECISION'}
            </span>
          </motion.div>

          {!dilemma && (
            <p className={`text-xs font-sans max-w-md mx-auto leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Describe what you're trying to figure out in plain language. FlowMind will deconstruct it into an interactive decision model.
            </p>
          )}

          {/* Central User Thought (Stylized Glassmorphic Cognitive Capsule) */}
          <div className="relative pt-2">
            {stage === 'prompt' ? (
              <div className="relative flex flex-col items-center w-full">
                {/* Stylized Glassmorphic Thought Capsule (Adapts to Light & Dark) */}
                <div
                  className={`w-full max-w-xl mx-auto rounded-3xl p-6 backdrop-blur-2xl border transition-all duration-300 relative group ${
                    isLight
                      ? isFocused
                        ? 'bg-white/95 border-indigo-500/60 shadow-[0_0_40px_rgba(99,102,241,0.18),inset_0_1px_0_rgba(255,255,255,1)] ring-2 ring-indigo-400/20'
                        : 'bg-white/90 border-slate-200/90 shadow-[0_16px_45px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)] hover:border-slate-300'
                      : isFocused
                        ? 'bg-slate-950/75 border-cyan-400/50 shadow-[0_0_40px_rgba(0,240,255,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-cyan-400/30'
                        : 'bg-slate-950/75 border-white/[0.1] shadow-[0_24px_70px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-white/[0.2]'
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
                    className={`w-full bg-transparent text-base sm:text-xl font-sans font-normal placeholder:not-italic focus:outline-none resize-none leading-relaxed text-center tracking-tight pb-1 transition-all ${
                      isLight
                        ? 'text-slate-900 placeholder-slate-400'
                        : 'text-white placeholder-slate-500/80'
                    }`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && dilemma.trim()) {
                        e.preventDefault();
                        setStage('priorities');
                      }
                    }}
                  />

                  {/* Micro Helper Bar inside capsule */}
                  <div className={`flex items-center justify-between pt-3 border-t text-[10px] font-mono ${
                    isLight ? 'border-slate-100 text-slate-500' : 'border-white/[0.06] text-slate-500'
                  }`}>
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                      {dilemma ? `${dilemma.length} characters` : 'Type any dilemma or trade-off'}
                    </span>
                    {dilemma && (
                      <span className={`font-medium flex items-center space-x-1 ${
                        isLight ? 'text-indigo-600' : 'text-cyan-400/90'
                      }`}>
                        <span>Press ↵ to structure</span>
                        <kbd className={`px-1 py-0.5 rounded border text-[9px] ${
                          isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
                        }`}>↵</kbd>
                      </span>
                    )}
                  </div>
                </div>

                {/* Curated Strategic Dilemma Starters */}
                {!dilemma && (
                  <div className="w-full max-w-xl mx-auto pt-5 space-y-3">
                    <div className="flex items-center justify-between px-1 text-[10px] font-mono uppercase tracking-widest">
                      <span className={`flex items-center space-x-1 font-semibold ${
                        isLight ? 'text-indigo-600' : 'text-cyan-400/90'
                      }`}>
                        <Compass className="w-3 h-3" />
                        <span>Curated Strategic Starters</span>
                      </span>
                      <span className="text-slate-500">1-Click Full Setup</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                      {STRATEGIC_TEMPLATES.map((tmpl, idx) => (
                        <motion.button
                          key={idx}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApplyTemplate(tmpl)}
                          className={`p-3.5 rounded-2xl backdrop-blur-xl border transition-all text-left group ${
                            isLight
                              ? 'bg-white/90 hover:bg-white border-slate-200 hover:border-indigo-400/60 shadow-[0_4px_16px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)]'
                              : 'bg-slate-950/60 hover:bg-slate-900/80 border-white/[0.08] hover:border-cyan-400/40 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-base">{tmpl.icon}</span>
                            <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                              isLight
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/25'
                            }`}>
                              {tmpl.tag}
                            </span>
                          </div>
                          <h4 className={`text-xs font-semibold transition-colors line-clamp-1 ${
                            isLight
                              ? 'text-slate-900 group-hover:text-indigo-600'
                              : 'text-slate-200 group-hover:text-cyan-300'
                          }`}>
                            {tmpl.label}
                          </h4>
                          <p className={`text-[10px] line-clamp-1 mt-0.5 font-sans ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {tmpl.options.slice(0, 2).join(' vs ')}
                          </p>
                        </motion.button>
                      ))}
                    </div>

                    {/* Minimal Quick Queries */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] font-mono">
                      <span className="text-slate-500 mr-1">QUICK:</span>
                      {[
                        'Accelerated MS Degree vs Staff Engineer',
                        'Accept Early Acquisition Offer vs Continue Scaling',
                        'Relocate to Singapore Hub vs Expand in Bangalore',
                      ].map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTextChange(sample)}
                          className={`px-2.5 py-0.5 rounded-full border transition-all cursor-pointer text-[10px] ${
                            isLight
                              ? 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shadow-sm'
                              : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                          }`}
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>
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
                <h1 className={`text-2xl sm:text-3xl font-sans font-medium max-w-xl mx-auto not-italic leading-snug drop-shadow-sm ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  "{dilemma}"
                </h1>
                <button
                  onClick={() => setStage('prompt')}
                  className={`text-[10px] font-mono underline underline-offset-4 ${
                    isLight ? 'text-indigo-600 hover:text-indigo-800 decoration-indigo-200' : 'text-slate-400 hover:text-cyan-300 decoration-slate-700'
                  }`}
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
              <span className={`text-[10px] font-mono uppercase tracking-widest font-semibold block ${
                isLight ? 'text-indigo-600' : 'text-cyan-400'
              }`}>
                WHAT MATTERS MOST TO YOU?
              </span>
              <p className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
                        ? isLight
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-sm font-semibold'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-medium'
                        : isLight
                          ? 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 shadow-sm'
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
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all flex items-center space-x-1.5 ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm'
                    : 'bg-[var(--canvas-subtle)] hover:bg-cyan-400 hover:text-slate-950 text-slate-300 border border-[var(--line-color)]'
                }`}
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
              <span className={`text-[10px] font-mono uppercase tracking-widest font-semibold block ${
                isLight ? 'text-indigo-600' : 'text-cyan-400'
              }`}>
                COMPETING PATHWAYS UNDER EVALUATION
              </span>
              <p className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Identify or select candidate paths for multi-agent stress testing
              </p>
            </div>

            {/* Smart AI Option Suggester Banner */}
            <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-left max-w-lg mx-auto ${
              isLight
                ? 'bg-indigo-50/70 border-indigo-200/80 shadow-sm'
                : 'bg-cyan-950/40 border-cyan-500/30'
            }`}>
              <div className="flex items-start space-x-2.5">
                <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
                <div className="space-y-0.5">
                  <span className={`text-xs font-mono font-bold block ${isLight ? 'text-indigo-950' : 'text-cyan-200'}`}>
                    Unsure what pathways to define?
                  </span>
                  <p className={`text-[11px] font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    FlowMind can automatically propose realistic, competing routes for your ambition.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFetchSuggestedOptions}
                disabled={isSuggestingOptions}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-sm ${
                  isLight
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                }`}
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
                      className={`px-4 py-2 rounded-xl text-xs font-mono flex flex-col items-start space-y-1 text-left w-full border ${
                        isLight
                          ? 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
                          : 'bg-[var(--canvas-subtle)] border-cyan-500/30 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{opt}</span>
                        </div>
                        <button
                          onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-500 text-sm ml-2"
                          title="Remove option"
                        >
                          ×
                        </button>
                      </div>
                      {desc && (
                        <p className={`text-[11px] font-sans pl-4 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {desc}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : autoExtractedOptions.length > 0 ? (
                <div className="space-y-2 w-full text-center">
                  <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLight ? 'text-indigo-600' : 'text-cyan-400/80'}`}>
                    ⚡ Auto-detected from your dilemma:
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {autoExtractedOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setOptions([...options, opt])}
                        className={`px-3 py-1.5 rounded-full border text-xs font-mono flex items-center space-x-2 transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-indigo-50 hover:bg-indigo-100/70 border-indigo-200 text-indigo-800'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/25 border-cyan-400/30 text-cyan-200'
                        }`}
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
                className={`border rounded-full px-4 py-1.5 text-xs focus:outline-none transition-colors flex-1 font-mono ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
                    : 'bg-[var(--canvas-subtle)] border-[var(--line-color)] text-white placeholder-slate-500 focus:border-cyan-400'
                }`}
              />
              <button
                onClick={handleAddOption}
                className={`px-3.5 py-1.5 font-semibold rounded-full text-xs font-mono cursor-pointer ${
                  isLight ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-cyan-400 text-slate-950'
                }`}
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
              <span className={`text-[10px] font-mono uppercase tracking-widest font-semibold block ${
                isLight ? 'text-indigo-600' : 'text-cyan-400'
              }`}>
                NON-NEGOTIABLES & DEADLINES (OPTIONAL)
              </span>
              <p className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Any hard constraints, budget limits, or deadlines that must not be violated
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {constraints.length > 0 ? (
                constraints.map((c, i) => (
                  <span
                    key={i}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-mono flex items-center space-x-1.5 ${
                      isLight
                        ? 'bg-white border-amber-300 text-slate-800 shadow-sm'
                        : 'bg-[var(--canvas-subtle)] border-amber-500/30 text-slate-200'
                    }`}
                  >
                    <Shield className="w-3 h-3 text-amber-500" />
                    <span>{c}</span>
                    <button
                      onClick={() => setConstraints(constraints.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-500"
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
                className={`border rounded-full px-4 py-1.5 text-xs focus:outline-none transition-colors flex-1 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-950 placeholder-slate-400 focus:border-amber-500 shadow-sm'
                    : 'bg-[var(--canvas-subtle)] border-[var(--line-color)] text-white placeholder-slate-500 focus:border-amber-400'
                }`}
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
                  className={`text-[11px] font-mono transition-colors underline underline-offset-4 ${
                    isLight
                      ? 'text-slate-600 hover:text-indigo-600 decoration-slate-300 hover:decoration-indigo-500'
                      : 'text-slate-400 hover:text-cyan-300 decoration-slate-800 hover:decoration-cyan-400'
                  }`}
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

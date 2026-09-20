import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Network, CheckCircle2, X } from 'lucide-react';
import { useFlow } from '../context/FlowContext';

export const AIGenerationModal: React.FC = () => {
  const { isGeneratingFlow, generatingStep, generatingPrompt, cancelGeneration } = useFlow();

  if (!isGeneratingFlow) return null;

  const steps = [
    {
      step: 1,
      title: 'Thought Captured',
      subtitle: `"${generatingPrompt || 'Thought stream'}"`,
      icon: Brain,
      accent: 'from-cyan-500 to-blue-500',
    },
    {
      step: 2,
      title: 'AI Understanding & Semantic Mapping',
      subtitle: 'Deconstructing intent, hierarchies, and cognitive dependencies...',
      icon: Sparkles,
      accent: 'from-violet-500 to-indigo-500',
    },
    {
      step: 3,
      title: 'Building Neural Connections',
      subtitle: 'Synthesizing decision trees, actionable tasks, and milestones...',
      icon: Network,
      accent: 'from-fuchsia-500 to-pink-500',
    },
    {
      step: 4,
      title: 'Flow Generated',
      subtitle: 'Interactive living mind graph compiled and ready to explore.',
      icon: CheckCircle2,
      accent: 'from-emerald-400 to-cyan-400',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Ambient background glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#0D111D]/90 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 p-6 md:p-8 backdrop-blur-xl overflow-hidden"
        >
          {/* Top subtle highlight border */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Close / Cancel Button */}
          <button
            onClick={cancelGeneration}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Cancel Generation"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </motion.div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide">
                  FlowMind Cognitive Engine
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-full">
                  Step {generatingStep} of 4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Translating unstructured thought into hierarchical graph
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-6 border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${(generatingStep / 4) * 100}%` }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </div>

          {/* Steps List */}
          <div className="space-y-3.5 mb-6">
            {steps.map((s) => {
              const isDone = s.step < generatingStep;
              const isCurrent = s.step === generatingStep;
              const isPending = s.step > generatingStep;
              const Icon = s.icon;

              return (
                <motion.div
                  key={s.step}
                  animate={{
                    opacity: isPending ? 0.35 : 1,
                    scale: isCurrent ? 1.02 : 1,
                  }}
                  className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                      : isDone
                      ? 'bg-slate-900/40 border-slate-800'
                      : 'border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isCurrent
                        ? `bg-gradient-to-br ${s.accent} text-white shadow-md shadow-cyan-500/30 border-white/20`
                        : 'bg-slate-800/50 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Icon size={16} />
                      </motion.div>
                    ) : (
                      <span className="text-xs font-mono">{s.step}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? 'text-cyan-200'
                            : isDone
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {s.title}
                      </p>
                      {isCurrent && (
                        <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          Processing
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {s.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Live Tree Preview at Step 4 */}
          {generatingStep >= 3 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3.5 rounded-xl bg-[#090C16] border border-cyan-500/20 font-mono text-[11px] text-cyan-300/80 leading-relaxed overflow-hidden"
            >
              <div className="text-slate-400 mb-1 font-sans text-xs uppercase tracking-wider">
                Graph Projection Preview
              </div>
              <div className="text-cyan-200 font-bold">
                {generatingPrompt.toUpperCase()}
              </div>
              <div className="text-slate-400">
                ├── Core Pillars & Foundations
              </div>
              <div className="text-slate-400">
                │   ├── Systematic Architecture
              </div>
              <div className="text-slate-400">
                │   └── Algorithmic Deliberation
              </div>
              <div className="text-slate-400">
                ├── Decision Boundaries
              </div>
              <div className="text-emerald-400">
                └── ↳ Connected High-Leverage Tasks (Ready)
              </div>
            </motion.div>
          )}

          {/* Footer status */}
          <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Autonomous synthesis in progress...
            </span>
            <button
              onClick={cancelGeneration}
              className="text-slate-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

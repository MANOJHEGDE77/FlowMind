import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIThinkingStateProps {
  isAnalyzing: boolean;
  onComplete?: () => void;
}

interface Phase {
  id: string;
  stageNum: string;
  title: string;
  action: string;
  agents: string[];
  signalStrength: number;
}

const PHASES: Phase[] = [
  {
    id: 'thinking',
    stageNum: '01 / 04',
    title: 'THINKING',
    action: 'Deconstructing unstructured context & parsing cognitive ambiguity...',
    agents: ['Analyst', 'Researcher'],
    signalStrength: 24,
  },
  {
    id: 'mapping',
    stageNum: '02 / 04',
    title: 'MAPPING',
    action: 'Topologically mapping competing pathways & boundary constraints...',
    agents: ['Financial Analyst', 'Long-Term Planner'],
    signalStrength: 52,
  },
  {
    id: 'challenging',
    stageNum: '03 / 04',
    title: 'CHALLENGING',
    action: "Devil's Advocate stress-testing hidden biases & assumptions...",
    agents: ['Skeptic', "Devil's Advocate"],
    signalStrength: 76,
  },
  {
    id: 'synthesizing',
    stageNum: '04 / 04',
    title: 'SYNTHESIZING',
    action: 'Harmonizing multi-agent council into the unified decision signal...',
    agents: ['Synthesizer', 'Council Core'],
    signalStrength: 87,
  },
];

export const AIThinkingState: React.FC<AIThinkingStateProps> = ({ isAnalyzing }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setPhaseIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  const currentPhase = PHASES[phaseIndex];

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none select-none">
      {/* Soft atmospheric backdrop glow */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center space-y-8">
        {/* Luminous Central Signal Core with Concentric Energy Rings */}
        <div className="relative flex items-center justify-center w-48 h-48">
          {/* Outermost orbital ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed"
          />

          {/* Middle counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-4 rounded-full border border-sky-400/30 border-t-transparent"
          />

          {/* Innermost ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-10 rounded-full border border-cyan-300/40 border-b-transparent"
          />

          {/* THE SIGNAL: Luminous core that solidifies as signalStrength grows */}
          <motion.div
            key={currentPhase.signalStrength}
            initial={{ scale: 0.85, opacity: 0.7 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              boxShadow: `0 0 ${currentPhase.signalStrength * 0.6}px #00F0FF`,
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-white flex items-center justify-center"
          >
            <span className="text-[10px] font-mono font-bold text-slate-950">
              {currentPhase.signalStrength}%
            </span>
          </motion.div>
        </div>

        {/* Dynamic Stage Narrative */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-3 text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
            <span>✦ COGNITIVE REASONING</span>
            <span>•</span>
            <span>{currentPhase.stageNum}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-mono font-bold text-white tracking-wider">
                {currentPhase.title}
              </h2>
              <p className="text-sm font-editorial text-slate-300 italic max-w-sm mx-auto">
                "{currentPhase.action}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Participating AI Agents */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          {currentPhase.agents.map((agent, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center space-x-1"
            >
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
              <span>{agent}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

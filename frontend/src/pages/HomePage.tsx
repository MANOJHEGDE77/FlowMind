import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Mic,
  Brain,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface HomePageProps {
  onNavigateToCanvas: (flowId?: string) => void;
  onNavigateToTasks: () => void;
  onNavigateToFocus: () => void;
}

const QUICK_STARTERS = [
  'Distributed Systems Architecture',
  'Technical Staff Interview Prep',
  'Autonomous AI Agent Pipeline',
  'Product Growth & Retention Strategy',
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToCanvas,
  onNavigateToTasks,
  onNavigateToFocus,
}) => {
  const {
    flows,
    tasks,
    thinkingPatterns,
    generateFlowFromPrompt,
    setActiveFlowId,
    setActiveFocusTask,
  } = useFlow();

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const totalThoughts = flows.reduce((acc, f) => acc + f.nodes.length, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const handleCreateFlow = async (textToUse?: string) => {
    const text = textToUse || inputVal;
    if (!text.trim()) return;
    soundService.playChime();
    setIsSynthesizing(true);
    const created = await generateFlowFromPrompt(text.trim());
    setIsSynthesizing(false);
    setInputVal('');
    if (created) {
      setActiveFlowId(created.id);
      onNavigateToCanvas(created.id);
    }
  };

  const handleVoiceToggle = () => {
    soundService.playClick();
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setInputVal('Design scalable event-driven distributed pipeline with kafka & redis');
        setIsListening(false);
      }, 1600);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#08090D] text-[#F4F5F7] p-6 lg:p-12 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HERO SECTION: "What is on your mind?" */}
        <section className="text-center space-y-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#A7ACB8] font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5EE7FF]" />
            <span className="font-mono text-[11px] tracking-wider uppercase">
              {getGreeting()}, ARCHITECT
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-3xl md:text-5xl font-semibold tracking-tight text-white"
          >
            What is on your mind?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-sm md:text-base text-[#A7ACB8] max-w-lg mx-auto leading-relaxed"
          >
            Transform raw thoughts into connected graphs, structured insights, and decisive action.
          </motion.p>

          {/* CENTRAL THOUGHT CAPTURE INPUT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18 }}
            className="relative max-w-2xl mx-auto mt-6"
          >
            <div className="relative flex items-center p-2 rounded-2xl bg-[#0F1118] border border-white/[0.1] hover:border-white/[0.2] focus-within:border-[#7C5CFF] focus-within:shadow-[0_0_24px_rgba(124,92,255,0.25)] transition-all shadow-xl">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFlow();
                }}
                placeholder="Start a new thought, project roadmap, or decision dilemma..."
                className="flex-1 bg-transparent px-4 py-2 text-white placeholder-[#686E7C] text-sm md:text-base focus:outline-none"
              />

              <div className="flex items-center space-x-2 shrink-0 pr-1">
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isListening
                      ? 'border-[#FF5C6C] text-[#FF5C6C] bg-[#FF5C6C]/10 animate-pulse'
                      : 'border-white/[0.08] text-[#A7ACB8] hover:text-white hover:bg-white/[0.05]'
                  }`}
                  title="Voice Thought Capture"
                >
                  <Mic size={16} />
                </button>

                <button
                  type="button"
                  disabled={isSynthesizing}
                  onClick={() => handleCreateFlow()}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white text-xs font-semibold hover:opacity-95 transition-opacity shadow-[0_0_16px_rgba(124,92,255,0.3)] disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{isSynthesizing ? 'Structuring...' : 'Synthesize'}</span>
                </button>
              </div>
            </div>

            {/* QUICK STARTERS */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <span className="text-xs text-[#686E7C] font-medium mr-1">Starters:</span>
              {QUICK_STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => handleCreateFlow(starter)}
                  className="px-3 py-1 rounded-full text-xs text-[#A7ACB8] bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] hover:text-white transition-all"
                >
                  ✦ {starter}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* THOUGHT → ACTION COGNITIVE PIPELINE INDICATOR */}
        <section className="py-3 px-6 rounded-2xl bg-[#0F1118]/60 border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-[#686E7C]">
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#A7ACB8]">
            Cognitive Pipeline
          </span>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="text-white font-medium">THOUGHT</span>
            <span className="text-[#686E7C]">→</span>
            <span className="text-[#5EE7FF]">CONNECTION</span>
            <span className="text-[#686E7C]">→</span>
            <span className="text-[#9B84FF]">ANALYSIS</span>
            <span className="text-[#686E7C]">→</span>
            <span className="text-[#7C5CFF]">INSIGHT</span>
            <span className="text-[#686E7C]">→</span>
            <span className="text-[#F5B84B]">DECISION</span>
            <span className="text-[#686E7C]">→</span>
            <span className="text-[#45E0A8]">ACTION</span>
            <span className="text-[#686E7C]">→</span>
            <span className="text-white font-medium">PROGRESS</span>
          </div>
        </section>

        {/* RECENT FLOWS (The signature FlowMind knowledge graphs) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight flex items-center space-x-2">
                <Layers size={18} className="text-[#5EE7FF]" />
                <span>Recent Flows</span>
              </h2>
              <p className="text-xs text-[#686E7C]">
                Explore your active spatial thinking graphs and connected roadmaps.
              </p>
            </div>

            <button
              onClick={() => onNavigateToCanvas()}
              className="text-xs font-medium text-[#5EE7FF] hover:underline flex items-center space-x-1"
            >
              <span>Open Canvas</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {flows.map((flow) => {
              const thoughtNodes = flow.nodes.filter((n) => n.type === 'idea' || n.type === 'core');
              const insightCount = flow.nodes.filter((n) => n.type === 'idea' || n.type === 'decision').length;
              const actionCount = flow.nodes.filter((n) => n.type === 'task').length;

              return (
                <div
                  key={flow.id}
                  onClick={() => {
                    soundService.playClick();
                    setActiveFlowId(flow.id);
                    onNavigateToCanvas(flow.id);
                  }}
                  className="group relative p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#151823] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-lg hover:shadow-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] text-[#5EE7FF] border border-white/[0.08]">
                        {flow.category}
                      </span>
                      <span className="text-[#686E7C] font-mono text-[11px]">
                        {flow.progress}% synced
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-[#5EE7FF] transition-colors line-clamp-1">
                      {flow.title}
                    </h3>
                    <p className="text-xs text-[#A7ACB8] line-clamp-2 leading-relaxed">
                      {flow.description}
                    </p>

                    {/* Miniature SVG Flow Preview */}
                    <div className="h-20 w-full rounded-xl bg-[#08090D] border border-white/[0.06] p-2 flex items-center justify-center relative overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 260 80">
                        <path
                          d="M 30,40 C 70,10 110,60 150,30 C 190,10 210,50 230,40"
                          fill="none"
                          stroke="#5EE7FF"
                          strokeWidth="1.75"
                          strokeDasharray="4 4"
                          className="opacity-40 animate-flow-dash"
                        />
                        <path
                          d="M 150,30 C 170,70 200,65 230,65"
                          fill="none"
                          stroke="#7C5CFF"
                          strokeWidth="1.5"
                          strokeOpacity="0.4"
                        />
                        {/* Nodes */}
                        <circle cx="30" cy="40" r="4.5" fill="#7C5CFF" />
                        <circle cx="95" cy="38" r="4" fill="#5EE7FF" />
                        <circle cx="150" cy="30" r="4.5" fill="#5EE7FF" />
                        <circle cx="230" cy="40" r="4" fill="#45E0A8" />
                        <circle cx="230" cy="65" r="3.5" fill="#F5B84B" />
                      </svg>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#686E7C]">
                    <div className="flex items-center space-x-3 font-mono text-[11px]">
                      <span>{flow.nodes.length} THOUGHTS</span>
                      <span>{insightCount} INSIGHTS</span>
                    </div>
                    <span className="text-[#5EE7FF] font-medium group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FLOW COPILOT INSIGHTS BANNER */}
        {thinkingPatterns.length > 0 && (
          <section className="p-6 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                <Sparkles size={16} className="text-[#5EE7FF]" />
                <span>Copilot Cross-Flow Observations</span>
              </div>
              <span className="text-[11px] font-mono text-[#45E0A8] uppercase">
                Active Observer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {thinkingPatterns.map((pat) => (
                <div
                  key={pat.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9B84FF]">
                    ✦ {pat.type.replace('_', ' ')}
                  </span>
                  <p className="text-[#A7ACB8] leading-relaxed">{pat.insight}</p>
                  <p className="text-[11px] text-[#5EE7FF] font-medium pt-1">
                    ↳ {pat.actionText}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

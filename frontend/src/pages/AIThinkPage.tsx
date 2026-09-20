import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Network,
  Zap,
  TrendingUp,
  ArrowRight,
  Brain,
  CheckCircle2,
  GitMerge,
  Layers,
  Search,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface AIThinkPageProps {
  onOpenCanvas: (flowId: string) => void;
  onGeneratePrompt: (prompt: string) => void;
}

export const AIThinkPage: React.FC<AIThinkPageProps> = ({
  onOpenCanvas,
  onGeneratePrompt,
}) => {
  const { thinkingPatterns, flows } = useFlow();
  const [selectedFlowId, setSelectedFlowId] = useState(flows[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'observations' | 'deliberations'>('observations');

  const activeFlow = flows.find((f) => f.id === selectedFlowId) || flows[0];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-b from-[#06080F] via-[#090C16] to-[#06080F] text-slate-100 p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                Autonomous Intelligence Hub
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>✦ FlowMind Intelligence</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-light">
              Structured cognitive insights, bottlenecks, and cross-flow synthesis — without endless chat bubbles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Context Flow:</span>
            <select
              value={selectedFlowId}
              onChange={(e) => setSelectedFlowId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* HERO INTELLIGENCE CARD */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/30 via-[#0C1122] to-violet-950/20 border border-cyan-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          {/* Ambient lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            <span>Real-time Ecosystem Deconstruction</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            "I found 4 connected thoughts across your Career and Project graphs."
          </h2>

          <p className="text-sm text-slate-300 max-w-2xl font-light leading-relaxed mb-6">
            Your preparation for <strong>{activeFlow.title}</strong> shares 3 foundational data structure patterns with your Autonomous Agent project. Synchronizing them will save an estimated 4.5 hours of redundant review.
          </p>

          {/* Structured Insight Breakdown (No Chatbot Bubbles) */}
          <div className="p-4 rounded-2xl bg-[#070912]/80 border border-slate-800 space-y-3 mb-6 font-mono text-xs">
            <div className="text-slate-400 uppercase tracking-widest text-[10px]">
              Recommended Pipeline Decomposition
            </div>
            <div className="flex flex-wrap items-center gap-2 text-cyan-200">
              <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60">
                1. Core Concurrency Primitives
              </span>
              <span className="text-slate-500">→</span>
              <span className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-200">
                2. Algorithmic Edge Cases
              </span>
              <span className="text-slate-500">→</span>
              <span className="px-3 py-1 rounded-lg bg-violet-950/60 border border-violet-800/60 text-violet-200">
                3. System Scale Trade-offs
              </span>
              <span className="text-slate-500">→</span>
              <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-200">
                4. Peer Mock Evaluation
              </span>
            </div>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                soundService.playChime();
                onOpenCanvas(activeFlow.id);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-400/20"
            >
              <span>Build Flow</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                onGeneratePrompt(`Expand cognitive sub-branches for ${activeFlow.title}`);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
            >
              Expand Sub-branches
            </button>
            <button
              onClick={() => soundService.playClick()}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
            >
              Synthesize Strategy
            </button>
          </div>
        </div>

        {/* STRUCTURED INTELLIGENCE OBSERVATIONS */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Zap className="text-amber-400" size={18} />
            Cognitive Patterns & Predictive Next Moves
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {thinkingPatterns.map((p) => {
              const isPattern = p.type === 'pattern';
              const isNext = p.type === 'next_move';
              const isConn = p.type === 'connection';

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#0B0F1E]/90 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                        isPattern
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40'
                          : isNext
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                          : 'bg-violet-950/60 text-violet-300 border-violet-800/40'
                      }`}
                    >
                      ✦ {p.type.replace('_', ' ')}
                    </span>

                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {p.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      {p.insight}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        soundService.playClick();
                        onOpenCanvas(p.flowId || activeFlow.id);
                      }}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
                    >
                      <span className="truncate max-w-[200px]">{p.actionText}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

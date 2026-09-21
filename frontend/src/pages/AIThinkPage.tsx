import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowDown,
  ArrowRight,
  Brain,
  CheckCircle2,
  GitBranch,
  Layers,
  Plus,
  Zap,
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
  const { thinkingPatterns, flows, addNodeToActiveFlow, addTask } = useFlow();
  const [selectedFlowId, setSelectedFlowId] = useState(flows[0]?.id || '');
  const activeFlow = flows.find((f) => f.id === selectedFlowId) || flows[0];

  const [selectedThoughtId, setSelectedThoughtId] = useState(activeFlow?.nodes[0]?.id || '');
  const activeNode = activeFlow?.nodes.find((n) => n.id === selectedThoughtId) || activeFlow?.nodes[0];

  const handleInjectInsight = (title: string) => {
    addNodeToActiveFlow({
      parentId: activeNode?.id,
      title: title,
      type: 'result',
      description: `Synthesized via FlowMind Reasoning Pipeline for ${activeFlow.title}.`,
      x: 450 + Math.floor(Math.random() * 160) - 80,
      y: 280 + Math.floor(Math.random() * 100),
    });
    soundService.playSuccess();
  };

  const handleCreateTaskFromAction = (actionTitle: string) => {
    addTask({
      title: actionTitle,
      flowId: activeFlow.id,
      flowTitle: activeFlow.title,
      nodeId: activeNode?.id,
      nodeTitle: activeNode?.title,
      completed: false,
      priority: 'high',
      dueDate: 'Today',
      estimatedMinutes: 45,
    });
    soundService.playSuccess();
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#08090D] text-[#F4F5F7] p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* TOP HEADER & CONTEXT SELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#9B84FF] mb-1">
              <Sparkles size={14} className="text-[#5EE7FF]" />
              <span>THINK MODE // REASONING WORKSPACE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Cognitive Reasoning Pipeline
            </h1>
            <p className="text-xs text-[#A7ACB8] mt-1">
              Structured step-by-step intelligence transforming raw questions into actionable breakthroughs.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#686E7C]">Target Flow:</span>
            <select
              value={selectedFlowId}
              onChange={(e) => {
                setSelectedFlowId(e.target.value);
                const newFlow = flows.find((f) => f.id === e.target.value);
                if (newFlow && newFlow.nodes[0]) {
                  setSelectedThoughtId(newFlow.nodes[0].id);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0F1118] border border-white/[0.08] text-white focus:outline-none focus:border-[#7C5CFF]"
            >
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3-COLUMN REASONING LAYOUT (LEFT: Context Thoughts | CENTER: Structured Pipeline | RIGHT: Insights) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Context & Thoughts in Active Flow */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#686E7C] px-1">
              <span>Thoughts In Flow ({activeFlow?.nodes.length || 0})</span>
            </div>

            <div className="space-y-2">
              {activeFlow?.nodes.map((node) => {
                const isSelected = node.id === activeNode?.id;

                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedThoughtId(node.id);
                    }}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#151823] border-[#7C5CFF] text-white shadow-md'
                        : 'bg-[#0F1118] border-white/[0.06] text-[#A7ACB8] hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                      <span className={isSelected ? 'text-[#5EE7FF]' : 'text-[#686E7C]'}>
                        {node.type}
                      </span>
                      {node.progress !== undefined && (
                        <span className="text-[#686E7C]">{node.progress}%</span>
                      )}
                    </div>
                    <p className="font-medium line-clamp-2 leading-snug">{node.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CENTER: STRUCTURED REASONING CHAIN (Thought → Observations → Patterns → Insight → Action) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#686E7C] px-1">
              <span>Structured Reasoning Chain</span>
            </div>

            {/* BLOCK 1: THOUGHT */}
            <div className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-2 relative shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/[0.05] text-[#5EE7FF]">
                  1. THOUGHT
                </span>
                <span className="text-[11px] font-mono text-[#686E7C]">ORIGIN OBJECTIVE</span>
              </div>
              <h3 className="text-base font-semibold text-white">
                &quot;{activeNode?.title || 'Distributed Systems Architecture Preparation'}&quot;
              </h3>
              <p className="text-xs text-[#A7ACB8] leading-relaxed">
                {activeNode?.description || 'Foundational conceptual node balancing empirical base rates with architectural scalability.'}
              </p>
            </div>

            {/* FLOW CONNECTOR ARROW */}
            <div className="flex justify-center text-[#5EE7FF]/60">
              <ArrowDown size={18} />
            </div>

            {/* BLOCK 2: OBSERVATIONS */}
            <div className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/[0.05] text-[#9B84FF]">
                  2. OBSERVATIONS
                </span>
                <span className="text-[11px] font-mono text-[#686E7C]">EMPIRICAL SIGNALS</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#A7ACB8]">
                <li className="flex items-start space-x-2">
                  <span className="text-[#5EE7FF]">•</span>
                  <span>Multiple competing memory models: Virtual Threads (Loom) vs traditional reactive Netty.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#5EE7FF]">•</span>
                  <span>Frequent context switching between high-level architectural tradeoffs and low-level code drills.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#5EE7FF]">•</span>
                  <span>Shared concurrency primitives with active backend project roadmaps.</span>
                </li>
              </ul>
            </div>

            {/* FLOW CONNECTOR ARROW */}
            <div className="flex justify-center text-[#7C5CFF]/60">
              <ArrowDown size={18} />
            </div>

            {/* BLOCK 3: PATTERNS */}
            <div className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/[0.05] text-[#F5B84B]">
                  3. PATTERNS
                </span>
                <span className="text-[11px] font-mono text-[#686E7C]">HEURISTIC ANALYSIS</span>
              </div>
              <p className="text-xs text-[#F4F5F7] leading-relaxed">
                Cognitive friction occurs primarily when shifting from theoretical distributed consensus into hands-on coding tests without a unified mental anchor.
              </p>
            </div>

            {/* FLOW CONNECTOR ARROW */}
            <div className="flex justify-center text-[#9B84FF]/60">
              <ArrowDown size={18} />
            </div>

            {/* BLOCK 4: INSIGHT */}
            <div className="p-5 rounded-2xl bg-[#151823] border border-[#7C5CFF]/40 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#7C5CFF]/20 text-[#9B84FF]">
                  4. SYNTHESIZED INSIGHT
                </span>
                <span className="text-[11px] font-mono text-[#45E0A8]">BREAKTHROUGH</span>
              </div>
              <p className="text-sm font-medium text-white leading-relaxed">
                &quot;Unifying your concurrency model across both your project implementation and your interview drills eliminates approximately 4.5 hours of redundant study.&quot;
              </p>
              <button
                onClick={() => handleInjectInsight(`Insight: Concurrency Unity in ${activeNode?.title.slice(0, 18)}`)}
                className="pt-2 text-xs font-medium text-[#5EE7FF] hover:underline flex items-center space-x-1"
              >
                <span>+ Inject Insight into Flow Canvas</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* FLOW CONNECTOR ARROW */}
            <div className="flex justify-center text-[#45E0A8]/60">
              <ArrowDown size={18} />
            </div>

            {/* BLOCK 5: ACTION */}
            <div className="p-5 rounded-2xl bg-[#0F1118] border border-[#45E0A8]/30 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#45E0A8]/15 text-[#45E0A8]">
                  5. ACTIONABLE NEXT STEP
                </span>
                <span className="text-[11px] font-mono text-[#686E7C]">EXECUTION</span>
              </div>
              <h4 className="text-sm font-semibold text-white">
                Execute a 45-minute focused sprint on Concurrency Primitives &amp; Lock-Free Queues.
              </h4>
              <button
                onClick={() => handleCreateTaskFromAction(`Execute: Concurrency Primitives for ${activeNode?.title}`)}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-[#45E0A8] to-[#5EE7FF] text-black text-xs font-semibold hover:opacity-95 transition-opacity flex items-center justify-center space-x-2 shadow-md shadow-[#45E0A8]/20"
              >
                <Zap size={14} />
                <span>Anchor Action to Execution Queue</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Cross-Graph Insights & Patterns */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#686E7C] px-1">
              <span>Cross-Flow Patterns</span>
              <Sparkles size={13} className="text-[#5EE7FF]" />
            </div>

            <div className="space-y-3">
              {thinkingPatterns.map((pat) => (
                <div
                  key={pat.id}
                  className="p-4 rounded-xl bg-[#0F1118] border border-white/[0.08] hover:border-white/[0.16] space-y-2 text-xs transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#9B84FF]">
                      ✦ {pat.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-[#686E7C]">LIVE</span>
                  </div>
                  <p className="text-[#A7ACB8] leading-relaxed font-normal">{pat.insight}</p>
                  <button
                    onClick={() => handleInjectInsight(pat.actionText)}
                    className="pt-1 text-[11px] font-medium text-[#5EE7FF] hover:underline flex items-center space-x-1"
                  >
                    <span>+ Inject to graph</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#151823] border border-white/[0.08] space-y-2">
              <span className="text-[11px] font-mono uppercase text-white font-semibold">
                Open in Canvas
              </span>
              <p className="text-xs text-[#686E7C]">
                Explore the full spatial graph of thoughts with interactive zoom and drag.
              </p>
              <button
                onClick={() => onOpenCanvas(activeFlow.id)}
                className="w-full py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium transition-colors"
              >
                Launch Mind Canvas →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

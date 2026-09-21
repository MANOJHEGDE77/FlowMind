import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckSquare,
  Trash2,
  ArrowRight,
  GitBranch,
  AlertTriangle,
  Lightbulb,
  Plus,
  Network,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface ContextualAIInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI: (initialPrompt?: string) => void;
}

export const ContextualAIInspector: React.FC<ContextualAIInspectorProps> = ({
  isOpen,
  onClose,
  onAskAI,
}) => {
  const {
    selectedNode,
    activeFlow,
    deleteNodeFromActiveFlow,
    addNodeToActiveFlow,
    addTask,
    setSelectedNodeId,
  } = useFlow();

  const [activeTab, setActiveTab] = useState<'node' | 'intelligence'>('node');
  const [isExpanding, setIsExpanding] = useState(false);

  if (!isOpen && !selectedNode) return null;

  const node = selectedNode || activeFlow?.nodes[0];

  // Connected nodes list
  const connectedNodes = activeFlow?.edges
    .filter((e) => e.source === node?.id || e.target === node?.id)
    .map((e) => {
      const neighborId = e.source === node?.id ? e.target : e.source;
      return activeFlow.nodes.find((n) => n.id === neighborId);
    })
    .filter(Boolean) || [];

  const handleBranchSubIdea = () => {
    if (!node) return;
    setIsExpanding(true);
    soundService.playChime();

    setTimeout(() => {
      addNodeToActiveFlow({
        parentId: node.id,
        title: `Strategy on: ${node.title}`,
        description: `Refined sub-concept branching from ${node.title}.`,
        type: 'idea',
        x: (node.x || 450) + 160,
        y: (node.y || 200) + 120,
      });
      setIsExpanding(false);
      soundService.playSuccess();
    }, 400);
  };

  const handleConvertToTask = () => {
    if (!node) return;
    addTask({
      title: `Execute: ${node.title}`,
      flowId: activeFlow.id,
      flowTitle: activeFlow.title,
      nodeId: node.id,
      nodeTitle: node.title,
      completed: false,
      priority: node.priority || 'medium',
      dueDate: 'This week',
      estimatedMinutes: 45,
    });
    soundService.playSuccess();
  };

  const handleAddInsightToCanvas = () => {
    if (!node) return;
    addNodeToActiveFlow({
      parentId: node.id,
      title: `Insight: Core trade-off in ${node.title.slice(0, 20)}`,
      description: 'Synthesized architectural balance derived from contextual flow heuristics.',
      type: 'result',
      x: (node.x || 450) + 140,
      y: (node.y || 200) - 80,
    });
    soundService.playSuccess();
  };

  return (
    <aside className="w-80 sm:w-96 h-full shrink-0 border-l border-white/[0.08] bg-[#0F1118]/95 backdrop-blur-xl flex flex-col z-30 shadow-2xl">
      {/* HEADER WITH TABS */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs">
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('node');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'node'
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-[#686E7C] hover:text-[#A7ACB8]'
            }`}
          >
            Node Details
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('intelligence');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'intelligence'
                ? 'bg-[#7C5CFF]/20 text-[#5EE7FF] border border-[#7C5CFF]/30 shadow-sm'
                : 'text-[#686E7C] hover:text-[#A7ACB8]'
            }`}
          >
            <Sparkles size={13} className="text-[#5EE7FF]" />
            <span>AI Intelligence</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#686E7C] hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* BODY: NODE DETAILS */}
      {activeTab === 'node' && node && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left custom-scrollbar text-xs">
          {/* Node Type & Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/[0.05] text-[#5EE7FF] border border-white/[0.08]">
                {node.type}
              </span>
              <span className="text-[10px] font-mono text-[#686E7C]">
                ID: {node.id.slice(-6)}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white leading-snug">
              {node.title}
            </h3>

            {node.description && (
              <p className="text-xs text-[#A7ACB8] leading-relaxed">
                {node.description}
              </p>
            )}
          </div>

          {/* AI SUMMARY CARD */}
          <div className="p-3.5 rounded-xl bg-[#151823] border border-white/[0.08] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-medium text-[#9B84FF]">
              <Sparkles size={13} className="text-[#5EE7FF]" />
              <span>Thought Summary</span>
            </div>
            <p className="text-xs text-[#A7ACB8] leading-relaxed">
              {node.aiSummary || 'Connected node anchoring key downstream deliverables and strategic dependency paths.'}
            </p>
          </div>

          {/* CONNECTED THOUGHTS LINEAGE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#686E7C]">
              <span>Connected Nodes ({connectedNodes.length})</span>
              <Network size={12} />
            </div>

            <div className="space-y-1.5">
              {connectedNodes.length === 0 ? (
                <p className="text-[11px] text-[#686E7C]">No connections attached yet.</p>
              ) : (
                connectedNodes.map((n) => (
                  <button
                    key={n?.id}
                    onClick={() => {
                      if (n) setSelectedNodeId(n.id);
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] text-left text-xs text-[#A7ACB8] hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{n?.title}</span>
                    <ArrowRight size={12} className="text-[#686E7C] group-hover:text-[#5EE7FF] shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* SUGGESTED ACTIONS */}
          {node.suggestedActions && node.suggestedActions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#686E7C]">
                Suggested Next Moves
              </span>
              <div className="space-y-1.5">
                {node.suggestedActions.map((action, i) => (
                  <div
                    key={i}
                    onClick={() => onAskAI(`How can I accomplish: "${action}" for ${node.title}?`)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-[#7C5CFF]/40 text-[#A7ACB8] hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{action}</span>
                    <ArrowRight size={12} className="text-[#686E7C] group-hover:text-[#5EE7FF] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS PALETTE */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#686E7C]">
              Actions
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBranchSubIdea}
                disabled={isExpanding}
                className="p-2.5 rounded-xl bg-[#7C5CFF]/15 hover:bg-[#7C5CFF]/25 border border-[#7C5CFF]/30 text-[#9B84FF] font-medium flex items-center justify-center space-x-1.5 transition-all text-xs"
              >
                <Plus size={13} />
                <span>{isExpanding ? 'Branching...' : 'Branch Sub-idea'}</span>
              </button>

              <button
                onClick={handleConvertToTask}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[#A7ACB8] hover:text-white flex items-center justify-center space-x-1.5 transition-all text-xs font-medium"
              >
                <CheckSquare size={13} className="text-[#45E0A8]" />
                <span>Create Task</span>
              </button>

              <button
                onClick={() => onAskAI(`Explain key trade-offs and next strategic moves for "${node.title}".`)}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[#A7ACB8] hover:text-white flex items-center justify-center space-x-1.5 transition-all text-xs font-medium"
              >
                <Lightbulb size={13} className="text-[#F5B84B]" />
                <span>Ask AI</span>
              </button>

              <button
                onClick={() => deleteNodeFromActiveFlow(node.id)}
                className="p-2.5 rounded-xl bg-[#FF5C6C]/10 hover:bg-[#FF5C6C]/20 border border-[#FF5C6C]/20 text-[#FF5C6C] flex items-center justify-center space-x-1.5 transition-all text-xs font-medium"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY: CONTEXTUAL AI INTELLIGENCE */}
      {activeTab === 'intelligence' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left custom-scrollbar text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <span className="font-semibold text-white flex items-center space-x-2">
              <Sparkles size={14} className="text-[#5EE7FF]" />
              <span>Contextual AI Observer</span>
            </span>
            <span className="text-[10px] text-[#45E0A8] font-mono">OBSERVING</span>
          </div>

          <p className="text-xs text-[#A7ACB8] leading-relaxed">
            FlowMind analyzes the topology of your thoughts to surface missing connections, contradictions, and high-leverage execution steps.
          </p>

          {/* AI Contextual Card 1: Discovered Connections */}
          <div className="p-4 rounded-xl bg-[#151823] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5EE7FF] font-semibold">
                Possible Connections
              </span>
              <span className="text-[10px] font-mono text-[#686E7C]">3 DETECTED</span>
            </div>
            <p className="text-xs text-[#F4F5F7] leading-relaxed">
              Found 3 natural relationships between <strong>{node?.title}</strong> and your Career and Projects roadmaps.
            </p>
            <button
              onClick={handleBranchSubIdea}
              className="w-full py-1.5 px-3 rounded-lg bg-[#5EE7FF]/15 hover:bg-[#5EE7FF]/25 border border-[#5EE7FF]/30 text-[#5EE7FF] font-medium text-[11px] transition-colors flex items-center justify-center space-x-1"
            >
              <span>Connect Nodes</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* AI Contextual Card 2: Contradiction / Trade-off */}
          <div className="p-4 rounded-xl bg-[#151823] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#F5B84B] font-semibold flex items-center space-x-1">
                <AlertTriangle size={12} />
                <span>Trade-off Identified</span>
              </span>
            </div>
            <p className="text-xs text-[#A7ACB8] leading-relaxed">
              Balancing strong consistency with low latency creates architectural fragility if replication lags spike.
            </p>
            <button
              onClick={() => onAskAI(`What are the recommended trade-offs between consistency and latency for ${node?.title}?`)}
              className="text-[#F5B84B] hover:underline text-[11px] font-medium flex items-center space-x-1"
            >
              <span>Review Trade-off Options →</span>
            </button>
          </div>

          {/* AI Contextual Card 3: Synthesized Insight */}
          <div className="p-4 rounded-xl bg-[#151823] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9B84FF] font-semibold">
                Possible Insight
              </span>
            </div>
            <p className="text-xs text-[#F4F5F7] leading-relaxed italic">
              &quot;Structuring concurrency primitives early will reduce subsequent distributed test debugging by an estimated 40%.&quot;
            </p>
            <button
              onClick={handleAddInsightToCanvas}
              className="w-full py-1.5 px-3 rounded-lg bg-[#7C5CFF]/15 hover:bg-[#7C5CFF]/25 border border-[#7C5CFF]/30 text-[#9B84FF] font-medium text-[11px] transition-colors flex items-center justify-center space-x-1"
            >
              <span>+ Add Insight to Canvas</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

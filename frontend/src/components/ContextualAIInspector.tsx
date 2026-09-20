import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Plus, CheckSquare, Trash2, ArrowRight,
  Share2, FileText, Tag, BarChart2, ShieldAlert, Cpu,
  ExternalLink, ChevronRight, Layers, Lightbulb, Zap
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
    thinkingPatterns,
  } = useFlow();

  const [activeTab, setActiveTab] = useState<'inspector' | 'ai-insights'>('inspector');
  const [isExpanding, setIsExpanding] = useState(false);

  if (!isOpen && !selectedNode) return null;

  const node = selectedNode || activeFlow?.nodes[0];

  const handleExpandWithAI = () => {
    setIsExpanding(true);
    soundService.playChime();

    setTimeout(() => {
      if (node) {
        addNodeToActiveFlow({
          parentId: node.id,
          title: `AI Expansion: ${node.title} Strategy`,
          description: `Second-order decomposition based on ${node.title}.`,
          type: 'idea',
          x: (node.x || 450) + 160,
          y: (node.y || 200) + 120,
        });
      }
      setIsExpanding(false);
      soundService.playSuccess();
    }, 600);
  };

  const handleConvertToTask = () => {
    if (!node) return;
    addTask({
      title: `Complete: ${node.title}`,
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

  const typeColors: Record<string, { bg: string; text: string; border: string }> = {
    core: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    idea: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    decision: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    task: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    goal: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
    result: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
    resource: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  };

  const currentTypeTheme = typeColors[node?.type || 'idea'] || typeColors.idea;

  return (
    <aside className="w-80 sm:w-96 h-full shrink-0 border-l border-white/[0.08] bg-[#070914]/95 backdrop-blur-2xl flex flex-col z-30 shadow-[-20px_0_40px_rgba(0,0,0,0.6)] font-sans">
      {/* Panel Tabs Header */}
      <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('inspector');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'inspector'
                ? 'bg-white/[0.08] text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Node Inspector
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('ai-insights');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'ai-insights'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-400/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI Insights</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Inspector Mode */}
      {activeTab === 'inspector' && node && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left">
          {/* Node Badge & Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${currentTypeTheme.bg} ${currentTypeTheme.text} ${currentTypeTheme.border}`}>
                {node.type}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                ID: {node.id.slice(-6)}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white font-sans leading-tight">
              {node.title}
            </h3>

            {node.description && (
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                {node.description}
              </p>
            )}
          </div>

          {/* AI Structured Intelligence Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0C1226] to-[#080B16] border border-cyan-500/25 space-y-2.5 shadow-lg">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI SYNTHESIS SUMMARY</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {node.aiSummary || 'Connected node anchoring key downstream deliverables and strategic dependency paths.'}
            </p>
          </div>

          {/* Suggested Next Actions */}
          {node.suggestedActions && node.suggestedActions.length > 0 && (
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                SUGGESTED NEXT ACTIONS
              </span>
              <div className="space-y-1.5">
                {node.suggestedActions.map((action, i) => (
                  <div
                    key={i}
                    onClick={() => onAskAI(`How can I accomplish: "${action}" for ${node.title}?`)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-cyan-400/40 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between text-xs group"
                  >
                    <span className="truncate pr-2">{action}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Thoughts Lineage */}
          {node.relatedThoughts && node.relatedThoughts.length > 0 && (
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                RELATED THOUGHTS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {node.relatedThoughts.map((thought, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[11px] text-slate-300 font-sans"
                  >
                    ✦ {thought}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Metadata */}
          {node.tags && (
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                TAGS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {node.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06] text-[10px] text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions Palette */}
          <div className="pt-4 border-t border-white/[0.08] space-y-2 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              ACTIONS
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExpandWithAI}
                disabled={isExpanding}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-400/40 text-cyan-300 font-bold flex items-center justify-center space-x-1.5 transition-all text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExpanding ? 'Expanding...' : 'Expand AI'}</span>
              </button>

              <button
                onClick={handleConvertToTask}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-all text-xs"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Make Task</span>
              </button>

              <button
                onClick={() => onAskAI(`Explain key trade-offs and next strategic moves for "${node.title}".`)}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-all text-xs"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI</span>
              </button>

              <button
                onClick={() => deleteNodeFromActiveFlow(node.id)}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center space-x-1.5 transition-all text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body: AI Intelligence & Thinking Patterns */}
      {activeTab === 'ai-insights' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <span className="text-xs font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>FLOWMIND INTELLIGENCE</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">LIVE OBSERVATIONS</span>
          </div>

          <p className="text-xs text-slate-300 font-sans font-light leading-relaxed">
            FlowMind analyzes connections across all active thoughts to surface blind spots and high-leverage actions.
          </p>

          <div className="space-y-3 pt-2">
            {thinkingPatterns.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-cyan-400/40 space-y-2 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    ✦ {p.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500">OPTIMIZED</span>
                </div>

                <div className="text-xs font-bold text-white font-sans">
                  {p.title}
                </div>

                <p className="text-xs text-slate-300 font-sans font-light leading-relaxed">
                  {p.insight}
                </p>

                <button
                  onClick={() => onAskAI(`How should I proceed with: ${p.actionText}`)}
                  className="w-full pt-2 flex items-center justify-between text-[11px] text-cyan-300 hover:text-cyan-200 font-bold border-t border-white/[0.06] mt-2 group-hover:pl-1 transition-all"
                >
                  <span>{p.actionText}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

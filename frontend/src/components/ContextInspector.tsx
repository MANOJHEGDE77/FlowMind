import React from 'react';
import {
  X, BookOpen, Crown, ShieldAlert, Sparkles,
  ArrowRight, Quote, FileText, CheckCircle2
} from 'lucide-react';
import { EvidenceItem } from '../types';

interface ContextInspectorProps {
  nodeType: string | null;
  nodeData: any;
  evidenceItems: EvidenceItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  nodeType,
  nodeData,
  evidenceItems,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !nodeData) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[var(--surface-blur)] backdrop-blur-2xl border-l border-[var(--line-color)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="p-5 border-b border-[var(--line-color)] flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold block">
            CONTEXTUAL NODE EXPANSION
          </span>
          <h3 className="text-sm font-semibold text-[var(--text-vivid)] truncate max-w-xs">
            {nodeData.title || nodeData.recommendation || 'Decision Factor'}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-[var(--text-faint)] hover:text-[var(--text-vivid)] p-1 rounded-full hover:bg-[var(--canvas-subtle)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs font-mono">
        {/* WHY THIS MATTERS */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider block">
            WHY THIS MATTERS
          </span>
          <p className="text-xs font-sans text-[var(--text-body)] leading-relaxed bg-[var(--canvas-subtle)] p-3.5 rounded-2xl border border-[var(--line-color)]">
            {nodeData.description || nodeData.summary || nodeData.context || 'Strategic factor bearing upon equilibrium scores and risk weighting.'}
          </p>
        </div>

        {/* Alignment Metrics */}
        {nodeData.alignment_scores && Object.keys(nodeData.alignment_scores).length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider block">
              DIMENSIONAL SCORES
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {Object.entries(nodeData.alignment_scores).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                  <span className="text-[9px] text-[var(--text-faint)] uppercase block">{k}</span>
                  <span className="text-xs font-bold text-sky-400">{String(v)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grounded Evidence Citations */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">
              GROUNDED EVIDENCE EXCERPTS
            </span>
            <span className="text-emerald-400 text-[10px]">{evidenceItems.length} Sources</span>
          </div>

          <div className="space-y-2">
            {evidenceItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1.5 font-sans"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-[var(--text-vivid)] truncate max-w-[200px]">
                    {item.claim}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {item.page_or_section || 'Page 1'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/20 border-l-2 border-emerald-400 text-[11px] text-[var(--text-body)] italic">
                  "{item.quote}"
                </div>

                <div className="text-[10px] font-mono text-[var(--text-faint)] pt-1 flex items-center justify-between">
                  <span>Source: {item.source_title}</span>
                  <span>Agent: {item.agent_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

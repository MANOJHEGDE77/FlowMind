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

        {/* Option Pros & Cons */}
        {((nodeData.pros && nodeData.pros.length > 0) || (nodeData.cons && nodeData.cons.length > 0)) && (
          <div className="space-y-4">
            {nodeData.pros && nodeData.pros.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold block">
                  ✦ STRATEGIC ADVANTAGES (PROS)
                </span>
                <div className="space-y-1.5">
                  {nodeData.pros.map((p: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-sans flex items-start space-x-2"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nodeData.cons && nodeData.cons.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold block">
                  ▲ RISKS & BOTTLENECKS (CONS)
                </span>
                <div className="space-y-1.5">
                  {nodeData.cons.map((c: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-sans flex items-start space-x-2"
                    >
                      <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Grounded Evidence Citations (RAG Provenance) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--line-color)] pb-2">
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
              GROUNDED EVIDENCE PROVENANCE
            </span>
            <span className="text-emerald-400 text-[10px] font-mono">{evidenceItems.length} Citations Linked</span>
          </div>

          <div className="space-y-3">
            {evidenceItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[var(--canvas-subtle)] border border-white/[0.08] space-y-2 font-mono text-[11px]"
              >
                {/* SOURCE */}
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                    SOURCE
                  </span>
                  <div className="flex items-center justify-between text-white font-medium">
                    <span className="truncate max-w-[240px] text-xs flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{item.source_title || 'Uploaded Document'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                      {item.page_or_section || 'Verified Excerpt'}
                    </span>
                  </div>
                </div>

                {/* EVIDENCE */}
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
                    EVIDENCE
                  </span>
                  <div className="p-2.5 rounded-xl bg-black/40 border-l-2 border-emerald-400 text-[11px] text-slate-200 font-sans italic leading-relaxed">
                    "{item.quote || item.claim}"
                  </div>
                </div>

                {/* USED BY */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                    USED BY
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-bold">
                      {item.agent_name || 'Analyst'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[10px]">
                      Skeptic
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  X, BookOpen, Crown, ShieldAlert, Sparkles,
  ArrowRight, Quote, FileText, CheckCircle2
} from 'lucide-react';
import { DecisionOption, EvidenceItem } from '../types';

interface ReasoningDrawerProps {
  nodeType: string | null;
  nodeData: any;
  evidenceItems: EvidenceItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ReasoningDrawer: React.FC<ReasoningDrawerProps> = ({
  nodeType,
  nodeData,
  evidenceItems,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !nodeData) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-subtle)]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
              CONTEXTUAL REASONING INSPECTOR
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-xs">
              {nodeData.title || nodeData.recommendation || 'Node Details'}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* WHY THIS MATTERS */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
            WHY THIS MATTERS
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] leading-relaxed">
            {nodeData.description || nodeData.summary || nodeData.context || 'Critical factor influencing the multi-agent consensus and calibrated confidence weighting.'}
          </div>
        </div>

        {/* Alignment Metrics if Option */}
        {nodeData.alignment_scores && Object.keys(nodeData.alignment_scores).length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
              DIMENSIONAL BENCHMARK
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(nodeData.alignment_scores).map(([k, v]) => (
                <div
                  key={k}
                  className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-center font-mono"
                >
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase">{k}</span>
                  <span className="text-xs font-semibold text-sky-400">{String(v)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grounded Evidence Citations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
            <span>GROUNDED EVIDENCE CITATIONS</span>
            <span className="text-emerald-400">{evidenceItems.length} Sources</span>
          </div>

          <div className="space-y-2">
            {evidenceItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[var(--text-primary)] truncate">
                    {item.claim}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {item.page_or_section || 'Page 1'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[var(--bg-surface)] border-l-2 border-emerald-400 text-[11px] text-[var(--text-secondary)] italic">
                  "{item.quote}"
                </div>

                <div className="text-[10px] text-[var(--text-muted)] pt-1 flex items-center justify-between">
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

import React, { useState, useEffect } from 'react';
import {
  Download, Copy, Check, X, FileText, Share2,
  Crown, Sparkles, ShieldAlert, BookOpen, CheckCircle2
} from 'lucide-react';
import { Decision } from '../types';
import { useToast } from '../context/ToastContext';

interface ExportDecisionModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDecisionModal: React.FC<ExportDecisionModalProps> = ({
  decision,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'memo' | 'json'>('memo');
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !decision) return null;

  const winnerOption = decision.options.find((o) => o.is_recommended) || decision.options[0];

  const generateMarkdownMemo = (): string => {
    const lines: string[] = [];
    lines.push(`# FlowMind Executive Decision Memo: "${decision.title}"`);
    lines.push(`*Generated on: ${new Date(decision.created_at).toLocaleDateString()} | Calibrated Confidence: ${decision.confidence_score}%*`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 1. Executive Summary & Recommended Signal');
    lines.push(`**Recommended Action:** **${decision.recommendation || winnerOption?.title}**`);
    lines.push(`**Calibrated Model Confidence:** ${decision.confidence_score}%`);
    lines.push(`**Decision Score:** ${decision.decision_score || winnerOption?.score || 85} / 100`);
    lines.push('');
    lines.push('### Decisive Synthesis:');
    lines.push(decision.reasoning_summary || 'Multi-agent arbitration determined this pathway maximizes compounding upside with bounded downside exposure.');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 2. Competing Pathways Evaluated');
    decision.options.forEach((opt, idx) => {
      lines.push(`### Option ${idx + 1}: ${opt.title} ${opt.is_recommended ? '(★ Recommended)' : ''}`);
      lines.push(`- **Equilibrium Score:** ${opt.score}/100`);
      if (opt.description) lines.push(`- **Context:** ${opt.description}`);
      if (opt.pros && opt.pros.length > 0) {
        lines.push(`- **Pros:** ${opt.pros.join('; ')}`);
      }
      if (opt.cons && opt.cons.length > 0) {
        lines.push(`- **Risks/Cons:** ${opt.cons.join('; ')}`);
      }
      lines.push('');
    });

    lines.push('---');
    lines.push('');
    lines.push('## 3. Multi-Agent Council Arbitration');
    decision.agent_runs.forEach((run) => {
      lines.push(`- **${run.agent_name}** (${run.agent_role}, ${Math.round(run.confidence * 100)}% confidence):`);
      lines.push(`  > ${run.viewpoint}`);
    });

    if (decision.contradictions && decision.contradictions.length > 0) {
      lines.push('');
      lines.push('### Council Arbitration Friction Points:');
      decision.contradictions.forEach((c) => {
        lines.push(`- ${c}`);
      });
    }

    if (decision.evidence_items && decision.evidence_items.length > 0) {
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push('## 4. Grounded Evidence Citations');
      decision.evidence_items.forEach((ev) => {
        lines.push(`- **[${ev.claim}]** (${ev.source_title}, ${ev.page_or_section || 'Page 1'}): "${ev.quote}"`);
      });
    }

    lines.push('');
    lines.push('---');
    lines.push('*Produced autonomously by FlowMind Decision Intelligence Engine*');

    return lines.join('\n');
  };

  const memoText = generateMarkdownMemo();
  const jsonText = JSON.stringify(decision, null, 2);

  const handleCopy = () => {
    const textToCopy = activeTab === 'memo' ? memoText : jsonText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast(`${activeTab === 'memo' ? 'Executive Memo' : 'Decision JSON'} copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isMemo = activeTab === 'memo';
    const content = isMemo ? memoText : jsonText;
    const filename = `${decision.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${isMemo ? 'memo.md' : 'snapshot.json'}`;
    const blob = new Blob([content], { type: isMemo ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--surface-blur)] border border-cyan-500/30 shadow-2xl overflow-hidden font-sans">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[var(--line-color)] flex items-center justify-between shrink-0 bg-black/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Export Executive Decision Memo
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Share full synthesis, 7-agent debate consensus, and calibrated confidence
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-white/5 p-0.5 rounded-full border border-white/10 text-xs font-mono">
              <button
                onClick={() => setActiveTab('memo')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  activeTab === 'memo' ? 'bg-cyan-500 text-space-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Markdown Memo
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  activeTab === 'json' ? 'bg-cyan-500 text-space-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw JSON
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calibrated Signal: {decision.recommendation || winnerOption?.title} ({decision.confidence_score}%)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {decision.options.length} Pathways • {decision.agent_runs.length} Agents
            </span>
          </div>

          <pre className="p-4 rounded-2xl bg-black/50 border border-[var(--line-color)] text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-[50vh] leading-relaxed select-text">
            {activeTab === 'memo' ? memoText : jsonText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--line-color)] flex items-center justify-between shrink-0 bg-black/40">
          <span className="text-[11px] font-mono text-slate-400">
            Export ready for Notion, Obsidian, Slack, or Docs
          </span>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

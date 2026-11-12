import React, { useState, useEffect } from 'react';
import {
  Download, Copy, Check, X, Share2, Crown, Printer,
  FileText, Table, Code, Sparkles, ExternalLink
} from 'lucide-react';
import { Decision, FlowGraph } from '../types';
import { useToast } from '../context/ToastContext';

interface ExportDecisionModalProps {
  decision?: Decision | null;
  flow?: FlowGraph | null;
  isOpen: boolean;
  onClose: () => void;
}

type ExportTab = 'memo' | 'html' | 'csv' | 'json';

export const ExportDecisionModal: React.FC<ExportDecisionModalProps> = ({
  decision,
  flow,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ExportTab>('html');
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

  if (!isOpen) return null;

  // Title and metadata resolution
  const title = decision?.title || flow?.title || 'FlowMind Strategic Blueprint';
  const subtitle = decision
    ? `Confidence: ${decision.confidence_score}% • Score: ${decision.decision_score}/100`
    : flow
    ? `${flow.nodes.length} Thoughts • Category: ${flow.category} • Progress: ${flow.progress}%`
    : 'Executive Intelligence Brief';

  const winnerOption = decision?.options?.find((o) => o.is_recommended) || decision?.options?.[0];
  const recommendation = decision?.recommendation || winnerOption?.title || (flow ? `Execute priority path for ${flow.title}` : 'Proceed with validated plan');

  // 1. Generate Plain-English Markdown Memo
  const generateMarkdownMemo = (): string => {
    const lines: string[] = [];
    lines.push(`# FlowMind Executive Memo: "${title}"`);
    lines.push(`*Generated on: ${new Date().toLocaleDateString()} | ${subtitle}*`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 1. Executive Summary & Recommended Choice');
    lines.push(`**What We Recommend:** **${recommendation}**`);
    if (decision) {
      lines.push(`**AI Confidence Score:** ${decision.confidence_score}% (calibrated across 7 independent AI advisors)`);
      lines.push(`**Overall Score:** ${decision.decision_score || winnerOption?.score || 85} / 100`);
      lines.push('');
      lines.push('### Plain-English Explanation:');
      lines.push(decision.reasoning_summary || 'This choice delivers the strongest long-term return with minimal irreversible risk and the fastest time to value.');
    } else if (flow) {
      lines.push(`**Current Completion:** ${flow.progress}%`);
      lines.push(`**Target Category:** ${flow.category}`);
      lines.push('');
      lines.push('### Overview:');
      lines.push(flow.description || 'Structured knowledge roadmap balancing high-leverage foundational thoughts with tactical execution tasks.');
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    if (decision && decision.options.length > 0) {
      lines.push('## 2. Options Compared');
      decision.options.forEach((opt, idx) => {
        lines.push(`### Option ${idx + 1}: ${opt.title} ${opt.is_recommended ? '(★ Best Choice)' : ''}`);
        lines.push(`- **Score:** ${opt.score}/100`);
        if (opt.description) lines.push(`- **Context:** ${opt.description}`);
        if (opt.pros && opt.pros.length > 0) {
          lines.push(`- **Why it is good:** ${opt.pros.join('; ')}`);
        }
        if (opt.cons && opt.cons.length > 0) {
          lines.push(`- **What to watch out for:** ${opt.cons.join('; ')}`);
        }
        lines.push('');
      });
    } else if (flow && flow.nodes.length > 0) {
      lines.push('## 2. Key Thoughts & Actions in this Flow');
      flow.nodes.forEach((node, idx) => {
        lines.push(`### ${idx + 1}. [${node.type.toUpperCase()}] ${node.title} (${node.priority || 'standard'} priority)`);
        if (node.description) lines.push(`- **Description:** ${node.description}`);
        if (node.aiSummary) lines.push(`- **AI Insight:** ${node.aiSummary}`);
        if (node.suggestedActions && node.suggestedActions.length > 0) {
          lines.push(`- **Next Steps:** ${node.suggestedActions.join('; ')}`);
        }
        lines.push('');
      });
    }

    if (decision?.agent_runs && decision.agent_runs.length > 0) {
      lines.push('---');
      lines.push('');
      lines.push('## 3. 7-Agent Council Consensus');
      decision.agent_runs.forEach((run) => {
        lines.push(`- **${run.agent_name}** (${run.agent_role}):`);
        lines.push(`  > "${run.viewpoint}"`);
      });
    }

    if (decision?.evidence_items && decision.evidence_items.length > 0) {
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push('## 4. Grounded Citations & Real Evidence');
      decision.evidence_items.forEach((ev) => {
        lines.push(`- **[${ev.claim}]** (${ev.source_title}, ${ev.page_or_section || 'Page 1'}): "${ev.quote}"`);
      });
    }

    lines.push('');
    lines.push('---');
    lines.push('*Created with FlowMind Decision Intelligence Engine*');
    return lines.join('\n');
  };

  // 2. Generate Interactive, Printable HTML Presentation Report
  const generateHtmlReport = (): string => {
    const isDark = true;
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — FlowMind Executive Brief</title>
  <style>
    :root {
      --bg: #090B10;
      --card-bg: #12151E;
      --border: #222738;
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --accent: #5EE7FF;
      --accent-purple: #7C5CFF;
      --success: #34D399;
      --warning: #FBBF24;
      --danger: #F87171;
    }
    @media print {
      body { background: #FFFFFF !important; color: #111827 !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .card { background: #F9FAFB !important; border: 1px solid #E5E7EB !important; color: #111827 !important; break-inside: avoid; }
      .badge-rec { background: #ECFDF5 !important; color: #065F46 !important; border: 1px solid #A7F3D0 !important; }
      h1, h2, h3 { color: #111827 !important; }
      p, li { color: #374151 !important; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--accent);
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .meta {
      font-size: 13px;
      color: var(--text-muted);
    }
    .hero-card {
      background: linear-gradient(135deg, rgba(124, 92, 255, 0.12), rgba(94, 231, 255, 0.12));
      border: 1px solid rgba(94, 231, 255, 0.3);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .hero-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(52, 211, 153, 0.2);
      color: var(--success);
      border: 1px solid rgba(52, 211, 153, 0.4);
      margin-bottom: 12px;
    }
    .hero-rec {
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 10px;
    }
    .hero-desc {
      font-size: 14px;
      color: #D1D5DB;
      line-height: 1.6;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 32px 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #FFFFFF;
    }
    .score-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(94, 231, 255, 0.15);
      color: var(--accent);
    }
    .pro-list, .con-list {
      list-style: none;
      margin-top: 10px;
      font-size: 12.5px;
    }
    .pro-list li {
      color: #A7F3D0;
      margin-bottom: 6px;
      padding-left: 18px;
      position: relative;
    }
    .pro-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: var(--success);
      font-weight: 700;
    }
    .con-list li {
      color: #FECACA;
      margin-bottom: 6px;
      padding-left: 18px;
      position: relative;
    }
    .con-list li::before {
      content: "!";
      position: absolute;
      left: 2px;
      color: var(--warning);
      font-weight: 700;
    }
    .council-quote {
      background: rgba(255, 255, 255, 0.03);
      border-left: 3px solid var(--accent-purple);
      padding: 12px 16px;
      border-radius: 0 10px 10px 0;
      font-size: 13px;
      color: #E5E7EB;
      margin-bottom: 12px;
    }
    .council-author {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      margin-top: 4px;
    }
    footer {
      border-top: 1px solid var(--border);
      padding-top: 24px;
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
    }
    .print-btn {
      background: #5EE7FF;
      color: #08090D;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="brand">✦ FlowMind Intelligence Report</div>
        <h1>${title}</h1>
        <div class="meta">Date: ${nowStr} • ${subtitle}</div>
      </div>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
      </div>
    </header>

    <div class="hero-card">
      <div class="hero-badge">★ Recommended Pathway</div>
      <div class="hero-rec">${recommendation}</div>
      <p class="hero-desc">
        ${
          decision?.reasoning_summary ||
          (flow
            ? `Top execution roadmap designed to systematically achieve: "${flow.title}".`
            : 'Clear choice backed by empirical base rates, downside containment, and maximum reversibility.')
        }
      </p>
    </div>

    ${
      decision?.options && decision.options.length > 0
        ? `
      <div class="section-title">Evaluated Choices & Tradeoffs</div>
      <div class="grid">
        ${decision.options
          .map(
            (opt) => `
          <div class="card">
            <div class="card-header">
              <span class="card-title">${opt.title} ${opt.is_recommended ? '★' : ''}</span>
              <span class="score-badge">${opt.score}/100</span>
            </div>
            ${opt.description ? `<p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">${opt.description}</p>` : ''}
            ${
              opt.pros && opt.pros.length > 0
                ? `<ul class="pro-list">${opt.pros.map((p) => `<li>${p}</li>`).join('')}</ul>`
                : ''
            }
            ${
              opt.cons && opt.cons.length > 0
                ? `<ul class="con-list">${opt.cons.map((c) => `<li>${c}</li>`).join('')}</ul>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    `
        : flow?.nodes && flow.nodes.length > 0
        ? `
      <div class="section-title">Cognitive Graph Milestones</div>
      <div class="grid">
        ${flow.nodes
          .map(
            (node) => `
          <div class="card">
            <div class="card-header">
              <span class="card-title">${node.title}</span>
              <span class="score-badge">${node.priority || 'standard'}</span>
            </div>
            ${node.description ? `<p style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">${node.description}</p>` : ''}
            ${node.aiSummary ? `<p style="font-size:12px; color:#93C5FD; margin-bottom:8px;">✦ ${node.aiSummary}</p>` : ''}
            ${
              node.suggestedActions && node.suggestedActions.length > 0
                ? `<ul class="pro-list">${node.suggestedActions.map((a) => `<li>${a}</li>`).join('')}</ul>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    `
        : ''
    }

    ${
      decision?.agent_runs && decision.agent_runs.length > 0
        ? `
      <div class="section-title">7-Agent Council Feedback</div>
      <div>
        ${decision.agent_runs
          .map(
            (run) => `
          <div class="council-quote">
            "${run.viewpoint}"
            <div class="council-author">— ${run.agent_name} (${run.agent_role})</div>
          </div>
        `
          )
          .join('')}
      </div>
    `
        : ''
    }

    <footer>
      FlowMind Decision Intelligence Platform • Clear, Unbiased, Actionable
    </footer>
  </div>
</body>
</html>`;
  };

  // 3. Generate Clean CSV Matrix (Excel & Google Sheets ready)
  const generateCsvMatrix = (): string => {
    const rows: string[][] = [];

    if (decision && decision.options.length > 0) {
      rows.push(['Rank', 'Option Title', 'Recommended', 'Score', 'Context', 'Advantages (Pros)', 'Risks (Cons)']);
      decision.options.forEach((opt, idx) => {
        rows.push([
          String(idx + 1),
          opt.title,
          opt.is_recommended ? 'YES' : 'NO',
          String(opt.score),
          opt.description || '',
          (opt.pros || []).join(' | '),
          (opt.cons || []).join(' | '),
        ]);
      });
    } else if (flow && flow.nodes.length > 0) {
      rows.push(['Node Type', 'Title', 'Priority', 'Progress (%)', 'Description', 'AI Insight', 'Suggested Actions']);
      flow.nodes.forEach((node) => {
        rows.push([
          node.type,
          node.title,
          node.priority || 'medium',
          String(node.progress || 0),
          node.description || '',
          node.aiSummary || '',
          (node.suggestedActions || []).join(' | '),
        ]);
      });
    } else {
      rows.push(['Metric', 'Value']);
      rows.push(['Title', title]);
      rows.push(['Recommendation', recommendation]);
    }

    return rows
      .map((row) =>
        row
          .map((cell) => {
            const clean = String(cell || '').replace(/"/g, '""');
            return `"${clean}"`;
          })
          .join(',')
      )
      .join('\n');
  };

  // 4. Generate JSON Snapshot
  const generateJsonSnapshot = (): string => {
    if (decision) {
      return JSON.stringify(decision, null, 2);
    }
    if (flow) {
      return JSON.stringify(flow, null, 2);
    }
    return JSON.stringify({ title, recommendation, exportedAt: new Date().toISOString() }, null, 2);
  };

  const memoText = generateMarkdownMemo();
  const htmlText = generateHtmlReport();
  const csvText = generateCsvMatrix();
  const jsonText = generateJsonSnapshot();

  const getActiveContent = (): string => {
    switch (activeTab) {
      case 'memo':
        return memoText;
      case 'html':
        return htmlText;
      case 'csv':
        return csvText;
      case 'json':
        return jsonText;
    }
  };

  const getFileExtension = (): string => {
    switch (activeTab) {
      case 'memo':
        return 'md';
      case 'html':
        return 'html';
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
    }
  };

  const getMimeType = (): string => {
    switch (activeTab) {
      case 'memo':
        return 'text/markdown';
      case 'html':
        return 'text/html';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
    }
  };

  const handleCopy = () => {
    const textToCopy = getActiveContent();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast(`${activeTab.toUpperCase()} content copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    const ext = getFileExtension();
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${cleanTitle || 'flowmind-report'}-${activeTab}.${ext}`;

    const blob = new Blob([content], { type: `${getMimeType()};charset=utf-8` });
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

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlText);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // Ignore popup or print blocker errors
        }
      }, 300);
    } else {
      // Fallback: download the HTML file and alert user
      handleDownload();
      showToast('Popup was blocked: Downloaded HTML report instead. Open and press Ctrl+P to print.', 'info');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0F1118] border border-white/[0.12] shadow-2xl overflow-hidden font-sans">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#08090D]/80">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-white truncate">
                Export Executive Report: {title}
              </h3>
              <p className="text-[11px] text-[#A7ACB8] font-sans truncate">
                Share clear memos, printable PDF briefs, or spreadsheet comparison matrices
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Format Tabs */}
            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
                  activeTab === 'html'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs'
                    : 'text-[#A7ACB8] hover:text-white'
                }`}
                title="Printable presentation report with cards and badges"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>HTML Report</span>
              </button>

              <button
                onClick={() => setActiveTab('memo')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
                  activeTab === 'memo'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs'
                    : 'text-[#A7ACB8] hover:text-white'
                }`}
                title="Plain-English Markdown for Notion, Slack, or Docs"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Markdown</span>
              </button>

              <button
                onClick={() => setActiveTab('csv')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
                  activeTab === 'csv'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs'
                    : 'text-[#A7ACB8] hover:text-white'
                }`}
                title="Tabular matrix for Excel and Google Sheets"
              >
                <Table className="w-3.5 h-3.5" />
                <span>CSV Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeTab === 'json'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs'
                    : 'text-[#A7ACB8] hover:text-white'
                }`}
                title="Raw JSON snapshot"
              >
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#686E7C] hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Sub-Bar */}
        <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs text-[#A7ACB8]">
          <div className="flex items-center space-x-2">
            <Crown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white font-medium">Recommended: {recommendation}</span>
          </div>
          <span className="font-mono text-[11px] text-[#686E7C]">
            {activeTab === 'html'
              ? 'Ready for Presentation & Browser Print/PDF'
              : activeTab === 'memo'
              ? 'Ready for Notion, Obsidian, GitHub & Slack'
              : activeTab === 'csv'
              ? 'Ready for Microsoft Excel & Google Sheets'
              : 'Machine-Readable State Backup'}
          </span>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {activeTab === 'html' ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#090B10] overflow-hidden">
              <div className="p-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-[11px] text-[#A7ACB8]">
                <span>Interactive HTML Report Preview</span>
                <button
                  onClick={handlePrintPdf}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Open Print Dialog</span>
                </button>
              </div>
              <iframe
                title="Report Preview"
                srcDoc={htmlText}
                className="w-full h-[48vh] border-0 bg-transparent"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          ) : (
            <pre className="p-4 rounded-2xl bg-[#090B10] border border-white/[0.08] text-xs text-[#E5E7EB] font-mono overflow-x-auto whitespace-pre-wrap max-h-[50vh] leading-relaxed select-text">
              {getActiveContent()}
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] flex items-center justify-between shrink-0 bg-[#08090D]/80">
          <div className="flex items-center space-x-2 text-[11px] text-[#686E7C]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Autonomous FlowMind Synthesis</span>
          </div>

          <div className="flex items-center space-x-2.5">
            {activeTab === 'html' && (
              <button
                onClick={handlePrintPdf}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
                title="Print or Save as PDF via browser"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium border border-white/[0.1] transition-colors"
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
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{getFileExtension()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

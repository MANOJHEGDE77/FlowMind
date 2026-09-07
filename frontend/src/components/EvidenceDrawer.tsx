import React, { useState } from 'react';
import {
  BookOpen, X, FileText, CheckCircle2, ExternalLink,
  Search, ShieldCheck, Quote
} from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceDrawerProps {
  evidence: EvidenceItem[];
  isOpen: boolean;
  onClose: () => void;
  onUploadNew: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  evidence,
  isOpen,
  onClose,
  onUploadNew,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(
    evidence[0] || null
  );

  if (!isOpen) return null;

  const filtered = evidence.filter(e =>
    e.claim.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.source_title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.quote.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-space-900 border-l border-space-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-space-800 flex items-center justify-between bg-space-950/50">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Grounded Evidence & Citations
            </h3>
            <p className="text-[11px] text-slate-400">
              Traceable claims linked to verified source documents
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onUploadNew}
            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
          >
            + Ingest Doc
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-space-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-3 border-b border-space-800 bg-space-950/20">
        <div className="flex items-center px-3 py-1.5 bg-space-850 rounded-lg border border-space-750">
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search claims or citations..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* List & Detail View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No matching evidence found. Upload a PDF, DOCX, or contract to ground claims.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-space-950/80 border border-space-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all space-y-2.5"
            >
              {/* Claim */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    CLAIM
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {item.claim}
                  </span>
                </div>
              </div>

              {/* Source & Page */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium truncate">
                  {item.source_title}
                </span>
                {item.page_or_section && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400">{item.page_or_section}</span>
                  </>
                )}
                <span>•</span>
                <span className="text-slate-500">Agent: {item.agent_name}</span>
              </div>

              {/* Exact Quote */}
              <div className="bg-space-900 border-l-2 border-emerald-500 p-2.5 rounded-r-lg text-xs text-slate-300 italic flex items-start space-x-2">
                <Quote className="w-3 h-3 text-emerald-500/50 shrink-0 mt-0.5" />
                <span>"{item.quote}"</span>
              </div>

              {/* Why this evidence matters */}
              <div className="text-[11px] text-slate-400 pt-1 border-t border-space-850">
                <strong className="text-slate-300 font-medium">
                  Why this evidence matters:{' '}
                </strong>
                {item.relevance_explanation}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

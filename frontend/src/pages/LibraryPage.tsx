import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Link2,
  Bookmark,
  Sparkles,
  Search,
  ExternalLink,
  Plus,
  GitBranch,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { KnowledgeItem } from '../types';
import { soundService } from '../services/sound';

interface LibraryPageProps {
  onOpenFlow: (flowName: string) => void;
}

const KNOWLEDGE_TYPES = [
  { id: 'all', label: 'All Artifacts' },
  { id: 'note', label: 'Notes', icon: FileText },
  { id: 'document', label: 'Documents', icon: BookOpen },
  { id: 'link', label: 'Links & Refs', icon: Link2 },
  { id: 'ai_summary', label: 'AI Syntheses', icon: Sparkles },
];

export const LibraryPage: React.FC<LibraryPageProps> = ({ onOpenFlow }) => {
  const { knowledgeItems } = useFlow();
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = knowledgeItems.filter((k) => {
    const matchType = activeType === 'all' || k.type === activeType;
    const matchSearch =
      k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-b from-[#06080F] via-[#090C16] to-[#06080F] text-slate-100 p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                Cognitive Repository
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Personal Knowledge Graph
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-light">
              Verified citations, mental models, and documentation connected to your active flows.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge items..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* TYPE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {KNOWLEDGE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundService.playClick();
                setActiveType(t.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                activeType === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ITEMS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0B0F1E]/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-3 flex flex-col justify-between shadow-lg shadow-black/30"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-slate-800/80 text-cyan-300 border border-slate-700">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {item.updatedAt}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-3">
                  {item.snippet}
                </p>

                {/* Connected Flows Provenance */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <GitBranch size={11} /> Connected to Flows:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.connectedFlows.map((flowTitle) => (
                      <button
                        key={flowTitle}
                        onClick={() => onOpenFlow(flowTitle)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/60 transition-colors"
                      >
                        {flowTitle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => soundService.playClick()}
                  className="text-slate-400 hover:text-white p-1"
                  title="Open reference"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

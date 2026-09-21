import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Link2,
  Sparkles,
  Search,
  ExternalLink,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface LibraryPageProps {
  onOpenFlow: (flowName: string) => void;
}

const KNOWLEDGE_TYPES = [
  { id: 'all', label: 'All Artifacts' },
  { id: 'note', label: 'Thoughts' },
  { id: 'ai_summary', label: 'Insights' },
  { id: 'document', label: 'Decisions & Specs' },
  { id: 'link', label: 'Citations' },
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
    <div className="flex-1 h-full overflow-y-auto bg-[#08090D] text-[#F4F5F7] p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#5EE7FF] mb-1">
              <BookOpen size={14} />
              <span>LIBRARY // COGNITIVE ARTIFACTS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Knowledge Repository
            </h1>
            <p className="text-xs text-[#A7ACB8] mt-1">
              Verified citations, architectural documentation, and synthesized insights bound to flows.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686E7C]" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts, citations, tags..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0F1118] border border-white/[0.08] text-white placeholder-[#686E7C] text-xs focus:outline-none focus:border-[#7C5CFF]"
            />
          </div>
        </div>

        {/* TYPE TABS */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0F1118] border border-white/[0.06] overflow-x-auto w-full sm:w-auto">
          {KNOWLEDGE_TYPES.map((t) => {
            const isSelected = activeType === t.id;

            return (
              <button
                key={t.id}
                onClick={() => {
                  soundService.playClick();
                  setActiveType(t.id);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected ? 'bg-white/[0.08] text-white shadow-sm' : 'text-[#686E7C] hover:text-[#A7ACB8]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* COMPACT ARTIFACTS LIST (not huge cards) */}
        <div className="space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#0F1118] border border-white/[0.06] text-xs text-[#686E7C]">
              No matching knowledge artifacts found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0F1118] border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#151823] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.04] text-[#5EE7FF] border border-white/[0.08]">
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-[#686E7C]">
                      {item.updatedAt}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-[#5EE7FF] transition-colors truncate">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#A7ACB8] line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>

                  {/* Connected Provenance */}
                  <div className="flex items-center space-x-2 text-[11px] text-[#686E7C] pt-1">
                    <GitBranch size={11} className="text-[#7C5CFF]" />
                    <span>Flow:</span>
                    {item.connectedFlows.map((flowTitle) => (
                      <button
                        key={flowTitle}
                        onClick={() => onOpenFlow(flowTitle)}
                        className="text-[#9B84FF] hover:underline"
                      >
                        {flowTitle}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-[#686E7C] bg-white/[0.02] border border-white/[0.06] px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      soundService.playClick();
                      if (item.connectedFlows[0]) onOpenFlow(item.connectedFlows[0]);
                    }}
                    className="p-1.5 rounded-lg text-[#686E7C] hover:text-white hover:bg-white/[0.06] transition-colors"
                    title="Open in Canvas"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

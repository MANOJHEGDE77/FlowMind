import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { FlowGraph } from '../types';
import { soundService } from '../services/sound';

interface MyFlowPageProps {
  onOpenCanvas: (flowId: string) => void;
  onNewFlowPrompt: () => void;
}

const CATEGORIES: ('All' | FlowGraph['category'])[] = [
  'All',
  'Career',
  'Projects',
  'Learning',
  'Personal Goals',
  'Ideas',
];

export const MyFlowPage: React.FC<MyFlowPageProps> = ({
  onOpenCanvas,
  onNewFlowPrompt,
}) => {
  const { flows, setActiveFlowId } = useFlow();
  const [selectedCategory, setSelectedCategory] = useState<'All' | FlowGraph['category']>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFlows = useMemo(() => {
    return flows.filter((f) => {
      const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
      const matchSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [flows, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#08090D] text-[#F4F5F7] p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#5EE7FF] mb-1">
              <Layers size={14} />
              <span>FLOW DIRECTORY // KNOWLEDGE ECOSYSTEM</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              All Knowledge Flows
            </h1>
            <p className="text-xs text-[#A7ACB8] mt-1">
              Directory of all structured mental models, project roadmaps, and cognitive canvases.
            </p>
          </div>

          <button
            onClick={() => {
              soundService.playChime();
              onNewFlowPrompt();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold text-xs shadow-md shadow-[#7C5CFF]/25 hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>New Mind Flow</span>
          </button>
        </div>

        {/* SEARCH & CATEGORY FILTERS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686E7C]" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flows by title or concept..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0F1118] border border-white/[0.08] text-white placeholder-[#686E7C] text-xs focus:outline-none focus:border-[#7C5CFF]"
            />
          </div>

          <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0F1118] border border-white/[0.06] overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundService.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-[#686E7C] hover:text-[#A7ACB8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FLOWS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFlows.length === 0 ? (
            <div className="col-span-full p-8 text-center rounded-2xl bg-[#0F1118] border border-white/[0.06] text-xs text-[#686E7C]">
              No flows found matching your query.
            </div>
          ) : (
            filteredFlows.map((flow) => {
              const thoughtNodes = flow.nodes.filter((n) => n.type === 'idea' || n.type === 'core');

              return (
                <div
                  key={flow.id}
                  onClick={() => {
                    soundService.playClick();
                    setActiveFlowId(flow.id);
                    onOpenCanvas(flow.id);
                  }}
                  className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#151823] transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-lg hover:shadow-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] text-[#5EE7FF] border border-white/[0.08]">
                        {flow.category}
                      </span>
                      <span className="text-[#686E7C] font-mono text-[11px]">
                        {flow.progress}% synced
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-[#5EE7FF] transition-colors line-clamp-1">
                      {flow.title}
                    </h3>

                    <p className="text-xs text-[#A7ACB8] line-clamp-2 leading-relaxed">
                      {flow.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#08090D] border border-white/[0.06] flex items-center justify-between text-[11px] text-[#686E7C] font-mono">
                      <span>{flow.nodes.length} Thoughts</span>
                      <span>{flow.edges.length} Connections</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#686E7C]">
                    <span>Status: Active</span>
                    <span className="text-[#5EE7FF] font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>Open Canvas</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

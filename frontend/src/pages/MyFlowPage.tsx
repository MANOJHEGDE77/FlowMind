import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Search,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Share2,
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
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-b from-[#06080F] via-[#090C16] to-[#06080F] text-slate-100 p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                Cognitive Architecture
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              My Flow
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-light">
              Everything you're working toward, connected into living thought graphs.
            </p>
          </div>

          {/* New Flow Action */}
          <button
            onClick={() => {
              soundService.playChime();
              onNewFlowPrompt();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
          >
            <Sparkles size={16} />
            <span>Generate New Flow</span>
          </button>
        </div>

        {/* SEARCH & CATEGORY FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundService.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-950/40 font-semibold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flows..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* FLOWS GRID */}
        {filteredFlows.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#0A0E1A]/40 rounded-2xl border border-dashed border-slate-800">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-base font-semibold text-slate-300">No flows match your filter.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start with one idea. FlowMind will help you build the connections.
            </p>
            <button
              onClick={onNewFlowPrompt}
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-semibold"
            >
              Start a Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlows.map((flow) => {
              const coreNode = flow.nodes.find((n) => n.type === 'core') || flow.nodes[0];
              const taskNodes = flow.nodes.filter((n) => n.type === 'task');
              const completedTasks = taskNodes.filter((n) => n.progress === 100);

              return (
                <motion.div
                  key={flow.id}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    soundService.playClick();
                    setActiveFlowId(flow.id);
                    onOpenCanvas(flow.id);
                  }}
                  className="group relative p-6 rounded-2xl bg-[#0B0F1E]/90 border border-slate-800/90 hover:border-cyan-500/40 backdrop-blur-xl transition-all shadow-xl shadow-black/40 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  {/* Subtle top edge glow */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-4">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-slate-800/80 text-cyan-300 border border-slate-700">
                        {flow.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {flow.progress}% synced
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                        {flow.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-light leading-relaxed">
                        {flow.description}
                      </p>
                    </div>

                    {/* Miniature visual graph preview with animated bezier path */}
                    <div className="h-28 w-full bg-[#080B14] rounded-xl border border-slate-800/80 p-3 relative flex items-center justify-center overflow-hidden group-hover:border-cyan-500/20 transition-colors">
                      <svg className="w-full h-full" viewBox="0 0 320 100">
                        {/* Filaments */}
                        <path
                          d="M 40,50 C 90,20 130,20 160,50"
                          fill="none"
                          stroke="#00F0FF"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className="opacity-50"
                        />
                        <path
                          d="M 160,50 C 200,80 240,80 280,50"
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="1.5"
                        />
                        {/* Node Dots */}
                        <circle cx="40" cy="50" r="7" fill="#00F0FF" className="animate-pulse" />
                        <circle cx="160" cy="50" r="8" fill="#6366F1" />
                        <circle cx="280" cy="50" r="7" fill="#10B981" />
                      </svg>

                      {/* Text Chain Preview */}
                      <div className="absolute bottom-2 left-3 right-3 text-[10px] font-mono text-slate-400 truncate flex items-center gap-1">
                        <span className="text-cyan-300 truncate">{coreNode?.title}</span>
                        <span>→</span>
                        <span className="text-indigo-300 truncate">
                          {flow.nodes[1]?.title || 'Ideas'}
                        </span>
                        <span>→</span>
                        <span className="text-emerald-300">Action</span>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">
                          Thoughts
                        </span>
                        <span className="text-xs font-bold text-white">
                          {flow.nodes.length} nodes
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">
                          Linked Tasks
                        </span>
                        <span className="text-xs font-bold text-violet-300">
                          {taskNodes.length} items
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px] text-slate-500">
                      Updated {new Date(flow.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                      Enter Flow <ArrowRight size={14} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

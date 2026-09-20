import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Brain,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface HomePageProps {
  onNavigateToCanvas: (flowId?: string) => void;
  onNavigateToTasks: () => void;
  onNavigateToFocus: () => void;
}

const QUICK_CAPTURES = [
  { label: 'Plan my project', category: 'Projects' as const },
  { label: 'Study Computer Networks', category: 'Learning' as const },
  { label: 'Prepare for interview', category: 'Career' as const },
  { label: 'Build my portfolio', category: 'Projects' as const },
  { label: 'Organize my week', category: 'Personal Goals' as const },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToCanvas,
  onNavigateToTasks,
  onNavigateToFocus,
}) => {
  const {
    flows,
    tasks,
    thinkingPatterns,
    generateFlowFromPrompt,
    setActiveFlowId,
    setActiveFocusTask,
  } = useFlow();

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateFlow = async (textToUse?: string) => {
    const text = textToUse || inputVal;
    if (!text.trim()) return;
    soundService.playChime();
    const created = await generateFlowFromPrompt(text.trim());
    setInputVal('');
    if (created) {
      setActiveFlowId(created.id);
      onNavigateToCanvas(created.id);
    }
  };

  const handleVoiceToggle = () => {
    soundService.playClick();
    if (!isListening) {
      setIsListening(true);
      // Simulate brief voice recognition prompt
      setTimeout(() => {
        setInputVal('Design scalable event-driven distributed pipeline');
        setIsListening(false);
      }, 1800);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-b from-[#06080F] via-[#090C16] to-[#06080F] text-slate-100 p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <section className="relative pt-6 pb-2 text-center space-y-4">
          {/* Subtle ambient lighting behind hero */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-64 bg-gradient-to-r from-cyan-500/10 via-violet-500/15 to-blue-500/10 blur-3xl pointer-events-none rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            FlowMind Neural Cognitive Workspace
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <p className="text-sm font-mono text-slate-400">
              {getGreeting()}, <span className="text-slate-200 font-semibold">Architect</span>
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              What’s flowing through your mind today?
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-light">
              Turn ambiguous thoughts into living, interconnected structured flows.
            </p>
          </motion.div>

          {/* LARGE CENTRAL INPUT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-3xl mx-auto mt-8"
          >
            <div className="relative group p-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/30 via-violet-500/40 to-cyan-500/30 shadow-2xl shadow-cyan-950/40 transition-all duration-300 hover:border-cyan-400/50">
              <div className="relative flex items-center bg-[#0C101D]/90 backdrop-blur-xl rounded-2xl px-4 py-3.5 sm:py-4">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFlow();
                  }}
                  placeholder="Capture a thought, goal, problem, idea..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-base md:text-lg focus:outline-none pr-3 font-medium"
                />

                {/* Right controls inside input */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isListening
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Capture'}
                  >
                    <Mic size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateFlow()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">Create Flow</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* QUICK CAPTURE CHIPS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2.5 pt-4"
          >
            <span className="text-xs uppercase tracking-wider font-mono text-slate-500 mr-1">
              Quick Capture:
            </span>
            {QUICK_CAPTURES.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleCreateFlow(chip.label)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-slate-800/80 transition-all active:scale-95 shadow-sm"
              >
                ✦ {chip.label}
              </button>
            ))}
          </motion.div>
        </section>

        {/* METRICS & COGNITIVE PULSE */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0B0F1D]/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Active Mind Flows</span>
              <Brain size={18} className="text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white">{flows.length}</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <TrendingUp size={12} /> Connected Ecosystem
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {flows.reduce((acc, f) => acc + f.nodes.length, 0)} total thoughts structured across domains
            </p>
          </div>

          <div
            onClick={onNavigateToTasks}
            className="p-5 rounded-2xl bg-[#0B0F1D]/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-violet-500/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Thought-Linked Tasks</span>
              <CheckCircle2 size={18} className="text-violet-400" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white">{pendingTasks.length}</span>
              <span className="text-xs text-slate-400 font-mono">
                {completedTasks.length} finalized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              100% of tasks linked to their root cognitive origin
            </p>
          </div>

          <div
            onClick={() => {
              if (pendingTasks[0]) setActiveFocusTask(pendingTasks[0]);
              onNavigateToFocus();
            }}
            className="p-5 rounded-2xl bg-[#0B0F1D]/80 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">High Leverage Focus</span>
              <Flame size={18} className="text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white">25m</span>
              <span className="text-xs text-emerald-400 font-mono">Ready to Launch</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">
              {pendingTasks[0]?.title || 'Practice Binary Search'}
            </p>
          </div>
        </section>

        {/* ACTIVE FLOWS CAROUSEL / GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <Layers className="text-cyan-400" size={20} />
                Your Thinking Ecosystem
              </h2>
              <p className="text-xs text-slate-400">
                Interactive graph visualizers representing your active cognitive paths.
              </p>
            </div>
            <button
              onClick={() => onNavigateToCanvas()}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Open Infinite Canvas <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {flows.map((flow) => {
              const coreNode = flow.nodes.find((n) => n.type === 'core') || flow.nodes[0];
              const ideaNodes = flow.nodes.filter((n) => n.type === 'idea');

              return (
                <motion.div
                  key={flow.id}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    soundService.playClick();
                    setActiveFlowId(flow.id);
                    onNavigateToCanvas(flow.id);
                  }}
                  className="group relative p-5 rounded-2xl bg-[#0C101F]/90 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl transition-all shadow-xl shadow-black/40 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  {/* Top glowing edge */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-cyan-300 border border-slate-700">
                        {flow.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {flow.progress}% synced
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                      {flow.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {flow.description}
                    </p>

                    {/* Miniature SVG Graph preview */}
                    <div className="h-24 w-full bg-[#080B14] rounded-xl border border-slate-800/80 p-2 relative flex items-center justify-center overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 300 100">
                        {/* Connecting filaments */}
                        <path
                          d="M 50,50 Q 110,20 150,50 T 250,50"
                          fill="none"
                          stroke="#00F0FF"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className="opacity-40 animate-pulse"
                        />
                        <path
                          d="M 150,50 Q 200,80 250,75"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="1.5"
                          className="opacity-50"
                        />
                        {/* Nodes */}
                        <circle cx="50" cy="50" r="8" fill="#00F0FF" className="animate-ping opacity-20" />
                        <circle cx="50" cy="50" r="5" fill="#00F0FF" />
                        <circle cx="150" cy="50" r="7" fill="#6366F1" />
                        <circle cx="250" cy="50" r="6" fill="#10B981" />
                        <circle cx="250" cy="75" r="5" fill="#F59E0B" />
                      </svg>
                      <span className="absolute bottom-1.5 right-2 text-[10px] font-mono text-slate-500">
                        {flow.nodes.length} nodes
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-[180px]">
                      Core: <strong className="text-slate-200">{coreNode?.title || 'Root'}</strong>
                    </span>
                    <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center">
                      Launch →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* COGNITIVE PATTERNS HIGHLIGHT */}
        {thinkingPatterns.length > 0 && (
          <section className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/20 via-cyan-950/20 to-slate-900/40 border border-violet-500/20 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-semibold text-white tracking-wide">
                FlowMind Autonomous Observation
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {thinkingPatterns.map((pat) => (
                <div
                  key={pat.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    ✦ {pat.type.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{pat.insight}</p>
                  <p className="text-[11px] font-medium text-violet-300 flex items-center gap-1 pt-1">
                    ↳ {pat.actionText}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

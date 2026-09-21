import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Brain,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  GitBranch,
  Calendar,
  Layers,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface InsightsPageProps {
  onOpenCanvas: (flowId: string) => void;
  onNavigateToThink: () => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  onOpenCanvas,
  onNavigateToThink,
}) => {
  const { flows, tasks, thinkingPatterns } = useFlow();

  const totalThoughts = flows.reduce((acc, f) => acc + f.nodes.length, 0);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const actionConversionRate = tasks.length > 0 ? Math.round((tasks.length / Math.max(totalThoughts, 1)) * 100) : 74;

  const UNRESOLVED_QUESTIONS = [
    {
      id: 'q1',
      question: 'How to balance strong consistency with ultra-low latency in distributed cache meshes?',
      flowTitle: 'Java & Distributed Systems Interview',
      flowId: flows[0]?.id || '',
    },
    {
      id: 'q2',
      question: 'Should task queues use RabbitMQ push models or Kafka log partitioned pulls for our event bus?',
      flowTitle: 'Distributed Systems Architecture',
      flowId: flows[1]?.id || flows[0]?.id || '',
    },
    {
      id: 'q3',
      question: 'What is the optimal thread pool sizing heuristic under mixed I/O and CPU bound workloads?',
      flowTitle: 'Core Java Concurrency',
      flowId: flows[0]?.id || '',
    },
  ];

  const TIMELINE_EVENTS = [
    {
      id: 't1',
      time: '10:45 AM Today',
      type: 'INSIGHT_SYNTHESIS',
      title: 'Identified Concurrency Primitives synergy across Career and Projects',
      detail: 'Eliminates 4.5 hours of redundant study.',
      tag: 'Insight',
      tagColor: 'text-[#9B84FF] bg-[#7C5CFF]/15 border-[#7C5CFF]/30',
    },
    {
      id: 't2',
      time: 'Yesterday',
      type: 'ACTION_CONVERSION',
      title: 'Converted "Master Monotonic Queue" into active 45-minute sprint',
      detail: 'Completed with 100% test pass rate.',
      tag: 'Action',
      tagColor: 'text-[#45E0A8] bg-[#45E0A8]/15 border-[#45E0A8]/30',
    },
    {
      id: 't3',
      time: '2 days ago',
      type: 'DECISION_FINALIZED',
      title: 'Evaluated Raft vs Paxos consensus for multi-datacenter state machine',
      detail: 'Selected Raft for predictable leader election failover.',
      tag: 'Decision',
      tagColor: 'text-[#F5B84B] bg-[#F5B84B]/15 border-[#F5B84B]/30',
    },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#08090D] text-[#F4F5F7] p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="border-b border-white/[0.08] pb-6">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#5EE7FF] mb-1">
            <TrendingUp size={14} />
            <span>INSIGHTS // CROSS-FLOW INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Cognitive Intelligence Overview
          </h1>
          <p className="text-xs text-[#A7ACB8] mt-1">
            Continuous synthesis of recurring patterns, decisions, and execution velocity across all mental models.
          </p>
        </div>

        {/* 4 CORE METRICS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* THOUGHT PATTERNS */}
          <div className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#686E7C]">
              <span className="font-mono uppercase text-[10px]">Thought Patterns</span>
              <Brain size={15} className="text-[#9B84FF]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {thinkingPatterns.length + 8} <span className="text-xs font-normal text-[#A7ACB8]">themes</span>
            </div>
            <p className="text-[11px] text-[#686E7C]">
              4 recurring cross-graph connections
            </p>
          </div>

          {/* DECISIONS ANALYZED */}
          <div className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#686E7C]">
              <span className="font-mono uppercase text-[10px]">Decisions</span>
              <Sparkles size={15} className="text-[#F5B84B]" />
            </div>
            <div className="text-2xl font-bold text-white">
              8 <span className="text-xs font-normal text-[#A7ACB8]">this cycle</span>
            </div>
            <p className="text-[11px] text-[#686E7C]">
              Zero unresolved contradictions
            </p>
          </div>

          {/* ACTION CONVERSION */}
          <div className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#686E7C]">
              <span className="font-mono uppercase text-[10px]">Action Conversion</span>
              <CheckCircle2 size={15} className="text-[#45E0A8]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {actionConversionRate}%
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#45E0A8]"
                style={{ width: `${actionConversionRate}%` }}
              />
            </div>
          </div>

          {/* UNRESOLVED QUESTIONS */}
          <div className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#686E7C]">
              <span className="font-mono uppercase text-[10px]">Unresolved Questions</span>
              <HelpCircle size={15} className="text-[#5EE7FF]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {UNRESOLVED_QUESTIONS.length}
            </div>
            <p className="text-[11px] text-[#686E7C]">
              Ready for structured synthesis
            </p>
          </div>
        </div>

        {/* UNRESOLVED QUESTIONS SECTION */}
        <div className="p-6 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <HelpCircle size={15} className="text-[#5EE7FF]" />
                <span>Open Cognitive Questions</span>
              </h3>
              <p className="text-xs text-[#686E7C]">
                Questions identified across your flows that warrant deep reasoning in Think Mode.
              </p>
            </div>

            <button
              onClick={onNavigateToThink}
              className="text-xs text-[#5EE7FF] hover:underline font-medium flex items-center space-x-1"
            >
              <span>Think Mode</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {UNRESOLVED_QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="text-white font-medium">{q.question}</p>
                  <span className="text-[11px] text-[#686E7C]">
                    Anchored in: <strong className="text-[#A7ACB8] font-normal">{q.flowTitle}</strong>
                  </span>
                </div>

                <button
                  onClick={() => {
                    soundService.playClick();
                    onNavigateToThink();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#7C5CFF]/15 hover:bg-[#7C5CFF]/25 border border-[#7C5CFF]/30 text-[#9B84FF] font-medium text-xs transition-colors shrink-0 self-start sm:self-auto"
                >
                  Synthesize →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT COGNITIVE ACTIVITY TIMELINE */}
        <div className="p-6 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Calendar size={15} className="text-[#9B84FF]" />
              <span>Thought Evolution Timeline</span>
            </h3>
            <span className="text-[11px] font-mono text-[#686E7C]">CHRONOLOGICAL</span>
          </div>

          <div className="space-y-4 relative pl-4 border-l border-white/[0.08]">
            {TIMELINE_EVENTS.map((event) => (
              <div key={event.id} className="relative space-y-1 text-xs">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#7C5CFF] border-2 border-[#08090D]" />
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-[#686E7C]">{event.time}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${event.tagColor}`}>
                    {event.tag}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white">{event.title}</h4>
                <p className="text-xs text-[#A7ACB8]">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

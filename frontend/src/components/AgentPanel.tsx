import React, { useState } from 'react';
import {
  Users, CheckCircle, ShieldAlert, TrendingUp, DollarSign,
  Compass, Flame, Sparkles, Clock, ChevronRight
} from 'lucide-react';
import { AgentRun } from '../types';

interface AgentPanelProps {
  agents: AgentRun[];
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ agents }) => {
  const [selectedAgentName, setSelectedAgentName] = useState<string>(
    agents[0]?.agent_name || 'Analyst'
  );

  const selectedAgent = agents.find(a => a.agent_name === selectedAgentName) || agents[0];

  const getAgentColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'analyst':
        return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/25', icon: CheckCircle };
      case 'optimist':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25', icon: TrendingUp };
      case 'skeptic':
        return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25', icon: ShieldAlert };
      case 'financial analyst':
      case 'financial':
        return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25', icon: DollarSign };
      case 'long-term planner':
      case 'longterm':
        return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/25', icon: Compass };
      case "devil's advocate":
      case 'devils advocate':
        return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/25', icon: Flame };
      default:
        return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/25', icon: Sparkles };
    }
  };

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl overflow-hidden shadow-subtle-node">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-space-800 flex items-center justify-between bg-space-950/40">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-white">
            Multi-Agent Reasoning Council
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {agents.length} Specialized Agents Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-space-800">
        {/* Agent List */}
        <div className="md:col-span-4 p-2 space-y-1 bg-space-950/20">
          {agents.map((ag) => {
            const isSelected = ag.agent_name === selectedAgentName;
            const style = getAgentColor(ag.agent_name);
            const Icon = style.icon;

            return (
              <button
                key={ag.id}
                onClick={() => setSelectedAgentName(ag.agent_name)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-space-800 border border-space-700 shadow-sm'
                    : 'hover:bg-space-850 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <div className={`p-1.5 rounded-md ${style.bg} ${style.text}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {ag.agent_name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {ag.agent_role}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {Math.round(ag.confidence * 100)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Agent Viewpoint Details */}
        {selectedAgent && (
          <div className="md:col-span-8 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-space-800/80 mb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {selectedAgent.agent_name} Viewpoint
                </h4>
                <p className="text-xs text-slate-400">
                  {selectedAgent.agent_role}
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{selectedAgent.duration_ms}ms</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-space-800 text-brand-primary border border-space-700">
                  Confidence: {Math.round(selectedAgent.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Viewpoint text */}
            <div className="bg-space-950/60 border border-space-800 p-3.5 rounded-xl text-xs text-slate-200 leading-relaxed mb-4">
              {selectedAgent.viewpoint}
            </div>

            {/* Structured Findings */}
            {selectedAgent.findings && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Detailed Diagnostic Findings
                </div>
                <div className="bg-space-850/40 border border-space-800 p-3 rounded-xl max-h-48 overflow-y-auto">
                  <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedAgent.findings, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

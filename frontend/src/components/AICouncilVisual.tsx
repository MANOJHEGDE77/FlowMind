import React, { useState } from 'react';
import {
  Users, CheckCircle2, ShieldAlert, TrendingUp, DollarSign,
  Compass, Flame, Sparkles, Clock, ArrowRight, MessageSquare
} from 'lucide-react';
import { AgentRun } from '../types';

interface AICouncilVisualProps {
  agents: AgentRun[];
  contradictions: string[];
}

export const AICouncilVisual: React.FC<AICouncilVisualProps> = ({
  agents,
  contradictions,
}) => {
  const [selectedAgentName, setSelectedAgentName] = useState<string>(
    agents[0]?.agent_name || 'Analyst'
  );

  const getAgentMeta = (name: string) => {
    switch (name.toLowerCase()) {
      case 'analyst':
        return {
          color: '#38BDF8',
          status: 'Facts & Constraints Deconstructed',
          role: 'Ground Truth & Fact Extractor',
          icon: CheckCircle2,
        };
      case 'optimist':
        return {
          color: '#10B981',
          status: 'Upside Scenarios Mapped',
          role: 'Asymmetric Growth Modeler',
          icon: TrendingUp,
        };
      case 'skeptic':
        return {
          color: '#F43F5E',
          status: 'Failure Modes Interrogated',
          role: 'Vulnerability & Risk Detective',
          icon: ShieldAlert,
        };
      case 'financial analyst':
      case 'financial':
        return {
          color: '#FBBF24',
          status: 'ROI & Cash Runway Verified',
          role: 'Financial Capital Assessor',
          icon: DollarSign,
        };
      case 'long-term planner':
      case 'longterm':
        return {
          color: '#818CF8',
          status: 'Reversibility & Optionality Modeled',
          role: '5-Year Trajectory Modeler',
          icon: Compass,
        };
      case "devil's advocate":
      case 'devils advocate':
        return {
          color: '#FB7185',
          status: 'Assumptions Attacked & Stressed',
          role: 'Adversarial Bias Destroyer',
          icon: Flame,
        };
      default:
        return {
          color: '#C084FC',
          status: 'Consensus Fused',
          role: 'Synthesis & Confidence Arbitrator',
          icon: Sparkles,
        };
    }
  };

  const selectedAgent = agents.find(a => a.agent_name === selectedAgentName) || agents[0];
  const selectedMeta = selectedAgent ? getAgentMeta(selectedAgent.agent_name) : getAgentMeta('Analyst');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              AI Council Arbitrating
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              7 Autonomous specialized intelligences cross-examining the decision space
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          {agents.length} AGENTS ACTIVE
        </span>
      </div>

      {/* Visual Council Orbital Topology */}
      <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {agents.map((ag) => {
            const meta = getAgentMeta(ag.agent_name);
            const Icon = meta.icon;
            const isSelected = ag.agent_name === selectedAgentName;

            return (
              <button
                key={ag.id}
                onClick={() => setSelectedAgentName(ag.agent_name)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'border-purple-400 bg-purple-500/10 shadow-md ring-1 ring-purple-400/40'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-active)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="p-1.5 rounded-md"
                    style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {Math.round(ag.confidence * 100)}%
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {ag.agent_name}
                  </div>
                  <div className="text-[10px] text-emerald-400 truncate flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">Completed</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Agent Viewpoint Drawer */}
        {selectedAgent && (
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedMeta.color }}
                />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedAgent.agent_name} Analysis
                </h3>
                <span className="text-xs text-[var(--text-muted)]">• {selectedMeta.role}</span>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono text-[var(--text-muted)]">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{selectedAgent.duration_ms}ms execution</span>
                </span>
              </div>
            </div>

            {/* Viewpoint Narrative */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] leading-relaxed font-sans">
              {selectedAgent.viewpoint}
            </div>

            {/* Diagnostic Findings */}
            {selectedAgent.findings && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
                  Diagnostic Findings
                </div>
                <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl max-h-40 overflow-y-auto">
                  <pre className="text-[11px] font-mono text-[var(--text-secondary)] whitespace-pre-wrap">
                    {JSON.stringify(selectedAgent.findings, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contradictions & Friction Radar */}
      {contradictions && contradictions.length > 0 && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/25 p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>ARBITRATION FRICTION & CONTRADICTIONS DETECTED</span>
          </div>
          <div className="space-y-1 pl-6">
            {contradictions.map((c, i) => (
              <p key={i} className="text-xs text-amber-200/90 leading-relaxed">
                • {c}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

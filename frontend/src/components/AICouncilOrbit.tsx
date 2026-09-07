import React, { useState } from 'react';
import {
  Sparkles, X, CheckCircle2, ShieldAlert, TrendingUp,
  DollarSign, Compass, Flame, Clock, Users, ArrowRight
} from 'lucide-react';
import { AgentRun } from '../types';

interface AICouncilOrbitProps {
  agents: AgentRun[];
  contradictions: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const AICouncilOrbit: React.FC<AICouncilOrbitProps> = ({
  agents,
  contradictions,
  isOpen,
  onClose,
}) => {
  const [selectedAgentName, setSelectedAgentName] = useState<string>(
    agents[0]?.agent_name || 'Analyst'
  );

  if (!isOpen) return null;

  const getAgentTheme = (name: string) => {
    switch (name.toLowerCase()) {
      case 'analyst':
        return { color: '#38BDF8', action: 'Deconstructing structural constraints & factual boundaries', icon: CheckCircle2 };
      case 'optimist':
        return { color: '#34D399', action: 'Modeling upside leverage & compounding learning velocity', icon: TrendingUp };
      case 'skeptic':
        return { color: '#FB7185', action: 'Interrogating operational liabilities & burnout friction', icon: ShieldAlert };
      case 'financial analyst':
      case 'financial':
        return { color: '#FBBF24', action: 'Projecting compensation liquidity & opportunity cost discount rate', icon: DollarSign };
      case 'long-term planner':
      case 'longterm':
        return { color: '#818CF8', action: 'Evaluating Type 1 vs Type 2 reversibility & 5-year optionality', icon: Compass };
      case "devil's advocate":
      case 'devils advocate':
        return { color: '#F43F5E', action: 'Attacking confirmation bias & testing counter-hypotheses', icon: Flame };
      default:
        return { color: '#C084FC', action: 'Synthesizing multi-agent equilibrium & calibrated confidence', icon: Sparkles };
    }
  };

  const selectedAgent = agents.find(a => a.agent_name === selectedAgentName) || agents[0];
  const selectedTheme = selectedAgent ? getAgentTheme(selectedAgent.agent_name) : getAgentTheme('Analyst');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[var(--surface-blur)] border border-[var(--line-color)] rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line-color)]">
          <div className="flex items-center space-x-2">
            <span className="text-purple-400 font-mono text-sm">✦</span>
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--text-vivid)] font-semibold">
              AI COUNCIL ORBITAL ARBITRATION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-faint)] hover:text-[var(--text-vivid)] p-1 rounded-full hover:bg-[var(--canvas-subtle)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orbit Grid */}
        <div className="py-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {agents.map((ag) => {
            const theme = getAgentTheme(ag.agent_name);
            const Icon = theme.icon;
            const isSelected = ag.agent_name === selectedAgentName;

            return (
              <button
                key={ag.id}
                onClick={() => setSelectedAgentName(ag.agent_name)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'border-purple-400 bg-purple-500/10 shadow-lg ring-1 ring-purple-400/40'
                    : 'border-[var(--line-color)] bg-[var(--canvas-subtle)] hover:border-[var(--line-active)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-faint)]">
                    {Math.round(ag.confidence * 100)}%
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[var(--text-vivid)] truncate">
                    {ag.agent_name}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400 truncate mt-0.5">
                    ● ACTIVE
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Agent Diagnostic View */}
        {selectedAgent && (
          <div className="pt-4 border-t border-[var(--line-color)] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTheme.color }} />
                <span className="font-semibold text-[var(--text-vivid)]">{selectedAgent.agent_name}</span>
                <span className="text-[var(--text-faint)] font-mono">• {selectedTheme.action}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-faint)]">
                {selectedAgent.duration_ms}ms runtime
              </span>
            </div>

            <p className="text-xs text-[var(--text-body)] leading-relaxed font-sans bg-[var(--canvas-subtle)] p-4 rounded-2xl border border-[var(--line-color)]">
              {selectedAgent.viewpoint}
            </p>
          </div>
        )}

        {/* Contradictions & Friction points */}
        {contradictions && contradictions.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">
              COUNCIL ARBITRATION FRICTION:
            </span>
            {contradictions.map((c, i) => (
              <p key={i} className="text-[11px] text-amber-200/80 leading-relaxed">
                • {c}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

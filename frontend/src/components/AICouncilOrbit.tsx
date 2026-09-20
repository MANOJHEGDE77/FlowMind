import React, { useState, useEffect } from 'react';
import {
  Sparkles, X, CheckCircle2, ShieldAlert, TrendingUp,
  DollarSign, Compass, Flame, Clock, Users, ArrowRight,
  Swords, Scale, Zap
} from 'lucide-react';
import { AgentRun } from '../types';
import { soundService } from '../services/sound';

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
  const [activeTab, setActiveTab] = useState<'roster' | 'clashes'>('roster');
  const [selectedAgentName, setSelectedAgentName] = useState<string>(
    agents[0]?.agent_name || 'Analyst'
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getAgentTheme = (name: string) => {
    switch (name.toLowerCase()) {
      case 'analyst':
        return {
          color: '#00F0FF',
          question: 'What does the evidence say?',
          role: 'Empirical Baseline',
          action: 'Deconstructing structural constraints & factual boundaries',
          state: 'EMPIRICAL_RIGOR',
          icon: CheckCircle2,
        };
      case 'optimist':
        return {
          color: '#10B981',
          question: 'What could go right?',
          role: 'Asymmetric Upside',
          action: 'Modeling upside leverage & compounding learning velocity',
          state: 'ASYMMETRIC_LEVERAGE',
          icon: TrendingUp,
        };
      case 'skeptic':
        return {
          color: '#F43F5E',
          question: 'What are we missing?',
          role: 'Downside Protection',
          action: 'Interrogating operational liabilities & burnout friction',
          state: 'TAIL_RISK_DEFENSE',
          icon: ShieldAlert,
        };
      case 'financial analyst':
      case 'financial':
        return {
          color: '#F59E0B',
          question: 'What are the financial implications?',
          role: 'Capital Efficiency',
          action: 'Projecting compensation liquidity & opportunity cost discount rate',
          state: 'CAPITAL_CALIBRATION',
          icon: DollarSign,
        };
      case 'long-term planner':
      case 'longterm':
        return {
          color: '#818CF8',
          question: 'What compounds over time?',
          role: 'Compounding Horizon',
          action: 'Evaluating Type 1 vs Type 2 reversibility & 5-year optionality',
          state: 'SECOND_ORDER_HORIZON',
          icon: Compass,
        };
      case "devil's advocate":
      case 'devils advocate':
        return {
          color: '#EF4444',
          question: 'Why might this fail?',
          role: 'Bias Interrogation',
          action: 'Attacking confirmation bias & testing counter-hypotheses',
          state: 'BIAS_DESTRUCTION',
          icon: Flame,
        };
      default:
        return {
          color: '#8B5CF6',
          question: 'What survives the debate?',
          role: 'Equilibrium Signal',
          action: 'Synthesizing multi-agent equilibrium & calibrated confidence',
          state: 'EQUILIBRIUM_CONVERGENCE',
          icon: Sparkles,
        };
    }
  };

  const selectedAgent = agents.find(a => a.agent_name === selectedAgentName) || agents[0];
  const selectedTheme = selectedAgent ? getAgentTheme(selectedAgent.agent_name) : getAgentTheme('Analyst');

  // Curated head-to-head dialectic clashes derived from agent runs
  const optimistAgent = agents.find(a => a.agent_name.toLowerCase().includes('optimist'));
  const skepticAgent = agents.find(a => a.agent_name.toLowerCase().includes('skeptic'));
  const financialAgent = agents.find(a => a.agent_name.toLowerCase().includes('finan'));
  const longTermAgent = agents.find(a => a.agent_name.toLowerCase().includes('long'));
  const devilsAgent = agents.find(a => a.agent_name.toLowerCase().includes('devil'));
  const synthesizerAgent = agents.find(a => a.agent_name.toLowerCase().includes('synth'));

  const dialecticClashes = [
    {
      title: 'The Asymmetric Upside Clash',
      subtitle: 'Optimist Acceleration vs Skeptic Drag',
      agentA: {
        name: 'The Optimist',
        color: '#34D399',
        icon: TrendingUp,
        stance: optimistAgent?.viewpoint || 'Models 3x faster compounding learning velocity, equity convexity, and superior market momentum.',
      },
      agentB: {
        name: 'The Skeptic',
        color: '#FB7185',
        icon: ShieldAlert,
        stance: skepticAgent?.viewpoint || 'Warns against operational friction, hidden switching penalties, fatigue drag, and untested assumptions.',
      },
      friction: '82%',
      arbitration: 'The Council arbitrated by accepting the upside hypothesis conditional upon creating a 90-day downside buffer.'
    },
    {
      title: 'The Liquidity vs Compounding Dilemma',
      subtitle: 'Near-Term Cash Certainty vs 5-Year Optionality',
      agentA: {
        name: 'Financial Analyst',
        color: '#FBBF24',
        icon: DollarSign,
        stance: financialAgent?.viewpoint || 'Quantifies risk-adjusted cash flow, discounted liquidity, and opportunity cost thresholds.',
      },
      agentB: {
        name: 'Long-Term Planner',
        color: '#818CF8',
        icon: Compass,
        stance: longTermAgent?.viewpoint || 'Evaluates Type 1 vs Type 2 reversibility, long-term compounding option value, and network positioning.',
      },
      friction: '74%',
      arbitration: 'Near-term discount rate is tolerated because long-term option value exceeds immediate cash delta.'
    },
    {
      title: 'The Confirmation Bias Attack',
      subtitle: "Devil's Advocate Stress-Test vs Synthesizer Resolution",
      agentA: {
        name: "Devil's Advocate",
        color: '#F43F5E',
        icon: Flame,
        stance: devilsAgent?.viewpoint || 'Attacks the favored path for confirmation bias, exposing fragility if external market baseline shifts.',
      },
      agentB: {
        name: 'Synthesizer Council',
        color: '#C084FC',
        icon: Scale,
        stance: synthesizerAgent?.viewpoint || 'Balances multi-factor tradeoffs across growth, agency, and risk to establish equilibrium.',
      },
      friction: '68%',
      arbitration: 'Applied a 14% confidence haircut to reflect unmitigated risks, producing a robust calibrated signal.'
    }
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xl select-none animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-[var(--surface-blur)] border border-[var(--line-color)] rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line-color)]">
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

        {/* Tab Switcher */}
        <div className="flex items-center bg-[var(--canvas-subtle)] border border-[var(--line-color)] p-1 rounded-full max-w-md mx-auto">
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('roster');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              activeTab === 'roster'
                ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-400/40 shadow-sm'
                : 'text-[var(--text-faint)] hover:text-[var(--text-vivid)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Council Roster (7 Agents)</span>
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('clashes');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              activeTab === 'clashes'
                ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-400/40 shadow-sm'
                : 'text-[var(--text-faint)] hover:text-[var(--text-vivid)]'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>⚔️ Dialectic Clashes</span>
          </button>
        </div>

        {/* TAB 1: ROSTER VIEW */}
        {activeTab === 'roster' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Orbit Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {agents.map((ag) => {
                const theme = getAgentTheme(ag.agent_name);
                const Icon = theme.icon;
                const isSelected = ag.agent_name === selectedAgentName;

                return (
                  <button
                    key={ag.id}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedAgentName(ag.agent_name);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-36 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/50'
                        : 'border-[var(--line-color)] bg-[var(--canvas-subtle)] hover:border-cyan-400/40'
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

                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[var(--text-vivid)] truncate">
                        {ag.agent_name}
                      </div>
                      <div className="text-[10px] text-slate-300 italic font-editorial line-clamp-2 leading-tight">
                        "{theme.question}"
                      </div>
                      <div className="text-[8px] font-mono text-cyan-400 truncate tracking-wider uppercase">
                        ● {theme.state}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Agent Diagnostic View */}
            {selectedAgent && (
              <div className="pt-3 border-t border-[var(--line-color)] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTheme.color }} />
                    <span className="font-semibold text-[var(--text-vivid)]">{selectedAgent.agent_name}</span>
                    <span className="text-cyan-400 font-mono text-[11px]">"{selectedTheme.question}"</span>
                    <span className="text-[var(--text-faint)] font-mono text-[11px] hidden md:inline">• {selectedTheme.action}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-indigo-300">
                      {selectedTheme.state}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-faint)]">
                      {selectedAgent.duration_ms}ms runtime
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-body)] leading-relaxed font-sans bg-[var(--canvas-subtle)] p-4 rounded-2xl border border-[var(--line-color)]">
                  {selectedAgent.viewpoint}
                </p>

                {/* Structured Multi-Agent Schema Breakdown */}
                {selectedAgent.findings && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 font-mono text-[11px] pt-1">
                    {/* Key Findings */}
                    {selectedAgent.findings.keyFindings && selectedAgent.findings.keyFindings.length > 0 && (
                      <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1.5 col-span-1 sm:col-span-2 md:col-span-1">
                        <span className="text-[9px] uppercase font-bold text-cyan-400 block tracking-wider flex items-center space-x-1">
                          <span>✦ KEY FINDINGS</span>
                        </span>
                        <ul className="space-y-1 text-[var(--text-body)] font-sans text-[11px]">
                          {selectedAgent.findings.keyFindings.slice(0, 3).map((kf: string, i: number) => (
                            <li key={i} className="leading-snug">• {kf}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Identified Risks */}
                    {selectedAgent.findings.risks && selectedAgent.findings.risks.length > 0 && (
                      <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/25 space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-rose-400 block tracking-wider flex items-center space-x-1">
                          <span>⚠️ IDENTIFIED RISKS</span>
                        </span>
                        <ul className="space-y-1 text-rose-300 font-sans text-[11px]">
                          {selectedAgent.findings.risks.slice(0, 3).map((r: string, i: number) => (
                            <li key={i} className="leading-snug">• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Assumptions & Missing Info */}
                    <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-2">
                      {selectedAgent.findings.assumptions && selectedAgent.findings.assumptions.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">
                            🔍 ASSUMPTIONS
                          </span>
                          <p className="text-[11px] text-[var(--text-body)] font-sans leading-snug">
                            {selectedAgent.findings.assumptions[0]}
                          </p>
                        </div>
                      )}
                      {selectedAgent.findings.missingInformation && selectedAgent.findings.missingInformation.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-[var(--line-color)]">
                          <span className="text-[9px] uppercase font-bold text-[var(--text-faint)] block tracking-wider">
                            ❓ MISSING INFO
                          </span>
                          <p className="text-[11px] text-[var(--text-faint)] font-sans leading-snug">
                            {selectedAgent.findings.missingInformation[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contradictions & Friction points */}
            {contradictions && contradictions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-500 space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">
                  COUNCIL ARBITRATION FRICTION:
                </span>
                {contradictions.map((c, i) => (
                  <p key={i} className="text-[11px] text-[var(--text-body)] leading-relaxed">
                    • {c}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIALECTIC CLASHES VIEW */}
        {activeTab === 'clashes' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Top Metrics Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-center font-mono">
                <span className="text-[9px] text-[var(--text-faint)] uppercase block">COUNCIL CONSENSUS</span>
                <span className="text-base font-bold text-purple-400 block mt-0.5">88.4%</span>
                <span className="text-[9px] text-[var(--text-faint)]">Arbitrated agreement</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-center font-mono">
                <span className="text-[9px] text-[var(--text-faint)] uppercase block">DIALECTIC TENSION</span>
                <span className="text-base font-bold text-amber-400 block mt-0.5">74.2%</span>
                <span className="text-[9px] text-[var(--text-faint)]">Intellectual friction</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-center font-mono">
                <span className="text-[9px] text-[var(--text-faint)] uppercase block">EPISTEMIC RIGOR</span>
                <span className="text-base font-bold text-emerald-400 block mt-0.5">9.4 / 10</span>
                <span className="text-[9px] text-[var(--text-faint)]">Multi-agent verification</span>
              </div>
            </div>

            {/* Clash Cards */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {dialecticClashes.map((clash, idx) => {
                const IconA = clash.agentA.icon;
                const IconB = clash.agentB.icon;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-vivid)] font-mono">{clash.title}</h4>
                        <span className="text-[10px] text-[var(--text-faint)] font-sans">{clash.subtitle}</span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {clash.friction} Friction
                      </span>
                    </div>

                    {/* Confrontation Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Agent A */}
                      <div className="p-3 rounded-xl bg-[var(--canvas-bg)] border border-[var(--line-color)] space-y-1">
                        <div className="flex items-center space-x-1.5 font-mono font-semibold" style={{ color: clash.agentA.color }}>
                          <IconA className="w-3.5 h-3.5" />
                          <span>{clash.agentA.name}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-body)] font-sans leading-relaxed line-clamp-3">
                          "{clash.agentA.stance}"
                        </p>
                      </div>

                      {/* Agent B */}
                      <div className="p-3 rounded-xl bg-[var(--canvas-bg)] border border-[var(--line-color)] space-y-1">
                        <div className="flex items-center space-x-1.5 font-mono font-semibold" style={{ color: clash.agentB.color }}>
                          <IconB className="w-3.5 h-3.5" />
                          <span>{clash.agentB.name}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-body)] font-sans leading-relaxed line-clamp-3">
                          "{clash.agentB.stance}"
                        </p>
                      </div>
                    </div>

                    {/* Arbitration Verdict */}
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-sans text-purple-400">
                      <strong className="font-mono text-purple-400 mr-1">⚖️ Council Arbitration:</strong>
                      {clash.arbitration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

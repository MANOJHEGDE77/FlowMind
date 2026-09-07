import React, { useState } from 'react';
import {
  Sparkles, Target, ShieldAlert, BookOpen, Crown,
  Layers, ArrowUpRight, CheckCircle2, ChevronRight
} from 'lucide-react';

interface NodeData {
  id: string;
  label: string;
  type: 'goal' | 'context' | 'option' | 'risk' | 'evidence' | 'agent' | 'recommendation';
  cx: number;
  cy: number;
  color: string;
  detail: string;
  subtext: string;
}

export const DecisionCoreVisual: React.FC<{ onExplorePrompt?: (prompt: string) => void }> = ({
  onExplorePrompt,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('rec');

  const nodes: NodeData[] = [
    {
      id: 'goal',
      label: 'Core Ambition',
      type: 'goal',
      cx: 300,
      cy: 60,
      color: '#38BDF8',
      detail: 'Maximize long-term compounding agency and career equity over 5 years.',
      subtext: 'Goal weight: 1.4x • Priority: High',
    },
    {
      id: 'context',
      label: 'Unstructured Context',
      type: 'context',
      cx: 120,
      cy: 130,
      color: '#94A3B8',
      detail: 'Competing offers: Early-stage Startup Lead vs Public Tech Principal vs Self-Funded Venture.',
      subtext: '3 candidate pathways deconstructed by Analyst',
    },
    {
      id: 'evidence',
      label: 'Grounded Evidence',
      type: 'evidence',
      cx: 480,
      cy: 130,
      color: '#10B981',
      detail: 'Clause 4.2 of Offer Letter guarantees 1.2% equity vesting with 1-year cliff and acceleration.',
      subtext: 'Verified via RAG parsing of Offer_Contract.pdf',
    },
    {
      id: 'agent_debate',
      label: 'AI Council Debate',
      type: 'agent',
      cx: 300,
      cy: 200,
      color: '#C084FC',
      detail: 'Skeptic warned of 14-month cash runway; Optimist highlighted 4x learning velocity multiplier.',
      subtext: '7 Agents arbitrating consensus',
    },
    {
      id: 'risk',
      label: 'Stress-Test Risk',
      type: 'risk',
      cx: 150,
      cy: 270,
      color: '#F43F5E',
      detail: 'Devil\'s Advocate identified vulnerable assumption: market macro downturn could delay Series C.',
      subtext: 'Model fragility: Moderately Sensitive (-14% haircut)',
    },
    {
      id: 'options',
      label: 'Calibrated Option Score',
      type: 'option',
      cx: 450,
      cy: 270,
      color: '#FBBF24',
      detail: 'Option A: 88.5 • Option B: 81.0 • Option C: 74.0 across Goal, Flexibility, and Growth.',
      subtext: 'Differential margin: +7.5 pts leading',
    },
    {
      id: 'rec',
      label: 'The Signal (Recommendation)',
      type: 'recommendation',
      cx: 300,
      cy: 350,
      color: '#38BDF8',
      detail: 'Accept Startup Lead Offer. Asymmetric upside heavily outweighs short-term stability trade-off.',
      subtext: 'Final confidence: 86.4% • Reversibility: Type 2',
    },
  ];

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[nodes.length - 1];

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Visual Canvas Card */}
      <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-xl p-4 md:p-6 shadow-2xl overflow-hidden">
        {/* Subtle header tag */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[var(--text-secondary)]">DECISION INTELLIGENCE CORE</span>
          </div>
          <span>Interactive Cognitive Topology</span>
        </div>

        {/* Spatial SVG Graph */}
        <div className="relative w-full h-[380px] flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 600 400">
            {/* Background ambient circular glow */}
            <circle cx="300" cy="200" r="160" fill="url(#coreGlow)" opacity="0.12" />

            <defs>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Dynamic Connecting Lines */}
            <g stroke="currentColor" className="text-[var(--border-subtle)]" strokeWidth="1.5">
              {/* Goal to Context & Evidence */}
              <line x1="300" y1="60" x2="120" y2="130" strokeDasharray="3 3" />
              <line x1="300" y1="60" x2="480" y2="130" strokeDasharray="3 3" />
              <line x1="300" y1="60" x2="300" y2="200" strokeWidth="2" stroke="#38BDF8" strokeOpacity="0.6" />

              {/* Context/Evidence into AI Debate */}
              <line x1="120" y1="130" x2="300" y2="200" />
              <line x1="480" y1="130" x2="300" y2="200" />

              {/* AI Debate into Risk & Option */}
              <line x1="300" y1="200" x2="150" y2="270" stroke="#F43F5E" strokeOpacity="0.5" />
              <line x1="300" y1="200" x2="450" y2="270" stroke="#FBBF24" strokeOpacity="0.5" />

              {/* Risk & Options converging into Final Signal */}
              <line x1="150" y1="270" x2="300" y2="350" strokeWidth="2" stroke="#38BDF8" strokeOpacity="0.7" />
              <line x1="450" y1="270" x2="300" y2="350" strokeWidth="2" stroke="#38BDF8" strokeOpacity="0.7" />
              <line x1="300" y1="200" x2="300" y2="350" strokeWidth="2" stroke="#38BDF8" strokeOpacity="0.8" />
            </g>

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === activeNodeId;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setActiveNodeId(node.id)}
                  onMouseEnter={() => setActiveNodeId(node.id)}
                >
                  {/* Outer pulse ring for active node */}
                  {isSelected && (
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="24"
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={node.id === 'rec' ? 18 : 13}
                    fill={node.color}
                    fillOpacity={isSelected ? 0.95 : 0.25}
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />

                  {/* Node Label Text */}
                  <text
                    x={node.cx}
                    y={node.cy + (node.cy > 250 ? 28 : -18)}
                    textAnchor="middle"
                    className="text-[11px] font-mono tracking-tight font-medium fill-current"
                    style={{ fill: isSelected ? node.color : 'var(--text-muted)' }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Active Node Context Box */}
        <div className="mt-2 pt-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeNode.color }}
              />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {activeNode.label}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {activeNode.subtext}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {activeNode.detail}
          </p>
        </div>
      </div>
    </div>
  );
};

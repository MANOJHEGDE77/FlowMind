import React, { useMemo } from 'react';
import {
  Compass, ArrowRight, Crown, Sparkles,
  Layers, ShieldAlert, BookOpen, TrendingUp,
  SlidersHorizontal, CheckCircle2, Flame, Lightbulb,
  CheckCircle, Clock
} from 'lucide-react';
import { DecisionListItem } from '../types';

interface ExplorerPageProps {
  onLoadDilemma: (prompt: string) => void;
  recentDecisions?: DecisionListItem[];
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({
  onLoadDilemma,
  recentDecisions = [],
}) => {
  const hasRealData = recentDecisions.length > 0;

  const realStats = useMemo(() => {
    if (!hasRealData) return null;
    const total = recentDecisions.length;
    const avgConfidence = Math.round(
      recentDecisions.reduce((acc, d) => acc + (d.confidence_score || 0), 0) / total
    );
    const resolved = recentDecisions.filter((d) => d.status === 'resolved').length;
    const active = total - resolved;

    return {
      total,
      avgConfidence,
      resolved,
      active,
    };
  }, [recentDecisions, hasRealData]);

  const decisionStarters = [
    {
      category: 'Career & Agency',
      title: 'Senior IC vs Engineering Leadership vs Founder Track',
      prompt: 'Should I remain on the Principal IC track, transition to Director of Engineering, or take a founder fellowship to bootstrap?',
      optionsCount: 3,
    },
    {
      category: 'Offer Evaluation',
      title: 'Series B Startup Lead vs BigTech Staff Architect',
      prompt: 'Should I accept the Senior Lead role at a high-growth Series B AI startup, stay as Staff Engineer at BigTech, or start a self-funded venture?',
      optionsCount: 3,
    },
    {
      category: 'Geographic Arbitrage',
      title: 'SF Bay Area Hub vs NYC Remote vs Zurich Mobility',
      prompt: 'Should I relocate to San Francisco for in-person founder networks, stay remote in New York, or accept the European transfer to Zurich?',
      optionsCount: 3,
    },
    {
      category: 'Startup Capital',
      title: 'Bootstrapped SaaS vs Institutional Seed Round',
      prompt: 'Should I bootstrap my B2B SaaS with personal cashflow to preserve 100% equity, or raise a $2.5M institutional seed round from top-tier VCs?',
      optionsCount: 2,
    },
    {
      category: 'Education & Research',
      title: 'Frontier AI Fellowship vs Industry Lead',
      prompt: 'Should I join a frontier AI research lab fellowship or continue accelerating industry engineering leadership?',
      optionsCount: 2,
    },
    {
      category: 'Capital Allocation',
      title: 'Major Real Estate Acquisition vs Liquid Index Portfolio',
      prompt: 'Should I allocate capital into prime commercial property or deploy into a globally diversified liquid index portfolio?',
      optionsCount: 2,
    },
  ];

  return (
    <div className="px-6 pt-24 pb-36 max-w-4xl mx-auto space-y-10 select-none animate-in fade-in duration-200 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-1.5 pb-4 border-b border-[var(--line-color)]">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
          ✦ REAL-TIME DECISION INTELLIGENCE
        </span>
        <h1 className="text-3xl sm:text-4xl font-editorial text-[var(--text-vivid)]">
          Decision Patterns & Templates
        </h1>
        <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
          Review your real-world decision metrics and launch live multi-agent decision models with zero mock data.
        </p>
      </div>

      {/* SECTION 1: Real Decision History Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              YOUR REAL-TIME DECISION METRICS
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {hasRealData ? 'Live Database Records' : 'Awaiting First Decision'}
          </span>
        </div>

        {hasRealData && realStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Total Evaluated
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {realStats.total}
                </span>
                <span className="text-xs text-cyan-400 font-mono">Dilemmas</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Mean AI Confidence
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {realStats.avgConfidence}%
                </span>
                <span className="text-xs text-slate-400 font-mono">Consensus</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Model Status
              </span>
              <div className="flex items-center space-x-3 text-xs font-mono mt-1">
                <span className="text-emerald-400">
                  ● {realStats.resolved} Resolved
                </span>
                <span className="text-cyan-400">
                  ● {realStats.active} Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Decision History Recorded Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              As you analyze real decisions in FlowMind, your personal priority distribution, confidence ratings, and cognitive calibration will automatically be computed here from your actual database records.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Real-World Starter Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              STARTER DILEMMA TEMPLATES
            </h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            Click to Launch in Real Time →
          </span>
        </div>

        <p className="text-xs text-slate-400 font-sans">
          Select any real-world dilemma starter below to trigger a live, multi-agent evaluation cycle.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {decisionStarters.map((starter) => (
            <div
              key={starter.title}
              onClick={() => onLoadDilemma(starter.prompt)}
              className="group p-5 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-sm hover:shadow-cyan-950/20"
            >
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                  {starter.category}
                </span>
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {starter.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2">
                  "{starter.prompt}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--line-color)] text-[10px] font-mono text-slate-400">
                <span>{starter.optionsCount} Pathways</span>
                <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1 font-semibold">
                  <span>Launch Live Model</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

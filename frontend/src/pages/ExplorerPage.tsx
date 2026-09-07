import React from 'react';
import {
  Compass, ArrowRight, Crown, Sparkles,
  Layers, ShieldAlert, BookOpen, TrendingUp,
  SlidersHorizontal, CheckCircle2, Flame, Lightbulb
} from 'lucide-react';

interface ExplorerPageProps {
  onLoadDilemma: (prompt: string) => void;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({ onLoadDilemma }) => {
  const recurringPriorities = [
    { name: 'Learning Velocity & Growth', score: 92, color: 'bg-cyan-400', count: '5 decisions' },
    { name: 'Autonomy & Cultural Agency', score: 84, color: 'bg-emerald-400', count: '4 decisions' },
    { name: 'Equity & Financial Upside', score: 76, color: 'bg-amber-400', count: '4 decisions' },
    { name: 'Exit Optionality & Mobility', score: 68, color: 'bg-indigo-400', count: '3 decisions' },
    { name: 'Work-Life Sustainability', score: 55, color: 'bg-rose-400', count: '2 decisions' },
  ];

  const cognitiveInsights = [
    {
      title: 'Compounding Over Compensation',
      desc: 'You consistently prioritize learning velocity and high-density peer networks over immediate base cash compensation.',
    },
    {
      title: 'Geographic Mobility Conviction',
      desc: 'Decisions involving physical in-person network density average 84% confidence vs 72% for fully remote tracks.',
    },
    {
      title: 'Reversibility Preference',
      desc: 'You maintain higher confidence on candidate pathways with two-way door optionality rather than irreversible commitments.',
    },
  ];

  const decisionStarters = [
    {
      category: 'Career & Agency',
      title: 'Senior IC vs Engineering Leadership vs Founder Track',
      prompt: 'Should I remain on the Principal IC track, transition to Director of Engineering, or take a founder fellowship to bootstrap?',
      optionsCount: 3,
      typicalSignal: '86%',
    },
    {
      category: 'Offer Evaluation',
      title: 'Series B Startup Lead vs BigTech Staff Architect',
      prompt: 'Should I accept the Senior Lead role at a high-growth Series B AI startup, stay as Staff Engineer at BigTech, or start a self-funded venture?',
      optionsCount: 3,
      typicalSignal: '84%',
    },
    {
      category: 'Geographic Arbitrage',
      title: 'SF Bay Area Hub vs NYC Remote vs Zurich Mobility',
      prompt: 'Should I relocate to San Francisco for in-person founder networks, stay remote in New York, or accept the European transfer to Zurich?',
      optionsCount: 3,
      typicalSignal: '81%',
    },
    {
      category: 'Startup Capital',
      title: 'Bootstrapped SaaS vs Institutional Seed Round',
      prompt: 'Should I bootstrap my B2B SaaS with personal cashflow to preserve 100% equity, or raise a $2.5M institutional seed round from top-tier VCs?',
      optionsCount: 2,
      typicalSignal: '79%',
    },
    {
      category: 'Education & Research',
      title: 'Frontier AI Fellowship vs Industry Lead',
      prompt: 'Should I join a frontier AI research lab fellowship or continue accelerating industry engineering leadership?',
      optionsCount: 2,
      typicalSignal: '88%',
    },
    {
      category: 'Capital Allocation',
      title: 'Major Real Estate Acquisition vs Liquid Index Portfolio',
      prompt: 'Should I allocate capital into prime commercial property or deploy into a globally diversified liquid index portfolio?',
      optionsCount: 2,
      typicalSignal: '83%',
    },
  ];

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-1.5 pb-4 border-b border-[var(--line-color)]">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
          ✦ EXPLORE YOUR THINKING
        </span>
        <h1 className="text-3xl sm:text-4xl font-editorial text-[var(--text-vivid)]">
          Decision Patterns & Starters
        </h1>
        <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
          Discover patterns in what you prioritize, review cognitive tendencies, and launch pre-structured decision models.
        </p>
      </div>

      {/* SECTION 1: Personal Priority Allocation Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              YOUR RECURRING PRIORITIES
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Across All Decision Spaces</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-4 font-mono text-xs">
          {recurringPriorities.map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-slate-200 font-medium">{item.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">{item.score}% Weight</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Cognitive Insights From Decisions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
            COGNITIVE INSIGHTS & TENDENCIES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
          {cognitiveInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1.5"
            >
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                INSIGHT #{idx + 1}
              </div>
              <h4 className="font-semibold text-white text-xs">{insight.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {insight.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Decision Starters / Pre-Structured Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              DECISION STARTERS
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Click to load starter into Thinking Composer
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {decisionStarters.map((s, idx) => (
            <div
              key={idx}
              onClick={() => onLoadDilemma(s.prompt)}
              className="p-4 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-mono uppercase text-cyan-400 bg-cyan-950/40 px-2 py-0.2 rounded-full border border-cyan-500/20 font-bold">
                    {s.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {s.optionsCount} Pathways • {s.typicalSignal} Typical Signal
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white font-sans group-hover:text-cyan-300 transition-colors">
                  {s.title}
                </h3>
              </div>

              <div className="flex items-center space-x-1 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0 text-xs">
                <span>Start Template</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

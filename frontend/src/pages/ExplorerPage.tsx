import React from 'react';
import {
  Compass, ArrowRight, Crown, Sparkles,
  Layers, ShieldAlert, BookOpen
} from 'lucide-react';

interface ExplorerPageProps {
  onLoadDilemma: (prompt: string) => void;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({ onLoadDilemma }) => {
  const templates = [
    {
      title: 'Career Trilemma: Series B Startup vs BigTech Staff vs Founder Fellow',
      category: 'Career & Agency',
      confidence: '86.4%',
      winner: 'Series B Startup Lead',
      description: 'Balancing immediate high base cash compensation against compounding equity upside and learning velocity under a 3-year timeline.',
      factors: ['Learning Velocity (1.4x)', 'Financial Upside (1.2x)', 'Autonomy (1.0x)', 'Downside Risk (0.8x)'],
      prompt: 'Should I accept the Senior Lead role at a high-growth Series B AI startup, stay as Staff Engineer at BigTech, or take a Founder Fellowship to bootstrap?',
    },
    {
      title: 'Geographic Arbitrage: SF Bay Area vs NYC Remote vs Zurich Mobility',
      category: 'Strategic Mobility',
      confidence: '81.2%',
      winner: 'SF Bay Area Hub (2 Years)',
      description: 'Weighing high living expenses and tax friction against dense in-person founder networks and serendipitous venture dealflow.',
      factors: ['Network Density (1.5x)', 'Cost of Living (1.1x)', 'Personal Wellbeing (1.0x)'],
      prompt: 'Should I relocate to San Francisco to build in-person AI network, stay remote in New York, or accept the European transfer to Zurich?',
    },
    {
      title: 'Venture Capital Financing: Bootstrap SaaS vs Institutional Seed Round',
      category: 'Startup Capital',
      confidence: '79.5%',
      winner: 'Bootstrap to $30k MRR before Seed',
      description: 'Preserving 100% equity ownership and optionality vs accelerating customer acquisition via $2.5M venture capital funding.',
      factors: ['Dilution Preservation (1.3x)', 'Market Velocity (1.2x)', 'Runway Pressure (1.0x)'],
      prompt: 'Should I bootstrap my B2B SaaS with personal savings to preserve 100% equity, or raise a $2.5M institutional seed round from VCs?',
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 select-none animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 font-semibold tracking-wider mb-1">
            DECISION TOPOLOGY EXPLORER
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Curated High-Stakes Models
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Explore battle-tested multi-agent decision models and clone them directly into your cognitive workspace.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {templates.map((t, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-sky-400/50 transition-all space-y-3 shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {t.category}
                </span>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-1.5">
                  {t.title}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">
                  CALIBRATED SIGNAL
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {t.winner} ({t.confidence})
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {t.factors.map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border-subtle)]"
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
              <button
                onClick={() => onLoadDilemma(t.prompt)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-space-950 font-medium text-xs shadow-sm transition-all"
              >
                <span>Clone & Synthesize Model</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

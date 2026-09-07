import React from 'react';
import {
  Sparkles, ArrowRight, ShieldCheck, Swords, SlidersHorizontal,
  BookOpen, Users, History, CheckCircle2, ChevronRight, Crown
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col selection:bg-brand-primary/30">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-glow/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-space-900 border border-space-800 text-xs text-brand-primary mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">The AI Decision Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Think clearly.{' '}
          <span className="bg-gradient-to-r from-brand-primary via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Decide intelligently.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Transform unstructured dilemmas, offer letters, documents, and messy trade-offs into an interactive, explainable visual decision space powered by a council of specialized AI agents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-sky-400 text-space-950 font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-brand-primary/20 transition-all"
          >
            <span>Create your first decision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-space-900 hover:bg-space-850 text-slate-300 border border-space-800 hover:border-space-700 text-sm font-medium transition-all"
          >
            Explore the Architecture
          </a>
        </div>

        {/* Live Mock Interactive Spatial Canvas Preview */}
        <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-space-800 bg-space-900/90 p-4 shadow-modal-depth overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-space-800 text-xs font-mono text-slate-400 px-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-slate-500 pl-2">flowmind://decision/career-trilemma</span>
            </div>
            <span className="text-brand-primary">7 AGENTS ARBITRATING</span>
          </div>

          <div className="py-8 px-4 bg-spatial-grid rounded-xl mt-2 flex flex-col items-center">
            {/* Root Node */}
            <div className="w-full max-w-md bg-space-950 border border-space-700 rounded-xl p-3.5 text-left shadow-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-brand-primary font-mono font-semibold">DECISION ROOT</span>
                <span className="text-emerald-400 font-mono font-bold">86% Confidence</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Senior Startup Role vs BigTech Staff Track vs Venture Spin-off
              </h3>
            </div>

            {/* Stem */}
            <div className="w-0.5 h-8 bg-space-700 my-1" />

            {/* Options Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
              <div className="bg-space-950 border border-emerald-500/40 rounded-lg p-3 text-left">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Option A (Selected)</span>
                  </span>
                  <span className="font-mono text-xs text-white">88.5</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold">Series B Startup Lead</div>
                <div className="text-[10px] text-slate-400 mt-1">High equity leverage, fast learning velocity</div>
              </div>

              <div className="bg-space-950 border border-space-800 rounded-lg p-3 text-left">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Option B</span>
                  <span className="font-mono text-xs text-slate-300">81.0</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold">BigTech Staff Engineer</div>
                <div className="text-[10px] text-slate-400 mt-1">Compensation stability, lower volatility</div>
              </div>

              <div className="bg-space-950 border border-space-800 rounded-lg p-3 text-left">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Option C</span>
                  <span className="font-mono text-xs text-slate-300">74.0</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold">Self-Funded Venture</div>
                <div className="text-[10px] text-slate-400 mt-1">Maximum agency, high financial burn</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto border-t border-space-850">
        <div className="text-center mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-2">
            AI-Native Architecture
          </h2>
          <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Not a chatbot. A strategic reasoning engine.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-space-900 border border-space-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">
              7 Specialized Agents in Debate
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyst, Optimist, Skeptic, Financial Analyst, Long-Term Planner, Devil's Advocate, and Synthesizer actively cross-examine each other rather than generating one hallucinated summary.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-space-900 border border-space-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">
              ⚔️ Challenge My Decision
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              One-click adversarial stress-test. The Devil's Advocate attacks prevailing recommendations, exposes hidden confirmation biases, and recalibrates model confidence in real time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-space-900 border border-space-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">
              Dynamic What-If Simulator
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust compensation percentages, remote work priorities, or time horizons. Observe dynamic before/after recalculations and uncover exact turning points.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-space-900 border border-space-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">
              RAG Document Intelligence
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload PDF offer letters, contracts, or DOCX notes. FlowMind chunks, embeds, and grounds every key analytical claim back to the exact page and paragraph source.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-space-900 border border-space-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">
              Decision Outcomes Feedback Loop
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log actual real-world outcomes 6-12 months later. Compare AI predictions vs lived satisfaction to calibrate personal judgment over time.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-space-900 border border-space-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">
              Spatial Graph Visualization
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pan, zoom, expand, and inspect decision nodes on an interactive spatial canvas designed for deep cognitive clarity rather than superficial dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-12 px-6 border-t border-space-850 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-brand-primary flex items-center justify-center text-space-950 font-bold text-[10px]">
              FM
            </div>
            <span className="font-semibold text-slate-300">FlowMind AI</span>
            <span>— The AI Decision Intelligence Platform</span>
          </div>
          <div>Built for high-stakes decisions under uncertainty.</div>
        </div>
      </footer>
    </div>
  );
};

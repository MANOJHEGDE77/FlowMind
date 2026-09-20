import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Swords, SlidersHorizontal, Users,
  BookOpen, CheckCircle2, ChevronRight, Crown, Layers,
  ShieldAlert, Zap, BarChart3, Scale, Eye, Check,
  ExternalLink, Terminal, ShieldCheck, Cpu, ArrowUpRight,
  TrendingUp, AlertTriangle, FileText, CornerDownRight, RotateCcw
} from 'lucide-react';
import { soundService } from '../services/sound';

interface LandingPageProps {
  onGetStarted: () => void;
  onExplore: () => void;
  onOpenAskAI: (q?: string) => void;
  onSelectStarterDilemma: (dilemma: {
    title: string;
    context: string;
    options: Array<{ title: string; description?: string }>;
  }) => void;
}

const AGENTS_DATA = [
  {
    id: 'analyst',
    code: 'AGT_01',
    name: 'The Analyst',
    role: 'Empirical Baseline',
    icon: '🔍',
    confidence: '92%',
    question: 'What does the evidence say?',
    lens: 'Historical base rates indicate a 42% survival probability for Series B ventures in vertical AI. Customer retention in the first 90 days is the primary indicator of durable product-market fit.',
    risk: 'Key executive turnover if early validation takes more than 5 months.',
    tag: 'EMPIRICAL_RIGOR',
    color: '#00F0FF',
  },
  {
    id: 'optimist',
    code: 'AGT_02',
    name: 'The Optimist',
    role: 'Asymmetric Upside',
    icon: '🚀',
    confidence: '96%',
    question: 'What could go right?',
    lens: 'Early lead equity captures asymmetric upside. In the bull case, market tailwinds and autonomous agent adoption provide 12x compounding valuation leverage over 4 years.',
    risk: 'Opportunity cost if sales cycle elongates beyond 9 months.',
    tag: 'ASYMMETRIC_LEVERAGE',
    color: '#10B981',
  },
  {
    id: 'skeptic',
    code: 'AGT_03',
    name: 'The Skeptic',
    role: 'Downside Protection',
    icon: '🛡️',
    confidence: '78%',
    question: 'What are we missing?',
    lens: 'Switching costs are high. This is an irreversible Type 1 door: exiting early burns reputational capital and forfeits accrued equity vesting schedules.',
    risk: 'Burnout and compensation reduction in year 1 before revenue stability.',
    tag: 'TAIL_RISK_DEFENSE',
    color: '#F43F5E',
  },
  {
    id: 'financial',
    code: 'AGT_04',
    name: 'The Financial Analyst',
    role: 'Capital Efficiency',
    icon: '💰',
    confidence: '89%',
    question: 'What are the financial implications?',
    lens: 'Net Present Value analysis indicates Option A delivers 2.8x expected capital return over 5 years compared to fixed salary compensation, adjusting for inflation and equity risk.',
    risk: 'Sunk cost escalation during initial unmonetized prototyping.',
    tag: 'CAPITAL_CALIBRATION',
    color: '#F59E0B',
  },
  {
    id: 'planner',
    code: 'AGT_05',
    name: 'The Long-Term Planner',
    role: 'Compounding Horizon',
    icon: '⏳',
    confidence: '91%',
    question: 'What compounds over time?',
    lens: 'Second-order effects: high-density leadership accelerates personal brand and unlocks direct tier-1 founder network, outperforming incremental corporate ladder advancement.',
    risk: 'Delayed liquidity timeline compared to public stock vesting.',
    tag: 'SECOND_ORDER_HORIZON',
    color: '#6366F1',
  },
  {
    id: 'devil',
    code: 'AGT_06',
    name: "The Devil's Advocate",
    role: 'Bias Interrogation',
    icon: '⚔️',
    confidence: '84%',
    question: 'Why might this fail?',
    lens: 'Severe confirmation bias detected: you are underweighting the risk of customer churn and assuming early enthusiastic feedback equates to signed enterprise contracts.',
    risk: 'Premature scaling based on verbal commitments without capital deposits.',
    tag: 'BIAS_DESTRUCTION',
    color: '#EF4444',
  },
  {
    id: 'synthesizer',
    code: 'AGT_07',
    name: 'The Synthesizer',
    role: 'Equilibrium Signal',
    icon: '⚖️',
    confidence: '88%',
    question: 'What survives the debate?',
    lens: 'Equilibrium recommendation decisively favors Option A, but mandates strict 60-day validation gates to bound downside exposure and verify enterprise pilot conversions.',
    risk: 'Recommendation confidence haircut (-12%) applied to account for unverified assumptions.',
    tag: 'EQUILIBRIUM_SIGNAL',
    color: '#8B5CF6',
  },
];

const STARTER_DILEMMAS = [
  {
    id: 'career',
    code: 'DLM_01',
    title: 'Series B Startup Lead vs BigTech Staff Track',
    category: 'Executive Career Pivot',
    confidence: '88.5%',
    reversibility: 'TYPE_1 // ONE_WAY_DOOR',
    context: 'Weighing high-equity ownership and execution velocity at a funded AI startup against compensation stability and low volatility at a FAANG company.',
    options: [
      { title: 'Series B Startup Lead', description: 'High equity upside, intense velocity, critical leadership agency' },
      { title: 'BigTech Staff Engineer', description: 'Predictable compensation, public RSU liquidity, lower risk' },
      { title: 'Bootstrapped Venture', description: '100% founder agency, high financial burn, unbounded leverage' },
    ],
  },
  {
    id: 'capital',
    code: 'DLM_02',
    title: 'Bootstrap SaaS to Profitability vs Raise $2.5M Seed',
    category: 'Venture & Capital Strategy',
    confidence: '84.0%',
    reversibility: 'TYPE_1 // ONE_WAY_DOOR',
    context: 'Evaluating whether to retain 100% founder equity and grow sustainably from customer revenue, or accept $2.5M institutional seed funding with 20% dilution.',
    options: [
      { title: 'Bootstrap to Profitability', description: 'Zero dilution, organic growth, complete operational sovereignty' },
      { title: 'Raise $2.5M Seed Round', description: 'Accelerated runway, immediate key hires, liquidation preference risk' },
    ],
  },
  {
    id: 'architecture',
    code: 'DLM_03',
    title: 'Monolith vs Event-Driven Microservices',
    category: 'Technical Architecture',
    confidence: '91.2%',
    reversibility: 'TYPE_2 // TWO_WAY_DOOR',
    context: 'The engineering team is experiencing deploy friction as team size crosses 40 developers. Trade-off between distributed event microservices and a domain modular monolith.',
    options: [
      { title: 'Event-Driven Microservices', description: 'Independent deploys, network latency, distributed state overhead' },
      { title: 'Domain Modular Monolith', description: 'Unified repository, zero distributed transactions, faster iteration' },
    ],
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExplore,
  onOpenAskAI,
  onSelectStarterDilemma,
}) => {
  const [selectedDilemmaIdx, setSelectedDilemmaIdx] = useState<number>(0);
  const [activeHoverAgent, setActiveHoverAgent] = useState<string | null>('analyst');
  const [activeRedTeamStep, setActiveRedTeamStep] = useState<number>(0);
  const [marketFriction, setMarketFriction] = useState<number>(14);
  const [revenueShift, setRevenueShift] = useState<number>(8);
  const [hoveredMatrixNode, setHoveredMatrixNode] = useState<string>('startup');

  const currentDilemma = STARTER_DILEMMAS[selectedDilemmaIdx];

  // Calculated Monte Carlo Metrics
  const baseConfidence = 82;
  const p10Score = Math.max(38, Math.round(baseConfidence - marketFriction * 1.15 + Math.min(0, revenueShift)));
  const p50Score = Math.min(94, Math.max(48, Math.round(baseConfidence - marketFriction * 0.45 + revenueShift * 0.6)));
  const p90Score = Math.min(98, Math.round(baseConfidence + Math.max(0, revenueShift * 0.9) - marketFriction * 0.15));
  const calculatedVolatility = Math.round(Math.abs(p90Score - p10Score) * 0.65);

  const selectedAgentObj = AGENTS_DATA.find(a => a.id === activeHoverAgent) || AGENTS_DATA[0];

  return (
    <div className="relative min-h-screen bg-[#030408] text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Ambient Neural Lighting Fields */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[850px] h-[500px] bg-gradient-to-br from-cyan-500/[0.07] via-indigo-600/[0.05] to-transparent blur-[160px] rounded-full animate-aurora-1" />
        <div className="absolute top-[35%] right-0 w-[650px] h-[550px] bg-violet-600/[0.06] blur-[170px] rounded-full animate-aurora-2" />
        <div className="absolute top-[70%] left-[-10%] w-[700px] h-[500px] bg-amber-500/[0.04] blur-[180px] rounded-full" />
        <div className="absolute inset-0 grid-mesh-ambient opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* ========================================================================= */}
        {/* SECTION 1: THE QUESTION // ASYMMETRIC DECISION FLOW HERO */}
        {/* ========================================================================= */}
        <section className="min-h-[92vh] flex items-center pt-28 pb-16 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
            {/* Left Column (5 cols): Asymmetric Editorial Typography & Ingestion Stream */}
            <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-6">
              {/* Technical Origin Badge */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono w-fit backdrop-blur-xl"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-slate-300 uppercase tracking-wider">COGNITIVE INGESTION STREAM</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-400 font-bold">FLOW_ACTIVE</span>
              </motion.div>

              {/* Master Asymmetric Editorial Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="space-y-3"
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white font-sans uppercase">
                  A decision <br />
                  is never <br />
                  just one <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                    thought.
                  </span>
                </h1>

                {/* Animated Luminous Trajectory Line */}
                <div className="flex items-center space-x-3 py-1">
                  <div className="h-[2px] w-28 bg-gradient-to-r from-cyan-400 via-indigo-500 to-transparent relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/80 animate-flow-dash" />
                  </div>
                  <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">
                    ───────→
                  </span>
                </div>
              </motion.div>

              {/* Psychological Premise */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="space-y-2 text-slate-400 text-sm sm:text-base font-light leading-relaxed"
              >
                <p className="text-slate-200 font-medium font-sans">
                  One decision. Seven perspectives. Enter the flow of thought.
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Weighing asymmetric upside against irreversible traps. Uncovering what survives adversarial tension.
                </p>
              </motion.div>

              {/* Primary Call to Action Bar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <button
                  onClick={() => {
                    soundService.playSuccess();
                    onGetStarted();
                  }}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 hover:from-cyan-300 hover:via-indigo-300 hover:to-violet-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Enter the Flow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAskAI()}
                  className="px-5 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-cyan-400/40 text-xs font-mono flex items-center space-x-2 transition-all backdrop-blur-xl"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ask AI ✦</span>
                </button>
              </motion.div>

              {/* Active Dilemma Live Selector */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-4 border-t border-white/[0.06] space-y-2 font-mono"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest">
                  <span>SELECT ACTIVE DILEMMA:</span>
                  <span className="text-cyan-400 font-bold">REROUTES GRAPH ↓</span>
                </div>

                <div className="space-y-1.5">
                  {STARTER_DILEMMAS.map((d, idx) => {
                    const isSelected = selectedDilemmaIdx === idx;
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          soundService.playClick();
                          setSelectedDilemmaIdx(idx);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all text-xs border ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
                            0{idx + 1} //
                          </span>
                          <span className="truncate font-sans font-medium text-slate-200">
                            {d.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold ml-2 shrink-0">
                          {d.confidence}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right Column (7 cols): The Hero of the Screen — The Living Cognitive Mind */}
            <div className="lg:col-span-7 relative w-full flex flex-col items-center justify-center">
              <div className="relative w-full rounded-3xl bg-[#060812]/90 border border-white/[0.08] backdrop-blur-2xl p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
                {/* Visual Header Telemetry */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06] font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-bold text-white tracking-widest text-[11px] uppercase">
                      COGNITIVE REASONING ARCHITECTURE
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span className="text-cyan-400">7 AGENTS IN DELIBERATION</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">1,000 SCENARIOS</span>
                  </div>
                </div>

                {/* THE LIVING NEURAL SVG CANVAS */}
                <div className="relative w-full aspect-[4/3] max-h-[500px] flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 760 520" fill="none" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#6366F1" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
                      </linearGradient>

                      <linearGradient id="clashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.8" />
                      </linearGradient>

                      <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="12" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Radial Orbit Guide Rings */}
                    <circle cx="380" cy="240" r="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
                    <circle cx="380" cy="240" r="110" stroke="rgba(0,240,255,0.08)" strokeWidth="1" />

                    {/* Dynamic Dialectic Conflict Arc (Optimist vs Skeptic tension) */}
                    <path
                      d="M 180 230 C 260 160, 500 160, 580 230"
                      stroke="url(#clashGradient)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                      opacity="0.75"
                    />

                    {/* Incoming Dilemma Flow Arrow into Center */}
                    <path
                      d="M 40 240 L 290 240"
                      stroke="url(#beamGradient)"
                      strokeWidth="2.5"
                      strokeDasharray="8 6"
                      className="animate-flow-dash"
                    />

                    {/* Synaptic Bezier Filaments: Center Core to each Perspective */}
                    {/* Analyst (Top-Left) */}
                    <path d="M 380 240 Q 280 160 220 110" stroke="url(#beamGradient)" strokeWidth="1.8" strokeDasharray="6 4" className="animate-flow-dash" />
                    {/* Long-Term Planner (Top-Center) */}
                    <path d="M 380 240 L 380 80" stroke="url(#beamGradient)" strokeWidth="1.8" strokeDasharray="6 4" className="animate-flow-dash" />
                    {/* Optimist (Top-Right) */}
                    <path d="M 380 240 Q 480 160 540 110" stroke="url(#beamGradient)" strokeWidth="1.8" strokeDasharray="6 4" className="animate-flow-dash" />
                    {/* Skeptic (Mid-Right) */}
                    <path d="M 380 240 L 580 230" stroke="url(#beamGradient)" strokeWidth="1.8" strokeDasharray="6 4" className="animate-flow-dash" />
                    {/* Devil's Advocate (Bottom-Right) */}
                    <path d="M 380 240 Q 480 320 540 370" stroke="url(#beamGradient)" strokeWidth="1.8" strokeDasharray="6 4" className="animate-flow-dash" />
                    {/* Financial Analyst (Bottom-Left) */}
                    <path d="M 380 240 Q 280 320 220 370" stroke="url(#beamGradient)" strokeWidth="1.8" strokeDasharray="6 4" className="animate-flow-dash" />
                    {/* Synthesizer (Bottom-Center) */}
                    <path d="M 380 240 L 380 410" stroke="#8B5CF6" strokeWidth="2.8" strokeDasharray="6 4" className="animate-flow-dash" />
                    {/* Synthesizer to Calibrated Clarity */}
                    <path d="M 380 430 L 380 490" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" opacity="0.9" />

                    {/* CENTRAL FLOWMIND COGNITIVE CORE */}
                    <g className="cursor-pointer" onClick={onGetStarted}>
                      <circle cx="380" cy="240" r="64" fill="#0C1124" stroke="#00F0FF" strokeWidth="2" filter="url(#coreGlow)" />
                      <circle cx="380" cy="240" r="54" fill="url(#beamGradient)" opacity="0.15" />
                      <circle cx="380" cy="240" r="46" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="380" y="234" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace" letterSpacing="2">
                        FLOWMIND
                      </text>
                      <text x="380" y="248" textAnchor="middle" fill="#00F0FF" fontSize="8" fontFamily="monospace" letterSpacing="1">
                        CORE // ACTIVE
                      </text>
                      <text x="380" y="262" textAnchor="middle" fill="#94A3B8" fontSize="7" fontFamily="sans-serif">
                        {currentDilemma.code}
                      </text>
                    </g>

                    {/* 7 AGENT NODES (Clickable and interactive) */}
                    {/* 1. Analyst (Top-Left) */}
                    <g className="cursor-pointer group" onMouseEnter={() => setActiveHoverAgent('analyst')}>
                      <circle cx="220" cy="110" r="28" fill="#090C16" stroke={activeHoverAgent === 'analyst' ? '#00F0FF' : 'rgba(0,240,255,0.4)'} strokeWidth={activeHoverAgent === 'analyst' ? 2 : 1} />
                      <text x="220" y="108" textAnchor="middle" fill="#00F0FF" fontSize="12">🔍</text>
                      <text x="220" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">ANALYST</text>
                    </g>

                    {/* 2. Long-Term Planner (Top-Center) */}
                    <g className="cursor-pointer group" onMouseEnter={() => setActiveHoverAgent('planner')}>
                      <circle cx="380" cy="80" r="28" fill="#090C16" stroke={activeHoverAgent === 'planner' ? '#6366F1' : 'rgba(99,102,241,0.4)'} strokeWidth={activeHoverAgent === 'planner' ? 2 : 1} />
                      <text x="380" y="78" textAnchor="middle" fill="#6366F1" fontSize="12">⏳</text>
                      <text x="380" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">PLANNER</text>
                    </g>

                    {/* 3. Optimist (Top-Right) */}
                    <g className="cursor-pointer group" onMouseEnter={() => setActiveHoverAgent('optimist')}>
                      <circle cx="540" cy="110" r="28" fill="#090C16" stroke={activeHoverAgent === 'optimist' ? '#10B981' : 'rgba(16,185,129,0.4)'} strokeWidth={activeHoverAgent === 'optimist' ? 2 : 1} />
                      <text x="540" y="108" textAnchor="middle" fill="#10B981" fontSize="12">🚀</text>
                      <text x="540" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">OPTIMIST</text>
                    </g>

                    {/* 4. Skeptic (Mid-Right) */}
                    <g className="cursor-pointer group" onMouseEnter={() => setActiveHoverAgent('skeptic')}>
                      <circle cx="580" cy="230" r="28" fill="#090C16" stroke={activeHoverAgent === 'skeptic' ? '#F43F5E' : 'rgba(244,63,94,0.4)'} strokeWidth={activeHoverAgent === 'skeptic' ? 2 : 1} />
                      <text x="580" y="228" textAnchor="middle" fill="#F43F5E" fontSize="12">🛡️</text>
                      <text x="580" y="242" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">SKEPTIC</text>
                    </g>

                    {/* 5. Devil's Advocate (Bottom-Right) */}
                    <g className="cursor-pointer group" onMouseEnter={() => setActiveHoverAgent('devil')}>
                      <circle cx="540" cy="370" r="28" fill="#090C16" stroke={activeHoverAgent === 'devil' ? '#EF4444' : 'rgba(239,68,68,0.4)'} strokeWidth={activeHoverAgent === 'devil' ? 2 : 1} />
                      <text x="540" y="368" textAnchor="middle" fill="#EF4444" fontSize="12">⚔️</text>
                      <text x="540" y="382" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">DEVIL</text>
                    </g>

                    {/* 6. Financial Analyst (Bottom-Left) */}
                    <g className="cursor-pointer group" onMouseEnter={() => setActiveHoverAgent('financial')}>
                      <circle cx="220" cy="370" r="28" fill="#090C16" stroke={activeHoverAgent === 'financial' ? '#F59E0B' : 'rgba(245,158,11,0.4)'} strokeWidth={activeHoverAgent === 'financial' ? 2 : 1} />
                      <text x="220" y="368" textAnchor="middle" fill="#F59E0B" fontSize="12">💰</text>
                      <text x="220" y="382" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">FINANCE</text>
                    </g>

                    {/* 7. Synthesizer (Bottom-Center) */}
                    <g className="cursor-pointer group" onMouseEnter={() => setActiveHoverAgent('synthesizer')}>
                      <circle cx="380" cy="410" r="30" fill="#140D26" stroke={activeHoverAgent === 'synthesizer' ? '#8B5CF6' : 'rgba(139,92,246,0.5)'} strokeWidth={activeHoverAgent === 'synthesizer' ? 2.5 : 1.5} />
                      <text x="380" y="408" textAnchor="middle" fill="#8B5CF6" fontSize="12">⚖️</text>
                      <text x="380" y="422" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">SYNTHESIS</text>
                    </g>

                    {/* Bottom Clarity Pill */}
                    <g>
                      <rect x="260" y="475" width="240" height="28" rx="14" fill="#064E3B" fillOpacity="0.4" stroke="#10B981" strokeWidth="1" />
                      <text x="380" y="493" textAnchor="middle" fill="#34D399" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                        CALIBRATED CLARITY // {currentDilemma.confidence}
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Live Node Inspection Micro-Card */}
                <div className="mt-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-left font-mono">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedAgentObj.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white uppercase">{selectedAgentObj.name}</span>
                        <span className="text-[10px] text-cyan-400 font-semibold">[{selectedAgentObj.tag}]</span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic font-editorial">
                        "{selectedAgentObj.question}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundService.playSuccess();
                      onSelectStarterDilemma({
                        title: currentDilemma.title,
                        context: currentDilemma.context,
                        options: currentDilemma.options,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-mono transition-all shrink-0 flex items-center space-x-1.5 shadow-md"
                  >
                    <span>Convene Council</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: THE PERSPECTIVES // 7 AUTONOMOUS REASONING MODELS */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
          <div className="max-w-3xl mb-12 text-left space-y-2">
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold">
              02 // THE SEVEN REASONING ENGINES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Seven perspectives. Zero consensus groupthink.
            </h2>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              Human judgment suffers from confirmation bias and premature closure. FlowMind convenes seven autonomous cognitive models, each interrogating your decision from an opposing strategic angle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left font-mono">
            {AGENTS_DATA.map((agent) => (
              <div
                key={agent.id}
                className="p-5 rounded-2xl bg-[#070912]/80 border border-white/[0.06] hover:border-cyan-500/40 transition-all flex flex-col justify-between group backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{agent.code} // {agent.name}</div>
                        <div className="text-[10px] text-slate-400">{agent.role}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-cyan-400 border border-white/[0.08] font-bold">
                      {agent.confidence}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium italic mb-3 font-editorial">
                    "{agent.question}"
                  </p>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                    {agent.lens}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-rose-400/90 font-semibold">Vulnerability Focus</span>
                  <span className="truncate max-w-[170px] text-slate-300">{agent.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: THE CONFLICT // DIALECTIC OPPOSITION */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
          <div className="max-w-3xl mb-12 text-left space-y-2">
            <span className="text-xs font-mono tracking-widest text-rose-400 uppercase font-bold">
              03 // DIALECTIC TENSION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Where consensus breaks.
            </h2>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              Real clarity does not come from instant agreement. It emerges when competing strategic viewpoints are locked in direct, unsparing dialectic opposition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left font-mono">
            {/* Clash 1: Optimist vs Skeptic */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0B0D1B] to-[#05060D] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-emerald-400 font-bold">OPTIMIST</span>
                <span className="text-slate-500 font-bold">VS</span>
                <span className="text-rose-400 font-bold">SKEPTIC</span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-0.5">THE UPSIDE THESIS</span>
                  <p className="text-slate-200 leading-relaxed">
                    "Early equity ownership compounds exponentially. First-mover advantage secures an insurmountable distribution moat."
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20">
                  <span className="text-[10px] font-mono text-rose-400 font-bold block mb-0.5">THE DOWNSIDE REALITY</span>
                  <p className="text-slate-200 leading-relaxed">
                    "This is an irreversible Type 1 door. Exiting early destroys reputational goodwill and forfeits unvested equity."
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                <span>TENSION VECTOR</span>
                <span className="text-cyan-400 font-bold">LEVERAGE vs LOCK-IN</span>
              </div>
            </div>

            {/* Clash 2: Analyst vs Devil's Advocate */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0B0D1B] to-[#05060D] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-cyan-400 font-bold">ANALYST</span>
                <span className="text-slate-500 font-bold">VS</span>
                <span className="text-red-400 font-bold">DEVIL'S ADVOCATE</span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-0.5">EMPIRICAL PRECEDENT</span>
                  <p className="text-slate-200 leading-relaxed">
                    "Historical cohort data verifies that top-quartile founders in this sector average 3.4x higher enterprise value over 5 years."
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20">
                  <span className="text-[10px] font-mono text-red-400 font-bold block mb-0.5">BIAS DESTRUCTION</span>
                  <p className="text-slate-200 leading-relaxed">
                    "Survivorship bias: you are ignoring the 58% of peer ventures that ran out of cash before enterprise contracts materialized."
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                <span>TENSION VECTOR</span>
                <span className="text-cyan-400 font-bold">BASE RATES vs BLIND SPOTS</span>
              </div>
            </div>

            {/* Clash 3: Financial Analyst vs Long-Term Planner */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0B0D1B] to-[#05060D] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="text-amber-400 font-bold">FINANCE</span>
                <span className="text-slate-500 font-bold">VS</span>
                <span className="text-indigo-400 font-bold">PLANNER</span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                  <span className="text-[10px] font-mono text-amber-400 font-bold block mb-0.5">CAPITAL RUNWAY</span>
                  <p className="text-slate-200 leading-relaxed">
                    "Cash burn accelerates under Option A. Runway decreases from 24 months to 11 months before break-even."
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-0.5">COMPOUNDING HORIZON</span>
                  <p className="text-slate-200 leading-relaxed">
                    "A narrower runway is offset by strategic talent density that unlocks tier-1 venture follow-on rounds."
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                <span>TENSION VECTOR</span>
                <span className="text-cyan-400 font-bold">LIQUIDITY vs TRAJECTORY</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: RED TEAM MODE // ASSUMPTION UNDER ATTACK */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#100609] via-[#090306] to-[#040102] border border-rose-500/30 shadow-[0_30px_90px_rgba(244,63,94,0.15)] text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-rose-500/20">
              <div>
                <span className="text-xs font-mono tracking-widest text-rose-400 uppercase font-bold flex items-center space-x-2">
                  <Swords className="w-3.5 h-3.5 text-rose-400" />
                  <span>04 // ADVERSARIAL RED TEAM PROTOCOL</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
                  Assumption Under Attack
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
                  FlowMind does not cheerlead your preferred choice. It aggressively stress-tests what could destroy it.
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-black/60 px-4 py-2 rounded-2xl border border-rose-500/30 shrink-0 font-mono text-xs">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Calibrated Haircut</div>
                  <div className="text-rose-400 font-bold">-12% Confidence</div>
                </div>
                <div className="text-xl font-bold text-white">
                  88% → <span className="text-rose-400">76%</span>
                </div>
              </div>
            </div>

            {/* 4-Step Assumption Attack Framework */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block">01 // ASSUMPTION</span>
                <div className="text-white font-semibold font-sans">What must be true?</div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  "Assumes the enterprise pipeline will convert at 25% within 90 days without price concessions."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/[0.06] border border-rose-500/25 space-y-2">
                <span className="text-[10px] text-rose-400 font-bold block">02 // THE ATTACK</span>
                <div className="text-white font-semibold font-sans">What invalidates it?</div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  "Zero signed enterprise purchase orders exist. Verbal enthusiasm is being treated as contractual revenue."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/25 space-y-2">
                <span className="text-[10px] text-amber-400 font-bold block">03 // COUNTERFACTUAL</span>
                <div className="text-white font-semibold font-sans">What if growth is 50% slower?</div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  "Cash runway drops to 7 months. The firm is forced into a punitive recapitalization."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/25 space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold block">04 // SURVIVAL GATE</span>
                <div className="text-white font-semibold font-sans">Does the decision survive?</div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  "Survives only if milestone gates (2 enterprise LOIs before hiring) are strictly enforced."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: SIMULATION // 1,000 MONTE CARLO STOCHASTIC FUTURES */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
          <div className="max-w-3xl mb-12 text-left space-y-2">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
              05 // MONTE CARLO SIMULATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              1,000 possible futures. Not one single outcome.
            </h2>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              Every decision enters an uncertain world. FlowMind models 1,000 stochastic scenario variations to map your downside floor and compounding upside ceiling.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#080B14] border border-white/[0.08] space-y-8 text-left font-mono">
            {/* Interactive Sensitivity Levers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Execution Friction Drag</span>
                  <span className="text-cyan-400 font-bold">+{marketFriction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={marketFriction}
                  onChange={(e) => setMarketFriction(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Zero Delay</span>
                  <span>Severe Market Drag (+40%)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Revenue / Macro Growth Shift</span>
                  <span className="text-emerald-400 font-bold">{revenueShift > 0 ? `+${revenueShift}%` : `${revenueShift}%`}</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={revenueShift}
                  onChange={(e) => setRevenueShift(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Downside Contraction (-25%)</span>
                  <span>Bull Market (+25%)</span>
                </div>
              </div>
            </div>

            {/* 3-Percentile Distribution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-rose-500/[0.06] border border-rose-500/30 text-center">
                <div className="text-[10px] uppercase text-rose-400 font-bold tracking-wider">P10 STRESS FLOOR</div>
                <div className="text-3xl font-bold text-rose-400 mt-1">{p10Score}%</div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Worst 10% outcome floor</p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/30 text-center">
                <div className="text-[10px] uppercase text-indigo-400 font-bold tracking-wider">P50 MEDIAN BASE</div>
                <div className="text-3xl font-bold text-indigo-300 mt-1">{p50Score}%</div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Expected equilibrium outcome</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/30 text-center">
                <div className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">P90 BULL CEILING</div>
                <div className="text-3xl font-bold text-emerald-400 mt-1">{p90Score}%</div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">90th percentile asymmetric upside</p>
              </div>
            </div>

            {/* Statistical Transparency Disclaimer */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 font-sans flex items-start space-x-2.5">
              <span className="text-amber-400 font-bold">ℹ</span>
              <p>
                <strong className="text-slate-200 font-mono">SCENARIO-BASED SENSITIVITY DISCLAIMER:</strong> These 1,000 iterations model parametric sensitivity under varied assumptions. They provide relative distribution boundaries rather than claiming absolute predictive certainty.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: EVIDENCE // GROUNDED KNOWLEDGE GRAPH */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
          <div className="max-w-3xl mb-12 text-left space-y-2">
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">
              06 // GROUNDED RAG PROVENANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Evidence connected to reasoning.
            </h2>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              No ungrounded AI speculation. Every claim in FlowMind links directly to uploaded PDFs, DOCX term sheets, and financial models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left font-mono">
            <div className="p-6 rounded-3xl bg-[#070912] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">SERIES_B_TERMSHEET.PDF</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">VERIFIED CITATION</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-sans text-slate-300">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">EVIDENCE EXCERPT // SECTION 4.2</span>
                "1x Non-participating liquidation preference applies. Employee pool expands by 4% prior to round closing, resulting in 18.2% total effective founder dilution."
              </div>

              <div className="flex items-center space-x-2 text-[10px]">
                <span className="text-slate-400">USED BY AGENTS:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">Analyst</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">Financial Analyst</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">Skeptic</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#070912] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white">ARCHITECTURE_RFC_v3.DOCX</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">VERIFIED CITATION</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-sans text-slate-300">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">EVIDENCE EXCERPT // BENCHMARK 7</span>
                "P99 latency across cross-region gRPC event mesh increases by 34ms compared to monolithic database transactions under peak load."
              </div>

              <div className="flex items-center space-x-2 text-[10px]">
                <span className="text-slate-400">USED BY AGENTS:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">Analyst</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">Long-Term Planner</span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30">Devil's Advocate</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 & 8: SYNTHESIS & CLARITY // THE EQUILIBRIUM SIGNAL */}
        {/* ========================================================================= */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
          <div className="max-w-3xl mb-12 text-left space-y-2">
            <span className="text-xs font-mono tracking-widest text-violet-400 uppercase font-bold">
              07 // SYNTHESIS TO CLARITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Noise dissolves. The signal crystallizes.
            </h2>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              When seven perspectives debate, bias is cancelled out. The Synthesizer harmonizes divergent viewpoints into a high-confidence equilibrium verdict.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0B0D1B] to-[#04060E] border border-white/[0.08] shadow-2xl text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.06] gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  RECOMMENDED TRAJECTORY // EQUILIBRIUM VERDICT
                </span>
                <h3 className="text-2xl font-bold text-white font-sans mt-1">
                  Series B Startup Lead with 90-Day Enterprise Gates
                </h3>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-base font-bold text-center shrink-0">
                88.5% Calibrated Confidence
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-cyan-400 font-bold block mb-1">SURVIVING VALUE DRIVER</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Asymmetric equity compounding dwarfs salary differential over 5 years.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-rose-400 font-bold block mb-1">KEY RISK BOUNDARY</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Type 1 irreversible door: requires mandatory 60-day runway validation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-indigo-400 font-bold block mb-1">90-DAY PROGRESS GATE</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Lock in 2 enterprise pilots before committing to relocation or long-term lease.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: ENTER FLOWMIND // CINEMATIC FINAL CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 max-w-5xl mx-auto w-full text-center border-t border-white/[0.06]">
          <div className="space-y-6">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 font-bold block">
              ENTER FLOWMIND
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight uppercase font-sans">
              Enter the flow <br />
              of thought.
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
              Stop making high-stakes decisions in the dark. Convene the 7-agent intelligence council on your career, venture, and architecture dilemmas.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  soundService.playSuccess();
                  onGetStarted();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 hover:from-cyan-300 hover:via-indigo-300 hover:to-violet-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_35px_rgba(0,240,255,0.35)] transition-all"
              >
                <span>Launch FlowMind Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExplore}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-mono flex items-center justify-center space-x-2 transition-all"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Explore Curated Dilemmas</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

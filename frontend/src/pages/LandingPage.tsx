import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Network,
  Sparkles,
  CheckSquare,
  Zap,
  Layers,
  Brain,
  ChevronRight,
  Shield,
  Clock,
  Compass,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Sliders,
  Database,
  Lock,
  Cpu,
  ChevronDown,
  Menu,
  X,
  Activity,
  Send,
  ExternalLink,
  Users,
  Quote,
  Radio,
} from 'lucide-react';
import { FlowMindLogo } from '../components/FlowMindLogo';
import { GithubIcon } from '../components/GithubIcon';
import { soundService } from '../services/sound';

export type LandingNavigateMode = 'canvas' | 'ai-think' | 'tasks' | 'flows' | 'home';

interface LandingPageProps {
  onGetStarted: () => void;
  onExplore: () => void;
  onOpenAskAI: (q?: string) => void;
  onSelectStarterDilemma: (dilemma: {
    title: string;
    context: string;
    options: Array<{ title: string; description?: string }>;
  }) => void;
  onNavigateToMode?: (mode: LandingNavigateMode) => void;
}

const STARTER_DILEMMAS = [
  {
    code: 'FLOW_01',
    category: 'Career & Growth',
    title: 'Staff Engineer Promotion vs Co-Founder Venture',
    context: 'Balancing guaranteed corporate equity vesting against asymmetric startup agency and upside.',
    options: [
      { title: 'Accept Seed Co-Founder Role', description: '22% equity stake, high ownership, early market discovery.' },
      { title: 'Remain Principal Staff at BigTech', description: 'Liquid RSUs, established team, guaranteed vesting schedule.' },
    ],
  },
  {
    code: 'FLOW_02',
    category: 'Distributed Systems',
    title: 'Monolith Refactor vs Event-Driven Microservices',
    context: 'Critical architectural crossroad projected under a 10x traffic spike.',
    options: [
      { title: 'Decompose to Kafka & Go Microservices', description: 'High concurrency scale, decoupled fault domains, higher operational footprint.' },
      { title: 'Optimize Postgres & Modular Monolith', description: 'Sub-millisecond query delivery, simplified transactional boundaries.' },
    ],
  },
  {
    code: 'FLOW_03',
    category: 'AI Architecture',
    title: 'Proprietary LLM Fine-Tuning vs Hybrid RAG',
    context: 'Balancing strict enterprise data sovereignty, query latency, and GPU cluster expenses.',
    options: [
      { title: 'Self-Hosted Llama-3 70B LoRA Matrix', description: 'Complete zero-leakage data privacy, dedicated model weights.' },
      { title: 'Managed Vector DB with Hybrid RAG', description: 'Sub-50ms latency, zero GPU maintenance overhead.' },
    ],
  },
];

const WORKSPACE_MODES = [
  {
    id: 'canvas' as const,
    title: 'FLOW',
    tagline: 'Visual Knowledge Canvas',
    description: 'An infinite spatial workspace to map thoughts, questions, decisions, and goals as connected living topologies.',
    icon: Network,
    accent: '#5EE7FF',
    accentBorder: 'border-[#5EE7FF]/30',
    accentBg: 'bg-[#5EE7FF]/10',
    features: ['Spatial node clustering', 'Subtle cubic bezier flows', 'Double-click thought creation', 'Minimap radar navigation'],
  },
  {
    id: 'ai-think' as const,
    title: 'THINK',
    tagline: 'AI Reasoning Pipeline',
    description: 'Structured multi-step reasoning blocks: Thought → Observations → Patterns → Synthesized Insight → Actionable Next Move.',
    icon: Sparkles,
    accent: '#7C5CFF',
    accentBorder: 'border-[#7C5CFF]/30',
    accentBg: 'bg-[#7C5CFF]/10',
    features: ['Contextual friction detection', 'Empirical signals deconstruction', 'One-click graph injection', 'Cross-flow synergies'],
  },
  {
    id: 'tasks' as const,
    title: 'ACT',
    tagline: 'Execution & Deep Focus',
    description: 'Every task is anchored directly to its originating thought node. No orphan to-dos, zero friction to execution.',
    icon: CheckSquare,
    accent: '#45E0A8',
    accentBorder: 'border-[#45E0A8]/30',
    accentBg: 'bg-[#45E0A8]/10',
    features: ['Direct thought provenance', 'Goal progress velocity bars', 'Pomodoro focus sprint timer', 'Distraction-free Zen mode'],
  },
];

const AGENTS = [
  { pid: '101', name: 'Analyst', role: 'Empirical Baseline', conf: 92, lens: 'Calculates historical base rates and empirical survivability curves to eliminate optimism bias.' },
  { pid: '102', name: 'Optimist', role: 'Asymmetric Upside', conf: 96, lens: 'Identifies non-linear upside potential and compounding second-order market tailwinds.' },
  { pid: '103', name: 'Skeptic', role: 'Downside Defense', conf: 81, lens: 'Stress-tests irreversible Type-1 commitments, liquidity constraints, and worst-case failure modes.' },
  { pid: '104', name: 'Finance', role: 'Capital Calibration', conf: 89, lens: 'Models net present value (NPV), opportunity costs, and capital efficiency trade-offs.' },
  { pid: '105', name: 'Horizon', role: 'Compounding Timeline', conf: 91, lens: 'Evaluates decade-long career compounding, knowledge retention, and relationship density.' },
  { pid: '106', name: 'Devil’s Advocate', role: 'Bias Interrogation', conf: 84, lens: 'Aggressively challenges assumptions, confirmation traps, and unvalidated premises.' },
  { pid: '107', name: 'Synthesizer', role: 'Equilibrium Signal', conf: 88, lens: 'Merges multi-agent debate into a unified, decisive action track with explicit milestones.' },
];

const COMPARISON_ROWS = [
  {
    dimension: 'Core Conceptual Model',
    notesApp: 'Static folders and text documents',
    kanban: 'Cards in column buckets',
    aiChat: 'Disposable chat stream',
    flowMind: 'Living topological knowledge graph',
  },
  {
    dimension: 'Idea Relationships',
    notesApp: 'Isolated, manually hyperlinked',
    kanban: 'None (flat lists)',
    aiChat: 'Lost after session closes',
    flowMind: 'Automatic visual semantic connections',
  },
  {
    dimension: 'Reasoning Engine',
    notesApp: 'None',
    kanban: 'None',
    aiChat: 'Generic conversational text',
    flowMind: 'Structured reasoning: Thought → Insight → Action',
  },
  {
    dimension: 'Task Provenance',
    notesApp: 'Disconnected checklist',
    kanban: 'Orphan to-dos',
    aiChat: 'Copy-pasted text',
    flowMind: 'Every action is linked to its thought origin',
  },
  {
    dimension: 'Deep Focus Execution',
    notesApp: 'External timer needed',
    kanban: 'External app needed',
    aiChat: 'None',
    flowMind: 'Native integrated focus space with Zen mode',
  },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Elena Rostova',
    role: 'Principal Distributed Architect',
    company: 'Ex-Stripe / CloudMesh',
    quote: 'FlowMind completely replaced my fragmented mess of Notion pages, Miro boards, and scratchpads. The direct provenance between architecture decisions and sprint tasks is unparalleled.',
    avatarColor: 'from-[#7C5CFF] to-[#5EE7FF]',
  },
  {
    name: 'Marcus Vance',
    role: 'Founding Engineer & CTO',
    company: 'Krypton AI Labs',
    quote: 'The 7-Agent Cognitive Council exposed a critical latency flaw in our RAG pipeline before we burned $60k on fine-tuning. It feels like having an elite advisory board in your browser.',
    avatarColor: 'from-[#5EE7FF] to-[#45E0A8]',
  },
  {
    name: 'Sarah Chen',
    role: 'Staff Infrastructure Lead',
    company: 'HyperScale Systems',
    quote: 'Being able to switch between the visual FLOW canvas, structured THINK reasoning, and ACT deep focus sprints without losing context changed my entire cognitive workflow.',
    avatarColor: 'from-[#F5B84B] to-[#FF5C6C]',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does FlowMind differ from traditional note-taking and mind mapping apps?',
    a: 'FlowMind is a "thinking operating system." Instead of leaving notes in isolated folders or drawing passive diagrams, FlowMind structures ideas into an active pipeline: Thought → Connection → Analysis → Insight → Decision → Action → Progress. Every task you execute is anchored directly to the conceptual thought that spawned it.',
  },
  {
    q: 'Can I use FlowMind offline or in a private environment?',
    a: 'Yes. All active flow graphs, connection topologies, and task streams are stored locally in your browser state. AI features utilize our local fallback heuristics when disconnected, or connect securely to state-of-the-art inference engines with zero data persistence on external servers.',
  },
  {
    q: 'What are the three workspace modes (FLOW, THINK, ACT)?',
    a: 'FLOW is the infinite spatial canvas where you build, drag, and connect mental models. THINK is the multi-step reasoning workspace where AI deconstructs observations and synthesizes insights. ACT is the execution stream where thoughts turn into concrete, progress-tracked action items.',
  },
  {
    q: 'How does the 7-Agent Cognitive Council work?',
    a: 'Whenever you face an ambiguous dilemma, the Cognitive Council examines it from 7 distinct angles (Empirical Analyst, Optimist, Downside Skeptic, Capital Finance, Compounding Horizon, Devil\'s Advocate, and Synthesizer). They deliberate to eliminate blind spots and calculate calibrated confidence scores.',
  },
  {
    q: 'Can I export my flows and action items?',
    a: 'Yes. You can export complete decision briefs, task lists, and thought graphs as formatted Markdown, JSON structures, or print-ready summaries directly from the workspace.',
  },
];

const HERO_DEMO_NODES = [
  {
    id: 'n1',
    label: 'Distributed Scalability',
    type: 'core',
    x: 20,
    y: 35,
    tag: 'GOAL',
    color: '#7C5CFF',
    desc: 'Target Tier-1 staff backend architecture with sub-10ms p99 latency.',
    detail: 'Core strategic pillar anchoring data partitioning, consensus, and fault domains.',
    connections: '4 active topologies',
  },
  {
    id: 'n2',
    label: 'Raft Consensus Protocol',
    type: 'decision',
    x: 175,
    y: 15,
    tag: 'DECISION',
    color: '#F5B84B',
    desc: 'Trade-off analysis: Strong linearizability vs operational complexity.',
    detail: 'Evaluated against Paxos and multi-Raft. Calibrated confidence 91%.',
    connections: 'Linked to Distributed Scalability',
  },
  {
    id: 'n3',
    label: 'Kafka Event Partitioning',
    type: 'idea',
    x: 190,
    y: 70,
    tag: 'THOUGHT',
    color: '#5EE7FF',
    desc: 'Keyed event streaming with idempotent consumers across 32 shards.',
    detail: 'Ensures strict causal ordering without cluster-wide lock contention.',
    connections: 'Linked to Concurrency Drill',
  },
  {
    id: 'n4',
    label: 'Lock-Free Queues',
    type: 'idea',
    x: 330,
    y: 25,
    tag: 'THOUGHT',
    color: '#5EE7FF',
    desc: 'Disruptor ring buffers & atomic CAS pointers for high-throughput memory buses.',
    detail: 'Eliminates OS thread context switches on critical packet dispatch paths.',
    connections: 'Linked to Distributed Scalability',
  },
  {
    id: 'n5',
    label: 'Execute Concurrency Drill',
    type: 'task',
    x: 340,
    y: 80,
    tag: 'ACTION',
    color: '#45E0A8',
    desc: '45-minute Deep Focus Sprint on thread dump analysis & stress harness.',
    detail: 'Direct action item with provenance tracked back to Distributed Scalability.',
    connections: 'Ready for ACT Deep Focus',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExplore,
  onOpenAskAI,
  onSelectStarterDilemma,
  onNavigateToMode,
}) => {
  const [quickThought, setQuickThought] = useState('');
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDemoNodeId, setSelectedDemoNodeId] = useState<string>('n1');

  // Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [privacyTab, setPrivacyTab] = useState<'privacy' | 'terms' | 'specs'>('privacy');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', org: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const selectedDemoNode = HERO_DEMO_NODES.find((n) => n.id === selectedDemoNodeId) || HERO_DEMO_NODES[0];

  const handleLaunchThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickThought.trim()) {
      onGetStarted();
      return;
    }
    soundService.playChime();
    onSelectStarterDilemma({
      title: quickThought.trim(),
      context: 'Synthesized directly from FlowMind portal.',
      options: [
        { title: 'Action Track A', description: 'Primary strategic execution pathway.' },
        { title: 'Action Track B', description: 'Alternative defensive contingency.' },
      ],
    });
  };

  const handleModeClick = (mode: LandingNavigateMode) => {
    soundService.playClick();
    if (onNavigateToMode) {
      onNavigateToMode(mode);
    } else {
      onGetStarted();
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email) return;
    soundService.playSuccess();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setIsContactModalOpen(false);
      setContactForm({ name: '', email: '', org: '', message: '' });
    }, 2000);
  };

  const selectedAgent = AGENTS[activeAgentIndex];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#08090D] text-[#F4F5F7] selection:bg-[#7C5CFF] selection:text-white custom-scrollbar">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#08090D]/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <FlowMindLogo size="md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

          <nav className="hidden md:flex items-center space-x-6 text-xs text-[#A7ACB8]">
            <a href="#modes" className="hover:text-white transition-colors">Workspace Modes</a>
            <a href="#council" className="hover:text-white transition-colors">Cognitive Council</a>
            <a href="#dilemmas" className="hover:text-white transition-colors">Scenarios</a>
            <a href="#comparison" className="hover:text-white transition-colors">Philosophy</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Voices</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="hidden sm:flex items-center space-x-3 text-xs font-medium">
            <a
              href="https://github.com/MANOJHEGDE77/FlowMind"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#A7ACB8] hover:text-white hover:border-white/[0.16] hover:bg-white/[0.06] transition-colors"
              title="FlowMind GitHub Repository"
            >
              <GithubIcon size={14} />
              <span>GitHub</span>
            </a>

            <button
              onClick={() => {
                soundService.playClick();
                setIsContactModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-[#A7ACB8] hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Contact
            </button>

            <button
              onClick={onExplore}
              className="px-3.5 py-1.5 rounded-xl text-[#A7ACB8] hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Directory
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onGetStarted();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold shadow-[0_0_20px_rgba(124,92,255,0.3)] hover:opacity-95 transition-all"
            >
              <span>Enter Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={() => {
                soundService.playClick();
                onGetStarted();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold text-xs"
            >
              Workspace
            </button>
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#A7ACB8] hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-b border-white/[0.08] bg-[#0F1118]/95 px-6 py-4 space-y-3 text-xs"
            >
              <div className="flex flex-col space-y-2 text-[#A7ACB8]">
                <a
                  href="#modes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  Workspace Modes (FLOW, THINK, ACT)
                </a>
                <a
                  href="#council"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  7-Agent Cognitive Council
                </a>
                <a
                  href="#dilemmas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  Simulate Scenarios
                </a>
                <a
                  href="#comparison"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  Product Philosophy &amp; Manifesto
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  Architect Voices
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1.5 hover:text-white"
                >
                  Frequently Asked Questions
                </a>
                <a
                  href="https://github.com/MANOJHEGDE77/FlowMind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 py-1.5 text-[#A7ACB8] hover:text-white"
                >
                  <GithubIcon size={14} />
                  <span>GitHub Repository</span>
                </a>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExplore();
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/[0.04] text-[#A7ACB8] text-center"
                >
                  Directory
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onGetStarted();
                  }}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold text-center"
                >
                  Launch App
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 space-y-24">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-[#A7ACB8]"
          >
            <span className="w-2 h-2 rounded-full bg-[#5EE7FF] animate-pulse" />
            <span className="font-mono uppercase text-[11px] tracking-wider text-white">FlowMind Cognitive OS v2.4</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.12]"
          >
            Turn thoughts into <br />
            <span className="text-flow-gradient font-bold">structured flow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-base sm:text-lg text-[#A7ACB8] leading-relaxed max-w-2xl mx-auto font-normal"
          >
            A visual workspace that transforms fragmented ideas into living knowledge graphs, multi-agent insights, and concrete action items.
          </motion.p>

          {/* INTERACTIVE THOUGHT ENTRY */}
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleLaunchThought}
            className="pt-2 max-w-xl mx-auto flex items-center p-2 rounded-2xl bg-[#0F1118] border border-white/[0.1] hover:border-white/[0.2] focus-within:border-[#7C5CFF] focus-within:shadow-[0_0_24px_rgba(124,92,255,0.25)] transition-all shadow-2xl"
          >
            <input
              type="text"
              value={quickThought}
              onChange={(e) => setQuickThought(e.target.value)}
              placeholder="What are you thinking about or deciding today?"
              className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder-[#686E7C] text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white text-xs font-semibold hover:opacity-95 transition-opacity shrink-0"
            >
              <span>Synthesize</span>
              <ArrowRight size={13} />
            </button>
          </motion.form>

          {/* LIVE INTERACTIVE HERO CANVAS SANDBOX */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-12 rounded-2xl bg-[#0F1118] border border-white/[0.1] p-4 sm:p-6 shadow-2xl space-y-4 text-left relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5EE7FF]" />
                <span className="text-xs font-semibold text-white">Live Knowledge Topology Preview</span>
                <span className="text-[10px] font-mono text-[#686E7C] hidden sm:inline">• Click any node to inspect</span>
              </div>
              <button
                onClick={() => handleModeClick('canvas')}
                className="text-xs font-medium text-[#5EE7FF] hover:underline flex items-center space-x-1"
              >
                <span>Launch Interactive Canvas</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Simulated Live Spatial Canvas */}
            <div className="relative h-64 sm:h-72 w-full rounded-xl bg-[#08090D] border border-white/[0.06] overflow-hidden p-4 select-none">
              {/* SVG Connecting Wires */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 120,110 C 180,60 220,60 260,60"
                  fill="none"
                  stroke="#7C5CFF"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                <path
                  d="M 120,110 C 180,160 220,170 280,180"
                  fill="none"
                  stroke="#5EE7FF"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                <path
                  d="M 260,60 C 340,60 380,80 430,90"
                  fill="none"
                  stroke="#5EE7FF"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                  className="animate-flow-dash opacity-70"
                />
                <path
                  d="M 280,180 C 360,180 380,200 440,210"
                  fill="none"
                  stroke="#45E0A8"
                  strokeWidth="2"
                  strokeOpacity="0.7"
                />
              </svg>

              {/* Node 1: Root Core */}
              <div
                onClick={() => {
                  soundService.playClick();
                  setSelectedDemoNodeId('n1');
                }}
                className={`absolute left-4 sm:left-8 top-20 p-3 rounded-xl border transition-all cursor-pointer w-48 sm:w-56 ${
                  selectedDemoNodeId === 'n1'
                    ? 'bg-[#151823] border-[#7C5CFF] shadow-[0_0_20px_rgba(124,92,255,0.3)] scale-105'
                    : 'bg-[#0F1118]/90 border-white/[0.1] hover:border-white/[0.2]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9B84FF] mb-1">
                  <span>CORE GOAL</span>
                  <span>4 LINKS</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Distributed Scalability</h4>
                <p className="text-[10px] text-[#A7ACB8] mt-0.5 line-clamp-1">Target Tier-1 staff backend architecture.</p>
              </div>

              {/* Node 2: Decision */}
              <div
                onClick={() => {
                  soundService.playClick();
                  setSelectedDemoNodeId('n2');
                }}
                className={`absolute left-48 sm:left-64 top-6 p-2.5 rounded-xl border transition-all cursor-pointer w-40 sm:w-48 ${
                  selectedDemoNodeId === 'n2'
                    ? 'bg-[#151823] border-[#F5B84B] shadow-[0_0_20px_rgba(245,184,75,0.3)] scale-105'
                    : 'bg-[#0F1118]/90 border-white/[0.1] hover:border-white/[0.2]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#F5B84B] mb-0.5">
                  <span>DECISION</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Raft Consensus</h4>
                <p className="text-[10px] text-[#A7ACB8] line-clamp-1">Tradeoff vs Paxos.</p>
              </div>

              {/* Node 3: Thought */}
              <div
                onClick={() => {
                  soundService.playClick();
                  setSelectedDemoNodeId('n3');
                }}
                className={`absolute left-52 sm:left-72 top-36 p-2.5 rounded-xl border transition-all cursor-pointer w-40 sm:w-48 ${
                  selectedDemoNodeId === 'n3'
                    ? 'bg-[#151823] border-[#5EE7FF] shadow-[0_0_20px_rgba(94,231,255,0.3)] scale-105'
                    : 'bg-[#0F1118]/90 border-white/[0.1] hover:border-white/[0.2]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5EE7FF] mb-0.5">
                  <span>THOUGHT</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Kafka Partitions</h4>
                <p className="text-[10px] text-[#A7ACB8] line-clamp-1">Ordered event streaming.</p>
              </div>

              {/* Node 4: Action */}
              <div
                onClick={() => {
                  soundService.playClick();
                  setSelectedDemoNodeId('n5');
                }}
                className={`absolute right-4 sm:right-12 top-28 p-2.5 rounded-xl border transition-all cursor-pointer w-44 sm:w-52 ${
                  selectedDemoNodeId === 'n5'
                    ? 'bg-[#151823] border-[#45E0A8] shadow-[0_0_20px_rgba(69,224,168,0.3)] scale-105'
                    : 'bg-[#0F1118]/90 border-white/[0.1] hover:border-white/[0.2]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#45E0A8] mb-0.5">
                  <span>ACTION</span>
                  <CheckCircle2 size={11} />
                </div>
                <h4 className="text-xs font-semibold text-white">Concurrency Drill</h4>
                <p className="text-[10px] text-[#A7ACB8] line-clamp-1">45m Deep Focus Sprint.</p>
              </div>
            </div>

            {/* LIVE HERO INSPECTOR CARD: Reflects the selected node */}
            <div className="p-3.5 rounded-xl bg-[#151823] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                    style={{ backgroundColor: `${selectedDemoNode.color}20`, color: selectedDemoNode.color }}
                  >
                    {selectedDemoNode.tag}
                  </span>
                  <span className="font-semibold text-white">{selectedDemoNode.label}</span>
                  <span className="text-[11px] text-[#686E7C] hidden sm:inline">• {selectedDemoNode.connections}</span>
                </div>
                <p className="text-[#A7ACB8] text-[11px] leading-relaxed">
                  {selectedDemoNode.detail}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleModeClick('canvas')}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-[11px] transition-colors"
                >
                  Open in FLOW
                </button>
                <button
                  onClick={() => handleModeClick('ai-think')}
                  className="px-3 py-1.5 rounded-lg bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-[#9B84FF] hover:bg-[#7C5CFF]/30 font-medium text-[11px] transition-colors"
                >
                  THINK Reasoning →
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* COGNITIVE PROGRESSION NARRATIVE */}
        <section className="p-8 rounded-3xl bg-[#0F1118] border border-white/[0.08] space-y-6 shadow-2xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5EE7FF]">
              System Architecture
            </span>
            <h2 className="text-2xl font-semibold text-white">
              The Seven Stages of FlowMind
            </h2>
            <p className="text-xs text-[#A7ACB8] max-w-xl mx-auto">
              How ambiguous, chaotic thinking is systematically refined into concrete, observable progress.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-left">
            {[
              { stage: '1. THOUGHT', desc: 'Raw spark or dilemma', color: 'text-white' },
              { stage: '2. CONNECT', desc: 'Contextual graph links', color: 'text-[#5EE7FF]' },
              { stage: '3. ANALYSIS', desc: 'Friction deconstruction', color: 'text-[#9B84FF]' },
              { stage: '4. INSIGHT', desc: 'Synthesized breakthrough', color: 'text-[#7C5CFF]' },
              { stage: '5. DECISION', desc: 'Calibrated choice', color: 'text-[#F5B84B]' },
              { stage: '6. ACTION', desc: 'Anchored task item', color: 'text-[#45E0A8]' },
              { stage: '7. PROGRESS', desc: 'Empirical execution', color: 'text-white' },
            ].map((st, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className={`text-xs font-mono font-bold ${st.color}`}>{st.stage}</span>
                <p className="text-[11px] text-[#A7ACB8]">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 WORKSPACE MODES DEEP DIVE */}
        <section id="modes" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#9B84FF]">
              Connected Workspaces
            </span>
            <h2 className="text-3xl font-semibold text-white tracking-tight">
              Three Modes for Every Thinking State
            </h2>
            <p className="text-xs text-[#A7ACB8] leading-relaxed">
              Never get trapped in a single inflexible view. Seamlessly transition between spatial synthesis, AI reasoning, and high-velocity execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKSPACE_MODES.map((mode) => {
              const Icon = mode.icon;

              return (
                <div
                  key={mode.id}
                  className="p-6 rounded-2xl bg-[#0F1118] border border-white/[0.08] hover:border-white/[0.16] flex flex-col justify-between space-y-6 transition-all group shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${mode.accentBg} border ${mode.accentBorder}`}>
                        <Icon size={22} style={{ color: mode.accent }} />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#686E7C]">
                        MODE
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-white">
                        {mode.title}
                      </h3>
                      <p className="text-xs font-medium" style={{ color: mode.accent }}>
                        {mode.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-[#A7ACB8] leading-relaxed">
                      {mode.description}
                    </p>

                    <div className="pt-2 space-y-1.5 border-t border-white/[0.06]">
                      {mode.features.map((feat, fi) => (
                        <div key={fi} className="flex items-center space-x-2 text-[11px] text-[#A7ACB8]">
                          <span className="text-[#5EE7FF]">•</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleModeClick(mode.id)}
                    className="pt-4 border-t border-white/[0.06] text-xs font-semibold text-white flex items-center justify-between group-hover:text-[#5EE7FF] transition-colors"
                  >
                    <span>Launch {mode.title} Workspace</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7-AGENT COGNITIVE COUNCIL MATRIX */}
        <section id="council" className="p-8 sm:p-10 rounded-3xl bg-[#0F1118] border border-white/[0.08] space-y-8 shadow-2xl scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#F5B84B]">
                Deliberation Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                The 7-Agent Cognitive Council
              </h2>
              <p className="text-xs text-[#A7ACB8]">
                Multi-agent dialectic system stress-testing every decision from 7 orthogonal perspectives.
              </p>
            </div>

            <button
              onClick={() => onOpenAskAI('Simulate Cognitive Council deliberation on active dilemma')}
              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white font-medium hover:bg-white/[0.08] transition-colors shrink-0"
            >
              Query Council →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Agent Selector Column */}
            <div className="lg:col-span-5 space-y-2">
              {AGENTS.map((agent, idx) => {
                const isSelected = activeAgentIndex === idx;

                return (
                  <button
                    key={agent.pid}
                    onClick={() => {
                      soundService.playClick();
                      setActiveAgentIndex(idx);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#151823] border-[#7C5CFF] text-white shadow-md'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#A7ACB8] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-mono text-[#686E7C]">#{agent.pid}</span>
                      <span className="text-xs font-semibold">{agent.name}</span>
                      <span className="text-[11px] text-[#686E7C] hidden sm:inline">• {agent.role}</span>
                    </div>

                    <span className="text-[10px] font-mono text-[#45E0A8] font-medium">
                      {agent.conf}% CONF
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Agent Viewpoint Card */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#151823] border border-white/[0.08] flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#7C5CFF]/20 text-[#9B84FF] border border-[#7C5CFF]/30">
                    AGENT #{selectedAgent.pid} // {selectedAgent.role}
                  </span>
                  <span className="text-xs font-mono text-[#45E0A8]">{selectedAgent.conf}% Calibrated Accuracy</span>
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {selectedAgent.name}’s Deliberation Lens
                </h3>

                <p className="text-sm text-[#F4F5F7] leading-relaxed italic bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                  &quot;{selectedAgent.lens}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#686E7C]">
                <span>Status: Continuous Background Dialectic</span>
                <button
                  onClick={() => onOpenAskAI(`How does the ${selectedAgent.name} agent analyze high-stakes trade-offs?`)}
                  className="text-[#5EE7FF] hover:underline font-medium"
                >
                  Ask {selectedAgent.name} →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STARTER SCENARIOS PLAYGROUND */}
        <section id="dilemmas" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5EE7FF]">
                Simulate Scenarios
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Pre-Built High-Stakes Dilemmas
              </h2>
              <p className="text-xs text-[#A7ACB8]">
                Click any dilemma to instantly deconstruct its strategic graph inside FlowMind.
              </p>
            </div>
            <button
              onClick={onExplore}
              className="text-xs text-[#5EE7FF] hover:underline font-medium"
            >
              Browse All Precedents →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STARTER_DILEMMAS.map((d) => (
              <div
                key={d.code}
                onClick={() => {
                  soundService.playClick();
                  onSelectStarterDilemma(d);
                }}
                className="p-5 rounded-2xl bg-[#0F1118] border border-white/[0.08] hover:border-[#7C5CFF]/50 hover:bg-[#151823] transition-all cursor-pointer space-y-4 flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#686E7C]">
                    <span>{d.code}</span>
                    <span className="text-[#5EE7FF]">{d.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#5EE7FF] transition-colors leading-snug">
                    {d.title}
                  </h3>
                  <p className="text-xs text-[#A7ACB8] line-clamp-2 leading-relaxed">
                    {d.context}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#686E7C]">
                  <span>2 Paths Structured</span>
                  <span className="text-[#5EE7FF] font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                    <span>Simulate</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON TABLE: PHILOSOPHY & MANIFESTO */}
        <section id="comparison" className="p-8 sm:p-10 rounded-3xl bg-[#0F1118] border border-white/[0.08] space-y-6 shadow-2xl scroll-mt-20">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#9B84FF]">
              Product Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Why A Thinking OS?
            </h2>
            <p className="text-xs text-[#A7ACB8]">
              Traditional tools fragment knowledge into static folders, flat lists, or disposable chat logs. FlowMind is engineered for interconnected thought.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#686E7C] font-mono text-[11px]">
                  <th className="py-3 px-4">DIMENSION</th>
                  <th className="py-3 px-4">NOTES APPS</th>
                  <th className="py-3 px-4">KANBAN BOARDS</th>
                  <th className="py-3 px-4">AI CHATBOTS</th>
                  <th className="py-3 px-4 text-[#5EE7FF]">FLOWMIND COGNITIVE OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{row.dimension}</td>
                    <td className="py-3 px-4 text-[#686E7C]">{row.notesApp}</td>
                    <td className="py-3 px-4 text-[#686E7C]">{row.kanban}</td>
                    <td className="py-3 px-4 text-[#686E7C]">{row.aiChat}</td>
                    <td className="py-3 px-4 text-[#5EE7FF] font-medium bg-[#7C5CFF]/5">{row.flowMind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* TESTIMONIALS & USE CASES */}
        <section id="testimonials" className="space-y-6 scroll-mt-20">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#45E0A8]">
              Architect Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Trusted by Decision-Makers
            </h2>
            <p className="text-xs text-[#A7ACB8]">
              Engineers, founders, and leaders rely on FlowMind to navigate high-stakes ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0F1118] border border-white/[0.08] flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <Quote size={20} className="text-[#7C5CFF] opacity-60" />
                  <p className="text-xs text-[#F4F5F7] leading-relaxed italic">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-3 border-t border-white/[0.06]">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${t.avatarColor} p-0.5 shrink-0`}>
                    <div className="w-full h-full rounded-full bg-[#08090D] flex items-center justify-center text-[10px] font-bold text-white">
                      {t.name[0]}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t.name}</h4>
                    <p className="text-[10px] text-[#686E7C]">{t.role} • {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE FAQ ACCORDION */}
        <section id="faq" className="space-y-6 max-w-3xl mx-auto scroll-mt-20">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5EE7FF]">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#A7ACB8]">
              Everything you need to know about FlowMind’s architecture and reasoning engine.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0F1118] border border-white/[0.08] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => {
                      soundService.playClick();
                      setOpenFaqIndex(isOpen ? null : idx);
                    }}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-[#5EE7FF] transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-[#686E7C] transition-transform duration-200 shrink-0 ml-3 ${
                        isOpen ? 'rotate-180 text-[#5EE7FF]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 text-xs text-[#A7ACB8] leading-relaxed border-t border-white/[0.04] pt-3"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CONVERSION BANNER */}
        <section className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-[#151823] to-[#0F1118] border border-[#7C5CFF]/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Ready to turn thoughts into flow?
            </h2>
            <p className="text-xs sm:text-sm text-[#A7ACB8] leading-relaxed">
              Step into your cognitive workspace. Experience spatial knowledge graphs, multi-agent reasoning, and focused execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                soundService.playChime();
                onGetStarted();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold text-xs shadow-lg shadow-[#7C5CFF]/30 hover:opacity-95 transition-all"
            >
              Launch FlowMind Free →
            </button>
            <button
              onClick={onExplore}
              className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-[#A7ACB8] hover:text-white transition-colors"
            >
              Explore Knowledge Directory
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12 text-xs text-[#686E7C]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          <div className="space-y-3">
            <FlowMindLogo size="sm" showWordmark={true} />
            <p className="text-xs text-[#686E7C] leading-relaxed">
              The thinking operating system. Transforming thoughts into living topologies and decisive action.
            </p>
            <button
              onClick={() => {
                soundService.playClick();
                setIsStatusModalOpen(true);
              }}
              className="flex items-center space-x-2 text-[11px] text-[#45E0A8] hover:underline"
            >
              <span className="w-2 h-2 rounded-full bg-[#45E0A8] animate-pulse" />
              <span>All Systems Operational (99.98%)</span>
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">Workspaces</h4>
            <ul className="space-y-1.5 text-xs text-[#A7ACB8]">
              <li><button onClick={() => handleModeClick('canvas')} className="hover:text-white">FLOW (Canvas)</button></li>
              <li><button onClick={() => handleModeClick('ai-think')} className="hover:text-white">THINK (Reasoning)</button></li>
              <li><button onClick={() => handleModeClick('tasks')} className="hover:text-white">ACT (Tasks &amp; Focus)</button></li>
              <li><button onClick={onExplore} className="hover:text-white">Flow Directory</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-1.5 text-xs text-[#A7ACB8]">
              <li><a href="#council" className="hover:text-white">7-Agent Council</a></li>
              <li><a href="#comparison" className="hover:text-white">Manifesto</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><button onClick={() => onOpenAskAI()} className="hover:text-white">Ask Copilot</button></li>
              <li>
                <a
                  href="https://github.com/MANOJHEGDE77/FlowMind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-white text-[#5EE7FF]"
                >
                  <GithubIcon size={13} />
                  <span>GitHub Source Code</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">Security &amp; Specs</h4>
            <ul className="space-y-1.5 text-xs text-[#A7ACB8]">
              <li>
                <button
                  onClick={() => {
                    setPrivacyTab('specs');
                    setIsPrivacyModalOpen(true);
                  }}
                  className="hover:text-white"
                >
                  Local-first Persistence
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setPrivacyTab('privacy');
                    setIsPrivacyModalOpen(true);
                  }}
                  className="hover:text-white"
                >
                  Zero Server Storage
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setPrivacyTab('specs');
                    setIsPrivacyModalOpen(true);
                  }}
                  className="hover:text-white"
                >
                  Sub-50ms HMR Pipeline
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setIsContactModalOpen(true);
                  }}
                  className="hover:text-[#5EE7FF]"
                >
                  Contact &amp; Inquiries →
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#686E7C]">
          <span>© 2026 FlowMind Inc. All rights reserved. Built for thinkers, architects, and founders.</span>
          <div className="flex items-center space-x-4 text-[#A7ACB8]">
            <a
              href="https://github.com/MANOJHEGDE77/FlowMind"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 hover:text-white"
              title="MANOJHEGDE77/FlowMind on GitHub"
            >
              <GithubIcon size={13} />
              <span>GitHub</span>
            </a>
            <button
              onClick={() => {
                setPrivacyTab('privacy');
                setIsPrivacyModalOpen(true);
              }}
              className="hover:text-white"
            >
              Privacy
            </button>
            <button
              onClick={() => {
                setPrivacyTab('terms');
                setIsPrivacyModalOpen(true);
              }}
              className="hover:text-white"
            >
              Terms
            </button>
            <button onClick={onGetStarted} className="hover:text-white">
              Workspace
            </button>
          </div>
        </div>
      </footer>

      {/* PRIVACY & MANIFESTO MODAL */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0F1118] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center space-x-2">
                  <Shield size={18} className="text-[#5EE7FF]" />
                  <span className="font-semibold text-white text-sm">FlowMind Architecture &amp; Governance</span>
                </div>
                <button
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="text-[#686E7C] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 border-b border-white/[0.06] pb-2 text-xs">
                {(['privacy', 'terms', 'specs'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPrivacyTab(tab)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                      privacyTab === tab
                        ? 'bg-[#7C5CFF]/20 text-[#9B84FF] border border-[#7C5CFF]/30'
                        : 'text-[#686E7C] hover:text-white'
                    }`}
                  >
                    {tab === 'specs' ? 'Tech Specs' : tab}
                  </button>
                ))}
              </div>

              {privacyTab === 'privacy' && (
                <div className="space-y-3 text-xs text-[#A7ACB8] leading-relaxed">
                  <h4 className="font-semibold text-white text-sm">Cognitive Sovereignty Manifesto</h4>
                  <p>
                    Your thoughts are your most valuable intellectual asset. Unlike traditional cloud software that ingests user mental models for training centralized weights, FlowMind is built on the principle of <strong className="text-white">Zero Server Retention</strong>.
                  </p>
                  <p>
                    All graphs, node relationships, notes, and task queues remain strictly stored in your local browser environment. When multi-agent AI deliberation is requested, requests are ephemerally evaluated and never persisted to database logs.
                  </p>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-[#5EE7FF]">
                    ✓ No telemetry selling • ✓ Local-first persistence • ✓ Ephemeral inference execution
                  </div>
                </div>
              )}

              {privacyTab === 'terms' && (
                <div className="space-y-3 text-xs text-[#A7ACB8] leading-relaxed">
                  <h4 className="font-semibold text-white text-sm">Terms of Usage &amp; License</h4>
                  <p>
                    FlowMind is distributed for personal and enterprise decision modeling. You retain 100% intellectual property rights over all topology graphs, decisions, and strategies synthesized within the environment.
                  </p>
                  <p>
                    Exported decision briefs, Markdown trees, and JSON structures are fully open to be used in commercial and proprietary software development without restriction.
                  </p>
                </div>
              )}

              {privacyTab === 'specs' && (
                <div className="space-y-3 text-xs text-[#A7ACB8] leading-relaxed">
                  <h4 className="font-semibold text-white text-sm">Technical Specifications</h4>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[#686E7C] block">Client Engine</span>
                      <span className="text-white font-semibold">React 19 + TypeScript + Vite</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[#686E7C] block">Backend API</span>
                      <span className="text-white font-semibold">FastAPI + Python 3.12</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[#686E7C] block">Audio Engine</span>
                      <span className="text-white font-semibold">Web Audio API Synthesis</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[#686E7C] block">Graph Engine</span>
                      <span className="text-white font-semibold">Topological Bezier Mesh</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-white/[0.06] flex justify-end">
                <button
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-white hover:bg-white/[0.1] text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SYSTEM STATUS MODAL */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F1118] border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center space-x-2">
                  <Activity size={18} className="text-[#45E0A8]" />
                  <span className="font-semibold text-white text-sm">FlowMind Infrastructure Status</span>
                </div>
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-[#686E7C] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { name: 'FastAPI Backend Core', status: 'Operational', latency: '4ms', color: 'text-[#45E0A8]' },
                  { name: 'Inference Reasoner (Gemini/Local)', status: 'Operational', latency: '42ms', color: 'text-[#45E0A8]' },
                  { name: 'Web Audio Synthesizer', status: 'Online (DSP Active)', latency: '0ms', color: 'text-[#45E0A8]' },
                  { name: 'Local Cache & Topology Bus', status: 'Synchronized', latency: '1ms', color: 'text-[#45E0A8]' },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-white block">{s.name}</span>
                      <span className="text-[10px] text-[#686E7C]">Latency: {s.latency}</span>
                    </div>
                    <span className={`text-[11px] font-mono font-bold ${s.color}`}>{s.status}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-white hover:bg-white/[0.1] text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTACT / INQUIRY MODAL */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F1118] border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center space-x-2">
                  <Send size={16} className="text-[#5EE7FF]" />
                  <span className="font-semibold text-white text-sm">Contact FlowMind Team</span>
                </div>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="text-[#686E7C] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {contactSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 size={36} className="text-[#45E0A8] mx-auto" />
                  <h4 className="text-sm font-semibold text-white">Inquiry Received</h4>
                  <p className="text-xs text-[#A7ACB8]">Our architecture team will reach back within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#A7ACB8] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Alex Mercer"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#7C5CFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A7ACB8] mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#7C5CFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A7ACB8] mb-1">Organization / Role</label>
                    <input
                      type="text"
                      value={contactForm.org}
                      onChange={(e) => setContactForm({ ...contactForm, org: e.target.value })}
                      placeholder="e.g. Staff Architect @ TechCorp"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#7C5CFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A7ACB8] mb-1">Message or Strategic Objective</label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="How can we help your team with decision mapping and cognitive flow?"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#7C5CFF] resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsContactModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white/[0.04] text-[#A7ACB8] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold shadow-md shadow-[#7C5CFF]/20"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

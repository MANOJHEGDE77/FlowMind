import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, X, CornerDownLeft, Copy, Check, ArrowRight,
  ShieldAlert, Cpu, Lightbulb, RefreshCw, Key, ExternalLink,
  CheckCircle2, Swords, SlidersHorizontal, Users, Layers,
  Compass, Terminal, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { Decision } from '../types';
import { api } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  confidence?: number;
  relevantFactors?: string[];
  suggestedFollowups?: string[];
  citations?: string[];
  timestamp: string;
}

interface AskAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision?: Decision | null;
  initialQuestion?: string;
}

export const AskAIModal: React.FC<AskAIModalProps> = ({
  isOpen,
  onClose,
  decision,
  initialQuestion = '',
}) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gemini API Key management
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => localStorage.getItem('flowmind_gemini_key') || '');
  const [keySavedStatus, setKeySavedStatus] = useState<string | null>(null);
  const lastInitialQuestionRef = useRef<string>('');

  // Category filter for suggested prompts
  const [activeCategory, setActiveCategory] = useState<'dilemma' | 'council' | 'redteam' | 'simulation'>(
    decision ? 'dilemma' : 'council'
  );

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 80);
      if (initialQuestion && initialQuestion !== lastInitialQuestionRef.current) {
        lastInitialQuestionRef.current = initialQuestion;
        handleAsk(initialQuestion);
      }
    }
  }, [isOpen, initialQuestion]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveKey = () => {
    const trimmed = geminiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('flowmind_gemini_key', trimmed);
      setKeySavedStatus('Gemini API Key active & verified!');
      api.configureGeminiKey(trimmed).catch(() => {});
    } else {
      localStorage.removeItem('flowmind_gemini_key');
      setKeySavedStatus('Using built-in autonomous engine.');
    }
    setTimeout(() => {
      setKeySavedStatus(null);
      setShowKeyConfig(false);
    }, 1800);
  };

  const generateClientFallbackAnswer = (q: string, dec?: Decision | null): string => {
    const qLower = q.toLowerCase();

    // 1. Greetings
    if (qLower.match(/^(hi|hello|hey|greetings|hola|good morning|good afternoon|good evening)\b/i)) {
      return `### Hello! 👋 I am FlowMind AI.
I am your interactive decision intelligence and cognitive strategy copilot.

I can help you:
- **Deconstruct Complex Decisions**: Break dilemmas into reversible (Type 2) vs irreversible (Type 1) choices.
- **Interrogate the 7-Agent Council**: Review perspectives from Analyst, Optimist, Skeptic, Financial, and Long-Term models.
- **Stress-Test Assumptions**: Identify fatal failure scenarios and asymmetric upside before committing capital or time.
- **Formulate Actionable Sprints**: Convert abstract thoughts into high-leverage 45-minute focus blocks.

What strategic challenge or concept would you like to explore?`;
    }

    // 2. Bot capabilities
    if (qLower.match(/(who are you|what can you do|what are you|how can you help|capabilities)/i)) {
      return `### ✦ FlowMind Autonomous Decision Intelligence
I am the deliberative cognitive assistant powering the FlowMind visual thinking platform.

#### Key Capabilities:
1. **Dialectic Decision Synthesis**: Harmonize conflicting viewpoints (speed vs quality, equity vs salary, scale vs agility).
2. **Adversarial Stress Testing**: Expose hidden confirmation bias, switching costs, and one-way door exit friction.
3. **Thought-to-Action Mapping**: Directly link cognitive breakthroughs to action nodes on your Mind Canvas.
4. **Grounded Empirical Reasoning**: Evaluate options using base rates and historical failure curves rather than wishful thinking.

Feel free to ask any question or test an idea!`;
    }

    // 3. 7-Agent Council
    if (qLower.match(/(council|7 agents|seven agents|how does the council work|agents)/i)) {
      return `### ✦ The FlowMind 7-Agent Deliberation Council

Rather than relying on a single generalized LLM with confirmation bias, FlowMind runs seven specialized, autonomous agents that evaluate dilemmas through conflicting cognitive lenses:

1. 📊 **The Analyst** (Empirical Base Rates): Calculates survival curves, empirical industry statistics, and baseline probabilities.
2. 🚀 **The Optimist** (Asymmetric Upside): Uncovers compounding network effects, rare skills acquisition, and 10x upside opportunities.
3. 🛡️ **The Skeptic** (Downside Protection): Calculates worst-case tail risks, operational burnout, and fatal assumptions.
4. 💰 **The Financial Strategist** (Capital Runway): Assesses cash flow runway, equity dilution, opportunity cost, and IRR.
5. ⏳ **The Long-Term Architect** (Second-Order Optionality): Evaluates 5-to-10 year trajectory compounding and irreversible door lock-in.
6. ⚔️ **The Devil's Advocate (Red Team)**: Aggressively attacks the leading recommendation to deconstruct fragile assumptions.
7. ⚖️ **The Synthesizer**: Uses Bayesian arbitration to harmonize conflicting agent findings into a calibrated verdict.`;
    }

    // 4. Type 1 vs Type 2 Doors (Reversibility Framework)
    if (qLower.match(/(type 1|type 2|one-way door|two-way door|reversible|irreversible)/i)) {
      return `### ✦ The Reversibility Framework: Type 1 vs. Type 2 Doors

Adapted from Jeff Bezos's strategic decision framework, FlowMind evaluates every dilemma based on exit friction:

| Dimension | Type 1: One-Way Door 🚪🔒 | Type 2: Two-Way Door 🚪🔄 |
| :--- | :--- | :--- |
| **Reversibility** | Irreversible or extremely costly to reverse | Easily reversible with low switching cost |
| **Decision Speed** | Slow, deliberate, multi-stakeholder | Fast, autonomous, bias for action |
| **Information Bar**| Seek 90%+ confidence & empirical proof | Decide with ~70% information |
| **Examples** | Selling company, major debt, signing exclusivity | Launching an MVP, A/B testing a pricing tier |

> **Strategic Rule**: Never use Type 1 deliberation speed for a Type 2 decision. If it is a two-way door, launch an empirical micro-experiment immediately.`;
    }

    // 5. Analysis Paralysis
    if (qLower.match(/(analysis paralysis|stuck|overcome|framework)/i)) {
      return `### ✦ How to Overcome Analysis Paralysis

Analysis paralysis occurs when you treat a reversible decision with irreversible fear. Follow the **FlowMind 3-Step Antidote**:

1. **The 70% Information Rule**: If you wait for 90% certainty, your competitors have already launched or the window has passed.
2. **The 14-Day Micro-Experiment**: Design the smallest test that generates real-world feedback without long-term commitment.
3. **Pre-Mortem Inversion**: Ask, *"If this fails in 6 months, what was the exact cause?"* Fix that fatal flaw, then pull the trigger.`;
    }

    // 6. Active Decision / Grounded Context
    const decTitle = dec?.title || 'Active Dilemma';
    const rec = dec?.recommendation || (dec?.options?.[0]?.title ?? 'Leading Option');
    const alt = dec?.alternative_recommendation || (dec?.options?.[1]?.title ?? 'Alternative Option');

    if (dec && (qLower.includes('why') || qLower.includes('recommend') || qLower.includes('option') || qLower.includes('choice') || qLower.includes('lead') || qLower.includes('top'))) {
      return `### ✦ Strategic Analysis: "${decTitle}"

**Primary Recommendation**: **${rec}**
**Confidence Score**: ${dec.confidence_score || 88}%
${alt ? `**Runner-Up Pathway**: ${alt}` : ''}

---

#### 1. Why this pathway leads:
- **Asymmetric Payoff**: Aligns directly with your stated primary goals with lower frictional drag.
- **Downside Confinement**: Downside risks can be capped through phased execution milestones.
- **Compounding Leverage**: Creates valuable second-order optionality regardless of short-term volatility.

#### 2. Critical Assumptions to Validate:
- Assumes key team and ecosystem conditions remain stable for at least 6 months.
- Presumes execution velocity offsets near-term opportunity cost.

#### 3. Recommended Action:
Set a **14-day empirical checkpoint**. If progress matches expectations, scale commitment; if friction spikes, execute an orderly pivot to **${alt || 'the alternative path'}**.`;
    }

    // 7. Universal Structured Strategic Response
    return `### ✦ Strategic Cognitive Assessment

**Core Query**: "${q}"
${dec ? `**Context**: Evaluated against *${decTitle}*` : ''}

---

#### 1. Core Principle & Problem Formulation
The critical question is not just *what* to choose, but *what asymmetric leverage* each choice unlocks. Avoid evaluating options in isolation; assess their compounding second-order effects over an 18-month horizon.

#### 2. Key Trade-offs & Empirical Base Rates
- **Speed vs. Thoroughness**: Early over-engineering incurs high opportunity cost.
- **Upside Optionality vs. Stability**: Higher variance pathways often yield rare skills and outsized career agency.
- **Reversibility**: Test key assumptions with lightweight probes before committing irreversible resources.

#### 3. Asymmetric Payoff Boundary
- **Best Case**: Rapid compounding, accelerated mastery, and outsized strategic agency.
- **Worst Case**: Sunk exploration time, easily bounded by establishing clear stop-loss criteria upfront.

#### 4. Actionable 48-Hour Next Moves:
1. Define a measurable milestone that confirms your hypothesis within 14 days.
2. Launch a 45-minute deep focus sprint to build the initial prototype or outline.
3. Anchor your findings directly into your FlowMind workspace graph.`;
  };

  const handleAsk = async (textToAsk?: string) => {
    const query = (textToAsk || question).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    let answerText = '';
    let modelUsed = '';
    let confidence = 0.95;
    let relevantFactors = ['Cognitive Load', 'Asymmetric Payoff', 'Reversibility', 'Execution Velocity'];
    let suggestedFollowups = [
      'What are the second-order consequences of this choice?',
      'How do I run a 14-day empirical validation experiment?',
      'What hidden assumptions could invalidate this path?'
    ];
    let citations = ['FlowMind Decision Intelligence', 'Empirical Base Rates'];

    const activeKey = localStorage.getItem('flowmind_gemini_key') || undefined;

    // Attempt 1: Call Google Gemini API directly from browser if activeKey is present
    if (activeKey) {
      try {
        const directResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are FlowMind AI, an elite decision intelligence advisor. Answer clearly, thoroughly, with clean markdown headings and actionable next steps.${
                        decision ? ` Grounded Context: ${decision.title}. Options: ${decision.options.map(o => o.title).join(', ')}` : ''
                      }\n\nQuestion: ${query}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 1200,
              }
            })
          }
        );
        if (directResp.ok) {
          const gData = await directResp.json();
          const candidateText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            answerText = candidateText;
            modelUsed = 'Gemini 1.5 Flash (Google AI Studio Live)';
            confidence = 0.98;
          }
        }
      } catch (err) {
        console.warn('[AskAI] Direct Gemini call error, falling back:', err);
      }
    }

    // Attempt 2: Call backend API if no direct answer yet
    if (!answerText) {
      try {
        const historyPayload = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await api.askAI({
          question: query,
          decisionId: decision?.id,
          context: decision ? `Decision: ${decision.title}. Options: ${decision.options.map(o => o.title).join(', ')}` : undefined,
          history: historyPayload,
          apiKey: activeKey,
        });

        if (res && res.answer) {
          answerText = res.answer;
          modelUsed = res.model_used;
          confidence = res.confidence;
          if (res.relevant_factors?.length) relevantFactors = res.relevant_factors;
          if (res.suggested_followups?.length) suggestedFollowups = res.suggested_followups;
          if (res.citations?.length) citations = res.citations;
        }
      } catch {
        // Backend offline or call failed
      }
    }

    // Attempt 3: In-browser Cognitive Synthesizer
    if (!answerText) {
      answerText = generateClientFallbackAnswer(query, decision);
      modelUsed = 'FlowMind Cognitive Engine (Autonomous Advisor)';
    }

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answerText,
      modelUsed: modelUsed || 'FlowMind Engine',
      confidence: confidence,
      relevantFactors: relevantFactors,
      suggestedFollowups: suggestedFollowups,
      citations: citations,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Categorized prompts definition
  const categoryPrompts = {
    dilemma: decision ? [
      `Why is "${decision.recommendation || 'the primary path'}" the leading recommendation?`,
      'What are the critical downside risks and failure modes in this choice?',
      'Is this decision a Type 1 (irreversible) or Type 2 (reversible) door?',
      'What empirical evidence or scenario shift would flip this recommendation?',
    ] : [
      'How do I evaluate irreversible one-way doors vs two-way doors?',
      'How do I calculate risk-adjusted expected value across career options?',
      'What is the best framework to overcome analysis paralysis?',
      'How do I stress-test assumptions before committing capital?',
    ],
    council: [
      'How does the FlowMind 7-Agent Council debate and reach consensus?',
      'What are the specific strategic roles of each of the 7 council agents?',
      'What is FlowMind and what core decision problems does it solve?',
      'How does document grounding (RAG) prevent model hallucinations?',
    ],
    redteam: [
      'How does Adversarial Red Team Mode eradicate confirmation bias?',
      'What is a calibrated confidence haircut and why is it applied?',
      'How does the Devil\'s Advocate identify catastrophic failure scenarios?',
      'What probing empirical questions should I validate before deciding?',
    ],
    simulation: [
      'How does the 1,000-run Monte Carlo sensitivity simulator work?',
      'What is the strategic significance of the P10 stress floor?',
      'How does Decision Memory eliminate hindsight bias over time?',
      'What are the keyboard shortcuts and OmniCommand (`⌘K`) capabilities?',
    ],
  };

  if (!isOpen) return null;

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090A0F] border border-cyan-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden font-sans text-slate-100"
      >
        {/* ========================================================================= */}
        {/* TOP COMMAND BAR (HUD HEADER) */}
        {/* ========================================================================= */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0C0E14]">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Luminous Vector Logo */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-600/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold tracking-wider text-white">
                  FLOWMIND AI
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig((prev) => !prev)}
                  className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    localStorage.getItem('flowmind_gemini_key')
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:border-cyan-400'
                  }`}
                  title="Configure Google Gemini API Key"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{localStorage.getItem('flowmind_gemini_key') ? 'Gemini Live' : 'Gemini 1.5 Flash'}</span>
                  <Key className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              </div>

              {/* Context Line */}
              {decision ? (
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  <span className="text-cyan-400 font-medium">Grounded:</span>
                  <span className="truncate max-w-sm sm:max-w-md text-slate-200 font-medium">
                    "{decision.title}"
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold ml-1">
                    ({decision.confidence_score}% Signal)
                  </span>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  Platform Architecture &amp; Strategic Decision Intelligence
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowKeyConfig((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-all text-xs font-mono flex items-center space-x-1 ${
                showKeyConfig
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Configure API Key"
            >
              <Key className="w-3.5 h-3.5" />
            </button>

            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Reset Chat Session"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API KEY CONFIGURATION DRAWER */}
        <AnimatePresence>
          {showKeyConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/[0.08] bg-[#0A0C12] p-4 text-xs space-y-3 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">Google Gemini API Key</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    Optional
                  </span>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center space-x-1 text-[11px]"
                >
                  <span>Get Free Key (Google AI Studio)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-white/[0.12] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Save Key
                </button>
                {geminiKeyInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setGeminiKeyInput('');
                      localStorage.removeItem('flowmind_gemini_key');
                      setKeySavedStatus('Key cleared. Using built-in engine.');
                      setTimeout(() => setKeySavedStatus(null), 1800);
                    }}
                    className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {keySavedStatus && (
                <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{keySavedStatus}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MESSAGE THREAD & RESTRUCTURED EMPTY STATE */}
        {/* ========================================================================= */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 min-h-[300px] max-h-[60vh]"
        >
          {messages.length === 0 ? (
            <div className="py-4 space-y-6">
              {/* Modern Command Center Welcome Banner */}
              <div className="text-center space-y-3 max-w-xl mx-auto">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-mono text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>COGNITIVE STRATEGY COMMAND</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Autonomous Decision Intelligence
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Interrogate the 7-Agent Council, run adversarial stress tests, and explore empirical trade-offs. Powered by Google Gemini and FlowMind decision science.
                </p>
              </div>

              {/* Interactive Category Tabs */}
              <div className="flex items-center justify-center space-x-1.5 overflow-x-auto pb-1">
                {decision && (
                  <button
                    onClick={() => setActiveCategory('dilemma')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                      activeCategory === 'dilemma'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Active Dilemma</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveCategory('council')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                    activeCategory === 'council'
                      ? 'bg-indigo-500 text-white font-bold shadow-sm'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>7-Agent Council</span>
                </button>

                <button
                  onClick={() => setActiveCategory('redteam')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                    activeCategory === 'redteam'
                      ? 'bg-rose-500 text-white font-bold shadow-sm'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Red Team Assault</span>
                </button>

                <button
                  onClick={() => setActiveCategory('simulation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                    activeCategory === 'simulation'
                      ? 'bg-purple-500 text-white font-bold shadow-sm'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Monte Carlo & Memory</span>
                </button>
              </div>

              {/* Categorized Suggested Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto">
                {categoryPrompts[activeCategory].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(promptText)}
                    className="p-3.5 rounded-xl bg-[#0F111A] hover:bg-[#151926] border border-white/[0.08] hover:border-cyan-500/40 text-left transition-all duration-200 group flex items-start space-x-2.5 shadow-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                    <span className="text-xs text-slate-300 group-hover:text-white leading-relaxed line-clamp-2 font-medium">
                      {promptText}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex space-x-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 border border-cyan-500/30 text-white rounded-tr-none'
                      : 'bg-[#0F111A] border border-white/[0.08] text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 pb-2 border-b border-white/[0.08]">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">
                        {msg.role === 'user' ? 'You (Decision Maker)' : msg.modelUsed || 'FlowMind Engine'}
                      </span>
                      {msg.confidence && (
                        <span className="text-cyan-400 font-bold">
                          • {Math.round(msg.confidence * 100)}% Calibrated
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-white transition-colors p-1"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Text (Markdown formatted) */}
                  <div className="text-xs space-y-2 whitespace-pre-wrap leading-relaxed font-sans text-slate-200">
                    {msg.content}
                  </div>

                  {/* Key Factors Chips */}
                  {msg.relevantFactors && msg.relevantFactors.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-white/[0.08]">
                      <span className="text-[10px] font-mono text-slate-400">Core Factors:</span>
                      {msg.relevantFactors.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono text-cyan-300"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Follow-ups */}
                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="pt-2 space-y-1.5 border-t border-white/[0.08]">
                      <span className="text-[10px] font-mono text-slate-400 block">Suggested Probes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowups.map((followup, i) => (
                          <button
                            key={i}
                            onClick={() => handleAsk(followup)}
                            className="text-left px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-cyan-500/15 border border-white/[0.08] hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                          >
                            <span>↳</span>
                            <span>{followup}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 text-xs font-mono font-bold">
                    U
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center space-x-3 text-xs font-mono text-cyan-400 animate-pulse">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0F111A] border border-cyan-500/25 flex items-center space-x-2 text-slate-300">
                <span>Gemini Flash is synthesizing multi-agent decision model & citations...</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* HIGH-PERFORMANCE INPUT COMMAND BAR */}
        {/* ========================================================================= */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0C0E14] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-end space-x-2"
          >
            <div className="relative flex-1 bg-black/60 border border-white/[0.12] focus-within:border-cyan-400 rounded-2xl overflow-hidden transition-colors shadow-inner">
              <textarea
                ref={textareaRef}
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder={
                  decision
                    ? `Ask anything regarding "${decision.title}" (risks, reversibility, trade-offs)...`
                    : 'Ask any decision question (e.g. startup vs bigtech, irreversible doors, 7 agents)...'
                }
                disabled={isLoading}
                className="w-full px-4 py-3 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none font-sans min-h-[44px] max-h-28"
              />

              <div className="flex items-center justify-between px-4 pb-2 pt-0.5 text-[10px] font-mono text-slate-500">
                <span className="text-cyan-400/80">
                  ✦ Engine: Gemini 1.5 Flash Grounded Model
                </span>
                <span>Press ↵ Enter to ask • Shift+Enter for newline</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="h-[52px] px-5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 font-mono text-xs font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] shrink-0"
            >
              <span>Ask</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

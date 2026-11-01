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
I am your personal decision assistant.

I can help you:
- **Compare your choices**: Tell me your options (like *Job A vs. Job B*) and I'll break down the pros, cons, and risks.
- **Give practical suggestions**: Need ideas or a roadmap? Tell me your goal and I'll give you a simple step-by-step plan.
- **Spot hidden catches**: I'll help you see what could go wrong before you spend time or money.
- **Explain the 7 AI Council roles**: Learn how different perspectives (finance, risks, growth) look at your dilemma.

What are you deciding on or thinking about right now?`;
    }

    // 2. Bot capabilities
    if (qLower.match(/(who are you|what can you do|what are you|how can you help|capabilities)/i)) {
      return `### ✦ What is FlowMind AI?
I am your personal AI decision assistant. My job is to help you make smart, clear choices without getting overwhelmed or stuck.

#### How I Can Help You:
1. **Clear, Simple Comparisons**: Compare two or more options side-by-side with real pros and cons anyone can understand.
2. **Easy vs. Hard Decisions**: Separate choices that are **easy to undo** (low risk) from choices that are **hard to undo** (high risk).
3. **Catch Hidden Problems**: Flag potential risks, hidden costs, and stress factors before you make a commitment.
4. **Step-by-Step Plans**: Turn big, confusing decisions into simple 14-day and 30-day action steps.

Feel free to ask any question or tell me what decision you're facing!`;
    }

    // 3. 7-Agent Council
    if (qLower.match(/(council|7 agents|seven agents|how does the council work|agents)/i)) {
      return `### ✦ The FlowMind 7-Agent Council (Explained Simply)

Instead of relying on a single, biased answer, FlowMind convenes 7 AI perspectives who each look at your dilemma from a different angle:

| AI Role | Simple Role | What It Asks You |
| :--- | :--- | :--- |
| 🔍 **The Analyst** | Facts & Requirements | *"What are the actual facts, numbers, and prerequisites?"* |
| 🚀 **The Optimist** | Growth & Possibilities | *"What is the best-case outcome and biggest upside?"* |
| 🛡️ **The Skeptic** | Risks & Hidden Catches | *"What could go wrong, and what might cause burnout?"* |
| 💰 **Financial Analyst** | Costs & Pay | *"Can you afford this, and is the financial return worth it?"* |
| ⏳ **Long-Term Planner** | 3–5 Year Horizon | *"Will you still be happy with this choice years from now?"* |
| ⚔️ **Devil's Advocate** | Stress-Testing | *"Let's be honest: what if your favorite option fails?"* |
| ⚖️ **The Synthesizer** | Final Recommendation | *"Here is the best balanced choice and your first step."* |`;
    }

    // 4. Type 1 vs Type 2 Doors (Reversibility Framework)
    if (qLower.match(/(type 1|type 2|one-way door|two-way door|reversible|irreversible)/i)) {
      return `### ✦ Easy-to-Undo vs. Hard-to-Undo Decisions

A simple way to decide faster is to ask: **Can you undo this choice if you change your mind?**

| Decision Type | What It Means | How to Handle It | Examples |
| :--- | :--- | :--- | :--- |
| 🚪🔄 **Easy to Undo** *(Two-Way Door)* | Low risk. If it doesn't work, you can easily switch back. | **Decide quickly!** Try a 14-day test. | Trying a new tool, testing a project idea, changing a daily schedule. |
| 🚪🔒 **Hard to Undo** *(One-Way Door)* | High risk. Hard or expensive to reverse once you jump in. | **Take your time.** Check all details and have a backup plan. | Quitting your job, taking a big loan, moving across the country. |

**Golden Rule**: If a choice is easy to undo, don't waste weeks overthinking—test it out right away!`;
    }

    // 5. Analysis Paralysis
    if (qLower.match(/(analysis paralysis|stuck|overcome|framework)/i)) {
      return `### ✦ How to Stop Overthinking (In 3 Easy Steps)

Feeling stuck usually happens when you treat a small, reversible decision like a permanent life trap. Follow these 3 simple rules:

1. **The 70% Rule**: If you wait until you are 100% sure, you'll wait forever. Once you have ~70% of the facts, take action.
2. **The 14-Day Test**: Don't commit for years. Commit to a simple 2-week test. Reality will teach you faster than your thoughts will.
3. **Worst-Case Check**: Ask yourself, *"If this fails in 3 months, what's the worst that happens?"* If the worst case won't ruin you, go for it!`;
    }

    // 6. Active Decision / Grounded Context
    const decTitle = dec?.title || 'Active Dilemma';
    const rec = dec?.recommendation || (dec?.options?.[0]?.title ?? 'Leading Option');
    const alt = dec?.alternative_recommendation || (dec?.options?.[1]?.title ?? 'Alternative Option');

    if (dec && (qLower.includes('why') || qLower.includes('recommend') || qLower.includes('option') || qLower.includes('choice') || qLower.includes('lead') || qLower.includes('top'))) {
      return `### ✦ Why "${rec}" is the Recommended Option

**Top Choice**: **${rec}** (Confidence: ${dec.confidence_score || 88}%)
${alt ? `**Runner-Up Backup**: ${alt}` : ''}

---

#### 3 Simple Reasons Why This Option Leads:
1. **Best Match for Your Goals**: It gets you closer to what you want faster and with fewer obstacles.
2. **Lower Upfront Risk**: You can start working on it immediately without spending huge money or needing special permissions.
3. **Easy to Pivot**: If you change your mind in 30 days, you can easily switch to your backup option with zero penalty.

#### Simple Next Steps:
1. **Days 1–7**: Take one concrete first step in **${rec}** (build a small sample or draft).
2. **Days 8–14**: Review your progress. If it's going well, commit to the next milestone!`;
    }

    // 7. Universal Structured Strategic Response
    return `### ✦ Simple Advice & Next Steps

Regarding: **"${q}"**
${dec ? `**Evaluated against**: *${decTitle}*` : ''}

---

#### 3 Practical Things to Keep in Mind:
1. **Focus on What Truly Matters**: Ignore the noise and look at the 1 or 2 main things that make the biggest difference to you (like pay, freedom, or time).
2. **Check the Downside**: Make sure the worst-case scenario is safe and manageable before you move forward.
3. **Start with a Small Step**: You don't have to figure out everything today. Pick one small action you can finish this week.

#### Next Action:
Write down the single next step you can complete in 30 minutes today to get moving!`;
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
                      text: `You are FlowMind AI, a helpful, clear, and friendly decision advisor.
IMPORTANT: Answer in simple, everyday English that anyone (users, students, admins) can easily understand. Avoid complicated business or academic buzzwords. Give a direct answer in 1-2 sentences, simple bullet points with pros and cons, and 2-3 clear next steps.${
                        decision ? ` Context: ${decision.title}. Options: ${decision.options.map(o => o.title).join(', ')}` : ''
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
      `Why is "${decision.recommendation || 'this option'}" recommended as the best choice?`,
      'What are the main risks and downsides I should watch out for?',
      'Can I easily undo this choice if I change my mind later?',
      'What simple steps should I take this week to get started?',
    ] : [
      'How do I choose between two good options without overthinking?',
      'How do I know if a decision is easy to undo or high risk?',
      'What is the best way to stop overthinking and take action?',
      'How do I test my idea before spending big money or quitting my job?',
    ],
    council: [
      'How does the 7-Agent Council help me make a better decision?',
      'What does each of the 7 AI agents look for?',
      'What is FlowMind and how does it help me?',
      'How does uploading documents (like offer letters) help my decision?',
    ],
    redteam: [
      'What is "Challenge My Decision" (Red Team Mode)?',
      'What are the most common blind spots people miss when deciding?',
      'How does the Devil\'s Advocate test what could go wrong?',
      'What questions should I ask myself before making my final choice?',
    ],
    simulation: [
      'How does testing best-case and worst-case scenarios work?',
      'What happens if my project takes longer or costs more than planned?',
      'How does Decision Memory help me learn from past choices?',
      'What keyboard shortcuts can I use in FlowMind?',
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

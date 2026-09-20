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



  // Category filter for suggested prompts
  const [activeCategory, setActiveCategory] = useState<'dilemma' | 'council' | 'redteam' | 'simulation'>(
    decision ? 'dilemma' : 'council'
  );

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 80);
      if (initialQuestion && messages.length === 0) {
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

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const activeKey = localStorage.getItem('flowmind_gemini_key') || undefined;

      const res = await api.askAI({
        question: query,
        decisionId: decision?.id,
        context: decision ? `Decision: ${decision.title}. Options: ${decision.options.map(o => o.title).join(', ')}` : undefined,
        history: historyPayload,
        apiKey: activeKey,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        modelUsed: res.model_used,
        confidence: res.confidence,
        relevantFactors: res.relevant_factors,
        suggestedFollowups: res.suggested_followups,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error generating response: ${err.message || 'Please check network connection or verify GEMINI_API_KEY in .env.'}`,
        modelUsed: 'Error Fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
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
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 1.5 Flash</span>
                </span>
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
                  Platform Architecture & Strategic Decision Intelligence
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 shrink-0">
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

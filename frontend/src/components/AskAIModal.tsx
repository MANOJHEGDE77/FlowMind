import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, X, Bot, User as UserIcon, CornerDownLeft,
  Copy, Check, ArrowRight, ShieldAlert, Cpu, Lightbulb, RefreshCw
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

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = decision
    ? [
        `Why is "${decision.recommendation || 'the recommended path'}" prioritized over alternatives?`,
        'What are the primary downside risks and failure modes?',
        'Which option offers the highest reversibility and optionality?',
        'What evidence or scenario shift would flip this recommendation?',
      ]
    : [
        'How should I weigh high salary vs early-stage startup equity?',
        'What decision framework best evaluates relocation opportunities?',
        'How do I distinguish one-way doors from two-way door decisions?',
        'What are the core trade-offs of accelerated graduate studies?',
      ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
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

      const res = await api.askAI({
        question: query,
        decisionId: decision?.id,
        context: decision ? `Decision: ${decision.title}. Options: ${decision.options.map(o => o.title).join(', ')}` : undefined,
        history: historyPayload,
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

  if (!isOpen) return null;

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden font-sans"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[var(--line-color)] flex items-center justify-between shrink-0 bg-black/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-[var(--text-vivid)]">
                  Ask FlowMind AI
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
                  Gemini 1.5 Flash & Cognitive Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {decision ? (
                  <span>Grounded in active dilemma: <strong className="text-slate-200">{decision.title}</strong></span>
                ) : (
                  <span>Autonomous decision intelligence advisor</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread (Scrollable) */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[280px] max-h-[62vh]"
        >
          {messages.length === 0 ? (
            <div className="space-y-6 text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-editorial text-[var(--text-vivid)]">
                  Ask Any Question Regarding Decision Strategy
                </h4>
                <p className="text-xs text-slate-400">
                  Query the AI model about trade-offs, reversibility, risk asymmetries, or ask it to evaluate competing paths.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2 text-left max-w-xl mx-auto">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block text-center font-bold">
                  Suggested Prompts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(q)}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/40 text-left text-xs text-slate-300 transition-all flex items-start space-x-2 group"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                      <span className="line-clamp-2">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex space-x-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3.5 ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-white rounded-tr-none'
                      : 'bg-black/40 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 pb-1 border-b border-white/5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-300">
                        {msg.role === 'user' ? 'You' : msg.modelUsed || 'FlowMind Model'}
                      </span>
                      {msg.confidence && (
                        <span className="text-cyan-400">
                          {Math.round(msg.confidence * 100)}% calibrated
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-white transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap leading-relaxed font-sans">
                    {msg.content}
                  </div>

                  {/* Key Factors Chips */}
                  {msg.relevantFactors && msg.relevantFactors.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-white/5">
                      <span className="text-[10px] font-mono text-slate-500">Key Factors:</span>
                      {msg.relevantFactors.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Follow-ups */}
                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="pt-2 space-y-1.5 border-t border-white/5">
                      <span className="text-[10px] font-mono text-slate-500 block">Suggested Follow-ups:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowups.map((followup, i) => (
                          <button
                            key={i}
                            onClick={() => handleAsk(followup)}
                            className="text-left px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-[11px] text-slate-300 transition-colors"
                          >
                            ↳ {followup}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center space-x-3 text-xs font-mono text-cyan-300 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/20 flex items-center space-x-2">
                <span>Gemini Flash is synthesizing decision model & trade-offs...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--line-color)] bg-black/40 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  decision
                    ? `Ask anything about "${decision.title}" (e.g. risks, reversibility, evidence)...`
                    : 'Ask any question to the model (e.g. equity trade-offs, career velocity)...'
                }
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-space-950 font-mono text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              <span>Ask</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-500 px-1">
            <span>Press ↵ Enter to ask • Esc to dismiss</span>
            <span>Powered by Google Gemini 1.5 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};

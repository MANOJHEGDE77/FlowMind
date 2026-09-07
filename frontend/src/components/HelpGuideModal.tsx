import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Swords, SlidersHorizontal, BookOpen,
  ArrowRight, Shield, CheckCircle2, HelpCircle
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDecision?: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onStartDecision,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Think',
      desc: 'Enter your high-stakes dilemma in plain language. FlowMind automatically extracts key factors.',
    },
    {
      step: '02',
      title: 'Structure',
      desc: 'Define candidate pathways, core priorities (what matters most), and non-negotiable constraints.',
    },
    {
      step: '03',
      title: 'Synthesize',
      desc: '7 autonomous AI Council agents analyze trade-offs, financial upside, and hidden friction.',
    },
    {
      step: '04',
      title: 'Challenge',
      desc: 'Stress-test the recommendation with Red Team bias interrogation and What-If scenario levers.',
    },
    {
      step: '05',
      title: 'Decide & Remember',
      desc: 'Review the calibrated signal and store in Decision Memory to track actual lived outcomes.',
    },
  ];

  const modes = [
    {
      name: 'Red Team Mode',
      icon: Swords,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      desc: 'Adversarial interrogation where the Devil’s Advocate attacks assumptions to eliminate confirmation bias.',
    },
    {
      name: 'What-If Lab',
      icon: SlidersHorizontal,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      desc: 'Dynamic scenario simulation. Adjust compensation, remote flexibility, and time horizon levers.',
    },
    {
      name: 'AI Council Orbit',
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      desc: 'Transparent multi-agent debate. View individual arguments from the Analyst, Skeptic, Optimist, and Planner.',
    },
    {
      name: 'Evidence Ingestion',
      icon: BookOpen,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      desc: 'Upload PDF/DOCX offer letters or notes. FlowMind extracts citations to ground decision scores in reality.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none animate-in fade-in duration-150">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -5 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-2xl rounded-3xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-cyan-500/30 p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line-color)]">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              HOW FLOWMIND WORKS
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Step Process */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
            THE 5-STAGE COGNITIVE JOURNEY
          </span>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {steps.map((s) => (
              <div
                key={s.step}
                className="p-3 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1"
              >
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                  {s.step}
                </span>
                <h4 className="text-xs font-bold text-white">{s.title}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Modes Glossary */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
            INTELLIGENCE MODES EXPLAINED
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.name}
                  className="p-3.5 rounded-2xl bg-[var(--canvas-subtle)] border border-[var(--line-color)] space-y-1.5"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${m.bg} ${m.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {m.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-between items-center border-t border-[var(--line-color)] text-xs font-mono">
          <span className="text-[10px] text-slate-500">
            Press [ESC] to return anytime
          </span>
          {onStartDecision && (
            <button
              onClick={() => {
                onClose();
                onStartDecision();
              }}
              className="px-4 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition-colors flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>Start Thinking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

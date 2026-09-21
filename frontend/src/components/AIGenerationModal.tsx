import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Network, CheckCircle2, X } from 'lucide-react';
import { useFlow } from '../context/FlowContext';

export const AIGenerationModal: React.FC = () => {
  const { isGeneratingFlow, generatingStep, generatingPrompt, cancelGeneration } = useFlow();

  if (!isGeneratingFlow) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0F1118] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-6"
        >
          {/* Close button */}
          <button
            onClick={cancelGeneration}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#686E7C] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#5EE7FF]">
              <Sparkles size={13} />
              <span>COGNITIVE FLOW SYNTHESIS</span>
            </div>
            <h3 className="text-base font-semibold text-white truncate">
              &quot;{generatingPrompt || 'Synthesizing thought...'}&quot;
            </h3>
          </div>

          {/* INTELLIGENT FLOW ANALYSIS DISPLAY */}
          <div className="p-5 rounded-xl bg-[#08090D] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-medium">ANALYZING FLOW...</span>
              <span className="text-[#5EE7FF]">{generatingStep * 25}%</span>
            </div>

            {/* Pulsing Dots sequence */}
            <div className="flex items-center space-x-2 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C5CFF] animate-pulse" />
              <span className={`w-2.5 h-2.5 rounded-full bg-[#5EE7FF] ${generatingStep >= 2 ? 'opacity-100' : 'opacity-30'}`} />
              <span className={`w-2.5 h-2.5 rounded-full bg-[#45E0A8] ${generatingStep >= 3 ? 'opacity-100' : 'opacity-30'}`} />
            </div>

            {/* Step Milestones */}
            <div className="space-y-2 text-xs font-mono pt-2 border-t border-white/[0.06]">
              <div className={`flex items-center space-x-2 ${generatingStep >= 1 ? 'text-[#5EE7FF]' : 'text-[#686E7C]'}`}>
                <span>{generatingStep >= 1 ? '✓' : '•'}</span>
                <span>3 CONNECTIONS FOUND</span>
              </div>
              <div className={`flex items-center space-x-2 ${generatingStep >= 2 ? 'text-[#9B84FF]' : 'text-[#686E7C]'}`}>
                <span>{generatingStep >= 2 ? '✓' : '•'}</span>
                <span>1 PATTERN DETECTED</span>
              </div>
              <div className={`flex items-center space-x-2 ${generatingStep >= 3 ? 'text-[#45E0A8]' : 'text-[#686E7C]'}`}>
                <span>{generatingStep >= 3 ? '✓' : '•'}</span>
                <span>1 INSIGHT GENERATED</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-xs text-[#686E7C]">
            <span>Structuring topology into workspace...</span>
            <button
              onClick={cancelGeneration}
              className="text-[#A7ACB8] hover:text-white underline"
            >
              Abort
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConceptMeta {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  position: { top: string; left?: string; right?: string };
  lineAngle: string;
  related: string[];
}

const CONCEPTS: ConceptMeta[] = [
  {
    id: 'ambition',
    name: 'AMBITION',
    subtitle: 'Primary Driver',
    description: 'Optimizing for maximum long-term career agency and asymmetric upside.',
    position: { top: '21%', left: '11%' },
    lineAngle: 'translate-x-3 translate-y-3',
    related: ['LEVERAGE', 'VELOCITY'],
  },
  {
    id: 'trade-offs',
    name: 'TRADE-OFFS',
    subtitle: 'Opportunity Cost',
    description: 'Evaluating structural compromises, compensation tradeoffs, and burn risk.',
    position: { top: '23%', right: '12%' },
    lineAngle: '-translate-x-3 translate-y-3',
    related: ['OPTIONALITY', 'LEVERAGE'],
  },
  {
    id: 'velocity',
    name: 'VELOCITY',
    subtitle: 'Learning Pace',
    description: 'Rate of compounding skill acquisition and frontier technology exposure.',
    position: { top: '56%', left: '9%' },
    lineAngle: 'translate-x-3 -translate-y-2',
    related: ['AMBITION', 'OPTIONALITY'],
  },
  {
    id: 'leverage',
    name: 'LEVERAGE',
    subtitle: 'Platform Scale',
    description: 'Autonomous decision rights, equity upside, and compounding network effects.',
    position: { top: '58%', right: '11%' },
    lineAngle: '-translate-x-3 -translate-y-2',
    related: ['AMBITION', 'TRADE-OFFS'],
  },
  {
    id: 'optionality',
    name: 'OPTIONALITY',
    subtitle: 'Future Mobility',
    description: 'Preserving secondary pivot capacity, liquidity runway, and market flexibility.',
    position: { top: '78%', left: '16%' },
    lineAngle: 'translate-x-4 -translate-y-3',
    related: ['TRADE-OFFS', 'VELOCITY'],
  },
];

interface FloatingConceptLabelsProps {
  onHoverConcept?: (name: string | null) => void;
  onSelectConcept?: (name: string) => void;
}

export const FloatingConceptLabels: React.FC<FloatingConceptLabelsProps> = ({
  onHoverConcept,
  onSelectConcept,
}) => {
  const [activeConcept, setActiveConcept] = useState<string | null>(null);

  const handleMouseEnter = (c: ConceptMeta) => {
    setActiveConcept(c.id);
    onHoverConcept?.(c.name);
  };

  const handleMouseLeave = () => {
    setActiveConcept(null);
    onHoverConcept?.(null);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 select-none hidden md:block">
      {CONCEPTS.map((c) => {
        const isHovered = activeConcept === c.id;
        const isRelated = activeConcept
          ? CONCEPTS.find(item => item.id === activeConcept)?.related.includes(c.name)
          : false;

        return (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              top: c.position.top,
              left: c.position.left,
              right: c.position.right,
            }}
            className="pointer-events-auto"
          >
            <div
              onMouseEnter={() => handleMouseEnter(c)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onSelectConcept?.(c.name)}
              className="group relative flex items-center space-x-2.5 cursor-pointer"
            >
              {/* Micro-node with pulsing ring */}
              <div className="relative flex items-center justify-center w-3 h-3">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isHovered || isRelated
                      ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff] scale-125'
                      : 'bg-slate-400 group-hover:bg-cyan-300'
                  }`}
                />
                <div
                  className={`absolute inset-0 rounded-full border border-cyan-400/40 transition-transform duration-700 ${
                    isHovered ? 'scale-150 opacity-100 animate-ping' : 'scale-100 opacity-20'
                  }`}
                />
              </div>

              {/* Faint connection filament line */}
              <div
                className={`w-6 h-[1px] transition-all duration-300 ${
                  isHovered || isRelated
                    ? 'bg-gradient-to-r from-cyan-400 to-transparent scale-x-125'
                    : 'bg-slate-700/60'
                }`}
              />

              {/* Label text */}
              <span
                className={`text-[11px] font-mono tracking-widest uppercase transition-all duration-300 ${
                  isHovered
                    ? 'text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : isRelated
                    ? 'text-cyan-400/80 font-medium'
                    : 'text-slate-400/50 group-hover:text-slate-200'
                }`}
              >
                {c.name}
              </span>

              {/* Subtle Contextual Tooltip (Not a card, delicate editorial overlay) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute top-6 left-0 z-30 w-64 p-3 rounded-xl bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-active)] shadow-2xl pointer-events-none"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                        ✦ {c.subtitle}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {c.related.join(' • ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {c.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};

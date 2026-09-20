import React from 'react';
import { motion } from 'framer-motion';

interface FlowMindLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  isAIActive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const FlowMindLogo: React.FC<FlowMindLogoProps> = ({
  size = 'md',
  showWordmark = true,
  isAIActive = true,
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const wordmarkSize = {
    sm: 'text-sm tracking-[0.18em]',
    md: 'text-base tracking-[0.2em]',
    lg: 'text-2xl tracking-[0.22em]',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3 cursor-pointer select-none group ${className}`}
    >
      {/* Abstract Interconnected Flow Neural 'F' Mark */}
      <div className={`relative flex items-center justify-center ${iconDimensions} rounded-xl bg-gradient-to-br from-[#0D1226] via-[#090D1A] to-[#04060E] border border-cyan-400/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] group-hover:border-cyan-400/60 transition-all duration-300`}>
        {/* Luminous Pulsing AI Active Aura */}
        {isAIActive && (
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/25 to-violet-500/20 blur-md pointer-events-none"
          />
        )}

        <svg className="w-full h-full p-1.5" viewBox="0 0 36 36" fill="none">
          <defs>
            <linearGradient id="flowFGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>

            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Flowing abstract 'F' neural geometry: Vertical spine and connected thought branches */}
          {/* Vertical Stem */}
          <path
            d="M 10 30 L 10 8 C 10 6 12 5 14 5 L 26 5"
            stroke="url(#flowFGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#logoGlow)"
          />

          {/* Secondary Thought Branch */}
          <path
            d="M 10 17 L 22 17"
            stroke="url(#flowFGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#logoGlow)"
          />

          {/* Neural Convergence Interconnection Filaments */}
          <path
            d="M 26 5 C 29 11 26 15 22 17"
            stroke="#00F0FF"
            strokeWidth="1.4"
            strokeDasharray="2 3"
            strokeOpacity="0.8"
          />

          {/* Glowing Neural Synaptic Nodes */}
          <circle cx="26" cy="5" r="2.4" fill="#00F0FF" />
          <circle cx="22" cy="17" r="2.2" fill="#8B5CF6" />
          <circle cx="10" cy="30" r="2.2" fill="#10B981" />
          <circle cx="10" cy="8" r="1.8" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Modern Geometric Wordmark */}
      {showWordmark && (
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5">
            <span className={`font-mono font-bold text-white uppercase ${wordmarkSize}`}>
              Flow<span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Mind</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span className="text-[9px] font-mono tracking-widest text-slate-400 -mt-0.5 uppercase">
            THOUGHTS INTO FLOW
          </span>
        </div>
      )}
    </div>
  );
};

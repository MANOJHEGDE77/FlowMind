import React from 'react';

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
  className = '',
  onClick,
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-2.5 cursor-pointer select-none group ${className}`}
    >
      {/* Visual Connected Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-lg p-1.5 transition-transform duration-200 group-hover:scale-105"
        style={{
          width: iconSize,
          height: iconSize,
          background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.2) 0%, rgba(94, 231, 255, 0.15) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Flowing connector line */}
          <path
            d="M 5,19 C 9,19 8,6 14,6 C 18,6 17,14 20,14"
            stroke="url(#logo-grad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Origin Node (Thought) */}
          <circle cx="5" cy="19" r="2.5" fill="#7C5CFF" />
          {/* Intermediate Node (Insight) */}
          <circle cx="14" cy="6" r="2.2" fill="#5EE7FF" />
          {/* Action Destination Node */}
          <circle cx="20" cy="14" r="2" fill="#45E0A8" />
          <defs>
            <linearGradient id="logo-grad" x1="5" y1="19" x2="20" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C5CFF" />
              <stop offset="0.6" stopColor="#5EE7FF" />
              <stop offset="1" stopColor="#45E0A8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center space-x-0.5">
            <span className="font-semibold text-white tracking-tight text-sm">
              Flow
            </span>
            <span className="font-bold text-flow-gradient text-sm">
              Mind
            </span>
          </div>
          <span className="text-[10px] text-[#686E7C] font-medium tracking-wide mt-0.5">
            Cognitive Workspace
          </span>
        </div>
      )}
    </div>
  );
};

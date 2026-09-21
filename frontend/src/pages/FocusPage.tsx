import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  GitBranch,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface FocusPageProps {
  onExitFocus: () => void;
  onOpenCanvas: (flowId: string) => void;
}

const PRESETS = [
  { label: '25m Focus', seconds: 25 * 60 },
  { label: '50m Deep Sprint', seconds: 50 * 60 },
  { label: '5m Short Break', seconds: 5 * 60 },
  { label: '15m Long Break', seconds: 15 * 60 },
];

export const FocusPage: React.FC<FocusPageProps> = ({
  onExitFocus,
  onOpenCanvas,
}) => {
  const { activeFocusTask, toggleTask, flows } = useFlow();

  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [ambientSound, setAmbientSound] = useState(true);

  // Timer tick effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      soundService.playSuccess();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const handleToggleTimer = () => {
    soundService.playClick();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    soundService.playClick();
    setIsRunning(false);
    setTimeLeft(totalDuration);
  };

  const handleSelectPreset = (secondsCount: number) => {
    soundService.playClick();
    setIsRunning(false);
    setTotalDuration(secondsCount);
    setTimeLeft(secondsCount);
  };

  const handleCompleteCurrentTask = () => {
    if (activeFocusTask) {
      toggleTask(activeFocusTask.id);
      soundService.playSuccess();
    }
  };

  const parentFlow = flows.find((f) => f.id === activeFocusTask?.flowId) || flows[0];

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden bg-[#08090D] text-[#F4F5F7] flex flex-col justify-between p-6 md:p-10 select-none">
      {/* AMBIENT BREATHING BACKDROP */}
      <motion.div
        animate={{
          scale: isRunning ? [1, 1.15, 1] : 1,
          opacity: isRunning ? [0.12, 0.22, 0.12] : 0.08,
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C5CFF]/20 blur-[140px] pointer-events-none"
      />

      {/* TOP CONTROLS */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={onExitFocus}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#A7ACB8] hover:text-white transition-colors text-xs font-medium"
        >
          <ArrowLeft size={14} />
          <span>Exit Focus Space</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#A7ACB8] hover:text-white transition-colors"
            title={isZenMode ? 'Exit Zen Mode' : 'Zen Distraction-Free Mode'}
          >
            {isZenMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={() => setAmbientSound(!ambientSound)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#A7ACB8] hover:text-white transition-colors"
            title={ambientSound ? 'Mute audio' : 'Enable audio'}
          >
            {ambientSound ? <Volume2 size={15} className="text-[#5EE7FF]" /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* CENTER FOCUS HUB */}
      <div className="relative z-10 max-w-xl mx-auto text-center space-y-6 my-auto">
        {!isZenMode && (
          <div className="space-y-3">
            {/* Thought Chain Breadcrumb */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0F1118] border border-white/[0.08] text-xs">
              <GitBranch size={13} className="text-[#5EE7FF]" />
              <span className="text-[#A7ACB8]">{parentFlow.title}</span>
              <span className="text-[#686E7C]">→</span>
              <span className="text-[#9B84FF] font-medium truncate max-w-[220px]">
                {activeFocusTask?.nodeTitle || 'Core Focus Objective'}
              </span>
            </div>

            {/* Current Objective */}
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
              {activeFocusTask?.title || 'Deep Execution Sprint'}
            </h2>
          </div>
        )}

        {/* CIRCULAR PROGRESS COUNTDOWN RING */}
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] -rotate-90 transform">
            <defs>
              <linearGradient id="focus-timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C5CFF" />
                <stop offset="100%" stopColor="#5EE7FF" />
              </linearGradient>
            </defs>

            {/* Background track circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="8"
            />

            {/* Progress indicator circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="transparent"
              stroke="url(#focus-timer-grad)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#686E7C] font-medium">
              {isRunning ? 'FOCUS SESSION' : 'PAUSED'}
            </span>
            <div className="text-5xl md:text-6xl font-mono font-bold tracking-tight text-white select-none">
              {formattedTime}
            </div>
            <span className="text-[11px] text-[#A7ACB8]">
              {Math.round(progressRatio * 100)}% remaining
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={handleToggleTimer}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg ${
              isRunning
                ? 'bg-[#F5B84B] hover:bg-[#F5B84B]/90 text-black shadow-[#F5B84B]/20'
                : 'bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] hover:opacity-95 text-white shadow-[#7C5CFF]/25'
            }`}
          >
            {isRunning ? <Pause size={15} /> : <Play size={15} />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={handleResetTimer}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#A7ACB8] hover:text-white transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={15} />
          </button>

          {activeFocusTask && !activeFocusTask.completed && (
            <button
              onClick={handleCompleteCurrentTask}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#45E0A8]/15 hover:bg-[#45E0A8]/25 border border-[#45E0A8]/30 text-[#45E0A8] font-medium text-xs transition-colors"
            >
              <CheckCircle2 size={15} />
              <span>Mark Done</span>
            </button>
          )}
        </div>

        {/* PRESET CHIPS */}
        {!isZenMode && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSelectPreset(p.seconds)}
                className={`px-3 py-1 rounded-xl text-xs transition-all ${
                  totalDuration === p.seconds
                    ? 'bg-white/[0.12] text-white border border-white/[0.2] font-semibold'
                    : 'bg-white/[0.03] text-[#A7ACB8] border border-white/[0.06] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="relative z-10 flex items-center justify-between text-xs text-[#686E7C]">
        <span>Cognitive Isolation Space</span>
        <button
          onClick={() => onOpenCanvas(parentFlow.id)}
          className="text-[#5EE7FF] hover:underline"
        >
          View Parent Graph →
        </button>
      </div>
    </div>
  );
};

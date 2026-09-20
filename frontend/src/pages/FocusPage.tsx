import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Flame,
  GitBranch,
  ArrowLeft,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';

interface FocusPageProps {
  onExitFocus: () => void;
  onOpenCanvas: (flowId: string) => void;
}

export const FocusPage: React.FC<FocusPageProps> = ({
  onExitFocus,
  onOpenCanvas,
}) => {
  const { activeFocusTask, toggleTask, flows } = useFlow();

  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25:00 default
  const [isRunning, setIsRunning] = useState(false);
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

  const handleToggleTimer = () => {
    soundService.playClick();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    soundService.playClick();
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const handleCompleteCurrentTask = () => {
    if (activeFocusTask) {
      toggleTask(activeFocusTask.id);
      soundService.playSuccess();
    }
  };

  // Find parent thought chain
  const parentFlow = flows.find((f) => f.id === activeFocusTask?.flowId) || flows[0];

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden bg-[#05070D] text-slate-100 flex flex-col justify-between p-6 md:p-12 select-none">
      {/* AMBIENT BREATHING HALO */}
      <motion.div
        animate={{
          scale: isRunning ? [1, 1.25, 1] : 1,
          opacity: isRunning ? [0.15, 0.35, 0.15] : 0.15,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 blur-[130px] pointer-events-none"
      />

      {/* TOP CONTROLS */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={onExitFocus}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-colors text-xs font-mono"
        >
          <ArrowLeft size={14} />
          <span>Exit Focus Mode</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAmbientSound(!ambientSound)}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={ambientSound ? 'Mute ambient' : 'Unmute ambient'}
          >
            {ambientSound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* CENTER CONCENTRATION HUB */}
      <div className="relative z-10 max-w-xl mx-auto text-center space-y-8 my-auto">
        {/* Thought Chain Breadcrumb */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C101F]/80 border border-cyan-500/20 backdrop-blur-md shadow-lg shadow-cyan-950/20 text-xs font-mono">
          <GitBranch size={13} className="text-cyan-400" />
          <span className="text-slate-400">{parentFlow.title}</span>
          <span className="text-slate-600">→</span>
          <span className="text-cyan-300 font-semibold truncate max-w-[200px]">
            {activeFocusTask?.nodeTitle || 'Core Focus Objective'}
          </span>
        </div>

        {/* Current Task Display */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-mono text-cyan-400">
            Current Deep Flow Target
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {activeFocusTask?.title || 'Practice Binary Search on Answer'}
          </h2>
        </div>

        {/* Big Futuristic Countdown Timer */}
        <div className="relative py-4">
          <motion.div
            key={formattedTime}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl md:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 select-none drop-shadow-[0_10px_35px_rgba(0,240,255,0.15)]"
          >
            {formattedTime}
          </motion.div>
          <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mt-2">
            {isRunning ? '✦ Deep Cognition In Session' : 'Paused / Ready'}
          </p>
        </div>

        {/* Primary Timer Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleResetTimer}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            title="Reset to 25:00"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleToggleTimer}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause size={18} />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleteCurrentTask}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all active:scale-95"
            title="Mark Complete & Sync with Flow"
          >
            <CheckCircle2 size={16} />
            <span>Finalize</span>
          </button>
        </div>
      </div>

      {/* BOTTOM THOUGHT CHAIN LINEAGE */}
      <div className="relative z-10 max-w-2xl mx-auto w-full pt-6 border-t border-slate-800/60">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center mb-3">
          Thought Chain Provenance
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto py-1">
          <span className="text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            {parentFlow.title}
          </span>
          <span className="text-cyan-400 font-bold">↓</span>
          <span className="text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-800/40">
            Strategic Pillar
          </span>
          <span className="text-cyan-400 font-bold">↓</span>
          <span className="text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
            Current Action
          </span>
        </div>
      </div>
    </div>
  );
};

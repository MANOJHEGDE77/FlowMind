import React, { useState, useRef } from 'react';
import {
  ZoomIn, ZoomOut, Maximize2, Swords, SlidersHorizontal,
  Scale, BookOpen, Crown, TrendingUp, ShieldAlert,
  Sparkles, ArrowRight, Layers, Eye
} from 'lucide-react';
import { Decision, DecisionOption } from '../types';

interface SpatialWorkspaceProps {
  decision: Decision;
  onOpenChallenge: () => void;
  onOpenSimulator: () => void;
  onOpenEvidence: () => void;
  onSelectNode: (type: string, data: any) => void;
  onOpenCouncil: () => void;
}

export const SpatialWorkspace: React.FC<SpatialWorkspaceProps> = ({
  decision,
  onOpenChallenge,
  onOpenSimulator,
  onOpenEvidence,
  onSelectNode,
  onOpenCouncil,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activePathOptionId, setActivePathOptionId] = useState<number | null>(
    decision.options.find(o => o.is_recommended)?.id || decision.options[0]?.id || null
  );

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.spatial-node') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const winnerOption = decision.options.find(o => o.is_recommended) || decision.options[0];

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`fixed inset-0 w-screen h-screen bg-[var(--canvas-bg)] spatial-grid select-none overflow-hidden cursor-${
        isPanning ? 'grabbing' : 'grab'
      }`}
    >
      {/* Floating Spatial Action HUD (Translucent minimal pill dock) */}
      <div className="fixed top-16 left-6 z-30 flex items-center space-x-2 bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] p-1.5 rounded-full shadow-2xl">
        <button
          onClick={onOpenChallenge}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono transition-all"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>⚔️ Red Team Mode</span>
        </button>

        <button
          onClick={onOpenSimulator}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-mono transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>What-If Lab</span>
        </button>

        <button
          onClick={onOpenCouncil}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-mono transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Council Orbit</span>
        </button>

        <button
          onClick={onOpenEvidence}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-mono transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Evidence ({decision.evidence_items.length})</span>
        </button>
      </div>

      {/* Floating Zoom HUD in Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center space-x-1 bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] p-1 rounded-full shadow-xl">
        <button
          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
          className="p-1.5 rounded-full text-[var(--text-faint)] hover:text-[var(--text-vivid)] hover:bg-[var(--canvas-subtle)] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-[var(--text-faint)] px-1">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
          className="p-1.5 rounded-full text-[var(--text-faint)] hover:text-[var(--text-vivid)] hover:bg-[var(--canvas-subtle)] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-[var(--line-color)] my-auto mx-0.5" />
        <button
          onClick={resetView}
          className="p-1.5 rounded-full text-[var(--text-faint)] hover:text-[var(--text-vivid)] hover:bg-[var(--canvas-subtle)] transition-colors"
          title="Recenter Canvas"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* FULL VIEWPORT SPATIAL CANVAS LAYER */}
      <div
        className="w-full h-full transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div className="flex flex-col items-center pt-28 pb-48 px-12 min-w-[1000px]">
          {/* 1. TOP NODE: OVERARCHING GOAL & DILEMMA */}
          <div
            onClick={() => onSelectNode('goal', {
              title: decision.title,
              context: decision.context,
              goals: decision.goals,
              factors: decision.factors
            })}
            className="spatial-node relative z-20 text-center max-w-2xl cursor-pointer group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold block mb-1">
              ✦ CORE AMBITION
            </span>
            <h1 className="text-xl sm:text-2xl font-editorial text-[var(--text-vivid)] tracking-tight group-hover:text-sky-400 transition-colors">
              "{decision.title}"
            </h1>
            <p className="text-xs text-[var(--text-body)] mt-1.5 max-w-lg mx-auto font-sans leading-relaxed">
              {decision.context}
            </p>
          </div>

          {/* CONNECTING STEM: Luminous animated curve */}
          <svg className="w-full max-w-4xl h-16 pointer-events-none" viewBox="0 0 800 64">
            <path
              d="M 400 0 L 400 24 M 400 24 C 400 44, 160 30, 160 64 M 400 24 C 400 44, 640 30, 640 64 M 400 24 L 400 64"
              fill="none"
              stroke="var(--line-color)"
              strokeWidth="1.5"
            />
            {/* Animated Flowing Energy Dash */}
            <path
              d="M 400 0 L 400 64"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="1.5"
              className="animate-flow-dash"
            />
          </svg>

          {/* 2. COMPETING OPTION NODES (Borderless, Physical, Typography-First) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl z-20">
            {decision.options.map((opt) => {
              const isWinner = opt.is_recommended;
              const isPathActive = activePathOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setActivePathOptionId(opt.id);
                    onSelectNode('option', opt);
                  }}
                  className={`spatial-node p-5 rounded-3xl backdrop-blur-md transition-all cursor-pointer border ${
                    isWinner
                      ? 'border-emerald-500/40 bg-emerald-500/5 shadow-2xl ring-1 ring-emerald-500/20'
                      : isPathActive
                      ? 'border-sky-400/40 bg-sky-500/5 shadow-xl'
                      : 'border-[var(--line-color)] bg-[var(--surface-blur)] hover:border-[var(--line-active)]'
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {isWinner ? (
                        <Crown className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[var(--text-faint)]" />
                      )}
                      <span className="text-[10px] font-mono uppercase text-[var(--text-faint)] tracking-wider">
                        {isWinner ? 'CALIBRATED SIGNAL' : 'CANDIDATE PATH'}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        isWinner
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-[var(--canvas-subtle)] text-[var(--text-body)]'
                      }`}
                    >
                      {opt.score}
                    </span>
                  </div>

                  {/* Option Title */}
                  <h3 className="text-sm font-semibold text-[var(--text-vivid)] mb-1">
                    {opt.title}
                  </h3>

                  <p className="text-xs text-[var(--text-body)] leading-relaxed mb-3 line-clamp-2">
                    {opt.description || 'Evaluated pathway across growth, compensation, and reversibility.'}
                  </p>

                  {/* Score Progress Bar */}
                  <div className="w-full bg-[var(--canvas-subtle)] rounded-full h-1 mb-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner ? 'bg-emerald-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${Math.min(100, opt.score)}%` }}
                    />
                  </div>

                  {/* LEAF NODES: UPSIDE & RISK INDICATORS */}
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span className="truncate">Upside: Asymmetric learning multiplier</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-rose-400">
                      <ShieldAlert className="w-3 h-3 shrink-0" />
                      <span className="truncate">Risk: Uncompensated cognitive overhead</span>
                    </div>
                  </div>

                  {/* Grounded Citation Prompt */}
                  <div className="mt-3 pt-2.5 border-t border-[var(--line-color)] flex items-center justify-between text-[10px] font-mono text-[var(--text-faint)]">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>Verified Citation</span>
                    </span>
                    <span className="text-sky-400 flex items-center space-x-0.5 hover:underline">
                      <span>Inspect</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CONVERGING STEM */}
          <svg className="w-full max-w-4xl h-16 pointer-events-none" viewBox="0 0 800 64">
            <path
              d="M 160 0 C 160 32, 400 24, 400 64 M 640 0 C 640 32, 400 24, 400 64 M 400 0 L 400 64"
              fill="none"
              stroke="var(--line-color)"
              strokeWidth="1.5"
            />
          </svg>

          {/* 3. AI COUNCIL CONVERGENCE NODE */}
          <div
            onClick={onOpenCouncil}
            className="spatial-node relative z-20 cursor-pointer p-4 rounded-full bg-[var(--surface-blur)] backdrop-blur-md border border-purple-500/30 hover:border-purple-400 text-center transition-all flex items-center space-x-3 shadow-xl"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="text-left pr-3">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold block">
                AI COUNCIL SYNTHESIS CORE
              </span>
              <span className="text-xs text-[var(--text-body)]">
                {decision.agent_runs.length} Agents arbitrated consensus • Click to view orbit
              </span>
            </div>
          </div>

          {/* STEM TO THE SIGNAL */}
          <div className="w-px h-10 bg-gradient-to-b from-purple-500/60 to-emerald-400" />

          {/* 4. THE SIGNAL (RECOMMENDATION CLIMAX) */}
          <div
            onClick={() => onSelectNode('signal', {
              recommendation: decision.recommendation,
              confidence: decision.confidence_score,
              score: decision.decision_score,
              reasoning: decision.reasoning_summary,
              what_could_change: decision.what_could_change,
              contradictions: decision.contradictions,
            })}
            className="spatial-node relative z-20 text-center max-w-2xl cursor-pointer p-6 rounded-3xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-emerald-500/40 hover:border-emerald-400 shadow-2xl transition-all"
          >
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>THE SIGNAL</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-editorial text-[var(--text-vivid)] tracking-tight">
              {decision.recommendation || winnerOption.title}
            </h2>

            <div className="flex items-center justify-center space-x-4 my-2.5 text-xs font-mono">
              <span className="text-emerald-400 font-bold">
                {decision.confidence_score}% Calibrated Confidence
              </span>
              <span className="text-[var(--text-faint)]">•</span>
              <span className="text-[var(--text-body)]">
                Score: {decision.decision_score || winnerOption.score} / 100
              </span>
            </div>

            <p className="text-xs text-[var(--text-body)] leading-relaxed text-center max-w-lg mx-auto pt-2 border-t border-[var(--line-color)]">
              {decision.reasoning_summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

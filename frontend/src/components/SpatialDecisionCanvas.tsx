import React, { useState, useRef } from 'react';
import {
  Crown, Sparkles, ZoomIn, ZoomOut, Maximize2,
  TrendingUp, ShieldAlert, BookOpen, Layers,
  Swords, SlidersHorizontal, Scale, ArrowRight, Eye,
  CheckCircle2, X
} from 'lucide-react';
import { Decision, DecisionOption } from '../types';

interface SpatialDecisionCanvasProps {
  decision: Decision;
  onOpenChallenge: () => void;
  onOpenSimulator: () => void;
  onOpenComparison: () => void;
  onOpenEvidence: () => void;
  onSelectNode: (type: string, data: any) => void;
}

export const SpatialDecisionCanvas: React.FC<SpatialDecisionCanvasProps> = ({
  decision,
  onOpenChallenge,
  onOpenSimulator,
  onOpenComparison,
  onOpenEvidence,
  onSelectNode,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState<'all' | 'upside' | 'risk' | 'evidence'>('all');
  const [hoveredOptionId, setHoveredOptionId] = useState<number | null>(null);

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

  const recommendedOption = decision.options.find(o => o.is_recommended) || decision.options[0];

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-[calc(100vh-3.5rem)] bg-[var(--bg-primary)] bg-spatial-grid select-none overflow-hidden cursor-${
        isPanning ? 'grabbing' : 'grab'
      }`}
    >
      {/* Top Floating Command Dock */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-subtle)] p-1.5 rounded-xl shadow-lg">
        <button
          onClick={onOpenChallenge}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-mono font-medium transition-all"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>⚔️ Challenge Model</span>
        </button>

        <button
          onClick={onOpenSimulator}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 text-xs font-mono font-medium transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>What-If Lab</span>
        </button>

        <button
          onClick={onOpenComparison}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 text-xs font-mono font-medium transition-all"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Benchmark Matrix</span>
        </button>

        <button
          onClick={onOpenEvidence}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-xs font-mono font-medium transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Evidence ({decision.evidence_items.length})</span>
        </button>

        <div className="w-px h-4 bg-[var(--border-subtle)] my-auto mx-1" />

        {/* Filter Pills */}
        <div className="hidden md:flex items-center space-x-1 text-[11px] font-mono text-[var(--text-muted)]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2 py-0.5 rounded ${activeFilter === 'all' ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]' : 'hover:text-[var(--text-primary)]'}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('upside')}
            className={`px-2 py-0.5 rounded ${activeFilter === 'upside' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:text-emerald-400'}`}
          >
            Upside
          </button>
          <button
            onClick={() => setActiveFilter('risk')}
            className={`px-2 py-0.5 rounded ${activeFilter === 'risk' ? 'bg-rose-500/20 text-rose-400' : 'hover:text-rose-400'}`}
          >
            Risks
          </button>
        </div>
      </div>

      {/* Floating Zoom & Scale Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-1 bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-subtle)] p-1 rounded-lg shadow-lg">
        <button
          onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
          className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-[var(--text-muted)] px-1.5">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
          className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[var(--border-subtle)] my-auto mx-0.5" />
        <button
          onClick={resetView}
          className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          title="Reset Canvas"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Spatial Graph Rendering Layer */}
      <div
        className="w-full h-full transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div className="flex flex-col items-center pt-20 pb-40 px-10 min-w-[950px]">
          {/* 1. TOP GOAL NODE */}
          <div
            onClick={() => onSelectNode('goal', { title: decision.title, context: decision.context, factors: decision.factors })}
            className="spatial-node relative z-10 w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-sky-400/60 rounded-2xl p-4 shadow-xl transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-emerald-400 flex items-center justify-center text-space-950 font-bold shadow-md">
                  <Sparkles className="w-4 h-4 text-space-950" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
                    OVERARCHING OBJECTIVE
                  </div>
                  <h1 className="text-sm md:text-base font-semibold text-[var(--text-primary)] tracking-tight">
                    {decision.title}
                  </h1>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">
                  Confidence
                </span>
                <span className="text-base font-mono font-bold text-sky-400">
                  {decision.confidence_score}%
                </span>
              </div>
            </div>

            {/* Context preview */}
            <p className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
              {decision.context}
            </p>
          </div>

          {/* CONNECTOR STEM */}
          <div className="w-px h-10 bg-gradient-to-b from-sky-400/50 to-[var(--border-subtle)]" />

          {/* 2. BRANCHING CONNECTOR SVG */}
          <svg className="w-full max-w-4xl h-12" viewBox="0 0 800 50">
            <path
              d="M 400 0 L 400 20 M 400 20 C 400 35, 160 25, 160 50 M 400 20 C 400 35, 640 25, 640 50 M 400 20 L 400 50"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* 3. COMPETING OPTIONS NODES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {decision.options.map((opt) => {
              const isHovered = hoveredOptionId === opt.id;
              const isWinner = opt.is_recommended;

              return (
                <div
                  key={opt.id}
                  onMouseEnter={() => setHoveredOptionId(opt.id)}
                  onMouseLeave={() => setHoveredOptionId(null)}
                  onClick={() => onSelectNode('option', opt)}
                  className={`spatial-node relative bg-[var(--bg-surface)] border rounded-2xl p-4 shadow-xl transition-all cursor-pointer ${
                    isWinner
                      ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                  }`}
                >
                  {/* Option Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {isWinner ? (
                        <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                      )}
                      <h3 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {opt.title}
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isWinner
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {opt.score}
                    </span>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="w-full bg-[var(--bg-surface-elevated)] rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner ? 'bg-emerald-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${Math.min(100, opt.score)}%` }}
                    />
                  </div>

                  {/* LEAF NODES: UPSIDE & RISK */}
                  {(activeFilter === 'all' || activeFilter === 'upside') && (
                    <div className="mb-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-300/90 flex items-start space-x-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Upside: High agency, compounding mastery, and network leverage.
                      </span>
                    </div>
                  )}

                  {(activeFilter === 'all' || activeFilter === 'risk') && (
                    <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 text-[11px] text-rose-300/90 flex items-start space-x-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        Risk: Switching costs & uncompensated operational friction.
                      </span>
                    </div>
                  )}

                  {/* Grounded Citation Link */}
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>Verified Citation</span>
                    </span>
                    <span className="text-sky-400 flex items-center space-x-0.5 hover:underline">
                      <span>Reasoning</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CONNECTOR STEM CONVERGING */}
          <svg className="w-full max-w-4xl h-14" viewBox="0 0 800 60">
            <path
              d="M 160 0 C 160 30, 400 20, 400 60 M 640 0 C 640 30, 400 20, 400 60 M 400 0 L 400 60"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="1.5"
            />
          </svg>

          {/* 4. AI COUNCIL SYNTHESIS CORE HUB */}
          <div
            onClick={() => onSelectNode('ai_council', { agent_runs: decision.agent_runs, contradictions: decision.contradictions })}
            className="spatial-node relative z-10 w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-purple-400/60 rounded-xl p-3 shadow-lg text-center cursor-pointer transition-all"
          >
            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-purple-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI COUNCIL SYNTHESIS CORE</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              7 Agents arbitrated debate • {decision.agent_runs.length} diagnostic viewpoints fused
            </p>
          </div>

          {/* STEM TO FINAL SIGNAL */}
          <div className="w-px h-8 bg-gradient-to-b from-purple-400/50 to-emerald-400" />

          {/* 5. THE SIGNAL: RECOMMENDATION REVEAL NODE */}
          <div
            onClick={() => onSelectNode('signal', {
              recommendation: decision.recommendation,
              confidence: decision.confidence_score,
              score: decision.decision_score,
              summary: decision.reasoning_summary,
              what_could_change: decision.what_could_change,
            })}
            className="spatial-node relative z-10 w-full max-w-lg bg-gradient-to-b from-emerald-500/10 to-[var(--bg-surface)] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl text-center cursor-pointer hover:border-emerald-400 transition-all"
          >
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-wider font-semibold mb-2">
              <Crown className="w-3 h-3" />
              <span>THE SIGNAL • STRATEGIC RECOMMENDATION</span>
            </div>

            <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
              {decision.recommendation || recommendedOption.title}
            </h2>

            <div className="flex items-center justify-center space-x-4 my-2 text-xs font-mono">
              <span className="text-emerald-400 font-semibold">
                Score: {decision.decision_score || recommendedOption.score} / 100
              </span>
              <span>•</span>
              <span className="text-sky-400 font-semibold">
                Confidence: {decision.confidence_score}%
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed text-left pt-2 border-t border-[var(--border-subtle)] line-clamp-3">
              {decision.reasoning_summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

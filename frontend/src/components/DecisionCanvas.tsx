import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Crown, ShieldAlert, FileText, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, ZoomIn, ZoomOut,
  Maximize2, Eye, ArrowRight, Swords, SlidersHorizontal,
  Scale, BookOpen, Layers
} from 'lucide-react';
import { Decision, DecisionOption } from '../types';

interface DecisionCanvasProps {
  decision: Decision;
  onOpenChallenge: () => void;
  onOpenSimulator: () => void;
  onOpenComparison: () => void;
  onOpenEvidence: () => void;
  onSelectOption: (option: DecisionOption) => void;
}

export const DecisionCanvas: React.FC<DecisionCanvasProps> = ({
  decision,
  onOpenChallenge,
  onOpenSimulator,
  onOpenComparison,
  onOpenEvidence,
  onSelectOption,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    options: true,
    factors: true,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-node') || (e.target as HTMLElement).closest('button')) {
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

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full min-h-[650px] bg-space-950 bg-spatial-grid select-none overflow-hidden cursor-${
        isPanning ? 'grabbing' : 'grab'
      }`}
    >
      {/* Floating Canvas Action Dock */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-space-900/90 backdrop-blur-md border border-space-800 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={onOpenChallenge}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-all"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>⚔️ Challenge Decision</span>
        </button>

        <button
          onClick={onOpenSimulator}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-medium transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>What-If Simulator</span>
        </button>

        <button
          onClick={onOpenComparison}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-medium transition-all"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Compare Matrix</span>
        </button>

        <button
          onClick={onOpenEvidence}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Evidence ({decision.evidence_items.length})</span>
        </button>
      </div>

      {/* Floating Zoom & Controls Dock */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-1 bg-space-900/90 backdrop-blur-md border border-space-800 p-1 rounded-lg shadow-lg">
        <button
          onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-1">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-space-800 my-auto mx-0.5" />
        <button
          onClick={resetView}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Spatial Graph Interactive Layer */}
      <div
        className="w-full h-full transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div className="flex flex-col items-center pt-24 pb-32 px-10 min-w-[900px]">
          {/* ROOT DECISION NODE */}
          <div className="canvas-node relative z-10 w-full max-w-xl bg-space-900/95 border border-space-700 hover:border-brand-primary/60 rounded-2xl p-5 shadow-active-node transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-accent to-brand-primary flex items-center justify-center text-space-950 font-bold shadow-md">
                  <Sparkles className="w-5 h-5 text-space-950" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-semibold">
                    ACTIVE DECISION SPACE
                  </div>
                  <h1 className="text-base font-semibold text-white tracking-tight">
                    {decision.title}
                  </h1>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  Confidence
                </div>
                <div className="text-lg font-mono font-bold text-brand-primary">
                  {decision.confidence_score}%
                </div>
              </div>
            </div>

            {/* Context & Reasoning Summary */}
            <div className="mt-3.5 pt-3 border-t border-space-800 text-xs text-slate-300 leading-relaxed">
              {decision.reasoning_summary || decision.context}
            </div>

            {/* Recommendation Highlight Pill */}
            {decision.recommendation && (
              <div className="mt-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-300 font-medium">
                    Leading Path: <strong className="text-white">{decision.recommendation}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Score {decision.decision_score}
                </span>
              </div>
            )}
          </div>

          {/* CONNECTOR STEM */}
          <div className="w-0.5 h-12 bg-gradient-to-b from-brand-primary/50 to-space-700" />

          {/* FACTORS & CRITERIA BAR */}
          <div className="canvas-node z-10 w-full max-w-2xl bg-space-900/80 border border-space-800 rounded-xl p-3 shadow-subtle-node">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Evaluation Factors & Priorities
                </span>
              </div>
              <button
                onClick={() => toggleNode('factors')}
                className="text-slate-500 hover:text-slate-300"
              >
                {expandedNodes.factors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {expandedNodes.factors && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {decision.factors.map((f) => (
                  <div
                    key={f.id}
                    className="bg-space-850/70 border border-space-750/70 rounded-lg p-2 text-center"
                  >
                    <div className="text-[11px] text-slate-200 font-medium truncate">
                      {f.name}
                    </div>
                    <div className="text-[10px] text-brand-primary font-mono mt-0.5">
                      wt {f.weight}x
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONNECTOR BRANCHING SVG */}
          <svg className="w-full max-w-4xl h-14" viewBox="0 0 800 60">
            <path
              d="M 400 0 L 400 25 M 400 25 C 400 45, 160 30, 160 60 M 400 25 C 400 45, 640 30, 640 60 M 400 25 L 400 60"
              fill="none"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* OPTIONS NODES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {decision.options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => onSelectOption(opt)}
                className={`canvas-node relative bg-space-900 border rounded-xl p-4 shadow-subtle-node transition-all hover:scale-[1.01] cursor-pointer ${
                  opt.is_recommended
                    ? 'border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'border-space-800 hover:border-space-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    {opt.is_recommended ? (
                      <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                        <Crown className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    )}
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      {opt.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        opt.is_recommended
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-space-800 text-slate-300'
                      }`}
                    >
                      {opt.score}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {opt.description || 'Pathway option under strategic multi-agent evaluation.'}
                </p>

                {/* Score Progress Bar */}
                <div className="w-full bg-space-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      opt.is_recommended ? 'bg-emerald-400' : 'bg-brand-primary'
                    }`}
                    style={{ width: `${Math.min(100, opt.score)}%` }}
                  />
                </div>

                {/* Alignment Metrics */}
                {opt.alignment_scores && Object.keys(opt.alignment_scores).length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 py-2 border-t border-space-800/80 text-[10px] font-mono">
                    <div className="bg-space-850/60 p-1 rounded text-center">
                      <span className="text-slate-500 block">GOAL</span>
                      <span className="text-slate-200">{opt.alignment_scores.goal || 80}%</span>
                    </div>
                    <div className="bg-space-850/60 p-1 rounded text-center">
                      <span className="text-slate-500 block">GROWTH</span>
                      <span className="text-emerald-400">{opt.alignment_scores.growth || 85}%</span>
                    </div>
                    <div className="bg-space-850/60 p-1 rounded text-center">
                      <span className="text-slate-500 block">FLEX</span>
                      <span className="text-sky-400">{opt.alignment_scores.flexibility || 75}%</span>
                    </div>
                  </div>
                )}

                {/* Grounding Evidence Pill */}
                <div className="mt-2.5 pt-2 border-t border-space-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-emerald-400" />
                    <span>Evidence Attached</span>
                  </span>
                  <span className="text-brand-primary hover:underline flex items-center space-x-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CONTRADICTION & RISK RADAR (If any) */}
          {decision.contradictions && decision.contradictions.length > 0 && (
            <div className="canvas-node z-10 w-full max-w-3xl mt-8 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 shadow-subtle-node">
              <div className="flex items-center space-x-2 text-amber-400 mb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Synthesizer Contradiction Detection
                </span>
              </div>
              <div className="space-y-1">
                {decision.contradictions.map((c, i) => (
                  <p key={i} className="text-xs text-amber-200/80 pl-6 leading-relaxed">
                    • {c}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

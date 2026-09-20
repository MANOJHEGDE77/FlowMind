import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn, ZoomOut, Maximize2, Swords, SlidersHorizontal,
  Scale, BookOpen, Crown, TrendingUp, ShieldAlert,
  Sparkles, ArrowRight, Layers, Eye, MessageSquare, Share2,
  Headphones, Grid, Network, Volume2, Users
} from 'lucide-react';
import { Decision, DecisionOption } from '../types';
import { soundService } from '../services/sound';

interface SpatialWorkspaceProps {
  decision: Decision;
  onOpenChallenge: () => void;
  onOpenSimulator: () => void;
  onOpenEvidence: () => void;
  onSelectNode: (type: string, data: any) => void;
  onOpenCouncil: () => void;
  onOpenAskAI?: () => void;
  onOpenExport?: () => void;
}

export const SpatialWorkspace: React.FC<SpatialWorkspaceProps> = ({
  decision,
  onOpenChallenge,
  onOpenSimulator,
  onOpenEvidence,
  onSelectNode,
  onOpenCouncil,
  onOpenAskAI,
  onOpenExport,
}) => {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [activePathOptionId, setActivePathOptionId] = useState<number | null>(
    decision.options.find(o => o.is_recommended)?.id || decision.options[0]?.id || null
  );

  const [viewMode, setViewMode] = useState<'flow' | 'matrix'>('flow');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Stop speech when navigating or unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakExecutiveBriefing = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not available in this environment.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    soundService.playChime();
    const winner = decision.options.find(o => o.is_recommended) || decision.options[0];
    const speechText = `FlowMind Executive Decision Intelligence Briefing for dilemma: ${decision.title}. ` +
      `The calibrated recommendation is: ${decision.recommendation || winner?.title}, with a confidence score of ${decision.confidence_score} percent. ` +
      `Core rationale: ${decision.reasoning_summary?.slice(0, 320) || 'Superior risk-adjusted optionality across growth and reversibility.'} ` +
      `Key winning advantage: ${winner?.pros?.[0] || 'Accelerated compounding velocity.'} ` +
      `Primary risk factor to manage: ${winner?.cons?.[0] || 'Execution switching friction.'} ` +
      `Next milestone: Establish 90-day progress metrics.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getMatrixCoords = (opt: DecisionOption) => {
    let rev = 60;
    const title = opt.title.toLowerCase();
    const desc = (opt.description || '').toLowerCase();
    if (title.includes('startup') || desc.includes('founding') || desc.includes('equity')) {
      rev = 42;
    } else if (title.includes('bigtech') || title.includes('staff') || desc.includes('stable')) {
      rev = 78;
    } else if (title.includes('study') || title.includes('degree') || desc.includes('academic')) {
      rev = 52;
    } else if (title.includes('advisory') || title.includes('hybrid') || title.includes('contract')) {
      rev = 86;
    } else if (opt.alignment_scores?.flexibility) {
      rev = opt.alignment_scores.flexibility;
    }

    let upside = opt.score || 75;
    if (opt.alignment_scores?.growth) {
      upside = (opt.alignment_scores.growth + (opt.score || 75)) / 2;
    }
    return { rev, upside };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.spatial-node') || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasRef.current?.scrollLeft || 0,
      scrollTop: canvasRef.current?.scrollTop || 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !canvasRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    canvasRef.current.scrollLeft = panStart.scrollLeft - dx;
    canvasRef.current.scrollTop = panStart.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    canvasRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.6), 1.6));
    }
  };

  const winnerOption = decision.options.find(o => o.is_recommended) || decision.options[0];

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`fixed inset-0 w-screen h-screen bg-[var(--canvas-bg)] spatial-grid select-none overflow-y-auto overflow-x-auto cursor-${
        isPanning ? 'grabbing' : 'default'
      }`}
    >
      {/* Floating Spatial Action HUD (Minimal intelligence pill dock) */}
      <div className="fixed top-16 left-6 z-30 flex flex-col space-y-2 max-w-xl">
        <div className="flex items-center space-x-2 bg-[var(--surface-blur)] backdrop-blur-xl border border-[var(--line-color)] p-1.5 rounded-full shadow-2xl">
          {/* View Mode Toggle: Flow Graph vs 2D Strategy Matrix */}
          <div className="flex items-center bg-[var(--canvas-subtle)] border border-[var(--line-color)] p-0.5 rounded-full mr-1">
            <button
              onClick={() => {
                soundService.playClick();
                setViewMode('flow');
              }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                viewMode === 'flow'
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-400/40 shadow-sm'
                  : 'text-[var(--text-faint)] hover:text-[var(--text-vivid)]'
              }`}
            >
              <Network className="w-3 h-3" />
              <span>Intelligence Flow</span>
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setViewMode('matrix');
              }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                viewMode === 'matrix'
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-400/40 shadow-sm'
                  : 'text-[var(--text-faint)] hover:text-[var(--text-vivid)]'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>2D Strategy Map</span>
            </button>
          </div>

          {/* Minimal Audio Briefing Toggle Button */}
          <button
            onClick={speakExecutiveBriefing}
            onMouseEnter={() => setHoveredAction(isSpeaking ? 'Pause Audio Briefing' : 'Play 2:34 Audio Executive Briefing')}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all border ${
              isSpeaking
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{isSpeaking ? 'Playing Briefing' : 'Executive Briefing'}</span>
            <span className="text-[10px] text-slate-400 font-mono">02:34</span>
            {isSpeaking && (
              <span className="flex items-center space-x-0.5 ml-1">
                <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-1 h-3.5 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </span>
            )}
          </button>

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* Red Team Quick Trigger */}
          <button
            onClick={onOpenChallenge}
            onMouseEnter={() => setHoveredAction('Red Team Mode: Attack fragile assumptions')}
            onMouseLeave={() => setHoveredAction(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono transition-all"
          >
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>Red Team</span>
          </button>

          {/* Monte Carlo Simulator Trigger */}
          <button
            onClick={onOpenSimulator}
            onMouseEnter={() => setHoveredAction('Monte Carlo: 1,000 Scenario Simulations')}
            onMouseLeave={() => setHoveredAction(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-mono transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulation</span>
          </button>

          {/* AI Council Orbit Trigger */}
          <button
            onClick={onOpenCouncil}
            onMouseEnter={() => setHoveredAction('AI Council Orbit: See how the 7 specialized agents debate & reason')}
            onMouseLeave={() => setHoveredAction(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-mono transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Council</span>
          </button>

          <button
            onClick={onOpenEvidence}
            onMouseEnter={() => setHoveredAction('Inspect grounded evidence: View verified PDF/DOCX citations & clauses')}
            onMouseLeave={() => setHoveredAction(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-mono transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Evidence ({decision.evidence_items.length})</span>
          </button>

          {onOpenAskAI && (
            <button
              onClick={onOpenAskAI}
              onMouseEnter={() => setHoveredAction('Ask AI: Ask questions to Gemini / FlowMind regarding this dilemma, trade-offs, or risks')}
              onMouseLeave={() => setHoveredAction(null)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>✦ Ask AI</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              onMouseEnter={() => setHoveredAction('Export Decision Memo: Generate Markdown/JSON memo for documentation & sharing')}
              onMouseLeave={() => setHoveredAction(null)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 text-xs font-mono transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export Memo</span>
            </button>
          )}
        </div>

        {/* Minimal Audio Executive Briefing Overlay Card (When active or playing) */}
        {isSpeaking && (
          <div className="p-4 rounded-2xl bg-[#080B14]/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-left space-y-3 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-300 max-w-xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white tracking-wider">EXECUTIVE BRIEFING // AUDIO SYNTHESIS</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">02:34</span>
                <button
                  onClick={speakExecutiveBriefing}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white"
                >
                  Stop
                </button>
              </div>
            </div>

            {/* Structured 4-Part Summary */}
            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] text-cyan-400 font-bold block mb-0.5">01 // DECISION</span>
                <p className="text-slate-200 font-medium truncate font-sans">{decision.recommendation || winnerOption.title}</p>
                <span className="text-[10px] text-emerald-400">{decision.confidence_score}% Calibrated Confidence</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] text-rose-400 font-bold block mb-0.5">02 // KEY RISKS</span>
                <p className="text-slate-300 line-clamp-2 font-sans text-[10px]">
                  {winnerOption.cons?.[0] || 'Execution friction and potential switching drag.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] text-amber-400 font-bold block mb-0.5">03 // MAJOR TRADE-OFFS</span>
                <p className="text-slate-300 line-clamp-2 font-sans text-[10px]">
                  Near-term transition liquidity vs long-term compounding optionality.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[9px] text-indigo-400 font-bold block mb-0.5">04 // CONSIDERATIONS</span>
                <p className="text-slate-300 line-clamp-2 font-sans text-[10px]">
                  Establish 90-day progress metrics before locking irreversible doors.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hover micro-description tooltip */}
        {hoveredAction && (
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-blur)] backdrop-blur-md border border-[var(--line-color)] text-[11px] font-mono text-[var(--text-body)] shadow-xl max-w-sm">
            {hoveredAction}
          </div>
        )}
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
        className="w-full min-h-full transition-transform duration-100 origin-top flex justify-center"
        style={{
          transform: `scale(${zoom})`,
        }}
      >
        {viewMode === 'matrix' ? (
          <div className="flex flex-col items-center pt-24 pb-48 px-6 min-w-[950px] max-w-5xl w-full animate-in fade-in duration-200">
            {/* 2D Matrix Header */}
            <div className="text-center mb-6 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                ✦ 2D STRATEGIC TRADEOFF MATRIX • REVERSIBILITY (TYPE 1/2) VS COMPOUNDING UPSIDE
              </span>
              <h2 className="text-xl sm:text-2xl font-editorial text-[var(--text-vivid)]">
                Quadrants of Strategic Optionality
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto font-sans">
                Evaluating candidate pathways on Jeff Bezos' Type 1 (One-Way Door) vs Type 2 (Two-Way Door) reversibility against long-term compounding upside.
              </p>
            </div>

            {/* The 2D Coordinate Grid Canvas */}
            <div className="relative w-full max-w-4xl h-[520px] rounded-3xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-[var(--line-color)] p-8 shadow-2xl overflow-hidden select-none">
              {/* 4 Quadrants Ambient Background */}
              <div className="absolute inset-8 grid grid-cols-2 grid-rows-2 gap-2 pointer-events-none opacity-60">
                {/* Top-Left: Asymmetric Bet */}
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 flex flex-col justify-start items-start">
                  <span className="text-[10px] font-mono font-bold text-sky-400 tracking-wider uppercase">
                    ASYMMETRIC BET (TYPE 1 DOOR)
                  </span>
                  <span className="text-[10px] text-[var(--text-faint)] font-sans mt-0.5">High Upside • Hard to Reverse • Commit with buffers</span>
                </div>

                {/* Top-Right: Sweet Spot */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col justify-start items-end text-right">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase flex items-center space-x-1">
                    <span>✦ SWEET SPOT (HIGH LEVERAGE)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-sans mt-0.5">High Compounding • High Agility • Maximum Convexity</span>
                </div>

                {/* Bottom-Left: Lock-In Trap */}
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex flex-col justify-end items-start">
                  <span className="text-[10px] font-mono font-bold text-rose-400 tracking-wider uppercase">
                    LOCK-IN TRAP (AVOID)
                  </span>
                  <span className="text-[10px] text-[var(--text-faint)] font-sans mb-0.5">Low Compounding • Hard to Exit • Sunk Cost Drag</span>
                </div>

                {/* Bottom-Right: Safe Harbor */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col justify-end items-end text-right">
                  <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase">
                    SAFE HARBOR (TYPE 2 DOOR)
                  </span>
                  <span className="text-[10px] text-[var(--text-faint)] font-sans mb-0.5">High Agility • Low Downside • Baseline Security</span>
                </div>
              </div>

              {/* Coordinate Grid Crosshairs */}
              <div className="absolute inset-8 pointer-events-none">
                {/* Horizontal Center Axis */}
                <div className="absolute top-1/2 inset-x-0 h-px bg-[var(--line-color)] border-t border-dashed border-[var(--line-color)]" />
                {/* Vertical Center Axis */}
                <div className="absolute left-1/2 inset-y-0 w-px bg-[var(--line-color)] border-l border-dashed border-[var(--line-color)]" />

                {/* Axis Labels */}
                <div className="absolute bottom-1 right-2 text-[10px] font-mono text-[var(--text-faint)] flex items-center space-x-1">
                  <span>Agility / Two-Way Door ➔</span>
                </div>
                <div className="absolute bottom-1 left-2 text-[10px] font-mono text-[var(--text-faint)]">
                  <span>⏮ One-Way Door (Hard Exit)</span>
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
                  <span>▲ Compounding Upside (Moonshot)</span>
                </div>
                <div className="absolute bottom-1/2 left-2 translate-y-6 text-[10px] font-mono text-[var(--text-faint)]">
                  <span>▼ Floor / Baseline</span>
                </div>
              </div>

              {/* Plotted Option Nodes on Coordinate Plane */}
              <div className="absolute inset-8">
                {decision.options.map((opt) => {
                  const { rev, upside } = getMatrixCoords(opt);
                  const isWinner = opt.is_recommended;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        soundService.playClick();
                        onSelectNode('option', opt);
                      }}
                      style={{
                        left: `${Math.max(10, Math.min(90, rev))}%`,
                        bottom: `${Math.max(12, Math.min(88, upside))}%`,
                        transform: 'translate(-50%, 50%)',
                      }}
                      className="absolute group cursor-pointer z-20 transition-all duration-300"
                    >
                      {/* Outer pulsing ring for recommended */}
                      {isWinner && (
                        <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                      )}

                      {/* Node Pill */}
                      <div
                        className={`relative px-3.5 py-2 rounded-full backdrop-blur-xl border flex items-center space-x-2 shadow-xl transition-all group-hover:scale-110 ${
                          isWinner
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                            : 'bg-[var(--canvas-subtle)] border-cyan-500/30 text-[var(--text-vivid)] group-hover:border-cyan-400'
                        }`}
                      >
                        {isWinner ? (
                          <Crown className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        )}
                        <span className="text-xs font-semibold font-mono truncate max-w-[150px]">
                          {opt.title}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isWinner ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-[var(--canvas-bg)] text-[var(--text-body)]'}`}>
                          {opt.score}
                        </span>
                      </div>

                      {/* Detailed Strategic Matrix Info Card */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-3.5 rounded-2xl bg-[var(--surface-blur)] backdrop-blur-2xl border border-[var(--line-color)] text-left shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30 font-mono text-[10px] space-y-2">
                        <div className="flex items-center justify-between font-bold text-[var(--text-vivid)] pb-1.5 border-b border-[var(--line-color)]">
                          <span className="truncate max-w-[180px] text-xs">{opt.title}</span>
                          <span className="text-cyan-400 font-bold">{opt.score}/100</span>
                        </div>

                        {/* Coordinates & Confidence */}
                        <div className="space-y-1 text-[var(--text-body)]">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-faint)]">Position Coordinates:</span>
                            <span className="font-semibold text-cyan-400">X: {rev}% | Y: {upside}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-faint)]">Model Confidence:</span>
                            <span className="font-semibold text-emerald-400">
                              {opt.is_recommended ? `${decision.confidence_score}%` : `${Math.round(opt.score * 0.9)}%`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-faint)]">Reversibility:</span>
                            <span className={`font-semibold ${rev >= 60 ? 'text-sky-400' : 'text-amber-400'}`}>
                              {rev >= 60 ? 'Type 2 (Two-Way Door)' : 'Type 1 (One-Way Door)'}
                            </span>
                          </div>
                        </div>

                        {/* Major Upside */}
                        <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/25">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase block mb-0.5">
                            ▲ MAJOR UPSIDE
                          </span>
                          <p className="text-[10px] text-emerald-300 font-sans leading-snug">
                            {opt.pros && opt.pros.length > 0 ? opt.pros[0] : 'High compounding mastery and network leverage.'}
                          </p>
                        </div>

                        {/* Major Risk */}
                        <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/25">
                          <span className="text-[9px] font-bold text-rose-400 uppercase block mb-0.5">
                            ▼ MAJOR RISK
                          </span>
                          <p className="text-[10px] text-rose-300 font-sans leading-snug">
                            {opt.cons && opt.cons.length > 0 ? opt.cons[0] : 'Operational switching friction and commitment overhead.'}
                          </p>
                        </div>

                        <div className="text-[9px] text-[var(--text-faint)] pt-0.5 text-center">
                          Click node to inspect evidence & constraints →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrix Takeaway Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[var(--text-body)]">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                <Crown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recommended: <strong className="text-emerald-400">{winnerOption.title}</strong></span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[var(--canvas-subtle)] border border-[var(--line-color)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Pareto Efficiency: <strong className="text-cyan-400">Convex Frontier</strong></span>
              </div>
              <button
                onClick={() => setViewMode('flow')}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                Switch back to Flow Graph →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center pt-28 pb-56 px-8 min-w-[950px] max-w-5xl">

          {/* CORE DECISION CONTEXT NODE */}
          <div
            onClick={() => onSelectNode('goal', {
              title: decision.title,
              context: decision.context,
              goals: decision.goals,
              factors: decision.factors
            })}
            className="spatial-node relative z-20 text-center max-w-2xl cursor-pointer group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
              ✦ ACTIVE DILEMMA // DECISION INTELLIGENCE CONTEXT
            </span>
            <h1 className="text-2xl sm:text-3xl font-editorial text-[var(--text-vivid)] tracking-tight group-hover:text-cyan-400 transition-colors">
              "{decision.title}"
            </h1>
            <p className="text-xs text-[var(--text-body)] mt-2 max-w-lg mx-auto font-sans leading-relaxed">
              {decision.context}
            </p>
          </div>

          {/* STEM TO AGENT COUNCIL */}
          <div className="w-px h-8 bg-gradient-to-b from-cyan-400/80 to-indigo-500/80 my-1" />

          {/* ========================================================================= */}
          {/* 1. AGENT COUNCIL LAYER (6 DEBATING REASONING AGENTS) */}
          {/* ========================================================================= */}
          <div className="w-full max-w-4xl p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl z-20 my-2">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs font-mono">
              <div className="flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-white uppercase tracking-wider">AGENT COUNCIL // DELIBERATION POOL</span>
              </div>
              <button
                onClick={onOpenCouncil}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
              >
                <span>Convene Full Orbit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left font-mono">
              {/* Analyst */}
              <div
                onClick={onOpenCouncil}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-cyan-500/25 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-cyan-400 font-bold mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>ANALYST</span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium italic truncate font-editorial">
                  "What does evidence say?"
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Empirical base rates</div>
              </div>

              {/* Optimist */}
              <div
                onClick={onOpenCouncil}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-emerald-500/25 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>OPTIMIST</span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium italic truncate font-editorial">
                  "What could go right?"
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Asymmetric upside</div>
              </div>

              {/* Skeptic */}
              <div
                onClick={onOpenCouncil}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-rose-500/25 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-rose-400 font-bold mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>SKEPTIC</span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium italic truncate font-editorial">
                  "What are we missing?"
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Friction & tail risk</div>
              </div>

              {/* Financial Analyst */}
              <div
                onClick={onOpenCouncil}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-amber-500/25 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-amber-400 font-bold mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>FINANCIAL</span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium italic truncate font-editorial">
                  "What are the numbers?"
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Cash runway & NPV</div>
              </div>

              {/* Long-Term Planner */}
              <div
                onClick={onOpenCouncil}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-indigo-500/25 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-indigo-400 font-bold mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>LONG-TERM</span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium italic truncate font-editorial">
                  "What compounds?"
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">5-Year optionality</div>
              </div>

              {/* Devil's Advocate */}
              <div
                onClick={onOpenChallenge}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-red-500/30 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-red-400 font-bold mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>DEVIL'S ADVOCATE</span>
                </div>
                <div className="text-[11px] text-slate-200 font-medium italic truncate font-editorial">
                  "Why might this fail?"
                </div>
                <div className="text-[10px] text-red-300 truncate mt-0.5">Assumption attack</div>
              </div>
            </div>
          </div>

          {/* STEM TO CANDIDATE PATHWAYS */}
          <svg className="w-full max-w-4xl h-14 pointer-events-none" viewBox="0 0 800 56">
            <path
              d="M 400 0 L 400 20 M 400 20 C 400 38, 160 26, 160 56 M 400 20 C 400 38, 640 26, 640 56 M 400 20 L 400 56"
              fill="none"
              stroke="var(--line-color)"
              strokeWidth="1.5"
            />
            <path
              d="M 400 0 L 400 56"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="1.5"
              className="animate-flow-dash"
            />
          </svg>

          {/* ========================================================================= */}
          {/* 2. CANDIDATE PATHWAYS (EVIDENCE & TRADE-OFFS) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-20">
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

                  {/* LEAF NODES: DYNAMIC OPTION-SPECIFIC UPSIDE & RISK INDICATORS */}
                  <div className="space-y-2 text-[11px] font-mono text-left">
                    <div className="flex items-start space-x-1.5 text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[10px] leading-tight">
                        {opt.pros && opt.pros.length > 0
                          ? opt.pros[0]
                          : `Edge: Direct high-leverage progress in ${opt.title}`}
                      </span>
                    </div>

                    <div className="flex items-start space-x-1.5 text-rose-400">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[10px] leading-tight">
                        {opt.cons && opt.cons.length > 0
                          ? opt.cons[0]
                          : `Risk: Execution friction & switching cost`}
                      </span>
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

            <div className="text-xs text-[var(--text-body)] leading-relaxed text-left max-w-xl mx-auto pt-3 border-t border-[var(--line-color)] space-y-2 font-sans whitespace-pre-line">
              {decision.reasoning_summary}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

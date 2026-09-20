import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Compass,
  Sparkles,
  Layers,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { FlowNode } from '../types';
import { soundService } from '../services/sound';

export const SignatureFlowCanvas: React.FC = () => {
  const {
    activeFlow,
    selectedNodeId,
    setSelectedNodeId,
    hoveredNodeId,
    setHoveredNodeId,
    canvasZoom,
    setCanvasZoom,
    canvasPan,
    setCanvasPan,
    updateNodePosition,
    addNodeToActiveFlow,
    toggleTask,
  } = useFlow();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeType, setNewNodeType] = useState<FlowNode['type']>('idea');

  // Handle Pan via Canvas drag (when not dragging a node)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current && (e.target as HTMLElement).id !== 'canvas-background') {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setCanvasPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggingNodeId) {
        // Convert screen coordinates to canvas space factoring in pan and zoom
        const newX = (e.clientX - canvasPan.x) / canvasZoom - dragOffset.x;
        const newY = (e.clientY - canvasPan.y) / canvasZoom - dragOffset.y;
        updateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
      }
    },
    [isPanning, panStart, canvasPan, draggingNodeId, dragOffset, canvasZoom, setCanvasPan, updateNodePosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setCanvasZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.2));
  };

  // Node drag start
  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowNode) => {
    e.stopPropagation();
    soundService.playClick();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);

    // Calculate offset between mouse click in canvas space and node's current pos
    const mouseCanvasX = (e.clientX - canvasPan.x) / canvasZoom;
    const mouseCanvasY = (e.clientY - canvasPan.y) / canvasZoom;
    setDragOffset({
      x: mouseCanvasX - node.x,
      y: mouseCanvasY - node.y,
    });
  };

  // Map nodes for fast lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, FlowNode>();
    activeFlow?.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [activeFlow]);

  // Determine connected neighbors of hovered node for living graph lighting
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId && !selectedNodeId) return new Set<string>();
    const activeId = hoveredNodeId || selectedNodeId;
    const ids = new Set<string>();
    if (activeId) ids.add(activeId);

    activeFlow?.edges.forEach((edge) => {
      if (edge.source === activeId) ids.add(edge.target);
      if (edge.target === activeId) ids.add(edge.source);
    });
    return ids;
  }, [hoveredNodeId, selectedNodeId, activeFlow]);

  // Handle Add Node Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) return;
    addNodeToActiveFlow({
      title: newNodeTitle.trim(),
      type: newNodeType,
    });
    setNewNodeTitle('');
    setShowAddModal(false);
  };

  // Center / Fit View
  const handleFitView = () => {
    soundService.playClick();
    setCanvasZoom(1);
    setCanvasPan({ x: 40, y: 40 });
  };

  if (!activeFlow) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 font-mono">
        Loading FlowMind Canvas...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="canvas-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 h-full w-full overflow-hidden select-none bg-[#06080F] cursor-${
        isPanning ? 'grabbing' : draggingNodeId ? 'grabbing' : 'grab'
      }`}
      style={{
        backgroundImage: `radial-gradient(rgba(0, 240, 255, 0.07) 1px, transparent 1px), radial-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px)`,
        backgroundSize: '40px 40px, 120px 120px',
        backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px, ${canvasPan.x}px ${canvasPan.y}px`,
      }}
    >
      {/* Ambient center subtle glow */}
      <div
        className="absolute pointer-events-none rounded-full blur-[140px] opacity-25"
        style={{
          width: '700px',
          height: '700px',
          left: `calc(50% + ${canvasPan.x}px - 350px)`,
          top: `calc(50% + ${canvasPan.y}px - 350px)`,
          background:
            'radial-gradient(circle, rgba(0,240,255,0.4) 0%, rgba(99,102,241,0.2) 45%, transparent 70%)',
        }}
      />

      {/* TRANSFORMABLE CANVAS LAYER */}
      <div
        className="absolute inset-0 pointer-events-none origin-top-left will-change-transform"
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
        }}
      >
        {/* SVG CONNECTIONS & ANIMATED PARTICLES */}
        <svg className="absolute inset-0 w-[4000px] h-[4000px] overflow-visible pointer-events-none">
          <defs>
            <linearGradient id="edgeGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="edgeGradViolet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="edgeGradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {activeFlow.edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            // Approximate center points of nodes
            const sx = sourceNode.x + 110;
            const sy = sourceNode.y + 45;
            const tx = targetNode.x + 100;
            const ty = targetNode.y + 40;

            // Curved cubic bezier path with smooth vertical inflection
            const dy = ty - sy;
            const cy1 = sy + dy * 0.5;
            const cy2 = ty - dy * 0.5;
            const pathData = `M ${sx},${sy} C ${sx},${cy1} ${tx},${cy2} ${tx},${ty}`;

            const isConnected =
              connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);
            const isFaded =
              connectedNodeIds.size > 0 && !isConnected;

            return (
              <g key={edge.id} className="transition-opacity duration-300">
                {/* Background shadow filament */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={edge.color || '#00F0FF'}
                  strokeWidth={isConnected ? 3.5 : 2}
                  strokeOpacity={isFaded ? 0.1 : isConnected ? 0.75 : 0.35}
                  filter={isConnected ? 'url(#glow)' : undefined}
                />

                {/* Animated traveling particles along active connections */}
                {edge.animated && !isFaded && (
                  <>
                    <circle r="3.5" fill="#FFFFFF" filter="url(#glow)">
                      <animateMotion
                        path={pathData}
                        dur="3.2s"
                        repeatCount="indefinite"
                        rotate="auto"
                      />
                    </circle>
                    <circle r="2" fill="#00F0FF">
                      <animateMotion
                        path={pathData}
                        dur="3.2s"
                        begin="1.6s"
                        repeatCount="indefinite"
                        rotate="auto"
                      />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* INTERACTIVE NODES */}
        <div className="absolute inset-0 pointer-events-auto">
          {activeFlow.nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodeIds.has(node.id);
            const isFaded = connectedNodeIds.size > 0 && !isConnected;

            // Visual hierarchy styles per node type
            let nodeStyle = '';
            let accentColor = '#00F0FF';

            if (node.type === 'core') {
              accentColor = '#00F0FF';
              nodeStyle =
                'w-64 min-h-[110px] p-4 rounded-2xl bg-[#0F1424]/95 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/25';
            } else if (node.type === 'decision') {
              accentColor = '#F59E0B';
              nodeStyle =
                'w-56 min-h-[95px] p-3.5 rounded-xl bg-[#12101F]/90 border border-amber-500/50 shadow-xl shadow-amber-950/30';
            } else if (node.type === 'task') {
              accentColor = '#8B5CF6';
              nodeStyle =
                'w-56 min-h-[90px] p-3 rounded-xl bg-[#100F21]/90 border border-violet-500/40 shadow-lg shadow-violet-950/20';
            } else if (node.type === 'result') {
              accentColor = '#10B981';
              nodeStyle =
                'w-56 min-h-[95px] p-3.5 rounded-xl bg-[#091817]/90 border border-emerald-400/60 shadow-xl shadow-emerald-950/30';
            } else {
              // Idea
              accentColor = '#38BDF8';
              nodeStyle =
                'w-56 min-h-[90px] p-3.5 rounded-xl bg-[#0D1222]/90 border border-slate-700/80 shadow-lg shadow-black/40';
            }

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`absolute cursor-pointer transition-all duration-200 group select-none ${nodeStyle} ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black z-30 scale-[1.02]'
                    : isHovered
                    ? 'z-20 scale-[1.02] border-cyan-400/80'
                    : isFaded
                    ? 'opacity-30'
                    : 'z-10'
                }`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Node Type Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-wider font-semibold"
                    style={{
                      backgroundColor: `${accentColor}1A`,
                      color: accentColor,
                      border: `1px solid ${accentColor}40`,
                    }}
                  >
                    ✦ {node.type}
                  </span>

                  {node.progress !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      {node.progress === 100 ? (
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      ) : (
                        <Clock size={11} className="text-slate-500" />
                      )}
                      {node.progress}%
                    </span>
                  )}
                </div>

                {/* Node Title */}
                <h4
                  className={`font-semibold tracking-tight text-white line-clamp-2 ${
                    node.type === 'core' ? 'text-sm' : 'text-xs'
                  }`}
                >
                  {node.title}
                </h4>

                {/* Node Description snippet */}
                {node.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-light leading-snug">
                    {node.description}
                  </p>
                )}

                {/* Quick Task Checkbox for Task Nodes */}
                {node.type === 'task' && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-violet-300">Action node</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Find matching task or simulate toggle
                        soundService.playSuccess();
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950/60 hover:bg-violet-800/60 text-violet-200 border border-violet-700/50"
                    >
                      Focus
                    </button>
                  </div>
                )}

                {/* Tag Pills */}
                {node.tags && node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {node.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP CANVAS CONTROLS / TITLE BADGE */}
      <div className="absolute top-4 left-6 z-40 flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-[#090C16]/90 border border-slate-800 backdrop-blur-md shadow-xl flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wide">
            {activeFlow.title}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
            {activeFlow.nodes.length} Thoughts
          </span>
        </div>
      </div>

      {/* FLOATING CANVAS CONTROLS (BOTTOM RIGHT) */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0A0D1A]/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setCanvasZoom((prev) => Math.min(prev + 0.15, 2.2))}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <span className="px-1 text-[11px] font-mono text-slate-400 min-w-[40px] text-center">
            {Math.round(canvasZoom * 100)}%
          </span>
          <button
            onClick={() => setCanvasZoom((prev) => Math.max(prev - 0.15, 0.4))}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <div className="w-[1px] h-4 bg-slate-800 my-auto mx-0.5" />
          <button
            onClick={handleFitView}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Fit / Reset View"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Add Node Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={16} />
          <span>Add Thought</span>
        </button>
      </div>

      {/* BOTTOM LEFT MINIMAP */}
      <div className="absolute bottom-6 left-6 z-40 hidden md:block">
        <div className="w-40 h-28 rounded-xl bg-[#090C16]/90 border border-slate-800/80 backdrop-blur-md p-2 shadow-2xl relative overflow-hidden group">
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Minimap</span>
            <Compass size={10} className="text-cyan-400" />
          </div>
          <svg className="w-full h-full" viewBox="0 0 1000 600">
            {/* Edge lines */}
            {activeFlow.edges.map((e) => {
              const s = nodeMap.get(e.source);
              const t = nodeMap.get(e.target);
              if (!s || !t) return null;
              return (
                <line
                  key={e.id}
                  x1={s.x + 80}
                  y1={s.y + 40}
                  x2={t.x + 80}
                  y2={t.y + 40}
                  stroke="#334155"
                  strokeWidth="3"
                />
              );
            })}
            {/* Node markers */}
            {activeFlow.nodes.map((n) => (
              <circle
                key={n.id}
                cx={n.x + 80}
                cy={n.y + 40}
                r={n.type === 'core' ? 14 : 9}
                fill={
                  n.id === selectedNodeId
                    ? '#00F0FF'
                    : n.type === 'core'
                    ? '#6366F1'
                    : '#475569'
                }
              />
            ))}
          </svg>
        </div>
      </div>

      {/* QUICK ADD NODE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0D111D] border border-slate-800 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-base font-bold text-white mb-1">
                Add Thought Node
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Attach an idea, task, decision, or result to this active flow.
              </p>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Thought Concept
                  </label>
                  <input
                    type="text"
                    required
                    value={newNodeTitle}
                    onChange={(e) => setNewNodeTitle(e.target.value)}
                    placeholder="e.g. Master Monotonic Queue Pattern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Hierarchy Classification
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['idea', 'decision', 'task', 'result'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewNodeType(t)}
                        className={`py-2 px-1 rounded-xl text-xs font-mono uppercase border transition-all text-center ${
                          newNodeType === t
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
                  >
                    Connect Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

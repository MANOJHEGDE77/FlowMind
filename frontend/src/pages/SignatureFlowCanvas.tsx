import React, { useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  CheckSquare,
  Sparkles,
  ArrowRight,
  GitBranch,
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
    deleteNodeFromActiveFlow,
    addTask,
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
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);

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

  // Double click anywhere on canvas background to add node at that exact position
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-background') {
      const targetCanvasX = (e.clientX - canvasPan.x) / canvasZoom;
      const targetCanvasY = (e.clientY - canvasPan.y) / canvasZoom;
      setModalPosition({ x: Math.round(targetCanvasX), y: Math.round(targetCanvasY) });
      setShowAddModal(true);
    }
  };

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

    const mouseCanvasX = (e.clientX - canvasPan.x) / canvasZoom;
    const mouseCanvasY = (e.clientY - canvasPan.y) / canvasZoom;
    setDragOffset({
      x: mouseCanvasX - node.x,
      y: mouseCanvasY - node.y,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) return;

    soundService.playSuccess();
    const posX = modalPosition ? modalPosition.x : 450 + Math.floor(Math.random() * 120);
    const posY = modalPosition ? modalPosition.y : 220 + Math.floor(Math.random() * 120);

    addNodeToActiveFlow({
      parentId: selectedNodeId || activeFlow?.nodes[0]?.id,
      title: newNodeTitle.trim(),
      type: newNodeType,
      description: `Structured conceptual node created in ${activeFlow.title}.`,
      x: posX,
      y: posY,
    });

    setNewNodeTitle('');
    setShowAddModal(false);
    setModalPosition(null);
  };

  const handleFitView = () => {
    soundService.playClick();
    setCanvasZoom(1);
    setCanvasPan({ x: 50, y: 50 });
  };

  const nodeMap = useMemo(() => {
    const map = new Map<string, FlowNode>();
    if (activeFlow) {
      activeFlow.nodes.forEach((n) => map.set(n.id, n));
    }
    return map;
  }, [activeFlow]);

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedNodeId || !activeFlow) return ids;
    ids.add(selectedNodeId);

    activeFlow.edges.forEach((edge) => {
      if (edge.source === selectedNodeId) ids.add(edge.target);
      if (edge.target === selectedNodeId) ids.add(edge.source);
    });
    return ids;
  }, [selectedNodeId, activeFlow]);

  const nodeConnectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (!activeFlow) return counts;
    activeFlow.edges.forEach((edge) => {
      counts.set(edge.source, (counts.get(edge.source) || 0) + 1);
      counts.set(edge.target, (counts.get(edge.target) || 0) + 1);
    });
    return counts;
  }, [activeFlow]);

  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;
    setCanvasPan({
      x: -(clickX * 1200 - window.innerWidth / 2),
      y: -(clickY * 900 - window.innerHeight / 2),
    });
  };

  if (!activeFlow) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-[#08090D] text-[#A7ACB8]">
        <div className="text-center space-y-3 p-8 rounded-2xl bg-[#0F1118] border border-white/[0.08] max-w-sm">
          <p className="text-sm font-semibold text-white">YOUR FLOW IS EMPTY.</p>
          <p className="text-xs text-[#686E7C]">
            Every meaningful system starts with a single thought.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white text-xs font-semibold"
          >
            + Start Thinking
          </button>
        </div>
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
      onDoubleClick={handleCanvasDoubleClick}
      onWheel={handleWheel}
      className="relative flex-1 h-full w-full overflow-hidden bg-[#08090D] select-none cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
        backgroundSize: `${28 * canvasZoom}px ${28 * canvasZoom}px`,
        backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px`,
      }}
    >
      {/* TRANSFORMABLE CANVAS LAYER */}
      <div
        className="absolute inset-0 pointer-events-none origin-top-left will-change-transform"
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
        }}
      >
        {/* SVG CONNECTIONS & FLOW PARTICLES */}
        <svg className="absolute inset-0 w-[6000px] h-[6000px] overflow-visible pointer-events-none">
          <defs>
            <linearGradient id="flow-edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#5EE7FF" stopOpacity="0.8" />
            </linearGradient>
            <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {activeFlow.edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const sx = sourceNode.x + 120;
            const sy = sourceNode.y + 40;
            const tx = targetNode.x + 110;
            const ty = targetNode.y + 35;

            const dy = ty - sy;
            const cy1 = sy + dy * 0.5;
            const cy2 = ty - dy * 0.5;
            const pathData = `M ${sx},${sy} C ${sx},${cy1} ${tx},${cy2} ${tx},${ty}`;

            const isConnected =
              connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);
            const isFaded = connectedNodeIds.size > 0 && !isConnected;

            return (
              <g key={edge.id} className="transition-opacity duration-200">
                <path
                  d={pathData}
                  fill="none"
                  stroke={isConnected ? '#5EE7FF' : 'rgba(94, 231, 255, 0.25)'}
                  strokeWidth={isConnected ? 2.5 : 1.5}
                  strokeOpacity={isFaded ? 0.08 : 0.8}
                  filter={isConnected ? 'url(#edge-glow)' : undefined}
                />

                {edge.animated && !isFaded && (
                  <circle r="3" fill="#5EE7FF" filter="url(#edge-glow)">
                    <animateMotion
                      path={pathData}
                      dur="3s"
                      repeatCount="indefinite"
                      rotate="auto"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* INTERACTIVE NODES (Visual grammar: Thought, Question, Insight, Decision, Action, Goal) */}
        <div className="absolute inset-0 pointer-events-auto">
          {activeFlow.nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodeIds.has(node.id);
            const isFaded = connectedNodeIds.size > 0 && !isConnected;
            const connectionCount = nodeConnectionCounts.get(node.id) || 0;

            const isCoreOrGoal = node.type === 'core' || node.type === 'goal';
            const isDecision = node.type === 'decision';
            const isAction = node.type === 'task';
            const isInsight = node.type === 'result';
            const isQuestion = node.type === 'resource';

            // Distinct semantic styling for each node type
            let nodeWidth = 'w-60 min-h-[95px]';
            let bgStyle = 'bg-[#0F1118]/95';
            let borderStyle = 'border-white/[0.08]';
            let typeLabel = 'THOUGHT';
            let typeColor = 'text-[#A7ACB8]';

            if (isCoreOrGoal) {
              nodeWidth = 'w-72 min-h-[115px]';
              bgStyle = 'bg-[#151823]/95';
              borderStyle = isSelected
                ? 'border-[#7C5CFF] shadow-[0_0_24px_rgba(124,92,255,0.4)]'
                : 'border-[#7C5CFF]/40 shadow-[0_4px_24px_rgba(124,92,255,0.15)]';
              typeLabel = 'GOAL';
              typeColor = 'text-[#9B84FF]';
            } else if (isDecision) {
              borderStyle = isSelected
                ? 'border-[#F5B84B] shadow-[0_0_20px_rgba(245,184,75,0.4)]'
                : 'border-[#F5B84B]/40';
              typeLabel = 'DECISION';
              typeColor = 'text-[#F5B84B]';
            } else if (isAction) {
              borderStyle = isSelected
                ? 'border-[#45E0A8] shadow-[0_0_20px_rgba(69,224,168,0.4)]'
                : 'border-[#45E0A8]/40';
              typeLabel = 'ACTION';
              typeColor = 'text-[#45E0A8]';
            } else if (isInsight) {
              borderStyle = isSelected
                ? 'border-[#7C5CFF] shadow-[0_0_20px_rgba(124,92,255,0.4)]'
                : 'border-[#7C5CFF]/40';
              typeLabel = 'INSIGHT';
              typeColor = 'text-[#9B84FF]';
            } else if (isQuestion) {
              borderStyle = isSelected
                ? 'border-[#5EE7FF] shadow-[0_0_20px_rgba(94,231,255,0.4)]'
                : 'border-[#5EE7FF]/40';
              typeLabel = 'QUESTION';
              typeColor = 'text-[#5EE7FF]';
            } else {
              // Default THOUGHT
              if (isSelected) {
                borderStyle = 'border-[#7C5CFF] shadow-[0_0_20px_rgba(124,92,255,0.35)]';
              } else if (isHovered) {
                borderStyle = 'border-white/[0.25]';
              }
            }

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`absolute cursor-pointer select-none rounded-xl border p-3.5 backdrop-blur-md transition-all duration-150 ${nodeWidth} ${bgStyle} ${borderStyle} ${
                  isSelected ? 'z-30 scale-[1.02]' : isHovered ? 'z-20 scale-[1.01]' : isFaded ? 'opacity-25' : 'z-10'
                }`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                }}
              >
                {/* FLOATING HOVER ACTION BAR */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center space-x-1 p-1 rounded-lg bg-[#151823] border border-white/[0.12] shadow-xl z-50 backdrop-blur-md"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addNodeToActiveFlow({
                            parentId: node.id,
                            title: `Sub-thought on ${node.title}`,
                            type: 'idea',
                            x: node.x + 140,
                            y: node.y + 110,
                          });
                          soundService.playSuccess();
                        }}
                        className="p-1 rounded text-[#A7ACB8] hover:text-[#5EE7FF] hover:bg-white/[0.08] transition-colors"
                        title="Add child thought"
                      >
                        <Plus size={13} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addTask({
                            title: `Action: ${node.title}`,
                            flowId: activeFlow.id,
                            flowTitle: activeFlow.title,
                            nodeId: node.id,
                            nodeTitle: node.title,
                            completed: false,
                            priority: 'high',
                            dueDate: 'Today',
                            estimatedMinutes: 30,
                          });
                          soundService.playSuccess();
                        }}
                        className="p-1 rounded text-[#A7ACB8] hover:text-[#45E0A8] hover:bg-white/[0.08] transition-colors"
                        title="Convert to action item"
                      >
                        <CheckSquare size={13} />
                      </button>

                      {node.type !== 'core' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNodeFromActiveFlow(node.id);
                            soundService.playClick();
                          }}
                          className="p-1 rounded text-[#A7ACB8] hover:text-[#FF5C6C] hover:bg-white/[0.08] transition-colors"
                          title="Delete node"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* NODE HEADER: Type Label & Status */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${typeColor}`}>
                      {typeLabel}
                    </span>
                  </div>

                  {/* Status / Checkbox for Action nodes */}
                  {isAction ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Find matching task or toggle
                        soundService.playSuccess();
                      }}
                      className="text-[#45E0A8] hover:opacity-80"
                    >
                      <CheckCircle2 size={13} />
                    </button>
                  ) : node.progress !== undefined ? (
                    <span className="text-[10px] font-mono text-[#686E7C]">
                      {node.progress}%
                    </span>
                  ) : null}
                </div>

                {/* NODE TITLE */}
                <h4
                  className={`font-semibold tracking-tight text-[#F4F5F7] leading-snug line-clamp-2 ${
                    isCoreOrGoal ? 'text-sm' : 'text-xs'
                  }`}
                >
                  {node.title}
                </h4>

                {/* SHORT DESCRIPTION */}
                {node.description && (
                  <p className="text-[11px] text-[#A7ACB8] line-clamp-2 mt-1 leading-relaxed">
                    {node.description}
                  </p>
                )}

                {/* NODE FOOTER: Connection Count & Provenance */}
                <div className="pt-2 mt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-[#686E7C] font-mono">
                  <span>
                    {connectionCount} {connectionCount === 1 ? 'CONNECTION' : 'CONNECTIONS'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP CANVAS METRICS BADGE */}
      <div className="absolute top-4 left-6 z-40 flex items-center space-x-3">
        <div className="px-3.5 py-1.5 rounded-xl bg-[#0F1118]/90 border border-white/[0.08] backdrop-blur-md shadow-xl flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-[#5EE7FF] animate-pulse" />
          <span className="text-xs font-semibold text-white">
            {activeFlow.title}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-[#A7ACB8] border border-white/[0.08]">
            {activeFlow.nodes.length} Thoughts
          </span>
        </div>
      </div>

      {/* BOTTOM LEFT MINIMAP */}
      <div className="absolute bottom-6 left-6 z-40 hidden md:block">
        <div className="w-40 h-28 rounded-xl bg-[#0F1118]/90 border border-white/[0.08] backdrop-blur-md p-2 shadow-2xl relative overflow-hidden">
          <div className="text-[9px] font-mono text-[#686E7C] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Knowledge Radar</span>
            <Compass size={11} className="text-[#5EE7FF]" />
          </div>
          <svg
            className="w-full h-full cursor-crosshair"
            viewBox="0 0 1000 600"
            onClick={handleMinimapClick}
          >
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
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="2"
                />
              );
            })}
            {activeFlow.nodes.map((n) => (
              <circle
                key={n.id}
                cx={n.x + 80}
                cy={n.y + 40}
                r={n.type === 'core' || n.type === 'goal' ? 8 : 5}
                fill={
                  n.id === selectedNodeId
                    ? '#5EE7FF'
                    : n.type === 'core' || n.type === 'goal'
                    ? '#7C5CFF'
                    : 'rgba(255,255,255,0.3)'
                }
              />
            ))}
          </svg>
        </div>
      </div>

      {/* BOTTOM RIGHT SPATIAL CONTROLS */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center space-x-2">
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0F1118]/90 border border-white/[0.08] shadow-xl backdrop-blur-md">
          <button
            onClick={() => setCanvasZoom((prev) => Math.min(prev + 0.15, 2.2))}
            className="p-2 rounded-lg text-[#A7ACB8] hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <span className="px-1 text-[11px] font-mono text-[#A7ACB8] min-w-[38px] text-center">
            {Math.round(canvasZoom * 100)}%
          </span>
          <button
            onClick={() => setCanvasZoom((prev) => Math.max(prev - 0.15, 0.4))}
            className="p-2 rounded-lg text-[#A7ACB8] hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <div className="w-[1px] h-4 bg-white/[0.08] my-auto mx-0.5" />
          <button
            onClick={handleFitView}
            className="p-2 rounded-lg text-[#A7ACB8] hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Fit View"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        <button
          onClick={() => {
            setModalPosition(null);
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold text-xs shadow-lg shadow-[#7C5CFF]/20 hover:opacity-95 transition-all"
        >
          <Plus size={14} />
          <span>Add Thought</span>
        </button>
      </div>

      {/* QUICK ADD THOUGHT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F1118] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-white">
                  Add Concept Node
                </h3>
                <p className="text-xs text-[#A7ACB8] mt-0.5">
                  Structure an idea, question, insight, decision, or action into this flow.
                </p>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A7ACB8] mb-1.5">
                    Concept Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newNodeTitle}
                    onChange={(e) => setNewNodeTitle(e.target.value)}
                    placeholder="e.g. Master Monotonic Queue Pattern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.1] text-white placeholder-[#686E7C] text-sm focus:outline-none focus:border-[#7C5CFF]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A7ACB8] mb-1.5">
                    Classification
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'idea', label: 'Thought' },
                      { id: 'resource', label: 'Question' },
                      { id: 'result', label: 'Insight' },
                      { id: 'decision', label: 'Decision' },
                      { id: 'task', label: 'Action' },
                      { id: 'goal', label: 'Goal' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNewNodeType(item.id as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                          newNodeType === item.id
                            ? 'bg-[#7C5CFF]/20 border-[#7C5CFF] text-white font-semibold'
                            : 'bg-white/[0.02] border-white/[0.06] text-[#A7ACB8] hover:border-white/[0.15]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setModalPosition(null);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs text-[#A7ACB8] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#5EE7FF] text-white font-semibold text-xs shadow-md shadow-[#7C5CFF]/25 hover:opacity-95 transition-all"
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

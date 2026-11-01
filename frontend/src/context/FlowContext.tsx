import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FlowGraph, FlowNode, FlowEdge, ConnectedTask,
  KnowledgeItem, ThinkingPattern
} from '../types';
import { soundService } from '../services/sound';

interface FlowContextType {
  flows: FlowGraph[];
  activeFlowId: string;
  activeFlow: FlowGraph;
  selectedNodeId: string | null;
  selectedNode: FlowNode | null;
  hoveredNodeId: string | null;
  tasks: ConnectedTask[];
  knowledgeItems: KnowledgeItem[];
  thinkingPatterns: ThinkingPattern[];
  activeFocusTask: ConnectedTask | null;
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  isGeneratingFlow: boolean;
  generatingStep: number; // 1 to 4
  generatingPrompt: string;
  setActiveFlowId: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setCanvasZoom: React.Dispatch<React.SetStateAction<number>>;
  setCanvasPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setActiveFocusTask: (task: ConnectedTask | null) => void;
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<ConnectedTask, 'id'>) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  addNodeToActiveFlow: (node: Partial<FlowNode>) => void;
  deleteNodeFromActiveFlow: (nodeId: string) => void;
  generateFlowFromPrompt: (prompt: string, category?: FlowGraph['category']) => Promise<FlowGraph>;
  cancelGeneration: () => void;
}

// ----------------- Default Preset Flows -----------------

const INITIAL_FLOWS: FlowGraph[] = [
  {
    id: 'flow-java-interview',
    title: 'Java & Distributed Systems Interview',
    description: 'Mastery road from OOP fundamentals and high-concurrency patterns to Spring Boot microservices and live mock interviews.',
    category: 'Career',
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-20T14:30:00Z',
    progress: 68,
    starred: true,
    nodes: [
      {
        id: 'node-core',
        type: 'core',
        title: 'Java Interview Mastery',
        description: 'Comprehensive preparation framework for Tier-1 Tech Staff/Principal backend roles.',
        x: 450,
        y: 220,
        priority: 'urgent',
        progress: 68,
        tags: ['CAREER', 'BACKEND', 'HIGH_STAKES'],
        aiSummary: 'Structured path balancing empirical DSA base rates with distributed systems architecture and JVM internals.',
        suggestedActions: ['Run 30-minute mock coding drill', 'Review ConcurrentHashMap source code', 'Solve LRU Cache'],
        relatedThoughts: ['System Design Scalability', 'Behavioral Leadership Stories'],
      },
      // Layer 1: Pillars
      {
        id: 'node-core-java',
        type: 'idea',
        title: 'Core Java & JVM Internals',
        description: 'Memory model, Garbage Collectors (ZGC, G1), concurrency primitives.',
        x: 180,
        y: 110,
        parentId: 'node-core',
        tags: ['JVM', 'CONCURRENCY'],
        progress: 85,
        status: 'completed',
        aiSummary: 'Strong grasp of Virtual Threads (Project Loom) and memory visibility semantics.',
        suggestedActions: ['Summarize JMM happens-before rules', 'Verify ThreadPoolExecutor sizing heuristics'],
      },
      {
        id: 'node-dsa',
        type: 'idea',
        title: 'DSA & Algorithmic Patterns',
        description: 'Blind 75 mastery, two pointers, sliding window, topological sort, DP.',
        x: 450,
        y: 40,
        parentId: 'node-core',
        tags: ['DSA', 'LEETCODE'],
        progress: 74,
        status: 'in-progress',
        aiSummary: 'High proficiency in Tree/Graph traversals; refine DP memoization and Segment Trees.',
        suggestedActions: ['Practice 5 Sliding Window problems', 'Review Monotonic Stack templates'],
      },
      {
        id: 'node-sysdesign',
        type: 'decision',
        title: 'System Design: Consistency vs Latency',
        description: 'Trade-off between strong linearizability (Raft/Paxos) and eventual consistency in distributed cache meshes.',
        x: 720,
        y: 110,
        parentId: 'node-core',
        tags: ['ARCHITECTURE', 'DISTRIBUTED'],
        progress: 60,
        status: 'in-progress',
        aiSummary: 'Decision point: Choose appropriate consensus boundaries for financial ledger versus read-heavy feed.',
        suggestedActions: ['Sketch partitioned Kafka cluster topology', 'Model Redis cache-aside write-invalidation'],
      },
      // Layer 2: Actions & Tasks
      {
        id: 'node-task-hashmap',
        type: 'task',
        title: 'Deep-dive into ConcurrentHashMap',
        description: 'Inspect segment locks, CAS array bins, and TreeBins rebalancing under high thread contention.',
        x: 100,
        y: 360,
        parentId: 'node-core-java',
        tags: ['CODE_INSPECTION'],
        progress: 100,
        status: 'completed',
      },
      {
        id: 'node-task-binarysearch',
        type: 'task',
        title: 'Practice Binary Search on Answer',
        description: 'Solve Koko Eating Bananas, Capacity to Ship Packages, and Split Array Largest Sum.',
        x: 360,
        y: 400,
        parentId: 'node-dsa',
        tags: ['PRACTICE'],
        progress: 40,
        status: 'in-progress',
      },
      {
        id: 'node-task-mock',
        type: 'task',
        title: 'Full 60-Minute Peer Mock Interview',
        description: 'Simulate live coding on Google Meet with strict time bounding and clear audio explanations.',
        x: 580,
        y: 400,
        parentId: 'node-core',
        tags: ['MOCK_DRILL'],
        progress: 0,
        status: 'pending',
      },
      // Layer 3: Results
      {
        id: 'node-result-offer',
        type: 'result',
        title: 'Top-Tier Staff Offer ($240k+)',
        description: 'Calibrated clarity and decisive confidence across algorithms, system architecture, and leadership.',
        x: 820,
        y: 360,
        parentId: 'node-sysdesign',
        tags: ['CLARITY', 'OUTCOME'],
        progress: 68,
        status: 'in-progress',
      },
    ],
    edges: [
      { id: 'e1', source: 'node-core', target: 'node-core-java', animated: true, color: '#00F0FF' },
      { id: 'e2', source: 'node-core', target: 'node-dsa', animated: true, color: '#6366F1' },
      { id: 'e3', source: 'node-core', target: 'node-sysdesign', animated: true, color: '#F59E0B' },
      { id: 'e4', source: 'node-core-java', target: 'node-task-hashmap', color: '#10B981' },
      { id: 'e5', source: 'node-dsa', target: 'node-task-binarysearch', animated: true, color: '#8B5CF6' },
      { id: 'e6', source: 'node-core', target: 'node-task-mock', color: '#F43F5E' },
      { id: 'e7', source: 'node-sysdesign', target: 'node-result-offer', animated: true, color: '#10B981' },
    ],
  },
  {
    id: 'flow-ai-agent',
    title: 'Autonomous Multi-Agent Cognitive Platform',
    description: 'Architecture of FlowMind deliberative engine, vector memory mesh, and adversarial stress-testing pipelines.',
    category: 'Projects',
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-20T16:45:00Z',
    progress: 82,
    starred: true,
    nodes: [
      {
        id: 'node-agent-core',
        type: 'core',
        title: 'FlowMind Agentic Deliberation',
        description: 'Multi-perspective cognitive orchestrator with 7 dialectic reasoning engines.',
        x: 460,
        y: 200,
        priority: 'high',
        progress: 82,
        tags: ['AI_SYSTEM', 'MULTI_AGENT'],
        aiSummary: 'Decoupled autonomous reasoning agents evaluating dilemmas without shared confirmation bias.',
      },
      {
        id: 'node-agent-rag',
        type: 'idea',
        title: 'Grounded RAG Provenance',
        description: 'Vector embeddings paired with lexical BM25 reranking for instant citation lookup.',
        x: 200,
        y: 100,
        parentId: 'node-agent-core',
        tags: ['VECTOR_DB', 'RAG'],
        progress: 90,
        status: 'completed',
      },
      {
        id: 'node-agent-redteam',
        type: 'decision',
        title: 'Adversarial Stress Test Protocol',
        description: 'Aggressive assumption deconstruction engine calculating confidence haircuts.',
        x: 720,
        y: 100,
        parentId: 'node-agent-core',
        tags: ['RED_TEAM', 'RESILIENCE'],
        progress: 85,
        status: 'completed',
      },
      {
        id: 'node-agent-synth',
        type: 'result',
        title: 'Harmonized Equilibrium Signal',
        description: 'Bayesian synthesis harmonizing 7 conflicting agent reports into one actionable verdict.',
        x: 460,
        y: 380,
        parentId: 'node-agent-core',
        tags: ['VERDICT'],
        progress: 75,
        status: 'in-progress',
      },
    ],
    edges: [
      { id: 'ae1', source: 'node-agent-core', target: 'node-agent-rag', animated: true, color: '#00F0FF' },
      { id: 'ae2', source: 'node-agent-core', target: 'node-agent-redteam', animated: true, color: '#F43F5E' },
      { id: 'ae3', source: 'node-agent-core', target: 'node-agent-synth', animated: true, color: '#10B981' },
    ],
  },
  {
    id: 'flow-q4-strategy',
    title: 'Series B vs Bootstrapping Strategic Pivot',
    description: 'Capital runway allocation, team hiring velocity, and equity dilution stress tests.',
    category: 'Personal Goals',
    createdAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-18T18:20:00Z',
    progress: 55,
    starred: false,
    nodes: [
      {
        id: 'node-strat-core',
        type: 'core',
        title: 'Capital Allocation Strategy',
        description: 'Choose between 100% founder equity sovereignty or $2.5M seed acceleration.',
        x: 440,
        y: 200,
        priority: 'high',
        progress: 55,
        tags: ['VENTURE', 'CAPITAL'],
      },
      {
        id: 'node-strat-boot',
        type: 'decision',
        title: 'Bootstrap to Profitability',
        description: 'Customer revenue funded growth; zero liquidation preference overhang.',
        x: 220,
        y: 320,
        parentId: 'node-strat-core',
        tags: ['ORGANIC'],
        progress: 70,
      },
      {
        id: 'node-strat-seed',
        type: 'decision',
        title: 'Accept Institutional Seed',
        description: '24-month runway guarantee; hire 4 senior engineers immediately.',
        x: 660,
        y: 320,
        parentId: 'node-strat-core',
        tags: ['VENTURE_TRACK'],
        progress: 45,
      },
    ],
    edges: [
      { id: 'se1', source: 'node-strat-core', target: 'node-strat-boot', color: '#10B981' },
      { id: 'se2', source: 'node-strat-core', target: 'node-strat-seed', color: '#F59E0B' },
    ],
  },
];

const INITIAL_TASKS: ConnectedTask[] = [
  {
    id: 'task-1',
    title: 'Practice Binary Search on Answer (5 medium problems)',
    flowId: 'flow-java-interview',
    flowTitle: 'Java & Distributed Systems Interview',
    nodeId: 'node-task-binarysearch',
    nodeTitle: 'Practice Binary Search on Answer',
    completed: false,
    priority: 'high',
    dueDate: 'Today',
    estimatedMinutes: 45,
  },
  {
    id: 'task-2',
    title: 'Inspect ConcurrentHashMap CAS bins in JDK 21 source',
    flowId: 'flow-java-interview',
    flowTitle: 'Java & Distributed Systems Interview',
    nodeId: 'node-task-hashmap',
    nodeTitle: 'Deep-dive into ConcurrentHashMap',
    completed: true,
    priority: 'medium',
    dueDate: 'Yesterday',
    estimatedMinutes: 30,
  },
  {
    id: 'task-3',
    title: 'Schedule 60-Minute Systems Mock Interview',
    flowId: 'flow-java-interview',
    flowTitle: 'Java & Distributed Systems Interview',
    nodeId: 'node-task-mock',
    nodeTitle: 'Full 60-Minute Peer Mock Interview',
    completed: false,
    priority: 'urgent',
    dueDate: 'Tomorrow',
    estimatedMinutes: 60,
  },
  {
    id: 'task-4',
    title: 'Profile Vector RAG reranker latency under 500 QPS load',
    flowId: 'flow-ai-agent',
    flowTitle: 'Autonomous Multi-Agent Cognitive Platform',
    nodeId: 'node-agent-rag',
    nodeTitle: 'Grounded RAG Provenance',
    completed: false,
    priority: 'medium',
    dueDate: 'In 3 days',
    estimatedMinutes: 40,
  },
  {
    id: 'task-5',
    title: 'Draft 60-day customer pilot terms before seed term sheet signing',
    flowId: 'flow-q4-strategy',
    flowTitle: 'Series B vs Bootstrapping Strategic Pivot',
    nodeId: 'node-strat-seed',
    nodeTitle: 'Accept Institutional Seed',
    completed: false,
    priority: 'high',
    dueDate: 'Next week',
    estimatedMinutes: 90,
  },
];

const INITIAL_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'k-1',
    title: 'Java Memory Model (JSR-133) & Happens-Before Specification',
    type: 'note',
    connectedFlows: ['Java & Distributed Systems Interview'],
    snippet: 'Volatile variable write establishes a happens-before order with subsequent volatile reads. Prevents reordering across memory barriers.',
    tags: ['JVM', 'CONCURRENCY', 'CORE_JAVA'],
    updatedAt: '2 hours ago',
  },
  {
    id: 'k-2',
    title: 'Distributed Consensus: Raft vs Multi-Paxos in Production',
    type: 'document',
    connectedFlows: ['Java & Distributed Systems Interview', 'Autonomous Multi-Agent Cognitive Platform'],
    snippet: 'Leader election invariants and log matching property. Why Raft minimizes state machine complexity compared to classic Paxos.',
    tags: ['CONSENSUS', 'RAFT', 'SYSTEMS'],
    updatedAt: '1 day ago',
  },
  {
    id: 'k-3',
    title: 'Series B Term Sheet Dilution & Liquidation Preference Benchmark',
    type: 'link',
    connectedFlows: ['Series B vs Bootstrapping Strategic Pivot'],
    snippet: 'Standard 1x non-participating preferred equity versus participating clauses in the 2026 early-stage SaaS landscape.',
    tags: ['TERM_SHEET', 'VENTURE_CAPITAL'],
    updatedAt: '3 days ago',
  },
  {
    id: 'k-4',
    title: 'Multi-Agent Dialectic Synthesis Architecture (Paper Summary)',
    type: 'ai_summary',
    connectedFlows: ['Autonomous Multi-Agent Cognitive Platform'],
    snippet: 'How assigning opposing cognitive roles (Optimist vs Skeptic vs Devil) cancels out confirmation bias in autonomous LLM decision loops.',
    tags: ['RESEARCH', 'MULTI_AGENT'],
    updatedAt: '5 days ago',
  },
];

const INITIAL_PATTERNS: ThinkingPattern[] = [
  {
    id: 'p-1',
    type: 'pattern',
    title: 'High Execution Momentum',
    insight: 'You have completed 85% of your Core Java milestones, but only 40% of algorithmic practice.',
    actionText: 'Shift today\'s cognitive focus to Binary Search and Dynamic Programming.',
    flowId: 'flow-java-interview',
  },
  {
    id: 'p-2',
    type: 'next_move',
    title: 'Strategic Bottleneck Detected',
    insight: 'Completing the Peer Mock Interview unlocks the highest probability lift for your Staff offer.',
    actionText: 'Schedule mock session with peer mentor.',
    flowId: 'flow-java-interview',
    targetNodeId: 'node-task-mock',
  },
  {
    id: 'p-3',
    type: 'connection',
    title: 'Cross-Flow Cognitive Linkage',
    insight: 'Your "Distributed Systems" node in Career directly feeds into "Multi-Agent Vector Mesh" in Projects.',
    actionText: 'Reuse Kafka partitioned consumer pattern in FlowMind Agent architecture.',
    flowId: 'flow-ai-agent',
  },
];

// ----------------- Context & Provider -----------------

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flows, setFlows] = useState<FlowGraph[]>(() => {
    const saved = localStorage.getItem('flowmind_flows_state');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_FLOWS;
  });

  const [activeFlowId, setActiveFlowId] = useState<string>(flows[0]?.id || 'flow-java-interview');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-core');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<ConnectedTask[]>(() => {
    const saved = localStorage.getItem('flowmind_tasks_state');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TASKS;
  });

  const [knowledgeItems] = useState<KnowledgeItem[]>(INITIAL_KNOWLEDGE);
  const [thinkingPatterns] = useState<ThinkingPattern[]>(INITIAL_PATTERNS);
  const [activeFocusTask, setActiveFocusTask] = useState<ConnectedTask | null>(tasks[0]);

  // Canvas Viewport State
  const [canvasZoom, setCanvasZoom] = useState<number>(1);
  const [canvasPan, setCanvasPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // AI Generation State
  const [isGeneratingFlow, setIsGeneratingFlow] = useState<boolean>(false);
  const [generatingStep, setGeneratingStep] = useState<number>(1);
  const [generatingPrompt, setGeneratingPrompt] = useState<string>('');
  const abortGenerationRef = React.useRef(false);

  // Persist flows and tasks
  useEffect(() => {
    try {
      localStorage.setItem('flowmind_flows_state', JSON.stringify(flows));
    } catch {}
  }, [flows]);

  useEffect(() => {
    try {
      localStorage.setItem('flowmind_tasks_state', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const activeFlow = useMemo(() => {
    return flows.find((f) => f.id === activeFlowId) || flows[0];
  }, [flows, activeFlowId]);

  const selectedNode = useMemo(() => {
    if (!activeFlow || !selectedNodeId) return null;
    return activeFlow.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [activeFlow, selectedNodeId]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            soundService.playSuccess();
          } else {
            soundService.playClick();
          }
          // Bi-directional Sync: Ripple status back into graph nodes
          if (t.nodeId) {
            setFlows((flowList) =>
              flowList.map((flow) => {
                if (flow.id === t.flowId) {
                  return {
                    ...flow,
                    nodes: flow.nodes.map((node) =>
                      node.id === t.nodeId
                        ? {
                            ...node,
                            status: nextCompleted ? ('completed' as const) : ('pending' as const),
                            progress: nextCompleted ? 100 : 0,
                          }
                        : node
                    ),
                  };
                }
                return flow;
              })
            );
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const addTask = (taskData: Omit<ConnectedTask, 'id'>) => {
    const newTask: ConnectedTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
    soundService.playChime();
  };

  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id === activeFlowId) {
          return {
            ...f,
            nodes: f.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
          };
        }
        return f;
      })
    );
  };

  const addNodeToActiveFlow = (nodeData: Partial<FlowNode>) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: nodeData.type || 'idea',
      title: nodeData.title || 'New Thought Node',
      description: nodeData.description || 'Structured connection in FlowMind.',
      x: nodeData.x ?? 450 + (Math.random() * 120 - 60),
      y: nodeData.y ?? 250 + (Math.random() * 120 - 60),
      parentId: nodeData.parentId || selectedNodeId || activeFlow?.nodes[0]?.id,
      priority: nodeData.priority || 'medium',
      progress: nodeData.progress || 0,
      tags: nodeData.tags || ['IDEA'],
    };

    const newEdge: FlowEdge = {
      id: `edge-${Date.now()}`,
      source: newNode.parentId || activeFlow.nodes[0]?.id || 'node-core',
      target: newNode.id,
      animated: true,
      color: '#00F0FF',
    };

    setFlows((prev) =>
      prev.map((f) => {
        if (f.id === activeFlowId) {
          return {
            ...f,
            nodes: [...f.nodes, newNode],
            edges: [...f.edges, newEdge],
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      })
    );

    setSelectedNodeId(newNode.id);
    soundService.playChime();
  };

  const deleteNodeFromActiveFlow = (nodeId: string) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id === activeFlowId) {
          return {
            ...f,
            nodes: f.nodes.filter((n) => n.id !== nodeId),
            edges: f.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      })
    );

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    soundService.playClick();
  };

  const generateFlowFromPrompt = async (
    prompt: string,
    category: FlowGraph['category'] = 'Projects'
  ): Promise<FlowGraph> => {
    abortGenerationRef.current = false;
    setIsGeneratingFlow(true);
    setGeneratingPrompt(prompt);
    setGeneratingStep(1);
    soundService.playChime();

    // Step 1: Thought Captured
    await new Promise((r) => setTimeout(r, 600));
    if (abortGenerationRef.current) return null as any;
    setGeneratingStep(2);

    // Step 2: AI Understanding
    await new Promise((r) => setTimeout(r, 700));
    if (abortGenerationRef.current) return null as any;
    setGeneratingStep(3);

    // Step 3: Building Connections
    await new Promise((r) => setTimeout(r, 800));
    if (abortGenerationRef.current) return null as any;
    setGeneratingStep(4);

    // Generate smart contextual nodes based on prompt
    const cleanPrompt = prompt.trim();
    const isJava = /java|interview|dsa|coding|algorithm/i.test(cleanPrompt);
    const isNetworks = /network|tcp|ip|osi|packet|socket|routing|wireshark/i.test(cleanPrompt);
    const isAI = /ai|machine learning|deep learning|neural|llm|transformer|gpt|model|embedding/i.test(cleanPrompt);
    const isPortfolio = /portfolio|personal site|resume|cv|personal brand/i.test(cleanPrompt);
    const isWeek = /week|organize|schedule|timebox|routine|daily/i.test(cleanPrompt);
    const isProject = /project|build|app|saas|startup|product|mvp|platform/i.test(cleanPrompt);
    const isStudy = /study|exam|learn|book|course|master/i.test(cleanPrompt);

    const newFlowId = `flow-${Date.now()}`;
    let generatedFlow: FlowGraph;

    if (isJava) {
      generatedFlow = {
        id: newFlowId,
        title: cleanPrompt,
        description: `AI structured roadmap for ${cleanPrompt}, calibrated for maximum retention and outcome success.`,
        category: 'Career',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 15,
        nodes: [
          {
            id: 'gen-core',
            type: 'core',
            title: cleanPrompt.toUpperCase(),
            description: 'Core objective and strategic milestone anchor.',
            x: 450,
            y: 200,
            priority: 'urgent',
            progress: 15,
            tags: ['CORE', 'CAREER'],
            aiSummary: 'High-impact learning pathway broken down into foundational, intermediate, and live assessment modules.',
            suggestedActions: ['Start with Core OOP principles', 'Schedule weekly progress review'],
          },
          {
            id: 'gen-core-java',
            type: 'idea',
            title: 'Core Java & OOP Pillars',
            description: 'Inheritance, Polymorphism, Abstract classes, Interface contracts.',
            x: 200,
            y: 90,
            parentId: 'gen-core',
            tags: ['OOP', 'FOUNDATION'],
            progress: 30,
          },
          {
            id: 'gen-dsa',
            type: 'idea',
            title: 'Data Structures & Algorithms',
            description: 'Arrays, Strings, HashMaps, Trees, Binary Search.',
            x: 450,
            y: 50,
            parentId: 'gen-core',
            tags: ['DSA', 'PATTERNS'],
            progress: 10,
          },
          {
            id: 'gen-sql',
            type: 'idea',
            title: 'Relational DB & SQL Tuning',
            description: 'Joins, Indexes, ACID guarantees, Query optimization.',
            x: 700,
            y: 90,
            parentId: 'gen-core',
            tags: ['SQL', 'DATABASE'],
            progress: 0,
          },
          {
            id: 'gen-task-1',
            type: 'task',
            title: 'Solve 10 HashMap & Frequency Problems',
            description: 'Two Sum, Group Anagrams, Top K Frequent Elements.',
            x: 320,
            y: 360,
            parentId: 'gen-dsa',
            tags: ['LEETCODE'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'gen-task-2',
            type: 'task',
            title: 'Mock Behavioral & System Architecture Session',
            description: 'STAR framework walkthrough of key project challenges.',
            x: 580,
            y: 360,
            parentId: 'gen-core',
            tags: ['MOCK'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'gen-result',
            type: 'result',
            title: 'Target Tech Job Offer',
            description: 'Final calibrated outcome: high compensation and role agency.',
            x: 800,
            y: 300,
            parentId: 'gen-core',
            tags: ['VERDICT'],
            progress: 10,
          },
        ],
        edges: [
          { id: 'ge1', source: 'gen-core', target: 'gen-core-java', animated: true, color: '#00F0FF' },
          { id: 'ge2', source: 'gen-core', target: 'gen-dsa', animated: true, color: '#6366F1' },
          { id: 'ge3', source: 'gen-core', target: 'gen-sql', animated: true, color: '#F59E0B' },
          { id: 'ge4', source: 'gen-dsa', target: 'gen-task-1', animated: true, color: '#8B5CF6' },
          { id: 'ge5', source: 'gen-core', target: 'gen-task-2', color: '#F43F5E' },
          { id: 'ge6', source: 'gen-core', target: 'gen-result', animated: true, color: '#10B981' },
        ],
      };
    } else if (isNetworks) {
      generatedFlow = {
        id: newFlowId,
        title: cleanPrompt,
        description: 'Comprehensive computer networking roadmap from physical packet transport to application-layer distributed protocols.',
        category: 'Learning',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 20,
        nodes: [
          {
            id: 'net-core',
            type: 'core',
            title: cleanPrompt.toUpperCase(),
            description: 'Foundations of Computer Networks & Internet Architecture.',
            x: 450,
            y: 200,
            priority: 'urgent',
            progress: 20,
            tags: ['NETWORKS', 'SYSTEMS'],
            aiSummary: 'Mastery road covering OSI models, TCP reliability semantics, congestion algorithms, and modern HTTP/3 QUIC transport.',
          },
          {
            id: 'net-osi',
            type: 'idea',
            title: 'OSI 7 Layers & Framing',
            description: 'Ethernet frames, MAC addressing, MTU fragmentation, and IP packet headers.',
            x: 200,
            y: 90,
            parentId: 'net-core',
            tags: ['OSI', 'PACKETS'],
            progress: 40,
          },
          {
            id: 'net-tcp',
            type: 'decision',
            title: 'TCP vs UDP vs QUIC Trade-offs',
            description: 'Three-way handshake, SYN flood protection, flow control windows, and Head-of-Line blocking.',
            x: 450,
            y: 50,
            parentId: 'net-core',
            tags: ['TRANSPORT', 'PROTOCOLS'],
            progress: 25,
          },
          {
            id: 'net-routing',
            type: 'idea',
            title: 'Subnetting & BGP/OSPF Routing',
            description: 'CIDR masks, NAT gateways, Autonomous Systems, and Dijkstra link-state algorithms.',
            x: 700,
            y: 90,
            parentId: 'net-core',
            tags: ['ROUTING', 'CIDR'],
            progress: 10,
          },
          {
            id: 'net-task-1',
            type: 'task',
            title: 'Inspect 50 TCP 3-Way Handshakes in Wireshark',
            description: 'Capture SYN, SYN-ACK, ACK packet flags and analyze TLS 1.3 ClientHello cipher negotiation.',
            x: 320,
            y: 360,
            parentId: 'net-tcp',
            tags: ['WIRESHARK'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'net-task-2',
            type: 'task',
            title: 'Build Async Non-Blocking TCP Echo Server in Python/Go',
            description: 'Implement epoll/kqueue event loop handling 10,000 concurrent socket connections.',
            x: 580,
            y: 360,
            parentId: 'net-core',
            tags: ['SOCKETS'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'net-result',
            type: 'result',
            title: 'Distributed Systems & Networking Mastery',
            description: 'Calibrated clarity across low-level socket programming and high-level edge mesh routing.',
            x: 800,
            y: 300,
            parentId: 'net-core',
            tags: ['VERDICT'],
            progress: 15,
          },
        ],
        edges: [
          { id: 'ne1', source: 'net-core', target: 'net-osi', animated: true, color: '#00F0FF' },
          { id: 'ne2', source: 'net-core', target: 'net-tcp', animated: true, color: '#6366F1' },
          { id: 'ne3', source: 'net-core', target: 'net-routing', animated: true, color: '#F5B84B' },
          { id: 'ne4', source: 'net-tcp', target: 'net-task-1', animated: true, color: '#8B5CF6' },
          { id: 'ne5', source: 'net-core', target: 'net-task-2', color: '#F43F5E' },
          { id: 'ne6', source: 'net-core', target: 'net-result', animated: true, color: '#10B981' },
        ],
      };
    } else if (isAI) {
      generatedFlow = {
        id: newFlowId,
        title: cleanPrompt,
        description: 'End-to-end Machine Learning & Frontier AI Engineering architecture roadmap.',
        category: 'Projects',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 25,
        nodes: [
          {
            id: 'ai-core',
            type: 'core',
            title: cleanPrompt.toUpperCase(),
            description: 'Autonomous Intelligence, Foundation Models, and Production Inference Mesh.',
            x: 450,
            y: 200,
            priority: 'urgent',
            progress: 25,
            tags: ['AI_SYSTEMS', 'FRONTIER'],
            aiSummary: 'Covers transformer architecture, vector memory retrieval (RAG), and adversarial red-teaming.',
          },
          {
            id: 'ai-arch',
            type: 'idea',
            title: 'Transformer Attention & KV Cache',
            description: 'Scaled dot-product attention, positional encodings, and KV cache memory optimization under 8k context.',
            x: 200,
            y: 90,
            parentId: 'ai-core',
            tags: ['TRANSFORMERS', 'ATTENTION'],
            progress: 50,
          },
          {
            id: 'ai-rag',
            type: 'decision',
            title: 'Fine-Tuning vs Grounded Hybrid RAG',
            description: 'Trade-off between proprietary LoRA weights and low-latency dense vector search with reranking.',
            x: 450,
            y: 50,
            parentId: 'ai-core',
            tags: ['RAG', 'DECISION'],
            progress: 30,
          },
          {
            id: 'ai-eval',
            type: 'idea',
            title: 'Automated Evals & Red Teaming',
            description: 'LLM-as-a-judge pipelines, hallucination rate benchmarks, and adversarial prompt injections.',
            x: 700,
            y: 90,
            parentId: 'ai-core',
            tags: ['EVALS', 'SAFETY'],
            progress: 15,
          },
          {
            id: 'ai-task-1',
            type: 'task',
            title: 'Fine-tune 8B Open Model with QLoRA on Custom Corpus',
            description: 'Prepare tokenized dataset, run 3 training epochs with gradient accumulation, and evaluate loss curves.',
            x: 320,
            y: 360,
            parentId: 'ai-arch',
            tags: ['TRAINING'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'ai-task-2',
            type: 'task',
            title: 'Benchmark Vector RAG Retrieval under 500 QPS Load',
            description: 'Test HNSW indexing versus brute force cosine similarity across 1,000,000 documents.',
            x: 580,
            y: 360,
            parentId: 'ai-core',
            tags: ['BENCHMARK'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'ai-result',
            type: 'result',
            title: 'Production-Grade AI Copilot Deployed',
            description: 'Reliable sub-100ms response time with verified provenance citations.',
            x: 800,
            y: 300,
            parentId: 'ai-core',
            tags: ['VERDICT'],
            progress: 20,
          },
        ],
        edges: [
          { id: 'ae1', source: 'ai-core', target: 'ai-arch', animated: true, color: '#00F0FF' },
          { id: 'ae2', source: 'ai-core', target: 'ai-rag', animated: true, color: '#6366F1' },
          { id: 'ae3', source: 'ai-core', target: 'ai-eval', animated: true, color: '#F5B84B' },
          { id: 'ae4', source: 'ai-arch', target: 'ai-task-1', animated: true, color: '#8B5CF6' },
          { id: 'ae5', source: 'ai-core', target: 'ai-task-2', color: '#F43F5E' },
          { id: 'ae6', source: 'ai-core', target: 'ai-result', animated: true, color: '#10B981' },
        ],
      };
    } else if (isPortfolio) {
      generatedFlow = {
        id: newFlowId,
        title: cleanPrompt,
        description: 'Interactive developer portfolio with asymmetric positioning, verified proof of work, and high conversion.',
        category: 'Personal Goals',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 30,
        nodes: [
          {
            id: 'pf-core',
            type: 'core',
            title: cleanPrompt.toUpperCase(),
            description: 'Personal Flagship Portfolio & Engineering Identity.',
            x: 450,
            y: 200,
            priority: 'high',
            progress: 30,
            tags: ['PORTFOLIO', 'BRAND'],
            aiSummary: 'Positions you not as a generic developer, but as a high-leverage cognitive problem solver.',
          },
          {
            id: 'pf-design',
            type: 'idea',
            title: 'Visual Architecture & Dark Aesthetic',
            description: 'Futuristic glassmorphism, fluid micro-animations, and responsive typography.',
            x: 200,
            y: 90,
            parentId: 'pf-core',
            tags: ['DESIGN', 'UX'],
            progress: 60,
          },
          {
            id: 'pf-case',
            type: 'idea',
            title: '3 Flagship Case Studies with Live Demos',
            description: 'Problem statement, architectural trade-offs, interactive preview, and measurable metrics.',
            x: 450,
            y: 50,
            parentId: 'pf-core',
            tags: ['CASE_STUDIES'],
            progress: 40,
          },
          {
            id: 'pf-tech',
            type: 'decision',
            title: 'Tech Stack: Next.js vs Vite React 19',
            description: 'Evaluate static pre-rendering speed against client bundle responsiveness and edge caching.',
            x: 700,
            y: 90,
            parentId: 'pf-core',
            tags: ['STACK', 'DECISION'],
            progress: 20,
          },
          {
            id: 'pf-task-1',
            type: 'task',
            title: 'Record 90-Second Loom Demo of Flagship Project',
            description: 'Walk through real problems solved, engineering challenges, and system architecture.',
            x: 320,
            y: 360,
            parentId: 'pf-case',
            tags: ['DEMO'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'pf-task-2',
            type: 'task',
            title: 'Configure Custom Domain & SSL on Cloudflare Edge',
            description: 'Achieve 100/100 Lighthouse performance score with sub-50ms worldwide asset delivery.',
            x: 580,
            y: 360,
            parentId: 'pf-core',
            tags: ['DEPLOY'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'pf-result',
            type: 'result',
            title: 'Tier-1 Recruiter & Founder Inbound Pipeline',
            description: 'Decisive proof of work that generates immediate leadership and venture opportunities.',
            x: 800,
            y: 300,
            parentId: 'pf-core',
            tags: ['VERDICT'],
            progress: 30,
          },
        ],
        edges: [
          { id: 'pe1', source: 'pf-core', target: 'pf-design', animated: true, color: '#00F0FF' },
          { id: 'pe2', source: 'pf-core', target: 'pf-case', animated: true, color: '#6366F1' },
          { id: 'pe3', source: 'pf-core', target: 'pf-tech', animated: true, color: '#F59E0B' },
          { id: 'pe4', source: 'pf-case', target: 'pf-task-1', animated: true, color: '#8B5CF6' },
          { id: 'pe5', source: 'pf-core', target: 'pf-task-2', color: '#F43F5E' },
          { id: 'pe6', source: 'pf-core', target: 'pf-result', animated: true, color: '#10B981' },
        ],
      };
    } else if (isWeek) {
      generatedFlow = {
        id: newFlowId,
        title: cleanPrompt,
        description: 'Strategic weekly execution architecture balancing deep work, async triage, and high leverage.',
        category: 'Personal Goals',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 10,
        nodes: [
          {
            id: 'wk-core',
            type: 'core',
            title: cleanPrompt.toUpperCase(),
            description: 'Calibrated Weekly Rhythm & High-Velocity Focus.',
            x: 450,
            y: 200,
            priority: 'urgent',
            progress: 10,
            tags: ['FOCUS', 'PRODUCTIVITY'],
            aiSummary: 'Aligns daily calendar blocks with top 3 strategic needle-movers rather than reactive to-do lists.',
          },
          {
            id: 'wk-deep',
            type: 'idea',
            title: 'Morning 90-Minute Deep Work Blocks',
            description: 'Zero notification sanctuary dedicated exclusively to hard technical and creative breakthroughs.',
            x: 200,
            y: 90,
            parentId: 'wk-core',
            tags: ['DEEP_WORK'],
            progress: 20,
          },
          {
            id: 'wk-triage',
            type: 'decision',
            title: 'Asynchronous Comms vs Synchronous Meetings',
            description: 'Ruthlessly batch Slack/email updates into two 20-minute daily intervals to eliminate context switching.',
            x: 450,
            y: 50,
            parentId: 'wk-core',
            tags: ['TRIAGE', 'BOUNDARIES'],
            progress: 15,
          },
          {
            id: 'wk-recovery',
            type: 'idea',
            title: 'Cognitive Recovery & Sleep Buffers',
            description: 'Protect 8 hours of restorative sleep to sustain consistent peak analytical output.',
            x: 700,
            y: 90,
            parentId: 'wk-core',
            tags: ['ENERGY'],
            progress: 30,
          },
          {
            id: 'wk-task-1',
            type: 'task',
            title: 'Lock In Mon-Wed-Fri 9:00-11:30 Deep Coding Blocks',
            description: 'Decline non-critical morning meetings and set calendar status to Deep Focus.',
            x: 320,
            y: 360,
            parentId: 'wk-deep',
            tags: ['CALENDAR'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'wk-task-2',
            type: 'task',
            title: 'Conduct Friday 30-Minute Sprint Retrospective',
            description: 'Audit tasks completed, friction bottlenecks, and calibrate next week milestones.',
            x: 580,
            y: 360,
            parentId: 'wk-core',
            tags: ['REVIEW'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'wk-result',
            type: 'result',
            title: 'Effortless High-Leverage Velocity',
            description: 'Consistent execution momentum with zero weekend anxiety or cognitive exhaustion.',
            x: 800,
            y: 300,
            parentId: 'wk-core',
            tags: ['VERDICT'],
            progress: 10,
          },
        ],
        edges: [
          { id: 'we1', source: 'wk-core', target: 'wk-deep', animated: true, color: '#00F0FF' },
          { id: 'we2', source: 'wk-core', target: 'wk-triage', animated: true, color: '#6366F1' },
          { id: 'we3', source: 'wk-core', target: 'wk-recovery', animated: true, color: '#F59E0B' },
          { id: 'we4', source: 'wk-deep', target: 'wk-task-1', animated: true, color: '#8B5CF6' },
          { id: 'we5', source: 'wk-core', target: 'wk-task-2', color: '#F43F5E' },
          { id: 'we6', source: 'wk-core', target: 'wk-result', animated: true, color: '#10B981' },
        ],
      };
    } else {
      // Dynamic topic extraction for ANY custom input
      const topic = cleanPrompt.replace(/^(plan|how to|i want to|start|build|create|study|learn)\s+/i, '').trim() || cleanPrompt;
      generatedFlow = {
        id: newFlowId,
        title: cleanPrompt,
        description: `Structured FlowMind roadmap for "${cleanPrompt}".`,
        category: category || (isProject ? 'Projects' : isStudy ? 'Learning' : 'Personal Goals'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 10,
        nodes: [
          {
            id: 'gen-core',
            type: 'core',
            title: cleanPrompt.toUpperCase(),
            description: `Central objective anchoring all strategic thoughts on ${topic}.`,
            x: 450,
            y: 200,
            priority: 'high',
            progress: 10,
            tags: ['CENTRAL_GOAL'],
            aiSummary: `AI synthesized 3 strategic tracks: First Principles, Architectural Decisions, and High-Velocity Execution for ${topic}.`,
          },
          {
            id: 'gen-branch-1',
            type: 'idea',
            title: `Foundations of ${topic.slice(0, 24)}`,
            description: `Deconstruct core axioms, empirical base rates, and essential primitives of ${topic}.`,
            x: 200,
            y: 90,
            parentId: 'gen-core',
            tags: ['FOUNDATION'],
            progress: 25,
          },
          {
            id: 'gen-branch-2',
            type: 'decision',
            title: `Strategic Trade-off: Scale vs Speed`,
            description: `Evaluate irreversible vs reversible commitments and pick high-leverage execution boundaries.`,
            x: 450,
            y: 50,
            parentId: 'gen-core',
            tags: ['ARCHITECTURE', 'DECISION'],
            progress: 0,
          },
          {
            id: 'gen-branch-3',
            type: 'idea',
            title: `Verification & Quality Benchmarks`,
            description: `Define measurable milestones that confirm traction within 14 days.`,
            x: 700,
            y: 90,
            parentId: 'gen-core',
            tags: ['VALIDATION'],
            progress: 0,
          },
          {
            id: 'gen-task-1',
            type: 'task',
            title: `Execute 45-Minute Deep Drill on ${topic.slice(0, 22)}`,
            description: `Build the minimal proof of concept or study core documentation.`,
            x: 320,
            y: 360,
            parentId: 'gen-branch-1',
            tags: ['ACTION'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'gen-task-2',
            type: 'task',
            title: `Stress-Test Hidden Assumptions & Failure Modes`,
            description: `Identify weakest points and create stop-loss boundaries before full resource commitment.`,
            x: 580,
            y: 360,
            parentId: 'gen-core',
            tags: ['RED_TEAM'],
            progress: 0,
            status: 'pending',
          },
          {
            id: 'gen-result-cl',
            type: 'result',
            title: `Milestone Mastery & Verified Outcome`,
            description: `High-conviction goal accomplished with measurable empirical traction.`,
            x: 800,
            y: 300,
            parentId: 'gen-core',
            tags: ['SUCCESS'],
            progress: 0,
          },
        ],
        edges: [
          { id: 'ge1', source: 'gen-core', target: 'gen-branch-1', animated: true, color: '#00F0FF' },
          { id: 'ge2', source: 'gen-core', target: 'gen-branch-2', animated: true, color: '#6366F1' },
          { id: 'ge3', source: 'gen-core', target: 'gen-branch-3', animated: true, color: '#F59E0B' },
          { id: 'ge4', source: 'gen-branch-1', target: 'gen-task-1', animated: true, color: '#8B5CF6' },
          { id: 'ge5', source: 'gen-core', target: 'gen-task-2', color: '#F43F5E' },
          { id: 'ge6', source: 'gen-core', target: 'gen-result-cl', animated: true, color: '#10B981' },
        ],
      };
    }

    // Append new tasks from flow
    const generatedTasks: ConnectedTask[] = generatedFlow.nodes
      .filter((n) => n.type === 'task')
      .map((n) => ({
        id: `task-${Date.now()}-${n.id}`,
        title: n.title,
        flowId: generatedFlow.id,
        flowTitle: generatedFlow.title,
        nodeId: n.id,
        nodeTitle: n.title,
        completed: false,
        priority: 'high',
        dueDate: 'This week',
        estimatedMinutes: 45,
      }));

    setTasks((prev) => [...generatedTasks, ...prev]);
    setFlows((prev) => [generatedFlow, ...prev]);
    setActiveFlowId(generatedFlow.id);
    setSelectedNodeId('gen-core');

    await new Promise((r) => setTimeout(r, 400));
    if (abortGenerationRef.current) return null as any;
    setIsGeneratingFlow(false);
    soundService.playSuccess();
    return generatedFlow;
  };

  const cancelGeneration = () => {
    abortGenerationRef.current = true;
    setIsGeneratingFlow(false);
  };

  return (
    <FlowContext.Provider
      value={{
        flows,
        activeFlowId,
        activeFlow,
        selectedNodeId,
        selectedNode,
        hoveredNodeId,
        tasks,
        knowledgeItems,
        thinkingPatterns,
        activeFocusTask,
        canvasZoom,
        canvasPan,
        isGeneratingFlow,
        generatingStep,
        generatingPrompt,
        setActiveFlowId,
        setSelectedNodeId,
        setHoveredNodeId,
        setCanvasZoom,
        setCanvasPan,
        setActiveFocusTask,
        toggleTask,
        addTask,
        updateNodePosition,
        addNodeToActiveFlow,
        deleteNodeFromActiveFlow,
        generateFlowFromPrompt,
        cancelGeneration,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};

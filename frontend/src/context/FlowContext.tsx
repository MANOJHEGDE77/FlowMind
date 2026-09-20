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
    setIsGeneratingFlow(true);
    setGeneratingPrompt(prompt);
    setGeneratingStep(1);
    soundService.playChime();

    // Step 1: Thought Captured
    await new Promise((r) => setTimeout(r, 600));
    setGeneratingStep(2);

    // Step 2: AI Understanding
    await new Promise((r) => setTimeout(r, 700));
    setGeneratingStep(3);

    // Step 3: Building Connections
    await new Promise((r) => setTimeout(r, 800));
    setGeneratingStep(4);

    // Generate smart contextual nodes based on prompt
    const cleanPrompt = prompt.trim();
    const isJava = /java|interview|dsa|coding|algorithm/i.test(cleanPrompt);
    const isProject = /project|build|app|saas|startup|portfolio/i.test(cleanPrompt);
    const isStudy = /study|network|exam|learn|book/i.test(cleanPrompt);

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
    } else {
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
            description: 'Central objective anchoring all strategic thoughts.',
            x: 450,
            y: 200,
            priority: 'high',
            progress: 10,
            tags: ['CENTRAL_GOAL'],
            aiSummary: 'AI identified 3 strategic tracks: Research, Build, and Validate.',
          },
          {
            id: 'gen-branch-1',
            type: 'idea',
            title: 'Phase 1: Research & Discovery',
            description: 'Gather verified precedents, market baselines, and user signals.',
            x: 220,
            y: 100,
            parentId: 'gen-core',
            tags: ['RESEARCH'],
            progress: 25,
          },
          {
            id: 'gen-branch-2',
            type: 'decision',
            title: 'Phase 2: Execution Architecture',
            description: 'Select minimal viable scope and high-leverage tools.',
            x: 680,
            y: 100,
            parentId: 'gen-core',
            tags: ['ARCHITECTURE'],
            progress: 0,
          },
          {
            id: 'gen-task-act',
            type: 'task',
            title: 'Launch First Prototype Sprint',
            description: 'Build core feature loop within 48 hours.',
            x: 350,
            y: 360,
            parentId: 'gen-branch-1',
            tags: ['SPRINT'],
            progress: 0,
          },
          {
            id: 'gen-result-cl',
            type: 'result',
            title: 'Verified Milestone Clarity',
            description: 'Goal accomplished with measurable empirical traction.',
            x: 720,
            y: 340,
            parentId: 'gen-branch-2',
            tags: ['SUCCESS'],
            progress: 0,
          },
        ],
        edges: [
          { id: 'ge1', source: 'gen-core', target: 'gen-branch-1', animated: true, color: '#00F0FF' },
          { id: 'ge2', source: 'gen-core', target: 'gen-branch-2', animated: true, color: '#6366F1' },
          { id: 'ge3', source: 'gen-branch-1', target: 'gen-task-act', color: '#8B5CF6' },
          { id: 'ge4', source: 'gen-branch-2', target: 'gen-result-cl', animated: true, color: '#10B981' },
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
    setIsGeneratingFlow(false);
    soundService.playSuccess();
    return generatedFlow;
  };

  const cancelGeneration = () => {
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
